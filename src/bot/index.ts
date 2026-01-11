/**
 * Telegram Bot instance with session management and error handling
 *
 * Features:
 * - Redis session storage (when configured)
 * - Global error handling
 * - Improved user feedback
 */

import { prompt } from "@gramio/prompt";
import { session } from "@gramio/session";
import { Bot, bold, format, InlineKeyboard } from "gramio";
import { fetchPapers } from "../arxiv";
import { config, isRedisConfigured } from "../config";
import { getErrorMessage } from "../errors";
import { createRedisStorage } from "../storage/redis";
import { logger } from "../utils/logger";

/**
 * Session data structure
 */
interface SessionData {
	lastTopic?: string;
	lastOffset: number;
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
};

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
function formatPapersMessage(
	papers: Awaited<ReturnType<typeof fetchPapers>>,
	startIndex = 0,
): string {
	return papers
		.map(
			(p, i) =>
				format`${bold(`${i + 1 + startIndex}. ${p.title}`)}\n📅 ${p.published}\n🔗 ${p.link}`,
		)
		.join("\n\n");
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

	.command("start", (context) => {
		logger.info("User started bot", { chatId: context.chatId });

		const keyboard = new InlineKeyboard()
			.text("🔍 Search Papers", "action:search")
			.text("📚 Load More", "action:more")
			.row()
			.text("ℹ️ Help", "action:help");

		return context.send(
			format`
👋 ${bold`Welcome to AI Research Assistant!`}

I help you discover the latest research papers from arXiv.

${bold`What I can do:`}
🔍 Search for papers on any topic
📚 Load more results from your last search

Use the buttons below or type commands directly!
      `,
			{ reply_markup: keyboard },
		);
	})

	.command("help", (context) => {
		return context.send(
			format`
${bold`📖 Help & Commands`}

${bold`/search [topic]`} - Search for papers
Example: /search neural networks

${bold`/more`} - Load more results from last search

${bold`/start`} - Show main menu

${bold`/help`} - Show this help message

${MESSAGES.SEARCH_TIP}
      `,
		);
	})

	.on("callback_query", async (context) => {
		const data = context.data;
		if (!data?.startsWith("action:")) return;

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
					// Actually load more papers
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

			case "help":
				await context.answer();
				await context.message?.send(
					format`
${bold`📖 Help & Commands`}

${bold`/search [topic]`} - Search for papers
Example: /search neural networks

${bold`/more`} - Load more results from last search

${bold`/start`} - Show main menu

${MESSAGES.SEARCH_TIP}
          `,
				);
				break;
		}
	})

	.command("search", async (context) => {
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

	.command("more", async (context) => {
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
