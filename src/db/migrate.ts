/**
 * Database Migration Script
 *
 * Creates database tables if they don't exist.
 * Run this script to initialize or update the database schema.
 *
 * Usage: bun run src/db/migrate.ts
 */

import { Database } from "bun:sqlite";

// Get database path from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || "file:./sqlite.db";
const dbPath = DATABASE_URL.startsWith("file:")
	? DATABASE_URL.slice(5)
	: DATABASE_URL;

console.log(`📦 Starting database migration...`);
console.log(`📂 Database path: ${dbPath}`);

const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.exec("PRAGMA journal_mode = WAL");

// Create tables
const migrations = [
	// Users table
	`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		chat_id INTEGER NOT NULL UNIQUE,
		username TEXT,
		first_name TEXT,
		last_name TEXT,
		results_per_page INTEGER DEFAULT 5,
		preferred_categories TEXT,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
		last_active_at TEXT
	)`,

	// Search history table
	`CREATE TABLE IF NOT EXISTS search_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		query TEXT NOT NULL,
		results_count INTEGER DEFAULT 0,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	)`,

	// Bookmarks table
	`CREATE TABLE IF NOT EXISTS bookmarks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		arxiv_id TEXT NOT NULL,
		title TEXT NOT NULL,
		authors TEXT,
		summary TEXT,
		link TEXT NOT NULL,
		categories TEXT,
		published_date TEXT,
		notes TEXT,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		UNIQUE(user_id, arxiv_id)
	)`,

	// Subscriptions table
	`CREATE TABLE IF NOT EXISTS subscriptions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		topic TEXT NOT NULL,
		category TEXT,
		interval_hours INTEGER DEFAULT 24,
		last_run_at TEXT,
		is_active INTEGER DEFAULT 1,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	)`,

	// Analytics table
	`CREATE TABLE IF NOT EXISTS analytics (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		event_type TEXT NOT NULL,
		user_id INTEGER,
		metadata TEXT,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
	)`,

	// Create indexes for better query performance
	`CREATE INDEX IF NOT EXISTS idx_users_chat_id ON users(chat_id)`,
	`CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id)`,
	`CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at)`,
	`CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id)`,
	`CREATE INDEX IF NOT EXISTS idx_bookmarks_arxiv_id ON bookmarks(arxiv_id)`,
	`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`,
	`CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active)`,
	`CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type)`,
	`CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id)`,
	`CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)`,
];

// Run migrations
let successCount = 0;
let errorCount = 0;

for (const sql of migrations) {
	try {
		sqlite.exec(sql);
		successCount++;
	} catch (error) {
		errorCount++;
		console.error(
			`❌ Migration failed: ${sql.substring(0, 50)}...`,
			error instanceof Error ? error.message : String(error),
		);
	}
}

// Close connection
sqlite.close();

console.log(`\n✅ Migration completed!`);
console.log(`   - Successful: ${successCount}`);
console.log(`   - Failed: ${errorCount}`);
console.log(`   - Total: ${migrations.length}`);
