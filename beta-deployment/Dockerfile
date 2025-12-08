# Consciousness Computing Docker Image for M4 Mac Server
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy consciousness computing server
COPY consciousness-computing-beta-server.js ./

# Create non-root user for security
RUN addgroup -g 1001 -S consciousness && \
    adduser -S consciousness -u 1001

# Change ownership and switch to non-root user
RUN chown -R consciousness:consciousness /app
USER consciousness

# Expose port for consciousness computing
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3008/api/status || exit 1

# Start consciousness computing server
CMD ["node", "consciousness-computing-beta-server.js"]