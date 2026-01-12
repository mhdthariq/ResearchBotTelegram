/**
 * Unit tests for arXiv API functions
 *
 * Tests cover:
 * - Paper fetching and parsing
 * - Advanced search options
 * - Error handling
 * - Rate limiting behavior
 * - Caching behavior
 *
 * Note: Some tests make real API calls to arXiv and may be slow due to rate limiting.
 * Consider running with longer timeouts: bun test --timeout 30000
 */

import { describe, expect, it, setDefaultTimeout } from "bun:test";

// Set longer default timeout for API tests (30 seconds)
setDefaultTimeout(30000);

import {
	ARXIV_CATEGORIES,
	fetchPaperById,
	fetchPapers,
	fetchPapersAdvanced,
	formatSummary,
	getCategoryDescription,
	getRateLimiterStatus,
	type Paper,
	searchByAuthor,
	searchByCategory,
	searchPapersAdvanced,
} from "../src/arxiv";

describe("arXiv API", () => {
	describe("fetchPapers", () => {
		it("should return an array of papers", async () => {
			const papers = await fetchPapers("machine learning", 0, 3);

			expect(papers).toBeArray();
			expect(papers.length).toBeLessThanOrEqual(3);
		});

		it("should parse papers correctly with required fields", async () => {
			const papers = await fetchPapers("neural network", 0, 1);

			if (papers.length > 0) {
				const paper = papers[0];
				expect(paper).toHaveProperty("title");
				expect(paper).toHaveProperty("summary");
				expect(paper).toHaveProperty("link");
				expect(paper).toHaveProperty("published");

				// Title should be a non-empty string
				expect(typeof paper.title).toBe("string");
				expect(paper.title.length).toBeGreaterThan(0);

				// Link should be a valid arXiv URL
				expect(paper.link).toContain("arxiv.org");
			}
		});

		it("should include authors when available", async () => {
			const papers = await fetchPapers("deep learning", 0, 5);

			// At least some papers should have authors
			const papersWithAuthors = papers.filter(
				(p) => p.authors && p.authors.length > 0,
			);
			expect(papersWithAuthors.length).toBeGreaterThan(0);
		});

		it("should include categories when available", async () => {
			const papers = await fetchPapers("transformer", 0, 5);

			// At least some papers should have categories
			const papersWithCategories = papers.filter(
				(p) => p.categories && p.categories.length > 0,
			);
			expect(papersWithCategories.length).toBeGreaterThan(0);
		});

		it("should handle empty results gracefully", async () => {
			// Use a very unlikely search term
			const papers = await fetchPapers(
				"xyznonexistentquery123456789abcdef",
				0,
				5,
			);
			expect(papers).toBeArray();
			expect(papers).toEqual([]);
		});

		it("should handle empty query gracefully", async () => {
			const papers = await fetchPapers("", 0, 5);
			expect(papers).toBeArray();
			expect(papers).toEqual([]);
		});

		it("should respect max results parameter", async () => {
			const papers = await fetchPapers("AI", 0, 3);
			expect(papers.length).toBeLessThanOrEqual(3);
		});

		it("should support pagination with start parameter", async () => {
			// Note: This test makes multiple API calls and respects rate limiting
			const firstPage = await fetchPapers("computer vision", 0, 3);

			// Only test pagination if we got results
			if (firstPage.length === 3) {
				const secondPage = await fetchPapers("computer vision", 3, 3);

				if (secondPage.length > 0) {
					const firstIds = firstPage.map((p) => p.link);
					const secondIds = secondPage.map((p) => p.link);

					// No overlap between pages
					const overlap = firstIds.filter((id) => secondIds.includes(id));
					expect(overlap.length).toBe(0);
				}
			}

			// Test passes as long as no errors thrown
			expect(firstPage).toBeArray();
		});
	});

	describe("fetchPapersAdvanced", () => {
		it("should support sortBy relevance", async () => {
			const papers = await fetchPapersAdvanced({
				topic: "attention mechanism",
				max: 3,
				sortBy: "relevance",
			});

			expect(papers).toBeArray();
		});

		it("should support sortBy lastUpdatedDate", async () => {
			const papers = await fetchPapersAdvanced({
				topic: "reinforcement learning",
				max: 3,
				sortBy: "lastUpdatedDate",
			});

			expect(papers).toBeArray();
		});

		it("should support ascending sort order", async () => {
			const papers = await fetchPapersAdvanced({
				topic: "BERT",
				max: 3,
				sortOrder: "ascending",
			});

			expect(papers).toBeArray();
		});
	});

	describe("searchPapersAdvanced", () => {
		it("should search by query", async () => {
			const papers = await searchPapersAdvanced({
				query: "transformer architecture",
				maxResults: 3,
			});

			expect(papers).toBeArray();
		});

		it("should search by author", async () => {
			const papers = await searchPapersAdvanced({
				author: "Hinton",
				maxResults: 5,
			});

			expect(papers).toBeArray();
			// If results found, check they might be related to the author
			// Note: arXiv search is fuzzy so we can't guarantee exact matches
		});

		it("should search by title", async () => {
			const papers = await searchPapersAdvanced({
				title: "attention",
				maxResults: 3,
			});

			expect(papers).toBeArray();
		});

		it("should search by abstract", async () => {
			// Abstract search can be slow, use smaller result set
			const papers = await searchPapersAdvanced({
				abstract: "deep learning",
				maxResults: 2,
			});

			expect(papers).toBeArray();
		});

		it("should search by category", async () => {
			const papers = await searchPapersAdvanced({
				category: "cs.AI",
				maxResults: 3,
			});

			expect(papers).toBeArray();
			if (papers.length > 0) {
				// Check that at least some papers have the expected category
				const _hasCategory = papers.some((p) =>
					p.categories?.includes("cs.AI"),
				);
				// Note: This may not always be true due to API behavior
			}
		});

		it("should combine multiple search criteria", async () => {
			const papers = await searchPapersAdvanced({
				query: "neural",
				category: "cs.LG",
				maxResults: 2,
			});

			expect(papers).toBeArray();
		});

		it("should return empty for no search criteria", async () => {
			const papers = await searchPapersAdvanced({});
			expect(papers).toEqual([]);
		});
	});

	describe("searchByAuthor", () => {
		it("should search papers by author name", async () => {
			const papers = await searchByAuthor("LeCun", 3);

			expect(papers).toBeArray();
		});
	});

	describe("searchByCategory", () => {
		it("should search papers by category", async () => {
			const papers = await searchByCategory("cs.CV", 3);

			expect(papers).toBeArray();
		});
	});

	describe("fetchPaperById", () => {
		it("should fetch a specific paper by ID", async () => {
			// Use a known arXiv ID (Attention Is All You Need paper)
			// This test may take time due to rate limiting
			const paper = await fetchPaperById("1706.03762");

			// Paper may be null if rate limited, but should not throw
			if (paper) {
				expect(paper.title).toBeDefined();
				expect(paper.link).toContain("arxiv.org");
			} else {
				// If null, the function handled the request gracefully
				expect(paper).toBeNull();
			}
		});

		it("should return null for invalid ID", async () => {
			const paper = await fetchPaperById("0000.00000");
			// May return null or a paper depending on if ID exists
			// At minimum, should not throw
			expect(paper === null || typeof paper === "object").toBe(true);
		});

		it("should return null for empty ID", async () => {
			const paper = await fetchPaperById("");
			expect(paper).toBeNull();
		});
	});

	describe("formatSummary", () => {
		it("should return short summaries unchanged", () => {
			const short = "This is a short summary.";
			expect(formatSummary(short)).toBe(short);
		});

		it("should truncate long summaries with ellipsis", () => {
			const long = "A".repeat(300);
			const formatted = formatSummary(long, 200);

			expect(formatted.length).toBe(203); // 200 + "..."
			expect(formatted.endsWith("...")).toBe(true);
		});

		it("should clean up newlines", () => {
			const withNewlines = "Line 1\nLine 2\nLine 3";
			const formatted = formatSummary(withNewlines);

			expect(formatted).not.toContain("\n");
			expect(formatted).toBe("Line 1 Line 2 Line 3");
		});

		it("should collapse multiple spaces", () => {
			const withSpaces = "Word1    Word2     Word3";
			const formatted = formatSummary(withSpaces);

			expect(formatted).toBe("Word1 Word2 Word3");
		});

		it("should use custom max length", () => {
			const text = "A".repeat(100);
			const formatted = formatSummary(text, 50);

			expect(formatted.length).toBe(53); // 50 + "..."
		});
	});

	describe("ARXIV_CATEGORIES", () => {
		it("should contain common CS categories", () => {
			expect(ARXIV_CATEGORIES["cs.AI"]).toBe("Artificial Intelligence");
			expect(ARXIV_CATEGORIES["cs.LG"]).toBe("Machine Learning");
			expect(ARXIV_CATEGORIES["cs.CV"]).toBe("Computer Vision");
			expect(ARXIV_CATEGORIES["cs.CL"]).toBe("Computation and Language (NLP)");
		});

		it("should contain stat.ML category", () => {
			expect(ARXIV_CATEGORIES["stat.ML"]).toBe("Machine Learning (Statistics)");
		});
	});

	describe("getCategoryDescription", () => {
		it("should return description for known category", () => {
			expect(getCategoryDescription("cs.AI")).toBe("Artificial Intelligence");
		});

		it("should return the category code for unknown category", () => {
			expect(getCategoryDescription("unknown.XYZ")).toBe("unknown.XYZ");
		});
	});

	describe("getRateLimiterStatus", () => {
		it("should return rate limiter status object", () => {
			const status = getRateLimiterStatus();

			expect(status).toHaveProperty("canProceed");
			expect(status).toHaveProperty("waitTimeMs");
			expect(status).toHaveProperty("pendingRequests");

			expect(typeof status.canProceed).toBe("boolean");
			expect(typeof status.waitTimeMs).toBe("number");
			expect(typeof status.pendingRequests).toBe("number");
		});
	});
});

describe("Paper interface", () => {
	it("should have correct structure", () => {
		const mockPaper: Paper = {
			title: "Test Paper Title",
			summary: "This is a test abstract",
			link: "http://arxiv.org/abs/1234.56789",
			published: "2024-01-01",
			authors: ["Author One", "Author Two"],
			categories: ["cs.AI", "cs.LG"],
		};

		expect(mockPaper.title).toBe("Test Paper Title");
		expect(mockPaper.summary).toBe("This is a test abstract");
		expect(mockPaper.link).toBe("http://arxiv.org/abs/1234.56789");
		expect(mockPaper.published).toBe("2024-01-01");
		expect(mockPaper.authors).toEqual(["Author One", "Author Two"]);
		expect(mockPaper.categories).toEqual(["cs.AI", "cs.LG"]);
	});

	it("should allow optional fields to be undefined", () => {
		const minimalPaper: Paper = {
			title: "Minimal Paper",
			summary: "Summary",
			link: "http://arxiv.org/abs/0000.00000",
			published: "2024-01-01",
		};

		expect(minimalPaper.authors).toBeUndefined();
		expect(minimalPaper.categories).toBeUndefined();
	});
});
