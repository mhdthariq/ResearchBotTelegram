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
 * - Subscriptions (daily digest)
 * - Inline query support
 * - Similar papers recommendations
 * - Admin commands
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
import {
	getSubscriptionById,
	getTotalSubscriptionCount,
} from "../db/repositories/subscriptionRepository.js";
import {
	findUserByChatId,
	getUserCount,
	updateUserLanguage,
} from "../db/repositories/userRepository.js";
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
import { getSimilarPapersById } from "../features/recommendations.js";
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
import {
	createIntervalKeyboard,
	createSubscriptionSettingsKeyboard,
	createSubscriptionsKeyboard,
	formatSubscriptionsMessage,
	getSubscriptionsList,
	parseSubscribeArgs,
	subscribe,
	unsubscribe,
	updateInterval,
} from "../features/subscriptions.js";
import { LANGUAGE_NAMES, type LanguageCode, t } from "../i18n/index.js";
import {
	ADMIN_HELP,
	formatAdminStats,
	isAdmin,
	logAdminAction,
} from "../middleware/admin.js";
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

		// Get user's language preference
		const user = await findUserByChatId(context.chatId);
		const userLang = (user?.language as LanguageCode) || "en";
		const langName = LANGUAGE_NAMES[userLang];

		const keyboard = new InlineKeyboard()
			.text("🔍 Search Papers", "action:search")
			.text("📚 My Bookmarks", "action:bookmarks")
			.row()
			.text("📜 History", "action:history")
			.text("ℹ️ Help", "action:help")
			.row()
			.text(`🌐 Language (${langName})`, "action:language");

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

🌐 Current language: ${langName}
      `,
			{ reply_markup: keyboard },
		);
	})

	.command("language", async (context) => {
		// Rate limit check
		if (!checkRateLimit(context.chatId, { maxRequests: 60 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		// Ensure user exists
		await ensureUser(context.chatId, context.research_session, {
			username: context.from?.username,
			firstName: context.from?.firstName,
			lastName: context.from?.lastName,
		});

		// Get user's current language
		const user = await findUserByChatId(context.chatId);
		const userLang = (user?.language as LanguageCode) || "en";

		// Build language selection keyboard
		const keyboard = new InlineKeyboard();

		// All available languages with full translations
		const availableLangs: LanguageCode[] = [
			"en",
			"es",
			"zh",
			"ru",
			"pt",
			"fr",
			"de",
			"ja",
			"ar",
			"id",
		];

		// Create a grid layout with 2 languages per row
		for (let i = 0; i < availableLangs.length; i += 2) {
			const lang1 = availableLangs[i] as LanguageCode;
			const lang2 = availableLangs[i + 1] as LanguageCode | undefined;

			const isCurrentLang1 = lang1 === userLang;
			const displayName1 = isCurrentLang1
				? `✓ ${LANGUAGE_NAMES[lang1]}`
				: LANGUAGE_NAMES[lang1];
			keyboard.text(displayName1, `lang:set:${lang1}`);

			if (lang2) {
				const isCurrentLang2 = lang2 === userLang;
				const displayName2 = isCurrentLang2
					? `✓ ${LANGUAGE_NAMES[lang2]}`
					: LANGUAGE_NAMES[lang2];
				keyboard.text(displayName2, `lang:set:${lang2}`);
			}
			keyboard.row();
		}
		keyboard.text("⬅️ Back", "action:back_to_start");

		return context.send(
			format`
${bold`🌐 ${t(userLang, "language.title")}`}

${t(userLang, "language.current", { language: LANGUAGE_NAMES[userLang] })}

${t(userLang, "language.select")}
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
/similar [arxiv_id] - Find similar papers

${bold`History & Bookmarks:`}
/bookmarks - View saved papers
/save [arxiv_id] - Save a paper by ID or URL
/history - View search history
/stats - Your statistics
/export - Export bookmarks as BibTeX

${bold`Subscriptions:`}
/subscribe [topic] - Get daily updates
/unsubscribe [topic] - Remove subscription
/subscriptions - View all subscriptions

${bold`Other:`}
/more - Load more results
/start - Show main menu
/help - Show this help

${bold`Inline Mode:`}
Type @botname query in any chat to search!

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

	// --- SAVE COMMAND ---
	.command("save", async (context) => {
		if (!checkRateLimit(context.chatId, { maxRequests: 30, windowMs: 60000 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send("❌ Could not save paper. Please try again.");
		}

		// Get the arXiv ID or URL from command argument
		const args = context.text?.replace(/^\/save\s*/, "").trim();

		if (!args) {
			return context.send(
				format`${bold`📥 Save Paper to Bookmarks`}

To save a paper, provide the arXiv ID or URL:

${bold`Usage:`}
/save 2301.00001
/save https://arxiv.org/abs/2301.00001

${bold`Tip:`} You can also save papers directly from search results using the ☆ Save button!`,
			);
		}

		// Extract arXiv ID from input (could be URL or just ID)
		const { extractArxivId } = await import("../utils/export.js");
		let arxivId = extractArxivId(args);

		// If not found via URL patterns, try treating the whole input as an ID
		if (!arxivId) {
			// Clean up the input - remove any whitespace and common prefixes
			const cleaned = args.replace(/^arxiv:/i, "").trim();
			// Check if it looks like an arXiv ID (e.g., 2301.00001 or cs/0001001)
			if (
				/^\d{4}\.\d{4,5}(v\d+)?$/.test(cleaned) ||
				/^[a-z-]+\/\d{7}$/i.test(cleaned)
			) {
				arxivId = cleaned;
			}
		}

		if (!arxivId) {
			return context.send(
				format`❌ Invalid arXiv ID or URL.

${bold`Valid formats:`}
• 2301.00001
• arxiv:2301.00001
• https://arxiv.org/abs/2301.00001
• https://arxiv.org/pdf/2301.00001.pdf`,
			);
		}

		// Check if already bookmarked
		const alreadyBookmarked = await checkBookmarked(userId, arxivId);
		if (alreadyBookmarked) {
			return context.send(
				format`📌 This paper is already in your bookmarks!

Use /bookmarks to view your saved papers.`,
			);
		}

		// Fetch the paper from arXiv
		await context.send("🔍 Fetching paper from arXiv...");

		const paper = await fetchPaperById(arxivId);

		if (!paper) {
			return context.send(
				format`❌ Paper not found on arXiv.

Please check the ID and try again. The paper might have been removed or the ID might be incorrect.`,
			);
		}

		// Add to bookmarks
		const bookmark = await addBookmark(userId, paper);

		if (!bookmark) {
			return context.send("❌ Failed to save paper. Please try again.");
		}

		// Format authors
		const authors = paper.authors || [];
		const authorStr =
			authors.length > 2
				? `${authors.slice(0, 2).join(", ")} et al.`
				: authors.length > 0
					? authors.join(", ")
					: "Unknown";

		const keyboard = new InlineKeyboard()
			.text("📚 View Bookmarks", "action:bookmarks")
			.text("🔍 Search More", "action:search");

		return context.send(
			format`✅ ${bold`Paper saved to bookmarks!`}

${bold`${paper.title}`}

👥 ${authorStr}
📅 ${paper.published}
🔗 ${paper.link}`,
			{ reply_markup: keyboard },
		);
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
${bold`/save [arxiv_id]`} - Save a paper by ID or URL
${bold`/history`} - Search history
${bold`/more`} - Load more results

${MESSAGES.SEARCH_TIP}
          `,
					);
					break;

				case "language": {
					await context.answer();
					// Get user's current language
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";

					// Build language selection keyboard
					const langKeyboard = new InlineKeyboard();
					const availableLangs: LanguageCode[] = [
						"en",
						"es",
						"zh",
						"ru",
						"pt",
						"fr",
						"de",
						"ja",
						"ar",
						"id",
					];

					// Create a grid layout with 2 languages per row
					for (let i = 0; i < availableLangs.length; i += 2) {
						const lang1 = availableLangs[i] as LanguageCode;
						const lang2 = availableLangs[i + 1] as LanguageCode | undefined;

						const isCurrentLang1 = lang1 === userLang;
						const displayName1 = isCurrentLang1
							? `✓ ${LANGUAGE_NAMES[lang1]}`
							: LANGUAGE_NAMES[lang1];
						langKeyboard.text(displayName1, `lang:set:${lang1}`);

						if (lang2) {
							const isCurrentLang2 = lang2 === userLang;
							const displayName2 = isCurrentLang2
								? `✓ ${LANGUAGE_NAMES[lang2]}`
								: LANGUAGE_NAMES[lang2];
							langKeyboard.text(displayName2, `lang:set:${lang2}`);
						}
						langKeyboard.row();
					}
					langKeyboard.text("⬅️ Back", "action:back_to_start");

					await context.message?.editText(
						format`
${bold`🌐 ${t(userLang, "language.title")}`}

${t(userLang, "language.current", { language: LANGUAGE_NAMES[userLang] })}

${t(userLang, "language.select")}
            `,
						{ reply_markup: langKeyboard },
					);
					break;
				}

				case "back_to_start": {
					await context.answer();
					// Get user's language preference
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					const langName = LANGUAGE_NAMES[userLang];

					const startKeyboard = new InlineKeyboard()
						.text("🔍 Search Papers", "action:search")
						.text("📚 My Bookmarks", "action:bookmarks")
						.row()
						.text("📜 History", "action:history")
						.text("ℹ️ Help", "action:help")
						.row()
						.text(`🌐 Language (${langName})`, "action:language");

					await context.message?.editText(
						format`
👋 ${bold`Welcome to AI Research Assistant!`}

I help you discover the latest research papers from arXiv.

${bold`What I can do:`}
🔍 Search for papers on any topic
⭐ Bookmark papers for later
📜 View your search history
📥 Export citations (BibTeX)

Use the buttons below or type commands directly!

🌐 Current language: ${langName}
            `,
						{ reply_markup: startKeyboard },
					);
					break;
				}
			}
			return;
		}

		// --- Language selection handlers ---
		if (data.startsWith("lang:set:")) {
			const newLang = data.replace("lang:set:", "") as LanguageCode;
			await context.answer();

			if (!userId || !chatId) {
				await context.answer({
					text: "Please start the bot first with /start",
					show_alert: true,
				});
				return;
			}

			// Get user to update
			const user = await findUserByChatId(chatId);
			if (!user) {
				await context.answer({
					text: "User not found. Please try /start first.",
					show_alert: true,
				});
				return;
			}

			// Update user's language
			await updateUserLanguage(user.id, newLang);
			const langName = LANGUAGE_NAMES[newLang];

			logger.info("User changed language", {
				chatId,
				userId: user.id,
				newLang,
			});

			// Show confirmation and return to start menu
			const startKeyboard = new InlineKeyboard()
				.text("🔍 Search Papers", "action:search")
				.text("📚 My Bookmarks", "action:bookmarks")
				.row()
				.text("📜 History", "action:history")
				.text("ℹ️ Help", "action:help")
				.row()
				.text(`🌐 Language (${langName})`, "action:language");

			await context.message?.editText(
				format`
${t(newLang, "language.changed", { language: langName })}

👋 ${bold`Welcome to AI Research Assistant!`}

I help you discover the latest research papers from arXiv.

${bold`What I can do:`}
🔍 Search for papers on any topic
⭐ Bookmark papers for later
📜 View your search history
📥 Export citations (BibTeX)

Use the buttons below or type commands directly!

🌐 Current language: ${langName}
        `,
				{ reply_markup: startKeyboard },
			);
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

		// --- Subscription handlers ---
		if (data === "action:add_subscription") {
			await context.answer();
			await context.message?.send(
				"📬 To subscribe to a topic, use:\n/subscribe <topic>\n\nExample: /subscribe machine learning",
			);
			return;
		}

		if (data === "action:subscriptions") {
			await context.answer();
			if (!userId) {
				await context.message?.send("Please use /subscriptions command.");
				return;
			}

			const { subscriptions, count } = await getSubscriptionsList(userId);

			if (count === 0) {
				const keyboard = new InlineKeyboard()
					.text("➕ Add Subscription", "action:add_subscription")
					.row()
					.text("🔍 Search Papers", "action:search");

				await context.message?.send(
					"📭 You don't have any subscriptions yet.\n\nUse /subscribe <topic> to get periodic updates on research topics.",
					{ reply_markup: keyboard },
				);
			} else {
				const subscriptionsList = formatSubscriptionsMessage(subscriptions);
				const keyboard = createSubscriptionsKeyboard(subscriptions);
				await context.message?.send(
					format`📬 ${bold("Your Subscriptions")}\n\n${subscriptionsList}\n\nTap a topic to manage or remove it.`,
					{ reply_markup: keyboard },
				);
			}
			return;
		}

		if (data.startsWith("unsub:")) {
			const subscriptionId = parseInt(data.replace("unsub:", ""), 10);
			await context.answer();

			if (!userId || Number.isNaN(subscriptionId)) return;

			const subscription = await getSubscriptionById(subscriptionId);
			if (!subscription) {
				await context.answer({
					text: "Subscription not found.",
					show_alert: true,
				});
				return;
			}

			const result = await unsubscribe(userId, subscription.topic);
			await context.answer({
				text: result.message,
				show_alert: true,
			});

			// Refresh the subscriptions list
			const { subscriptions, count } = await getSubscriptionsList(userId);
			if (count === 0) {
				try {
					await context.message?.editText(
						"📭 You don't have any subscriptions.\n\nUse /subscribe <topic> to get updates.",
						{
							reply_markup: new InlineKeyboard()
								.text("➕ Add Subscription", "action:add_subscription")
								.row()
								.text("🔍 Search Papers", "action:search"),
						},
					);
				} catch {
					// Ignore edit errors
				}
			} else {
				try {
					const subscriptionsList = formatSubscriptionsMessage(subscriptions);
					await context.message?.editText(
						format`📬 ${bold("Your Subscriptions")}\n\n${subscriptionsList}\n\nTap a topic to manage or remove it.`,
						{
							reply_markup: createSubscriptionsKeyboard(subscriptions),
						},
					);
				} catch {
					// Ignore edit errors
				}
			}
			return;
		}

		if (data.startsWith("sub_settings:")) {
			const subscriptionId = parseInt(data.replace("sub_settings:", ""), 10);
			await context.answer();

			if (Number.isNaN(subscriptionId)) return;

			const subscription = await getSubscriptionById(subscriptionId);
			if (!subscription) {
				await context.answer({
					text: "Subscription not found.",
					show_alert: true,
				});
				return;
			}

			const message = `⚙️ Subscription Settings\n\n📌 Topic: ${subscription.topic}\n⏱️ Interval: ${subscription.intervalHours || 24} hours\n📂 Category: ${subscription.category || "All"}`;

			try {
				await context.message?.editText(message, {
					reply_markup: createSubscriptionSettingsKeyboard(subscription),
				});
			} catch {
				await context.message?.send(message, {
					reply_markup: createSubscriptionSettingsKeyboard(subscription),
				});
			}
			return;
		}

		if (data.startsWith("sub_change_interval:")) {
			const subscriptionId = parseInt(
				data.replace("sub_change_interval:", ""),
				10,
			);
			await context.answer();

			if (Number.isNaN(subscriptionId)) return;

			const subscription = await getSubscriptionById(subscriptionId);
			if (!subscription) return;

			try {
				await context.message?.editText(
					`⏱️ Select update frequency for "${subscription.topic}":`,
					{
						reply_markup: createIntervalKeyboard(
							subscriptionId,
							subscription.intervalHours ?? 24,
						),
					},
				);
			} catch {
				// Ignore edit errors
			}
			return;
		}

		if (data.startsWith("sub_interval:")) {
			const parts = data.replace("sub_interval:", "").split(":");
			const subscriptionId = parseInt(parts[0] ?? "", 10);
			const intervalHours = parseInt(parts[1] ?? "", 10);
			await context.answer();

			if (Number.isNaN(subscriptionId) || Number.isNaN(intervalHours)) return;

			const updated = await updateInterval(subscriptionId, intervalHours);
			if (updated) {
				await context.answer({
					text: `✅ Interval updated to every ${intervalHours} hours.`,
					show_alert: true,
				});

				// Go back to subscription settings
				try {
					await context.message?.editText(
						`⚙️ Subscription Settings\n\n📌 Topic: ${updated.topic}\n⏱️ Interval: ${intervalHours} hours\n📂 Category: ${updated.category || "All"}`,
						{
							reply_markup: createSubscriptionSettingsKeyboard(updated),
						},
					);
				} catch {
					// Ignore edit errors
				}
			}
			return;
		}

		// --- Similar papers handler ---
		if (data.startsWith("similar:")) {
			const arxivId = data.replace("similar:", "");
			await context.answer();

			await context.message?.send(`🔍 Finding similar papers...`);

			const similarPapers = await getSimilarPapersById(arxivId, {
				maxResults: 5,
			});

			if (!similarPapers || similarPapers.length === 0) {
				await context.message?.send("No similar papers found.");
				return;
			}

			const message = format`${bold`📚 Similar Papers`}\n\n${formatPapersMessage(similarPapers)}`;

			const keyboard = new InlineKeyboard().text(
				"🔍 New Search",
				"action:search",
			);

			await context.message?.send(message, { reply_markup: keyboard });
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
	})

	// --- SUBSCRIBE COMMAND ---

	.command("subscribe", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userId = await ensureUser(context.chatId, context.research_session, {
			username: context.from?.username,
			firstName: context.from?.firstName,
			lastName: context.from?.lastName,
		});

		if (!userId) {
			return context.send(
				"❌ Could not process subscription. Please try again.",
			);
		}

		let topicArg = context.args ?? "";

		if (!topicArg) {
			const answer = await context.prompt(
				"message",
				"📬 What topic would you like to subscribe to?\n\nYou'll receive daily updates with new papers.",
			);
			topicArg = answer.text || "";
		}

		const { topic, category } = parseSubscribeArgs(topicArg);

		if (!topic) {
			return context.send(
				"Usage: /subscribe <topic>\nExample: /subscribe machine learning\n\nOptional category: /subscribe [cs.AI] neural networks",
			);
		}

		const result = await subscribe(userId, topic, { category });

		return context.send(result.message);
	})

	// --- UNSUBSCRIBE COMMAND ---

	.command("unsubscribe", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send("❌ Could not process request. Please try again.");
		}

		const topic = context.args?.trim();

		if (!topic) {
			// Show list of subscriptions to unsubscribe from
			const { subscriptions, count } = await getSubscriptionsList(userId);

			if (count === 0) {
				return context.send("📭 You don't have any subscriptions.");
			}

			const keyboard = createSubscriptionsKeyboard(subscriptions);
			return context.send("Select a subscription to remove:", {
				reply_markup: keyboard,
			});
		}

		const result = await unsubscribe(userId, topic);
		return context.send(result.message);
	})

	// --- SUBSCRIPTIONS COMMAND ---

	.command("subscriptions", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send("❌ Could not load subscriptions. Please try again.");
		}

		const { subscriptions, count } = await getSubscriptionsList(userId);

		if (count === 0) {
			const keyboard = new InlineKeyboard()
				.text("➕ Add Subscription", "action:add_subscription")
				.row()
				.text("🔍 Search Papers", "action:search");

			return context.send(
				"📭 You don't have any subscriptions yet.\n\nUse /subscribe <topic> to get periodic updates on research topics.",
				{ reply_markup: keyboard },
			);
		}

		const subscriptionsList = formatSubscriptionsMessage(subscriptions);
		const keyboard = createSubscriptionsKeyboard(subscriptions);
		return context.send(
			format`📬 ${bold("Your Subscriptions")}\n\n${subscriptionsList}\n\nTap a topic to manage or remove it.`,
			{ reply_markup: keyboard },
		);
	})

	// --- SIMILAR PAPERS COMMAND ---

	.command("similar", async (context) => {
		if (!checkRateLimit(context.chatId, { maxRequests: 15, windowMs: 60000 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const arxivId = context.args?.trim();

		if (!arxivId) {
			return context.send(
				"Usage: /similar <arxiv_id>\nExample: /similar 2301.00001\n\nYou can find the arXiv ID in paper links (e.g., arxiv.org/abs/2301.00001)",
			);
		}

		await context.send(`🔍 Finding similar papers to ${arxivId}...`);

		const similarPapers = await getSimilarPapersById(arxivId, {
			maxResults: 5,
		});

		if (similarPapers === null) {
			return context.send(`❌ Could not find paper with ID "${arxivId}".`);
		}

		if (similarPapers.length === 0) {
			return context.send("No similar papers found.");
		}

		const message = format`${bold`📚 Similar Papers`}\n\n${formatPapersMessage(similarPapers)}`;

		const keyboard = new InlineKeyboard().text(
			"🔍 New Search",
			"action:search",
		);

		return context.send(message, { reply_markup: keyboard });
	})

	// --- ADMIN STATS COMMAND ---

	.command("admin_stats", async (context) => {
		if (!isAdmin(context.chatId)) {
			return; // Silently ignore for non-admins
		}

		if (!checkRateLimit(context.chatId, { maxRequests: 60 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		logAdminAction(context.chatId, "view_stats");

		// Gather statistics
		const totalUsers = await getUserCount();
		const totalSubscriptions = await getTotalSubscriptionCount(true);

		const stats = formatAdminStats({
			totalUsers,
			activeSubscriptions: totalSubscriptions,
		});

		return context.send(stats, { parse_mode: "Markdown" });
	})

	// --- ADMIN HELP COMMAND ---

	.command("admin", async (context) => {
		if (!isAdmin(context.chatId)) {
			return; // Silently ignore for non-admins
		}

		return context.send(ADMIN_HELP, { parse_mode: "Markdown" });
	})

	// --- INLINE QUERY HANDLER ---

	.on("inline_query", async (context) => {
		const query = context.query?.trim() || "";

		logger.debug("Received inline query", { query });

		try {
			// Check minimum query length
			if (query.length < 3) {
				await context.answerInlineQuery(
					[
						{
							type: "article",
							id: "help",
							title: "Type at least 3 characters to search",
							description: "Search for research papers on arXiv",
							input_message_content: {
								message_text:
									"🔍 Use this bot to search for research papers on arXiv!\n\nJust type @YourBotName followed by your search query.",
							},
						},
					],
					{ cache_time: 60, is_personal: false },
				);
				return;
			}

			// Fetch papers from arXiv
			const papers = await fetchPapers(query, 0, 10);

			if (papers.length === 0) {
				await context.answerInlineQuery(
					[
						{
							type: "article",
							id: "no-results",
							title: `No papers found for "${query}"`,
							description: "Try a different search term",
							input_message_content: {
								message_text: `❌ No papers found for "${query}".\n\nTry different keywords or check the spelling.`,
							},
						},
					],
					{ cache_time: 300, is_personal: false },
				);
				return;
			}

			// Format results
			const results = papers.map((paper, index) => {
				const arxivId = paper.link.split("/abs/")[1] || `paper-${index}`;
				const authors = paper.authors?.slice(0, 3).join(", ") || "Unknown";
				const moreAuthors = (paper.authors?.length || 0) > 3 ? " et al." : "";
				const shortSummary =
					paper.summary.length > 150
						? `${paper.summary.substring(0, 150)}...`
						: paper.summary;
				const pdfUrl = `${paper.link.replace("/abs/", "/pdf/")}.pdf`;

				return {
					type: "article" as const,
					id: arxivId,
					title: paper.title,
					description: `${authors}${moreAuthors} • ${paper.published}`,
					url: paper.link,
					input_message_content: {
						message_text: `📄 *${paper.title}*\n\n👥 ${authors}${moreAuthors}\n📅 ${paper.published}\n\n📝 _${shortSummary}_\n\n🔗 [View on arXiv](${paper.link}) | [PDF](${pdfUrl})`,
						parse_mode: "Markdown" as const,
					},
				};
			});

			logger.info("Answering inline query", {
				query,
				resultsCount: results.length,
			});

			await context.answerInlineQuery(results, {
				cache_time: 300,
				is_personal: false,
			});
		} catch (error) {
			logger.error("Failed to handle inline query", {
				query,
				error: error instanceof Error ? error.message : String(error),
			});

			await context.answerInlineQuery(
				[
					{
						type: "article",
						id: "error",
						title: "Search failed",
						description: "An error occurred. Please try again.",
						input_message_content: {
							message_text: "❌ Search failed. Please try again later.",
						},
					},
				],
				{ cache_time: 10, is_personal: false },
			);
		}
	});
