# MAIA Sovereign Deployment Guide v2.0

**Fully Container-Sovereign Edition**

**Philosophy**: Zero host dependencies except Docker. True "drop onto any VPS" portability.

---

## Table of Contents

1. [Quick Start (TL;DR)](#quick-start-tldr)
2. [Prerequisites](#prerequisites)
3. [Deployment Modes](#deployment-modes)
4. [Container-Sovereign Setup (Recommended)](#container-sovereign-setup-recommended)
5. [Hybrid Development Setup](#hybrid-development-setup)
6. [Verification & Smoke Tests](#verification--smoke-tests)
7. [Troubleshooting](#troubleshooting)
8. [Optional: Internal Ollama Service](#optional-internal-ollama-service)

---

## Quick Start (TL;DR)

**For VPS with just Docker installed**:

```bash
# Clone repo
git clone https://github.com/your-org/MAIA-SOVEREIGN.git
cd MAIA-SOVEREIGN

# Configure environment
cp .env.production.example .env.production
# Edit .env.production - set POSTGRES_PASSWORD and other secrets

# Deploy sovereign stack
docker compose up -d

# Apply Prisma migrations
docker compose --profile migrate run --rm migrate

# Verify deployment
curl -I http://localhost:3000/maia  # Should return 200 OK

# Check logs
docker compose logs -f maia
```

**Done.** MAIA is now running with internal Postgres, zero host dependencies.

---

## Prerequisites

### Required

- **Docker**: v20.10+ with Docker Compose v2.0+
  ```bash
  docker --version  # Should be 20.10+
  docker compose version  # Should be v2.0+
  ```

- **Disk Space**: ~5GB for images + volumes
- **RAM**: 2GB minimum, 4GB recommended
- **CPU**: 2 cores minimum for reasonable performance

### Optional (for GPU acceleration)

- **NVIDIA GPU**: For fast Ollama inference
- **nvidia-docker2**: GPU passthrough to containers

---

## Deployment Modes

### Mode 1: Fully Container-Sovereign (VPS Recommended)

**What it is**:
- PostgreSQL as internal Docker service
- Ollama can be internal Docker service (or on host)
- Zero host service dependencies

**Best for**:
- VPS deployment
- Production environments
- True infrastructure portability

**Benefits**:
- `docker compose up` handles everything
- No manual PostgreSQL installation
- Easy migration between VPS providers
- Clean, reproducible deployments

### Mode 2: Hybrid (Development)

**What it is**:
- PostgreSQL on host (localhost:5432)
- Ollama on host (localhost:11434)
- Docker only for Next.js app

**Best for**:
- Local development
- Rapid iteration
- Debugging database queries directly

**Benefits**:
- Direct psql access
- No volume management
- Faster rebuild cycles

---

## Container-Sovereign Setup (Recommended)

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/MAIA-SOVEREIGN.git
cd MAIA-SOVEREIGN
```

### Step 2: Configure Environment

```bash
# Copy template
cp .env.production.example .env.production

# Generate secure password
openssl rand -hex 32

# Edit .env.production
nano .env.production
```

**Critical settings**:

```bash
# Database password (use generated value)
POSTGRES_PASSWORD=your-secure-random-password-here

# Sovereignty enforcement
SOVEREIGNTY_MODE=true
FORCE_LOCAL_LLM=true
DISABLE_OPENAI_COMPLETELY=true

# Ollama (host or internal service)
OLLAMA_BASE_URL=http://host.docker.internal:11434  # If Ollama on host
# OLLAMA_BASE_URL=http://ollama:11434  # If using internal ollama service

# Cloud AI (optional, chat only)
ALLOW_ANTHROPIC_CHAT=false
```

### Step 3: Start Sovereign Stack

```bash
# Build and start services
docker compose up -d

# Watch build output
docker compose logs -f maia

# Wait for "ready on http://0.0.0.0:3000"
```

**What happens**:
1. Builds MAIA Next.js app (multi-stage Dockerfile)
2. Starts internal postgres service
3. Waits for postgres health check
4. Starts MAIA app
5. MAIA connects to internal postgres

### Step 4: Apply Prisma Migrations

```bash
# Run migrations (uses build stage with Prisma CLI)
docker compose --profile migrate run --rm migrate

# Expected output:
# Applying migration `20241201_initial_schema`
# Migration applied successfully
```

### Step 5: Verify Deployment

See [Verification & Smoke Tests](#verification--smoke-tests) section.

---

## Hybrid Development Setup

### Step 1: Install Host Services

**PostgreSQL**:
```bash
# Mac
brew install postgresql@16
brew services start postgresql@16

# Linux (Debian/Ubuntu)
sudo apt install postgresql-16
sudo systemctl start postgresql

# Create database
createdb maia_consciousness
```

**Ollama**:
```bash
# Mac/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull deepseek-r1:7b
```

### Step 2: Configure Environment

```bash
cp .env.production.example .env.production
nano .env.production
```

**Hybrid settings**:
```bash
# Database (host service)
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness

# Ollama (host service)
OLLAMA_BASE_URL=http://localhost:11434

# No POSTGRES_PASSWORD needed for local dev
```

### Step 3: Run Locally

```bash
# Apply migrations
npx prisma migrate deploy

# Start development server
npm run dev

# Or Docker with host services
docker compose -f docker-compose.hybrid.yml up
```

---

## Verification & Smoke Tests

### Health Checks

```bash
# Container status
docker compose ps

# Expected:
# maia-sovereign   running   healthy
# maia-postgres    running   healthy

# Application health endpoint
curl -s http://localhost:3000/api/consciousness/health | jq

# Expected:
# {
#   "status": "healthy",
#   "database": "connected",
#   "ollama": "available"
# }
```

### Smoke Test Ritual

**Test 1: Main MAIA Page**
```bash
curl -I http://localhost:3000/maia

# Expected: HTTP/1.1 200 OK
```

**Test 2: Biofield Redirect**
```bash
curl -I http://localhost:3000/maia/journey

# Expected: HTTP/1.1 307 Temporary Redirect
# Location: /maia?panel=biofield
```

**Test 3: Consciousness API**
```bash
curl -s http://localhost:3000/api/consciousness/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "mode": "fast"}' | jq .status

# Expected: "success" or "processing"
```

**Test 4: Database Persistence**
```bash
# Check traces table exists
docker compose exec postgres psql -U soullab -d maia_consciousness \
  -c "SELECT COUNT(*) FROM consciousness_traces;"

# Expected: (0 rows) or actual count
```

**Test 5: Ollama Connection**
```bash
# If Ollama on host
curl http://localhost:11434/api/tags

# If internal ollama service
docker compose exec maia curl http://ollama:11434/api/tags

# Expected: JSON list of models
```

### Log Analysis

```bash
# MAIA application logs
docker compose logs maia | grep -i error

# Should be clean (no connection errors, no 500s)

# PostgreSQL logs
docker compose logs postgres | grep -i error

# Should be clean (no auth failures)
```

---

## Troubleshooting

### Issue: "Failed to copy traced files" Warnings

**Symptom**: Build warnings about missing backup files

**Cause**: `outputFileTracingExcludes` in `next.config.js` doesn't match `.dockerignore`

**Fix**: Verify alignment:
```bash
# Check next.config.js
node -e "console.log(require('./next.config.js').outputFileTracingExcludes)"

# Should show: { '/*': ['backups/**', 'Community-Commons/**', ...] }

# Check .dockerignore includes same patterns
grep -E "backups|Community-Commons" .dockerignore
```

### Issue: "ECONNREFUSED" Database Connection

**Symptom**: MAIA can't connect to postgres

**Cause**: Database not ready or wrong connection string

**Fix**:
```bash
# Check postgres is healthy
docker compose ps postgres

# Check connection from inside MAIA container
docker compose exec maia sh -c 'nc -zv postgres 5432'

# Should show: postgres (172.x.x.x:5432) open

# Verify DATABASE_URL in environment
docker compose exec maia env | grep DATABASE_URL
```

### Issue: "host.docker.internal" Not Found (Linux)

**Symptom**: Can't reach Ollama on host from container

**Cause**: Linux doesn't support `host.docker.internal` by default

**Fix**: Ensure `extra_hosts` in docker-compose.yml:
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

**Verify**:
```bash
# From inside container
docker compose exec maia ping -c 1 host.docker.internal

# Should resolve to host IP
```

### Issue: Ollama "Connection Refused"

**Symptom**: MAIA can't reach Ollama on host

**Cause**: Ollama bound to 127.0.0.1 only

**Fix**: Bind Ollama to 0.0.0.0:
```bash
# Check current binding
lsof -i :11434

# If showing 127.0.0.1, reconfigure Ollama
# Edit /etc/systemd/system/ollama.service or equivalent
Environment="OLLAMA_HOST=0.0.0.0:11434"

# Restart
sudo systemctl restart ollama

# Verify
lsof -i :11434 | grep LISTEN
# Should show *:11434 (LISTEN)
```

### Issue: Build Fails with TypeScript Errors

**Symptom**: `npm run build` fails in Docker

**Cause**: `--omit=dev` removed TypeScript tooling

**Fix**: Verify Dockerfile uses `npm ci` (not `--omit=dev`):
```dockerfile
# Stage 1: deps
RUN npm ci --ignore-scripts  # ✅ Correct

# NOT:
RUN npm ci --omit=dev  # ❌ Wrong - breaks build
```

### Issue: Migrations Don't Apply

**Symptom**: Tables don't exist at runtime

**Cause**: Forgot to run migrate service

**Fix**:
```bash
# Run migrations
docker compose --profile migrate run --rm migrate

# Verify tables exist
docker compose exec postgres psql -U soullab -d maia_consciousness \
  -c "\dt"

# Should show: consciousness_traces, consciousness_rules, etc.
```

---

## Optional: Internal Ollama Service

For **fully** container-sovereign deployment (no host Ollama dependency):

### Step 1: Uncomment Ollama Service

Edit `docker-compose.yml`:

```yaml
ollama:
  image: ollama/ollama:latest
  container_name: maia-ollama
  ports:
    - "11434:11434"
  volumes:
    - ollama_data:/root/.ollama
  restart: unless-stopped
  networks:
    - maia-network
```

And volume:

```yaml
volumes:
  postgres_data:
  ollama_data:  # Add this
```

### Step 2: Update MAIA Environment

```yaml
maia:
  environment:
    # Change from host to container
    OLLAMA_BASE_URL: "http://ollama:11434"
```

### Step 3: Start and Pull Model

```bash
# Start stack
docker compose up -d

# Pull DeepSeek model
docker compose exec ollama ollama pull deepseek-r1:7b

# Verify
docker compose exec ollama ollama list
```

### GPU Acceleration (Optional)

For NVIDIA GPU support:

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

**Requires**:
- NVIDIA GPU
- nvidia-docker2 installed
- Docker configured with nvidia runtime

---

## Security Hardening

### Production Checklist

- [ ] Generate strong `POSTGRES_PASSWORD` (32+ chars random)
- [ ] Set `JWT_SECRET` to random value (64+ chars)
- [ ] Use HTTPS reverse proxy (nginx, Caddy, Traefik)
- [ ] Set `ALLOW_ANTHROPIC_CHAT=false` unless explicitly needed
- [ ] Enable Docker resource limits (CPU/memory)
- [ ] Regular backup of `postgres_data` volume
- [ ] Firewall: Only expose port 443 (HTTPS)
- [ ] Never commit `.env.production` to git

### Backup Strategy

```bash
# Backup postgres volume
docker compose exec postgres pg_dump -U soullab maia_consciousness \
  > backup-$(date +%Y%m%d).sql

# Backup Docker volume directly
docker run --rm -v maia-sovereign_postgres_data:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/postgres-data-$(date +%Y%m%d).tar.gz /data

# Restore from SQL dump
docker compose exec -T postgres psql -U soullab maia_consciousness \
  < backup-20251223.sql
```

---

## Performance Tuning

### Database

```yaml
postgres:
  environment:
    # For production with 4GB RAM
    POSTGRES_SHARED_BUFFERS: "1GB"
    POSTGRES_EFFECTIVE_CACHE_SIZE: "3GB"
    POSTGRES_MAX_CONNECTIONS: "100"
```

### MAIA Container

```bash
# Run with resource limits
docker compose run --cpus=2 --memory=4g maia

# Or in compose file (non-Swarm):
maia:
  cpus: 2.0
  mem_limit: 4g
```

### Ollama

```yaml
ollama:
  environment:
    OLLAMA_NUM_PARALLEL: "4"  # Concurrent requests
    OLLAMA_MAX_LOADED_MODELS: "2"  # Keep in memory
```

---

## Monitoring

### Container Health

```bash
# Watch resources
docker stats maia-sovereign maia-postgres

# Expected:
# CPU < 50% idle, < 100% under load
# Memory: MAIA ~500MB, Postgres ~200MB
```

### Application Metrics

```bash
# Request rate
docker compose logs maia | grep -c "GET\|POST"

# Error rate
docker compose logs maia | grep -c "ERROR\|500"

# Database connections
docker compose exec postgres psql -U soullab -d maia_consciousness \
  -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Migration from Host Services

If migrating from existing host Postgres:

```bash
# 1. Export data from host
pg_dump -U soullab -h localhost maia_consciousness > migration.sql

# 2. Start container postgres
docker compose up -d postgres

# 3. Wait for health check
docker compose ps postgres  # Should show "healthy"

# 4. Import data
docker compose exec -T postgres psql -U soullab maia_consciousness < migration.sql

# 5. Verify
docker compose exec postgres psql -U soullab -d maia_consciousness \
  -c "SELECT COUNT(*) FROM consciousness_traces;"

# 6. Update MAIA to use container postgres
# (already configured if using current docker-compose.yml)

# 7. Start MAIA
docker compose up -d maia
```

---

## Next Steps

Once deployed:

1. **Test consciousness processing**: Send queries via API
2. **Verify trace persistence**: Check database after queries
3. **Monitor logs**: Watch for errors or warnings
4. **Set up backups**: Automate postgres_data volume backups
5. **Configure reverse proxy**: Add HTTPS with Let's Encrypt
6. **Review sovereignty**: Confirm no unexpected cloud calls

---

## Additional Resources

- **Architecture Paper**: `Community-Commons/09-Technical/SOVEREIGN_DEPLOYMENT_ARCHITECTURE.md`
- **Production Hardening**: `artifacts/PRODUCTION_BUILD_HARDENING_COMPLETE.md`
- **Development Guide**: `CLAUDE.md`
- **Next.js Standalone**: https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
- **Docker Networking**: https://docs.docker.com/desktop/networking/

---

**Status**: Production-ready v2.0 (Fully Container-Sovereign)
**Date**: December 2025
**Philosophy**: "Infrastructure choices are consciousness choices"
