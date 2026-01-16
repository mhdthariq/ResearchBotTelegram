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
};

export default en;
