# Contributing to Research Bot

Thank you for your interest in contributing to Research Bot! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/research-bot.git
   cd research-bot
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/research-bot.git
   ```

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.2 or higher
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- (Optional) Redis for caching
- (Optional) Turso/LibSQL for production database

### Installation

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   BOT_TOKEN=your_telegram_bot_token
   NODE_ENV=development
   DATABASE_URL=file:./sqlite.db
   # Optional:
   # REDIS_URL=redis://localhost:6379
   # WEBHOOK_SECRET=your_secret
   ```

3. **Run database migrations**:
   ```bash
   bun run db:migrate
   ```

4. **Start the development server**:
   ```bash
   # Polling mode (recommended for development)
   bun dev
   
   # Webhook mode
   bun run dev:webhook
   ```

### Development Commands

| Command | Description |
|---------|-------------|
| `bun dev` | Start bot in polling mode with hot reload |
| `bun run dev:webhook` | Start webhook server with hot reload |
| `bun run lint` | Check code with Biome linter |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun test` | Run tests |
| `bun test --watch` | Run tests in watch mode |
| `bun x tsc --noEmit` | Type check without emitting |
| `bun run db:generate` | Generate database migrations |
| `bun run db:migrate` | Apply database migrations |
| `bun run db:studio` | Open Drizzle Studio |

## Project Structure

```
research-bot/
├── src/
│   ├── bot/              # Bot commands and handlers
│   │   └── index.ts      # Main bot configuration
│   ├── cache/            # Caching layer (Redis)
│   ├── db/               # Database schema and repositories
│   │   ├── repositories/ # Data access layer
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   └── migrate.ts    # Migration runner
│   ├── features/         # Feature modules
│   ├── middleware/       # Bot middleware
│   ├── storage/          # Storage adapters
│   ├── utils/            # Utility functions
│   ├── arxiv.ts          # arXiv API client
│   ├── config.ts         # Configuration management
│   ├── errors.ts         # Custom error types
│   ├── index.ts          # Polling mode entry point
│   └── webhook.ts        # Webhook mode entry point
├── tests/                # Test files
├── docs/                 # Documentation
├── api/                  # Vercel serverless functions
└── scripts/              # Utility scripts
```

## Coding Standards

### Style Guide

We use [Biome](https://biomejs.dev/) for linting and formatting. Run `bun run lint:fix` before committing.

Key conventions:
- Use TypeScript for all code
- Use `const` by default, `let` when reassignment is needed
- Prefer async/await over callbacks
- Use meaningful variable and function names
- Add JSDoc comments for public functions

### TypeScript

- Enable strict mode
- Avoid `any` - use `unknown` if type is truly unknown
- Define interfaces for all data structures
- Export types alongside functions

### File Naming

- Use camelCase for files: `userRepository.ts`
- Use PascalCase for classes and interfaces
- Test files should match source files: `arxiv.test.ts`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(search): add author search command
fix(bookmarks): prevent duplicate bookmarks
docs: update README with new features
test(arxiv): add tests for rate limiting
```

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/arxiv.test.ts

# Run tests in watch mode
bun test --watch

# Run with coverage
bun test --coverage
```

### Writing Tests

- Place tests in the `tests/` directory
- Name test files with `.test.ts` suffix
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

Example:
```typescript
import { describe, expect, it } from "bun:test";
import { formatSummary } from "../src/arxiv";

describe("formatSummary", () => {
  it("should truncate long summaries with ellipsis", () => {
    // Arrange
    const longSummary = "A".repeat(300);
    
    // Act
    const result = formatSummary(longSummary, 200);
    
    // Assert
    expect(result.length).toBe(203);
    expect(result.endsWith("...")).toBe(true);
  });
});
```

### Test Categories

1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test full user flows (if applicable)

## Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** and commit following the commit message guidelines

3. **Ensure quality**:
   ```bash
   # Run linter
   bun run lint
   
   # Run type check
   bun x tsc --noEmit
   
   # Run tests
   bun test
   ```

4. **Push your branch**:
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to any related issues
   - Screenshots for UI changes (if applicable)

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated for changes
- [ ] Documentation updated if needed
- [ ] All CI checks pass
- [ ] PR description is complete

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Bun version, etc.)
- Relevant logs or screenshots

### Feature Requests

Include:
- Clear description of the feature
- Use case / motivation
- Proposed implementation (if any)
- Any alternatives considered

## Questions?

If you have questions, feel free to:
- Open a GitHub Discussion
- Open an issue with the `question` label

Thank you for contributing! 🎉