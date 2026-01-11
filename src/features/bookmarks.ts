/**
 * Bookmarks Feature
 *
 * Provides functionality for users to bookmark/save papers for later reference.
 * Includes commands for adding, viewing, and removing bookmarks.
 */

import { InlineKeyboard } from "gramio";
import type { Paper } from "../arxiv.js";
import {
	createBookmark,
	deleteBookmarkByArxivId,
	findBookmarkByArxivId,
	getBookmarkAuthors,
	getUserBookmarkCount,
	getUserBookmarks,
	isBookmarked,
} from "../db/repositories/index.js";
import type { Bookmark } from "../db/schema.js";
import { extractArxivId, toBibTeX } from "../utils/export.js";
import { logger } from "../utils/logger.js";

/**
 * Add a paper to user's bookmarks
 *
 * @param userId - Database user ID
 * @param paper - Paper to bookmark
 * @returns The created bookmark or null if failed/already exists
 */
export async function addBookmark(
	userId: number,
	paper: Paper,
): Promise<Bookmark | null> {
	const arxivId = extractArxivId(paper.link);
	if (!arxivId) {
		logger.warn("Could not extract arXiv ID from paper link", {
			link: paper.link,
		});
		return null;
	}

	// Check if already bookmarked
	const existing = await findBookmarkByArxivId(userId, arxivId);
	if (existing) {
		logger.debug("Paper already bookmarked", { userId, arxivId });
		return existing;
	}

	return createBookmark(userId, {
		arxivId,
		title: paper.title,
		authors: paper.authors,
		summary: paper.summary,
		link: paper.link,
		categories: paper.categories,
		publishedDate: paper.published,
	});
}

/**
 * Remove a paper from user's bookmarks
 *
 * @param userId - Database user ID
 * @param arxivId - arXiv ID of the paper to remove
 * @returns true if removed, false otherwise
 */
export async function removeBookmark(
	userId: number,
	arxivId: string,
): Promise<boolean> {
	return deleteBookmarkByArxivId(userId, arxivId);
}

/**
 * Toggle bookmark status for a paper
 *
 * @param userId - Database user ID
 * @param paper - Paper to toggle bookmark for
 * @returns Object with new status and bookmark (if added)
 */
export async function toggleBookmark(
	userId: number,
	paper: Paper,
): Promise<{ isBookmarked: boolean; bookmark: Bookmark | null }> {
	const arxivId = extractArxivId(paper.link);
	if (!arxivId) {
		return { isBookmarked: false, bookmark: null };
	}

	const existing = await findBookmarkByArxivId(userId, arxivId);
	if (existing) {
		await deleteBookmarkByArxivId(userId, arxivId);
		return { isBookmarked: false, bookmark: null };
	}

	const bookmark = await addBookmark(userId, paper);
	return { isBookmarked: true, bookmark };
}

/**
 * Check if a paper is bookmarked by a user
 *
 * @param userId - Database user ID
 * @param arxivId - arXiv ID to check
 * @returns true if bookmarked
 */
export async function checkBookmarked(
	userId: number,
	arxivId: string,
): Promise<boolean> {
	return isBookmarked(userId, arxivId);
}

/**
 * Get paginated bookmarks for a user
 *
 * @param userId - Database user ID
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Array of bookmarks
 */
export async function getBookmarksPaginated(
	userId: number,
	page = 1,
	pageSize = 5,
): Promise<{ bookmarks: Bookmark[]; total: number; hasMore: boolean }> {
	const offset = (page - 1) * pageSize;
	const bookmarks = await getUserBookmarks(userId, {
		limit: pageSize,
		offset,
	});
	const total = await getUserBookmarkCount(userId);

	return {
		bookmarks,
		total,
		hasMore: offset + bookmarks.length < total,
	};
}

/**
 * Format a bookmark for display in Telegram
 *
 * @param bookmark - Bookmark to format
 * @param index - Display index
 * @returns Formatted string
 */
export function formatBookmarkMessage(
	bookmark: Bookmark,
	index?: number,
): string {
	const prefix = index !== undefined ? `${index + 1}. ` : "";
	const authors = getBookmarkAuthors(bookmark);
	const authorStr =
		authors.length > 0 ? authors.slice(0, 2).join(", ") : "Unknown";
	const moreAuthors = authors.length > 2 ? " et al." : "";

	return `${prefix}${bookmark.title}\n👥 ${authorStr}${moreAuthors}\n📅 ${bookmark.publishedDate || "Unknown date"}\n🔗 ${bookmark.link}`;
}

/**
 * Format multiple bookmarks for display
 *
 * @param bookmarks - Array of bookmarks
 * @param startIndex - Starting index for numbering
 * @returns Formatted string
 */
export function formatBookmarksListMessage(
	bookmarks: Bookmark[],
	startIndex = 0,
): string {
	if (bookmarks.length === 0) {
		return "📚 You don't have any bookmarks yet.\n\nUse the ⭐ button when viewing papers to save them!";
	}

	return bookmarks
		.map((b, i) => formatBookmarkMessage(b, startIndex + i))
		.join("\n\n");
}

/**
 * Create keyboard for bookmark navigation
 *
 * @param page - Current page
 * @param hasMore - Whether there are more pages
 * @param total - Total number of bookmarks
 * @returns InlineKeyboard
 */
export function createBookmarksKeyboard(
	page: number,
	hasMore: boolean,
	_total: number,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	// Navigation row
	if (page > 1) {
		keyboard.text("⬅️ Previous", `bookmarks:page:${page - 1}`);
	}

	keyboard.text(`📖 ${page}`, "bookmarks:noop");

	if (hasMore) {
		keyboard.text("Next ➡️", `bookmarks:page:${page + 1}`);
	}

	keyboard.row();

	// Action row
	keyboard.text("🔍 Search", "action:search");
	keyboard.text("🗑️ Clear All", "bookmarks:clear");

	return keyboard;
}

/**
 * Create keyboard for individual bookmark actions
 *
 * @param arxivId - arXiv ID of the paper
 * @param isCurrentlyBookmarked - Whether the paper is bookmarked
 * @returns InlineKeyboard
 */
export function createPaperActionsKeyboard(
	arxivId: string,
	isCurrentlyBookmarked: boolean,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	keyboard.text("📖 Abstract", `abstract:${arxivId}`);

	if (isCurrentlyBookmarked) {
		keyboard.text("⭐ Saved", `unbookmark:${arxivId}`);
	} else {
		keyboard.text("☆ Save", `bookmark:${arxivId}`);
	}

	keyboard.row();
	keyboard.text("📥 BibTeX", `bibtex:${arxivId}`);
	keyboard.text("📄 PDF", `pdf:${arxivId}`);

	return keyboard;
}

/**
 * Generate BibTeX for a bookmark
 *
 * @param bookmark - Bookmark to convert
 * @returns BibTeX string
 */
export function bookmarkToBibTeX(bookmark: Bookmark): string {
	const authors = getBookmarkAuthors(bookmark);

	return toBibTeX({
		title: bookmark.title,
		summary: bookmark.summary || "",
		link: bookmark.link,
		published: bookmark.publishedDate || "",
		authors: authors.length > 0 ? authors : undefined,
		categories: bookmark.categories
			? JSON.parse(bookmark.categories)
			: undefined,
	});
}

/**
 * Export all bookmarks to BibTeX format
 *
 * @param userId - Database user ID
 * @returns BibTeX string with all bookmarks
 */
export async function exportAllBookmarksToBibTeX(
	userId: number,
): Promise<string> {
	const bookmarks = await getUserBookmarks(userId, { limit: 1000 });

	if (bookmarks.length === 0) {
		return "";
	}

	return bookmarks.map(bookmarkToBibTeX).join("\n\n");
}
