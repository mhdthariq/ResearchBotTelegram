/**
 * Features Module Index
 *
 * Re-exports all feature modules for cleaner imports.
 *
 * @example
 * import { addBookmark, recordSearch, formatHistoryMessage } from "./features/index.js";
 */

// Bookmarks feature
export {
	addBookmark,
	bookmarkToBibTeX,
	checkBookmarked,
	createBookmarksKeyboard,
	createPaperActionsKeyboard,
	exportAllBookmarksToBibTeX,
	formatBookmarkMessage,
	formatBookmarksListMessage,
	getBookmarksPaginated,
	removeBookmark,
	toggleBookmark,
} from "./bookmarks.js";

// Search history feature
export {
	clearHistory,
	createHistoryKeyboard,
	createRecentSearchesKeyboard,
	formatHistoryEntry,
	formatHistoryMessage,
	formatRecentSearchesMessage,
	formatTopSearchesMessage,
	getRecentSearches,
	getSearchHistoryPaginated,
	getSearchStats,
	getTopSearches,
	recordSearch,
} from "./searchHistory.js";
