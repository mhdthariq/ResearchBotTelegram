# research-bot

AI Research Assistant Telegram Bot - Search and discover the latest research papers from arXiv.

## Documentation

📚 See the [docs folder](./docs/) for detailed guides:

- [Webhook Deployment Guide](./docs/vercel-deployment.md) - How to deploy with webhooks (Elysia or Vercel)

### Stack

- Telegram Bot API framework - [GramIO](https://gramio.dev/)
- Linter - [Biome](https://biomejs.dev/)
- GramIO plugins - [Session](https://gramio.dev/plugins/official/session.html), [Prompt](https://gramio.dev/plugins/official/prompt.html)
- Webhook Server - [Elysia](https://elysiajs.com/)

## Features

- 🔍 **Search Papers** - Search arXiv for research papers on any topic
- 📚 **Load More** - Paginate through search results
- ⌨️ **Interactive Buttons** - User-friendly inline keyboard interface

## Development

Start the bot (polling mode):

```bash
bun dev
```

Start the bot (webhook mode):

```bash
bun run dev:webhook
```

## Production

### Elysia Webhook (Recommended)

Start the webhook server:

```bash
bun run start:webhook
```

The server runs on port 3000 (or `PORT` env variable) with endpoints:

- `GET /` - Status check
- `POST /webhook` - Telegram webhook endpoint
- `GET /health` - Health check

### Polling Mode

For simple deployments without webhook:

```bash
bun run start
```

### Vercel (Serverless)

1. Deploy to Vercel (via Dashboard or CLI)
2. Set environment variables (`BOT_TOKEN`, `WEBHOOK_SECRET`)
3. Set up the webhook:

```bash
bun run webhook:set https://your-app.vercel.app/api/webhook
```

See the [Webhook Deployment Guide](./docs/vercel-deployment.md) for detailed instructions.

## Environment Variables

| Variable | Required | Description |
| ----------------- | -------- | ------------------------------- |
| `BOT_TOKEN` | Yes | Telegram bot token from BotFather |
| `WEBHOOK_SECRET` | No | Secret for webhook verification |
| `PORT` | No | Server port (default: 3000) |

## Webhook Management

```bash
# Set webhook URL
bun run webhook:set <URL>

# Remove webhook (switch to polling)
bun run webhook:delete

# Check webhook status
bun run webhook:info
```

## Available Scripts

| Script | Description |
| ------------------ | ---------------------------------- |
| `bun dev` | Start bot in polling mode (dev) |
| `bun run dev:webhook` | Start webhook server (dev) |
| `bun run start` | Start bot in polling mode (prod) |
| `bun run start:webhook` | Start webhook server (prod) |
| `bun run lint` | Check code with Biome linter |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run webhook:set` | Set Telegram webhook URL |
| `bun run webhook:delete` | Remove Telegram webhook |
| `bun run webhook:info` | Get webhook information |