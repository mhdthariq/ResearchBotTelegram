import { Elysia } from "elysia";
import { bot } from "./bot";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const PORT = process.env.PORT || 3000;

const app = new Elysia()
	.get("/", () => ({
		status: "ok",
		bot: "Research Bot",
		mode: "webhook",
	}))
	.post("/webhook", async ({ body, headers, set }) => {
		// Verify secret token if configured
		if (WEBHOOK_SECRET) {
			const headerToken = headers["x-telegram-bot-api-secret-token"];
			if (headerToken !== WEBHOOK_SECRET) {
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
			console.error("Webhook error:", error);
			// Always return 200 to Telegram to prevent retries
			return { ok: true, error: "Internal error handled" };
		}
	})
	.get("/health", () => ({
		status: "healthy",
		timestamp: new Date().toISOString(),
	}))
	.listen(PORT);

console.log(`🦊 Elysia webhook server running at http://localhost:${PORT}`);
console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);

export { app };
