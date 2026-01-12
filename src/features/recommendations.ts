/**
 * Recommendations Feature
 *
 * Provides functionality to find similar papers based on:
 * - Keywords extracted from paper titles
 * - Paper categories
 * - Author networks
 */

import {
	type ArxivCategory,
	fetchPaperById,
	type Paper,
	searchPapersAdvanced,
} from "../arxiv.js";
import { logger } from "../utils/logger.js";

/**
 * Common stop words to exclude from keyword extraction
 */
const STOP_WORDS = new Set([
	"a",
	"an",
	"the",
	"and",
	"or",
	"but",
	"in",
	"on",
	"at",
	"to",
	"for",
	"of",
	"with",
	"by",
	"from",
	"as",
	"is",
	"was",
	"are",
	"were",
	"been",
	"be",
	"have",
	"has",
	"had",
	"do",
	"does",
	"did",
	"will",
	"would",
	"could",
	"should",
	"may",
	"might",
	"must",
	"shall",
	"can",
	"need",
	"dare",
	"ought",
	"used",
	"it",
	"its",
	"this",
	"that",
	"these",
	"those",
	"i",
	"we",
	"you",
	"he",
	"she",
	"they",
	"what",
	"which",
	"who",
	"whom",
	"where",
	"when",
	"why",
	"how",
	"all",
	"each",
	"every",
	"both",
	"few",
	"more",
	"most",
	"other",
	"some",
	"such",
	"no",
	"nor",
	"not",
	"only",
	"own",
	"same",
	"so",
	"than",
	"too",
	"very",
	"just",
	"also",
	"now",
	"using",
	"via",
	"based",
	"approach",
	"method",
	"methods",
	"novel",
	"new",
	"paper",
	"study",
	"analysis",
	"results",
	"show",
	"propose",
	"proposed",
]);

/**
 * Extract keywords from paper title and summary
 *
 * @param text - Text to extract keywords from
 * @param maxKeywords - Maximum number of keywords to extract
 * @returns Array of keywords
 */
export function extractKeywords(text: string, maxKeywords = 5): string[] {
	// Normalize and tokenize
	const words = text
		.toLowerCase()
		.replace(/[^\w\s-]/g, " ")
		.split(/\s+/)
		.filter((word) => word.length > 2)
		.filter((word) => !STOP_WORDS.has(word))
		.filter((word) => !/^\d+$/.test(word)); // Exclude pure numbers

	// Count word frequency
	const wordCounts = new Map<string, number>();
	for (const word of words) {
		wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
	}

	// Sort by frequency and take top keywords
	return Array.from(wordCounts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, maxKeywords)
		.map(([word]) => word);
}

/**
 * Options for finding similar papers
 */
export interface SimilarPapersOptions {
	/** Maximum number of similar papers to return */
	maxResults?: number;
	/** Use only the primary category for filtering */
	usePrimaryCategory?: boolean;
	/** Exclude the source paper from results */
	excludeSource?: boolean;
}

/**
 * Get similar papers based on a source paper
 *
 * @param paper - Source paper to find similar papers for
 * @param options - Search options
 * @returns Array of similar papers
 */
export async function getSimilarPapers(
	paper: Paper,
	options: SimilarPapersOptions = {},
): Promise<Paper[]> {
	const {
		maxResults = 5,
		usePrimaryCategory = true,
		excludeSource = true,
	} = options;

	// Extract keywords from title and summary
	const titleKeywords = extractKeywords(paper.title, 3);
	const summaryKeywords = extractKeywords(paper.summary, 3);

	// Combine and deduplicate keywords
	const allKeywords = [...new Set([...titleKeywords, ...summaryKeywords])];

	if (allKeywords.length === 0) {
		logger.warn("No keywords extracted for similar papers search", {
			title: paper.title,
		});
		return [];
	}

	// Build search query
	const query = allKeywords.slice(0, 5).join(" OR ");

	// Get primary category if available
	const category = usePrimaryCategory ? paper.categories?.[0] : undefined;

	logger.debug("Searching for similar papers", {
		keywords: allKeywords,
		query,
		category,
	});

	try {
		// Search with extracted keywords and category
		const results = await searchPapersAdvanced({
			query,
			category: category as ArxivCategory | undefined,
			maxResults: maxResults + (excludeSource ? 1 : 0), // Fetch extra if excluding source
			sortBy: "relevance",
		});

		// Filter out the source paper if requested
		let papers = results;
		if (excludeSource) {
			const sourceId = paper.link.split("/abs/")[1];
			papers = results.filter((p) => !p.link.includes(sourceId || ""));
		}

		return papers.slice(0, maxResults);
	} catch (error) {
		logger.error("Failed to find similar papers", {
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}

/**
 * Get similar papers by arXiv ID
 *
 * @param arxivId - arXiv paper ID
 * @param options - Search options
 * @returns Array of similar papers or null if paper not found
 */
export async function getSimilarPapersById(
	arxivId: string,
	options: SimilarPapersOptions = {},
): Promise<Paper[] | null> {
	// Fetch the source paper first
	const paper = await fetchPaperById(arxivId);

	if (!paper) {
		logger.warn("Paper not found for similar papers search", { arxivId });
		return null;
	}

	return getSimilarPapers(paper, options);
}

/**
 * Get papers by the same authors
 *
 * @param paper - Source paper
 * @param maxResults - Maximum results
 * @returns Array of papers by the same authors
 */
export async function getPapersBySameAuthors(
	paper: Paper,
	maxResults = 5,
): Promise<Paper[]> {
	if (!paper.authors?.length) {
		return [];
	}

	// Use the first author for the search
	const primaryAuthor = paper.authors[0];

	try {
		const results = await searchPapersAdvanced({
			author: primaryAuthor,
			maxResults: maxResults + 1, // Fetch extra to exclude source
			sortBy: "submittedDate",
		});

		// Filter out the source paper
		const sourceId = paper.link.split("/abs/")[1];
		return results
			.filter((p) => !p.link.includes(sourceId || ""))
			.slice(0, maxResults);
	} catch (error) {
		logger.error("Failed to find papers by same authors", {
			author: primaryAuthor,
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}

/**
 * Get recent papers in the same category
 *
 * @param paper - Source paper
 * @param maxResults - Maximum results
 * @returns Array of recent papers in the same category
 */
export async function getRecentInCategory(
	paper: Paper,
	maxResults = 5,
): Promise<Paper[]> {
	const category = paper.categories?.[0];

	if (!category) {
		return [];
	}

	try {
		const results = await searchPapersAdvanced({
			category: category as ArxivCategory,
			maxResults: maxResults + 1, // Fetch extra to exclude source
			sortBy: "submittedDate",
			sortOrder: "descending",
		});

		// Filter out the source paper
		const sourceId = paper.link.split("/abs/")[1];
		return results
			.filter((p) => !p.link.includes(sourceId || ""))
			.slice(0, maxResults);
	} catch (error) {
		logger.error("Failed to find recent papers in category", {
			category,
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}

/**
 * Recommendation result with metadata
 */
export interface RecommendationResult {
	papers: Paper[];
	source: "keywords" | "author" | "category";
	query?: string;
}

/**
 * Get comprehensive recommendations for a paper
 *
 * @param paper - Source paper
 * @param maxResults - Maximum results per category
 * @returns Object containing different types of recommendations
 */
export async function getComprehensiveRecommendations(
	paper: Paper,
	maxResults = 3,
): Promise<{
	similar: RecommendationResult;
	sameAuthor: RecommendationResult;
	recentInCategory: RecommendationResult;
}> {
	// Run all searches in parallel
	const [similar, sameAuthor, recentInCategory] = await Promise.all([
		getSimilarPapers(paper, { maxResults }),
		getPapersBySameAuthors(paper, maxResults),
		getRecentInCategory(paper, maxResults),
	]);

	return {
		similar: {
			papers: similar,
			source: "keywords",
			query: extractKeywords(paper.title, 3).join(" OR "),
		},
		sameAuthor: {
			papers: sameAuthor,
			source: "author",
			query: paper.authors?.[0],
		},
		recentInCategory: {
			papers: recentInCategory,
			source: "category",
			query: paper.categories?.[0],
		},
	};
}
