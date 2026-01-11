/**
 * User Rate Limiting Middleware
 *
 * Limits the number of requests a user can make within a time window
 * to prevent abuse and ensure fair usage.
 */

import { logger } from "../utils/logger.js";

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

interface RateLimitConfig {
	/** Maximum requests allowed per window (default: 30) */
	maxRequests: number;
	/** Time window in milliseconds (default: 60000 = 1 minute) */
	windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
	maxRequests: 30,
	windowMs: 60000, // 1 minute
};

/** In-memory store for rate limits */
const userRateLimits = new Map<number, RateLimitEntry>();

/** Cleanup interval ID */
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Check if a user is within their rate limit
 *
 * @param chatId - The user's chat ID
 * @param config - Optional rate limit configuration
 * @returns true if the request is allowed, false if rate limited
 *
 * @example
 * if (!checkRateLimit(context.chatId)) {
 *   return context.send("Too many requests. Please wait a moment.");
 * }
 */
export function checkRateLimit(
	chatId: number,
	config: Partial<RateLimitConfig> = {},
): boolean {
	const { maxRequests, windowMs } = { ...DEFAULT_CONFIG, ...config };
	const now = Date.now();
	const userLimit = userRateLimits.get(chatId);

	// First request or window expired - reset
	if (!userLimit || now > userLimit.resetAt) {
		userRateLimits.set(chatId, {
			count: 1,
			resetAt: now + windowMs,
		});
		return true;
	}

	// Check if limit exceeded
	if (userLimit.count >= maxRequests) {
		logger.warn("User rate limited", {
			chatId,
			count: userLimit.count,
			maxRequests,
			resetIn: userLimit.resetAt - now,
		});
		return false;
	}

	// Increment count
	userLimit.count++;
	return true;
}

/**
 * Get remaining requests for a user
 *
 * @param chatId - The user's chat ID
 * @param config - Optional rate limit configuration
 * @returns Object with remaining requests and reset time
 */
export function getRateLimitInfo(
	chatId: number,
	config: Partial<RateLimitConfig> = {},
): { remaining: number; resetAt: number; limited: boolean } {
	const { maxRequests, windowMs } = { ...DEFAULT_CONFIG, ...config };
	const now = Date.now();
	const userLimit = userRateLimits.get(chatId);

	if (!userLimit || now > userLimit.resetAt) {
		return {
			remaining: maxRequests,
			resetAt: now + windowMs,
			limited: false,
		};
	}

	const remaining = Math.max(0, maxRequests - userLimit.count);
	return {
		remaining,
		resetAt: userLimit.resetAt,
		limited: remaining === 0,
	};
}

/**
 * Reset rate limit for a specific user (useful for admins)
 *
 * @param chatId - The user's chat ID
 */
export function resetRateLimit(chatId: number): void {
	userRateLimits.delete(chatId);
	logger.debug("Rate limit reset", { chatId });
}

/**
 * Clear all rate limits (useful for testing or admin reset)
 */
export function clearAllRateLimits(): void {
	const count = userRateLimits.size;
	userRateLimits.clear();
	logger.info("All rate limits cleared", { count });
}

/**
 * Get the number of currently tracked users
 */
export function getTrackedUsersCount(): number {
	return userRateLimits.size;
}

/**
 * Clean up expired rate limit entries
 * Called periodically to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
	const now = Date.now();
	let cleaned = 0;

	for (const [chatId, entry] of userRateLimits.entries()) {
		if (now > entry.resetAt) {
			userRateLimits.delete(chatId);
			cleaned++;
		}
	}

	if (cleaned > 0) {
		logger.debug("Rate limit cleanup", {
			cleaned,
			remaining: userRateLimits.size,
		});
	}
}

/**
 * Start periodic cleanup of expired entries
 *
 * @param intervalMs - Cleanup interval in milliseconds (default: 60000 = 1 minute)
 */
export function startCleanupInterval(intervalMs = 60000): void {
	if (cleanupInterval) {
		return; // Already running
	}

	cleanupInterval = setInterval(cleanupExpiredEntries, intervalMs);
	logger.debug("Rate limit cleanup interval started", { intervalMs });
}

/**
 * Stop the cleanup interval
 */
export function stopCleanupInterval(): void {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
		logger.debug("Rate limit cleanup interval stopped");
	}
}

/**
 * Rate limit decorator for async functions
 *
 * @param chatIdExtractor - Function to extract chat ID from arguments
 * @param config - Rate limit configuration
 * @returns Decorator function
 *
 * @example
 * const rateLimitedSearch = withRateLimit(
 *   (chatId: number) => searchPapers(chatId, query),
 *   (chatId) => chatId
 * );
 */
export function withRateLimit<TArgs extends unknown[], TResult>(
	fn: (...args: TArgs) => Promise<TResult>,
	chatIdExtractor: (...args: TArgs) => number,
	config: Partial<RateLimitConfig> = {},
): (...args: TArgs) => Promise<TResult | null> {
	return async (...args: TArgs): Promise<TResult | null> => {
		const chatId = chatIdExtractor(...args);

		if (!checkRateLimit(chatId, config)) {
			return null;
		}

		return fn(...args);
	};
}

// Start cleanup interval when module loads
startCleanupInterval();
