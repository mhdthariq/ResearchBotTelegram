# Changelog

All notable changes to Research Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Multi-language support infrastructure (i18n)
- Comprehensive test suite for utilities, arXiv API, and bot functionality
- CI/CD pipeline with GitHub Actions
- API documentation
- Contributing guide

## [1.0.0] - 2024-01-15

### Added
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
  - SQLite database with Drizzle ORM
  - Redis caching support (optional)
  - Health check endpoints
  - Structured logging

- **arXiv API Integration**
  - Rate limiting (3 second intervals)
  - Automatic retry with exponential backoff
  - Request timeouts
  - Result caching
  - Multiple sort options (relevance, date)

- **Error Handling**
  - Custom error types (ArxivApiError, RateLimitError, ValidationError)
  - User-friendly error messages
  - Graceful degradation

- **Rate Limiting**
  - Per-user rate limits
  - arXiv API rate limiting
  - Informative rate limit messages

### Security
- Webhook secret token verification
- Input sanitization for search queries
- Environment variable validation
- Admin command access control

## [0.1.0] - 2024-01-01

### Added
- Initial bot setup with GramIO framework
- Basic `/start` and `/help` commands
- Simple paper search functionality
- Inline keyboard navigation

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2024-01-15 | Full feature release with bookmarks, subscriptions, and admin tools |
| 0.1.0 | 2024-01-01 | Initial release with basic search |

## Upgrade Notes

### Upgrading to 1.0.0

1. **Database Migration Required**
   ```bash
   bun run db:migrate
   ```

2. **New Environment Variables**
   - `DATABASE_URL` - Database connection string
   - `DATABASE_AUTH_TOKEN` - For remote Turso databases
   - `ADMIN_IDS` - Comma-separated admin chat IDs (optional)

3. **Redis Recommended**
   For production deployments, configure `REDIS_URL` for session persistence and caching.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to contribute to this project.