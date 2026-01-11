/**
 * arXiv API client with retry, timeout, rate limiting, and caching
 *
 * Provides reliable access to the arXiv API with proper error handling,
 * automatic retries, rate limiting to respect arXiv's API guidelines,
 * and caching to reduce API calls.
 */

import { XMLParser } from "fast-xml-parser";
import { getPaperCache } from "./cache/paperCache.js";
import { ArxivApiError } from "./errors.js";
import { logger } from "./utils/logger.js";
import { arxivRateLimiter } from "./utils/rateLimiter.js";
import {
	isNetworkError,
	isRetryableStatusCode,
	withRetry,
} from "./utils/retry.js";

const parser = new XMLParser({ ignoreAttributes: false });

// arXiv recommends no more than 1 request every 3 seconds
const ARXIV_BASE_URL = "http://export.arxiv.org/api/query";
const DEFAULT_TIMEOUT_MS = 15000; // 15 seconds
const DEFAULT_MAX_RESULTS = 5;

/**
 * Parsed paper data from arXiv
 */
export interface Paper {
	title: string;
	summary: string;
	link: string;
	published: string;
	authors?: string[];
	categories?: string[];
}

/**
 * Raw arXiv entry from XML response
 */
interface ArxivEntry {
	title: string;
	summary: string;
	id: string;
	published: string;
	author?: ArxivAuthor | ArxivAuthor[];
	category?: ArxivCategory | ArxivCategory[];
}

interface ArxivAuthor {
	name: string;
}

interface ArxivCategory {
	"@_term": string;
}

/**
 * Options for fetching papers
 */
export interface FetchPapersOptions {
	/** Search query topic */
	topic: string;
	/** Pagination offset (default: 0) */
	start?: number;
	/** Maximum results to return (default: 5, max: 100) */
	max?: number;
	/** Request timeout in milliseconds (default: 15000) */
	timeoutMs?: number;
	/** Sort by field (default: submittedDate) */
	sortBy?: "relevance" | "lastUpdatedDate" | "submittedDate";
	/** Sort order (default: descending) */
	sortOrder?: "ascending" | "descending";
	/** Skip cache lookup (default: false) */
	skipCache?: boolean;
}

/**
 * Builds the arXiv API URL with query parameters
 */
function buildArxivUrl(options: FetchPapersOptions): string {
	const {
		topic,
		start = 0,
		max = DEFAULT_MAX_RESULTS,
		sortBy = "submittedDate",
		sortOrder = "descending",
	} = options;

	const params = new URLSearchParams({
		search_query: `all:${topic}`,
		start: String(start),
		max_results: String(Math.min(max, 100)), // Cap at 100
		sortBy,
		sortOrder,
	});

	return `${ARXIV_BASE_URL}?${params.toString()}`;
}

/**
 * Parses an arXiv entry into a Paper object
 */
function parseEntry(entry: ArxivEntry): Paper {
	// Parse authors
	let authors: string[] | undefined;
	if (entry.author) {
		const authorArray = Array.isArray(entry.author)
			? entry.author
			: [entry.author];
		authors = authorArray.map((a) => a.name);
	}

	// Parse categories
	let categories: string[] | undefined;
	if (entry.category) {
		const categoryArray = Array.isArray(entry.category)
			? entry.category
			: [entry.category];
		categories = categoryArray.map((c) => c["@_term"]);
	}

	return {
		title: entry.title.replace(/\n/g, " ").trim(),
		summary: entry.summary.trim(),
		link: entry.id,
		published: entry.published.split("T")[0] ?? entry.published,
		authors,
		categories,
	};
}

/**
 * Fetches papers from arXiv with timeout and rate limiting
 *
 * @param url - The arXiv API URL
 * @param timeoutMs - Timeout in milliseconds
 * @returns Parsed paper data
 * @throws {ArxivApiError} When the request fails
 */
async function fetchWithTimeout(
	url: string,
	timeoutMs: number,
): Promise<Paper[]> {
	// Apply rate limiting before making the request
	await arxivRateLimiter.throttle();

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				"User-Agent": "ResearchBot/1.0 (Telegram Bot)",
			},
		});

		if (!response.ok) {
			throw new ArxivApiError(
				`arXiv API returned status ${response.status}`,
				response.status,
			);
		}

		const xml = await response.text();
		const result = parser.parse(xml);
		const entries = result.feed?.entry;

		if (!entries) {
			logger.debug("No entries found in arXiv response");
			return [];
		}

		// Ensure we always have an array (XML parser returns object if only 1 result)
		const papers = Array.isArray(entries) ? entries : [entries];

		return papers.map(parseEntry);
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw new ArxivApiError(
				`arXiv API request timed out after ${timeoutMs}ms`,
				undefined,
				error,
			);
		}

		if (error instanceof ArxivApiError) {
			throw error;
		}

		throw new ArxivApiError(
			`Failed to fetch from arXiv: ${error instanceof Error ? error.message : "Unknown error"}`,
			undefined,
			error instanceof Error ? error : undefined,
		);
	} finally {
		clearTimeout(timeout);
	}
}

/**
 * Determines if an arXiv API error is retryable
 */
function isArxivErrorRetryable(error: unknown): boolean {
	if (isNetworkError(error)) {
		return true;
	}

	if (error instanceof ArxivApiError && error.statusCode) {
		return isRetryableStatusCode(error.statusCode);
	}

	// Retry on timeout errors
	if (error instanceof Error && error.message.includes("timed out")) {
		return true;
	}

	return false;
}

/**
 * Fetches research papers from arXiv API
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Request timeout
 * - Rate limiting (1 request per 3 seconds)
 * - Result caching (when Redis is configured)
 * - Proper error handling
 *
 * @param topic - Search query topic
 * @param start - Pagination offset (default: 0)
 * @param max - Maximum results to return (default: 5)
 * @returns Array of parsed paper objects
 *
 * @example
 * const papers = await fetchPapers("machine learning", 0, 10);
 */
export async function fetchPapers(
	topic: string,
	start = 0,
	max = DEFAULT_MAX_RESULTS,
): Promise<Paper[]> {
	const options: FetchPapersOptions = { topic, start, max };

	return fetchPapersAdvanced(options);
}

/**
 * Fetches research papers with advanced options
 *
 * @param options - Search and fetch options
 * @returns Array of parsed paper objects
 *
 * @example
 * const papers = await fetchPapersAdvanced({
 *   topic: "transformer",
 *   max: 10,
 *   sortBy: "relevance",
 * });
 */
export async function fetchPapersAdvanced(
	options: FetchPapersOptions,
): Promise<Paper[]> {
	const {
		topic,
		start = 0,
		max = DEFAULT_MAX_RESULTS,
		timeoutMs = DEFAULT_TIMEOUT_MS,
		skipCache = false,
	} = options;

	// Validate input
	if (!topic || topic.trim() === "") {
		logger.warn("Empty search topic provided");
		return [];
	}

	// Try to get from cache first (if not skipped)
	const cache = getPaperCache();
	if (cache && !skipCache) {
		const cachedPapers = await cache.get(topic, start, max);
		if (cachedPapers) {
			logger.info("Returning cached papers", {
				topic,
				start,
				max,
				count: cachedPapers.length,
			});
			return cachedPapers;
		}
	}

	const url = buildArxivUrl(options);

	logger.debug("Fetching papers from arXiv", {
		topic,
		start,
		max,
	});

	try {
		const papers = await withRetry(() => fetchWithTimeout(url, timeoutMs), {
			maxAttempts: 3,
			baseDelay: 1000,
			maxDelay: 10000,
			isRetryable: isArxivErrorRetryable,
			operationName: "fetchPapers",
		});

		logger.info("Successfully fetched papers from arXiv", {
			topic,
			count: papers.length,
		});

		// Cache the results
		if (cache && papers.length > 0) {
			await cache.set(topic, start, max, papers);
		}

		return papers;
	} catch (error) {
		logger.error("Failed to fetch papers from arXiv", {
			topic,
			error: error instanceof Error ? error.message : String(error),
		});

		// Return empty array instead of throwing to maintain backward compatibility
		// The error is already logged, so callers can handle empty results gracefully
		return [];
	}
}

/**
 * Fetches a single paper by its arXiv ID
 *
 * @param arxivId - The arXiv paper ID (e.g., "2301.00001")
 * @returns The paper data or null if not found
 *
 * @example
 * const paper = await fetchPaperById("2301.00001");
 */
export async function fetchPaperById(arxivId: string): Promise<Paper | null> {
	if (!arxivId || arxivId.trim() === "") {
		return null;
	}

	// Apply rate limiting
	await arxivRateLimiter.throttle();

	const url = `${ARXIV_BASE_URL}?id_list=${encodeURIComponent(arxivId)}`;

	try {
		const papers = await withRetry(
			() => fetchWithTimeout(url, DEFAULT_TIMEOUT_MS),
			{
				maxAttempts: 2,
				baseDelay: 1000,
				isRetryable: isArxivErrorRetryable,
				operationName: "fetchPaperById",
			},
		);

		return papers[0] || null;
	} catch (error) {
		logger.error("Failed to fetch paper by ID", {
			arxivId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Formats paper summary for display (truncated)
 *
 * @param summary - Full paper summary/abstract
 * @param maxLength - Maximum length (default: 200)
 * @returns Truncated summary with ellipsis
 */
export function formatSummary(summary: string, maxLength = 200): string {
	const cleaned = summary.trim().replace(/\n/g, " ").replace(/\s+/g, " ");

	if (cleaned.length <= maxLength) {
		return cleaned;
	}

	return `${cleaned.substring(0, maxLength)}...`;
}

/**
 * Get rate limiter status for monitoring
 */
export function getRateLimiterStatus(): {
	canProceed: boolean;
	waitTimeMs: number;
	pendingRequests: number;
} {
	return {
		canProceed: arxivRateLimiter.canProceed(),
		waitTimeMs: arxivRateLimiter.getWaitTime(),
		pendingRequests: arxivRateLimiter.getPendingCount(),
	};
}
