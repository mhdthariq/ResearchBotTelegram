/**
 * Subscription Worker
 *
 * Background worker that processes due subscriptions and sends
 * periodic paper updates to subscribed users.
 *
 * Features:
 * - Fetches new papers from arXiv for each subscription topic
 * - Filters out already-viewed papers
 * - Sends formatted updates to users via Telegram
 * - Rate limits notifications to avoid API limits
 * - Updates lastRunAt timestamp after successful processing
 *
 * Can be triggered via:
 * - Vercel Cron Jobs (see api/cron/subscriptions.ts)
 * - Manual API endpoint
 * - Direct function call for local development
 */

import { InlineKeyboard } from "gramio";
import type { ArxivCategory, Paper } from "../arxiv.js";
import { fetchPapers, formatSummary, searchPapersAdvanced } from "../arxiv.js";
import { bot } from "../bot/index.js";
import {
	getViewedPaperIds,
	markPapersAsViewed,
} from "../db/repositories/paperViewRepository.js";
import {
	getDueSubscriptions,
	updateSubscriptionLastRun,
} from "../db/repositories/subscriptionRepository.js";
import { findUserById } from "../db/repositories/userRepository.js";
import type { Subscription } from "../db/schema.js";
import { logger } from "../utils/logger.js";

/**
 * Result of processing a single subscription
 */
export interface SubscriptionProcessResult {
	subscriptionId: number;
	userId: number;
	topic: string;
	success: boolean;
	papersFound: number;
	papersSent: number;
	error?: string;
}

/**
 * Result of running the subscription worker
 */
export interface WorkerResult {
	processed: number;
	successful: number;
	failed: number;
	results: SubscriptionProcessResult[];
	durationMs: number;
}

/**
 * Configuration for the subscription worker
 */
export interface WorkerConfig {
	/** Maximum subscriptions to process per run (default: 50) */
	maxSubscriptions?: number;
	/** Maximum papers to fetch per subscription (default: 5) */
	maxPapersPerSubscription?: number;
	/** Delay between sending notifications in ms (default: 1000) */
	notificationDelay?: number;
	/** Whether to mark sent papers as viewed (default: true) */
	markAsViewed?: boolean;
	/** Dry run - don't actually send notifications (default: false) */
	dryRun?: boolean;
}

const DEFAULT_CONFIG: Required<WorkerConfig> = {
	maxSubscriptions: 50,
	maxPapersPerSubscription: 5,
	notificationDelay: 1000,
	markAsViewed: true,
	dryRun: false,
};

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract arXiv ID from a paper link
 */
function extractArxivId(link: string): string {
	// Format: http://arxiv.org/abs/2301.00001v1
	const match = link.match(/arxiv\.org\/abs\/([^\s/]+)/);
	if (match?.[1]) {
		// Remove version suffix if present (e.g., v1, v2)
		return match[1].replace(/v\d+$/, "");
	}
	return link;
}

/**
 * Format a single paper for display in notification
 */
function formatPaperForNotification(paper: Paper, index: number): string {
	const arxivId = extractArxivId(paper.link);
	const shortSummary = formatSummary(paper.summary, 150);
	const authors = paper.authors?.slice(0, 3).join(", ") || "Unknown";
	const moreAuthors =
		paper.authors && paper.authors.length > 3
			? ` +${paper.authors.length - 3} more`
			: "";

	return (
		`*${index}. ${escapeMarkdown(paper.title)}*\n` +
		`👤 ${escapeMarkdown(authors)}${moreAuthors}\n` +
		`📅 ${paper.published}\n` +
		`📝 ${escapeMarkdown(shortSummary)}\n` +
		`🔗 [arXiv:${arxivId}](${paper.link})`
	);
}

/**
 * Escape special characters for Telegram MarkdownV2
 */
function escapeMarkdown(text: string): string {
	return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

/**
 * Format subscription update message
 */
function formatSubscriptionMessage(
	topic: string,
	papers: Paper[],
	totalNew: number,
): string {
	const header = `📬 *New papers for: ${escapeMarkdown(topic)}*\n\n`;
	const papersList = papers
		.map((p, i) => formatPaperForNotification(p, i + 1))
		.join("\n\n");

	const footer =
		totalNew > papers.length
			? `\n\n_Showing ${papers.length} of ${totalNew} new papers_`
			: "";

	return header + papersList + footer;
}

/**
 * Create keyboard for subscription notification
 */
function createNotificationKeyboard(
	topic: string,
	papers: Paper[],
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	// Add bookmark buttons for first 3 papers
	const papersToShow = papers.slice(0, 3);
	for (const paper of papersToShow) {
		const arxivId = extractArxivId(paper.link);
		keyboard.text(`📑 ${arxivId}`, `bookmark:${arxivId}`).row();
	}

	// Add search more button
	keyboard.text(`🔍 Search more "${topic}"`, `search_history:${topic}`).row();

	// Add manage subscription button
	keyboard.text("⚙️ Manage Subscriptions", "action:subscriptions");

	return keyboard;
}

/**
 * Fetch papers for a subscription topic
 */
async function fetchPapersForSubscription(
	subscription: Subscription,
	maxPapers: number,
): Promise<Paper[]> {
	try {
		if (subscription.category) {
			// Use advanced search with category filter
			return await searchPapersAdvanced({
				query: subscription.topic,
				category: subscription.category as ArxivCategory,
				maxResults: maxPapers,
				sortBy: "submittedDate",
				sortOrder: "descending",
			});
		}

		// Simple topic search
		return await fetchPapers(subscription.topic, 0, maxPapers);
	} catch (error) {
		logger.error("Failed to fetch papers for subscription", {
			subscriptionId: subscription.id,
			topic: subscription.topic,
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}

/**
 * Send notification to user
 */
async function sendNotification(
	chatId: number,
	message: string,
	keyboard: InlineKeyboard,
	dryRun: boolean,
): Promise<boolean> {
	if (dryRun) {
		logger.info("DRY RUN: Would send notification", { chatId });
		return true;
	}

	try {
		await bot.api.sendMessage({
			chat_id: chatId,
			text: message,
			parse_mode: "MarkdownV2",
			reply_markup: keyboard,
			link_preview_options: { is_disabled: true },
		});
		return true;
	} catch (error) {
		logger.error("Failed to send subscription notification", {
			chatId,
			error: error instanceof Error ? error.message : String(error),
		});
		return false;
	}
}

/**
 * Process a single subscription
 */
async function processSubscription(
	subscription: Subscription,
	config: Required<WorkerConfig>,
): Promise<SubscriptionProcessResult> {
	const result: SubscriptionProcessResult = {
		subscriptionId: subscription.id,
		userId: subscription.userId,
		topic: subscription.topic,
		success: false,
		papersFound: 0,
		papersSent: 0,
	};

	try {
		// Get user info for chat ID
		const user = await findUserById(subscription.userId);
		if (!user) {
			result.error = "User not found";
			logger.warn("User not found for subscription", {
				subscriptionId: subscription.id,
				userId: subscription.userId,
			});
			return result;
		}

		// Fetch papers for this subscription
		const papers = await fetchPapersForSubscription(
			subscription,
			config.maxPapersPerSubscription * 2, // Fetch more to account for filtering
		);

		if (papers.length === 0) {
			// No papers found, but still update lastRunAt
			await updateSubscriptionLastRun(subscription.id);
			result.success = true;
			return result;
		}

		result.papersFound = papers.length;

		// Extract arXiv IDs
		const arxivIds = papers.map((p) => extractArxivId(p.link));

		// Filter out already-viewed papers
		const viewedIds = await getViewedPaperIds(subscription.userId, arxivIds);
		const newPapers = papers.filter(
			(p) => !viewedIds.has(extractArxivId(p.link)),
		);

		if (newPapers.length === 0) {
			// All papers already viewed, update lastRunAt
			await updateSubscriptionLastRun(subscription.id);
			result.success = true;
			logger.debug("No new papers for subscription", {
				subscriptionId: subscription.id,
				topic: subscription.topic,
				allViewed: papers.length,
			});
			return result;
		}

		// Limit papers to send
		const papersToSend = newPapers.slice(0, config.maxPapersPerSubscription);

		// Format and send notification
		const message = formatSubscriptionMessage(
			subscription.topic,
			papersToSend,
			newPapers.length,
		);
		const keyboard = createNotificationKeyboard(
			subscription.topic,
			papersToSend,
		);

		const sent = await sendNotification(
			user.chatId,
			message,
			keyboard,
			config.dryRun,
		);

		if (sent) {
			result.papersSent = papersToSend.length;

			// Mark sent papers as viewed
			if (config.markAsViewed && !config.dryRun) {
				const sentArxivIds = papersToSend.map((p) => extractArxivId(p.link));
				await markPapersAsViewed(subscription.userId, sentArxivIds);
			}

			// Update lastRunAt
			if (!config.dryRun) {
				await updateSubscriptionLastRun(subscription.id);
			}

			result.success = true;

			logger.info("Sent subscription update", {
				subscriptionId: subscription.id,
				userId: subscription.userId,
				topic: subscription.topic,
				papersSent: papersToSend.length,
				totalNew: newPapers.length,
			});
		} else {
			result.error = "Failed to send notification";
		}
	} catch (error) {
		result.error = error instanceof Error ? error.message : String(error);
		logger.error("Error processing subscription", {
			subscriptionId: subscription.id,
			error: result.error,
		});
	}

	return result;
}

/**
 * Main worker function - processes all due subscriptions
 *
 * @param config - Worker configuration
 * @returns Worker result with statistics
 *
 * @example
 * // Run with default settings
 * const result = await processSubscriptions();
 *
 * @example
 * // Run as dry run (no notifications sent)
 * const result = await processSubscriptions({ dryRun: true });
 *
 * @example
 * // Run with custom limits
 * const result = await processSubscriptions({
 *   maxSubscriptions: 10,
 *   maxPapersPerSubscription: 3,
 * });
 */
export async function processSubscriptions(
	config: WorkerConfig = {},
): Promise<WorkerResult> {
	const startTime = Date.now();
	const mergedConfig: Required<WorkerConfig> = {
		...DEFAULT_CONFIG,
		...config,
	};

	logger.info("Starting subscription worker", {
		config: mergedConfig,
	});

	const result: WorkerResult = {
		processed: 0,
		successful: 0,
		failed: 0,
		results: [],
		durationMs: 0,
	};

	try {
		// Get all due subscriptions
		const dueSubscriptions = await getDueSubscriptions(
			mergedConfig.maxSubscriptions,
		);

		if (dueSubscriptions.length === 0) {
			logger.info("No due subscriptions to process");
			result.durationMs = Date.now() - startTime;
			return result;
		}

		logger.info("Found due subscriptions", {
			count: dueSubscriptions.length,
		});

		// Process each subscription
		for (const subscription of dueSubscriptions) {
			const subscriptionResult = await processSubscription(
				subscription,
				mergedConfig,
			);
			result.results.push(subscriptionResult);
			result.processed++;

			if (subscriptionResult.success) {
				result.successful++;
			} else {
				result.failed++;
			}

			// Rate limit between notifications
			if (
				result.processed < dueSubscriptions.length &&
				mergedConfig.notificationDelay > 0
			) {
				await sleep(mergedConfig.notificationDelay);
			}
		}
	} catch (error) {
		logger.error("Subscription worker error", {
			error: error instanceof Error ? error.message : String(error),
		});
	}

	result.durationMs = Date.now() - startTime;

	logger.info("Subscription worker completed", {
		processed: result.processed,
		successful: result.successful,
		failed: result.failed,
		durationMs: result.durationMs,
	});

	return result;
}

/**
 * Get worker status for monitoring
 */
export async function getWorkerStatus(): Promise<{
	dueSubscriptions: number;
	lastRun?: string;
}> {
	const dueSubscriptions = await getDueSubscriptions(1000);
	return {
		dueSubscriptions: dueSubscriptions.length,
	};
}
