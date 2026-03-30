# syntax=docker/dockerfile:1

# ────────────────────────────────────────────
# Stage 1 – base: shared Alpine + Node 25
# ────────────────────────────────────────────
FROM node:25-alpine AS base
# better-sqlite3 requires libc-compatible runtime
RUN apk add --no-cache libc6-compat

# ────────────────────────────────────────────
# Stage 2 – deps: install ALL deps (dev+prod)
#           Compiles native modules (better-sqlite3)
# ────────────────────────────────────────────
FROM base AS deps
# Native build tools needed for better-sqlite3
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ────────────────────────────────────────────
# Stage 3 – builder: compile the app
# ────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

# ────────────────────────────────────────────
# Stage 4 – prod-deps: production-only deps
#           Re-compiles native modules for the
#           final slim image (no dev bloat)
# ────────────────────────────────────────────
FROM base AS prod-deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ────────────────────────────────────────────
# Stage 5 – runner: final image
# ────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nodeuser

# Nitro build output (server bundle + public assets)
COPY --from=builder    --chown=nodeuser:nodejs /app/.output      ./.output

# Production node_modules (native .node bindings for better-sqlite3)
COPY --from=prod-deps  --chown=nodeuser:nodejs /app/node_modules ./node_modules

# SQLite database directory – mount a volume here in production
RUN mkdir -p /app/data && chown nodeuser:nodejs /app/data

USER nodeuser

ENV NODE_ENV=production
ENV PORT=3000
# Point better-auth / drizzle at the mounted DB volume
ENV DATABASE_URL=/app/data/app.db

EXPOSE 3000

# TanStack Start / Nitro server entry
CMD ["node", ".output/server/index.mjs"]
