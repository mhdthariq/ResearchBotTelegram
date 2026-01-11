/**
 * Telegram Bot instance with session management, rate limiting, and features
 *
 * Features:
 * - Redis session storage (when configured)
 * - Global error handling
 * - User rate limiting
 * - Paper caching (when Redis is configured)
 * - Bookmarks
 * - Search history
 * - Abstract expansion
 * - BibTeX export
 * - Advanced search
 */

import { prompt } from "@gramio/prompt";
import { session } from "@gramio/session";
import { Bot, bold, format, InlineKeyboard } from "gramio";
import {
	ARXIV_CATEGORIES,
	fetchPaperById,
	fetchPapers,
	type Paper,
	searchByAuthor,
	searchByCategory,
} from "../arxiv.js";
import { initPaperCache } from "../cache/paperCache.js";
import { config, isRedisConfigured } from "../config.js";
import { findOrCreateUser } from "../db/repositories/index.js";
import { getErrorMessage } from "../errors.js";
import {
	addBookmark,
	checkBookmarked,
	createBookmarksKeyboard,
	createPaperActionsKeyboard,
	exportAllBookmarksToBibTeX,
	formatBookmarksListMessage,
	getBookmarksPaginated,
	removeBookmark,
} from "../features/bookmarks.js";
import {
	clearHistory,
	createHistoryKeyboard,
	createRecentSearchesKeyboard,
	formatHistoryMessage,
	getRecentSearches,
	getSearchHistoryPaginated,
	getSearchStats,
	recordSearch,
} from "../features/searchHistory.js";
import { checkRateLimit, getRateLimitInfo } from "../middleware/rateLimit.js";
import { createRedisStorage } from "../storage/redis.js";
import { toBibTeX } from "../utils/export.js";
import { logger } from "../utils/logger.js";

/**
 * Session data structure
 */
interface SessionData {
	lastTopic?: string;
	lastOffset: number;
	userId?: number; // Database user ID
}

/**
 * User-friendly error messages
 */
const MESSAGES = {
	NO_RESULTS:
		"🔍 No papers found for your query. Try:\n• Different keywords\n• Broader search terms\n• Check spelling",
	API_ERROR: "⚠️ Couldn't reach arXiv. Please try again in a moment.",
	SEARCH_TIP:
		'💡 Tip: Use specific terms like "transformer attention mechanism" instead of just "AI"',
	SEARCH_CANCELLED: "Search cancelled.",
	USE_SEARCH_FIRST: "Use /search first to search for papers.",
	NO_MORE_PAPERS: "📭 No more papers found for this topic.",
	RATE_LIMITED:
		"⏳ You're sending too many requests. Please wait a moment before trying again.",
	BOOKMARK_ADDED: "⭐ Paper saved to bookmarks!",
	BOOKMARK_REMOVED: "✅ Paper removed from bookmarks.",
	BOOKMARK_EXISTS: "📚 Paper is already in your bookmarks.",
	NO_BOOKMARKS: "📚 You don't have any bookmarks yet.",
	HISTORY_CLEARED: "🗑️ Search history cleared!",
};

/**
 * Initialize caching if Redis is configured
 */
function initializeCache(): void {
	if (isRedisConfigured() && config.REDIS_URL) {
		try {
			initPaperCache(config.REDIS_URL, {
				prefix: "papers_cache",
				ttl: 3600, // 1 hour cache
			});
			logger.info("Paper caching enabled (Redis)");
		} catch (error) {
			logger.warn("Failed to initialize paper cache", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
	} else {
		logger.info("Paper caching disabled (no Redis configured)");
	}
}

// Initialize cache on module load
initializeCache();

/**
 * Create session configuration based on environment
 */
function createSessionConfig() {
	const baseConfig = {
		key: "research_session" as const,
		initial: (): SessionData => ({ lastOffset: 0 }),
	};

	// Use Redis storage if configured
	if (isRedisConfigured() && config.REDIS_URL) {
		logger.info("Using Redis for session storage");
		return {
			...baseConfig,
			storage: createRedisStorage<SessionData>(config.REDIS_URL, {
				prefix: "research_session",
				ttl: 86400 * 7, // 7 days
			}),
		};
	}

	logger.info(
		"Using in-memory session storage (sessions will not persist across restarts)",
	);
	return baseConfig;
}

/**
 * Format papers for display
 */
function formatPapersMessage(papers: Paper[], startIndex = 0): string {
	return papers
		.map(
			(p, i) =>
				format`${bold(`${i + 1 + startIndex}. ${p.title}`)}\n📅 ${p.published}\n🔗 ${p.link}`,
		)
		.join("\n\n");
}

/**
 * Format rate limit info for user message
 */
function formatRateLimitMessage(chatId: number): string {
	const info = getRateLimitInfo(chatId);
	const resetInSeconds = Math.ceil((info.resetAt - Date.now()) / 1000);
	return `${MESSAGES.RATE_LIMITED}\n\n⏱️ Try again in ${resetInSeconds} seconds.`;
}

/**
 * Get or create user in database and update session
 */
async function ensureUser(
	chatId: number,
	session: SessionData,
	userInfo?: { username?: string; firstName?: string; lastName?: string },
): Promise<number | null> {
	if (session.userId) {
		return session.userId;
	}

	const user = await findOrCreateUser(chatId, userInfo);
	if (user) {
		session.userId = user.id;
		return user.id;
	}

	return null;
}

/**
 * Create the bot instance
 */
export const bot = new Bot(config.BOT_TOKEN)
	.extend(session(createSessionConfig()))
	.extend(prompt())

	// --- GLOBAL ERROR HANDLER ---
	.onError(({ context, error }) => {
		const errorMessage = getErrorMessage(error);

		logger.error("Bot error occurred", {
			error: errorMessage,
			updateId: context.updateId,
		});

		// Try to notify the user if this is a message context
		if ("send" in context && typeof context.send === "function") {
			(context.send as (text: string) => Promise<unknown>)(
				"❌ An error occurred. Please try again later.",
			).catch(() => {
				// Ignore send errors
			});
		}
	})

	// --- COMMANDS ---

	.command("start", async (context) => {
		// Rate limit check (allow /start with higher limit)
		if (!checkRateLimit(context.chatId, { maxRequests: 60 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		logger.info("User started bot", { chatId: context.chatId });

		// Ensure user exists in database
		await ensureUser(context.chatId, context.research_session, {
			username: context.from?.username,
			firstName: context.from?.firstName,
			lastName: context.from?.lastName,
		});

		const keyboard = new InlineKeyboard()
			.text("🔍 Search Papers", "action:search")
			.text("📚 My Bookmarks", "action:bookmarks")
			.row()
			.text("📜 History", "action:history")
			.text("ℹ️ Help", "action:help");

		return context.send(
			format`
👋 ${bold`Welcome to AI Research Assistant!`}

I help you discover the latest research papers from arXiv.

${bold`What I can do:`}
🔍 Search for papers on any topic
⭐ Bookmark papers for later
📜 View your search history
📥 Export citations (BibTeX)

Use the buttons below or type commands directly!
      `,
			{ reply_markup: keyboard },
		);
	})

	.command("help", (context) => {
		// Rate limit check
		if (!checkRateLimit(context.chatId, { maxRequests: 60 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		return context.send(
			format`
${bold`📖 Help & Commands`}

${bold`Search Commands:`}
/search [topic] - Search for papers
/author [name] - Search by author
/category - Browse by category

${bold`History & Bookmarks:`}
/bookmarks - View saved papers
/history - View search history
/stats - Your statistics

${bold`Other:`}
/more - Load more results
/start - Show main menu
/help - Show this help

${MESSAGES.SEARCH_TIP}
      `,
		);
	})

	.command("bookmarks", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send(
				"❌ Could not load your bookmarks. Please try again.",
			);
		}

		const { bookmarks, total, hasMore } = await getBookmarksPaginated(
			userId,
			1,
			5,
		);

		if (bookmarks.length === 0) {
			const keyboard = new InlineKeyboard().text(
				"🔍 Search Papers",
				"action:search",
			);

			return context.send(MESSAGES.NO_BOOKMARKS, { reply_markup: keyboard });
		}

		const message = format`${bold`📚 Your Bookmarks`} (${total} total)\n\n${formatBookmarksListMessage(bookmarks)}`;
		const keyboard = createBookmarksKeyboard(1, hasMore, total);

		return context.send(message, { reply_markup: keyboard });
	})

	.command("history", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send("❌ Could not load your history. Please try again.");
		}

		const recentSearches = await getRecentSearches(userId, 6);

		if (recentSearches.length === 0) {
			const keyboard = new InlineKeyboard().text(
				"🔍 Search Papers",
				"action:search",
			);

			return context.send("📜 No search history yet.\n\nStart with /search!", {
				reply_markup: keyboard,
			});
		}

		const keyboard = createRecentSearchesKeyboard(recentSearches, 6);

		return context.send(
			format`${bold`🕐 Recent Searches`}\n\nTap a search to run it again:`,
			{ reply_markup: keyboard },
		);
	})

	.command("stats", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send("❌ Could not load your stats. Please try again.");
		}

		const searchStats = await getSearchStats(userId);
		const { total: bookmarkCount } = await getBookmarksPaginated(userId, 1, 1);

		let message = "📊 Your Statistics\n\n";
		message += `🔍 Total searches: ${searchStats.totalSearches}\n`;
		message += `📝 Unique queries: ${searchStats.uniqueQueries}\n`;
		message += `⭐ Bookmarks: ${bookmarkCount}\n`;

		if (searchStats.topSearches.length > 0) {
			message += "\nTop Searches:\n";
			message += searchStats.topSearches
				.map((s, i) => `${i + 1}. "${s.query}" (${s.count}x)`)
				.join("\n");
		}

		return context.send(message);
	})

	.command("author", async (context) => {
		if (!checkRateLimit(context.chatId, { maxRequests: 20, windowMs: 60000 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		let authorName = context.args ?? "";

		if (!authorName) {
			const answer = await context.prompt(
				"message",
				"👤 Enter the author name to search for:",
			);
			authorName = answer.text || "";
		}

		authorName = authorName.trim();
		if (!authorName) {
			return context.send(
				"Usage: /author <name>\nExample: /author Yoshua Bengio",
			);
		}

		await context.send(`🔍 Searching for papers by "${authorName}"...`);

		const papers = await searchByAuthor(authorName, 5);

		if (!papers.length) {
			return context.send(`No papers found for author "${authorName}".`);
		}

		const message = format`${bold`Papers by ${authorName}`}\n\n${formatPapersMessage(papers)}`;

		const keyboard = new InlineKeyboard().text(
			"🔍 New Search",
			"action:search",
		);

		return context.send(message, { reply_markup: keyboard });
	})

	.command("category", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		// Show category selection keyboard
		const keyboard = new InlineKeyboard();
		const categories = Object.entries(ARXIV_CATEGORIES).slice(0, 8);

		for (let i = 0; i < categories.length; i += 2) {
			const entry1 = categories[i];
			if (entry1) {
				const [cat1, name1] = entry1;
				keyboard.text(name1.substring(0, 20), `category:${cat1}`);
			}

			const entry2 = categories[i + 1];
			if (entry2) {
				const [cat2, name2] = entry2;
				keyboard.text(name2.substring(0, 20), `category:${cat2}`);
			}
			keyboard.row();
		}

		return context.send(
			format`${bold`📂 Browse by Category`}\n\nSelect a category to see recent papers:`,
			{ reply_markup: keyboard },
		);
	})

	.command("export", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send("❌ Could not export bookmarks. Please try again.");
		}

		const bibtex = await exportAllBookmarksToBibTeX(userId);

		if (!bibtex) {
			return context.send("📚 No bookmarks to export. Save some papers first!");
		}

		// Send as a code block for easy copying
		return context.send(`📥 BibTeX Export:\n\n\`\`\`\n${bibtex}\n\`\`\``, {
			parse_mode: "Markdown",
		});
	})

	// --- CALLBACK QUERIES ---

	.on("callback_query", async (context) => {
		const data = context.data;
		if (!data) return;

		// Rate limit check for callbacks
		const chatId = context.message?.chat?.id;
		if (chatId && !checkRateLimit(chatId)) {
			await context.answer({
				text: "Too many requests. Please wait.",
				show_alert: true,
			});
			return;
		}

		// Get user ID for database operations
		const userId = context.research_session?.userId;

		// --- Action handlers ---
		if (data.startsWith("action:")) {
			const action = data.replace("action:", "");

			switch (action) {
				case "search":
					await context.answer();
					await context.message?.send(
						"🔍 What topic would you like to search for?\n\nType your search query or use:\n/search [topic]",
					);
					break;

				case "more": {
					await context.answer();
					const topic = context.research_session?.lastTopic;
					if (!topic) {
						await context.message?.send(MESSAGES.USE_SEARCH_FIRST);
					} else {
						const nextOffset = (context.research_session?.lastOffset || 0) + 5;
						context.research_session.lastOffset = nextOffset;

						await context.message?.send(
							`📚 Loading more papers for "${topic}"...`,
						);

						const papers = await fetchPapers(topic, nextOffset);
						if (!papers.length) {
							await context.message?.send(MESSAGES.NO_MORE_PAPERS);
						} else {
							const message = formatPapersMessage(papers, nextOffset);
							await context.message?.send(message);
						}
					}
					break;
				}

				case "bookmarks": {
					await context.answer();
					if (!userId) {
						await context.message?.send("Please use /bookmarks command.");
						return;
					}
					// Redirect to bookmarks command logic
					const { bookmarks, total, hasMore } = await getBookmarksPaginated(
						userId,
						1,
						5,
					);
					if (bookmarks.length === 0) {
						await context.message?.send(MESSAGES.NO_BOOKMARKS);
					} else {
						const msg = format`${bold`📚 Your Bookmarks`} (${total} total)\n\n${formatBookmarksListMessage(bookmarks)}`;
						await context.message?.send(msg, {
							reply_markup: createBookmarksKeyboard(1, hasMore, total),
						});
					}
					break;
				}

				case "history": {
					await context.answer();
					if (!userId) {
						await context.message?.send("Please use /history command.");
						return;
					}
					const recentSearches = await getRecentSearches(userId, 6);
					if (recentSearches.length === 0) {
						await context.message?.send("📜 No search history yet.");
					} else {
						await context.message?.send(
							format`${bold`🕐 Recent Searches`}\n\nTap a search to run it again:`,
							{ reply_markup: createRecentSearchesKeyboard(recentSearches, 6) },
						);
					}
					break;
				}

				case "help":
					await context.answer();
					await context.message?.send(
						format`
${bold`📖 Help & Commands`}

${bold`/search [topic]`} - Search for papers
${bold`/author [name]`} - Search by author
${bold`/bookmarks`} - View saved papers
${bold`/history`} - Search history
${bold`/more`} - Load more results

${MESSAGES.SEARCH_TIP}
          `,
					);
					break;
			}
			return;
		}

		// --- Bookmark handlers ---
		if (data.startsWith("bookmark:")) {
			const arxivId = data.replace("bookmark:", "");
			await context.answer();

			if (!userId) {
				await context.answer({
					text: "Please start the bot first with /start",
					show_alert: true,
				});
				return;
			}

			const paper = await fetchPaperById(arxivId);
			if (!paper) {
				await context.answer({
					text: "Could not fetch paper details.",
					show_alert: true,
				});
				return;
			}

			const bookmark = await addBookmark(userId, paper);
			if (bookmark) {
				await context.answer({
					text: MESSAGES.BOOKMARK_ADDED,
					show_alert: true,
				});
				// Update keyboard to show bookmarked state
				// Note: editReplyMarkup has typing issues, skip for now
			} else {
				await context.answer({
					text: MESSAGES.BOOKMARK_EXISTS,
					show_alert: true,
				});
			}
			return;
		}

		if (data.startsWith("unbookmark:")) {
			const arxivId = data.replace("unbookmark:", "");
			await context.answer();

			if (!userId) {
				return;
			}

			const removed = await removeBookmark(userId, arxivId);
			if (removed) {
				await context.answer({
					text: MESSAGES.BOOKMARK_REMOVED,
					show_alert: true,
				});
				// Note: editReplyMarkup has typing issues, skip for now
			}
			return;
		}

		// --- Bookmarks pagination ---
		if (data.startsWith("bookmarks:page:")) {
			const page = parseInt(data.replace("bookmarks:page:", ""), 10);
			await context.answer();

			if (!userId || Number.isNaN(page)) return;

			const { bookmarks, total, hasMore } = await getBookmarksPaginated(
				userId,
				page,
				5,
			);
			const message = format`${bold`📚 Your Bookmarks`} (${total} total)\n\n${formatBookmarksListMessage(bookmarks, (page - 1) * 5)}`;

			try {
				await context.message?.editText(message, {
					reply_markup: createBookmarksKeyboard(page, hasMore, total),
				});
			} catch {
				// Ignore edit errors
			}
			return;
		}

		if (data === "bookmarks:clear") {
			await context.answer({
				text: "To clear all bookmarks, use a dedicated command.",
				show_alert: true,
			});
			return;
		}

		// --- History handlers ---
		if (data.startsWith("history:page:")) {
			const page = parseInt(data.replace("history:page:", ""), 10);
			await context.answer();

			if (!userId || Number.isNaN(page)) return;

			const { history, hasMore } = await getSearchHistoryPaginated(
				userId,
				page,
				10,
			);
			const message = formatHistoryMessage(history, (page - 1) * 10);

			try {
				await context.message?.editText(message, {
					reply_markup: createHistoryKeyboard(page, hasMore),
				});
			} catch {
				// Ignore edit errors
			}
			return;
		}

		if (data === "history:full") {
			await context.answer();
			if (!userId) return;

			const { history, hasMore } = await getSearchHistoryPaginated(
				userId,
				1,
				10,
			);
			const message = formatHistoryMessage(history, 0);

			await context.message?.send(message, {
				reply_markup: createHistoryKeyboard(1, hasMore),
			});
			return;
		}

		if (data === "history:clear") {
			await context.answer();
			if (!userId) return;

			const cleared = await clearHistory(userId);
			if (cleared) {
				await context.answer({
					text: MESSAGES.HISTORY_CLEARED,
					show_alert: true,
				});
				try {
					await context.message?.editText("📜 Search history cleared.", {
						reply_markup: new InlineKeyboard().text(
							"🔍 Search",
							"action:search",
						),
					});
				} catch {
					// Ignore
				}
			}
			return;
		}

		// --- Search repeat ---
		if (data.startsWith("search:repeat:")) {
			const query = data.replace("search:repeat:", "");
			await context.answer();

			if (context.research_session) {
				context.research_session.lastTopic = query;
				context.research_session.lastOffset = 0;
			}

			await context.message?.send(`🔍 Searching for "${query}"...`);

			const papers = await fetchPapers(query);

			if (userId) {
				await recordSearch(userId, query, papers.length);
			}

			if (!papers.length) {
				await context.message?.send(MESSAGES.NO_RESULTS);
				return;
			}

			const message = formatPapersMessage(papers);
			const keyboard = new InlineKeyboard()
				.text("📚 Load More", "action:more")
				.text("🔍 New Search", "action:search");

			await context.message?.send(message, { reply_markup: keyboard });
			return;
		}

		// --- Category search ---
		if (data.startsWith("category:")) {
			const category = data.replace("category:", "");
			await context.answer();

			await context.message?.send(
				`🔍 Loading recent papers in ${ARXIV_CATEGORIES[category] || category}...`,
			);

			const papers = await searchByCategory(category, 5);

			if (!papers.length) {
				await context.message?.send(`No papers found in category ${category}.`);
				return;
			}

			const message = format`${bold`📂 ${ARXIV_CATEGORIES[category] || category}`}\n\n${formatPapersMessage(papers)}`;
			const keyboard = new InlineKeyboard()
				.text("🔍 New Search", "action:search")
				.text("📂 Categories", "action:categories");

			await context.message?.send(message, { reply_markup: keyboard });
			return;
		}

		// --- Abstract expansion ---
		if (data.startsWith("abstract:")) {
			const arxivId = data.replace("abstract:", "");
			await context.answer();

			const paper = await fetchPaperById(arxivId);
			if (!paper) {
				await context.message?.send("❌ Could not fetch paper details.");
				return;
			}

			const isBookmarkedPaper = userId
				? await checkBookmarked(userId, arxivId)
				: false;

			const message = format`
${bold(paper.title)}

📅 Published: ${paper.published}
👥 Authors: ${paper.authors?.join(", ") || "Unknown"}

📝 ${bold`Abstract:`}
${paper.summary}

🔗 ${paper.link}
      `;

			const keyboard = createPaperActionsKeyboard(arxivId, isBookmarkedPaper);

			try {
				await context.message?.editText(message, { reply_markup: keyboard });
			} catch {
				await context.message?.send(message, { reply_markup: keyboard });
			}
			return;
		}

		// --- BibTeX export ---
		if (data.startsWith("bibtex:")) {
			const arxivId = data.replace("bibtex:", "");
			await context.answer();

			const paper = await fetchPaperById(arxivId);
			if (!paper) {
				await context.message?.send("❌ Could not fetch paper details.");
				return;
			}

			const bibtex = toBibTeX(paper);
			await context.message?.send(`📥 BibTeX:\n\n\`\`\`\n${bibtex}\n\`\`\``, {
				parse_mode: "Markdown",
			});
			return;
		}

		// --- PDF link ---
		if (data.startsWith("pdf:")) {
			const arxivId = data.replace("pdf:", "");
			const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
			await context.answer();
			await context.message?.send(`📄 PDF: ${pdfUrl}`);
			return;
		}

		// --- Noop handler ---
		if (data.endsWith(":noop")) {
			await context.answer();
			return;
		}
	})

	// --- SEARCH COMMAND ---

	.command("search", async (context) => {
		// Rate limit check for search (more strict)
		if (!checkRateLimit(context.chatId, { maxRequests: 20, windowMs: 60000 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		// Ensure user exists
		const userId = await ensureUser(context.chatId, context.research_session, {
			username: context.from?.username,
			firstName: context.from?.firstName,
			lastName: context.from?.lastName,
		});

		let topic = context.args ?? "";

		// If no topic provided, ask the user interactively
		if (!topic) {
			const answer = await context.prompt(
				"message",
				"🔍 What topic are you looking for?",
			);
			topic = answer.text || "";
		}

		// Validate and sanitize topic
		topic = topic.trim();
		if (!topic) {
			return context.send(MESSAGES.SEARCH_CANCELLED);
		}

		// Limit topic length
		if (topic.length > 200) {
			topic = topic.substring(0, 200);
		}

		logger.info("User searching for papers", {
			chatId: context.chatId,
			topic,
		});

		// Save session data for "Load More"
		context.research_session.lastTopic = topic;
		context.research_session.lastOffset = 0;

		await context.send(`🔍 Searching for "${topic}"...`);

		const papers = await fetchPapers(topic);

		// Record search in history
		if (userId) {
			await recordSearch(userId, topic, papers.length);
		}

		if (!papers.length) {
			return context.send(MESSAGES.NO_RESULTS);
		}

		const message = formatPapersMessage(papers);

		// Add navigation keyboard
		const keyboard = new InlineKeyboard()
			.text("📚 Load More", "action:more")
			.text("🔍 New Search", "action:search");

		return context.send(message, { reply_markup: keyboard });
	})

	// --- MORE COMMAND ---

	.command("more", async (context) => {
		// Rate limit check
		if (!checkRateLimit(context.chatId, { maxRequests: 20, windowMs: 60000 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const topic = context.research_session.lastTopic;
		if (!topic) {
			return context.send(MESSAGES.USE_SEARCH_FIRST);
		}

		const nextOffset = context.research_session.lastOffset + 5;
		context.research_session.lastOffset = nextOffset;

		logger.debug("Loading more papers", {
			chatId: context.chatId,
			topic,
			offset: nextOffset,
		});

		await context.send(`📚 Loading more papers for "${topic}"...`);

		const papers = await fetchPapers(topic, nextOffset);

		if (!papers.length) {
			return context.send(MESSAGES.NO_MORE_PAPERS);
		}

		const message = formatPapersMessage(papers, nextOffset);

		// Add navigation keyboard
		const keyboard = new InlineKeyboard()
			.text("📚 Load More", "action:more")
			.text("🔍 New Search", "action:search");

		return context.send(message, { reply_markup: keyboard });
	});
