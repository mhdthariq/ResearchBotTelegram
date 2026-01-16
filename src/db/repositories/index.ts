/**
 * Database Repositories Index
 *
 * Re-exports all repository functions for cleaner imports.
 *
 * @example
 * import { findOrCreateUser, createBookmark, addSearchToHistory } from "./db/repositories/index.js";
 */

// Re-export types from schema
export type {
	AnalyticsEvent,
	Bookmark,
	NewAnalyticsEvent,
	NewBookmark,
	NewPaperView,
	NewSearchHistoryEntry,
	NewSubscription,
	NewUser,
	PaperView,
	SearchHistoryEntry,
	Subscription,
	User,
} from "../schema.js";

// Bookmark repository
export {
	createBookmark,
	deleteBookmark,
	deleteBookmarkByArxivId,
	findBookmarkByArxivId,
	findBookmarkById,
	getBookmarkAuthors,
	getBookmarkCategories,
	getUserBookmarkCount,
	getUserBookmarks,
	isBookmarked,
	updateBookmarkNotes,
} from "./bookmarkRepository.js";
// Paper view repository (read/unread tracking)
export {
	clearAllViews,
	deletePaperView,
	getRecentViews,
	getTotalViewCount,
	getViewCount,
	getViewedPaperIds,
	getViewedSince,
	hasViewedPaper,
	markPaperAsViewed,
	markPapersAsViewed,
} from "./paperViewRepository.js";
// Search history repository
export {
	addSearchToHistory,
	clearUserSearchHistory,
	deleteSearchHistoryEntry,
	getMostSearchedQueries,
	getRecentUniqueSearches,
	getUserSearchCount,
	getUserSearchHistory,
} from "./searchHistoryRepository.js";
// Subscription repository
export {
	createSubscription,
	deactivateSubscription,
	deleteSubscription,
	deleteSubscriptionByTopic,
	findSubscription,
	getAllSubscriptions,
	getDueSubscriptions,
	getSubscriptionById,
	getTotalSubscriptionCount,
	getUserSubscriptionCount,
	getUserSubscriptions,
	isSubscribed,
	reactivateSubscription,
	updateSubscription,
	updateSubscriptionLastRun,
} from "./subscriptionRepository.js";
// User repository
export {
	deleteUser,
	findOrCreateUser,
	findUserByChatId,
	findUserById,
	getUserCount,
	getUserPreferredCategories,
	updateUserLastActive,
	updateUserPreferences,
} from "./userRepository.js";
