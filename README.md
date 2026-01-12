# Research Bot

AI Research Assistant Telegram Bot - Search and discover the latest research papers from arXiv.

[![CI](https://github.com/YOUR_USERNAME/research-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/research-bot/actions/workflows/ci.yml)

## Features

- 🔍 **Search Papers** - Search arXiv for research papers by topic, author, or category
- 📚 **Bookmarks** - Save papers for later reading with BibTeX export
- 📜 **Search History** - Track and replay your previous searches
- 📬 **Subscriptions** - Get periodic updates on topics you care about
- 🔗 **Similar Papers** - Discover related research based on a paper
- 🌐 **Inline Queries** - Search papers from any chat using `@BotUsername query`
- 📊 **Statistics** - View your personal usage statistics

## Documentation

📚 See the [docs folder](./docs/) for detailed guides:

- [API Documentation](./docs/API.md) - Complete bot commands and features reference
- [Webhook Deployment Guide](./docs/vercel-deployment.md) - Deploy with webhooks (Elysia or Vercel)
- [Improvements Roadmap](./docs/IMPROVEMENTS.md) - Future features and improvements

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.2 or higher
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/research-bot.git
cd research-bot

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your BOT_TOKEN

# Run database migrations
bun run db:migrate

# Start the bot (development)
bun dev
```

## Stack

| Component | Technology |
|-----------|------------|
| Runtime | [Bun](https://bun.sh) |
| Bot Framework | [GramIO](https://gramio.dev/) |
| Database | SQLite / [Turso](https://turso.tech/) (LibSQL) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Web Server | [Elysia](https://elysiajs.com/) |
| Linter | [Biome](https://biomejs.dev/) |
| Testing | Bun Test |
| CI/CD | GitHub Actions |

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start bot in polling mode with hot reload |
| `bun run dev:webhook` | Start webhook server with hot reload |
| `bun run start` | Start bot in production (polling) |
| `bun run start:webhook` | Start webhook server in production |
| `bun test` | Run tests |
| `bun test --watch` | Run tests in watch mode |
| `bun test --coverage` | Run tests with coverage |
| `bun run lint` | Check code with Biome |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run typecheck` | Type check with TypeScript |
| `bun run db:migrate` | Run database migrations |
| `bun run db:generate` | Generate new migrations |
| `bun run db:studio` | Open Drizzle Studio |

### Testing

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/arxiv.test.ts

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

### Code Quality

```bash
# Lint and type check
bun run lint
bun run typecheck

# Auto-fix issues
bun run lint:fix
```

## Deployment

### Webhook Mode (Recommended for Production)

Start the Elysia webhook server:

```bash
bun run start:webhook
```

The server exposes the following endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /` | Status check |
| `POST /webhook` | Telegram webhook |
| `GET /health` | Simple health check |
| `GET /health/detailed` | Detailed health with dependencies |
| `GET /metrics` | Application metrics (JSON) |
| `GET /metrics/prometheus` | Prometheus-format metrics |
| `GET /ready` | Readiness probe |
| `GET /live` | Liveness probe |

### Vercel (Serverless)

1. Deploy to Vercel via Dashboard or CLI
2. Set environment variables
3. Configure webhook:

```bash
bun run webhook:set https://your-app.vercel.app/api/webhook
```

### Docker

```bash
docker build -t research-bot .
docker run -e BOT_TOKEN=your_token research-bot
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BOT_TOKEN` | Yes | - | Telegram bot token |
| `WEBHOOK_SECRET` | No | - | Secret for webhook verification |
| `DATABASE_URL` | No | `file:./sqlite.db` | Database connection URL |
| `DATABASE_AUTH_TOKEN` | No* | - | Auth token for Turso (*required for remote) |
| `REDIS_URL` | No | - | Redis URL for caching/sessions |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `LOG_LEVEL` | No | `info` | Logging level |
| `ADMIN_IDS` | No | - | Comma-separated admin chat IDs |

## Project Structure

```
research-bot/
├── .github/workflows/   # CI/CD pipelines
├── api/                 # Vercel serverless functions
├── docs/                # Documentation
├── scripts/             # Utility scripts
├── src/
│   ├── bot/             # Bot commands and handlers
│   ├── cache/           # Caching layer
│   ├── db/              # Database schema and repositories
│   ├── features/        # Feature modules
│   ├── i18n/            # Internationalization
│   ├── middleware/      # Bot middleware
│   ├── storage/         # Storage adapters
│   ├── utils/           # Utilities (logger, metrics, etc.)
│   ├── arxiv.ts         # arXiv API client
│   ├── config.ts        # Configuration
│   ├── index.ts         # Polling entry point
│   └── webhook.ts       # Webhook entry point
└── tests/               # Test files
```

## Monitoring

### Health Checks

```bash
# Simple health check
curl http://localhost:3000/health

# Detailed health with dependencies
curl http://localhost:3000/health/detailed
```

### Metrics

```bash
# JSON metrics
curl http://localhost:3000/metrics

# Prometheus format
curl http://localhost:3000/metrics/prometheus
```

## CI/CD

The project uses GitHub Actions for continuous integration:

- **Lint** - Code style checks with Biome
- **Type Check** - TypeScript type verification
- **Test** - Run test suite
- **Build** - Docker image build verification

See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) for the full pipeline.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a list of changes and version history.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [arXiv](https://arxiv.org/) for providing the research paper API
- [GramIO](https://gramio.dev/) for the excellent Telegram bot framework
- All contributors and users of this bot