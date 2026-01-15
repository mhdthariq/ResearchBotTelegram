/**
 * Webhook server entry point using Elysia
 *
 * This file starts the bot in webhook mode with Elysia,
 * suitable for production deployments behind a reverse proxy.
 *
 * Endpoints:
 * - GET /           - Status check
 * - POST /webhook   - Telegram webhook endpoint
 * - GET /health     - Simple health check
 * - GET /health/detailed - Detailed health with dependencies
 * - GET /metrics    - Application metrics (JSON)
 * - GET /metrics/prometheus - Prometheus format metrics
 * - GET /ready      - Readiness probe
 * - GET /live       - Liveness probe
 * - GET /api/export/:token - Download export files (BibTeX/CSV)
 */

import { Elysia } from "elysia";
import { bot } from "./bot";
import { config, isRedisConfigured } from "./config";
import { isDatabaseHealthy } from "./db/index.js";
import { checkRedisConnection } from "./storage/redis";
import { getExport, getExportMimeType } from "./utils/exportStorage.js";
import { logger } from "./utils/logger";
import { collectMetrics, formatPrometheusMetrics } from "./utils/metrics";

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
/**
 * Check if the database connection is working
 */
async function checkDatabaseConnection(): Promise<boolean> {
  try {
    return await isDatabaseHealthy();
  } catch {
    return false;
  }
}

/**
 * Collect health check results
 */
async function getHealthChecks(): Promise<{
  bot: boolean;
  database: boolean;
  redis: boolean | null;
}> {
  const [botHealth, dbHealth, redisHealth] = await Promise.all([
    checkBotConnection(),
    checkDatabaseConnection(),
    isRedisConfigured() && config.REDIS_URL
      ? checkRedisConnection(config.REDIS_URL)
      : Promise.resolve(null),
  ]);

  return {
    bot: botHealth,
    database: dbHealth,
    redis: redisHealth,
  };
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

  // Export download endpoint
  .get("/api/export/:token", ({ params, set }) => {
    const { token } = params;

    if (!token) {
      set.status = 400;
      return { error: "Missing export token" };
    }

    // Retrieve export data
    const exportData = getExport(token);

    if (!exportData) {
      logger.warn("Export not found or expired", { token });
      set.status = 404;
      return {
        error: "Export not found or expired",
        message:
          "This download link has expired. Please request a new export from the bot.",
      };
    }

    // Set response headers for file download
    const mimeType = getExportMimeType(exportData.format);
    const filename = exportData.filename;

    set.headers["content-type"] = mimeType;
    set.headers["content-disposition"] = `attachment; filename="${filename}"`;
    set.headers["cache-control"] = "no-cache, no-store, must-revalidate";
    set.headers["pragma"] = "no-cache";
    set.headers["expires"] = "0";

    logger.info("Serving export file", {
      token,
      format: exportData.format,
      filename,
      userId: exportData.userId,
    });

    // Send the file content
    return exportData.content;
  })

  // Simple health check
  .get("/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
  }))

  // Detailed health check with dependency status
  .get("/health/detailed", async () => {
    const checks = await getHealthChecks();
    const allHealthy =
      checks.bot && checks.database && (checks.redis === null || checks.redis);

    return {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks: {
        bot: checks.bot ? "ok" : "error",
        database: checks.database ? "ok" : "error",
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

  // Metrics endpoint (JSON format)
  .get("/metrics", async () => {
    const metrics = await collectMetrics();
    return {
      timestamp: new Date().toISOString(),
      ...metrics,
    };
  })

  // Prometheus-compatible metrics endpoint
  .get("/metrics/prometheus", async ({ set }) => {
    const metrics = await collectMetrics();
    set.headers["content-type"] = "text/plain; charset=utf-8";
    return formatPrometheusMetrics(metrics);
  })

  // Readiness probe for Kubernetes/Docker
  .get("/ready", async ({ set }) => {
    const checks = await getHealthChecks();

    if (!checks.bot) {
      set.status = 503;
      return { ready: false, reason: "Bot connection failed" };
    }

    if (!checks.database) {
      set.status = 503;
      return { ready: false, reason: "Database connection failed" };
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
console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);

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
