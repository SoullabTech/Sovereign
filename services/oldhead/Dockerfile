# ═══════════════════════════════════════════════════════════════════════════════
# Old Head Plaster - Astro SSR with Virtual Daragh
# ═══════════════════════════════════════════════════════════════════════════════
# Builds from GitHub repo: https://github.com/Soullab/OldHeadPlaster

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install git for cloning
RUN apk add --no-cache git

# Clone the repository (always get latest)
ARG CACHE_BUST=1
RUN git clone --depth 1 https://github.com/Soullab/OldHeadPlaster.git .

# Install dependencies
RUN npm ci

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

EXPOSE 4321

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
