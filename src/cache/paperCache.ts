/**
 * Paper Cache using Upstash Redis
 *
 * Caches arXiv search results to reduce API calls and improve response times.
 * Uses the same Upstash REST API approach as the session storage.
 */

import type { Paper } from "../arxiv.js";
import { logger } from "../utils/logger.js";

/** Default cache TTL in seconds (1 hour) */
const DEFAULT_CACHE_TTL = 3600;

interface UpstashResponse<T = unknown> {
	result: T | null;
	error?: string;
}

interface CacheOptions {
	/** Key prefix for cache entries (default: "papers") */
	prefix?: string;
	/** TTL in seconds for cached data (default: 3600 = 1 hour) */
	ttl?: number;
}

interface CachedPapers {
	papers: Paper[];
	cachedAt: number;
}

/**
 * Paper cache using Upstash Redis REST API
 *
 * Caches search results to avoid hitting arXiv API repeatedly
 * for the same queries.
 */
export class PaperCache {
	private readonly url: string;
	private readonly token: string;
	private readonly prefix: string;
	private readonly ttl: number;
	private enabled = true;

	constructor(redisUrl: string, options: CacheOptions = {}) {
		const parsed = this.parseRedisUrl(redisUrl);
		this.url = parsed.restUrl;
		this.token = parsed.token;
		this.prefix = options.prefix || "papers";
		this.ttl = options.ttl || DEFAULT_CACHE_TTL;

		logger.debug("PaperCache initialized", {
			url: this.url,
			prefix: this.prefix,
			ttl: this.ttl,
		});
	}

	/**
	 * Parse Upstash Redis URL to extract REST API URL and token
	 */
	private parseRedisUrl(redisUrl: string): { restUrl: string; token: string } {
		try {
			if (redisUrl.startsWith("https://")) {
				const url = new URL(redisUrl);
				if (url.password) {
					return {
						restUrl: `https://${url.hostname}`,
						token: url.password,
					};
				}
				throw new Error("HTTPS URL provided without token");
			}

			const url = new URL(redisUrl);
			const hostname = url.hostname;
			const token = url.password;

			if (!token) {
				throw new Error("No token found in Redis URL");
			}

			return {
				restUrl: `https://${hostname}`,
				token,
			};
		} catch (error) {
			// Disable cache if URL parsing fails
			this.enabled = false;
			logger.warn("Failed to parse Redis URL for cache, caching disabled", {
				error: error instanceof Error ? error.message : String(error),
			});
			return { restUrl: "", token: "" };
		}
	}

	/**
	 * Generate a cache key for a search query
	 */
	private getCacheKey(topic: string, start: number, max: number): string {
		// Normalize the topic for consistent caching
		const normalizedTopic = topic.toLowerCase().trim().replace(/\s+/g, "_");
		return `${this.prefix}:${normalizedTopic}:${start}:${max}`;
	}

	/**
	 * Make a request to Upstash REST API
	 */
	private async request<R = unknown>(
		command: string[],
	): Promise<UpstashResponse<R>> {
		if (!this.enabled) {
			return { result: null, error: "Cache disabled" };
		}

		try {
			const response = await fetch(this.url, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(command),
			});

			if (!response.ok) {
				const text = await response.text();
				logger.error("PaperCache request failed", {
					status: response.status,
					body: text,
				});
				return { result: null, error: text };
			}

			return (await response.json()) as UpstashResponse<R>;
		} catch (error) {
			logger.error("PaperCache request error", {
				error: error instanceof Error ? error.message : String(error),
			});
			return {
				result: null,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get cached papers for a search query
	 *
	 * @param topic - The search topic
	 * @param start - Pagination offset
	 * @param max - Maximum results
	 * @returns Cached papers or null if not found/expired
	 */
	async get(
		topic: string,
		start: number,
		max: number,
	): Promise<Paper[] | null> {
		if (!this.enabled) {
			return null;
		}

		const key = this.getCacheKey(topic, start, max);
		const response = await this.request<string>(["GET", key]);

		if (response.error || response.result === null) {
			return null;
		}

		try {
			const cached = JSON.parse(response.result) as CachedPapers;

			// Check if cache is still valid (double-check TTL)
			const age = (Date.now() - cached.cachedAt) / 1000;
			if (age > this.ttl) {
				logger.debug("PaperCache: Entry expired", { key, age, ttl: this.ttl });
				return null;
			}

			logger.debug("PaperCache: Hit", {
				key,
				papersCount: cached.papers.length,
				ageSeconds: Math.round(age),
			});

			return cached.papers;
		} catch {
			logger.warn("PaperCache: Failed to parse cached data", { key });
			return null;
		}
	}

	/**
	 * Cache papers for a search query
	 *
	 * @param topic - The search topic
	 * @param start - Pagination offset
	 * @param max - Maximum results
	 * @param papers - The papers to cache
	 */
	async set(
		topic: string,
		start: number,
		max: number,
		papers: Paper[],
	): Promise<void> {
		if (!this.enabled) {
			return;
		}

		const key = this.getCacheKey(topic, start, max);
		const cached: CachedPapers = {
			papers,
			cachedAt: Date.now(),
		};

		const value = JSON.stringify(cached);
		await this.request(["SET", key, value, "EX", String(this.ttl)]);

		logger.debug("PaperCache: Set", {
			key,
			papersCount: papers.length,
			ttlSeconds: this.ttl,
		});
	}

	/**
	 * Delete cached papers for a search query
	 */
	async delete(topic: string, start: number, max: number): Promise<boolean> {
		if (!this.enabled) {
			return false;
		}

		const key = this.getCacheKey(topic, start, max);
		const response = await this.request<number>(["DEL", key]);
		return response.result === 1;
	}

	/**
	 * Clear all cached papers (use with caution)
	 *
	 * Note: This only clears keys with the configured prefix.
	 * For Upstash, we use SCAN to find and delete matching keys.
	 */
	async clear(): Promise<number> {
		if (!this.enabled) {
			return 0;
		}

		let cursor = "0";
		let deletedCount = 0;

		do {
			const scanResponse = await this.request<[string, string[]]>([
				"SCAN",
				cursor,
				"MATCH",
				`${this.prefix}:*`,
				"COUNT",
				"100",
			]);

			if (scanResponse.error || !scanResponse.result) {
				break;
			}

			const [nextCursor, keys] = scanResponse.result;
			cursor = nextCursor;

			if (keys.length > 0) {
				const delResponse = await this.request<number>(["DEL", ...keys]);
				if (delResponse.result) {
					deletedCount += delResponse.result;
				}
			}
		} while (cursor !== "0");

		logger.info("PaperCache: Cleared", { deletedCount });
		return deletedCount;
	}

	/**
	 * Check if caching is enabled
	 */
	isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * Test cache connection
	 */
	async ping(): Promise<boolean> {
		if (!this.enabled) {
			return false;
		}

		const response = await this.request<string>(["PING"]);
		return response.result === "PONG";
	}

	/**
	 * Get cache statistics
	 */
	async getStats(): Promise<{
		enabled: boolean;
		prefix: string;
		ttl: number;
		connected: boolean;
	}> {
		return {
			enabled: this.enabled,
			prefix: this.prefix,
			ttl: this.ttl,
			connected: await this.ping(),
		};
	}
}

// Singleton instance (initialized when Redis is configured)
let paperCacheInstance: PaperCache | null = null;

/**
 * Get or create the paper cache instance
 *
 * @param redisUrl - Redis URL (required on first call if caching is desired)
 * @param options - Cache options
 * @returns PaperCache instance or null if Redis is not configured
 */
export function getPaperCache(
	redisUrl?: string,
	options?: CacheOptions,
): PaperCache | null {
	if (paperCacheInstance) {
		return paperCacheInstance;
	}

	if (!redisUrl) {
		return null;
	}

	paperCacheInstance = new PaperCache(redisUrl, options);
	return paperCacheInstance;
}

/**
 * Initialize the paper cache with the given Redis URL
 *
 * @param redisUrl - Upstash Redis URL
 * @param options - Cache options
 */
export function initPaperCache(
	redisUrl: string,
	options?: CacheOptions,
): PaperCache {
	paperCacheInstance = new PaperCache(redisUrl, options);
	return paperCacheInstance;
}
