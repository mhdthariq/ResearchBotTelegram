/**
 * Redis storage adapter for Upstash
 *
 * Provides session storage using Upstash Redis REST API.
 * Compatible with @gramio/session storage interface.
 *
 * Upstash Redis URL formats:
 * - Redis protocol: rediss://default:TOKEN@HOST:6379
 * - REST API: https://HOST (what we need)
 *
 * This adapter converts the Redis protocol URL to REST API format.
 */

import { logger } from "../utils/logger";

interface RedisStorageOptions {
	/** Key prefix for session data (default: "session") */
	prefix?: string;
	/** TTL in seconds for session data (default: 86400 = 24 hours) */
	ttl?: number;
}

interface UpstashResponse<T = unknown> {
	result: T | null;
	error?: string;
}

/**
 * Redis storage adapter for Upstash REST API
 * Works with @gramio/session
 */
export class UpstashRedisStorage<T> {
	private readonly url: string;
	private readonly token: string;
	private readonly prefix: string;
	private readonly ttl: number;

	constructor(redisUrl: string, options: RedisStorageOptions = {}) {
		// Parse Upstash Redis URL and convert to REST API format
		const parsedUrl = this.parseRedisUrl(redisUrl);
		this.url = parsedUrl.restUrl;
		this.token = parsedUrl.token;
		this.prefix = options.prefix || "session";
		this.ttl = options.ttl || 86400; // 24 hours default

		logger.debug("UpstashRedisStorage initialized", {
			url: this.url,
			prefix: this.prefix,
			ttl: this.ttl,
		});
	}

	/**
	 * Parse Upstash Redis URL and extract REST API URL and token
	 *
	 * Input formats:
	 * - rediss://default:TOKEN@hostname.upstash.io:6379
	 * - redis://default:TOKEN@hostname.upstash.io:6379
	 * - https://hostname.upstash.io (already REST format)
	 *
	 * Output: REST API URL (https://hostname.upstash.io) and token
	 */
	private parseRedisUrl(redisUrl: string): {
		restUrl: string;
		token: string;
	} {
		try {
			// If it's already an HTTPS URL, assume it's the REST API URL
			// In this case, we need the token from environment or it should be passed separately
			if (redisUrl.startsWith("https://")) {
				// Check if there's auth in the URL
				const url = new URL(redisUrl);
				if (url.password) {
					return {
						restUrl: `https://${url.hostname}`,
						token: url.password,
					};
				}
				// No token in URL, this might be an error case
				throw new Error(
					"HTTPS URL provided without token. Use Redis URL format or set UPSTASH_REDIS_REST_TOKEN",
				);
			}

			// Parse redis:// or rediss:// URL
			const url = new URL(redisUrl);

			// Extract hostname without port (Upstash REST API uses standard HTTPS port)
			const hostname = url.hostname;

			// The password in the URL is the token
			const token = url.password;

			if (!token) {
				throw new Error("No token found in Redis URL");
			}

			return {
				restUrl: `https://${hostname}`,
				token,
			};
		} catch (error) {
			if (error instanceof Error && error.message.includes("token")) {
				throw error;
			}
			throw new Error(
				`Invalid Redis URL format: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	private getKey(sessionKey: string): string {
		return `${this.prefix}:${sessionKey}`;
	}

	private async request<R = unknown>(
		command: string[],
	): Promise<UpstashResponse<R>> {
		try {
			const response = await fetch(this.url, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(command),
			});

			if (!response.ok) {
				const text = await response.text();
				logger.error("Upstash request failed", {
					status: response.status,
					body: text,
				});
				return { result: null, error: text };
			}

			return (await response.json()) as UpstashResponse<R>;
		} catch (error) {
			logger.error("Upstash request error", {
				error: error instanceof Error ? error.message : String(error),
			});
			return {
				result: null,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get session data from Redis
	 */
	async get(sessionKey: string): Promise<T | undefined> {
		const key = this.getKey(sessionKey);
		const response = await this.request<string>(["GET", key]);

		if (response.error || response.result === null) {
			return undefined;
		}

		try {
			return JSON.parse(response.result) as T;
		} catch {
			logger.warn("Failed to parse session data", { key });
			return undefined;
		}
	}

	/**
	 * Check if session exists
	 */
	async has(sessionKey: string): Promise<boolean> {
		const key = this.getKey(sessionKey);
		const response = await this.request<number>(["EXISTS", key]);
		return response.result === 1;
	}

	/**
	 * Set session data in Redis with TTL
	 */
	async set(sessionKey: string, data: T): Promise<void> {
		const key = this.getKey(sessionKey);
		const value = JSON.stringify(data);

		await this.request(["SET", key, value, "EX", String(this.ttl)]);
	}

	/**
	 * Delete session data from Redis
	 */
	async delete(sessionKey: string): Promise<boolean> {
		const key = this.getKey(sessionKey);
		const response = await this.request<number>(["DEL", key]);
		return response.result === 1;
	}

	/**
	 * Test Redis connection
	 */
	async ping(): Promise<boolean> {
		const response = await this.request<string>(["PING"]);
		return response.result === "PONG";
	}
}

/**
 * Create a storage adapter compatible with @gramio/session
 *
 * @param redisUrl - Upstash Redis URL (redis:// or https://)
 * @param options - Storage options
 * @returns Storage adapter
 *
 * @example
 * import { session } from "@gramio/session";
 * import { createRedisStorage } from "./storage/redis";
 *
 * // Using Redis protocol URL (from Upstash dashboard)
 * bot.extend(
 *   session({
 *     key: "research_session",
 *     storage: createRedisStorage(process.env.REDIS_URL!),
 *     initial: () => ({ lastOffset: 0 }),
 *   }),
 * );
 */
export function createRedisStorage<T>(
	redisUrl: string,
	options: RedisStorageOptions = {},
) {
	const storage = new UpstashRedisStorage<T>(redisUrl, options);

	return {
		get: (key: string) => storage.get(key),
		set: (key: string, value: T) => storage.set(key, value),
		has: (key: string) => storage.has(key),
		delete: (key: string) => storage.delete(key),
	};
}

/**
 * Check if Redis connection is healthy
 */
export async function checkRedisConnection(redisUrl: string): Promise<boolean> {
	try {
		const storage = new UpstashRedisStorage(redisUrl);
		return await storage.ping();
	} catch {
		return false;
	}
}
