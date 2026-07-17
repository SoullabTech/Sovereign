# ════════════════════════════════════════════════════════════════════════
# MAIA Sovereign Dockerfile (Portable / Multi-Arch Safe)
# - No Alpine / musl coupling
# - No PRISMA_* arch pinning
# - Stages kept as: base → deps → builder → runner (matches your compose)
# ════════════════════════════════════════════════════════════════════════

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ── Deploy-lane tripwire ──────────────────────────────────────────────────────
# On 2026-07-10 a raw `docker compose ... up -d --build maia` bypassed the
# deploy-lane lock, rollback tagging, and the pre-deploy gate — and succeeded
# quietly. A path around a gate that succeeds quietly will be taken again, so
# "deprecated" is now a behavior: this build REFUSES to proceed unless the
# deploy lane vouches for it. The token is exported by acquire_deploy_lock()
# (scripts/deploy-lock.sh) and forwarded by the compose files; each non-prod
# compose file declares its own lane in its build args. The value is constant
# by design (a per-deploy nonce would bust the layer cache every deploy); this
# is a tripwire against the QUIET bypass, not a forgery-proof credential.
# See docs/ops/DEPLOY_LANE_TOKEN.md.
ARG DEPLOY_LANE_TOKEN=""
RUN if [ -z "$DEPLOY_LANE_TOKEN" ]; then \
      echo ""; \
      echo "🛑 OUT-OF-LANE BUILD REFUSED — no DEPLOY_LANE_TOKEN reached this build."; \
      echo ""; \
      echo "   The raw compose command (docker compose ... up -d --build maia) is retired"; \
      echo "   as a deploy path: it bypasses the deploy-lane lock, rollback tagging, and"; \
      echo "   the pre-deploy gate (out-of-lane deploy incident, 2026-07-10)."; \
      echo ""; \
      echo "   Production (minisforum):"; \
      echo "     scripts/pre-deploy-gate.sh deploy-maia    # quick maia-only rebuild"; \
      echo "     scripts/deploy-production.sh deploy       # full stack + migrations + rollback tags"; \
      echo ""; \
      echo "   Local dev / other stacks: docker-compose.yml and docker-compose.staging.yml"; \
      echo "   declare their lane already. To build outside any compose file, declare"; \
      echo "   yours explicitly (a typed, greppable act — never quiet):"; \
      echo "     docker build --build-arg DEPLOY_LANE_TOKEN=local-dev ..."; \
      echo ""; \
      exit 1; \
    fi

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
ARG NEXT_PUBLIC_SHOW_BETA_BADGE=false
ENV NEXT_PUBLIC_SHOW_BETA_BADGE=${NEXT_PUBLIC_SHOW_BETA_BADGE}

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
# Lane provenance baked into the image: `docker exec maia-sovereign printenv
# DEPLOY_LANE` shows which lane built what's running. The base-stage tripwire
# guarantees this is never empty on a successfully built image (pre-tripwire
# images simply lack the variable).
ARG DEPLOY_LANE_TOKEN=""

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV GIT_COMMIT=${GIT_COMMIT}
ENV APP_VERSION=${APP_VERSION}
ENV BUILD_DATE=${BUILD_DATE}
ENV DEPLOY_LANE=${DEPLOY_LANE_TOKEN}

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

# Audit trail (lib/security/auditLog.ts) — must be writable by the node user;
# without this every audit write fails EACCES and the trail is silently empty.
RUN mkdir -p /app/data/audit-logs && chown -R node:node /app/data/audit-logs

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
