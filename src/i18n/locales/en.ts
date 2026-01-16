/**
 * English Translations
 *
 * This is the default/reference translation file.
 * All other language files should have the same structure.
 */

import type { Translations } from "../types";

export const en: Translations = {
	// General
	welcome:
		"👋 Welcome to Research Bot!\n\nI help you discover and track the latest research papers from arXiv.\n\nUse /help to see available commands.",
	help: "📚 Available Commands",
	error: "❌ An error occurred",
	success: "✅ Success",
	loading: "⏳ Loading...",
	cancel: "Operation cancelled",

	// Commands
	commands: {
		start: "Start the bot and see welcome message",
		help: "Show all available commands",
		search: "Search for research papers by topic",
		more: "Load more results from current search",
		bookmarks: "View your saved papers",
		history: "View your recent search history",
		stats: "View your personal statistics",
		categories: "Browse papers by arXiv category",
		author: "Search papers by author name",
		export: "Export your bookmarks as BibTeX",
		subscribe: "Subscribe to a research topic for updates",
		subscriptions: "View and manage your subscriptions",
		unsubscribe: "Remove a topic subscription",
		similar: "Find papers similar to a given paper",
	},

	// Search
	search: {
		prompt:
			"🔍 What topic would you like to search for?\n\nType your search query or use:\n/search [topic]",
		noResults:
			"🔍 No papers found.\n\nTry different keywords or check your spelling.",
		results: "📄 Found {count} papers for '{topic}'",
		loadMore: "Load More",
		newSearch: "🔍 New Search",
		tip: '💡 Tip: Use specific terms like "transformer attention mechanism" instead of just "AI"',
		searching: "🔍 Searching for papers...",
		noMorePapers: "📭 No more papers found for this topic.",
		useSearchFirst: "Use /search first to search for papers.",
		loadingMore: '📚 Loading more papers for "{topic}"...',
	},

	// Papers
	papers: {
		title: "Title",
		authors: "Authors",
		published: "Published",
		abstract: "Abstract",
		categories: "Categories",
		viewPdf: "📄 PDF",
		viewArxiv: "🔗 arXiv",
		moreAuthors: "+{count} more",
		similarPapers: "📚 Similar Papers",
		noSimilarFound: "No similar papers found.",
	},

	// Bookmarks
	bookmarks: {
		title: "🔖 Your Bookmarks",
		empty:
			"📚 No bookmarks yet.\n\nSave papers from search results to see them here!",
		added: "✅ Paper added to bookmarks!",
		removed: "🗑️ Bookmark removed",
		exists: "📌 This paper is already bookmarked",
		exportTitle: "📚 BibTeX Export",
		exportEmpty: "📚 No bookmarks to export.\n\nSave some papers first!",
		total: "{count} total",
		searchButton: "🔍 Search",
		clearAllButton: "🗑️ Clear All",
		alreadyBookmarked:
			"📌 This paper is already in your bookmarks!\n\nUse /bookmarks to view your saved papers.",
		couldNotLoad: "❌ Could not load your bookmarks. Please try again.",
		viewBookmarks: "📚 View Bookmarks",
		saveButton: "☆ Save",
		savedButton: "⭐ Saved",
	},

	// History
	history: {
		title: "📜 Search History",
		empty: "📜 No search history yet.\n\nStart with /search to find papers!",
		cleared: "📜 Search history cleared.",
		clearConfirm: "Are you sure you want to clear your entire search history?",
		recentSearches: "🕐 Recent Searches",
		tapToSearch: "Tap a search to run it again:",
		fullHistory: "📜 Full History",
		clearHistory: "🗑️ Clear History",
		newSearch: "🔍 New Search",
		noHistory: "📜 No search history yet.",
		startSearching: "Start with /search!",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 Your Subscriptions",
		empty:
			"📭 You don't have any subscriptions yet.\n\nUse /subscribe <topic> to get periodic updates on research topics you care about.",
		created:
			"✅ Successfully subscribed to '{topic}'!\n\nYou'll receive updates on new papers.",
		deleted: "🗑️ Subscription removed successfully",
		updated: "✅ Subscription settings updated",
		prompt:
			"📬 What topic would you like to subscribe to?\n\nExample: /subscribe machine learning\nOptional category: /subscribe [cs.AI] neural networks",
		interval: "Notification interval",
		manage: "Manage",
		addSubscription: "➕ Add Subscription",
		noSubscriptions: "📭 You don't have any subscriptions.",
		useSubscribe: "Use /subscribe <topic> to get updates.",
		settings: "⚙️ Subscription Settings",
		topic: "📌 Topic",
		category: "📂 Category",
		selectToRemove: "Select a subscription to remove:",
	},

	// Errors
	errors: {
		apiError: "❌ Error fetching papers from arXiv.\n\nPlease try again later.",
		rateLimited:
			"⏳ Too many requests. Please wait {seconds} seconds before trying again.",
		invalidCommand:
			"❓ Unknown command.\n\nUse /help to see all available commands.",
		invalidInput: "❌ Invalid input.\n\nPlease check your input and try again.",
		notFound: "❌ Not found.",
		unauthorized: "🔒 You don't have permission to perform this action.",
		tryAgain: "Please try again later.",
		couldNotProcess: "❌ Could not process request. Please try again.",
		couldNotFetch: "❌ Could not fetch paper details.",
		couldNotSave: "❌ Could not save paper. Please try again.",
		couldNotExport: "❌ Could not export bookmarks. Please try again.",
		couldNotSend: "❌ Could not send export file. Please try again later.",
		invalidExportFormat: "❌ Invalid export format.",
	},

	// Buttons
	buttons: {
		previous: "⬅️ Previous",
		next: "➡️ Next",
		bookmark: "🔖 Bookmark",
		unbookmark: "🗑️ Remove Bookmark",
		details: "📋 Details",
		similar: "🔗 Similar Papers",
		bibtex: "📝 BibTeX",
		back: "⬅️ Back",
		confirm: "✅ Confirm",
		settings: "⚙️ Settings",
		search: "🔍 Search",
		searchPapers: "🔍 Search Papers",
		loadMore: "📚 Load More",
		abstract: "📖 Abstract",
		pdf: "📄 PDF",
	},

	// Stats
	stats: {
		title: "📊 Your Statistics",
		searches: "🔍 Total Searches",
		uniqueQueries: "📝 Unique Queries",
		bookmarksCount: "🔖 Saved Papers",
		subscriptionsCount: "📬 Active Subscriptions",
	},

	// Categories
	categories: {
		title: "📂 arXiv Categories",
		select: "Select a category to browse recent papers:",
		browseByCategory: "📂 Browse by Category",
	},

	// Time
	time: {
		hours: "hours",
		days: "days",
		weeks: "weeks",
	},

	// Language settings
	language: {
		title: "🌐 Language Settings",
		current: "Current language: {language}",
		select: "Select your preferred language:",
		changed: "✅ Language changed to {language}",
		unavailable: "❌ This language is not available yet. Using English.",
	},

	// Main menu
	menu: {
		welcome: "Welcome to AI Research Assistant!",
		description: "I help you discover the latest research papers from arXiv.",
		whatICan: "What I can do:",
		searchDesc: "Search for papers on any topic",
		bookmarkDesc: "Bookmark papers for later",
		historyDesc: "View your search history",
		exportDesc: "Export citations (BibTeX)",
		useButtons: "Use the buttons below or type commands directly!",
		currentLanguage: "Current language:",
		searchPapers: "Search Papers",
		myBookmarks: "My Bookmarks",
		history: "History",
		help: "Help",
	},

	// Help page
	helpPage: {
		title: "📖 Help & Commands",
		searchCommands: "Search Commands:",
		searchTopic: "/search [topic] - Search for papers",
		searchAuthor: "/author [name] - Search by author",
		browseCategory: "/category - Browse by category",
		findSimilar: "/similar [arxiv_id] - Find similar papers",
		historyBookmarks: "History & Bookmarks:",
		viewBookmarks: "/bookmarks - View saved papers",
		savePaper: "/save [arxiv_id] - Save a paper by ID or URL",
		viewHistory: "/history - Search history",
		viewStats: "/stats - Your statistics",
		exportBibtex: "/export - Export bookmarks as BibTeX",
		subscriptionsTitle: "Subscriptions:",
		subscribeTopic: "/subscribe [topic] - Get updates on a topic",
		manageSubscriptions: "/subscriptions - Manage subscriptions",
		unsubscribeTopic: "/unsubscribe [id] - Remove subscription",
		loadMore: "/more - Load more results",
	},

	// Export
	export: {
		title: "📥 Export Bookmarks",
		cancelled: "Export cancelled.",
		selectFormat: "Select export format:",
		generating: "Generating export...",
		downloadReady: "Your export is ready!",
		fileCaption: "📚 Your bookmarks ({count} papers)",
	},

	// Save paper
	save: {
		title: "📥 Save Paper to Bookmarks",
		usage: "To save a paper, provide the arXiv ID or URL:",
		example: "/save 2301.00001\n/save https://arxiv.org/abs/2301.00001",
		tip: "You can also save papers directly from search results using the ☆ Save button!",
		fetching: "🔍 Fetching paper from arXiv...",
		success: "⭐ Paper saved to bookmarks!",
	},

	// Author search
	author: {
		usage: "Usage: /author <name>",
		example: "Example: /author Yoshua Bengio",
		prompt: "🔍 Enter author name to search:",
		searching: '🔍 Searching for papers by "{name}"...',
		results: "Papers by {name}",
		noResults: 'No papers found for author "{name}".',
	},

	// Similar papers
	similar: {
		usage: "Usage: /similar <arxiv_id>",
		example: "Example: /similar 2301.00001",
		hint: "You can find the arXiv ID in paper links (e.g., arxiv.org/abs/2301.00001)",
		searching: "🔍 Finding similar papers...",
		notFound: '❌ Could not find paper with ID "{arxivId}".',
		noResults: "No similar papers found.",
		title: "📚 Similar Papers",
	},

	// Callback messages
	callbacks: {
		tooManyRequests: "Too many requests. Please wait.",
		pleaseStartFirst: "Please start the bot first with /start",
		userNotFound: "User not found. Please try /start first.",
		subscriptionNotFound: "Subscription not found.",
		couldNotFetchPaper: "Could not fetch paper details.",
		clearBookmarksHint: "To clear all bookmarks, use a dedicated command.",
		intervalUpdated: "✅ Interval updated to every {hours} hours.",
	},

	// Category browsing
	categoryBrowse: {
		loading: "🔍 Loading recent papers in {category}...",
		noResults: "No papers found in category {category}.",
	},

	// Inline query
	inlineQuery: {
		typeToSearch: "Type at least 3 characters to search",
		searchDescription: "Search for research papers on arXiv",
		helpMessage:
			"🔍 Use this bot to search for research papers on arXiv!\n\nJust type @YourBotName followed by your search query.",
		noResults: 'No papers found for "{query}"',
		tryDifferent: "Try a different search term",
		searchFailed: "Search failed",
		tryAgain: "An error occurred. Please try again.",
	},

	// General UI
	ui: {
		errorOccurred: "❌ An error occurred. Please try again later.",
		paperCount: "You have {count} bookmarked paper(s).",
		yourSubscriptions: "📬 Your Subscriptions",
		tapToManage: "Tap a topic to manage or remove it.",
		settingsHeader: "⚙️ Subscription Settings",
		intervalLabel: "⏱️ Interval",
		categoryLabel: "📂 Category",
		selectFrequency: '⏱️ Select update frequency for "{topic}":',
		exportPreparing: "📥 Preparing {format} export...",
		exportSuccess: "✅ {format} export sent! Check the file above.",
		bibtexFormat: "BibTeX",
		csvFormat: "CSV",
		forLatex: "For LaTeX and citation managers",
		forSpreadsheets: "For spreadsheets (Excel, Google Sheets)",
		cancelButton: "❌ Cancel",
		viewBookmarksButton: "📚 View Bookmarks",
	},

	// Validation
	validation: {
		invalidArxivId: "❌ Invalid arXiv ID or URL.",
		validFormats: "Valid formats:",
		alreadyBookmarked: "📌 This paper is already in your bookmarks!",
		useBookmarksToView: "Use /bookmarks to view your saved papers.",
	},
};

export default en;
