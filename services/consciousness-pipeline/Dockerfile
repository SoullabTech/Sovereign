# Live Processing Orchestrator Service
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 pipeline && \
    adduser --system --uid 1001 pipeline

# Change ownership
RUN chown -R pipeline:pipeline /app
USER pipeline

# Expose port
EXPOSE 3013

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3013/health || exit 1

# Start the service
CMD ["node", "live-processing-orchestrator.js"]