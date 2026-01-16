/**
 * Export Storage Utility
 *
 * Provides persistent storage for export files (BibTeX, CSV).
 * Uses Redis (Upstash) for persistence in production/serverless environments
 * with fallback to in-memory storage for local development.
 *
 * Features:
 * - Redis persistence for multi-instance/serverless deployments
 * - In-memory fallback when Redis is not configured
 * - Automatic expiration (TTL)
 * - One-time download support (optional)
 */

import { config, isRedisConfigured } from "../config.js";
import { logger } from "./logger.js";

export interface ExportData {
	content: string;
	format: "bibtex" | "csv";
	filename: string;
	userId: number;
	createdAt: number;
	expiresAt: number;
	/** If true, export is deleted after first download */
	oneTimeDownload?: boolean;
}

/** Default TTL for exports: 15 minutes */
const DEFAULT_TTL_SECONDS = 900;

/** Redis key prefix for exports */
const EXPORT_KEY_PREFIX = "export:";

// In-memory storage fallback
const memoryStore = new Map<string, ExportData>();

/**
 * Upstash Redis client for export storage
 */
class ExportRedisClient {
	private readonly url: string;
	private readonly token: string;

	constructor(redisUrl: string) {
		const parsed = this.parseRedisUrl(redisUrl);
		this.url = parsed.restUrl;
		this.token = parsed.token;
	}

	private parseRedisUrl(redisUrl: string): { restUrl: string; token: string } {
		try {
			if (redisUrl.startsWith("https://")) {
				const url = new URL(redisUrl);
				if (url.password) {
					return {
						restUrl: `https://${url.hostname}`,
						token: url.password,
					};
				}
				throw new Error("HTTPS URL provided without token");
			}

			const url = new URL(redisUrl);
			const hostname = url.hostname;
			const token = url.password;

			if (!token) {
				throw new Error("No token found in Redis URL");
			}

			return {
				restUrl: `https://${hostname}`,
				token,
			};
		} catch (error) {
			throw new Error(
				`Invalid Redis URL format: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	private async request<T = unknown>(
		command: string[],
	): Promise<{ result: T | null; error?: string }> {
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
				return { result: null, error: text };
			}

			return (await response.json()) as { result: T | null; error?: string };
		} catch (error) {
			return {
				result: null,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	async get(key: string): Promise<string | null> {
		const response = await this.request<string>(["GET", key]);
		return response.result;
	}

	async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
		const command = ttlSeconds
			? ["SET", key, value, "EX", String(ttlSeconds)]
			: ["SET", key, value];
		const response = await this.request(command);
		return response.result === "OK";
	}

	async delete(key: string): Promise<boolean> {
		const response = await this.request<number>(["DEL", key]);
		return response.result === 1;
	}
}

// Lazy-initialized Redis client
let redisClient: ExportRedisClient | null = null;

function getRedisClient(): ExportRedisClient | null {
	if (!isRedisConfigured() || !config.REDIS_URL) {
		return null;
	}

	if (!redisClient) {
		try {
			redisClient = new ExportRedisClient(config.REDIS_URL);
		} catch (error) {
			logger.error("Failed to initialize Redis client for exports", {
				error: error instanceof Error ? error.message : String(error),
			});
			return null;
		}
	}

	return redisClient;
}

/**
 * Generate a secure random token for export download
 */
export function generateExportToken(): string {
	const array = new Uint8Array(24);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
}

/**
 * Store export data for later retrieval
 *
 * @param token - Unique download token
 * @param data - Export data to store
 * @param ttlSeconds - Time to live in seconds (default: 15 minutes)
 * @returns True if stored successfully
 */
export async function storeExport(
	token: string,
	data: Omit<ExportData, "createdAt" | "expiresAt">,
	ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<boolean> {
	const now = Date.now();
	const exportData: ExportData = {
		...data,
		createdAt: now,
		expiresAt: now + ttlSeconds * 1000,
	};

	const redis = getRedisClient();
	const key = `${EXPORT_KEY_PREFIX}${token}`;

	if (redis) {
		try {
			const success = await redis.set(
				key,
				JSON.stringify(exportData),
				ttlSeconds,
			);

			if (success) {
				logger.debug("Stored export in Redis", {
					token,
					format: data.format,
					userId: data.userId,
					ttlSeconds,
				});
				return true;
			}
		} catch (error) {
			logger.error("Failed to store export in Redis", {
				error: error instanceof Error ? error.message : String(error),
				token,
			});
		}
	}

	// Fallback to in-memory storage
	memoryStore.set(token, exportData);

	// Schedule cleanup for in-memory storage
	setTimeout(() => {
		memoryStore.delete(token);
	}, ttlSeconds * 1000);

	logger.debug("Stored export in memory", {
		token,
		format: data.format,
		userId: data.userId,
		ttlSeconds,
	});

	return true;
}

/**
 * Retrieve export data by token
 *
 * @param token - Download token
 * @returns Export data if valid and not expired, null otherwise
 */
export async function getExportAsync(
	token: string,
): Promise<ExportData | null> {
	const redis = getRedisClient();
	const key = `${EXPORT_KEY_PREFIX}${token}`;

	if (redis) {
		try {
			const data = await redis.get(key);
			if (data) {
				const exportData = JSON.parse(data) as ExportData;

				// Check expiration
				if (Date.now() > exportData.expiresAt) {
					await redis.delete(key);
					return null;
				}

				// Handle one-time download
				if (exportData.oneTimeDownload) {
					await redis.delete(key);
				}

				logger.debug("Retrieved export from Redis", {
					token,
					format: exportData.format,
				});

				return exportData;
			}
		} catch (error) {
			logger.error("Failed to retrieve export from Redis", {
				error: error instanceof Error ? error.message : String(error),
				token,
			});
		}
	}

	// Fallback to in-memory
	const data = memoryStore.get(token);

	if (!data) {
		logger.debug("Export not found", { token });
		return null;
	}

	// Check expiration
	if (Date.now() > data.expiresAt) {
		logger.debug("Export expired", { token });
		memoryStore.delete(token);
		return null;
	}

	// Handle one-time download
	if (data.oneTimeDownload) {
		memoryStore.delete(token);
	}

	return data;
}

/**
 * Synchronous export retrieval for webhook endpoint compatibility
 * Only checks in-memory storage (for backward compatibility)
 *
 * @param token - Download token
 * @returns Export data if valid and not expired, null otherwise
 */
export function getExport(token: string): ExportData | null {
	const data = memoryStore.get(token);

	if (!data) {
		logger.debug("Export not found in memory", { token });
		return null;
	}

	// Check expiration
	if (Date.now() > data.expiresAt) {
		logger.debug("Export expired", { token });
		memoryStore.delete(token);
		return null;
	}

	// Handle one-time download
	if (data.oneTimeDownload) {
		memoryStore.delete(token);
	}

	return data;
}

/**
 * Delete an export
 *
 * @param token - Download token
 * @returns True if deleted
 */
export async function deleteExport(token: string): Promise<boolean> {
	const redis = getRedisClient();
	const key = `${EXPORT_KEY_PREFIX}${token}`;

	let deleted = false;

	if (redis) {
		try {
			deleted = await redis.delete(key);
		} catch (error) {
			logger.error("Failed to delete export from Redis", {
				error: error instanceof Error ? error.message : String(error),
				token,
			});
		}
	}

	// Also delete from memory
	if (memoryStore.delete(token)) {
		deleted = true;
	}

	return deleted;
}

/**
 * Get MIME type for export format
 */
export function getExportMimeType(format: "bibtex" | "csv"): string {
	switch (format) {
		case "bibtex":
			return "application/x-bibtex";
		case "csv":
			return "text/csv";
		default:
			return "application/octet-stream";
	}
}

/**
 * Get file extension for export format
 */
export function getExportExtension(format: "bibtex" | "csv"): string {
	switch (format) {
		case "bibtex":
			return ".bib";
		case "csv":
			return ".csv";
		default:
			return ".txt";
	}
}

/**
 * Create a complete export with storage
 *
 * @param content - Export content
 * @param format - Export format
 * @param userId - User ID
 * @param options - Additional options
 * @returns Token and full download URL
 */
export async function createExport(
	content: string,
	format: "bibtex" | "csv",
	userId: number,
	options?: {
		ttlSeconds?: number;
		oneTimeDownload?: boolean;
		baseUrl?: string;
	},
): Promise<{ token: string; downloadUrl: string; filename: string }> {
	const token = generateExportToken();
	const extension = getExportExtension(format);
	const timestamp = new Date().toISOString().split("T")[0];
	const filename = `bookmarks_${timestamp}${extension}`;

	await storeExport(
		token,
		{
			content,
			format,
			filename,
			userId,
			oneTimeDownload: options?.oneTimeDownload,
		},
		options?.ttlSeconds,
	);

	const baseUrl = options?.baseUrl || "";
	const downloadUrl = `${baseUrl}/api/export/${token}`;

	return { token, downloadUrl, filename };
}
