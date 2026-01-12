/**
 * Admin Middleware and Utilities
 *
 * Provides admin authentication and admin-only commands for bot management.
 * Admin users are identified by their Telegram user IDs.
 */

import type { Bot } from "gramio";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

/**
 * Admin user IDs from environment variable
 * Format: ADMIN_IDS=123456789,987654321
 */
const ADMIN_IDS: number[] = process.env.ADMIN_IDS
	? process.env.ADMIN_IDS.split(",")
			.map((id) => Number.parseInt(id.trim(), 10))
			.filter((id) => !Number.isNaN(id))
	: [];

/**
 * Check if a user is an admin
 *
 * @param chatId - The user's chat ID
 * @returns True if the user is an admin
 */
export function isAdmin(chatId: number): boolean {
	return ADMIN_IDS.includes(chatId);
}

/**
 * Admin statistics interface
 */
export interface AdminStats {
	totalUsers: number;
	activeToday: number;
	activeThisWeek: number;
	searchesToday: number;
	totalSearches: number;
	totalBookmarks: number;
	activeSubscriptions: number;
	uptime: number;
	memoryUsage: NodeJS.MemoryUsage;
}

/**
 * Get bot startup time for uptime calculation
 */
const startupTime = Date.now();

/**
 * Get bot uptime in seconds
 */
export function getUptime(): number {
	return Math.floor((Date.now() - startupTime) / 1000);
}

/**
 * Format uptime for display
 *
 * @param seconds - Uptime in seconds
 * @returns Formatted uptime string
 */
export function formatUptime(seconds: number): string {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	const parts: string[] = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

	return parts.join(" ");
}

/**
 * Format bytes for display
 *
 * @param bytes - Bytes value
 * @returns Formatted string (e.g., "12.5 MB")
 */
export function formatBytes(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"];
	let value = bytes;
	let unitIndex = 0;

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex++;
	}

	return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Get memory usage stats
 */
export function getMemoryStats(): {
	heapUsed: string;
	heapTotal: string;
	external: string;
	rss: string;
} {
	const mem = process.memoryUsage();
	return {
		heapUsed: formatBytes(mem.heapUsed),
		heapTotal: formatBytes(mem.heapTotal),
		external: formatBytes(mem.external),
		rss: formatBytes(mem.rss),
	};
}

/**
 * Admin action log entry
 */
interface AdminActionLog {
	adminId: number;
	action: string;
	details?: Record<string, unknown>;
	timestamp: Date;
}

/**
 * Recent admin actions (in-memory log)
 */
const adminActionLog: AdminActionLog[] = [];
const MAX_ACTION_LOG_SIZE = 100;

/**
 * Log an admin action
 *
 * @param adminId - Admin user ID
 * @param action - Action performed
 * @param details - Additional details
 */
export function logAdminAction(
	adminId: number,
	action: string,
	details?: Record<string, unknown>,
): void {
	const entry: AdminActionLog = {
		adminId,
		action,
		details,
		timestamp: new Date(),
	};

	adminActionLog.unshift(entry);

	// Trim log if too large
	if (adminActionLog.length > MAX_ACTION_LOG_SIZE) {
		adminActionLog.length = MAX_ACTION_LOG_SIZE;
	}

	logger.info("Admin action", {
		adminId,
		action,
		details,
	});
}

/**
 * Get recent admin actions
 *
 * @param limit - Maximum number of actions to return
 * @returns Array of admin action logs
 */
export function getRecentAdminActions(limit = 10): AdminActionLog[] {
	return adminActionLog.slice(0, limit);
}

/**
 * Broadcast message to all users
 * Note: Requires user repository to get all users
 *
 * @param bot - Bot instance
 * @param message - Message to broadcast
 * @param userChatIds - Array of user chat IDs
 * @returns Number of successfully sent messages
 */
export async function broadcastMessage(
	bot: Bot,
	message: string,
	userChatIds: number[],
): Promise<{ success: number; failed: number }> {
	let success = 0;
	let failed = 0;

	for (const chatId of userChatIds) {
		try {
			await bot.api.sendMessage({
				chat_id: chatId,
				text: `📢 *Announcement*\n\n${message}`,
				parse_mode: "Markdown",
			});
			success++;

			// Small delay to avoid rate limits
			await new Promise((resolve) => setTimeout(resolve, 50));
		} catch (error) {
			failed++;
			logger.warn("Failed to send broadcast message", {
				chatId,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	return { success, failed };
}

/**
 * Format admin stats for display
 *
 * @param stats - Admin statistics
 * @returns Formatted stats message
 */
export function formatAdminStats(stats: Partial<AdminStats>): string {
	const uptime = getUptime();
	const memory = getMemoryStats();

	let message = "📊 *Bot Statistics*\n";
	message += "─────────────────\n\n";

	// User stats
	message += "*👥 Users*\n";
	if (stats.totalUsers !== undefined) {
		message += `  Total: ${stats.totalUsers}\n`;
	}
	if (stats.activeToday !== undefined) {
		message += `  Active today: ${stats.activeToday}\n`;
	}
	if (stats.activeThisWeek !== undefined) {
		message += `  Active this week: ${stats.activeThisWeek}\n`;
	}

	// Search stats
	message += "\n*🔍 Searches*\n";
	if (stats.totalSearches !== undefined) {
		message += `  Total: ${stats.totalSearches}\n`;
	}
	if (stats.searchesToday !== undefined) {
		message += `  Today: ${stats.searchesToday}\n`;
	}

	// Feature stats
	message += "\n*📚 Features*\n";
	if (stats.totalBookmarks !== undefined) {
		message += `  Bookmarks: ${stats.totalBookmarks}\n`;
	}
	if (stats.activeSubscriptions !== undefined) {
		message += `  Subscriptions: ${stats.activeSubscriptions}\n`;
	}

	// System stats
	message += "\n*⚙️ System*\n";
	message += `  Uptime: ${formatUptime(uptime)}\n`;
	message += `  Memory (heap): ${memory.heapUsed} / ${memory.heapTotal}\n`;
	message += `  Memory (RSS): ${memory.rss}\n`;
	message += `  Environment: ${config.NODE_ENV}\n`;
	message += `  Admins: ${ADMIN_IDS.length}\n`;

	return message;
}

/**
 * Admin commands help text
 */
export const ADMIN_HELP = `
*🔐 Admin Commands*

/admin\\_stats - View bot statistics
/admin\\_broadcast <message> - Send message to all users
/admin\\_user <chat\\_id> - View user details
/admin\\_log - View recent admin actions

_Admin commands are only available to authorized users._
`;

/**
 * Check if admin features are enabled
 */
export function hasAdmins(): boolean {
	return ADMIN_IDS.length > 0;
}

/**
 * Get list of admin IDs (for debugging/logging)
 */
export function getAdminIds(): number[] {
	return [...ADMIN_IDS];
}
