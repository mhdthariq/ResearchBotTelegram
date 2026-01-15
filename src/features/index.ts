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
	bookmarkToCSVRow,
	checkBookmarked,
	createBookmarksKeyboard,
	createPaperActionsKeyboard,
	exportAllBookmarksToBibTeX,
	exportAllBookmarksToCSV,
	formatBookmarkMessage,
	formatBookmarksListMessage,
	getBookmarksPaginated,
	getCSVHeader,
	getExportBookmarkCount,
	removeBookmark,
	toggleBookmark,
} from "./bookmarks.js";
// Recommendations feature
export {
	extractKeywords,
	getComprehensiveRecommendations,
	getPapersBySameAuthors,
	getRecentInCategory,
	getSimilarPapers,
	getSimilarPapersById,
} from "./recommendations.js";
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
// Subscriptions feature
export {
	createIntervalKeyboard,
	createSubscriptionSettingsKeyboard,
	createSubscriptionsKeyboard,
	formatSubscription,
	formatSubscriptionsMessage,
	getSubscriptionsList,
	parseSubscribeArgs,
	SUBSCRIPTION_INTERVALS,
	subscribe,
	unsubscribe,
	updateInterval,
} from "./subscriptions.js";
