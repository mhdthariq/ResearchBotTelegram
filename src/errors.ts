/**
 * Custom error types for better error handling
 *
 * These error classes provide structured error information
 * for different failure scenarios in the application.
 */

/**
 * Error thrown when arXiv API requests fail
 */
export class ArxivApiError extends Error {
	constructor(
		message: string,
		public readonly statusCode?: number,
		public readonly cause?: Error,
	) {
		super(message);
		this.name = "ArxivApiError";

		// Maintains proper stack trace for where error was thrown (V8 engines)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ArxivApiError);
		}
	}
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitError extends Error {
	constructor(
		public readonly retryAfter?: number,
		message = "Rate limit exceeded",
	) {
		super(message);
		this.name = "RateLimitError";

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, RateLimitError);
		}
	}
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends Error {
	constructor(
		message: string,
		public readonly field?: string,
	) {
		super(message);
		this.name = "ValidationError";

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ValidationError);
		}
	}
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ConfigError";

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConfigError);
		}
	}
}

/**
 * Error thrown when session operations fail
 */
export class SessionError extends Error {
	constructor(
		message: string,
		public readonly cause?: Error,
	) {
		super(message);
		this.name = "SessionError";

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, SessionError);
		}
	}
}

/**
 * Error thrown when Redis operations fail
 */
export class RedisError extends Error {
	constructor(
		message: string,
		public readonly cause?: Error,
	) {
		super(message);
		this.name = "RedisError";

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, RedisError);
		}
	}
}

/**
 * Type guard to check if an error is an ArxivApiError
 */
export function isArxivApiError(error: unknown): error is ArxivApiError {
	return error instanceof ArxivApiError;
}

/**
 * Type guard to check if an error is a RateLimitError
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
	return error instanceof RateLimitError;
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
	return error instanceof ValidationError;
}

/**
 * Extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "An unknown error occurred";
}
