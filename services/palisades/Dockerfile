# ═══════════════════════════════════════════════════════════════════════════════
# Palisades Master Handyman - Astro SSR with Virtual Jeremy
# ═══════════════════════════════════════════════════════════════════════════════
# Jeremy Larson's handyman business site + admin dashboard
# Source: /Users/soullab/PalisadesHandyman (GitHub: Soullab/PalisadesHandyman)

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Create data directory for invoices
RUN mkdir -p /app/data

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
ENV BRAND_PRESET=palisades

EXPOSE 4321

# Persistent data volume for invoices/contacts
VOLUME /app/data

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
