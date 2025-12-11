# Navigator API Service
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
RUN addgroup --system --gid 1001 navigator && \
    adduser --system --uid 1001 navigator

# Change ownership
RUN chown -R navigator:navigator /app
USER navigator

# Expose port
EXPOSE 7777

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:7777/health || exit 1

# Start the service
CMD ["node", "navigator-api.js"]