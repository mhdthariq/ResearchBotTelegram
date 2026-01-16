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

import { MediaUpload } from "@gramio/files";
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
	exportAllBookmarksToCSV,
	formatBibTeXPreview,
	formatBookmarksListMessage,
	formatCSVTablePreview,
	getBookmarksPaginated,
	getExportBookmarkCount,
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
import { getExportExtension } from "../utils/exportStorage.js";
import { logger } from "../utils/logger.js";

/**
 * Session data structure
 */
interface SessionData {
	lastTopic?: string;
	lastOffset: number;
	userId?: number; // Database user ID
}

// Messages are now handled via i18n translations
// Use t(lang, "key") to get translated messages

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
	return `⏳ You're sending too many requests. Please wait a moment before trying again.\n\n⏱️ Try again in ${resetInSeconds} seconds.`;
}

/**
 * Get the user's preferred language
 */
async function getUserLanguage(chatId: number): Promise<LanguageCode> {
	const user = await findUserByChatId(chatId);
	return (user?.language as LanguageCode) || "en";
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
 * Build the localized start menu message and keyboard
 */
function buildStartMenu(userLang: LanguageCode) {
	const langName = LANGUAGE_NAMES[userLang];

	const keyboard = new InlineKeyboard()
		.text(`🔍 ${t(userLang, "menu.searchPapers")}`, "action:search")
		.text(`📚 ${t(userLang, "menu.myBookmarks")}`, "action:bookmarks")
		.row()
		.text(`📜 ${t(userLang, "menu.history")}`, "action:history")
		.text(`ℹ️ ${t(userLang, "menu.help")}`, "action:help")
		.row()
		.text(`🌐 Language (${langName})`, "action:language");

	const message = format`
👋 ${bold`${t(userLang, "menu.welcome")}`}

${t(userLang, "menu.description")}

${bold`${t(userLang, "menu.whatICan")}`}
🔍 ${t(userLang, "menu.searchDesc")}
⭐ ${t(userLang, "menu.bookmarkDesc")}
📜 ${t(userLang, "menu.historyDesc")}
📥 ${t(userLang, "menu.exportDesc")}

${t(userLang, "menu.useButtons")}

🌐 ${t(userLang, "menu.currentLanguage")} ${langName}
      `;

	return { message, keyboard };
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
				t("en", "ui.errorOccurred"),
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

		const { message, keyboard } = buildStartMenu(userLang);

		return context.send(message, { reply_markup: keyboard });
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
		keyboard.text(t(userLang, "buttons.back"), "action:back_to_start");

		return context.send(
			format`
${bold`🌐 ${t(userLang, "language.title")}`}

${t(userLang, "language.current", { language: LANGUAGE_NAMES[userLang] })}

${t(userLang, "language.select")}
      `,
			{ reply_markup: keyboard },
		);
	})

	.command("help", async (context) => {
		// Rate limit check
		if (!checkRateLimit(context.chatId, { maxRequests: 60 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userLang = await getUserLanguage(context.chatId);

		return context.send(
			format`
${bold`${t(userLang, "helpPage.title")}`}

${bold`${t(userLang, "helpPage.searchCommands")}`}
${t(userLang, "helpPage.searchTopic")}
${t(userLang, "helpPage.searchAuthor")}
${t(userLang, "helpPage.browseCategory")}
${t(userLang, "helpPage.findSimilar")}

${bold`${t(userLang, "helpPage.historyBookmarks")}`}
${t(userLang, "helpPage.viewBookmarks")}
${t(userLang, "helpPage.savePaper")}
${t(userLang, "helpPage.viewHistory")}
${t(userLang, "helpPage.viewStats")}
${t(userLang, "helpPage.exportBibtex")}

${bold`${t(userLang, "helpPage.subscriptionsTitle")}`}
${t(userLang, "helpPage.subscribeTopic")}
${t(userLang, "helpPage.manageSubscriptions")}
${t(userLang, "helpPage.unsubscribeTopic")}

${bold`${t(userLang, "helpPage.loadMore")}`}

${t(userLang, "search.tip")}
      `,
		);
	})

	.command("bookmarks", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userLang = await getUserLanguage(context.chatId);
		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send(t(userLang, "bookmarks.couldNotLoad"));
		}

		const { bookmarks, total, hasMore } = await getBookmarksPaginated(
			userId,
			1,
			5,
		);

		if (bookmarks.length === 0) {
			const keyboard = new InlineKeyboard().text(
				t(userLang, "buttons.searchPapers"),
				"action:search",
			);

			return context.send(t(userLang, "bookmarks.empty"), {
				reply_markup: keyboard,
			});
		}

		const message = format`${bold`${t(userLang, "bookmarks.title")}`} (${t(userLang, "bookmarks.total", { count: String(total) })})\n\n${formatBookmarksListMessage(bookmarks, 0, userLang)}`;
		const keyboard = createBookmarksKeyboard(1, hasMore, total, userLang);

		return context.send(message, { reply_markup: keyboard });
	})

	// --- SAVE COMMAND ---
	.command("save", async (context) => {
		if (!checkRateLimit(context.chatId, { maxRequests: 30, windowMs: 60000 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userLang = await getUserLanguage(context.chatId);
		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send(t(userLang, "errors.couldNotSave"));
		}

		// Get the arXiv ID or URL from command argument
		const args = context.text?.replace(/^\/save\s*/, "").trim();

		if (!args) {
			return context.send(
				format`${bold`${t(userLang, "save.title")}`}

${t(userLang, "save.usage")}

${bold`Usage:`}
${t(userLang, "save.example")}

${bold`Tip:`} ${t(userLang, "save.tip")}`,
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
				format`${t(userLang, "validation.invalidArxivId")}

${bold`${t(userLang, "validation.validFormats")}`}
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
				format`${t(userLang, "validation.alreadyBookmarked")}

${t(userLang, "validation.useBookmarksToView")}`,
			);
		}

		// Fetch the paper from arXiv
		context.send(t(userLang, "save.fetching"));

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
			return context.send(t(userLang, "errors.couldNotSave"));
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
			.text(t(userLang, "bookmarks.viewBookmarks"), "action:bookmarks")
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

		const userLang = await getUserLanguage(context.chatId);
		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send(t(userLang, "error"));
		}

		const recentSearches = await getRecentSearches(userId, 6);

		if (recentSearches.length === 0) {
			const keyboard = new InlineKeyboard().text(
				t(userLang, "buttons.searchPapers"),
				"action:search",
			);

			return context.send(
				`${t(userLang, "history.noHistory")}\n\n${t(userLang, "history.startSearching")}`,
				{
					reply_markup: keyboard,
				},
			);
		}

		const keyboard = createRecentSearchesKeyboard(recentSearches, 6, userLang);

		return context.send(
			format`${bold`${t(userLang, "history.recentSearches")}`}\n\n${t(userLang, "history.tapToSearch")}`,
			{ reply_markup: keyboard },
		);
	})

	.command("stats", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userLang = await getUserLanguage(context.chatId);
		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send(t(userLang, "errors.couldNotProcess"));
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

		const userLang = await getUserLanguage(context.chatId);
		let authorName = context.args ?? "";

		if (!authorName) {
			const answer = await context.prompt(
				"message",
				t(userLang, "author.prompt"),
			);
			authorName = answer.text || "";
		}

		authorName = authorName.trim();
		if (!authorName) {
			return context.send(
				`${t(userLang, "author.usage")}\n${t(userLang, "author.example")}`,
			);
		}

		await context.send(t(userLang, "author.searching", { name: authorName }));

		const papers = await searchByAuthor(authorName, 5);

		if (!papers.length) {
			return context.send(
				t(userLang, "author.noResults", { name: authorName }),
			);
		}

		const message = format`${bold`${t(userLang, "author.results", { name: authorName })}`}\n\n${formatPapersMessage(papers)}`;

		const keyboard = new InlineKeyboard().text(
			t(userLang, "search.newSearch"),
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

		const userLang = await getUserLanguage(context.chatId);
		return context.send(
			format`${bold`${t(userLang, "categories.browseByCategory")}`}\n\n${t(userLang, "categories.select")}`,
			{ reply_markup: keyboard },
		);
	})

	.command("export", async (context) => {
		if (!checkRateLimit(context.chatId)) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userLang = await getUserLanguage(context.chatId);
		const userId = await ensureUser(context.chatId, context.research_session);
		if (!userId) {
			return context.send(t(userLang, "errors.couldNotExport"));
		}

		// Check if user has bookmarks
		const bookmarkCount = await getExportBookmarkCount(userId);

		if (bookmarkCount === 0) {
			return context.send(t(userLang, "bookmarks.exportEmpty"));
		}

		// Show format selection keyboard
		const keyboard = new InlineKeyboard()
			.text(`📄 ${t(userLang, "ui.bibtexFormat")} (.bib)`, "export:bibtex")
			.text(`📊 ${t(userLang, "ui.csvFormat")} (.csv)`, "export:csv")
			.row()
			.text(t(userLang, "ui.cancelButton"), "export:cancel");

		return context.send(
			format`${bold`${t(userLang, "export.title")}`}

${t(userLang, "ui.paperCount", { count: String(bookmarkCount) })}

${t(userLang, "export.selectFormat")}

${bold`${t(userLang, "ui.bibtexFormat")}`} - ${t(userLang, "ui.forLatex")}
${bold`${t(userLang, "ui.csvFormat")}`} - ${t(userLang, "ui.forSpreadsheets")}`,
			{ reply_markup: keyboard },
		);
	})

	// --- CALLBACK QUERIES ---

	.on("callback_query", async (context) => {
		const data = context.data;
		if (!data) return;

		// Rate limit check for callbacks
		const chatId = context.message?.chat?.id;
		if (chatId && !checkRateLimit(chatId)) {
			await context.answer({
				text: t("en", "callbacks.tooManyRequests"),
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
				case "search": {
					await context.answer();
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					await context.message?.send(t(userLang, "search.prompt"));
					break;
				}

				case "more": {
					await context.answer();
					const topic = context.research_session?.lastTopic;
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					if (!topic) {
						await context.message?.send(t(userLang, "search.useSearchFirst"));
					} else {
						const nextOffset = (context.research_session?.lastOffset || 0) + 5;
						context.research_session.lastOffset = nextOffset;

						await context.message?.send(
							t(userLang, "search.loadingMore", { topic }),
						);

						const papers = await fetchPapers(topic, nextOffset);
						if (!papers.length) {
							await context.message?.send(t(userLang, "search.noMorePapers"));
						} else {
							const message = formatPapersMessage(papers, nextOffset);
							await context.message?.send(message);
						}
					}
					break;
				}

				case "bookmarks": {
					await context.answer();
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					if (!userId) {
						await context.message?.send(t(userLang, "commands.bookmarks"));
						return;
					}
					// Redirect to bookmarks command logic
					const { bookmarks, total, hasMore } = await getBookmarksPaginated(
						userId,
						1,
						5,
					);
					if (bookmarks.length === 0) {
						await context.message?.send(t(userLang, "bookmarks.empty"));
					} else {
						const msg = format`${bold`${t(userLang, "bookmarks.title")}`} (${t(userLang, "bookmarks.total", { count: String(total) })})\n\n${formatBookmarksListMessage(bookmarks, 0, userLang)}`;
						await context.message?.send(msg, {
							reply_markup: createBookmarksKeyboard(
								1,
								hasMore,
								total,
								userLang,
							),
						});
					}
					break;
				}

				case "history": {
					await context.answer();
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					if (!userId) {
						await context.message?.send(t(userLang, "commands.history"));
						return;
					}
					const recentSearches = await getRecentSearches(userId, 6);
					if (recentSearches.length === 0) {
						await context.message?.send(t(userLang, "history.noHistory"));
					} else {
						await context.message?.send(
							format`${bold`${t(userLang, "history.recentSearches")}`}\n\n${t(userLang, "history.tapToSearch")}`,
							{
								reply_markup: createRecentSearchesKeyboard(
									recentSearches,
									6,
									userLang,
								),
							},
						);
					}
					break;
				}

				case "help": {
					await context.answer();
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					await context.message?.send(
						format`
${bold`${t(userLang, "helpPage.title")}`}

${bold`${t(userLang, "helpPage.searchTopic")}`}
${bold`${t(userLang, "helpPage.searchAuthor")}`}
${bold`${t(userLang, "helpPage.viewBookmarks")}`}
${bold`${t(userLang, "helpPage.savePaper")}`}
${bold`${t(userLang, "helpPage.viewHistory")}`}
${bold`${t(userLang, "helpPage.loadMore")}`}

${t(userLang, "search.tip")}
          `,
					);
					break;
				}

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
					langKeyboard.text(
						t(userLang, "buttons.back"),
						"action:back_to_start",
					);

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

					const { message: startMessage, keyboard: startKeyboard } =
						buildStartMenu(userLang);

					await context.message?.editText(startMessage, {
						reply_markup: startKeyboard,
					});
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
					text: t("en", "callbacks.pleaseStartFirst"),
					show_alert: true,
				});
				return;
			}

			// Get user to update
			const user = await findUserByChatId(chatId);
			if (!user) {
				await context.answer({
					text: t("en", "callbacks.userNotFound"),
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

			// Show confirmation and return to start menu with new language
			const { message: newMessage, keyboard: newKeyboard } =
				buildStartMenu(newLang);

			// Prepend the language changed confirmation
			const confirmationMessage = `${t(newLang, "language.changed", { language: langName })}\n\n${newMessage}`;

			await context.message?.editText(confirmationMessage, {
				reply_markup: newKeyboard,
			});
			return;
		}

		// --- Bookmark handlers ---
		if (data.startsWith("bookmark:")) {
			const arxivId = data.replace("bookmark:", "");
			await context.answer();

			if (!userId) {
				await context.answer({
					text: t("en", "callbacks.pleaseStartFirst"),
					show_alert: true,
				});
				return;
			}

			const paper = await fetchPaperById(arxivId);
			if (!paper) {
				await context.answer({
					text: t("en", "callbacks.couldNotFetchPaper"),
					show_alert: true,
				});
				return;
			}

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const bookmark = await addBookmark(userId, paper);
			if (bookmark) {
				await context.answer({
					text: t(userLang, "bookmarks.added"),
					show_alert: true,
				});
				// Update keyboard to show bookmarked state
				// Note: editReplyMarkup has typing issues, skip for now
			} else {
				await context.answer({
					text: t(userLang, "bookmarks.exists"),
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

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const removed = await removeBookmark(userId, arxivId);
			if (removed) {
				await context.answer({
					text: t(userLang, "bookmarks.removed"),
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

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const { bookmarks, total, hasMore } = await getBookmarksPaginated(
				userId,
				page,
				5,
			);
			const message = format`${bold`${t(userLang, "bookmarks.title")}`} (${t(userLang, "bookmarks.total", { count: String(total) })})\n\n${formatBookmarksListMessage(bookmarks, (page - 1) * 5, userLang)}`;

			try {
				await context.message?.editText(message, {
					reply_markup: createBookmarksKeyboard(page, hasMore, total, userLang),
				});
			} catch {
				// Ignore edit errors
			}
			return;
		}

		if (data === "bookmarks:clear") {
			await context.answer({
				text: t("en", "callbacks.clearBookmarksHint"),
				show_alert: true,
			});
			return;
		}

		// --- History handlers ---
		if (data.startsWith("history:page:")) {
			const page = parseInt(data.replace("history:page:", ""), 10);
			await context.answer();

			if (!userId || Number.isNaN(page)) return;

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const { history, hasMore } = await getSearchHistoryPaginated(
				userId,
				page,
				10,
			);
			const message = formatHistoryMessage(history, (page - 1) * 10, userLang);

			try {
				await context.message?.editText(message, {
					reply_markup: createHistoryKeyboard(page, hasMore, userLang),
				});
			} catch {
				// Ignore edit errors
			}
			return;
		}

		if (data === "history:full") {
			await context.answer();
			if (!userId) return;

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const { history, hasMore } = await getSearchHistoryPaginated(
				userId,
				1,
				10,
			);
			const message = formatHistoryMessage(history, 0, userLang);

			await context.message?.send(message, {
				reply_markup: createHistoryKeyboard(1, hasMore, userLang),
			});
			return;
		}

		if (data === "history:clear") {
			await context.answer();
			if (!userId) return;

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const cleared = await clearHistory(userId);
			if (cleared) {
				await context.answer({
					text: t(userLang, "history.cleared"),
					show_alert: true,
				});
				try {
					await context.message?.editText(t(userLang, "history.cleared"), {
						reply_markup: new InlineKeyboard().text(
							t(userLang, "buttons.search"),
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

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			await context.message?.send(t(userLang, "search.searching"));

			const papers = await fetchPapers(query);

			if (userId) {
				await recordSearch(userId, query, papers.length);
			}

			if (!papers.length) {
				await context.message?.send(t(userLang, "search.noResults"));
				return;
			}

			const message = formatPapersMessage(papers);
			const keyboard = new InlineKeyboard()
				.text(t(userLang, "buttons.loadMore"), "action:more")
				.text(t(userLang, "search.newSearch"), "action:search");

			await context.message?.send(message, { reply_markup: keyboard });
			return;
		}

		// --- Category search ---
		if (data.startsWith("category:")) {
			const category = data.replace("category:", "");
			await context.answer();

			const catUser = chatId ? await findUserByChatId(chatId) : null;
			const catUserLang = (catUser?.language as LanguageCode) || "en";

			await context.message?.send(
				t(catUserLang, "categoryBrowse.loading", {
					category: ARXIV_CATEGORIES[category] || category,
				}),
			);

			const papers = await searchByCategory(category, 5);

			if (!papers.length) {
				await context.message?.send(
					t(catUserLang, "categoryBrowse.noResults", { category }),
				);
				return;
			}

			const message = format`${bold`📂 ${ARXIV_CATEGORIES[category] || category}`}\n\n${formatPapersMessage(papers)}`;
			const keyboard = new InlineKeyboard()
				.text(t(catUserLang, "search.newSearch"), "action:search")
				.text(t(catUserLang, "categories.title"), "action:categories");

			await context.message?.send(message, { reply_markup: keyboard });
			return;
		}

		// --- Abstract expansion ---
		if (data.startsWith("abstract:")) {
			const arxivId = data.replace("abstract:", "");
			await context.answer();

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const paper = await fetchPaperById(arxivId);
			if (!paper) {
				await context.message?.send(t(userLang, "errors.couldNotFetch"));
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

			const keyboard = createPaperActionsKeyboard(
				arxivId,
				isBookmarkedPaper,
				userLang,
			);

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

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const paper = await fetchPaperById(arxivId);
			if (!paper) {
				await context.message?.send(t(userLang, "errors.couldNotFetch"));
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
			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			await context.message?.send(t(userLang, "subscriptions.prompt"));
			return;
		}

		if (data === "action:subscriptions") {
			await context.answer();
			if (!userId) {
				const user = chatId ? await findUserByChatId(chatId) : null;
				const userLang = (user?.language as LanguageCode) || "en";
				await context.message?.send(t(userLang, "commands.subscriptions"));
				return;
			}

			const { subscriptions, count } = await getSubscriptionsList(userId);

			if (count === 0) {
				const user = chatId ? await findUserByChatId(chatId) : null;
				const userLang = (user?.language as LanguageCode) || "en";
				const keyboard = new InlineKeyboard()
					.text(
						t(userLang, "subscriptions.addSubscription"),
						"action:add_subscription",
					)
					.row()
					.text(t(userLang, "buttons.searchPapers"), "action:search");

				await context.message?.send(t(userLang, "subscriptions.empty"), {
					reply_markup: keyboard,
				});
			} else {
				const user = chatId ? await findUserByChatId(chatId) : null;
				const userLang = (user?.language as LanguageCode) || "en";
				const subscriptionsList = formatSubscriptionsMessage(subscriptions);
				const keyboard = createSubscriptionsKeyboard(subscriptions);
				await context.message?.send(
					format`${bold(t(userLang, "ui.yourSubscriptions"))}\n\n${subscriptionsList}\n\n${t(userLang, "ui.tapToManage")}`,
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
					text: t("en", "callbacks.subscriptionNotFound"),
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
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					await context.message?.editText(
						`${t(userLang, "subscriptions.noSubscriptions")}\n\n${t(userLang, "subscriptions.useSubscribe")}`,
						{
							reply_markup: new InlineKeyboard()
								.text(
									t(userLang, "subscriptions.addSubscription"),
									"action:add_subscription",
								)
								.row()
								.text(t(userLang, "buttons.searchPapers"), "action:search"),
						},
					);
				} catch {
					// Ignore edit errors
				}
			} else {
				try {
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					const subscriptionsList = formatSubscriptionsMessage(subscriptions);
					await context.message?.editText(
						format`${bold(t(userLang, "ui.yourSubscriptions"))}\n\n${subscriptionsList}\n\n${t(userLang, "ui.tapToManage")}`,
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
					text: t("en", "callbacks.subscriptionNotFound"),
					show_alert: true,
				});
				return;
			}

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const message = `${t(userLang, "subscriptions.settings")}\n\n${t(userLang, "subscriptions.topic")}: ${subscription.topic}\n⏱️ ${t(userLang, "subscriptions.interval")}: ${subscription.intervalHours || 24} ${t(userLang, "time.hours")}\n${t(userLang, "subscriptions.category")}: ${subscription.category || "All"}`;

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

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";

			try {
				await context.message?.editText(
					t(userLang, "ui.selectFrequency", { topic: subscription.topic }),
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
				const user = chatId ? await findUserByChatId(chatId) : null;
				const userLang = (user?.language as LanguageCode) || "en";

				await context.answer({
					text: t(userLang, "callbacks.intervalUpdated", {
						hours: String(intervalHours),
					}),
					show_alert: true,
				});

				// Go back to subscription settings
				try {
					await context.message?.editText(
						`${t(userLang, "ui.settingsHeader")}\n\n${t(userLang, "subscriptions.topic")}: ${updated.topic}\n${t(userLang, "ui.intervalLabel")}: ${intervalHours} ${t(userLang, "time.hours")}\n${t(userLang, "ui.categoryLabel")}: ${updated.category || "All"}`,
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

			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";

			await context.message?.send(t(userLang, "similar.searching"));

			const similarPapers = await getSimilarPapersById(arxivId, {
				maxResults: 5,
			});

			if (!similarPapers || similarPapers.length === 0) {
				await context.message?.send(t(userLang, "similar.noResults"));
				return;
			}

			const message = format`${bold`${t(userLang, "papers.similarPapers")}`}\n\n${formatPapersMessage(similarPapers)}`;

			const keyboard = new InlineKeyboard().text(
				t(userLang, "search.newSearch"),
				"action:search",
			);

			await context.message?.send(message, { reply_markup: keyboard });
			return;
		}

		// --- Export format handlers ---
		if (data.startsWith("export:")) {
			const exportType = data.replace("export:", "");
			await context.answer();

			if (exportType === "cancel") {
				try {
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					await context.message?.editText(t(userLang, "export.cancelled"), {
						reply_markup: new InlineKeyboard().text(
							t(userLang, "bookmarks.viewBookmarks"),
							"action:bookmarks",
						),
					});
				} catch {
					// Ignore edit errors
				}
				return;
			}

			if (!userId || !chatId) {
				const user = chatId ? await findUserByChatId(chatId) : null;
				const userLang = (user?.language as LanguageCode) || "en";
				await context.message?.send(t(userLang, "commands.export"));
				return;
			}

			// Generate export content based on format
			let content: string;
			let filename: string;
			let preview: string;
			const exportFormat = exportType as "bibtex" | "csv";

			if (exportFormat === "bibtex") {
				content = await exportAllBookmarksToBibTeX(userId);
				filename = `bookmarks_${Date.now()}${getExportExtension("bibtex")}`;
				preview = formatBibTeXPreview(content, 2);
			} else if (exportFormat === "csv") {
				content = await exportAllBookmarksToCSV(userId);
				filename = `bookmarks_${Date.now()}${getExportExtension("csv")}`;
				preview = await formatCSVTablePreview(userId, 5);
			} else {
				const user = chatId ? await findUserByChatId(chatId) : null;
				const userLang = (user?.language as LanguageCode) || "en";
				await context.message?.send(t(userLang, "errors.invalidExportFormat"));
				return;
			}

			if (!content) {
				const user = chatId ? await findUserByChatId(chatId) : null;
				const userLang = (user?.language as LanguageCode) || "en";
				await context.message?.send(t(userLang, "bookmarks.exportEmpty"));
				return;
			}

			// Update message to show processing
			const user = chatId ? await findUserByChatId(chatId) : null;
			const userLang = (user?.language as LanguageCode) || "en";
			const formatName =
				exportFormat === "bibtex"
					? t(userLang, "ui.bibtexFormat")
					: t(userLang, "ui.csvFormat");
			try {
				await context.message?.editText(
					t(userLang, "ui.exportPreparing", { format: formatName }),
					{
						reply_markup: new InlineKeyboard(),
					},
				);
			} catch {
				// Ignore edit errors
			}

			try {
				// Convert content to a file buffer and send as document
				const fileBuffer = Buffer.from(content, "utf-8");
				const file = MediaUpload.buffer(fileBuffer, filename);

				// Send the document with preview as caption
				const captionText =
					exportFormat === "bibtex"
						? `📄 ${t(userLang, "ui.bibtexFormat")} Export\n\n${preview}`
						: `📊 ${t(userLang, "ui.csvFormat")} Export\n\n${preview}`;

				// Truncate caption if too long (Telegram limit is 1024 chars)
				const truncatedCaption =
					captionText.length > 1000
						? `${captionText.substring(0, 997)}...`
						: captionText;

				await bot.api.sendDocument({
					chat_id: chatId,
					document: file,
					caption: truncatedCaption,
					parse_mode: "Markdown",
				});

				// Update original message to confirm success
				try {
					await context.message?.editText(
						t(userLang, "ui.exportSuccess", { format: formatName }),
						{
							reply_markup: new InlineKeyboard()
								.text(
									t(userLang, "bookmarks.viewBookmarks"),
									"action:bookmarks",
								)
								.text(t(userLang, "search.newSearch"), "action:search"),
						},
					);
				} catch {
					// Ignore edit errors
				}

				logger.info("Export sent as document", {
					userId,
					format: exportFormat,
					filename,
					size: fileBuffer.length,
				});
			} catch (docError) {
				logger.error("Failed to send document", {
					error:
						docError instanceof Error ? docError.message : String(docError),
				});

				// Fallback: send preview as message with content as code block for BibTeX
				// or as plain text for CSV
				try {
					if (exportFormat === "bibtex") {
						// For BibTeX, show as code block
						const maxLength = 3500;
						const truncated = content.length > maxLength;
						const displayContent = truncated
							? `${content.substring(0, maxLength)}\n\n... (truncated, ${content.length - maxLength} more characters)`
							: content;

						await context.message?.editText(
							`📄 ${bold`${t(userLang, "ui.bibtexFormat")} Export`}\n\nCopy the content below:\n\n\`\`\`\n${displayContent}\n\`\`\``,
							{
								parse_mode: "Markdown",
								reply_markup: new InlineKeyboard().text(
									t(userLang, "ui.viewBookmarksButton"),
									"action:bookmarks",
								),
							},
						);
					} else {
						// For CSV, show table preview and raw content
						await context.message?.editText(
							`📊 ${bold`${t(userLang, "ui.csvFormat")} Export`}\n\n${preview}\n\n_Full CSV content sent as text below._`,
							{
								parse_mode: "Markdown",
								reply_markup: new InlineKeyboard().text(
									t(userLang, "ui.viewBookmarksButton"),
									"action:bookmarks",
								),
							},
						);

						// Send CSV content as plain text (no markdown to avoid parsing issues)
						const maxLength = 4000;
						const truncated = content.length > maxLength;
						const displayContent = truncated
							? `${content.substring(0, maxLength)}\n\n... (truncated)`
							: content;
						await context.message?.send(displayContent);
					}
				} catch {
					// Last resort fallback
					const user = chatId ? await findUserByChatId(chatId) : null;
					const userLang = (user?.language as LanguageCode) || "en";
					await context.message?.send(t(userLang, "errors.couldNotSend"));
				}
			}
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

		const userLang = await getUserLanguage(context.chatId);

		// If no topic provided, ask the user interactively
		if (!topic) {
			const answer = await context.prompt(
				"message",
				t(userLang, "search.prompt"),
			);
			topic = answer.text || "";
		}

		// Validate and sanitize topic
		topic = topic.trim();
		if (!topic) {
			return context.send(t(userLang, "cancel"));
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

		await context.send(t(userLang, "search.searching"));

		const papers = await fetchPapers(topic);

		// Record search in history
		if (userId) {
			await recordSearch(userId, topic, papers.length);
		}

		if (!papers.length) {
			return context.send(t(userLang, "search.noResults"));
		}

		const message = formatPapersMessage(papers);

		// Add navigation keyboard
		const keyboard = new InlineKeyboard()
			.text(t(userLang, "buttons.loadMore"), "action:more")
			.text(t(userLang, "search.newSearch"), "action:search");

		return context.send(message, { reply_markup: keyboard });
	})

	// --- MORE COMMAND ---

	.command("more", async (context) => {
		// Rate limit check
		if (!checkRateLimit(context.chatId, { maxRequests: 20, windowMs: 60000 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userLang = await getUserLanguage(context.chatId);
		const topic = context.research_session.lastTopic;
		if (!topic) {
			return context.send(t(userLang, "search.useSearchFirst"));
		}

		const nextOffset = context.research_session.lastOffset + 5;
		context.research_session.lastOffset = nextOffset;

		logger.debug("Loading more papers", {
			chatId: context.chatId,
			topic,
			offset: nextOffset,
		});

		await context.send(t(userLang, "search.loadingMore", { topic }));

		const papers = await fetchPapers(topic, nextOffset);

		if (!papers.length) {
			return context.send(t(userLang, "search.noMorePapers"));
		}

		const message = formatPapersMessage(papers, nextOffset);

		// Add navigation keyboard
		const keyboard = new InlineKeyboard()
			.text(t(userLang, "buttons.loadMore"), "action:more")
			.text(t(userLang, "search.newSearch"), "action:search");

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

		const userLang = await getUserLanguage(context.chatId);
		if (!userId) {
			return context.send(t(userLang, "errors.couldNotProcess"));
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
			return context.send(t(userLang, "subscriptions.prompt"));
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
		const userLang = await getUserLanguage(context.chatId);
		if (!userId) {
			return context.send(t(userLang, "errors.couldNotProcess"));
		}

		const topic = context.args?.trim();

		if (!topic) {
			// Show list of subscriptions to unsubscribe from
			const { subscriptions, count } = await getSubscriptionsList(userId);
			if (count === 0) {
				return context.send(t(userLang, "subscriptions.noSubscriptions"));
			}

			const keyboard = createSubscriptionsKeyboard(subscriptions);
			return context.send(t(userLang, "subscriptions.selectToRemove"), {
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
		const userLang = await getUserLanguage(context.chatId);
		if (!userId) {
			return context.send(t(userLang, "errors.couldNotProcess"));
		}

		const { subscriptions, count } = await getSubscriptionsList(userId);

		if (count === 0) {
			const keyboard = new InlineKeyboard()
				.text(
					t(userLang, "subscriptions.addSubscription"),
					"action:add_subscription",
				)
				.row()
				.text(t(userLang, "buttons.searchPapers"), "action:search");
			return context.send(t(userLang, "subscriptions.empty"), {
				reply_markup: keyboard,
			});
		}

		const subscriptionsList = formatSubscriptionsMessage(subscriptions);
		const subsKeyboard = createSubscriptionsKeyboard(subscriptions);
		return context.send(
			format`${bold(t(userLang, "ui.yourSubscriptions"))}\n\n${subscriptionsList}\n\n${t(userLang, "ui.tapToManage")}`,
			{ reply_markup: subsKeyboard },
		);
	})

	// --- SIMILAR PAPERS COMMAND ---

	.command("similar", async (context) => {
		if (!checkRateLimit(context.chatId, { maxRequests: 15, windowMs: 60000 })) {
			return context.send(formatRateLimitMessage(context.chatId));
		}

		const userLang = await getUserLanguage(context.chatId);
		const arxivId = context.args?.[0];
		if (!arxivId) {
			return context.send(
				`${t(userLang, "similar.usage")}\n${t(userLang, "similar.example")}\n\n${t(userLang, "similar.hint")}`,
			);
		}

		await context.send(t(userLang, "similar.searching"));

		const similarPapers = await getSimilarPapersById(arxivId, {
			maxResults: 5,
		});

		if (similarPapers === null) {
			return context.send(t(userLang, "similar.notFound", { arxivId }));
		}

		if (similarPapers.length === 0) {
			return context.send(t(userLang, "similar.noResults"));
		}

		const message = format`${bold`${t(userLang, "similar.title")}`}\n\n${formatPapersMessage(similarPapers)}`;

		const keyboard = new InlineKeyboard().text(
			t(userLang, "search.newSearch"),
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
							title: t("en", "inlineQuery.typeToSearch"),
							description: t("en", "inlineQuery.searchDescription"),
							input_message_content: {
								message_text: t("en", "inlineQuery.helpMessage"),
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
							title: t("en", "inlineQuery.noResults", { query }),
							description: t("en", "inlineQuery.tryDifferent"),
							input_message_content: {
								message_text: `❌ ${t("en", "inlineQuery.noResults", { query })}.\n\n${t("en", "inlineQuery.tryDifferent")}`,
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
						title: t("en", "inlineQuery.searchFailed"),
						description: t("en", "inlineQuery.tryAgain"),
						input_message_content: {
							message_text: `❌ ${t("en", "inlineQuery.searchFailed")}. ${t("en", "errors.tryAgain")}`,
						},
					},
				],
				{ cache_time: 10, is_personal: false },
			);
		}
	});
