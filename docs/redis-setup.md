# Redis Setup Guide

This guide explains how to set up Redis for the Research Bot's job scheduling system (powered by `jobify` and BullMQ).

## Table of Contents

- [Overview](#overview)
- [Option 1: Docker (Recommended for Development)](#option-1-docker-recommended-for-development)
- [Option 2: Docker Compose](#option-2-docker-compose)
- [Option 3: Local Installation](#option-3-local-installation)
- [Option 4: Cloud Hosted Redis](#option-4-cloud-hosted-redis)
- [Connecting to the Project](#connecting-to-the-project)
- [Verifying the Connection](#verifying-the-connection)
- [Troubleshooting](#troubleshooting)

## Overview

Redis is required for the job scheduler to manage background tasks like sending periodic subscription updates. The bot uses the `jobify` library which is built on top of BullMQ, a Redis-based queue system.

## Option 1: Docker (Recommended for Development)

The quickest way to get Redis running locally:

```bash
# Pull and run Redis container
docker run -d \
  --name research-bot-redis \
  -p 6379:6379 \
  redis:alpine

# Verify it's running
docker ps | grep redis
```

To stop and remove:

```bash
docker stop research-bot-redis
docker rm research-bot-redis
```

### With Password Authentication

```bash
docker run -d \
  --name research-bot-redis \
  -p 6379:6379 \
  redis:alpine \
  redis-server --requirepass your_secure_password
```

## Option 2: Docker Compose

Create a `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  redis:
    image: redis:alpine
    container_name: research-bot-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  # Optional: Redis Commander (Web UI for Redis)
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: redis-commander
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8081:8081"
    depends_on:
      - redis

volumes:
  redis_data:
```

Run with:

```bash
docker-compose up -d
```

## Option 3: Local Installation

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### macOS (Homebrew)

```bash
brew install redis
brew services start redis
```

### Windows

Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases) or use WSL2 with the Ubuntu instructions above.

## Option 4: Cloud Hosted Redis

### Upstash (Recommended for Production - Free Tier Available)

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Select your region (choose closest to your bot's server)
4. After creating the database, go to the database details page
5. Look for the **"Connect to your database"** section
6. Click on the **`ioredis`** tab
7. Copy the `REDIS_URL` connection string:

```bash
REDIS_URL="rediss://default:your_password@your-database-name.upstash.io:6379"
```

> **Note:** The URL starts with `rediss://` (with double 's') which indicates TLS/SSL is enabled.

### Redis Cloud (by Redis Labs)

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account and database
3. Get connection details from the dashboard

### Railway

1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Add Redis from the "New" menu
4. Get connection URL from the service settings

### Render

1. Go to [Render](https://render.com/)
2. Create a new Redis instance
3. Copy the connection details

## Connecting to the Project

### Environment Variables

Create or update your `.env` file in the project root:

#### Option 1: Using REDIS_URL (Recommended for Cloud/Upstash)

```bash
# Bot Token
BOT_TOKEN=your_telegram_bot_token

# Redis Configuration - Single URL (works with Upstash, Redis Cloud, etc.)
REDIS_URL="rediss://default:your_password@your-host.upstash.io:6379"
```

#### Option 2: Using Host/Port (For Local/Docker)

```bash
# Bot Token
BOT_TOKEN=your_telegram_bot_token

# Redis Configuration - Separate values
REDIS_HOST=localhost
REDIS_PORT=6379
```

### How It Works

The project automatically detects which configuration to use:

```typescript
const createJob = initJobify(
  process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
);
```

- If `REDIS_URL` is set → Uses the connection URL (includes TLS, password, everything)
- If `REDIS_URL` is not set → Falls back to `REDIS_HOST` and `REDIS_PORT`

This makes it simple:
- **Local/Docker development**: No env vars needed (defaults to localhost:6379)
- **Production with Upstash**: Just set `REDIS_URL` from the Upstash console

## Verifying the Connection

### Using redis-cli

```bash
# Local Redis
redis-cli ping
# Should return: PONG

# With password
redis-cli -a your_password ping

# Remote Redis
redis-cli -h your-host.com -p 6379 -a your_password ping
```

### Using the Bot

Start the bot and check the logs:

```bash
bun run dev
```

If Redis is connected properly, the bot should start without connection errors.

## Troubleshooting

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:** Redis is not running. Start it with:
- Docker: `docker start research-bot-redis`
- Local: `sudo systemctl start redis-server` or `brew services start redis`

### Authentication Error

```
Error: NOAUTH Authentication required
```

**Solution:** Add the password to your environment variables and update the connection code.

### Timeout Issues with Cloud Redis

```
Error: Connection timeout
```

**Solutions:**
1. Check if TLS is required and configure it
2. Verify the host and port are correct
3. Check firewall rules on your server

### Memory Issues

For production, consider setting `maxmemory` policy:

```bash
# In redis.conf or via command
redis-cli CONFIG SET maxmemory 100mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## Security Best Practices

1. **Never expose Redis to the public internet** without authentication
2. **Use strong passwords** for production Redis instances
3. **Enable TLS** when connecting over the internet
4. **Use environment variables** for sensitive configuration
5. **Regularly backup** Redis data for production use

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Upstash Documentation](https://docs.upstash.com/)
- [Docker Hub - Redis](https://hub.docker.com/_/redis)