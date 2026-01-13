# use the official Bun Alpine image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.5-alpine AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ gcc musl-dev

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease

# Install build dependencies for type checking
RUN apk add --no-cache python3 make g++ gcc musl-dev

COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun x tsc --noEmit

# copy production dependencies and source code into final image
FROM base AS release

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache libstdc++

COPY --from=install /temp/prod/node_modules node_modules
RUN mkdir -p /usr/src/app/src
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/tsconfig.json .

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/src/app

USER appuser

# Health check (using wget since curl is not in alpine by default)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Expose port for webhook server
EXPOSE 3000

# Default to webhook mode for production
ENTRYPOINT [ "bun", "run", "start:webhook" ]
