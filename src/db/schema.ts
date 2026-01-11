/**
 * Database Schema using Drizzle ORM
 *
 * Defines all database tables for the Research Bot:
 * - users: User profiles and preferences
 * - searchHistory: Track user search queries
 * - bookmarks: Saved papers
 * - subscriptions: Topic subscriptions for notifications
 * - analytics: Usage tracking
 */

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

/**
 * Users table - stores user information and preferences
 */
export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	chatId: integer("chat_id").notNull().unique(),
	username: text("username"),
	firstName: text("first_name"),
	lastName: text("last_name"),
	resultsPerPage: integer("results_per_page").default(5),
	preferredCategories: text("preferred_categories"), // JSON array
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	lastActiveAt: text("last_active_at"),
});

/**
 * Search history table - tracks user search queries
 */
export const searchHistory = sqliteTable("search_history", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	query: text("query").notNull(),
	resultsCount: integer("results_count").default(0),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Bookmarks table - saved papers for users
 */
export const bookmarks = sqliteTable(
	"bookmarks",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		arxivId: text("arxiv_id").notNull(),
		title: text("title").notNull(),
		authors: text("authors"), // JSON array or comma-separated
		summary: text("summary"),
		link: text("link").notNull(),
		categories: text("categories"), // JSON array
		publishedDate: text("published_date"),
		notes: text("notes"),
		createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => ({
		// Ensure a user can't bookmark the same paper twice
		userArxivUnique: unique().on(table.userId, table.arxivId),
	}),
);

/**
 * Subscriptions table - topic subscriptions for notifications
 */
export const subscriptions = sqliteTable("subscriptions", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	topic: text("topic").notNull(),
	category: text("category"),
	intervalHours: integer("interval_hours").default(24),
	lastRunAt: text("last_run_at"),
	isActive: integer("is_active", { mode: "boolean" }).default(true),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Analytics table - tracks usage events
 */
export const analytics = sqliteTable("analytics", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	eventType: text("event_type").notNull(), // search, view, bookmark, export, etc.
	userId: integer("user_id").references(() => users.id, {
		onDelete: "set null",
	}),
	metadata: text("metadata"), // JSON data for event details
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Type exports for use in application code
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type SearchHistoryEntry = typeof searchHistory.$inferSelect;
export type NewSearchHistoryEntry = typeof searchHistory.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type AnalyticsEvent = typeof analytics.$inferSelect;
export type NewAnalyticsEvent = typeof analytics.$inferInsert;
