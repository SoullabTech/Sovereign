# ═══════════════════════════════════════════════════════════════════════════════
# Rude Boy Baking Co. - Astro SSR
# ═══════════════════════════════════════════════════════════════════════════════
# Builds from GitHub repo: https://github.com/Soullab/RudeBoyBaking
# (Once pushed — until then, use local build from /Users/soullab/RudeBoyBaking)

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# For now: copy from local. Switch to git clone once repo is on GitHub.
COPY . .

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
ENV PORT=4323
ENV NODE_ENV=production

EXPOSE 4323

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
