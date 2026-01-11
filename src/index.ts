/**
 * Bot entry point for polling mode
 *
 * This file starts the bot in long-polling mode,
 * suitable for local development or simple deployments.
 */

import { bot } from "./bot";
import { config } from "./config";
import { logger } from "./utils/logger";

// Log startup configuration
logger.info("Starting Research Bot in polling mode", {
	environment: config.NODE_ENV,
	redisConfigured: !!config.REDIS_URL,
});

// Handle graceful shutdown
process.on("SIGINT", () => {
	logger.info("Received SIGINT, shutting down...");
	bot.stop();
	process.exit(0);
});

process.on("SIGTERM", () => {
	logger.info("Received SIGTERM, shutting down...");
	bot.stop();
	process.exit(0);
});

// Start bot in polling mode
bot.onStart(({ info }) => {
	logger.info(`Bot @${info.username} started successfully!`, {
		botId: info.id,
		username: info.username,
	});
	console.log(`✨ Bot @${info.username} started!`);
});

bot.start().catch((error) => {
	logger.error("Failed to start bot", {
		error: error instanceof Error ? error.message : String(error),
	});
	console.error("❌ Failed to start bot:", error);
	process.exit(1);
});
