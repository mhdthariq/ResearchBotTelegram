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
	| "ja"
	| "ar"
	| "id";

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
		noMorePapers: string;
		useSearchFirst: string;
		loadingMore: string;
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
		similarPapers: string;
		noSimilarFound: string;
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
		total: string;
		searchButton: string;
		clearAllButton: string;
		alreadyBookmarked: string;
		couldNotLoad: string;
		viewBookmarks: string;
		saveButton: string;
		savedButton: string;
	};

	// History
	history: {
		title: string;
		empty: string;
		cleared: string;
		clearConfirm: string;
		recentSearches: string;
		tapToSearch: string;
		fullHistory: string;
		clearHistory: string;
		newSearch: string;
		noHistory: string;
		startSearching: string;
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
		addSubscription: string;
		noSubscriptions: string;
		useSubscribe: string;
		settings: string;
		topic: string;
		category: string;
		selectToRemove: string;
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
		couldNotProcess: string;
		couldNotFetch: string;
		couldNotSave: string;
		couldNotExport: string;
		couldNotSend: string;
		invalidExportFormat: string;
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
		search: string;
		searchPapers: string;
		loadMore: string;
		abstract: string;
		pdf: string;
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
		browseByCategory: string;
	};

	// Time
	time: {
		hours: string;
		days: string;
		weeks: string;
	};

	// Language settings
	language: {
		title: string;
		current: string;
		select: string;
		changed: string;
		unavailable: string;
	};

	// Main menu
	menu: {
		welcome: string;
		description: string;
		whatICan: string;
		searchDesc: string;
		bookmarkDesc: string;
		historyDesc: string;
		exportDesc: string;
		useButtons: string;
		currentLanguage: string;
		searchPapers: string;
		myBookmarks: string;
		history: string;
		help: string;
	};

	// Help page
	helpPage: {
		title: string;
		searchCommands: string;
		searchTopic: string;
		searchAuthor: string;
		browseCategory: string;
		findSimilar: string;
		historyBookmarks: string;
		viewBookmarks: string;
		savePaper: string;
		viewHistory: string;
		viewStats: string;
		exportBibtex: string;
		subscriptionsTitle: string;
		subscribeTopic: string;
		manageSubscriptions: string;
		unsubscribeTopic: string;
		loadMore: string;
	};

	// Export
	export: {
		title: string;
		cancelled: string;
		selectFormat: string;
		generating: string;
		downloadReady: string;
		fileCaption: string;
	};

	// Save paper
	save: {
		title: string;
		usage: string;
		example: string;
		tip: string;
		fetching: string;
		success: string;
	};

	// Author search
	author: {
		usage: string;
		example: string;
		prompt: string;
		searching: string;
		results: string;
		noResults: string;
	};

	// Similar papers
	similar: {
		usage: string;
		example: string;
		hint: string;
		searching: string;
		notFound: string;
		noResults: string;
		title: string;
	};

	// Callback messages
	callbacks: {
		tooManyRequests: string;
		pleaseStartFirst: string;
		userNotFound: string;
		subscriptionNotFound: string;
		couldNotFetchPaper: string;
		clearBookmarksHint: string;
		intervalUpdated: string;
	};

	// Category browsing
	categoryBrowse: {
		loading: string;
		noResults: string;
	};

	// Inline query
	inlineQuery: {
		typeToSearch: string;
		searchDescription: string;
		helpMessage: string;
		noResults: string;
		tryDifferent: string;
		searchFailed: string;
		tryAgain: string;
	};

	// General UI
	ui: {
		errorOccurred: string;
		paperCount: string;
		yourSubscriptions: string;
		tapToManage: string;
		settingsHeader: string;
		intervalLabel: string;
		categoryLabel: string;
		selectFrequency: string;
		exportPreparing: string;
		exportSuccess: string;
		bibtexFormat: string;
		csvFormat: string;
		forLatex: string;
		forSpreadsheets: string;
		cancelButton: string;
		viewBookmarksButton: string;
	};

	// Validation
	validation: {
		invalidArxivId: string;
		validFormats: string;
		alreadyBookmarked: string;
		useBookmarksToView: string;
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
	ar: "العربية",
	id: "Bahasa Indonesia",
};
