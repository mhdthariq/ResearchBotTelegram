/**
 * Retry utility with exponential backoff
 *
 * Provides a mechanism to retry failed operations with
 * configurable delays and attempt limits.
 */

import { logger } from "./logger.js";

export interface RetryOptions {
	/** Maximum number of retry attempts (default: 3) */
	maxAttempts?: number;
	/** Base delay in milliseconds (default: 1000) */
	baseDelay?: number;
	/** Maximum delay in milliseconds (default: 10000) */
	maxDelay?: number;
	/** Multiplier for exponential backoff (default: 2) */
	backoffMultiplier?: number;
	/** Function to determine if error is retryable (default: all errors) */
	isRetryable?: (error: unknown) => boolean;
	/** Optional name for logging purposes */
	operationName?: string;
}

const DEFAULT_OPTIONS: Required<
	Omit<RetryOptions, "isRetryable" | "operationName">
> = {
	maxAttempts: 3,
	baseDelay: 1000,
	maxDelay: 10000,
	backoffMultiplier: 2,
};

/**
 * Executes a function with automatic retry on failure
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 *
 * @example
 * const result = await withRetry(
 *   () => fetchPapersFromApi(query),
 *   { maxAttempts: 3, operationName: "fetchPapers" }
 * );
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {},
): Promise<T> {
	const {
		maxAttempts = DEFAULT_OPTIONS.maxAttempts,
		baseDelay = DEFAULT_OPTIONS.baseDelay,
		maxDelay = DEFAULT_OPTIONS.maxDelay,
		backoffMultiplier = DEFAULT_OPTIONS.backoffMultiplier,
		isRetryable = () => true,
		operationName = "operation",
	} = options;

	let lastError: unknown;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// Check if we should retry
			if (!isRetryable(error)) {
				logger.debug(
					`${operationName}: Error is not retryable, throwing immediately`,
					{
						attempt,
						error: error instanceof Error ? error.message : String(error),
					},
				);
				throw error;
			}

			// Check if we've exhausted all attempts
			if (attempt === maxAttempts) {
				logger.warn(`${operationName}: All ${maxAttempts} attempts failed`, {
					error: error instanceof Error ? error.message : String(error),
				});
				break;
			}

			// Calculate delay with exponential backoff and jitter
			const exponentialDelay = baseDelay * backoffMultiplier ** (attempt - 1);
			const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
			const delay = Math.min(exponentialDelay + jitter, maxDelay);

			logger.debug(
				`${operationName}: Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms`,
				{
					attempt,
					nextAttempt: attempt + 1,
					maxAttempts,
					delay: Math.round(delay),
					error: error instanceof Error ? error.message : String(error),
				},
			);

			await sleep(delay);
		}
	}

	throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a retryable version of a function
 *
 * @param fn - The async function to wrap
 * @param options - Retry configuration options
 * @returns A new function that will retry on failure
 *
 * @example
 * const retryableFetch = createRetryable(
 *   (url: string) => fetch(url),
 *   { maxAttempts: 3 }
 * );
 * const response = await retryableFetch("https://api.example.com");
 */
export function createRetryable<TArgs extends unknown[], TResult>(
	fn: (...args: TArgs) => Promise<TResult>,
	options: RetryOptions = {},
): (...args: TArgs) => Promise<TResult> {
	return (...args: TArgs) => withRetry(() => fn(...args), options);
}

/**
 * Utility to check if an error is a network error (typically retryable)
 */
export function isNetworkError(error: unknown): boolean {
	if (error instanceof Error) {
		const networkErrorMessages = [
			"fetch failed",
			"network error",
			"ECONNRESET",
			"ECONNREFUSED",
			"ETIMEDOUT",
			"ENOTFOUND",
			"socket hang up",
		];

		return networkErrorMessages.some(
			(msg) =>
				error.message.toLowerCase().includes(msg.toLowerCase()) ||
				error.name.toLowerCase().includes(msg.toLowerCase()),
		);
	}
	return false;
}

/**
 * Utility to check if an HTTP status code is retryable
 */
export function isRetryableStatusCode(statusCode: number): boolean {
	// Retry on server errors (5xx) and some client errors
	const retryableCodes = [
		408, // Request Timeout
		429, // Too Many Requests
		500, // Internal Server Error
		502, // Bad Gateway
		503, // Service Unavailable
		504, // Gateway Timeout
	];

	return retryableCodes.includes(statusCode);
}
