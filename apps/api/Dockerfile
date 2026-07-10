# ═══════════════════════════════════════════════════════════════════════════════
# MAIA API Service Dockerfile
# ═══════════════════════════════════════════════════════════════════════════════
# Multi-stage build for the MAIA API backend service.
#
# MAIA API is the multi-tenant backbone for all Soullab products.
# AIN is a dependency called by MAIA, never the reverse.
# ═══════════════════════════════════════════════════════════════════════════════

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Deploy-lane tripwire — same mechanism as the main Dockerfile: refuse
# out-of-lane builds loudly instead of letting a raw `docker compose ... up -d
# --build` bypass the deploy-lane lock and pre-deploy gate quietly
# (2026-07-10 incident). Token exported by scripts/deploy-lock.sh; forwarded
# by docker-compose.production.yml. See docs/ops/DEPLOY_LANE_TOKEN.md.
ARG DEPLOY_LANE_TOKEN=""
RUN if [ -z "$DEPLOY_LANE_TOKEN" ]; then \
      echo ""; \
      echo "🛑 OUT-OF-LANE BUILD REFUSED — no DEPLOY_LANE_TOKEN reached this build."; \
      echo "   Deploy through scripts/deploy-production.sh or scripts/pre-deploy-gate.sh,"; \
      echo "   or declare a lane explicitly: --build-arg DEPLOY_LANE_TOKEN=local-dev"; \
      echo "   (see docs/ops/DEPLOY_LANE_TOKEN.md)."; \
      echo ""; \
      exit 1; \
    fi

# Copy package.json for API
COPY apps/api/package.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source files and package.json
COPY apps/api/ ./

# Build TypeScript
RUN npm run build

# Stage 3: Runner (production)
FROM node:20-alpine AS runner
WORKDIR /app

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 maiaapi

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Copy package.json for production deps
COPY apps/api/package.json ./

# Install production dependencies only
RUN npm install --production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Set ownership
RUN chown -R maiaapi:nodejs /app

# Switch to non-root user
USER maiaapi

EXPOSE 3001

# Health check (using node since wget not in alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/v1/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/index.js"]
