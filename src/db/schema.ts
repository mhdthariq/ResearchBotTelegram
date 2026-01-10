import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: text("chat_id").notNull(),
  userId: text("user_id"),
  topic: text("topic").notNull(),
  intervalDays: integer("interval_days").notNull(),
  lastRunAt: text("last_run_at").default(sql`CURRENT_TIMESTAMP`),
});
