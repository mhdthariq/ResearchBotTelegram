# Webhook Deployment Guide

This guide explains how to deploy the Research Bot using webhooks. You can either use **Elysia** (recommended for VPS/Docker) or **Vercel** (serverless).

## Table of Contents

- [Overview](#overview)
- [Option 1: Elysia (Recommended)](#option-1-elysia-recommended)
- [Option 2: Vercel (Serverless)](#option-2-vercel-serverless)
- [Setting Up the Webhook](#setting-up-the-webhook)
- [Important Limitations](#important-limitations)
- [Troubleshooting](#troubleshooting)

## Overview

Instead of continuously polling Telegram for updates (long-polling), you can use webhooks where Telegram sends updates directly to your server.

### How Webhooks Work

1. You deploy your bot with a public URL
2. You register the webhook URL with Telegram
3. When a user sends a message, Telegram POSTs the update to your webhook
4. Your server processes the update
5. Your bot responds to the user

### Choosing Between Elysia and Vercel

| Feature | Elysia | Vercel |
|---------|--------|--------|
| **Best for** | VPS, Docker, Railway, Render | Serverless/JAMstack |
| **Scheduler support** | ✅ Full support | ❌ Needs workaround |
| **Session persistence** | ✅ Works with Redis | ⚠️ Requires Redis |
| **Cold starts** | None (always running) | Yes (serverless) |
| **Cost** | Server cost | Free tier available |

## Option 1: Elysia (Recommended)

Elysia is a fast, type-safe web framework for Bun. This is the recommended approach for most deployments.

### Project Structure

```
research-bot/
├── src/
│   ├── bot/
│   │   └── index.ts        # Bot instance and handlers
│   ├── scheduler/
│   │   └── index.ts        # Background job scheduler
│   ├── index.ts            # Entry point for polling mode
│   └── webhook.ts          # Elysia webhook server
├── scripts/
│   └── setup-webhook.ts    # Script to register webhook with Telegram
```

### Running the Webhook Server

#### Development

```bash
bun run dev:webhook
```

#### Production

```bash
bun run start:webhook
```

The server will start on port 3000 (or `PORT` env variable).

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check / status |
| `/webhook` | POST | Telegram webhook endpoint |
| `/health` | GET | Health check with timestamp |

### Environment Variables

```bash
BOT_TOKEN=your_telegram_bot_token
WEBHOOK_SECRET=your_secret_token  # Optional but recommended
REDIS_URL=rediss://...            # For scheduler
PORT=3000                         # Optional, defaults to 3000
```

### Deploying Elysia

#### Docker

```dockerfile
FROM oven/bun:1

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "start:webhook"]
```

#### Railway / Render

1. Connect your repository
2. Set build command: `bun install`
3. Set start command: `bun run start:webhook`
4. Add environment variables
5. Deploy

#### Docker Compose

```yaml
version: '3.8'
services:
  bot:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - WEBHOOK_SECRET=${WEBHOOK_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

---

## Option 2: Vercel (Serverless)

Use Vercel if you prefer serverless deployment.

### Project Structure

```
research-bot/
├── api/
│   └── webhook.ts          # Vercel serverless function
├── src/
│   ├── bot/
│   │   └── index.ts        # Bot instance and handlers
│   └── ...
├── scripts/
│   └── setup-webhook.ts    # Script to register webhook
└── vercel.json             # Vercel configuration
```

### Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli) (optional)
- Bot token from [@BotFather](https://t.me/BotFather)
- Redis instance (see [Redis Setup Guide](./redis-setup.md))

### Step 1: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Framework Preset: Other
   - Root Directory: `research-bot` (if in a monorepo)
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from the research-bot directory)
cd research-bot
vercel

# For production deployment
vercel --prod
```

### Step 2: Configure Environment Variables

In the Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Your Telegram bot token | `123456:ABC-DEF...` |
| `WEBHOOK_SECRET` | Secret for webhook verification | `your-random-secret` |
| `REDIS_URL` | Redis connection URL | `rediss://default:...@host:6379` |

Or using Vercel CLI:

```bash
vercel env add BOT_TOKEN
vercel env add WEBHOOK_SECRET
vercel env add REDIS_URL
```

---

## Setting Up the Webhook

After deployment, register your webhook URL with Telegram.

### Generate a Webhook Secret (Recommended)

```bash
openssl rand -hex 32
```

Save this value for the `WEBHOOK_SECRET` environment variable.

### Your Webhook URL

Depending on your deployment:

| Platform | Webhook URL |
|----------|-------------|
| Elysia (VPS) | `https://your-domain.com/webhook` |
| Railway/Render | `https://your-app.up.railway.app/webhook` |
| Vercel | `https://your-app.vercel.app/api/webhook` |

### Register the Webhook

Using the provided script:

```bash
# For Elysia
bun run webhook:set https://your-domain.com/webhook

# For Vercel
bun run webhook:set https://your-app.vercel.app/api/webhook
```

### Verify the Webhook

```bash
bun run webhook:info
```

You should see output like:
```
Webhook Information:
────────────────────
URL: https://your-domain.com/webhook
Has custom certificate: false
Pending update count: 0
```

### Test the Bot

1. Open Telegram and find your bot
2. Send `/start` command
3. You should see the welcome message with buttons

If it works, your bot is successfully deployed! 🎉

---

## Important Limitations

### Elysia Limitations

- Requires a server that stays running (VPS, Docker, etc.)
- Need to handle SSL/TLS (use a reverse proxy like nginx or Cloudflare)

### Vercel Limitations

#### ⚠️ Scheduler Won't Work on Vercel

Vercel serverless functions are stateless and short-lived. The scheduler (jobify/BullMQ) **will not work** on Vercel because:

1. Functions only run when triggered by a request
2. Functions have a maximum execution time (10-60 seconds)
3. Background processes are terminated after the response

### Solutions for Scheduled Jobs

#### Option 1: Vercel Cron Jobs

Use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) to trigger a function periodically:

1. Create `api/cron/check-subscriptions.ts`:

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { bot } from "../../src/bot";
import { db } from "../../src/db";
import { subscriptions } from "../../src/db/schema";
import { fetchPapers } from "../../src/arxiv";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const allSubs = await db.select().from(subscriptions);
  const now = new Date();

  for (const sub of allSubs) {
    const lastRun = new Date(sub.lastRunAt || 0);
    const nextRun = new Date(lastRun);
    nextRun.setDate(lastRun.getDate() + sub.intervalDays);

    if (now >= nextRun) {
      const papers = await fetchPapers(sub.topic, 0, 3);
      if (papers.length > 0) {
        await bot.api.sendMessage({
          chat_id: sub.chatId,
          text: `🔔 Daily Update for ${sub.topic}:\n\n` +
            papers.map((p) => `${p.title}\n${p.link}`).join("\n\n"),
        });

        await db
          .update(subscriptions)
          .set({ lastRunAt: new Date().toISOString() })
          .where(eq(subscriptions.id, sub.id));
      }
    }
  }

  return res.status(200).json({ ok: true });
}
```

2. Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-subscriptions",
      "schedule": "0 * * * *"
    }
  ]
}
```

> Note: Vercel Cron is available on Pro and Enterprise plans.

#### Option 2: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org/) (free)
- [EasyCron](https://www.easycron.com/)
- [Upstash QStash](https://upstash.com/docs/qstash)

#### Option 3: Hybrid Deployment

- Deploy the webhook to Vercel for handling messages
- Run the scheduler separately on a VPS, Railway, or Render

### Session Limitations

The default in-memory session storage won't persist across function invocations. For production, use Redis-based session storage:

```typescript
import { session } from "@gramio/session";
import { redisStorage } from "@gramio/storage-redis";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

bot.extend(
  session({
    key: "research_session",
    storage: redisStorage(redis),
    initial: (): SessionData => ({ lastOffset: 0 }),
  }),
);
```

## Troubleshooting

### Bot Not Responding

1. Check webhook is set correctly:
   ```bash
   bun run webhook:info
   ```

2. Check Vercel function logs:
   - Go to Vercel Dashboard → Your Project → Functions → Logs

3. Verify environment variables are set correctly

### "Unauthorized" Errors

- Ensure `WEBHOOK_SECRET` matches between Vercel env and the script

### Webhook Returning Errors

1. Check the Vercel function logs for error details
2. Ensure all dependencies are properly installed
3. Verify the database/Redis connections work

### Switching Back to Polling Mode

If you want to run locally again with polling:

```bash
# Remove the webhook
bun run webhook:delete

# Start local development
bun run dev
```

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `BOT_TOKEN` | Yes | Telegram bot token |
| `WEBHOOK_SECRET` | Recommended | Secret for webhook verification |
| `REDIS_URL` | For sessions/scheduler | Redis connection URL |
| `CRON_SECRET` | For cron jobs | Secret for cron endpoint auth |

## Resources

- [Elysia Documentation](https://elysiajs.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Telegram Bot API - Webhooks](https://core.telegram.org/bots/webhooks)
- [GramIO Documentation](https://gramio.dev/)