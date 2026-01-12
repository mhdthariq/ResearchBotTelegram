# Research Bot API Documentation

This document provides comprehensive documentation for the Research Bot Telegram Bot API, including all commands, callback handlers, and features.

## Table of Contents

- [Commands](#commands)
  - [Basic Commands](#basic-commands)
  - [Search Commands](#search-commands)
  - [Bookmark Commands](#bookmark-commands)
  - [Subscription Commands](#subscription-commands)
  - [Admin Commands](#admin-commands)
- [Callback Queries](#callback-queries)
- [Inline Queries](#inline-queries)
- [Session Data](#session-data)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Commands

### Basic Commands

#### `/start`

Initializes the bot for a new user and displays a welcome message with available commands.

**Usage:** `/start`

**Response:** Welcome message with inline keyboard showing main actions.

**Side Effects:**
- Creates or updates user record in database
- Initializes session data

---

#### `/help`

Displays a comprehensive list of all available commands and their usage.

**Usage:** `/help`

**Response:** Formatted message listing all commands with descriptions.

---

#### `/stats`

Shows user's personal statistics including search history and bookmark counts.

**Usage:** `/stats`

**Response:**
```
📊 Your Statistics

🔍 Searches: {totalSearches}
📚 Unique Queries: {uniqueQueries}
🔖 Bookmarks: {bookmarkCount}
```

---

### Search Commands

#### `/search [topic]`

Search for research papers on arXiv by topic.

**Usage:**
- `/search machine learning` - Direct search with topic
- `/search` - Interactive prompt for topic

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| topic | string | No | Search query (prompts if not provided) |

**Response:** Formatted list of papers with pagination controls.

**Rate Limit:** 10 requests per minute

---

#### `/more`

Load more results for the current search query.

**Usage:** `/more`

**Prerequisites:** Must have an active search session.

**Response:** Next page of search results.

---

#### `/author <name>`

Search for papers by a specific author.

**Usage:** `/author Yoshua Bengio`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Author name to search |

**Rate Limit:** 5 requests per minute

---

#### `/categories`

Browse papers by arXiv category.

**Usage:** `/categories`

**Response:** Inline keyboard with popular arXiv categories:
- cs.AI - Artificial Intelligence
- cs.CL - Computation and Language (NLP)
- cs.CV - Computer Vision
- cs.LG - Machine Learning
- cs.NE - Neural and Evolutionary Computing
- cs.RO - Robotics
- stat.ML - Machine Learning (Statistics)
- And more...

---

#### `/similar <arxiv_id>`

Find papers similar to a specific paper.

**Usage:** `/similar 2301.00001`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| arxiv_id | string | Yes | arXiv paper ID |

**Algorithm:** Extracts keywords from the target paper's title and abstract, then searches for related papers in the same category.

---

### Bookmark Commands

#### `/bookmarks`

View your saved papers.

**Usage:** `/bookmarks`

**Response:** Paginated list of bookmarked papers with management options.

**Inline Keyboard Options:**
- Navigate pages (Previous/Next)
- View paper details
- Remove bookmark
- Export bookmarks

---

#### `/history`

View your recent search history.

**Usage:** `/history`

**Response:** List of recent searches with quick re-search buttons.

**Options:**
- Re-run previous searches
- Clear history

---

#### `/export`

Export all bookmarks in BibTeX format.

**Usage:** `/export`

**Response:** BibTeX formatted text of all bookmarked papers, suitable for LaTeX documents.

**Example Output:**
```bibtex
@article{arxiv:2301_00001,
  title = {Paper Title},
  author = {Author One and Author Two},
  year = {2023},
  eprint = {2301.00001},
  archivePrefix = {arXiv},
  primaryClass = {cs.AI}
}
```

---

### Subscription Commands

#### `/subscribe <topic>`

Subscribe to periodic updates on a research topic.

**Usage:**
- `/subscribe machine learning`
- `/subscribe [cs.AI] neural networks` (with category filter)

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| topic | string | Yes | Topic to subscribe to |
| [category] | string | No | Optional arXiv category filter |

**Default Interval:** 24 hours

---

#### `/subscriptions`

View and manage your topic subscriptions.

**Usage:** `/subscriptions`

**Response:** List of active subscriptions with management options.

**Inline Keyboard Options:**
- Manage subscription
- Change notification interval
- Unsubscribe

---

#### `/unsubscribe`

Remove a subscription.

**Usage:** `/unsubscribe`

**Response:** Interactive selection of subscriptions to remove.

---

### Admin Commands

> **Note:** Admin commands are only available to users with chat IDs listed in the `ADMIN_IDS` environment variable.

#### `/admin`

Show admin help and available admin commands.

**Usage:** `/admin`

---

#### `/admin_stats`

View bot-wide statistics.

**Usage:** `/admin_stats`

**Response:**
```
📊 Bot Statistics

👥 Total Users: {count}
📬 Active Subscriptions: {count}
```

---

## Callback Queries

Callback queries handle button interactions in inline keyboards.

### Search Callbacks

| Callback Data | Description |
|--------------|-------------|
| `search` | Start a new search |
| `next:{topic}:{offset}` | Load next page of results |
| `prev:{topic}:{offset}` | Load previous page of results |
| `detail:{arxiv_id}` | Show paper details |

### Bookmark Callbacks

| Callback Data | Description |
|--------------|-------------|
| `bookmark:{arxiv_id}` | Add paper to bookmarks |
| `unbookmark:{arxiv_id}` | Remove paper from bookmarks |
| `bm_page:{page}` | Navigate bookmark pages |

### History Callbacks

| Callback Data | Description |
|--------------|-------------|
| `history_page:{page}` | Navigate history pages |
| `search_again:{query}` | Re-run a previous search |
| `clear_history` | Clear search history |

### Subscription Callbacks

| Callback Data | Description |
|--------------|-------------|
| `sub_manage:{id}` | Manage specific subscription |
| `sub_delete:{id}` | Delete subscription |
| `sub_interval:{id}` | Change subscription interval |
| `sub_set_interval:{id}:{hours}` | Set specific interval |

### Category Callbacks

| Callback Data | Description |
|--------------|-------------|
| `cat:{category}` | Search papers in category |

### Paper Actions

| Callback Data | Description |
|--------------|-------------|
| `bibtex:{arxiv_id}` | Get BibTeX citation |
| `pdf:{arxiv_id}` | Get PDF link |
| `similar:{arxiv_id}` | Find similar papers |

---

## Inline Queries

The bot supports inline queries for searching papers from any chat.

### Usage

Type `@YourBotUsername <search query>` in any chat.

### Example

```
@ResearchBot machine learning
```

### Response

Returns up to 10 article results with:
- Paper title
- Authors (first 3)
- Short summary
- Link to arXiv page

### Caching

Inline query results are cached for 300 seconds (5 minutes) per user.

---

## Session Data

The bot maintains session data per user for state management.

### Session Interface

```typescript
interface SessionData {
  lastTopic?: string;      // Last search topic
  lastOffset?: number;     // Current pagination offset
  resultsPerPage?: number; // User's preferred results per page
}
```

### Storage

- **Development:** In-memory storage
- **Production:** Redis (when `REDIS_URL` is configured)

### TTL

Session data expires after 24 hours of inactivity.

---

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| chatId | INTEGER | Telegram chat ID (unique) |
| username | TEXT | Telegram username |
| firstName | TEXT | User's first name |
| lastName | TEXT | User's last name |
| resultsPerPage | INTEGER | Preferred results count (default: 5) |
| preferredCategories | TEXT | JSON array of preferred categories |
| createdAt | TEXT | Account creation timestamp |
| lastActiveAt | TEXT | Last activity timestamp |

### Search History Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| userId | INTEGER | Foreign key to users |
| query | TEXT | Search query |
| resultsCount | INTEGER | Number of results found |
| createdAt | TEXT | Search timestamp |

### Bookmarks Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| userId | INTEGER | Foreign key to users |
| arxivId | TEXT | arXiv paper ID |
| title | TEXT | Paper title |
| authors | TEXT | JSON array of authors |
| summary | TEXT | Paper abstract |
| link | TEXT | arXiv URL |
| categories | TEXT | JSON array of categories |
| publishedDate | TEXT | Publication date |
| notes | TEXT | User notes |
| createdAt | TEXT | Bookmark timestamp |

**Constraints:** Unique index on (userId, arxivId)

### Subscriptions Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| userId | INTEGER | Foreign key to users |
| topic | TEXT | Subscription topic |
| category | TEXT | Optional category filter |
| intervalHours | INTEGER | Notification interval (default: 24) |
| lastRunAt | TEXT | Last notification timestamp |
| isActive | BOOLEAN | Subscription status |
| createdAt | TEXT | Subscription creation timestamp |

### Analytics Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| eventType | TEXT | Event type (search, view, bookmark, etc.) |
| userId | INTEGER | Foreign key to users |
| metadata | TEXT | JSON event details |
| createdAt | TEXT | Event timestamp |

---

## Error Handling

### User-Facing Error Messages

| Error Type | Message |
|------------|---------|
| No Results | 🔍 No papers found. Try different keywords or check your spelling. |
| API Error | ❌ Error fetching papers. Please try again later. |
| Rate Limited | ⏳ Too many requests. Please wait {seconds} seconds. |
| Invalid Command | ❓ Unknown command. Use /help for available commands. |

### Error Classes

```typescript
class ArxivApiError extends Error {
  statusCode?: number;
  cause?: Error;
}

class RateLimitError extends Error {
  resetTime: number;
}

class ValidationError extends Error {
  field: string;
}
```

---

## Rate Limiting

### Per-User Limits

| Endpoint | Max Requests | Window |
|----------|-------------|--------|
| /search | 10 | 60 seconds |
| /author | 5 | 60 seconds |
| /similar | 5 | 60 seconds |
| /subscribe | 5 | 60 seconds |
| /more | 10 | 60 seconds |

### arXiv API Rate Limiting

The bot implements rate limiting for arXiv API calls:
- Minimum 3 seconds between requests
- Automatic retry with exponential backoff
- Request queuing for burst protection

### Response Headers

When rate limited, users receive:
```
⏳ Too many requests. Please wait before trying again.
Reset in: {seconds} seconds
```

---

## Webhook Endpoints

### `POST /webhook`

Receives Telegram updates.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| x-telegram-bot-api-secret-token | If configured | Webhook secret for verification |

**Response:** `{ ok: true }`

### `GET /health`

Simple health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `GET /health/detailed`

Detailed health check with dependency status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "checks": {
    "bot": "ok",
    "redis": "ok"
  },
  "uptime": 3600,
  "memory": {
    "heapUsed": 50,
    "heapTotal": 100,
    "rss": 150
  }
}
```

### `GET /ready`

Readiness probe for Kubernetes/Docker.

**Response:** `{ ready: true }` or `503` if not ready.

### `GET /live`

Liveness probe.

**Response:** `{ alive: true, timestamp: "..." }`

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| BOT_TOKEN | Yes | - | Telegram bot token |
| WEBHOOK_SECRET | No | - | Secret for webhook verification |
| DATABASE_URL | No | file:./sqlite.db | Database connection URL |
| DATABASE_AUTH_TOKEN | No* | - | Auth token for Turso DB (*required for remote DB) |
| REDIS_URL | No | - | Redis URL for caching/sessions |
| PORT | No | 3000 | Server port |
| NODE_ENV | No | development | Environment mode |
| LOG_LEVEL | No | info | Logging level (debug/info/warn/error) |
| ADMIN_IDS | No | - | Comma-separated admin chat IDs |