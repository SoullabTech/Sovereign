# MAIA Sovereign Deployment Guide

**Self-Hosted Docker Deployment (NOT Vercel)**

Complete guide for deploying MAIA on your own infrastructure using Docker, local PostgreSQL, and Ollama.

---

## Prerequisites

### Required
- **Docker** 24.0+ with Docker Compose
- **PostgreSQL** 15+ running locally
  - Database: `maia_consciousness`
  - User: `soullab` (or your preferred user)
- **Node.js** 20+ (for local development)
- **Ollama** (for local AI - recommended)

### Optional
- **Redis** (for caching/sessions - can enable in docker-compose.yml)
- **Nginx** (for SSL/reverse proxy - configure separately)

---

## Quick Start

### 1. Verify Prerequisites

```bash
# Check Docker
docker --version
docker compose version

# Check PostgreSQL (should return your database list)
psql -U soullab -l

# Check Ollama (if using local AI)
curl http://localhost:11434/api/tags
```

### 2. Configure Environment

Create `.env.production` with your settings:

```bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign Environment Configuration
# ═══════════════════════════════════════════════════════════════════════════════

# Database (Local PostgreSQL - NOT Supabase)
DATABASE_URL=postgresql://soullab@host.docker.internal:5432/maia_consciousness

# AI Providers (Sovereignty)
OLLAMA_BASE_URL=http://host.docker.internal:11434
ALLOW_ANTHROPIC_CHAT=false  # Set to "true" only for chat channel

# Optional: Anthropic (only if ALLOW_ANTHROPIC_CHAT=true)
# ANTHROPIC_API_KEY=your-key-here

# Optional: OpenAI (legacy routes only)
# OPENAI_API_KEY=your-key-here

# Optional: Redis (uncomment if enabling Redis in docker-compose.yml)
# REDIS_URL=redis://redis:6379
```

### 3. Deploy

Run the deployment script:

```bash
./scripts/sovereign-deploy.sh
```

Or manually:

```bash
# Build and start
docker compose build
docker compose up -d

# Check status
docker compose ps
docker compose logs -f maia
```

---

## Deployment Verification

### Smoke Tests

```bash
# Main MAIA page
curl -I http://localhost:3000/maia
# Expected: HTTP/1.1 200 OK

# Biofield redirect
curl -I http://localhost:3000/maia/journey
# Expected: HTTP/1.1 307 Temporary Redirect
#           location: /maia?panel=biofield

# Consciousness health API
curl -s http://localhost:3000/api/consciousness/health | jq
# Expected: { "status": "healthy" | "degraded", ... }

# Static assets
curl -I http://localhost:3000/_next/static/chunks/[any-chunk-hash].js
# Expected: HTTP/1.1 200 OK
```

### Health Check

```bash
# View container health
docker compose ps

# Check health endpoint directly
docker exec maia-sovereign node -e "
  require('http').get('http://localhost:3000/api/consciousness/health', (res) => {
    res.on('data', d => console.log(d.toString()));
  });
"
```

---

## Architecture

### Next.js Standalone Mode

MAIA uses Next.js 16 **standalone mode** for self-hosted deployment:

- **Build output**: `.next/standalone/server.js` (self-contained Node.js server)
- **Static assets**: `.next/static/` and `public/` (copied into standalone bundle)
- **No Vercel dependencies**: Runs on any Node.js environment

### Multi-Stage Docker Build

1. **deps**: Install production dependencies
2. **build**: Build Next.js app (creates standalone bundle)
3. **runner**: Minimal runtime image with only standalone bundle + static assets

### Key Features

- ✅ **Standalone server** (not Vercel)
- ✅ **Local PostgreSQL** (not Supabase)
- ✅ **Local Ollama** (not cloud AI)
- ✅ **Non-root user** (security best practice)
- ✅ **Health checks** (automatic container monitoring)
- ✅ **Output file tracing** (prevents "Failed to copy traced files" errors)

---

## Sovereignty Guarantees

### Database
- ❌ **No Supabase** - Uses local PostgreSQL via `lib/db/postgres.ts`
- ✅ Database runs on host machine at `localhost:5432`
- ✅ Data stays local, never sent to cloud

### AI Providers
- ✅ **Preferred**: Ollama (local DeepSeek models)
- ⚠️ **Optional**: Anthropic for chat channel only (MAIA's "mouth")
  - Set `ALLOW_ANTHROPIC_CHAT=true` to enable
  - Consciousness channel ALWAYS uses local AI
- ❌ **Avoid**: OpenAI (legacy routes only if needed)

### Deployment
- ❌ **No Vercel** - Self-hosted standalone server
- ✅ Docker container runs on your infrastructure
- ✅ Full control over scaling, networking, security

---

## Configuration Details

### next.config.js

Key settings for sovereign deployment:

```javascript
output: 'standalone',  // Self-contained server bundle

outputFileTracingExcludes: {
  '/*': [
    'backups/**',
    'Community-Commons/**',
    'artifacts/**',
    '**/*.md',
    '**/*.mmd',
  ],
},

redirects: async () => [
  {
    source: '/maia/journey/:path*',
    destination: '/maia?panel=biofield',
    permanent: false,
  },
],
```

### .dockerignore

Prevents "Failed to copy traced files" errors by excluding unnecessary directories from Docker build context. **Must match** `outputFileTracingExcludes` in `next.config.js`.

---

## Troubleshooting

### "Failed to copy traced files" during build

**Cause**: Build context includes directories excluded in `next.config.js`

**Fix**: Verify `.dockerignore` matches `next.config.js` exclusions:
```bash
# Check .dockerignore has:
backups
backups/**
Community-Commons
Community-Commons/**
artifacts
artifacts/**
```

### Container health check failing

**Cause**: Health endpoint not responding

**Fix**: Check logs and verify database connection:
```bash
docker compose logs maia
docker exec maia-sovereign env | grep DATABASE_URL
```

### Static assets 404

**Cause**: Static files not copied to standalone bundle

**Fix**: Verify Dockerfile copies both `.next/static` and `public`:
```dockerfile
COPY --from=build --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nodejs:nodejs /app/public ./public
```

### Database connection refused

**Cause**: PostgreSQL not accessible from Docker container

**Fix**: Use `host.docker.internal` instead of `localhost`:
```bash
DATABASE_URL=postgresql://soullab@host.docker.internal:5432/maia_consciousness
```

### Biofield redirect not working

**Cause**: `redirects()` function missing from config

**Fix**: Verify `next.config.js` has redirects stamped after object creation:
```bash
node - <<'NODE'
const c = require('./next.config.js')
console.log('redirects:', typeof c.redirects)
NODE
# Expected: redirects: function
```

---

## Production Hardening

### Security

- ✅ Non-root user (`nodejs:nodejs`)
- ✅ Read-only filesystem (except temp directories)
- ✅ No secrets in image (use environment variables)
- ✅ Minimal base image (`node:20-bookworm-slim`)

### Performance

- ✅ Multi-stage build (smaller image)
- ✅ Production dependencies only (`npm ci --omit=dev`)
- ✅ Output file tracing (only necessary files included)
- ✅ Resource limits (2 CPU, 4GB RAM max)

### Monitoring

- ✅ Health check endpoint (`/api/consciousness/health`)
- ✅ Automatic container restart (`restart: unless-stopped`)
- ✅ Health check retries (5 attempts, 30s interval)

---

## Useful Commands

### Development

```bash
# Local development (not Docker)
npm run dev

# Type check
npm run typecheck

# Sovereignty audit
npm run check:no-supabase
```

### Docker Operations

```bash
# View logs
docker compose logs -f maia

# Restart container
docker compose restart maia

# Stop containers
docker compose stop

# Stop and remove containers
docker compose down

# Rebuild and restart
docker compose up --build -d

# Execute command in container
docker exec -it maia-sovereign /bin/bash
```

### Database Operations

```bash
# Connect to database from host
psql -U soullab maia_consciousness

# Check consciousness traces
psql -U soullab maia_consciousness \
  -c "SELECT COUNT(*) FROM consciousness_traces;"

# Backup database
pg_dump -U soullab maia_consciousness > backup.sql
```

---

## Deployment Checklist

Before deploying to production:

- [ ] PostgreSQL running and accessible
- [ ] Ollama installed and running (if using local AI)
- [ ] `.env.production` configured with correct DATABASE_URL
- [ ] `next.config.js` has `output: 'standalone'`
- [ ] `.dockerignore` matches `outputFileTracingExcludes`
- [ ] Clean build completes without "Failed to copy traced files" warnings
- [ ] All smoke tests pass
- [ ] Health check endpoint responding
- [ ] Biofield redirect working (307 to `/maia?panel=biofield`)
- [ ] Static assets loading correctly
- [ ] No Supabase or Vercel dependencies

---

## Migration from Vercel

If migrating from Vercel deployment:

1. **Database**: Export data from Supabase, import to local PostgreSQL
2. **Environment**: Update DATABASE_URL to local PostgreSQL
3. **AI**: Install Ollama and set OLLAMA_BASE_URL
4. **Config**: Ensure `output: 'standalone'` in next.config.js
5. **Build**: Run `npm run build` and verify `.next/standalone/` exists
6. **Deploy**: Follow Quick Start above

---

## Support

For issues or questions:

1. Check logs: `docker compose logs -f maia`
2. Verify config: `node -e "console.log(require('./next.config.js'))"`
3. Run smoke tests (see "Deployment Verification" above)
4. Check `CLAUDE.md` for development guidelines
5. Review `artifacts/PRODUCTION_BUILD_HARDENING_COMPLETE.md` for build fixes

---

**Status**: Production-ready for sovereign deployment 🚀
