# ═══════════════════════════════════════════════════════════════════════════════
# maia-local-inference — Phase 1 Sovereign Inference Adapter
# ═══════════════════════════════════════════════════════════════════════════════
# Thin FastAPI adapter: MAIA app → this service → Ollama.
# Does NOT bundle any model weights; Ollama runs separately.

FROM python:3.12-slim

WORKDIR /app

# System deps: curl for healthcheck only
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Dependencies first — maximise layer cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application
COPY server.py .

# Non-root user for security
RUN useradd -m -u 1000 inference && chown -R inference:inference /app
USER inference

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["python", "server.py"]
