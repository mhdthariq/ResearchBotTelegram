/**
 * Paper View Repository
 *
 * Handles database operations for tracking which papers users have viewed.
 * Used to filter out already-seen papers from search results and subscription updates.
 */

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { logger } from "../../utils/logger.js";
import { getDb, isDatabaseAvailable } from "../index.js";
import { type NewPaperView, type PaperView, paperViews } from "../schema.js";

/**
 * Mark a paper as viewed by a user
 *
 * @param userId - User ID
 * @param arxivId - arXiv paper ID
 * @returns Created paper view or null on failure/duplicate
 */
export async function markPaperAsViewed(
	userId: number,
	arxivId: string,
): Promise<PaperView | null> {
	if (!isDatabaseAvailable()) {
		logger.warn("Database not available for markPaperAsViewed");
		return null;
	}

	try {
		const db = getDb();
		// Use INSERT OR IGNORE to handle duplicates gracefully
		const result = await db
			.insert(paperViews)
			.values({
				userId,
				arxivId,
			})
			.onConflictDoNothing()
			.returning();

		return result[0] ?? null;
	} catch (error) {
		logger.error("Failed to mark paper as viewed", {
			error: error instanceof Error ? error.message : String(error),
			userId,
			arxivId,
		});
		return null;
	}
}

/**
 * Mark multiple papers as viewed by a user
 *
 * @param userId - User ID
 * @param arxivIds - Array of arXiv paper IDs
 * @returns Number of papers marked as viewed
 */
export async function markPapersAsViewed(
	userId: number,
	arxivIds: string[],
): Promise<number> {
	if (!isDatabaseAvailable() || arxivIds.length === 0) {
		return 0;
	}

	try {
		const db = getDb();
		const values: NewPaperView[] = arxivIds.map((arxivId) => ({
			userId,
			arxivId,
		}));

		const result = await db
			.insert(paperViews)
			.values(values)
			.onConflictDoNothing()
			.returning();

		return result.length;
	} catch (error) {
		logger.error("Failed to mark papers as viewed", {
			error: error instanceof Error ? error.message : String(error),
			userId,
			count: arxivIds.length,
		});
		return 0;
	}
}

/**
 * Check if a user has viewed a specific paper
 *
 * @param userId - User ID
 * @param arxivId - arXiv paper ID
 * @returns True if the paper has been viewed
 */
export async function hasViewedPaper(
	userId: number,
	arxivId: string,
): Promise<boolean> {
	if (!isDatabaseAvailable()) {
		return false;
	}

	try {
		const db = getDb();
		const result = await db
			.select({ id: paperViews.id })
			.from(paperViews)
			.where(
				and(eq(paperViews.userId, userId), eq(paperViews.arxivId, arxivId)),
			)
			.limit(1);

		return result.length > 0;
	} catch (error) {
		logger.error("Failed to check if paper was viewed", {
			error: error instanceof Error ? error.message : String(error),
			userId,
			arxivId,
		});
		return false;
	}
}

/**
 * Get viewed paper IDs for a user from a list of paper IDs
 * Useful for filtering search results
 *
 * @param userId - User ID
 * @param arxivIds - Array of arXiv paper IDs to check
 * @returns Set of arXiv IDs that have been viewed
 */
export async function getViewedPaperIds(
	userId: number,
	arxivIds: string[],
): Promise<Set<string>> {
	if (!isDatabaseAvailable() || arxivIds.length === 0) {
		return new Set();
	}

	try {
		const db = getDb();
		const result = await db
			.select({ arxivId: paperViews.arxivId })
			.from(paperViews)
			.where(
				and(
					eq(paperViews.userId, userId),
					inArray(paperViews.arxivId, arxivIds),
				),
			);

		return new Set(result.map((r) => r.arxivId));
	} catch (error) {
		logger.error("Failed to get viewed paper IDs", {
			error: error instanceof Error ? error.message : String(error),
			userId,
			count: arxivIds.length,
		});
		return new Set();
	}
}

/**
 * Get recent paper views for a user
 *
 * @param userId - User ID
 * @param limit - Maximum number of results (default: 50)
 * @returns Array of paper views sorted by most recent
 */
export async function getRecentViews(
	userId: number,
	limit = 50,
): Promise<PaperView[]> {
	if (!isDatabaseAvailable()) {
		return [];
	}

	try {
		const db = getDb();
		return await db
			.select()
			.from(paperViews)
			.where(eq(paperViews.userId, userId))
			.orderBy(desc(paperViews.viewedAt))
			.limit(limit);
	} catch (error) {
		logger.error("Failed to get recent views", {
			error: error instanceof Error ? error.message : String(error),
			userId,
		});
		return [];
	}
}

/**
 * Get count of papers viewed by a user
 *
 * @param userId - User ID
 * @returns Total count of viewed papers
 */
export async function getViewCount(userId: number): Promise<number> {
	if (!isDatabaseAvailable()) {
		return 0;
	}

	try {
		const db = getDb();
		const result = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(paperViews)
			.where(eq(paperViews.userId, userId));

		return result[0]?.count ?? 0;
	} catch (error) {
		logger.error("Failed to get view count", {
			error: error instanceof Error ? error.message : String(error),
			userId,
		});
		return 0;
	}
}

/**
 * Delete a paper view (mark as unread)
 *
 * @param userId - User ID
 * @param arxivId - arXiv paper ID
 * @returns True if deleted
 */
export async function deletePaperView(
	userId: number,
	arxivId: string,
): Promise<boolean> {
	if (!isDatabaseAvailable()) {
		return false;
	}

	try {
		const db = getDb();
		const result = await db
			.delete(paperViews)
			.where(
				and(eq(paperViews.userId, userId), eq(paperViews.arxivId, arxivId)),
			)
			.returning();

		return result.length > 0;
	} catch (error) {
		logger.error("Failed to delete paper view", {
			error: error instanceof Error ? error.message : String(error),
			userId,
			arxivId,
		});
		return false;
	}
}

/**
 * Clear all paper views for a user
 *
 * @param userId - User ID
 * @returns Number of views deleted
 */
export async function clearAllViews(userId: number): Promise<number> {
	if (!isDatabaseAvailable()) {
		return 0;
	}

	try {
		const db = getDb();
		const result = await db
			.delete(paperViews)
			.where(eq(paperViews.userId, userId))
			.returning();

		logger.info("Cleared all paper views for user", {
			userId,
			count: result.length,
		});

		return result.length;
	} catch (error) {
		logger.error("Failed to clear all views", {
			error: error instanceof Error ? error.message : String(error),
			userId,
		});
		return 0;
	}
}

/**
 * Get papers viewed since a specific date
 * Useful for subscription updates to filter out recently viewed papers
 *
 * @param userId - User ID
 * @param since - ISO date string
 * @returns Array of arXiv IDs viewed since the date
 */
export async function getViewedSince(
	userId: number,
	since: string,
): Promise<string[]> {
	if (!isDatabaseAvailable()) {
		return [];
	}

	try {
		const db = getDb();
		const result = await db
			.select({ arxivId: paperViews.arxivId })
			.from(paperViews)
			.where(
				and(
					eq(paperViews.userId, userId),
					sql`${paperViews.viewedAt} >= ${since}`,
				),
			);

		return result.map((r) => r.arxivId);
	} catch (error) {
		logger.error("Failed to get views since date", {
			error: error instanceof Error ? error.message : String(error),
			userId,
			since,
		});
		return [];
	}
}

/**
 * Get total view count across all users (admin stats)
 *
 * @returns Total view count
 */
export async function getTotalViewCount(): Promise<number> {
	if (!isDatabaseAvailable()) {
		return 0;
	}

	try {
		const db = getDb();
		const result = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(paperViews);

		return result[0]?.count ?? 0;
	} catch (error) {
		logger.error("Failed to get total view count", {
			error: error instanceof Error ? error.message : String(error),
		});
		return 0;
	}
}
