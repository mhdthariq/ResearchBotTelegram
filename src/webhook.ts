/**
 * Webhook server entry point using Elysia
 *
 * This file starts the bot in webhook mode with Elysia,
 * suitable for production deployments behind a reverse proxy.
 */

import { Elysia } from "elysia";
import { bot } from "./bot";
import { config, isRedisConfigured } from "./config";
import { checkRedisConnection } from "./storage/redis";
import { logger } from "./utils/logger";

const PORT = config.PORT;
const WEBHOOK_SECRET = config.WEBHOOK_SECRET;

/**
 * Check if the bot API connection is working
 */
async function checkBotConnection(): Promise<boolean> {
	try {
		await bot.api.getMe();
		return true;
	} catch {
		return false;
	}
}

/**
 * Collect health check results
 */
async function getHealthChecks(): Promise<{
	bot: boolean;
	redis: boolean | null;
}> {
	const checks = {
		bot: await checkBotConnection(),
		redis:
			isRedisConfigured() && config.REDIS_URL
				? await checkRedisConnection(config.REDIS_URL)
				: null,
	};

	return checks;
}

// Create the Elysia app
const app = new Elysia()
	// Status endpoint
	.get("/", () => ({
		status: "ok",
		bot: "Research Bot",
		mode: "webhook",
		environment: config.NODE_ENV,
	}))

	// Webhook endpoint for Telegram
	.post("/webhook", async ({ body, headers, set }) => {
		// Verify secret token if configured
		if (WEBHOOK_SECRET) {
			const headerToken = headers["x-telegram-bot-api-secret-token"];
			if (headerToken !== WEBHOOK_SECRET) {
				logger.warn("Unauthorized webhook request", {
					headerToken: headerToken ? "present" : "missing",
				});
				set.status = 401;
				return { error: "Unauthorized" };
			}
		}

		try {
			// Handle the update using gramio
			await bot.updates.handleUpdate(
				body as Parameters<typeof bot.updates.handleUpdate>[0],
			);
			return { ok: true };
		} catch (error) {
			logger.error("Webhook processing error", {
				error: error instanceof Error ? error.message : String(error),
			});
			// Always return 200 to Telegram to prevent retries
			return { ok: true, error: "Internal error handled" };
		}
	})

	// Simple health check
	.get("/health", () => ({
		status: "healthy",
		timestamp: new Date().toISOString(),
	}))

	// Detailed health check with dependency status
	.get("/health/detailed", async () => {
		const checks = await getHealthChecks();
		const allHealthy = checks.bot && (checks.redis === null || checks.redis);

		return {
			status: allHealthy ? "healthy" : "degraded",
			timestamp: new Date().toISOString(),
			checks: {
				bot: checks.bot ? "ok" : "error",
				redis:
					checks.redis === null
						? "not_configured"
						: checks.redis
							? "ok"
							: "error",
			},
			uptime: process.uptime(),
			memory: {
				heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
				heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
				rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
			},
		};
	})

	// Readiness probe for Kubernetes/Docker
	.get("/ready", async ({ set }) => {
		const checks = await getHealthChecks();

		if (!checks.bot) {
			set.status = 503;
			return { ready: false, reason: "Bot connection failed" };
		}

		if (isRedisConfigured() && checks.redis === false) {
			set.status = 503;
			return { ready: false, reason: "Redis connection failed" };
		}

		return { ready: true };
	})

	// Liveness probe
	.get("/live", () => ({
		alive: true,
		timestamp: new Date().toISOString(),
	}))

	.listen(PORT);

// Log startup information
logger.info("Elysia webhook server started", {
	port: PORT,
	environment: config.NODE_ENV,
	redisConfigured: isRedisConfigured(),
	webhookSecretConfigured: !!WEBHOOK_SECRET,
});

console.log(`🦊 Elysia webhook server running at http://localhost:${PORT}`);
console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
console.log(`💚 Health check: http://localhost:${PORT}/health`);

// Handle graceful shutdown
process.on("SIGINT", () => {
	logger.info("Received SIGINT, shutting down...");
	app.stop();
	process.exit(0);
});

process.on("SIGTERM", () => {
	logger.info("Received SIGTERM, shutting down...");
	app.stop();
	process.exit(0);
});

export { app };
