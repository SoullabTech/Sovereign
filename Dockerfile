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
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true
# Build-time placeholders for Next.js static generation
ENV OPENAI_API_KEY=dummy-build-key
ENV ANTHROPIC_API_KEY=dummy-build-key
ENV MAIA_AUDIT_FINGERPRINT_SECRET=build-placeholder

# Install psql for SQL migrations (used by migrate service)
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma client + engines for THIS build platform (no arch pinning)
RUN npx prisma generate

# Next build (standalone output)
RUN npm run build

# --- runner: minimal runtime with standalone server ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install psql for Render preDeployCommand (migrations run in runtime container)
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

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

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/consciousness/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
