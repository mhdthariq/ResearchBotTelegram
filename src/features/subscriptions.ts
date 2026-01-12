/**
 * Subscriptions Feature
 *
 * Allows users to subscribe to research topics and receive periodic updates.
 * Subscriptions are stored in the database and can be managed via bot commands.
 */

import { InlineKeyboard } from "gramio";
import type { ArxivCategory } from "../arxiv.js";
import {
	createSubscription,
	deleteSubscriptionByTopic,
	findSubscription,
	getUserSubscriptionCount,
	getUserSubscriptions,
	reactivateSubscription,
	updateSubscription,
} from "../db/repositories/subscriptionRepository.js";
import type { Subscription } from "../db/schema.js";

/**
 * Maximum subscriptions per user
 */
const MAX_SUBSCRIPTIONS_PER_USER = 10;

/**
 * Default interval in hours for subscription updates
 */
const DEFAULT_INTERVAL_HOURS = 24;

/**
 * Available subscription intervals
 */
export const SUBSCRIPTION_INTERVALS = [
	{ hours: 6, label: "Every 6 hours" },
	{ hours: 12, label: "Every 12 hours" },
	{ hours: 24, label: "Daily" },
	{ hours: 48, label: "Every 2 days" },
	{ hours: 168, label: "Weekly" },
] as const;

/**
 * Result of a subscription operation
 */
export interface SubscriptionResult {
	success: boolean;
	message: string;
	subscription?: Subscription;
}

/**
 * Subscribe a user to a topic
 *
 * @param userId - User ID
 * @param topic - Topic to subscribe to
 * @param options - Additional options
 * @returns Subscription result
 */
export async function subscribe(
	userId: number,
	topic: string,
	options?: {
		category?: ArxivCategory;
		intervalHours?: number;
	},
): Promise<SubscriptionResult> {
	const normalizedTopic = topic.trim().toLowerCase();

	if (!normalizedTopic) {
		return {
			success: false,
			message: "Please provide a topic to subscribe to.",
		};
	}

	if (normalizedTopic.length > 100) {
		return {
			success: false,
			message: "Topic is too long. Please use fewer than 100 characters.",
		};
	}

	// Check if already subscribed
	const existing = await findSubscription(userId, normalizedTopic);
	if (existing) {
		if (existing.isActive) {
			return {
				success: false,
				message: `You're already subscribed to "${topic}".`,
				subscription: existing,
			};
		}

		// Reactivate the subscription
		const reactivated = await reactivateSubscription(existing.id);
		if (reactivated) {
			return {
				success: true,
				message: `✅ Reactivated subscription to "${topic}".`,
				subscription: { ...existing, isActive: true },
			};
		}
	}

	// Check subscription limit
	const count = await getUserSubscriptionCount(userId);
	if (count >= MAX_SUBSCRIPTIONS_PER_USER) {
		return {
			success: false,
			message: `You've reached the maximum of ${MAX_SUBSCRIPTIONS_PER_USER} subscriptions. Please unsubscribe from a topic first.`,
		};
	}

	// Create new subscription
	const subscription = await createSubscription({
		userId,
		topic: normalizedTopic,
		category: options?.category ?? null,
		intervalHours: options?.intervalHours ?? DEFAULT_INTERVAL_HOURS,
		isActive: true,
	});

	if (!subscription) {
		return {
			success: false,
			message: "Failed to create subscription. Please try again.",
		};
	}

	const intervalLabel = getIntervalLabel(
		subscription.intervalHours ?? DEFAULT_INTERVAL_HOURS,
	);

	return {
		success: true,
		message: `✅ Subscribed to "${topic}"!\n\nYou'll receive ${intervalLabel.toLowerCase()} updates with new papers on this topic.`,
		subscription,
	};
}

/**
 * Unsubscribe a user from a topic
 *
 * @param userId - User ID
 * @param topic - Topic to unsubscribe from
 * @returns Subscription result
 */
export async function unsubscribe(
	userId: number,
	topic: string,
): Promise<SubscriptionResult> {
	const normalizedTopic = topic.trim().toLowerCase();

	if (!normalizedTopic) {
		return {
			success: false,
			message: "Please provide a topic to unsubscribe from.",
		};
	}

	const deleted = await deleteSubscriptionByTopic(userId, normalizedTopic);

	if (!deleted) {
		return {
			success: false,
			message: `You're not subscribed to "${topic}".`,
		};
	}

	return {
		success: true,
		message: `✅ Unsubscribed from "${topic}".`,
	};
}

/**
 * Get user's subscriptions with formatted display
 *
 * @param userId - User ID
 * @returns Subscriptions list
 */
export async function getSubscriptionsList(
	userId: number,
): Promise<{ subscriptions: Subscription[]; count: number }> {
	const subs = await getUserSubscriptions(userId, true);
	return {
		subscriptions: subs,
		count: subs.length,
	};
}

/**
 * Update subscription interval
 *
 * @param subscriptionId - Subscription ID
 * @param intervalHours - New interval in hours
 * @returns Updated subscription or null
 */
export async function updateInterval(
	subscriptionId: number,
	intervalHours: number,
): Promise<Subscription | null> {
	return updateSubscription(subscriptionId, { intervalHours });
}

/**
 * Create keyboard for subscription management
 *
 * @param subscriptions - User's subscriptions
 * @returns InlineKeyboard
 */
export function createSubscriptionsKeyboard(
	subscriptions: Subscription[],
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const sub of subscriptions) {
		keyboard
			.text(`❌ ${sub.topic}`, `unsub:${sub.id}`)
			.text("⚙️", `sub_settings:${sub.id}`)
			.row();
	}

	keyboard.text("➕ Add Subscription", "action:add_subscription");

	return keyboard;
}

/**
 * Create keyboard for selecting subscription interval
 *
 * @param subscriptionId - Subscription ID
 * @param currentInterval - Current interval in hours
 * @returns InlineKeyboard
 */
export function createIntervalKeyboard(
	subscriptionId: number,
	currentInterval?: number,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (let i = 0; i < SUBSCRIPTION_INTERVALS.length; i += 2) {
		const interval1 = SUBSCRIPTION_INTERVALS[i];
		if (interval1) {
			const isSelected = currentInterval === interval1.hours;
			const label = isSelected ? `✓ ${interval1.label}` : interval1.label;
			keyboard.text(label, `sub_interval:${subscriptionId}:${interval1.hours}`);
		}

		const interval2 = SUBSCRIPTION_INTERVALS[i + 1];
		if (interval2) {
			const isSelected = currentInterval === interval2.hours;
			const label = isSelected ? `✓ ${interval2.label}` : interval2.label;
			keyboard.text(label, `sub_interval:${subscriptionId}:${interval2.hours}`);
		}

		keyboard.row();
	}

	keyboard.text("« Back", `sub_settings:${subscriptionId}`);

	return keyboard;
}

/**
 * Create keyboard for subscription settings
 *
 * @param subscription - Subscription to configure
 * @returns InlineKeyboard
 */
export function createSubscriptionSettingsKeyboard(
	subscription: Subscription,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	keyboard
		.text("⏱️ Change Interval", `sub_change_interval:${subscription.id}`)
		.row()
		.text("🗑️ Remove", `unsub:${subscription.id}`)
		.row()
		.text("« Back to Subscriptions", "action:subscriptions");

	return keyboard;
}

/**
 * Format subscription for display
 *
 * @param subscription - Subscription to format
 * @returns Formatted string
 */
export function formatSubscription(subscription: Subscription): string {
	const intervalLabel = getIntervalLabel(
		subscription.intervalHours ?? DEFAULT_INTERVAL_HOURS,
	);
	const lastRun = subscription.lastRunAt
		? new Date(subscription.lastRunAt).toLocaleDateString()
		: "Never";

	let text = `📌 **${subscription.topic}**\n`;
	text += `   ⏱️ ${intervalLabel}\n`;
	text += `   📅 Last update: ${lastRun}`;

	if (subscription.category) {
		text += `\n   📂 Category: ${subscription.category}`;
	}

	return text;
}

/**
 * Format subscriptions list message
 *
 * @param subscriptions - User's subscriptions
 * @returns Formatted message
 */
export function formatSubscriptionsMessage(
	subscriptions: Subscription[],
): string {
	if (subscriptions.length === 0) {
		return "📭 You don't have any subscriptions yet.\n\nUse /subscribe <topic> to get periodic updates on research topics.";
	}

	let message = "📬 **Your Subscriptions**\n\n";
	message += subscriptions
		.map((sub, i) => `${i + 1}. ${formatSubscription(sub)}`)
		.join("\n\n");
	message += `\n\n_Tap a topic to manage or remove it._`;

	return message;
}

/**
 * Get human-readable interval label
 *
 * @param hours - Interval in hours
 * @returns Label string
 */
function getIntervalLabel(hours: number): string {
	const interval = SUBSCRIPTION_INTERVALS.find((i) => i.hours === hours);
	if (interval) {
		return interval.label;
	}

	if (hours < 24) {
		return `Every ${hours} hours`;
	}
	if (hours === 24) {
		return "Daily";
	}
	if (hours < 168) {
		const days = Math.round(hours / 24);
		return `Every ${days} days`;
	}
	const weeks = Math.round(hours / 168);
	return `Every ${weeks} week${weeks > 1 ? "s" : ""}`;
}

/**
 * Parse subscription command arguments
 *
 * @param args - Command arguments string
 * @returns Parsed topic and options
 */
export function parseSubscribeArgs(args: string): {
	topic: string;
	category?: ArxivCategory;
} {
	const trimmed = args.trim();

	// Check for category prefix like "cs.AI:" or "[cs.AI]"
	const categoryMatch = trimmed.match(
		/^(?:\[([^\]]+)\]|([a-z-]+\.[A-Z]+):)\s*(.+)$/i,
	);

	if (categoryMatch) {
		const category = (categoryMatch[1] || categoryMatch[2]) as ArxivCategory;
		const topic = categoryMatch[3] ?? trimmed;
		return { topic, category };
	}

	return { topic: trimmed };
}
