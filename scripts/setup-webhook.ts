// Make this file a module
export {};

/**
 * Webhook Setup Script
 *
 * This script sets up or removes the Telegram webhook for your bot.
 *
 * Usage:
 *   bun run scripts/setup-webhook.ts set <WEBHOOK_URL>
 *   bun run scripts/setup-webhook.ts delete
 *   bun run scripts/setup-webhook.ts info
 *
 * Examples:
 *   bun run scripts/setup-webhook.ts set https://your-app.vercel.app/api/webhook
 *   bun run scripts/setup-webhook.ts delete
 *   bun run scripts/setup-webhook.ts info
 */

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!BOT_TOKEN) {
	console.error("❌ BOT_TOKEN environment variable is required");
	process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function setWebhook(url: string) {
	console.log(`🔗 Setting webhook to: ${url}`);

	const params: Record<string, string> = {
		url,
		allowed_updates: JSON.stringify([
			"message",
			"callback_query",
			"inline_query",
		]),
	};

	// Add secret token if configured
	if (WEBHOOK_SECRET) {
		params.secret_token = WEBHOOK_SECRET;
		console.log("🔐 Using secret token for webhook verification");
	}

	const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(params),
	});

	const result = await response.json();

	if (result.ok) {
		console.log("✅ Webhook set successfully!");
		console.log(`   URL: ${url}`);
		if (WEBHOOK_SECRET) {
			console.log("   Secret token: configured");
		}
	} else {
		console.error("❌ Failed to set webhook:", result.description);
		process.exit(1);
	}
}

async function deleteWebhook() {
	console.log("🗑️  Deleting webhook...");

	const response = await fetch(`${TELEGRAM_API}/deleteWebhook`, {
		method: "POST",
	});

	const result = await response.json();

	if (result.ok) {
		console.log("✅ Webhook deleted successfully!");
		console.log("   Bot will now use long polling mode");
	} else {
		console.error("❌ Failed to delete webhook:", result.description);
		process.exit(1);
	}
}

async function getWebhookInfo() {
	console.log("ℹ️  Getting webhook info...\n");

	const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
	const result = await response.json();

	if (result.ok) {
		const info = result.result;
		console.log("Webhook Information:");
		console.log("────────────────────");
		console.log(`URL: ${info.url || "(not set)"}`);
		console.log(`Has custom certificate: ${info.has_custom_certificate}`);
		console.log(`Pending update count: ${info.pending_update_count}`);

		if (info.last_error_date) {
			const errorDate = new Date(info.last_error_date * 1000);
			console.log(`Last error: ${errorDate.toISOString()}`);
			console.log(`Last error message: ${info.last_error_message}`);
		}

		if (info.allowed_updates) {
			console.log(`Allowed updates: ${info.allowed_updates.join(", ")}`);
		}

		if (info.ip_address) {
			console.log(`IP address: ${info.ip_address}`);
		}
	} else {
		console.error("❌ Failed to get webhook info:", result.description);
		process.exit(1);
	}
}

// Parse command line arguments
const [command, webhookUrl] = process.argv.slice(2);

switch (command) {
	case "set":
		if (!webhookUrl) {
			console.error("❌ Please provide a webhook URL");
			console.error("   Usage: bun run scripts/setup-webhook.ts set <URL>");
			process.exit(1);
		}
		await setWebhook(webhookUrl);
		break;

	case "delete":
		await deleteWebhook();
		break;

	case "info":
		await getWebhookInfo();
		break;

	default:
		console.log(`
Webhook Setup Script
────────────────────

Usage:
  bun run scripts/setup-webhook.ts <command> [options]

Commands:
  set <url>    Set the webhook URL
  delete       Remove the webhook (switch to polling mode)
  info         Get current webhook information

Examples:
  bun run scripts/setup-webhook.ts set https://your-app.vercel.app/api/webhook
  bun run scripts/setup-webhook.ts delete
  bun run scripts/setup-webhook.ts info

Environment Variables:
  BOT_TOKEN       (required) Your Telegram bot token
  WEBHOOK_SECRET  (optional) Secret token for webhook verification
`);
		process.exit(1);
}
