/**
 * Search History Repository
 *
 * Handles all database operations related to search history.
 * Provides methods for tracking and retrieving user search queries.
 */

import { desc, eq } from "drizzle-orm";
import { logger } from "../../utils/logger.js";
import { db } from "../index.js";
import {
	type NewSearchHistoryEntry,
	type SearchHistoryEntry,
	searchHistory,
} from "../schema.js";

/**
 * Add a search query to history
 */
export async function addSearchToHistory(
	userId: number,
	query: string,
	resultsCount: number,
): Promise<SearchHistoryEntry | null> {
	try {
		const newEntry: NewSearchHistoryEntry = {
			userId,
			query: query.trim(),
			resultsCount,
		};

		const result = await db.insert(searchHistory).values(newEntry).returning();

		logger.debug("Added search to history", {
			userId,
			query,
			resultsCount,
		});

		return result[0] || null;
	} catch (error) {
		logger.error("Error adding search to history", {
			userId,
			query,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Get search history for a user
 */
export async function getUserSearchHistory(
	userId: number,
	options?: {
		limit?: number;
		offset?: number;
	},
): Promise<SearchHistoryEntry[]> {
	try {
		const limit = options?.limit ?? 10;
		const offset = options?.offset ?? 0;

		const result = await db
			.select()
			.from(searchHistory)
			.where(eq(searchHistory.userId, userId))
			.orderBy(desc(searchHistory.createdAt))
			.limit(limit)
			.offset(offset);

		return result;
	} catch (error) {
		logger.error("Error getting user search history", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}

/**
 * Get recent unique searches for a user (no duplicates)
 */
export async function getRecentUniqueSearches(
	userId: number,
	limit = 10,
): Promise<string[]> {
	try {
		const history = await db
			.select()
			.from(searchHistory)
			.where(eq(searchHistory.userId, userId))
			.orderBy(desc(searchHistory.createdAt))
			.limit(limit * 2); // Get more to account for duplicates

		// Deduplicate and limit
		const uniqueQueries = [...new Set(history.map((h) => h.query))];
		return uniqueQueries.slice(0, limit);
	} catch (error) {
		logger.error("Error getting recent unique searches", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}

/**
 * Get total search count for a user
 */
export async function getUserSearchCount(userId: number): Promise<number> {
	try {
		const result = await db
			.select()
			.from(searchHistory)
			.where(eq(searchHistory.userId, userId));

		return result.length;
	} catch (error) {
		logger.error("Error getting user search count", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		return 0;
	}
}

/**
 * Clear all search history for a user
 */
export async function clearUserSearchHistory(userId: number): Promise<boolean> {
	try {
		await db.delete(searchHistory).where(eq(searchHistory.userId, userId));

		logger.info("Cleared search history", { userId });

		return true;
	} catch (error) {
		logger.error("Error clearing search history", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		return false;
	}
}

/**
 * Delete a specific search history entry
 */
export async function deleteSearchHistoryEntry(
	entryId: number,
): Promise<boolean> {
	try {
		// Check if entry exists first
		const existing = await db
			.select()
			.from(searchHistory)
			.where(eq(searchHistory.id, entryId))
			.limit(1);

		if (existing.length === 0) {
			return false;
		}

		await db.delete(searchHistory).where(eq(searchHistory.id, entryId));

		return true;
	} catch (error) {
		logger.error("Error deleting search history entry", {
			entryId,
			error: error instanceof Error ? error.message : String(error),
		});
		return false;
	}
}

/**
 * Get most popular searches for a user
 */
export async function getMostSearchedQueries(
	userId: number,
	limit = 5,
): Promise<{ query: string; count: number }[]> {
	try {
		const history = await db
			.select()
			.from(searchHistory)
			.where(eq(searchHistory.userId, userId));

		// Count occurrences of each query
		const queryCounts = history.reduce(
			(acc, entry) => {
				acc[entry.query] = (acc[entry.query] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		// Sort by count and return top N
		return Object.entries(queryCounts)
			.map(([query, count]) => ({ query, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, limit);
	} catch (error) {
		logger.error("Error getting most searched queries", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}
