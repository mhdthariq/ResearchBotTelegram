/**
 * Bookmark Repository
 *
 * Handles all database operations related to bookmarks.
 * Provides methods for creating, reading, updating, and deleting bookmarks.
 */

import { and, desc, eq } from "drizzle-orm";
import { logger } from "../../utils/logger.js";
import { db } from "../index.js";
import { type Bookmark, bookmarks, type NewBookmark } from "../schema.js";

/**
 * Create a new bookmark for a user
 */
export async function createBookmark(
	userId: number,
	paper: {
		arxivId: string;
		title: string;
		authors?: string[];
		summary?: string;
		link: string;
		categories?: string[];
		publishedDate?: string;
		notes?: string;
	},
): Promise<Bookmark | null> {
	try {
		const newBookmark: NewBookmark = {
			userId,
			arxivId: paper.arxivId,
			title: paper.title,
			authors: paper.authors ? JSON.stringify(paper.authors) : null,
			summary: paper.summary,
			link: paper.link,
			categories: paper.categories ? JSON.stringify(paper.categories) : null,
			publishedDate: paper.publishedDate,
			notes: paper.notes,
		};

		const result = await db.insert(bookmarks).values(newBookmark).returning();

		logger.info("Created bookmark", {
			userId,
			arxivId: paper.arxivId,
			bookmarkId: result[0]?.id,
		});

		return result[0] || null;
	} catch (error) {
		// Handle unique constraint violation (already bookmarked)
		if (
			error instanceof Error &&
			error.message.includes("UNIQUE constraint failed")
		) {
			logger.debug("Bookmark already exists", {
				userId,
				arxivId: paper.arxivId,
			});
			return null;
		}

		logger.error("Error creating bookmark", {
			userId,
			arxivId: paper.arxivId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Find a bookmark by ID
 */
export async function findBookmarkById(id: number): Promise<Bookmark | null> {
	try {
		const result = await db
			.select()
			.from(bookmarks)
			.where(eq(bookmarks.id, id))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		logger.error("Error finding bookmark by id", {
			id,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Find a bookmark by user and arXiv ID
 */
export async function findBookmarkByArxivId(
	userId: number,
	arxivId: string,
): Promise<Bookmark | null> {
	try {
		const result = await db
			.select()
			.from(bookmarks)
			.where(and(eq(bookmarks.userId, userId), eq(bookmarks.arxivId, arxivId)))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		logger.error("Error finding bookmark by arxivId", {
			userId,
			arxivId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Check if a paper is bookmarked by a user
 */
export async function isBookmarked(
	userId: number,
	arxivId: string,
): Promise<boolean> {
	const bookmark = await findBookmarkByArxivId(userId, arxivId);
	return bookmark !== null;
}

/**
 * Get all bookmarks for a user
 */
export async function getUserBookmarks(
	userId: number,
	options?: {
		limit?: number;
		offset?: number;
	},
): Promise<Bookmark[]> {
	try {
		let query = db
			.select()
			.from(bookmarks)
			.where(eq(bookmarks.userId, userId))
			.orderBy(desc(bookmarks.createdAt));

		if (options?.limit) {
			query = query.limit(options.limit) as typeof query;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as typeof query;
		}

		return await query;
	} catch (error) {
		logger.error("Error getting user bookmarks", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}

/**
 * Get bookmark count for a user
 */
export async function getUserBookmarkCount(userId: number): Promise<number> {
	try {
		const result = await db
			.select()
			.from(bookmarks)
			.where(eq(bookmarks.userId, userId));

		return result.length;
	} catch (error) {
		logger.error("Error getting bookmark count", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		return 0;
	}
}

/**
 * Update bookmark notes
 */
export async function updateBookmarkNotes(
	bookmarkId: number,
	notes: string,
): Promise<Bookmark | null> {
	try {
		const result = await db
			.update(bookmarks)
			.set({ notes })
			.where(eq(bookmarks.id, bookmarkId))
			.returning();

		return result[0] || null;
	} catch (error) {
		logger.error("Error updating bookmark notes", {
			bookmarkId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(bookmarkId: number): Promise<boolean> {
	try {
		// Check if bookmark exists first
		const existing = await findBookmarkById(bookmarkId);
		if (!existing) {
			return false;
		}

		await db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId));

		// Verify deletion
		const stillExists = await findBookmarkById(bookmarkId);
		return stillExists === null;
	} catch (error) {
		logger.error("Error deleting bookmark", {
			bookmarkId,
			error: error instanceof Error ? error.message : String(error),
		});
		return false;
	}
}

/**
 * Delete a bookmark by user and arXiv ID
 */
export async function deleteBookmarkByArxivId(
	userId: number,
	arxivId: string,
): Promise<boolean> {
	try {
		// Check if bookmark exists first
		const existing = await findBookmarkByArxivId(userId, arxivId);
		if (!existing) {
			return false;
		}

		await db
			.delete(bookmarks)
			.where(and(eq(bookmarks.userId, userId), eq(bookmarks.arxivId, arxivId)));

		// Verify deletion
		const stillExists = await findBookmarkByArxivId(userId, arxivId);
		return stillExists === null;
	} catch (error) {
		logger.error("Error deleting bookmark by arxivId", {
			userId,
			arxivId,
			error: error instanceof Error ? error.message : String(error),
		});
		return false;
	}
}

/**
 * Get bookmark authors as an array
 */
export function getBookmarkAuthors(bookmark: Bookmark): string[] {
	if (!bookmark.authors) {
		return [];
	}

	try {
		return JSON.parse(bookmark.authors);
	} catch {
		// If it's not JSON, try comma-separated
		return bookmark.authors.split(",").map((a) => a.trim());
	}
}

/**
 * Get bookmark categories as an array
 */
export function getBookmarkCategories(bookmark: Bookmark): string[] {
	if (!bookmark.categories) {
		return [];
	}

	try {
		return JSON.parse(bookmark.categories);
	} catch {
		return [];
	}
}
