/**
 * Vercel Serverless Function for Telegram Webhook
 *
 * This handler processes incoming Telegram updates in a serverless environment.
 * It includes proper error handling and request validation.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bot } from "../src/bot";
import { logger } from "../src/utils/logger";

// Get webhook secret from environment
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export default async function handler(
	req: VercelRequest,
	res: VercelResponse,
): Promise<VercelResponse> {
	// Handle GET requests for health check
	if (req.method === "GET") {
		return res.status(200).json({
			status: "ok",
			bot: "Research Bot",
			mode: "webhook",
			platform: "vercel",
			timestamp: new Date().toISOString(),
		});
	}

	// Only allow POST for webhook updates
	if (req.method !== "POST") {
		logger.warn("Invalid HTTP method for webhook", { method: req.method });
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		// Verify the secret token if set (recommended)
		if (WEBHOOK_SECRET) {
			const headerToken = req.headers["x-telegram-bot-api-secret-token"];
			if (headerToken !== WEBHOOK_SECRET) {
				logger.warn("Unauthorized webhook request", {
					headerToken: headerToken ? "present" : "missing",
				});
				return res.status(401).json({ error: "Unauthorized" });
			}
		}

		// Validate request body
		const update = req.body;

		if (!update) {
			logger.warn("Empty webhook request body");
			return res.status(400).json({ error: "No update provided" });
		}

		// Log incoming update (debug level)
		logger.debug("Processing webhook update", {
			updateId: update.update_id,
			type: update.message
				? "message"
				: update.callback_query
					? "callback_query"
					: "other",
		});

		// Handle the update using gramio's updates.handleUpdate method
		await bot.updates.handleUpdate(update);

		return res.status(200).json({ ok: true });
	} catch (error) {
		logger.error("Webhook processing error", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});

		// Always return 200 to Telegram to prevent retries
		// Telegram will keep retrying if we return an error status
		return res.status(200).json({ ok: true, error: "Internal error handled" });
	}
}
