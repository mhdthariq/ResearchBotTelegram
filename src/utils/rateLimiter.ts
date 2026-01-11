/**
 * Rate Limiter utility for throttling API requests
 *
 * arXiv recommends no more than 1 request every 3 seconds.
 * This utility ensures we respect that limit to avoid being blocked.
 */

import { logger } from "./logger.js";

/**
 * Rate limiter that enforces a minimum interval between requests
 */
export class RateLimiter {
	private lastRequest = 0;
	private readonly minInterval: number;
	private readonly name: string;
	private pendingRequests = 0;

	/**
	 * Create a new rate limiter
	 *
	 * @param requestsPerSecond - Maximum requests per second (default: 0.33 = 1 req/3sec)
	 * @param name - Name for logging purposes
	 */
	constructor(requestsPerSecond = 0.33, name = "RateLimiter") {
		this.minInterval = 1000 / requestsPerSecond;
		this.name = name;

		logger.debug(`${this.name} initialized`, {
			requestsPerSecond,
			minIntervalMs: this.minInterval,
		});
	}

	/**
	 * Wait until it's safe to make another request
	 *
	 * Call this method before making an API request to ensure
	 * you don't exceed the rate limit.
	 *
	 * @returns Promise that resolves when it's safe to proceed
	 *
	 * @example
	 * await rateLimiter.throttle();
	 * const result = await fetchFromApi();
	 */
	async throttle(): Promise<void> {
		this.pendingRequests++;

		try {
			const now = Date.now();
			const elapsed = now - this.lastRequest;

			if (elapsed < this.minInterval) {
				const waitTime = this.minInterval - elapsed;

				logger.debug(`${this.name}: Throttling request`, {
					waitTimeMs: Math.round(waitTime),
					pendingRequests: this.pendingRequests,
				});

				await this.sleep(waitTime);
			}

			this.lastRequest = Date.now();
		} finally {
			this.pendingRequests--;
		}
	}

	/**
	 * Check if a request can be made immediately without waiting
	 *
	 * @returns true if a request can be made without throttling
	 */
	canProceed(): boolean {
		const elapsed = Date.now() - this.lastRequest;
		return elapsed >= this.minInterval;
	}

	/**
	 * Get the time until next request can be made
	 *
	 * @returns Milliseconds until next request is allowed (0 if can proceed now)
	 */
	getWaitTime(): number {
		const elapsed = Date.now() - this.lastRequest;
		return Math.max(0, this.minInterval - elapsed);
	}

	/**
	 * Get the number of pending requests waiting for throttle
	 */
	getPendingCount(): number {
		return this.pendingRequests;
	}

	/**
	 * Reset the rate limiter (useful for testing)
	 */
	reset(): void {
		this.lastRequest = 0;
		this.pendingRequests = 0;
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

/**
 * Pre-configured rate limiter for arXiv API
 *
 * arXiv recommends no more than 1 request every 3 seconds,
 * so we use 0.33 requests per second (1/3).
 *
 * @example
 * import { arxivRateLimiter } from "./utils/rateLimiter.js";
 *
 * async function fetchPapers(query: string) {
 *   await arxivRateLimiter.throttle();
 *   return await fetch(`https://arxiv.org/api/query?search_query=${query}`);
 * }
 */
export const arxivRateLimiter = new RateLimiter(0.33, "arXiv");

/**
 * Create a rate-limited wrapper for any async function
 *
 * @param fn - The async function to wrap
 * @param limiter - The rate limiter to use
 * @returns A new function that respects the rate limit
 *
 * @example
 * const rateLimitedFetch = createRateLimited(
 *   (url: string) => fetch(url),
 *   arxivRateLimiter
 * );
 */
export function createRateLimited<TArgs extends unknown[], TResult>(
	fn: (...args: TArgs) => Promise<TResult>,
	limiter: RateLimiter,
): (...args: TArgs) => Promise<TResult> {
	return async (...args: TArgs): Promise<TResult> => {
		await limiter.throttle();
		return fn(...args);
	};
}
