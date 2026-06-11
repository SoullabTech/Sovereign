# ════════════════════════════════════════════════════════════════════════
# MAIA Sovereign Dockerfile (Portable / Multi-Arch Safe)
# - No Alpine / musl coupling
# - No PRISMA_* arch pinning
# - Stages kept as: base → deps → builder → runner (matches your compose)
# ════════════════════════════════════════════════════════════════════════

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- deps: install full deps (build tooling lives in devDependencies) ---
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts --legacy-peer-deps

# --- builder: prisma generate + next build (creates .next/standalone) ---
FROM base AS builder
ARG GIT_COMMIT=unknown
ARG SKIP_AETHERIC_CHECK=0
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true
ENV SKIP_AETHERIC_CHECK=${SKIP_AETHERIC_CHECK}
# Build-time placeholders for Next.js static generation
ENV OPENAI_API_KEY=dummy-build-key
ENV ANTHROPIC_API_KEY=dummy-build-key
ENV MAIA_AUDIT_FINGERPRINT_SECRET=build-placeholder
# Feature flags (NEXT_PUBLIC_* must be set at build time for Next.js inlining)
ARG NEXT_PUBLIC_ENABLE_EXPLAINER_SCRIPTS=true
ENV NEXT_PUBLIC_ENABLE_EXPLAINER_SCRIPTS=${NEXT_PUBLIC_ENABLE_EXPLAINER_SCRIPTS}

# Install psql for SQL migrations (used by migrate service)
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma client + engines for THIS build platform (no arch pinning)
RUN npx prisma generate

# Next build (standalone output) — increase heap to avoid OOM on large codebase
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# --- runner: minimal runtime with standalone server ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Re-declare ARGs in runner stage (ARGs don't cross stages)
ARG GIT_COMMIT=unknown
ARG APP_VERSION=1.0.0
ARG BUILD_DATE=unknown

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV GIT_COMMIT=${GIT_COMMIT}
ENV APP_VERSION=${APP_VERSION}
ENV BUILD_DATE=${BUILD_DATE}

# Install psql for migrations + curl for worker preflight health checks + ffmpeg for media processing
# + pandoc and chromium for the Book Studio print render (markdown → PDF via Paged.js)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client curl ffmpeg pandoc chromium fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the system Chromium instead of downloading its own
# (npm ci runs with --ignore-scripts in deps stage, so no download anyway).
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy standalone output + static assets
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Safety belt: ensure Prisma engines are present at runtime
# (Next standalone tracing sometimes misses .prisma/@prisma in edge cases)
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma

# Migrations for Render preDeployCommand
COPY --from=builder --chown=node:node /app/database ./database
COPY --from=builder --chown=node:node /app/prisma ./prisma

# Scripts for workers (summary, comms, embedding)
COPY --from=builder --chown=node:node /app/scripts ./scripts
RUN chmod +x ./scripts/entrypoint.sh ./scripts/ensure-migrations.sh

# Full node_modules for worker scripts (tsx, Anthropic SDK, pg, etc.)
# Workers run via `npx tsx` and need the full dependency tree.
# Next.js standalone bundles its own deps, so this doesn't conflict.
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Lib dependencies for worker scripts
COPY --from=builder --chown=node:node /app/lib ./lib
COPY --from=builder --chown=node:node /app/tsconfig.json ./tsconfig.json

# Create media storage directory owned by node (volume mounts inherit this)
RUN mkdir -p /app/data/media && chown -R node:node /app/data/media

# Create vault storage directory with world-writable permissions.
# 0777 (not chown node) because userns-remapped Docker maps the container's uid=1000
# to a DIFFERENT host uid than 1000, so ownership is unpredictable across hosts.
# world-writable ensures any UID mapping can write. This also seeds the permissions
# for NEW named volumes (Docker copies image dir perms on first mount).
RUN mkdir -p /app/data/vault && chmod 0777 /app/data/vault

USER node
EXPOSE 3000

# NOTE: No HEALTHCHECK in Dockerfile - use service-specific healthchecks in docker-compose.yml
# This prevents confusion when the same image is used for web (maia) vs worker (maia-embed-worker)

CMD ["node", "server.js"]
