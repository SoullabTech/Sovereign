# ═══════════════════════════════════════════════════════════════════════════════
# MAIA RLM Service - Dockerfile
# ═══════════════════════════════════════════════════════════════════════════════
# Recursive Language Models microservice for corpus-as-environment processing.
# Runs isolated in Docker for sovereignty/security.

FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Create non-root user for security
RUN useradd -m -u 1000 rlm && chown -R rlm:rlm /app
USER rlm

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Run service
CMD ["python", "main.py"]
