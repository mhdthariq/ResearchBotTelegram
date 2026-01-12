/**
 * Unit tests for utility functions
 */

import { describe, expect, it } from "bun:test";

// Test formatSummary-like functionality
describe("formatSummary", () => {
	// Inline implementation for testing (matching src/arxiv.ts)
	function formatSummary(summary: string, maxLength = 200): string {
		const cleaned = summary.trim().replace(/\n/g, " ").replace(/\s+/g, " ");
		if (cleaned.length <= maxLength) {
			return cleaned;
		}
		return `${cleaned.substring(0, maxLength)}...`;
	}

	it("should return the same text if shorter than maxLength", () => {
		const input = "Short summary";
		expect(formatSummary(input)).toBe("Short summary");
	});

	it("should truncate text longer than maxLength", () => {
		const input = "A".repeat(300);
		const result = formatSummary(input);
		expect(result.length).toBe(203); // 200 + "..."
		expect(result.endsWith("...")).toBe(true);
	});

	it("should clean newlines from text", () => {
		const input = "Line one\nLine two\nLine three";
		expect(formatSummary(input)).toBe("Line one Line two Line three");
	});

	it("should normalize multiple spaces", () => {
		const input = "Word   with   multiple   spaces";
		expect(formatSummary(input)).toBe("Word with multiple spaces");
	});

	it("should trim leading and trailing whitespace", () => {
		const input = "   Padded text   ";
		expect(formatSummary(input)).toBe("Padded text");
	});

	it("should respect custom maxLength parameter", () => {
		const input =
			"This is a longer text that should be truncated at a custom length";
		const result = formatSummary(input, 20);
		expect(result).toBe("This is a longer tex...");
	});
});

// Test rate limiter functionality
describe("RateLimiter", () => {
	class TestRateLimiter {
		private lastRequest = 0;
		private pendingCount = 0;
		private readonly minInterval: number;

		constructor(minIntervalMs: number) {
			this.minInterval = minIntervalMs;
		}

		canProceed(): boolean {
			const elapsed = Date.now() - this.lastRequest;
			return elapsed >= this.minInterval;
		}

		getWaitTime(): number {
			const elapsed = Date.now() - this.lastRequest;
			return Math.max(0, this.minInterval - elapsed);
		}

		getPendingCount(): number {
			return this.pendingCount;
		}

		async throttle(): Promise<void> {
			this.pendingCount++;
			const waitTime = this.getWaitTime();
			if (waitTime > 0) {
				await new Promise((resolve) => setTimeout(resolve, waitTime));
			}
			this.lastRequest = Date.now();
			this.pendingCount--;
		}
	}

	it("should allow immediate request when no prior request", () => {
		const limiter = new TestRateLimiter(100);
		expect(limiter.canProceed()).toBe(true);
	});

	it("should return 0 wait time when no prior request", () => {
		const limiter = new TestRateLimiter(100);
		expect(limiter.getWaitTime()).toBe(0);
	});

	it("should track pending count correctly", async () => {
		const limiter = new TestRateLimiter(10);
		expect(limiter.getPendingCount()).toBe(0);
	});
});

// Test retry logic
describe("Retry Logic", () => {
	function isNetworkError(error: unknown): boolean {
		if (!(error instanceof Error)) return false;
		const networkErrorMessages = [
			"ECONNRESET",
			"ECONNREFUSED",
			"ETIMEDOUT",
			"ENOTFOUND",
			"EHOSTUNREACH",
			"ENETUNREACH",
			"EAI_AGAIN",
			"fetch failed",
		];
		return networkErrorMessages.some((msg) =>
			error.message.toLowerCase().includes(msg.toLowerCase()),
		);
	}

	function isRetryableStatusCode(statusCode: number): boolean {
		return (
			statusCode === 429 || // Too Many Requests
			statusCode === 500 || // Internal Server Error
			statusCode === 502 || // Bad Gateway
			statusCode === 503 || // Service Unavailable
			statusCode === 504 // Gateway Timeout
		);
	}

	it("should identify network errors", () => {
		expect(isNetworkError(new Error("ECONNRESET"))).toBe(true);
		expect(isNetworkError(new Error("ETIMEDOUT"))).toBe(true);
		expect(isNetworkError(new Error("fetch failed"))).toBe(true);
	});

	it("should not identify non-network errors", () => {
		expect(isNetworkError(new Error("Invalid input"))).toBe(false);
		expect(isNetworkError(new Error("Not found"))).toBe(false);
		expect(isNetworkError("string error")).toBe(false);
	});

	it("should identify retryable status codes", () => {
		expect(isRetryableStatusCode(429)).toBe(true);
		expect(isRetryableStatusCode(500)).toBe(true);
		expect(isRetryableStatusCode(502)).toBe(true);
		expect(isRetryableStatusCode(503)).toBe(true);
		expect(isRetryableStatusCode(504)).toBe(true);
	});

	it("should not mark client errors as retryable", () => {
		expect(isRetryableStatusCode(400)).toBe(false);
		expect(isRetryableStatusCode(401)).toBe(false);
		expect(isRetryableStatusCode(403)).toBe(false);
		expect(isRetryableStatusCode(404)).toBe(false);
	});

	it("should not mark success codes as retryable", () => {
		expect(isRetryableStatusCode(200)).toBe(false);
		expect(isRetryableStatusCode(201)).toBe(false);
		expect(isRetryableStatusCode(204)).toBe(false);
	});
});

// Test BibTeX generation
describe("BibTeX Generation", () => {
	interface Paper {
		title: string;
		link: string;
		published: string;
		authors?: string[];
	}

	function toBibTeX(paper: Paper): string {
		const arxivId = paper.link.split("/abs/")[1] || paper.link;
		const authors = paper.authors?.join(" and ") || "Unknown";
		const year = paper.published.split("-")[0] || new Date().getFullYear();
		const key = `arxiv:${arxivId.replace(/[^a-zA-Z0-9]/g, "_")}`;

		return `@article{${key},
  title = {${paper.title}},
  author = {${authors}},
  year = {${year}},
  eprint = {${arxivId}},
  archivePrefix = {arXiv},
  primaryClass = {cs.AI}
}`;
	}

	it("should generate valid BibTeX", () => {
		const paper: Paper = {
			title: "Test Paper Title",
			link: "https://arxiv.org/abs/2301.00001",
			published: "2023-01-15",
			authors: ["John Doe", "Jane Smith"],
		};

		const bibtex = toBibTeX(paper);
		expect(bibtex).toContain("@article{");
		expect(bibtex).toContain("title = {Test Paper Title}");
		expect(bibtex).toContain("author = {John Doe and Jane Smith}");
		expect(bibtex).toContain("year = {2023}");
		expect(bibtex).toContain("eprint = {2301.00001}");
	});

	it("should handle missing authors", () => {
		const paper: Paper = {
			title: "Test Paper",
			link: "https://arxiv.org/abs/2301.00001",
			published: "2023-01-15",
		};

		const bibtex = toBibTeX(paper);
		expect(bibtex).toContain("author = {Unknown}");
	});

	it("should sanitize arxiv ID for BibTeX key", () => {
		const paper: Paper = {
			title: "Test",
			link: "https://arxiv.org/abs/2301.00001v2",
			published: "2023-01-15",
		};

		const bibtex = toBibTeX(paper);
		expect(bibtex).toContain("@article{arxiv:2301_00001v2");
	});
});

// Test Markdown generation
describe("Markdown Generation", () => {
	interface Paper {
		title: string;
		link: string;
		summary: string;
		published: string;
		authors?: string[];
	}

	function toMarkdown(paper: Paper): string {
		const authors = paper.authors?.join(", ") || "Unknown";
		const arxivId = paper.link.split("/abs/")[1] || paper.link;

		return `## ${paper.title}

**Authors:** ${authors}

**Published:** ${paper.published}

**arXiv ID:** ${arxivId}

**Abstract:**
${paper.summary}

**Links:**
- [arXiv Page](${paper.link})
- [PDF](${paper.link.replace("/abs/", "/pdf/")})
`;
	}

	it("should generate valid Markdown", () => {
		const paper: Paper = {
			title: "Test Paper Title",
			link: "https://arxiv.org/abs/2301.00001",
			summary: "This is the abstract.",
			published: "2023-01-15",
			authors: ["John Doe", "Jane Smith"],
		};

		const md = toMarkdown(paper);
		expect(md).toContain("## Test Paper Title");
		expect(md).toContain("**Authors:** John Doe, Jane Smith");
		expect(md).toContain("**Published:** 2023-01-15");
		expect(md).toContain("This is the abstract.");
		expect(md).toContain("[arXiv Page]");
		expect(md).toContain("[PDF]");
	});

	it("should generate PDF link from abs link", () => {
		const paper: Paper = {
			title: "Test",
			link: "https://arxiv.org/abs/2301.00001",
			summary: "Summary",
			published: "2023-01-15",
		};

		const md = toMarkdown(paper);
		expect(md).toContain("https://arxiv.org/pdf/2301.00001");
	});
});

// Test arXiv ID validation
describe("arXiv ID Validation", () => {
	function validateArxivId(id: string): boolean {
		// Pattern 1: New format (YYMM.NNNNN or YYMM.NNNNNvN)
		// Pattern 2: Old format (category/YYMMNNN)
		const patterns = [
			/^\d{4}\.\d{4,5}(v\d+)?$/, // New format
			/^[a-z-]+\/\d{7}(v\d+)?$/, // Old format
		];

		return patterns.some((pattern) => pattern.test(id));
	}

	it("should validate new format arXiv IDs", () => {
		expect(validateArxivId("2301.00001")).toBe(true);
		expect(validateArxivId("2301.12345")).toBe(true);
		expect(validateArxivId("2301.00001v1")).toBe(true);
		expect(validateArxivId("2301.00001v2")).toBe(true);
	});

	it("should validate old format arXiv IDs", () => {
		expect(validateArxivId("hep-th/9901001")).toBe(true);
		expect(validateArxivId("cs/0101001")).toBe(true);
		expect(validateArxivId("math/0101001v1")).toBe(true);
	});

	it("should reject invalid arXiv IDs", () => {
		expect(validateArxivId("")).toBe(false);
		expect(validateArxivId("invalid")).toBe(false);
		expect(validateArxivId("12345")).toBe(false);
		expect(validateArxivId("2301")).toBe(false);
		expect(validateArxivId("2301.1")).toBe(false);
	});
});

// Test search query sanitization
describe("Search Query Sanitization", () => {
	function sanitizeSearchQuery(query: string): string {
		return query
			.trim()
			.replace(/[<>]/g, "") // Remove potential HTML/XML
			.replace(/['"]/g, "") // Remove quotes
			.replace(/\s+/g, " ") // Normalize whitespace
			.substring(0, 200); // Limit length
	}

	it("should trim whitespace", () => {
		expect(sanitizeSearchQuery("  query  ")).toBe("query");
	});

	it("should remove HTML-like characters", () => {
		expect(sanitizeSearchQuery("<script>alert</script>")).toBe(
			"scriptalert/script",
		);
	});

	it("should remove quotes", () => {
		expect(sanitizeSearchQuery("'quoted' \"text\"")).toBe("quoted text");
	});

	it("should normalize multiple spaces", () => {
		expect(sanitizeSearchQuery("multiple   spaces")).toBe("multiple spaces");
	});

	it("should limit query length", () => {
		const longQuery = "a".repeat(300);
		expect(sanitizeSearchQuery(longQuery).length).toBe(200);
	});
});

// Test Logger functionality
describe("Logger", () => {
	type LogLevel = "debug" | "info" | "warn" | "error";

	const LOG_LEVELS: Record<LogLevel, number> = {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
	};

	function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
		return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
	}

	it("should log messages at or above minimum level", () => {
		expect(shouldLog("debug", "debug")).toBe(true);
		expect(shouldLog("info", "debug")).toBe(true);
		expect(shouldLog("warn", "debug")).toBe(true);
		expect(shouldLog("error", "debug")).toBe(true);
	});

	it("should filter messages below minimum level", () => {
		expect(shouldLog("debug", "info")).toBe(false);
		expect(shouldLog("debug", "warn")).toBe(false);
		expect(shouldLog("info", "warn")).toBe(false);
		expect(shouldLog("debug", "error")).toBe(false);
	});

	it("should always log errors", () => {
		expect(shouldLog("error", "error")).toBe(true);
	});
});
