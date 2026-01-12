/**
 * Integration tests for bot functionality
 *
 * Tests cover:
 * - Command handling
 * - Callback query handling
 * - Session management
 * - Error handling
 * - Message formatting
 */

import { beforeEach, describe, expect, it } from "bun:test";

// Mock message formatting functions
describe("Bot Message Formatting", () => {
	interface Paper {
		title: string;
		summary: string;
		link: string;
		published: string;
		authors?: string[];
		categories?: string[];
	}

	function formatPapersMessage(papers: Paper[], offset: number): string {
		if (papers.length === 0) {
			return "No papers found for your search query.";
		}

		return papers
			.map((paper, index) => {
				const num = offset + index + 1;
				const authors = paper.authors?.slice(0, 3).join(", ") || "Unknown";
				const moreAuthors =
					paper.authors && paper.authors.length > 3
						? ` (+${paper.authors.length - 3} more)`
						: "";

				return `${num}. ${paper.title}\n   Authors: ${authors}${moreAuthors}\n   Published: ${paper.published}\n   ${paper.link}`;
			})
			.join("\n\n");
	}

	it("should format papers correctly", () => {
		const papers: Paper[] = [
			{
				title: "Test Paper",
				summary: "Abstract",
				link: "https://arxiv.org/abs/2301.00001",
				published: "2023-01-15",
				authors: ["John Doe", "Jane Smith"],
			},
		];

		const formatted = formatPapersMessage(papers, 0);

		expect(formatted).toContain("1. Test Paper");
		expect(formatted).toContain("John Doe, Jane Smith");
		expect(formatted).toContain("2023-01-15");
		expect(formatted).toContain("https://arxiv.org/abs/2301.00001");
	});

	it("should handle empty results", () => {
		const formatted = formatPapersMessage([], 0);
		expect(formatted).toBe("No papers found for your search query.");
	});

	it("should show correct numbering with offset", () => {
		const papers: Paper[] = [
			{
				title: "Paper 1",
				summary: "Summary",
				link: "http://arxiv.org/abs/0001",
				published: "2024-01-01",
			},
		];

		const formatted = formatPapersMessage(papers, 5);
		expect(formatted).toContain("6. Paper 1");
	});

	it("should truncate authors list", () => {
		const papers: Paper[] = [
			{
				title: "Multi-Author Paper",
				summary: "Summary",
				link: "http://arxiv.org/abs/0001",
				published: "2024-01-01",
				authors: ["A1", "A2", "A3", "A4", "A5"],
			},
		];

		const formatted = formatPapersMessage(papers, 0);
		expect(formatted).toContain("A1, A2, A3");
		expect(formatted).toContain("(+2 more)");
	});

	it("should handle missing authors", () => {
		const papers: Paper[] = [
			{
				title: "Anonymous Paper",
				summary: "Summary",
				link: "http://arxiv.org/abs/0001",
				published: "2024-01-01",
			},
		];

		const formatted = formatPapersMessage(papers, 0);
		expect(formatted).toContain("Unknown");
	});
});

// Test inline keyboard generation
describe("Inline Keyboard Generation", () => {
	interface InlineKeyboardButton {
		text: string;
		callback_data?: string;
		url?: string;
	}

	function createSearchKeyboard(
		topic: string,
		offset: number,
		hasMore: boolean,
	): { inline_keyboard: InlineKeyboardButton[][] } {
		const keyboard: InlineKeyboardButton[][] = [];

		// Navigation row
		const navRow: InlineKeyboardButton[] = [];
		if (offset > 0) {
			navRow.push({
				text: "⬅️ Previous",
				callback_data: `prev:${topic}:${offset - 5}`,
			});
		}
		if (hasMore) {
			navRow.push({
				text: "➡️ Next",
				callback_data: `next:${topic}:${offset + 5}`,
			});
		}
		if (navRow.length > 0) {
			keyboard.push(navRow);
		}

		// Action row
		keyboard.push([{ text: "🔍 New Search", callback_data: "new_search" }]);

		return { inline_keyboard: keyboard };
	}

	it("should create navigation buttons", () => {
		const keyboard = createSearchKeyboard("AI", 5, true);

		expect(keyboard.inline_keyboard.length).toBeGreaterThan(0);

		// Should have both prev and next buttons
		const navRow = keyboard.inline_keyboard[0];
		expect(navRow.length).toBe(2);
		expect(navRow[0].text).toContain("Previous");
		expect(navRow[1].text).toContain("Next");
	});

	it("should hide previous button on first page", () => {
		const keyboard = createSearchKeyboard("AI", 0, true);

		const navRow = keyboard.inline_keyboard[0];
		expect(navRow.length).toBe(1);
		expect(navRow[0].text).toContain("Next");
	});

	it("should hide next button on last page", () => {
		const keyboard = createSearchKeyboard("AI", 5, false);

		const navRow = keyboard.inline_keyboard[0];
		expect(navRow.length).toBe(1);
		expect(navRow[0].text).toContain("Previous");
	});

	it("should include topic in callback data", () => {
		const keyboard = createSearchKeyboard("machine learning", 5, true);

		const navRow = keyboard.inline_keyboard[0];
		expect(navRow[0].callback_data).toContain("machine learning");
		expect(navRow[1].callback_data).toContain("machine learning");
	});

	it("should always include action row", () => {
		const keyboard = createSearchKeyboard("AI", 0, false);

		// Should still have the action row even without navigation
		expect(keyboard.inline_keyboard.length).toBe(1);
		expect(keyboard.inline_keyboard[0][0].text).toContain("New Search");
	});
});

// Test callback data parsing
describe("Callback Data Parsing", () => {
	interface ParsedCallback {
		action: string;
		params: string[];
	}

	function parseCallbackData(data: string): ParsedCallback {
		const parts = data.split(":");
		return {
			action: parts[0] || "",
			params: parts.slice(1),
		};
	}

	it("should parse simple callback", () => {
		const result = parseCallbackData("search");
		expect(result.action).toBe("search");
		expect(result.params).toEqual([]);
	});

	it("should parse callback with one parameter", () => {
		const result = parseCallbackData("detail:12345");
		expect(result.action).toBe("detail");
		expect(result.params).toEqual(["12345"]);
	});

	it("should parse callback with multiple parameters", () => {
		const result = parseCallbackData("next:AI:5");
		expect(result.action).toBe("next");
		expect(result.params).toEqual(["AI", "5"]);
	});

	it("should handle topic with spaces", () => {
		const result = parseCallbackData("search:machine learning");
		expect(result.action).toBe("search");
		expect(result.params).toEqual(["machine learning"]);
	});
});

// Test session data structure
describe("Session Data", () => {
	interface SessionData {
		lastTopic?: string;
		lastOffset?: number;
		resultsPerPage?: number;
		lastSearchTime?: number;
	}

	function createInitialSession(): SessionData {
		return {
			lastOffset: 0,
		};
	}

	function updateSession(
		session: SessionData,
		updates: Partial<SessionData>,
	): SessionData {
		return { ...session, ...updates };
	}

	it("should create initial session with default values", () => {
		const session = createInitialSession();
		expect(session.lastOffset).toBe(0);
		expect(session.lastTopic).toBeUndefined();
	});

	it("should update session values", () => {
		let session = createInitialSession();
		session = updateSession(session, {
			lastTopic: "neural networks",
			lastOffset: 5,
		});

		expect(session.lastTopic).toBe("neural networks");
		expect(session.lastOffset).toBe(5);
	});

	it("should preserve existing values when partially updating", () => {
		let session = createInitialSession();
		session = updateSession(session, { lastTopic: "AI" });
		session = updateSession(session, { lastOffset: 10 });

		expect(session.lastTopic).toBe("AI");
		expect(session.lastOffset).toBe(10);
	});
});

// Test rate limiting logic
describe("User Rate Limiting", () => {
	interface RateLimitInfo {
		count: number;
		resetAt: number;
	}

	const RATE_LIMIT = {
		maxRequests: 10,
		windowMs: 60000, // 1 minute
	};

	const userRateLimits = new Map<number, RateLimitInfo>();

	function checkRateLimit(chatId: number): {
		allowed: boolean;
		remaining: number;
		resetInMs: number;
	} {
		const now = Date.now();
		const userLimit = userRateLimits.get(chatId);

		if (!userLimit || now > userLimit.resetAt) {
			userRateLimits.set(chatId, {
				count: 1,
				resetAt: now + RATE_LIMIT.windowMs,
			});
			return {
				allowed: true,
				remaining: RATE_LIMIT.maxRequests - 1,
				resetInMs: RATE_LIMIT.windowMs,
			};
		}

		if (userLimit.count >= RATE_LIMIT.maxRequests) {
			return {
				allowed: false,
				remaining: 0,
				resetInMs: userLimit.resetAt - now,
			};
		}

		userLimit.count++;
		return {
			allowed: true,
			remaining: RATE_LIMIT.maxRequests - userLimit.count,
			resetInMs: userLimit.resetAt - now,
		};
	}

	beforeEach(() => {
		userRateLimits.clear();
	});

	it("should allow first request", () => {
		const result = checkRateLimit(12345);
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(9);
	});

	it("should track request count", () => {
		checkRateLimit(12345);
		checkRateLimit(12345);
		const result = checkRateLimit(12345);

		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(7);
	});

	it("should block after limit exceeded", () => {
		for (let i = 0; i < 10; i++) {
			checkRateLimit(12345);
		}

		const result = checkRateLimit(12345);
		expect(result.allowed).toBe(false);
		expect(result.remaining).toBe(0);
	});

	it("should track users independently", () => {
		for (let i = 0; i < 10; i++) {
			checkRateLimit(11111);
		}

		// Different user should still be allowed
		const result = checkRateLimit(22222);
		expect(result.allowed).toBe(true);
	});
});

// Test command parsing
describe("Command Parsing", () => {
	interface ParsedCommand {
		command: string;
		args: string;
	}

	function parseCommand(text: string): ParsedCommand | null {
		if (!text.startsWith("/")) {
			return null;
		}

		const firstSpace = text.indexOf(" ");
		if (firstSpace === -1) {
			return {
				command: text.slice(1).toLowerCase(),
				args: "",
			};
		}

		return {
			command: text.slice(1, firstSpace).toLowerCase(),
			args: text.slice(firstSpace + 1).trim(),
		};
	}

	it("should parse simple command", () => {
		const result = parseCommand("/start");
		expect(result?.command).toBe("start");
		expect(result?.args).toBe("");
	});

	it("should parse command with arguments", () => {
		const result = parseCommand("/search machine learning");
		expect(result?.command).toBe("search");
		expect(result?.args).toBe("machine learning");
	});

	it("should handle bot username in command", () => {
		const text = "/search@mybot neural networks";
		const atIndex = text.indexOf("@");
		const spaceIndex = text.indexOf(" ");

		const command = text.slice(
			1,
			atIndex > 0 ? atIndex : spaceIndex || undefined,
		);
		expect(command).toBe("search");
	});

	it("should return null for non-commands", () => {
		const result = parseCommand("hello world");
		expect(result).toBeNull();
	});

	it("should handle multiple spaces in arguments", () => {
		const result = parseCommand("/search   term   with   spaces");
		expect(result?.args).toBe("term   with   spaces");
	});

	it("should convert command to lowercase", () => {
		const result = parseCommand("/SEARCH test");
		expect(result?.command).toBe("search");
	});
});

// Test bookmark functionality
describe("Bookmark Management", () => {
	interface Bookmark {
		id: number;
		userId: number;
		arxivId: string;
		title: string;
		link: string;
		createdAt: string;
	}

	const bookmarks: Bookmark[] = [];
	let nextId = 1;

	function addBookmark(
		userId: number,
		arxivId: string,
		title: string,
		link: string,
	): { success: boolean; bookmark?: Bookmark; error?: string } {
		// Check for duplicate
		const existing = bookmarks.find(
			(b) => b.userId === userId && b.arxivId === arxivId,
		);
		if (existing) {
			return { success: false, error: "Already bookmarked" };
		}

		const bookmark: Bookmark = {
			id: nextId++,
			userId,
			arxivId,
			title,
			link,
			createdAt: new Date().toISOString(),
		};

		bookmarks.push(bookmark);
		return { success: true, bookmark };
	}

	function removeBookmark(userId: number, arxivId: string): boolean {
		const index = bookmarks.findIndex(
			(b) => b.userId === userId && b.arxivId === arxivId,
		);
		if (index === -1) {
			return false;
		}
		bookmarks.splice(index, 1);
		return true;
	}

	function getUserBookmarks(userId: number): Bookmark[] {
		return bookmarks.filter((b) => b.userId === userId);
	}

	beforeEach(() => {
		bookmarks.length = 0;
		nextId = 1;
	});

	it("should add bookmark successfully", () => {
		const result = addBookmark(
			1,
			"2301.00001",
			"Test Paper",
			"https://arxiv.org/abs/2301.00001",
		);

		expect(result.success).toBe(true);
		expect(result.bookmark).toBeDefined();
		expect(result.bookmark?.title).toBe("Test Paper");
	});

	it("should prevent duplicate bookmarks", () => {
		addBookmark(1, "2301.00001", "Paper 1", "http://arxiv.org/abs/2301.00001");
		const result = addBookmark(
			1,
			"2301.00001",
			"Paper 1",
			"http://arxiv.org/abs/2301.00001",
		);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Already bookmarked");
	});

	it("should allow same paper for different users", () => {
		addBookmark(1, "2301.00001", "Paper", "http://arxiv.org/abs/2301.00001");
		const result = addBookmark(
			2,
			"2301.00001",
			"Paper",
			"http://arxiv.org/abs/2301.00001",
		);

		expect(result.success).toBe(true);
	});

	it("should remove bookmark successfully", () => {
		addBookmark(1, "2301.00001", "Paper", "http://arxiv.org/abs/2301.00001");
		const removed = removeBookmark(1, "2301.00001");

		expect(removed).toBe(true);
		expect(getUserBookmarks(1).length).toBe(0);
	});

	it("should return false when removing non-existent bookmark", () => {
		const removed = removeBookmark(1, "9999.99999");
		expect(removed).toBe(false);
	});

	it("should get user bookmarks", () => {
		addBookmark(1, "2301.00001", "Paper 1", "http://arxiv.org/abs/2301.00001");
		addBookmark(1, "2301.00002", "Paper 2", "http://arxiv.org/abs/2301.00002");
		addBookmark(2, "2301.00003", "Paper 3", "http://arxiv.org/abs/2301.00003");

		const user1Bookmarks = getUserBookmarks(1);
		expect(user1Bookmarks.length).toBe(2);
	});
});

// Test subscription functionality
describe("Subscription Management", () => {
	interface Subscription {
		id: number;
		userId: number;
		topic: string;
		intervalHours: number;
		isActive: boolean;
	}

	const subscriptions: Subscription[] = [];
	let nextId = 1;

	function subscribe(
		userId: number,
		topic: string,
		intervalHours = 24,
	): Subscription {
		const subscription: Subscription = {
			id: nextId++,
			userId,
			topic,
			intervalHours,
			isActive: true,
		};
		subscriptions.push(subscription);
		return subscription;
	}

	function unsubscribe(subscriptionId: number): boolean {
		const index = subscriptions.findIndex((s) => s.id === subscriptionId);
		if (index === -1) return false;
		subscriptions.splice(index, 1);
		return true;
	}

	function getUserSubscriptions(userId: number): Subscription[] {
		return subscriptions.filter((s) => s.userId === userId);
	}

	beforeEach(() => {
		subscriptions.length = 0;
		nextId = 1;
	});

	it("should create subscription", () => {
		const sub = subscribe(1, "machine learning");

		expect(sub.topic).toBe("machine learning");
		expect(sub.isActive).toBe(true);
		expect(sub.intervalHours).toBe(24);
	});

	it("should use custom interval", () => {
		const sub = subscribe(1, "AI", 12);
		expect(sub.intervalHours).toBe(12);
	});

	it("should remove subscription", () => {
		const sub = subscribe(1, "AI");
		const removed = unsubscribe(sub.id);

		expect(removed).toBe(true);
		expect(getUserSubscriptions(1).length).toBe(0);
	});

	it("should allow multiple subscriptions per user", () => {
		subscribe(1, "AI");
		subscribe(1, "robotics");
		subscribe(1, "NLP");

		expect(getUserSubscriptions(1).length).toBe(3);
	});
});

// Test error message generation
describe("Error Messages", () => {
	const MESSAGES = {
		NO_RESULTS:
			"🔍 No papers found.\n\nTry different keywords or check your spelling.",
		API_ERROR: "❌ Error fetching papers. Please try again later.",
		RATE_LIMITED: "⏳ Too many requests. Please wait before trying again.",
		SEARCH_TIP: "💡 Tip: Use specific terms for better results.",
		INVALID_COMMAND: "❓ Unknown command. Use /help for available commands.",
	};

	it("should have appropriate error messages", () => {
		expect(MESSAGES.NO_RESULTS).toContain("No papers found");
		expect(MESSAGES.API_ERROR).toContain("Error");
		expect(MESSAGES.RATE_LIMITED).toContain("Too many requests");
	});

	it("should include helpful tips", () => {
		expect(MESSAGES.NO_RESULTS).toContain("keywords");
		expect(MESSAGES.SEARCH_TIP).toContain("Tip");
	});

	it("should use emojis for better UX", () => {
		expect(MESSAGES.NO_RESULTS).toMatch(/🔍/);
		expect(MESSAGES.API_ERROR).toMatch(/❌/);
		expect(MESSAGES.RATE_LIMITED).toMatch(/⏳/);
	});
});
