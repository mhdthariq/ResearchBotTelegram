import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bot } from "../src/bot";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	// Handle GET requests for health check
	if (req.method === "GET") {
		return res.status(200).json({
			status: "ok",
			bot: "Research Bot",
			mode: "webhook",
			timestamp: new Date().toISOString(),
		});
	}

	// Only allow POST for webhook updates
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		// Verify the secret token if set (optional but recommended)
		const secretToken = process.env.WEBHOOK_SECRET;
		if (secretToken) {
			const headerToken = req.headers["x-telegram-bot-api-secret-token"];
			if (headerToken !== secretToken) {
				return res.status(401).json({ error: "Unauthorized" });
			}
		}

		// Process the update from Telegram
		const update = req.body;

		if (!update) {
			return res.status(400).json({ error: "No update provided" });
		}

		// Handle the update using gramio's updates.handleUpdate method
		await bot.updates.handleUpdate(update);

		return res.status(200).json({ ok: true });
	} catch (error) {
		console.error("Webhook error:", error);
		// Always return 200 to Telegram to prevent retries
		return res.status(200).json({ ok: true, error: "Internal error handled" });
	}
}
