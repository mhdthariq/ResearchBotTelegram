/**
 * Subscription Repository
 *
 * Provides database operations for managing user subscriptions to topics.
 * Subscriptions allow users to receive periodic updates on their favorite research topics.
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { logger } from "../../utils/logger.js";
import { getDb, isDatabaseAvailable } from "../index.js";
import {
	type NewSubscription,
	type Subscription,
	subscriptions,
} from "../schema.js";

/**
 * Create a new subscription
 *
 * @param data - Subscription data
 * @returns Created subscription or null on failure
 */
export async function createSubscription(
	data: NewSubscription,
): Promise<Subscription | null> {
	if (!isDatabaseAvailable()) {
		logger.warn("Database not available for createSubscription");
		return null;
	}

	try {
		const db = getDb();
		const result = await db.insert(subscriptions).values(data).returning();
		return result[0] ?? null;
	} catch (error) {
		logger.error("Failed to create subscription", {
			error: error instanceof Error ? error.message : String(error),
			data,
		});
		return null;
	}
}

/**
 * Get a subscription by ID
 *
 * @param id - Subscription ID
 * @returns Subscription or null if not found
 */
export async function getSubscriptionById(
	id: number,
): Promise<Subscription | null> {
	if (!isDatabaseAvailable()) {
		return null;
	}

	try {
		const db = getDb();
		const result = await db
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.id, id))
			.limit(1);
		return result[0] ?? null;
	} catch (error) {
		logger.error("Failed to get subscription by ID", {
			error: error instanceof Error ? error.message : String(error),
			id,
		});
		return null;
	}
}

/**
 * Get all subscriptions for a user
 *
 * @param userId - User ID
 * @param activeOnly - Only return active subscriptions (default: true)
 * @returns Array of subscriptions
 */
export async function getUserSubscriptions(
	userId: number,
	activeOnly = true,
): Promise<Subscription[]> {
	if (!isDatabaseAvailable()) {
		return [];
	}

	try {
		const db = getDb();
		const conditions = [eq(subscriptions.userId, userId)];

		if (activeOnly) {
			conditions.push(eq(subscriptions.isActive, true));
		}

		return await db
			.select()
			.from(subscriptions)
			.where(and(...conditions))
			.orderBy(desc(subscriptions.createdAt));
	} catch (error) {
		logger.error("Failed to get user subscriptions", {
			error: error instanceof Error ? error.message : String(error),
			userId,
		});
		return [];
	}
}

/**
 * Get count of user's active subscriptions
 *
 * @param userId - User ID
 * @returns Count of active subscriptions
 */
export async function getUserSubscriptionCount(
	userId: number,
): Promise<number> {
	if (!isDatabaseAvailable()) {
		return 0;
	}

	try {
		const db = getDb();
		const result = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(subscriptions)
			.where(
				and(eq(subscriptions.userId, userId), eq(subscriptions.isActive, true)),
			);
		return result[0]?.count ?? 0;
	} catch (error) {
		logger.error("Failed to get user subscription count", {
			error: error instanceof Error ? error.message : String(error),
			userId,
		});
		return 0;
	}
}

/**
 * Check if a user is subscribed to a specific topic
 *
 * @param userId - User ID
 * @param topic - Topic to check
 * @returns True if subscribed
 */
export async function isSubscribed(
	userId: number,
	topic: string,
): Promise<boolean> {
	if (!isDatabaseAvailable()) {
		return false;
	}

	try {
		const db = getDb();
		const result = await db
			.select({ id: subscriptions.id })
			.from(subscriptions)
			.where(
				and(
					eq(subscriptions.userId, userId),
					eq(subscriptions.topic, topic),
					eq(subscriptions.isActive, true),
				),
			)
			.limit(1);
		return result.length > 0;
	} catch (error) {
		logger.error("Failed to check subscription status", {
			error: error instanceof Error ? error.message : String(error),
			userId,
			topic,
		});
		return false;
	}
}

/**
 * Find existing subscription by user and topic
 *
 * @param userId - User ID
 * @param topic - Topic
 * @returns Subscription or null
 */
export async function findSubscription(
	userId: number,
	topic: string,
): Promise<Subscription | null> {
	if (!isDatabaseAvailable()) {
		return null;
	}

	try {
		const db = getDb();
		const result = await db
			.select()
			.from(subscriptions)
			.where(
				and(eq(subscriptions.userId, userId), eq(subscriptions.topic, topic)),
			)
			.limit(1);
		return result[0] ?? null;
	} catch (error) {
		logger.error("Failed to find subscription", {
			error: error instanceof Error ? error.message : String(error),
			userId,
			topic,
		});
		return null;
	}
}

/**
 * Update a subscription
 *
 * @param id - Subscription ID
 * @param data - Data to update
 * @returns Updated subscription or null
 */
export async function updateSubscription(
	id: number,
	data: Partial<
		Pick<
			Subscription,
			"topic" | "category" | "intervalHours" | "isActive" | "lastRunAt"
		>
	>,
): Promise<Subscription | null> {
	if (!isDatabaseAvailable()) {
		return null;
	}

	try {
		const db = getDb();
		const result = await db
			.update(subscriptions)
			.set(data)
			.where(eq(subscriptions.id, id))
			.returning();
		return result[0] ?? null;
	} catch (error) {
		logger.error("Failed to update subscription", {
			error: error instanceof Error ? error.message : String(error),
			id,
			data,
		});
		return null;
	}
}

/**
 * Deactivate a subscription (soft delete)
 *
 * @param id - Subscription ID
 * @returns True if deactivated
 */
export async function deactivateSubscription(id: number): Promise<boolean> {
	const result = await updateSubscription(id, { isActive: false });
	return result !== null;
}

/**
 * Reactivate a subscription
 *
 * @param id - Subscription ID
 * @returns True if reactivated
 */
export async function reactivateSubscription(id: number): Promise<boolean> {
	const result = await updateSubscription(id, { isActive: true });
	return result !== null;
}

/**
 * Delete a subscription permanently
 *
 * @param id - Subscription ID
 * @returns True if deleted
 */
export async function deleteSubscription(id: number): Promise<boolean> {
	if (!isDatabaseAvailable()) {
		return false;
	}

	try {
		const db = getDb();
		const result = await db
			.delete(subscriptions)
			.where(eq(subscriptions.id, id))
			.returning();
		return result.length > 0;
	} catch (error) {
		logger.error("Failed to delete subscription", {
			error: error instanceof Error ? error.message : String(error),
			id,
		});
		return false;
	}
}

/**
 * Delete a subscription by user and topic
 *
 * @param userId - User ID
 * @param topic - Topic
 * @returns True if deleted
 */
export async function deleteSubscriptionByTopic(
	userId: number,
	topic: string,
): Promise<boolean> {
	if (!isDatabaseAvailable()) {
		return false;
	}

	try {
		const db = getDb();
		const result = await db
			.delete(subscriptions)
			.where(
				and(eq(subscriptions.userId, userId), eq(subscriptions.topic, topic)),
			)
			.returning();
		return result.length > 0;
	} catch (error) {
		logger.error("Failed to delete subscription by topic", {
			error: error instanceof Error ? error.message : String(error),
			userId,
			topic,
		});
		return false;
	}
}

/**
 * Update last run time for a subscription
 *
 * @param id - Subscription ID
 * @returns True if updated
 */
export async function updateSubscriptionLastRun(id: number): Promise<boolean> {
	const now = new Date().toISOString();
	const result = await updateSubscription(id, { lastRunAt: now });
	return result !== null;
}

/**
 * Get subscriptions that are due to run
 * Returns subscriptions where:
 * - isActive is true
 * - lastRunAt is null OR (now - lastRunAt) >= intervalHours
 *
 * @param limit - Maximum number to return (default: 100)
 * @returns Array of due subscriptions
 */
export async function getDueSubscriptions(
	limit = 100,
): Promise<Subscription[]> {
	if (!isDatabaseAvailable()) {
		return [];
	}

	try {
		const db = getDb();
		const now = new Date();

		// Get all active subscriptions
		const allActive = await db
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.isActive, true))
			.limit(limit);

		// Filter in JS since SQLite date handling is tricky
		return allActive.filter((sub) => {
			if (!sub.lastRunAt) {
				return true; // Never run, is due
			}

			const lastRun = new Date(sub.lastRunAt);
			const intervalMs = (sub.intervalHours ?? 24) * 60 * 60 * 1000;
			const nextRun = new Date(lastRun.getTime() + intervalMs);

			return now >= nextRun;
		});
	} catch (error) {
		logger.error("Failed to get due subscriptions", {
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}

/**
 * Get all subscriptions (for admin purposes)
 *
 * @param limit - Maximum number to return
 * @param offset - Pagination offset
 * @returns Array of subscriptions
 */
export async function getAllSubscriptions(
	limit = 50,
	offset = 0,
): Promise<Subscription[]> {
	if (!isDatabaseAvailable()) {
		return [];
	}

	try {
		const db = getDb();
		return await db
			.select()
			.from(subscriptions)
			.orderBy(desc(subscriptions.createdAt))
			.limit(limit)
			.offset(offset);
	} catch (error) {
		logger.error("Failed to get all subscriptions", {
			error: error instanceof Error ? error.message : String(error),
		});
		return [];
	}
}

/**
 * Get total subscription count (for admin stats)
 *
 * @param activeOnly - Only count active subscriptions
 * @returns Total count
 */
export async function getTotalSubscriptionCount(
	activeOnly = false,
): Promise<number> {
	if (!isDatabaseAvailable()) {
		return 0;
	}

	try {
		const db = getDb();
		const conditions = activeOnly
			? eq(subscriptions.isActive, true)
			: undefined;

		const result = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(subscriptions)
			.where(conditions);

		return result[0]?.count ?? 0;
	} catch (error) {
		logger.error("Failed to get total subscription count", {
			error: error instanceof Error ? error.message : String(error),
		});
		return 0;
	}
}
