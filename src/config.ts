/**
 * Configuration module with environment variable validation
 *
 * This module validates all required environment variables at startup
 * and provides type-safe access to configuration values.
 *
 * Supports:
 * - Local SQLite file (file:./sqlite.db)
 * - Remote Turso database (libsql://... or https://...)
 */

interface Config {
	BOT_TOKEN: string;
	WEBHOOK_SECRET?: string;
	REDIS_URL?: string;
	DATABASE_URL: string;
	DATABASE_AUTH_TOKEN?: string;
	PORT: number;
	NODE_ENV: "development" | "production";
	PUBLIC_URL?: string;
}

class ConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ConfigError";
	}
}

function validateConfig(): Config {
	const errors: string[] = [];

	// Required: BOT_TOKEN
	const BOT_TOKEN = process.env.BOT_TOKEN;
	if (!BOT_TOKEN || BOT_TOKEN.trim() === "") {
		errors.push("BOT_TOKEN is required");
	}

	// Optional: WEBHOOK_SECRET
	const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || undefined;

	// Optional: REDIS_URL (for Upstash Redis)
	const REDIS_URL = process.env.REDIS_URL || undefined;

	// Optional: DATABASE_URL with default
	// Supports: file:./sqlite.db, libsql://..., https://...
	const DATABASE_URL = process.env.DATABASE_URL || "file:./sqlite.db";

	// Optional: DATABASE_AUTH_TOKEN (required for remote Turso databases)
	const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN || undefined;

	// Validate that remote databases have an auth token
	const isRemoteDatabase =
		DATABASE_URL.startsWith("libsql://") || DATABASE_URL.startsWith("https://");
	if (isRemoteDatabase && !DATABASE_AUTH_TOKEN) {
		errors.push("DATABASE_AUTH_TOKEN is required for remote Turso databases");
	}

	// Optional: PORT with default
	const portStr = process.env.PORT || "3000";
	const PORT = Number.parseInt(portStr, 10);
	if (Number.isNaN(PORT) || PORT < 1 || PORT > 65535) {
		errors.push(`PORT must be a valid port number (1-65535), got: ${portStr}`);
	}

	// Optional: NODE_ENV with default
	const NODE_ENV = process.env.NODE_ENV || "development";
	if (NODE_ENV !== "development" && NODE_ENV !== "production") {
		errors.push(
			`NODE_ENV must be "development" or "production", got: ${NODE_ENV}`,
		);
	}

	// Optional: PUBLIC_URL for export download links
	// In production, this should be the public URL where the bot is deployed
	const PUBLIC_URL = process.env.PUBLIC_URL || undefined;

	// Throw all errors at once
	if (errors.length > 0) {
		throw new ConfigError(
			`Configuration validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
		);
	}

	return {
		BOT_TOKEN: BOT_TOKEN as string,
		WEBHOOK_SECRET,
		REDIS_URL,
		DATABASE_URL,
		DATABASE_AUTH_TOKEN,
		PORT,
		NODE_ENV: NODE_ENV as "development" | "production",
		PUBLIC_URL,
	};
}

// Validate and export config on module load
export const config = validateConfig();

// Helper to check if Redis is configured
export function isRedisConfigured(): boolean {
	return !!config.REDIS_URL;
}

// Helper to check if running in production
export function isProduction(): boolean {
	return config.NODE_ENV === "production";
}

// Helper to check if using a remote database (Turso)
export function isRemoteDatabase(): boolean {
	return (
		config.DATABASE_URL.startsWith("libsql://") ||
		config.DATABASE_URL.startsWith("https://")
	);
}

// Helper to check if using a local file database
export function isLocalDatabase(): boolean {
	return config.DATABASE_URL.startsWith("file:");
}

// Helper to get the public URL for export links
export function getPublicUrl(): string | null {
	return config.PUBLIC_URL || null;
}
