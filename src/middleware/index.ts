/**
 * Middleware module exports
 *
 * Re-exports all middleware utilities for cleaner imports.
 *
 * @example
 * import { checkRateLimit, getRateLimitInfo } from "./middleware/index.js";
 */

export {
	checkRateLimit,
	clearAllRateLimits,
	getRateLimitInfo,
	getTrackedUsersCount,
	resetRateLimit,
	startCleanupInterval,
	stopCleanupInterval,
	withRateLimit,
} from "./rateLimit.js";
