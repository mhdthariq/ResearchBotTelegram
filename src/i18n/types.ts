/**
 * Shared types for internationalization (i18n) module
 */

/**
 * Supported language codes
 */
export type LanguageCode =
	| "en"
	| "es"
	| "zh"
	| "ru"
	| "pt"
	| "fr"
	| "de"
	| "ja";

/**
 * Default language when user's language is not supported
 */
export const DEFAULT_LANGUAGE: LanguageCode = "en";

/**
 * Translation keys organized by category
 */
export interface Translations {
	// General
	welcome: string;
	help: string;
	error: string;
	success: string;
	loading: string;
	cancel: string;

	// Commands
	commands: {
		start: string;
		help: string;
		search: string;
		more: string;
		bookmarks: string;
		history: string;
		stats: string;
		categories: string;
		author: string;
		export: string;
		subscribe: string;
		subscriptions: string;
		unsubscribe: string;
		similar: string;
	};

	// Search
	search: {
		prompt: string;
		noResults: string;
		results: string;
		loadMore: string;
		newSearch: string;
		tip: string;
		searching: string;
	};

	// Papers
	papers: {
		title: string;
		authors: string;
		published: string;
		abstract: string;
		categories: string;
		viewPdf: string;
		viewArxiv: string;
		moreAuthors: string;
	};

	// Bookmarks
	bookmarks: {
		title: string;
		empty: string;
		added: string;
		removed: string;
		exists: string;
		exportTitle: string;
		exportEmpty: string;
	};

	// History
	history: {
		title: string;
		empty: string;
		cleared: string;
		clearConfirm: string;
	};

	// Subscriptions
	subscriptions: {
		title: string;
		empty: string;
		created: string;
		deleted: string;
		updated: string;
		prompt: string;
		interval: string;
		manage: string;
	};

	// Errors
	errors: {
		apiError: string;
		rateLimited: string;
		invalidCommand: string;
		invalidInput: string;
		notFound: string;
		unauthorized: string;
		tryAgain: string;
	};

	// Buttons
	buttons: {
		previous: string;
		next: string;
		bookmark: string;
		unbookmark: string;
		details: string;
		similar: string;
		bibtex: string;
		back: string;
		confirm: string;
		settings: string;
	};

	// Stats
	stats: {
		title: string;
		searches: string;
		uniqueQueries: string;
		bookmarksCount: string;
		subscriptionsCount: string;
	};

	// Categories
	categories: {
		title: string;
		select: string;
	};

	// Time
	time: {
		hours: string;
		days: string;
		weeks: string;
	};
}

/**
 * Language display names
 */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
	en: "English",
	es: "Español",
	zh: "中文",
	ru: "Русский",
	pt: "Português",
	fr: "Français",
	de: "Deutsch",
	ja: "日本語",
};
