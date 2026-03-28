# Phase 1 Hardening Plan — Sovereign Stability for 200+ Users

**Date**: 2026-03-28
**Scope**: Minimal-risk changes to protect continuity and stability
**Constraint**: Do not alter MAIA behavior or continuity logic

---

## Current Architecture Facts

- **Single Mac Studio** running all Docker containers
- **1 Postgres instance** (pgvector:pg16), shared by all services
- **Postgres default max_connections = 100** (not explicitly set in compose)
- **5 services consume the DB pool**: maia-sovereign, maia-api, maia-comms-worker, maia-summary-worker, maia-embed-worker (disabled)
- **Each Node.js process creates its own pool** via `lib/db/postgres.ts` with `max: 20`
- **Effective connection budget**: 4 active services x 20 = 80 connections against Postgres default of 100
- **Rate limiting**: In-memory `Map` on `globalThis` (line 89-120 of oracle route) — survives HMR but lost on container restart
- **Memory pipeline**: 3 awaited calls on critical path (lines 584, 1000, 1032)
- **Backups**: Scripts exist, cron setup requires manual `setup-backup-cron.sh` run — unknown if active
- **Logging**: `console.log/warn/error` only — no structure, no trace IDs
- **Container limits**: None defined — any service can consume unbounded memory
- **Health endpoint**: Solid (DB latency, table checks, memory) but missing pool stats

---

## Phase 1A — Protection (DB Pool + Resource Limits)

### 1. Tune DB connection pool (`lib/db/postgres.ts`)

**Current**: `max: 20` hardcoded
**Change**: Environment-driven pool size with saturation logging

```
Before:  max: 20
After:   max: parseInt(process.env.PG_POOL_MAX || '20', 10)
```

Add pool saturation warning:
- Log when `waitingCount > 0` (clients waiting for a connection)
- Log pool stats every 60s if saturation detected
- Export `getPoolStats()` already exists — wire it into health endpoint

**Why not just "set it to 50"**: With 4 services each at 20, we're at 80/100. Raising blindly could exceed Postgres max_connections. The right move is:
1. Add `max_connections=200` to Postgres command in compose (safe for Mac Studio with 512MB shared_buffers)
2. Set app pool to 30 per service (4 x 30 = 120, well under 200)
3. Instrument saturation so we see if we need more

**Files changed**:
- `lib/db/postgres.ts` — env-driven pool size + saturation logging
- `docker-compose.production.yml` — add `-c max_connections=200` to postgres command

### 2. Docker resource limits (`docker-compose.production.yml`)

**Current**: No limits on any container
**Change**: Add `deploy.resources.limits` to critical services

| Service | Memory Limit | CPU Limit | Rationale |
|---------|-------------|-----------|-----------|
| maia (sovereign) | 2GB | 2.0 | Main app, heaviest |
| maia-api | 1GB | 1.0 | API backend |
| postgres | 2GB | 2.0 | DB — needs headroom |
| maia-comms-worker | 512MB | 0.5 | Background processing |
| maia-summary-worker | 1GB | 1.0 | Uses Claude API |
| whisper | 1GB | 1.0 | CPU-bound STT |
| caddy | 256MB | 0.5 | Lightweight proxy |

**Note**: Docker Compose v2 resource limits require `deploy:` block. These are soft limits (not `--memory` hard limits) — process gets OOM-killed only if it hits the ceiling, not artificially constrained.

**Files changed**:
- `docker-compose.production.yml` — add `deploy.resources.limits` per service

---

## Phase 1B — Visibility (Rate Limiting + Trace IDs + Structured Logging)

### 3. PostgreSQL-backed rate limiting

**Current**: In-memory `Map<string, RateState>` (oracle route lines 89-120)
**Change**: Move to a `rate_limit_state` table with sliding window

New migration: `database/migrations/YYYYMMDD_rate_limit_state.sql`
```sql
CREATE TABLE IF NOT EXISTS rate_limit_state (
  key TEXT PRIMARY KEY,         -- 'oracle:ip:1.2.3.4' or 'oracle:member:uuid'
  window_start BIGINT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-cleanup: expire rows older than 2 hours
CREATE INDEX idx_rate_limit_updated ON rate_limit_state(updated_at);
```

New module: `lib/rateLimit/pgRateLimit.ts`
- `checkRateLimit(key, maxPerWindow, windowMs)` → `{ allowed: boolean, remaining: number, retryAfterMs: number }`
- Uses `INSERT ... ON CONFLICT DO UPDATE` (atomic, no race conditions)
- Periodic cleanup of expired entries (fire-and-forget, every 100 checks)

Wire into oracle route replacing in-memory map. Fallback: if DB rate limit fails, allow request (fail-open for availability).

**Files changed**:
- `database/migrations/20260328000001_rate_limit_state.sql` — new table
- `lib/rateLimit/pgRateLimit.ts` — new module
- `app/api/oracle/conversation/route.ts` — replace `rateLimitOrThrow` implementation

### 4. Request trace IDs

**Current**: Health endpoint generates `requestId` but oracle route doesn't propagate one
**Change**: Generate trace ID at request entry, pass through all logging

New module: `lib/logging/traceId.ts`
```typescript
export function generateTraceId(): string {
  return `maia_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}
```

Wire into oracle route:
- Generate at POST handler entry
- Pass to all log calls
- Include in SSE response headers as `X-Trace-ID`
- Include in error responses

**Files changed**:
- `lib/logging/traceId.ts` — new (tiny module)
- `app/api/oracle/conversation/route.ts` — generate and propagate trace ID

### 5. Structured logging for oracle pipeline

**Current**: Scattered `console.log/warn/error` with emoji prefixes
**Change**: Add a thin structured logger that outputs JSON lines

New module: `lib/logging/logger.ts`
```typescript
export function log(level: 'info' | 'warn' | 'error', tag: string, data: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    tag,
    ...data,
  };
  if (level === 'error') console.error(JSON.stringify(entry));
  else if (level === 'warn') console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}
```

**Why not Pino/Winston**: Adding a dependency for Phase 1 is unnecessary overhead. JSON-structured console output is already parseable by Docker log drivers and any log aggregator we add later. We can swap the implementation behind this interface without changing call sites.

Instrument these oracle pipeline points:
- Request received (traceId, memberId, mode, ip)
- Memory retrieval start/end (duration)
- LLM call start/end (duration, model, tokens)
- Memory store start/end (duration)
- Response sent (traceId, totalDuration, status)
- Errors (traceId, error type, context)

**Files changed**:
- `lib/logging/logger.ts` — new module
- `app/api/oracle/conversation/route.ts` — add structured log calls at key pipeline points
- `lib/db/postgres.ts` — structured slow query + pool saturation logs

---

## Phase 1C — Verification (Health + Backups)

### 6. Health endpoint upgrade (`app/api/health/route.ts`)

**Current**: Checks DB latency, tables, memory
**Add**:
- Pool stats (total/idle/waiting from `getPoolStats()`)
- Pool saturation flag (waiting > 0 = degraded)
- Service version + host ID
- Rate limit table row count (lightweight indicator of traffic)

**Files changed**:
- `app/api/health/route.ts` — add pool stats component

### 7. Backup verification

**Action**: Not a code change — a verification step.
- Check if cron is installed: `crontab -l | grep maia`
- If not, document the setup command
- Verify last backup exists and is recent
- Add backup status to health endpoint (check file age)

---

## Files Summary

| File | Action | Risk |
|------|--------|------|
| `lib/db/postgres.ts` | Edit — env-driven pool, saturation logging | Low |
| `docker-compose.production.yml` | Edit — max_connections, resource limits | Low |
| `database/migrations/20260328000001_rate_limit_state.sql` | New — rate limit table | Low |
| `lib/rateLimit/pgRateLimit.ts` | New — persistent rate limiting | Low |
| `lib/logging/traceId.ts` | New — trace ID generator | Trivial |
| `lib/logging/logger.ts` | New — structured JSON logger | Trivial |
| `app/api/oracle/conversation/route.ts` | Edit — rate limit swap, trace IDs, structured logs | Medium |
| `app/api/health/route.ts` | Edit — add pool stats | Low |

---

## What This Does NOT Change

- MAIA's voice, tone, or personality
- Continuity logic (spiral state, memory palace, anamnesis)
- Session flow or onboarding
- Any user-facing behavior
- The memory pipeline's logic (only how we observe it)
- Any AI prompt or model configuration

---

## Deployment Sequence

1. Apply migration (rate_limit_state table)
2. Deploy code changes
3. Verify health endpoint shows pool stats
4. Verify structured logs appear in `docker logs maia-sovereign`
5. Verify rate limiting works via rapid curl test
6. Check backup cron status
7. Monitor for 24h before Phase 2

---

## Phase 2 Preview (not in scope yet)

- Move `storeSessionPattern` and `storeConversationMemory` to fire-and-forget
- Add memory retrieval caching (per-member, 60s TTL)
- Circuit breaker on Anthropic API
- Sentry integration (self-hosted or cloud)
- Load testing at 600 simulated users
