/**
 * Database Connection and Client
 *
 * Uses libSQL (Turso) for serverless compatibility with both Bun and Node.js (Vercel).
 * Supports local SQLite file or remote Turso database.
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import * as schema from "./schema.js";

/**
 * Get the database URL configuration
 * Supports:
 * - file:./path/to/db.sqlite (local SQLite)
 * - libsql://... (Turso remote)
 * - https://... (Turso remote)
 */
function getDatabaseConfig(): { url: string; authToken?: string } {
	return {
		url: config.DATABASE_URL,
		authToken: config.DATABASE_AUTH_TOKEN,
	};
}

// Create libSQL client
const dbConfig = getDatabaseConfig();
const client = createClient(dbConfig);

// Create Drizzle client with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export * from "./schema.js";

logger.info("Database initialized", {
	url: dbConfig.url.startsWith("file:")
		? dbConfig.url
		: dbConfig.url.replace(/\/\/.*@/, "//***@"), // Hide auth in logs
	hasAuthToken: !!dbConfig.authToken,
});

/**
 * Close the database connection
 * Call this during graceful shutdown
 */
export function closeDatabase(): void {
	try {
		client.close();
		logger.info("Database connection closed");
	} catch (error) {
		logger.error("Error closing database", {
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

/**
 * Check if database is healthy
 */
export async function isDatabaseHealthy(): Promise<boolean> {
	try {
		await client.execute("SELECT 1");
		return true;
	} catch {
		return false;
	}
}
