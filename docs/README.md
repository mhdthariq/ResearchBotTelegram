# Research Bot Documentation

Welcome to the Research Bot documentation! This folder contains guides and references for setting up and running the bot.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Webhook Deployment](./vercel-deployment.md) | How to deploy with webhooks (Elysia or Vercel) |

## Quick Start

1. **Install dependencies** - Run `bun install`
2. **Set environment variables** - Create `.env` with `BOT_TOKEN`
3. **Start the bot** - Run `bun dev`

## Project Structure

```
research-bot/
├── docs/                   # Documentation (you are here)
├── api/                    # Vercel serverless functions
│   └── webhook.ts          # Vercel webhook endpoint
├── scripts/                # Utility scripts
│   └── setup-webhook.ts    # Webhook management script
├── src/
│   ├── bot/
│   │   └── index.ts        # Bot instance and command handlers
│   ├── arxiv.ts            # ArXiv API integration
│   ├── index.ts            # Entry point (polling mode)
│   └── webhook.ts          # Elysia webhook server
├── package.json            # Dependencies and scripts
├── vercel.json             # Vercel configuration
└── tsconfig.json           # TypeScript configuration
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BOT_TOKEN` | Yes | - | Telegram Bot API token |
| `WEBHOOK_SECRET` | No | - | Secret for webhook verification |
| `PORT` | No | `3000` | Server port for webhook mode |

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start bot in polling mode with hot reload |
| `bun run dev:webhook` | Start Elysia webhook server with hot reload |
| `bun run start` | Start bot in polling mode (production) |
| `bun run start:webhook` | Start Elysia webhook server (production) |
| `bun run lint` | Check code with Biome linter |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run webhook:set <url>` | Register webhook URL with Telegram |
| `bun run webhook:delete` | Remove webhook (switch to polling) |
| `bun run webhook:info` | Get current webhook status |

## Features

- 🔍 **Paper Search** - Search arXiv for research papers on any topic
- 📚 **Pagination** - Load more results with the `/more` command
- ⌨️ **Interactive Buttons** - User-friendly inline keyboard interface

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Show welcome message with buttons |
| `/search [topic]` | Search for papers on a topic |
| `/more` | Load more results from last search |

## Need Help?

If you encounter any issues, check the troubleshooting section in the [Webhook Deployment Guide](./vercel-deployment.md) or open an issue in the repository.