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

/**
 * Escape a value for CSV format
 * Handles quotes, commas, and newlines
 */
function escapeCSVValue(value: string): string {
	if (!value) return "";

	// If the value contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
	if (value.includes('"') || value.includes(",") || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}

	return value;
}

/**
 * Convert a bookmark to CSV row
 *
 * @param bookmark - Bookmark to convert
 * @returns CSV row string
 */
export function bookmarkToCSVRow(bookmark: Bookmark): string {
	const authors = getBookmarkAuthors(bookmark);
	const arxivId = extractArxivId(bookmark.link) || "";
	const categories = bookmark.categories
		? JSON.parse(bookmark.categories).join("; ")
		: "";

	const fields = [
		escapeCSVValue(arxivId),
		escapeCSVValue(bookmark.title),
		escapeCSVValue(authors.join("; ")),
		escapeCSVValue(bookmark.publishedDate || ""),
		escapeCSVValue(categories),
		escapeCSVValue(bookmark.link),
		escapeCSVValue(bookmark.summary || ""),
	];

	return fields.join(",");
}

/**
 * Get CSV header row
 */
export function getCSVHeader(): string {
	return "arXiv ID,Title,Authors,Published Date,Categories,URL,Abstract";
}

/**
 * Export all bookmarks to CSV format
 *
 * @param userId - Database user ID
 * @returns CSV string with all bookmarks
 */
export async function exportAllBookmarksToCSV(userId: number): Promise<string> {
	const bookmarks = await getUserBookmarks(userId, { limit: 1000 });

	if (bookmarks.length === 0) {
		return "";
	}

	const header = getCSVHeader();
	const rows = bookmarks.map(bookmarkToCSVRow);

	return [header, ...rows].join("\n");
}

/**
 * Get bookmark count for a user (for export preview)
 *
 * @param userId - Database user ID
 * @returns Number of bookmarks
 */
export async function getExportBookmarkCount(userId: number): Promise<number> {
	return getUserBookmarkCount(userId);
}

/**
 * Format BibTeX preview for Telegram message
 * Shows first few entries as code block
 *
 * @param bibtexContent - Full BibTeX content
 * @param maxEntries - Maximum number of entries to show (default 2)
 * @returns Formatted preview string
 */
export function formatBibTeXPreview(
	bibtexContent: string,
	maxEntries = 2,
): string {
	if (!bibtexContent) return "";

	// Split by @article entries
	const entries = bibtexContent.split(/(?=@article\{)/);
	const validEntries = entries.filter((e) => e.trim().startsWith("@article"));

	if (validEntries.length === 0) return "";

	const previewEntries = validEntries.slice(0, maxEntries);
	const preview = previewEntries.join("\n\n");

	const moreCount = validEntries.length - maxEntries;
	const moreText =
		moreCount > 0 ? `\n\n... and ${moreCount} more entries in file` : "";

	return `\`\`\`\n${preview}\n\`\`\`${moreText}`;
}

/**
 * Format CSV as a simple table preview for Telegram
 * Shows a condensed view of bookmarks
 *
 * @param userId - Database user ID
 * @param maxRows - Maximum number of rows to show (default 5)
 * @returns Formatted table string
 */
export async function formatCSVTablePreview(
	userId: number,
	maxRows = 5,
): Promise<string> {
	const bookmarks = await getUserBookmarks(userId, { limit: maxRows + 1 });

	if (bookmarks.length === 0) return "";

	const rows: string[] = [];

	// Header
	rows.push("📊 *Preview:*");
	rows.push("");

	// Table rows (simplified for Telegram)
	const displayBookmarks = bookmarks.slice(0, maxRows);
	for (let i = 0; i < displayBookmarks.length; i++) {
		const b = displayBookmarks[i];
		if (!b) continue;

		const arxivId = extractArxivId(b.link) || "N/A";
		const title =
			b.title.length > 40 ? `${b.title.substring(0, 37)}...` : b.title;
		const authors = getBookmarkAuthors(b);
		const authorStr =
			authors.length > 0
				? authors[0]?.split(" ").pop() || "Unknown"
				: "Unknown";

		rows.push(`${i + 1}. *${arxivId}*`);
		rows.push(`   ${title}`);
		rows.push(`   👤 ${authorStr}${authors.length > 1 ? " et al." : ""}`);
		rows.push("");
	}

	const moreCount = bookmarks.length > maxRows ? bookmarks.length - maxRows : 0;
	if (moreCount > 0) {
		rows.push(`_... and more in the file_`);
	}

	return rows.join("\n");
}
