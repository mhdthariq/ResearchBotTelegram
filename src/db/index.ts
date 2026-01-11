/**
 * Database Connection and Client
 *
 * Initializes the SQLite database using Drizzle ORM with Bun's native SQLite.
 * Provides a singleton database client for the application.
 */

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";
import * as schema from "./schema.js";

// Extract database path from DATABASE_URL (format: file:./path/to/db.sqlite)
function getDatabasePath(): string {
	const dbUrl = config.DATABASE_URL;

	if (dbUrl.startsWith("file:")) {
		return dbUrl.slice(5); // Remove "file:" prefix
	}

	return dbUrl;
}

// Create SQLite connection using Bun's native SQLite
const sqlite = new Database(getDatabasePath());

// Enable WAL mode for better concurrent performance
sqlite.exec("PRAGMA journal_mode = WAL");

// Create Drizzle client with schema
export const db = drizzle(sqlite, { schema });

// Export schema for convenience
export * from "./schema.js";

logger.info("Database initialized", {
	path: getDatabasePath(),
});

/**
 * Close the database connection
 * Call this during graceful shutdown
 */
export function closeDatabase(): void {
	try {
		sqlite.close();
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
export function isDatabaseHealthy(): boolean {
	try {
		sqlite.query("SELECT 1").get();
		return true;
	} catch {
		return false;
	}
}
