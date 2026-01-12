/**
 * User Repository
 *
 * Handles all database operations related to users.
 * Provides methods for creating, reading, updating, and deleting users.
 */

import { eq } from "drizzle-orm";
import type { LanguageCode } from "../../i18n/types.js";
import { logger } from "../../utils/logger.js";
import { db } from "../index.js";
import { type NewUser, type User, users } from "../schema.js";

/**
 * Find a user by their Telegram chat ID
 */
export async function findUserByChatId(chatId: number): Promise<User | null> {
	try {
		const result = await db
			.select()
			.from(users)
			.where(eq(users.chatId, chatId))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		logger.error("Error finding user by chatId", {
			chatId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Find a user by their internal ID
 */
export async function findUserById(id: number): Promise<User | null> {
	try {
		const result = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		logger.error("Error finding user by id", {
			id,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Create a new user or return existing one
 */
export async function findOrCreateUser(
	chatId: number,
	userData?: {
		username?: string;
		firstName?: string;
		lastName?: string;
	},
): Promise<User | null> {
	try {
		// Try to find existing user
		const existing = await findUserByChatId(chatId);
		if (existing) {
			// Update last active time
			await updateUserLastActive(existing.id);
			return existing;
		}

		// Create new user
		const newUser: NewUser = {
			chatId,
			username: userData?.username,
			firstName: userData?.firstName,
			lastName: userData?.lastName,
			lastActiveAt: new Date().toISOString(),
		};

		const result = await db.insert(users).values(newUser).returning();

		logger.info("Created new user", { chatId, userId: result[0]?.id });
		return result[0] || null;
	} catch (error) {
		logger.error("Error finding or creating user", {
			chatId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Update user's last active timestamp
 */
export async function updateUserLastActive(userId: number): Promise<void> {
	try {
		await db
			.update(users)
			.set({ lastActiveAt: new Date().toISOString() })
			.where(eq(users.id, userId));
	} catch (error) {
		logger.error("Error updating user last active", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
	userId: number,
	preferences: {
		resultsPerPage?: number;
		preferredCategories?: string[];
	},
): Promise<User | null> {
	try {
		const updateData: Partial<NewUser> = {};

		if (preferences.resultsPerPage !== undefined) {
			updateData.resultsPerPage = preferences.resultsPerPage;
		}

		if (preferences.preferredCategories !== undefined) {
			updateData.preferredCategories = JSON.stringify(
				preferences.preferredCategories,
			);
		}

		const result = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, userId))
			.returning();

		return result[0] || null;
	} catch (error) {
		logger.error("Error updating user preferences", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Update user's preferred language
 */
export async function updateUserLanguage(
	userId: number,
	language: LanguageCode,
): Promise<User | null> {
	try {
		const result = await db
			.update(users)
			.set({ language })
			.where(eq(users.id, userId))
			.returning();

		logger.info("Updated user language", { userId, language });
		return result[0] || null;
	} catch (error) {
		logger.error("Error updating user language", {
			userId,
			language,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Get user's preferred language
 */
export async function getUserLanguage(
	chatId: number,
): Promise<LanguageCode | null> {
	try {
		const user = await findUserByChatId(chatId);
		return (user?.language as LanguageCode) || null;
	} catch (error) {
		logger.error("Error getting user language", {
			chatId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Get user's preferred categories as an array
 */
export function getUserPreferredCategories(user: User): string[] {
	if (!user.preferredCategories) {
		return [];
	}

	try {
		return JSON.parse(user.preferredCategories);
	} catch {
		return [];
	}
}

/**
 * Delete a user and all their data (cascades to related tables)
 */
export async function deleteUser(userId: number): Promise<boolean> {
	try {
		await db.delete(users).where(eq(users.id, userId));
		// Bun SQLite doesn't return changes count, so we verify by checking if user exists
		const stillExists = await findUserById(userId);
		return stillExists === null;
	} catch (error) {
		logger.error("Error deleting user", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		return false;
	}
}

/**
 * Get total user count
 */
export async function getUserCount(): Promise<number> {
	try {
		const result = await db.select().from(users);
		return result.length;
	} catch (error) {
		logger.error("Error getting user count", {
			error: error instanceof Error ? error.message : String(error),
		});
		return 0;
	}
}
