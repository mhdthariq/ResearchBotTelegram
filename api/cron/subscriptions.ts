/**
 * Vercel Cron Endpoint for Subscription Processing
 *
 * This serverless function is triggered by Vercel Cron Jobs to process
 * due subscriptions and send periodic paper updates to users.
 *
 * Configure in vercel.json:
 * ```json
 * {
 *   "crons": [{
 *     "path": "/api/cron/subscriptions",
 *     "schedule": "0 *\/6 * * *"
 *   }]
 * }
 * ```
 *
 * Schedule examples:
 * - Every hour: "0 * * * *"
 * - Every 6 hours: "0 *\/6 * * *"
 * - Daily at midnight: "0 0 * * *"
 * - Twice daily: "0 8,20 * * *"
 *
 * Security:
 * - Vercel automatically protects cron endpoints
 * - Manual triggering requires CRON_SECRET header
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { logger } from "../../src/utils/logger.js";
import { processSubscriptions } from "../../src/workers/subscriptionWorker.js";

// Secret for manual triggering (optional, set in environment)
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(
	req: VercelRequest,
	res: VercelResponse,
): Promise<VercelResponse> {
	// Only allow GET and POST methods
	if (req.method !== "GET" && req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	// Check authorization for manual triggers
	// Vercel Cron Jobs automatically include the correct headers
	const authHeader = req.headers.authorization;
	const cronHeader = req.headers["x-vercel-cron"];

	// If it's a Vercel Cron request, it's automatically authorized
	// For manual requests, check the CRON_SECRET
	if (!cronHeader && CRON_SECRET) {
		if (authHeader !== `Bearer ${CRON_SECRET}`) {
			logger.warn("Unauthorized cron request attempt", {
				hasAuth: !!authHeader,
			});
			return res.status(401).json({ error: "Unauthorized" });
		}
	}

	logger.info("Subscription cron job triggered", {
		method: req.method,
		isVercelCron: !!cronHeader,
	});

	try {
		// Parse optional configuration from query params
		const maxSubscriptions = req.query.max
			? Number.parseInt(req.query.max as string, 10)
			: undefined;
		const dryRun = req.query.dryRun === "true";

		// Run the subscription worker
		const result = await processSubscriptions({
			maxSubscriptions,
			dryRun,
		});

		logger.info("Subscription cron job completed", {
			processed: result.processed,
			successful: result.successful,
			failed: result.failed,
			durationMs: result.durationMs,
		});

		return res.status(200).json({
			success: true,
			timestamp: new Date().toISOString(),
			...result,
		});
	} catch (error) {
		logger.error("Subscription cron job failed", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});

		return res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date().toISOString(),
		});
	}
}
