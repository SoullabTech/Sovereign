# Async Embeddings Deployment: EC2 + Docker + systemd

This appendix covers deploying the embedding worker on your **EC2 production stack** (Docker + Caddy + PostgreSQL).

---

## Your Stack Reality

| Component | Location | Address from worker container |
|-----------|----------|-------------------------------|
| Postgres | Docker (`maia-postgres`) | `postgres:5432` on `maia-network` |
| Ollama | Host | `host.docker.internal:11434` |
| Web | Docker (`maia-sovereign`) | Same image, different command |

---

## Option A: Add to docker-compose.production.yml (Recommended)

Add this service block after the `maia:` service:

```yaml
  # ═════════════════════════════════════════════════════════════════════════════
  # Embedding Worker - Async Queue Consumer
  # ═════════════════════════════════════════════════════════════════════════════
  # Processes embedding_jobs queue, generates vectors via Ollama
  # Same image as maia, different entrypoint
  maia-embed-worker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: maia-embed-worker
    restart: unless-stopped

    depends_on:
      postgres:
        condition: service_healthy

    extra_hosts:
      - "host.docker.internal:host-gateway"

    env_file:
      - .env.production

    environment:
      NODE_ENV: production
      MAIA_EMBEDDINGS_MODE: queue
      # Postgres via Docker network
      DATABASE_URL: postgresql://soullab:${POSTGRES_PASSWORD}@postgres:5432/maia_consciousness
      # Ollama on host
      OLLAMA_BASE_URL: http://host.docker.internal:11434
      OLLAMA_EMBED_MODEL: nomic-embed-text
      # Optional tuning
      EMBEDDING_MAX_ATTEMPTS: "5"

    command: ["npx", "tsx", "scripts/embedding_worker.ts"]

    networks:
      - maia-network

    # No healthcheck needed - it's a background worker
    # Logs are the health indicator
```

### Deploy

```bash
# Rebuild to include worker
docker compose -f docker-compose.production.yml build maia-embed-worker

# Start worker
docker compose -f docker-compose.production.yml up -d maia-embed-worker

# Check logs
docker compose -f docker-compose.production.yml logs -f maia-embed-worker
```

### Verify

```bash
# Backlog API (from host)
curl -s http://localhost:3000/api/embeddings/backlog

# Queue status (exec into postgres)
docker exec maia-postgres psql -U soullab -d maia_consciousness -c \
  "SELECT status, count(*) FROM embedding_jobs GROUP BY 1 ORDER BY 1;"
```

---

## Option B: Standalone systemd unit (if you prefer separate control)

### 1) Create env file

**Path:** `/etc/maia/embedding-worker.env`

```bash
NODE_ENV=production
MAIA_EMBEDDINGS_MODE=queue
DATABASE_URL=postgresql://soullab:YOUR_POSTGRES_PASSWORD@postgres:5432/maia_consciousness
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_EMBED_MODEL=nomic-embed-text
EMBEDDING_MAX_ATTEMPTS=5
```

### 2) Create systemd unit

**Path:** `/etc/systemd/system/maia-embed-worker.service`

```ini
[Unit]
Description=MAIA Embedding Worker (Async Queue Consumer)
After=docker.service network-online.target
Wants=network-online.target
Requires=docker.service

[Service]
Type=simple
Restart=always
RestartSec=5

# Env file for secrets
EnvironmentFile=/etc/maia/embedding-worker.env

# Clean up any existing container
ExecStartPre=-/usr/bin/docker rm -f maia-embed-worker

# Run worker container
# Uses same image as maia-sovereign, different command
ExecStart=/usr/bin/docker run --rm --name maia-embed-worker \
  --env-file /etc/maia/embedding-worker.env \
  --network maia-network \
  --add-host host.docker.internal:host-gateway \
  maia-sovereign:latest \
  npx tsx scripts/embedding_worker.ts

ExecStop=/usr/bin/docker stop maia-embed-worker

# Hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true

[Install]
WantedBy=multi-user.target
```

### 3) Enable and start

```bash
sudo systemctl daemon-reload
sudo systemctl enable maia-embed-worker
sudo systemctl start maia-embed-worker
sudo systemctl status maia-embed-worker --no-pager
```

### 4) View logs

```bash
# systemd journal
sudo journalctl -u maia-embed-worker -f

# or docker logs
docker logs -f maia-embed-worker
```

---

## Health Checks

### Backlog endpoint

```bash
curl -s https://soullab.life/api/embeddings/backlog
# {"ok":true,"pending":0}
```

### Queue status

```bash
docker exec maia-postgres psql -U soullab -d maia_consciousness -c \
  "SELECT status, count(*) FROM embedding_jobs GROUP BY 1 ORDER BY 1;"
```

### Embedding coverage

```bash
docker exec maia-postgres psql -U soullab -d maia_consciousness -c \
  "SELECT count(*) AS total, count(*) FILTER (WHERE embedding IS NOT NULL) AS embedded FROM case_memory_chunks;"
```

### Worker process

```bash
docker ps | grep maia-embed-worker
docker logs -n 50 maia-embed-worker
```

---

## Operational Commands

### Stop worker (let backlog accumulate for testing)

```bash
docker compose -f docker-compose.production.yml stop maia-embed-worker
# or
sudo systemctl stop maia-embed-worker
```

### Restart worker

```bash
docker compose -f docker-compose.production.yml restart maia-embed-worker
# or
sudo systemctl restart maia-embed-worker
```

### Scale workers (if needed)

With compose, you can scale:

```bash
docker compose -f docker-compose.production.yml up -d --scale maia-embed-worker=2
```

Concurrency is safe due to `FOR UPDATE SKIP LOCKED`.

---

## Troubleshooting

### Worker can't connect to Postgres

**Symptom:** `ECONNREFUSED` or auth errors

**Fix:**
- Ensure worker is on `maia-network`
- Ensure `POSTGRES_PASSWORD` matches `.env.production`
- Check: `docker network inspect maia-network`

### Worker can't connect to Ollama

**Symptom:** Jobs pile up, fetch timeouts

**Fix:**
- Ensure Ollama is running on host: `curl http://localhost:11434/api/tags`
- Ensure `--add-host host.docker.internal:host-gateway` is set
- From inside container: `curl http://host.docker.internal:11434/api/tags`

### Jobs stuck in `processing`

**Symptom:** Jobs never complete, stuck count

**Fix (manual requeue):**

```sql
UPDATE embedding_jobs
SET status = 'pending', locked_at = NULL
WHERE status = 'processing'
  AND locked_at < now() - interval '10 minutes';
```

### tsx not found in production image

**Fix:** Add `tsx` to `dependencies` (not devDependencies) in `package.json`, or compile scripts:

```bash
# In Dockerfile build stage
RUN npx tsc scripts/embedding_worker.ts --outDir dist/scripts

# Then run
node dist/scripts/embedding_worker.js
```

---

## Recommended: Option A (compose)

Using `docker-compose.production.yml` keeps everything in one place:
- Single `docker compose up -d` brings up entire stack
- Logs centralized via `docker compose logs`
- Restart policies handled uniformly

Only use systemd (Option B) if you need independent control or want the worker managed outside compose.
