/**
 * Search History Feature
 *
 * Provides functionality for tracking and displaying user search history.
 * Includes commands for viewing history, repeating searches, and clearing history.
 */

import { InlineKeyboard } from "gramio";
import {
	addSearchToHistory,
	clearUserSearchHistory,
	getMostSearchedQueries,
	getRecentUniqueSearches,
	getUserSearchCount,
	getUserSearchHistory,
} from "../db/repositories/index.js";
import type { SearchHistoryEntry } from "../db/schema.js";
import { logger } from "../utils/logger.js";

/**
 * Record a search query to history
 *
 * @param userId - Database user ID
 * @param query - The search query
 * @param resultsCount - Number of results found
 * @returns The created history entry or null
 */
export async function recordSearch(
	userId: number,
	query: string,
	resultsCount: number,
): Promise<SearchHistoryEntry | null> {
	// Don't record empty queries
	if (!query || query.trim() === "") {
		return null;
	}

	const entry = await addSearchToHistory(userId, query.trim(), resultsCount);

	if (entry) {
		logger.debug("Recorded search to history", {
			userId,
			query: query.trim(),
			resultsCount,
		});
	}

	return entry;
}

/**
 * Get recent unique searches for a user
 *
 * @param userId - Database user ID
 * @param limit - Maximum number of searches to return
 * @returns Array of unique search queries
 */
export async function getRecentSearches(
	userId: number,
	limit = 10,
): Promise<string[]> {
	return getRecentUniqueSearches(userId, limit);
}

/**
 * Get full search history with pagination
 *
 * @param userId - Database user ID
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Paginated history and metadata
 */
export async function getSearchHistoryPaginated(
	userId: number,
	page = 1,
	pageSize = 10,
): Promise<{
	history: SearchHistoryEntry[];
	total: number;
	hasMore: boolean;
}> {
	const offset = (page - 1) * pageSize;
	const history = await getUserSearchHistory(userId, {
		limit: pageSize,
		offset,
	});
	const total = await getUserSearchCount(userId);

	return {
		history,
		total,
		hasMore: offset + history.length < total,
	};
}

/**
 * Get user's most frequently searched queries
 *
 * @param userId - Database user ID
 * @param limit - Maximum number of queries to return
 * @returns Array of queries with counts
 */
export async function getTopSearches(
	userId: number,
	limit = 5,
): Promise<{ query: string; count: number }[]> {
	return getMostSearchedQueries(userId, limit);
}

/**
 * Clear all search history for a user
 *
 * @param userId - Database user ID
 * @returns true if cleared successfully
 */
export async function clearHistory(userId: number): Promise<boolean> {
	const result = await clearUserSearchHistory(userId);

	if (result) {
		logger.info("Cleared search history", { userId });
	}

	return result;
}

/**
 * Format a search history entry for display
 *
 * @param entry - History entry to format
 * @param index - Display index
 * @returns Formatted string
 */
export function formatHistoryEntry(
	entry: SearchHistoryEntry,
	index?: number,
): string {
	const prefix = index !== undefined ? `${index + 1}. ` : "";
	const date = entry.createdAt
		? new Date(entry.createdAt).toLocaleDateString()
		: "Unknown date";
	const results = entry.resultsCount ?? 0;

	return `${prefix}🔍 "${entry.query}"\n   📊 ${results} results • ${date}`;
}

/**
 * Format search history for display
 *
 * @param history - Array of history entries
 * @param startIndex - Starting index for numbering
 * @returns Formatted string
 */
export function formatHistoryMessage(
	history: SearchHistoryEntry[],
	startIndex = 0,
): string {
	if (history.length === 0) {
		return "📜 No search history yet.\n\nStart searching with /search to build your history!";
	}

	const header = "📜 Search History\n\n";
	const entries = history
		.map((entry, i) => formatHistoryEntry(entry, startIndex + i))
		.join("\n\n");

	return header + entries;
}

/**
 * Format recent searches as quick-access buttons
 *
 * @param searches - Array of search queries
 * @returns Formatted string with instructions
 */
export function formatRecentSearchesMessage(searches: string[]): string {
	if (searches.length === 0) {
		return "📜 No recent searches.\n\nUse /search <topic> to search for papers!";
	}

	return "🕐 Recent Searches\n\nTap a search to run it again:\n";
}

/**
 * Create keyboard for search history navigation
 *
 * @param page - Current page
 * @param hasMore - Whether there are more pages
 * @returns InlineKeyboard
 */
export function createHistoryKeyboard(
	page: number,
	hasMore: boolean,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	// Navigation row
	if (page > 1) {
		keyboard.text("⬅️ Previous", `history:page:${page - 1}`);
	}

	keyboard.text(`📖 ${page}`, "history:noop");

	if (hasMore) {
		keyboard.text("Next ➡️", `history:page:${page + 1}`);
	}

	keyboard.row();

	// Action row
	keyboard.text("🗑️ Clear History", "history:clear");
	keyboard.text("🔍 New Search", "action:search");

	return keyboard;
}

/**
 * Create keyboard with recent searches as buttons
 *
 * @param searches - Array of recent search queries
 * @param maxButtons - Maximum number of buttons to show
 * @returns InlineKeyboard
 */
export function createRecentSearchesKeyboard(
	searches: string[],
	maxButtons = 6,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	// Add search buttons (2 per row)
	const limitedSearches = searches.slice(0, maxButtons);

	for (let i = 0; i < limitedSearches.length; i++) {
		const query = limitedSearches[i];
		if (!query) continue;
		// Truncate long queries for button text
		const buttonText =
			query.length > 20 ? `${query.substring(0, 17)}...` : query;

		keyboard.text(`🔍 ${buttonText}`, `search:repeat:${query}`);

		// New row every 2 buttons
		if (i % 2 === 1 && i < limitedSearches.length - 1) {
			keyboard.row();
		}
	}

	keyboard.row();

	// Action row
	keyboard.text("📜 Full History", "history:full");
	keyboard.text("🔍 New Search", "action:search");

	return keyboard;
}

/**
 * Format top searches for display
 *
 * @param topSearches - Array of queries with counts
 * @returns Formatted string
 */
export function formatTopSearchesMessage(
	topSearches: { query: string; count: number }[],
): string {
	if (topSearches.length === 0) {
		return "📊 No search statistics yet.";
	}

	const header = "📊 Your Top Searches\n\n";
	const entries = topSearches
		.map((item, i) => `${i + 1}. "${item.query}" (${item.count} times)`)
		.join("\n");

	return header + entries;
}

/**
 * Get search statistics for a user
 *
 * @param userId - Database user ID
 * @returns Statistics object
 */
export async function getSearchStats(userId: number): Promise<{
	totalSearches: number;
	uniqueQueries: number;
	topSearches: { query: string; count: number }[];
}> {
	const totalSearches = await getUserSearchCount(userId);
	const recentUnique = await getRecentUniqueSearches(userId, 100);
	const topSearches = await getMostSearchedQueries(userId, 5);

	return {
		totalSearches,
		uniqueQueries: recentUnique.length,
		topSearches,
	};
}
