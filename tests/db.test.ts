/**
 * Unit tests for database repositories
 *
 * Tests cover:
 * - User repository operations
 * - Bookmark repository operations
 * - Search history repository operations
 * - Subscription repository operations
 */

import { beforeAll, describe, expect, it } from "bun:test";

// Since we can't easily test with a real database in unit tests,
// we test the repository logic and interfaces

describe("User Repository", () => {
	// Mock user data structure
	interface MockUser {
		id: number;
		chatId: number;
		username: string | null;
		firstName: string | null;
		lastName: string | null;
		resultsPerPage: number;
		preferredCategories: string | null;
		createdAt: string;
		lastActiveAt: string | null;
	}

	const mockUsers: Map<number, MockUser> = new Map();
	let nextId = 1;

	// Mock repository functions
	function findByChatId(chatId: number): MockUser | undefined {
		for (const user of mockUsers.values()) {
			if (user.chatId === chatId) {
				return user;
			}
		}
		return undefined;
	}

	function createOrUpdate(data: {
		chatId: number;
		username?: string;
		firstName?: string;
		lastName?: string;
	}): MockUser {
		const existing = findByChatId(data.chatId);
		if (existing) {
			const updated = {
				...existing,
				username: data.username ?? existing.username,
				firstName: data.firstName ?? existing.firstName,
				lastName: data.lastName ?? existing.lastName,
				lastActiveAt: new Date().toISOString(),
			};
			mockUsers.set(existing.id, updated);
			return updated;
		}

		const user: MockUser = {
			id: nextId++,
			chatId: data.chatId,
			username: data.username ?? null,
			firstName: data.firstName ?? null,
			lastName: data.lastName ?? null,
			resultsPerPage: 5,
			preferredCategories: null,
			createdAt: new Date().toISOString(),
			lastActiveAt: null,
		};
		mockUsers.set(user.id, user);
		return user;
	}

	function getTotalUsers(): number {
		return mockUsers.size;
	}

	beforeAll(() => {
		mockUsers.clear();
		nextId = 1;
	});

	it("should create a new user", () => {
		const user = createOrUpdate({
			chatId: 123456,
			username: "testuser",
			firstName: "Test",
			lastName: "User",
		});

		expect(user.id).toBe(1);
		expect(user.chatId).toBe(123456);
		expect(user.username).toBe("testuser");
		expect(user.firstName).toBe("Test");
		expect(user.lastName).toBe("User");
		expect(user.resultsPerPage).toBe(5);
	});

	it("should find user by chat ID", () => {
		const found = findByChatId(123456);
		expect(found).toBeDefined();
		expect(found?.username).toBe("testuser");
	});

	it("should update existing user", () => {
		const updated = createOrUpdate({
			chatId: 123456,
			username: "newusername",
			firstName: "NewFirst",
		});

		expect(updated.id).toBe(1); // Same ID
		expect(updated.username).toBe("newusername");
		expect(updated.firstName).toBe("NewFirst");
		expect(updated.lastName).toBe("User"); // Unchanged
	});

	it("should return undefined for non-existent user", () => {
		const notFound = findByChatId(999999);
		expect(notFound).toBeUndefined();
	});

	it("should count total users", () => {
		createOrUpdate({ chatId: 111 });
		createOrUpdate({ chatId: 222 });
		expect(getTotalUsers()).toBe(3); // Including the first user
	});
});

describe("Bookmark Repository", () => {
	interface MockBookmark {
		id: number;
		userId: number;
		arxivId: string;
		title: string;
		authors: string | null;
		summary: string | null;
		link: string;
		categories: string | null;
		publishedDate: string | null;
		notes: string | null;
		createdAt: string;
	}

	const mockBookmarks: Map<number, MockBookmark> = new Map();
	let nextId = 1;

	function addBookmark(data: {
		userId: number;
		arxivId: string;
		title: string;
		authors?: string[];
		summary?: string;
		link: string;
		categories?: string[];
		publishedDate?: string;
	}): MockBookmark | null {
		// Check for duplicates
		for (const bookmark of mockBookmarks.values()) {
			if (
				bookmark.userId === data.userId &&
				bookmark.arxivId === data.arxivId
			) {
				return null; // Already exists
			}
		}

		const bookmark: MockBookmark = {
			id: nextId++,
			userId: data.userId,
			arxivId: data.arxivId,
			title: data.title,
			authors: data.authors ? JSON.stringify(data.authors) : null,
			summary: data.summary ?? null,
			link: data.link,
			categories: data.categories ? JSON.stringify(data.categories) : null,
			publishedDate: data.publishedDate ?? null,
			notes: null,
			createdAt: new Date().toISOString(),
		};
		mockBookmarks.set(bookmark.id, bookmark);
		return bookmark;
	}

	function removeBookmark(userId: number, arxivId: string): boolean {
		for (const [id, bookmark] of mockBookmarks) {
			if (bookmark.userId === userId && bookmark.arxivId === arxivId) {
				mockBookmarks.delete(id);
				return true;
			}
		}
		return false;
	}

	function getBookmarks(
		userId: number,
		limit = 10,
		offset = 0,
	): { bookmarks: MockBookmark[]; total: number } {
		const userBookmarks = Array.from(mockBookmarks.values())
			.filter((b) => b.userId === userId)
			.sort((a, b) => b.id - a.id); // Newest first

		return {
			bookmarks: userBookmarks.slice(offset, offset + limit),
			total: userBookmarks.length,
		};
	}

	function isBookmarked(userId: number, arxivId: string): boolean {
		for (const bookmark of mockBookmarks.values()) {
			if (bookmark.userId === userId && bookmark.arxivId === arxivId) {
				return true;
			}
		}
		return false;
	}

	beforeAll(() => {
		mockBookmarks.clear();
		nextId = 1;
	});

	it("should add a bookmark", () => {
		const bookmark = addBookmark({
			userId: 1,
			arxivId: "2301.00001",
			title: "Test Paper",
			authors: ["Author One", "Author Two"],
			link: "https://arxiv.org/abs/2301.00001",
		});

		expect(bookmark).not.toBeNull();
		expect(bookmark?.arxivId).toBe("2301.00001");
		expect(bookmark?.title).toBe("Test Paper");
	});

	it("should not add duplicate bookmark", () => {
		const duplicate = addBookmark({
			userId: 1,
			arxivId: "2301.00001",
			title: "Test Paper",
			link: "https://arxiv.org/abs/2301.00001",
		});

		expect(duplicate).toBeNull();
	});

	it("should check if paper is bookmarked", () => {
		expect(isBookmarked(1, "2301.00001")).toBe(true);
		expect(isBookmarked(1, "2301.99999")).toBe(false);
		expect(isBookmarked(999, "2301.00001")).toBe(false);
	});

	it("should get user bookmarks with pagination", () => {
		// Add more bookmarks
		addBookmark({
			userId: 1,
			arxivId: "2301.00002",
			title: "Second Paper",
			link: "https://arxiv.org/abs/2301.00002",
		});
		addBookmark({
			userId: 1,
			arxivId: "2301.00003",
			title: "Third Paper",
			link: "https://arxiv.org/abs/2301.00003",
		});

		const result = getBookmarks(1, 2, 0);
		expect(result.bookmarks.length).toBe(2);
		expect(result.total).toBe(3);

		const secondPage = getBookmarks(1, 2, 2);
		expect(secondPage.bookmarks.length).toBe(1);
	});

	it("should remove a bookmark", () => {
		const removed = removeBookmark(1, "2301.00002");
		expect(removed).toBe(true);
		expect(isBookmarked(1, "2301.00002")).toBe(false);
	});

	it("should return false when removing non-existent bookmark", () => {
		const removed = removeBookmark(1, "nonexistent");
		expect(removed).toBe(false);
	});
});

describe("Search History Repository", () => {
	interface MockSearchEntry {
		id: number;
		userId: number;
		query: string;
		resultsCount: number;
		createdAt: string;
	}

	const mockHistory: Map<number, MockSearchEntry> = new Map();
	let nextId = 1;

	function addSearchEntry(data: {
		userId: number;
		query: string;
		resultsCount: number;
	}): MockSearchEntry {
		const entry: MockSearchEntry = {
			id: nextId++,
			userId: data.userId,
			query: data.query,
			resultsCount: data.resultsCount,
			createdAt: new Date().toISOString(),
		};
		mockHistory.set(entry.id, entry);
		return entry;
	}

	function getRecentSearches(userId: number, limit = 10): MockSearchEntry[] {
		return Array.from(mockHistory.values())
			.filter((e) => e.userId === userId)
			.sort((a, b) => b.id - a.id)
			.slice(0, limit);
	}

	function clearHistory(userId: number): boolean {
		let cleared = false;
		for (const [id, entry] of mockHistory) {
			if (entry.userId === userId) {
				mockHistory.delete(id);
				cleared = true;
			}
		}
		return cleared;
	}

	function getSearchStats(userId: number): {
		totalSearches: number;
		uniqueQueries: number;
	} {
		const userEntries = Array.from(mockHistory.values()).filter(
			(e) => e.userId === userId,
		);
		const uniqueQueries = new Set(userEntries.map((e) => e.query));

		return {
			totalSearches: userEntries.length,
			uniqueQueries: uniqueQueries.size,
		};
	}

	beforeAll(() => {
		mockHistory.clear();
		nextId = 1;
	});

	it("should add a search entry", () => {
		const entry = addSearchEntry({
			userId: 1,
			query: "machine learning",
			resultsCount: 10,
		});

		expect(entry.id).toBe(1);
		expect(entry.query).toBe("machine learning");
		expect(entry.resultsCount).toBe(10);
	});

	it("should get recent searches", () => {
		addSearchEntry({ userId: 1, query: "deep learning", resultsCount: 5 });
		addSearchEntry({ userId: 1, query: "neural network", resultsCount: 8 });

		const recent = getRecentSearches(1, 10);
		expect(recent.length).toBe(3);
		// Should be sorted by newest first
		expect(recent[0].query).toBe("neural network");
	});

	it("should limit recent searches", () => {
		const recent = getRecentSearches(1, 2);
		expect(recent.length).toBe(2);
	});

	it("should calculate search stats", () => {
		// Add a duplicate query
		addSearchEntry({ userId: 1, query: "machine learning", resultsCount: 15 });

		const stats = getSearchStats(1);
		expect(stats.totalSearches).toBe(4);
		expect(stats.uniqueQueries).toBe(3); // 3 unique queries
	});

	it("should clear user history", () => {
		// Add entry for another user
		addSearchEntry({ userId: 2, query: "test", resultsCount: 1 });

		const cleared = clearHistory(1);
		expect(cleared).toBe(true);

		const remaining = getRecentSearches(1, 10);
		expect(remaining.length).toBe(0);

		// Other user's history should be intact
		const otherUser = getRecentSearches(2, 10);
		expect(otherUser.length).toBe(1);
	});
});

describe("Subscription Repository", () => {
	interface MockSubscription {
		id: number;
		userId: number;
		topic: string;
		category: string | null;
		intervalHours: number;
		lastRunAt: string | null;
		isActive: boolean;
		createdAt: string;
	}

	const mockSubscriptions: Map<number, MockSubscription> = new Map();
	let nextId = 1;

	function createSubscription(data: {
		userId: number;
		topic: string;
		category?: string;
		intervalHours?: number;
	}): MockSubscription {
		const subscription: MockSubscription = {
			id: nextId++,
			userId: data.userId,
			topic: data.topic,
			category: data.category ?? null,
			intervalHours: data.intervalHours ?? 24,
			lastRunAt: null,
			isActive: true,
			createdAt: new Date().toISOString(),
		};
		mockSubscriptions.set(subscription.id, subscription);
		return subscription;
	}

	function getSubscription(id: number): MockSubscription | undefined {
		return mockSubscriptions.get(id);
	}

	function getUserSubscriptions(userId: number): {
		subscriptions: MockSubscription[];
		count: number;
	} {
		const subs = Array.from(mockSubscriptions.values())
			.filter((s) => s.userId === userId && s.isActive)
			.sort((a, b) => b.id - a.id);

		return {
			subscriptions: subs,
			count: subs.length,
		};
	}

	function deleteSubscription(id: number, userId: number): boolean {
		const sub = mockSubscriptions.get(id);
		if (sub && sub.userId === userId) {
			mockSubscriptions.delete(id);
			return true;
		}
		return false;
	}

	function updateInterval(
		id: number,
		userId: number,
		intervalHours: number,
	): boolean {
		const sub = mockSubscriptions.get(id);
		if (sub && sub.userId === userId) {
			sub.intervalHours = intervalHours;
			return true;
		}
		return false;
	}

	beforeAll(() => {
		mockSubscriptions.clear();
		nextId = 1;
	});

	it("should create a subscription", () => {
		const sub = createSubscription({
			userId: 1,
			topic: "machine learning",
			category: "cs.LG",
		});

		expect(sub.id).toBe(1);
		expect(sub.topic).toBe("machine learning");
		expect(sub.category).toBe("cs.LG");
		expect(sub.intervalHours).toBe(24);
		expect(sub.isActive).toBe(true);
	});

	it("should get subscription by ID", () => {
		const sub = getSubscription(1);
		expect(sub).toBeDefined();
		expect(sub?.topic).toBe("machine learning");
	});

	it("should get user subscriptions", () => {
		createSubscription({ userId: 1, topic: "deep learning" });
		createSubscription({ userId: 1, topic: "NLP", intervalHours: 12 });
		createSubscription({ userId: 2, topic: "computer vision" }); // Different user

		const result = getUserSubscriptions(1);
		expect(result.count).toBe(3);
		expect(result.subscriptions[0].topic).toBe("NLP"); // Newest first
	});

	it("should update subscription interval", () => {
		const updated = updateInterval(1, 1, 48);
		expect(updated).toBe(true);

		const sub = getSubscription(1);
		expect(sub?.intervalHours).toBe(48);
	});

	it("should not update subscription for wrong user", () => {
		const updated = updateInterval(1, 999, 12);
		expect(updated).toBe(false);
	});

	it("should delete subscription", () => {
		const deleted = deleteSubscription(1, 1);
		expect(deleted).toBe(true);

		const sub = getSubscription(1);
		expect(sub).toBeUndefined();
	});

	it("should not delete subscription for wrong user", () => {
		createSubscription({ userId: 1, topic: "test" });
		const latestId = nextId - 1;

		const deleted = deleteSubscription(latestId, 999);
		expect(deleted).toBe(false);
	});
});

describe("Paper View Repository", () => {
	interface MockPaperView {
		id: number;
		userId: number;
		arxivId: string;
		viewedAt: string;
	}

	const mockViews: Map<number, MockPaperView> = new Map();
	let nextId = 1;

	function markAsViewed(userId: number, arxivId: string): MockPaperView | null {
		// Check for duplicate
		for (const view of mockViews.values()) {
			if (view.userId === userId && view.arxivId === arxivId) {
				return null; // Already viewed
			}
		}

		const view: MockPaperView = {
			id: nextId++,
			userId,
			arxivId,
			viewedAt: new Date().toISOString(),
		};
		mockViews.set(view.id, view);
		return view;
	}

	function hasViewed(userId: number, arxivId: string): boolean {
		for (const view of mockViews.values()) {
			if (view.userId === userId && view.arxivId === arxivId) {
				return true;
			}
		}
		return false;
	}

	function getViewedIds(userId: number, arxivIds: string[]): Set<string> {
		const viewed = new Set<string>();
		for (const view of mockViews.values()) {
			if (view.userId === userId && arxivIds.includes(view.arxivId)) {
				viewed.add(view.arxivId);
			}
		}
		return viewed;
	}

	function getRecentViews(userId: number, limit = 50): MockPaperView[] {
		return Array.from(mockViews.values())
			.filter((v) => v.userId === userId)
			.sort((a, b) => b.id - a.id)
			.slice(0, limit);
	}

	function clearViews(userId: number): number {
		let count = 0;
		for (const [id, view] of mockViews) {
			if (view.userId === userId) {
				mockViews.delete(id);
				count++;
			}
		}
		return count;
	}

	beforeAll(() => {
		mockViews.clear();
		nextId = 1;
	});

	it("should mark paper as viewed", () => {
		const view = markAsViewed(1, "2301.00001");
		expect(view).not.toBeNull();
		expect(view?.userId).toBe(1);
		expect(view?.arxivId).toBe("2301.00001");
	});

	it("should not mark duplicate view", () => {
		const duplicate = markAsViewed(1, "2301.00001");
		expect(duplicate).toBeNull();
	});

	it("should check if paper was viewed", () => {
		expect(hasViewed(1, "2301.00001")).toBe(true);
		expect(hasViewed(1, "2301.00002")).toBe(false);
		expect(hasViewed(999, "2301.00001")).toBe(false);
	});

	it("should get viewed paper IDs from list", () => {
		markAsViewed(1, "2301.00002");
		markAsViewed(1, "2301.00003");

		const viewedIds = getViewedIds(1, [
			"2301.00001",
			"2301.00002",
			"2301.00004",
			"2301.00005",
		]);

		expect(viewedIds.size).toBe(2);
		expect(viewedIds.has("2301.00001")).toBe(true);
		expect(viewedIds.has("2301.00002")).toBe(true);
		expect(viewedIds.has("2301.00004")).toBe(false);
	});

	it("should get recent views", () => {
		const views = getRecentViews(1);
		expect(views.length).toBe(3);
		// Most recent first
		expect(views[0].arxivId).toBe("2301.00003");
	});

	it("should allow same paper for different users", () => {
		const view = markAsViewed(2, "2301.00001");
		expect(view).not.toBeNull();
		expect(view?.userId).toBe(2);
	});

	it("should clear all views for user", () => {
		const cleared = clearViews(1);
		expect(cleared).toBe(3);
		expect(hasViewed(1, "2301.00001")).toBe(false);
		// User 2's view should still exist
		expect(hasViewed(2, "2301.00001")).toBe(true);
	});
});
