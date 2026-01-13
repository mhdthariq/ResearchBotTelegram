# Changelog

All notable changes to Research Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-20

### Added

- **Multi-Language Support (i18n)**
  - `/language` command for changing bot language
  - 10 fully translated languages:
    - 🇺🇸 English (en)
    - 🇪🇸 Español (es)
    - 🇨🇳 中文 (zh)
    - 🇷🇺 Русский (ru)
    - 🇵🇹 Português (pt)
    - 🇫🇷 Français (fr)
    - 🇩🇪 Deutsch (de)
    - 🇯🇵 日本語 (ja)
    - 🇸🇦 العربية (ar)
    - 🇮🇩 Bahasa Indonesia (id)
  - Language preference persisted per user
  - Automatic language detection from Telegram settings
  - Fallback to English for unsupported languages

- **Search Features**
  - `/search` command for searching arXiv papers
  - `/author` command for searching by author name
  - `/categories` command for browsing by arXiv category
  - `/similar` command for finding related papers
  - Pagination support with "Load More" buttons
  - Advanced search with filters (title, abstract, category)

- **Bookmark System**
  - `/bookmarks` command to view saved papers
  - Add/remove bookmark functionality
  - Paginated bookmark list
  - `/export` command for BibTeX export
  - Notes support for bookmarks

- **Search History**
  - `/history` command to view recent searches
  - Quick re-search from history
  - Clear history option
  - Personal statistics with `/stats`

- **Subscription System**
  - `/subscribe` command for topic subscriptions
  - `/subscriptions` command to manage subscriptions
  - `/unsubscribe` command to remove subscriptions
  - Configurable notification intervals (12h, 24h, 48h, 7d)
  - Category filters for subscriptions

- **Inline Query Support**
  - Search papers from any chat using `@BotUsername query`
  - Rich inline results with paper details
  - Cached results for performance

- **Admin Features**
  - `/admin` command for admin help
  - `/admin_stats` for bot-wide statistics
  - Admin action logging

- **Infrastructure**
  - Webhook mode with Elysia server
  - Polling mode for development
  - Vercel serverless deployment support
  - Docker support with Alpine-based images
  - Multi-architecture builds (AMD64, ARM64)
  - SQLite database with Drizzle ORM
  - Redis caching support (optional)
  - Health check endpoints
  - Structured logging
  - CI/CD pipeline with GitHub Actions
  - Automated releases with Docker image publishing

- **arXiv API Integration**
  - Rate limiting (3 second intervals)
  - Automatic retry with exponential backoff
  - Request timeouts
  - Result caching
  - Multiple sort options (relevance, date)

- **Error Handling**
  - Custom error types (ArxivApiError, RateLimitError, ValidationError)
  - User-friendly error messages in all supported languages
  - Graceful degradation

- **Rate Limiting**
  - Per-user rate limits
  - arXiv API rate limiting
  - Informative rate limit messages

- **Documentation**
  - Comprehensive API documentation
  - Contributing guide
  - Test suite for utilities, arXiv API, and bot functionality

### Security

- Webhook secret token verification
- Input sanitization for search queries
- Environment variable validation
- Admin command access control
- Non-root user in Docker container

---

## Docker Image

Pull from GitHub Container Registry:

```bash
docker pull ghcr.io/mhdthariq/researchbottelegram:1.0.0
```

Or use docker-compose:

```bash
docker-compose up -d
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BOT_TOKEN` | Yes | Telegram Bot API token |
| `DATABASE_URL` | Yes | Database connection string |
| `DATABASE_AUTH_TOKEN` | No | For remote Turso databases |
| `ADMIN_IDS` | No | Comma-separated admin chat IDs |
| `REDIS_URL` | No | Redis connection for caching |
| `WEBHOOK_URL` | No | Webhook URL for production |
| `WEBHOOK_SECRET` | No | Webhook secret token |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to contribute to this project.