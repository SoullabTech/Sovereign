# Docker Architecture Notes - MAIA Sovereign

**Date**: 2025-12-23
**Status**: Production-Ready (Multi-Arch Safe)

---

## Dockerfile Versions

### Primary: `Dockerfile` (Platform-Agnostic)

**Base**: `node:20-bookworm-slim`
**Architecture**: Auto-detects at build time
**Prisma**: No arch pinning, generates for build platform

**Stages**:
- `base` - Base Node.js environment
- `deps` - Full dependencies (including devDependencies for build)
- `builder` - Prisma generation + Next.js build
- `runner` - Minimal runtime with standalone server

**Use When**:
- Deploying to any VPS (x64 or ARM64)
- Building on Mac for x64 VPS
- Multi-arch builds for portability

### Fallback: `Dockerfile.arm64-alpine.prisma` (ARM64-Locked)

**Base**: `node:20-alpine`
**Architecture**: ARM64 only (Apple Silicon, ARM64 VPS)
**Prisma**: Hardcoded to `linux-musl-arm64-openssl-3.0.x`

**Use When**:
- Deploying exclusively to ARM64 infrastructure
- Need Alpine's smaller image size
- Known ARM64-only environment

**Switch Command**:
```bash
# Use ARM64 fallback
docker compose build -f Dockerfile.arm64-alpine.prisma

# Or edit docker-compose.yml temporarily:
# dockerfile: Dockerfile.arm64-alpine.prisma
```

---

## Build Patterns

### Pattern 1: Build on VPS (Recommended)

**Best For**: Maximum reliability, zero architecture mismatch

```bash
# On VPS
git clone <repo>
cd MAIA-SOVEREIGN
cp .env.production.example .env.production
# Edit .env.production with secure password

docker compose build --no-cache
docker compose up -d postgres
docker compose --profile migrate run --rm migrate
docker compose up -d maia
```

**Why This Works**:
- Build happens on deployment target
- Prisma generates binaries for exact platform
- No buildx complexity
- No image shipping required

### Pattern 2: Cross-Platform Build (Mac → x64 VPS)

**Best For**: Local testing before VPS deployment

```bash
# On Mac
docker buildx create --use 2>/dev/null || true

# Build for target platform
docker buildx build --platform linux/amd64 -t maia-sovereign:amd64 --load .

# Export (no registry required)
docker save maia-sovereign:amd64 | gzip > maia-sovereign_amd64.tar.gz

# Ship to VPS
scp maia-sovereign_amd64.tar.gz .env.production docker-compose.yml root@VPS:/opt/maia/

# On VPS
ssh root@VPS
cd /opt/maia
gunzip -c maia-sovereign_amd64.tar.gz | docker load
docker compose up -d postgres
docker compose --profile migrate run --rm migrate
docker compose up -d maia
```

### Pattern 3: Multi-Arch Build (Advanced)

**Best For**: Supporting multiple deployment architectures from single build

```bash
# Create multi-arch builder
docker buildx create --name multiarch --use

# Build for both x64 and ARM64
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t maia-sovereign:multiarch \
  --output type=docker .

# Or push to registry
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t registry.example.com/maia-sovereign:latest \
  --push .
```

---

## Prisma Considerations

### Auto-Detection (Current Dockerfile)

```dockerfile
# No PRISMA_CLI_BINARY_TARGETS pinning
RUN npx prisma generate

# Prisma automatically detects:
# - Platform: linux/darwin/windows
# - Architecture: x64/arm64
# - C library: glibc/musl
# - OpenSSL version: 1.1.x/3.0.x
```

**Result**: Correct binaries for build platform automatically.

### Safety Belt

```dockerfile
# Explicit copy of Prisma engines to runtime
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma
```

**Why**: Next.js standalone output tracing sometimes misses `.prisma` subdirectory. This ensures Prisma client works even if NFT (Node File Trace) has edge cases.

---

## Migration Service

**Stage Target**: `builder` (has Prisma CLI + schema + node_modules)

```yaml
migrate:
  build:
    target: builder
  env_file:
    - .env.production
  depends_on:
    postgres:
      condition: service_healthy
  command: ["sh", "-c", "npx prisma migrate deploy"]
```

**Why This Works**:
- Builder stage has full node_modules (including Prisma CLI)
- Runtime stage (runner) is minimal, doesn't need Prisma CLI
- Migration runs once before app starts
- Database is guaranteed ready (health check wait)

---

## Health Checks

### Application

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/consciousness/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
```

**Why Node.js Built-In**:
- No `curl` dependency (minimal image)
- Works in bookworm-slim and alpine
- Fast, reliable HTTP check

### Database (via docker-compose.yml)

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U soullab -d maia_consciousness"]
  interval: 5s
  timeout: 5s
  retries: 20
```

**Startup Sequence**:
1. Postgres starts (0-5s)
2. Health check every 5s (up to 100s max)
3. After healthy: MAIA starts
4. After healthy: Migrations can run

---

## Image Sizes

### Bookworm-Slim (Current)

- **deps stage**: ~800MB (full node_modules)
- **builder stage**: ~1.2GB (+ Next.js build output)
- **runner stage**: ~350MB (standalone + Prisma engines)

### Alpine (Fallback)

- **deps stage**: ~600MB
- **builder stage**: ~900MB
- **runner stage**: ~250MB

**Trade-off**: Alpine is smaller but musl/glibc compatibility issues are more common. Bookworm-slim is "boring" (works everywhere).

---

## Common Issues & Fixes

### Issue: "Prisma engine not found at runtime"

**Symptom**: Works in build, fails in container with "Query engine not found"

**Cause**: Next.js standalone tracing missed `.prisma` directory

**Fix**: Already applied in current Dockerfile (explicit COPY of Prisma engines)

### Issue: "Architecture mismatch" errors

**Symptom**: `exec format error` or Prisma engine failures

**Cause**: Built on ARM64, deployed to x64 (or vice versa)

**Fix**: Use Pattern 1 (build on VPS) or Pattern 2 (buildx with correct platform)

### Issue: Migrations fail with "relation does not exist"

**Symptom**: Migration service exits with database errors

**Cause**: Migrations ran before postgres health check completed

**Fix**: Already applied - `depends_on: postgres: condition: service_healthy`

### Issue: "Cannot find module '@prisma/client'"

**Symptom**: Runtime import error for Prisma

**Cause**: Prisma client not generated or not copied to standalone

**Fix**: Verify builder stage has `npx prisma generate` and runner has explicit `.prisma` copy

---

## Verification Commands

### Build Test
```bash
docker compose build --no-cache
echo $?  # Should be 0
```

### Stage Verification
```bash
docker build --target builder -t maia-builder .
docker run --rm maia-builder ls -la node_modules/.prisma
# Should show Prisma engine binaries
```

### Runtime Verification
```bash
docker compose up -d
docker compose exec maia ls -la node_modules/.prisma
docker compose exec maia node -e "require('@prisma/client')"
# Should not error
```

### Migration Test
```bash
docker compose --profile migrate run --rm migrate
# Should show "migration applied" output
```

---

## Future Enhancements

### 1. Multi-Stage Caching Optimization

```dockerfile
# Add cache mounts for npm ci
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts
```

### 2. Distroless Runtime (Maximum Security)

```dockerfile
FROM gcr.io/distroless/nodejs20-debian12 AS runner
# No shell, no package manager, minimal attack surface
```

### 3. BuildKit Secrets for Build-Time API Keys

```dockerfile
RUN --mount=type=secret,id=build_api_key \
    export API_KEY=$(cat /run/secrets/build_api_key) && npm run build
```

---

## References

- **Next.js Standalone**: https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
- **Prisma Engines**: https://www.prisma.io/docs/concepts/components/prisma-engines
- **Docker Multi-Arch**: https://docs.docker.com/build/building/multi-platform/
- **Bookworm Base Images**: https://hub.docker.com/_/node

---

**Status**: ✅ Production-Ready (Multi-Arch Safe)
**Last Updated**: 2025-12-23
**Maintainer**: MAIA Sovereign Team
