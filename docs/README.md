# Research Bot Documentation

Welcome to the Research Bot documentation! This folder contains guides and references for setting up and running the bot.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Redis Setup](./redis-setup.md) | How to set up Redis for job scheduling (Docker, local, cloud) |

## Quick Start

1. **Set up Redis** - Follow the [Redis Setup Guide](./redis-setup.md)
2. **Configure environment** - Copy `.env.example` to `.env` and fill in your values
3. **Install dependencies** - Run `bun install`
4. **Run migrations** - Run `bun run migrate`
5. **Start the bot** - Run `bun run dev`

## Project Structure

```
research-bot/
├── docs/                   # Documentation (you are here)
├── src/
│   ├── db/                 # Database configuration and schema
│   │   ├── index.ts        # Drizzle database client
│   │   └── schema.ts       # Database schema definitions
│   ├── services/           # Business logic services
│   ├── shared/             # Shared utilities
│   ├── arxiv.ts            # ArXiv API integration
│   ├── bot.ts              # Bot instance configuration
│   ├── config.ts           # Environment configuration
│   └── index.ts            # Main entry point
├── drizzle/                # Database migrations
├── .env                    # Environment variables (create from .env.example)
├── package.json            # Dependencies and scripts
└── drizzle.config.ts       # Drizzle ORM configuration
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BOT_TOKEN` | Telegram Bot API token | Yes | - |
| `REDIS_URL` | Redis connection URL (recommended for cloud) | No | - |
| `REDIS_HOST` | Redis server hostname (if not using URL) | No | `localhost` |
| `REDIS_PORT` | Redis server port (if not using URL) | No | `6379` |

> **Note:** Use `REDIS_URL` for cloud providers like Upstash (e.g., `rediss://default:password@host:6379`). For local development, you can skip Redis env vars entirely and it will default to `localhost:6379`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start bot in development mode with hot reload |
| `bun run start` | Run migrations and start bot in production |
| `bun run lint` | Check code with Biome linter |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run generate` | Generate new database migration |
| `bun run push` | Push schema changes to database |
| `bun run migrate` | Run pending migrations |
| `bun run studio` | Open Drizzle Studio (database GUI) |

## Features

- 🔍 **Paper Search** - Search arXiv for research papers on any topic
- 📚 **Pagination** - Load more results with the `/more` command
- 🔔 **Subscriptions** - Get periodic updates on topics you care about
- 🗑️ **Unsubscribe** - Stop receiving updates for specific topics
- ⌨️ **Interactive Buttons** - User-friendly inline keyboard interface

## Need Help?

If you encounter any issues, check the troubleshooting section in the relevant documentation or open an issue in the repository.