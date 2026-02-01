# MAIA Development Session Report
## January 31, 2026 — Handler Architecture, Dream Persistence & Production Deployment

---

## Executive Summary

This session established the **handler layer architecture** for MAIA's API routes, implemented **dream persistence** to PostgreSQL, and deployed the changes to **production at soullab.life**. The work creates a clean separation between HTTP routing and business logic, enabling easier testing, maintenance, and future enhancements.

**Key Deliverables:**
- Handler layer architecture (Route → Handler → Service)
- Dream recording and analysis with PostgreSQL persistence
- Jungian symbol extraction system (motifs, archetypes, symbols)
- Docker deployment with migration tooling
- Production deployment via Caddy reverse proxy
- Comprehensive documentation

**Production Status:** ✅ Live at https://soullab.life

---

## Table of Contents

1. [Handler Layer Architecture](#1-handler-layer-architecture)
2. [Files Created/Modified](#2-files-createdmodified)
3. [Database Schema](#3-database-schema)
4. [API Contracts](#4-api-contracts)
5. [Symbol Extraction System](#5-symbol-extraction-system)
6. [Docker Deployment](#6-docker-deployment)
7. [Production Deployment](#7-production-deployment)
8. [Oracle System Verification](#8-oracle-system-verification)
9. [Verification Results](#9-verification-results)
10. [Incident Resolution: 503 Outage](#10-incident-resolution-503-outage)
11. [Commit History](#11-commit-history)
12. [Future Enhancements](#12-future-enhancements)
13. [Key Learnings](#13-key-learnings)
14. [Appendices](#appendices)

---

## 1. Handler Layer Architecture

### Problem Statement

MAIA's API routes were mixing HTTP concerns (request parsing, response formatting) with business logic (dream analysis, symbol extraction). This coupling made routes harder to test, maintain, and evolve.

### Solution: Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│  app/api/dreams/record/route.ts                             │
│  app/api/dreams/analyze/route.ts                            │
│  - Thin adapters only                                        │
│  - Request/response handling                                 │
│  - Lazy imports to avoid module-load issues                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Handlers                                │
│  lib/dreams/handlers/recordDream.ts                         │
│  lib/dreams/handlers/analyzeDream.ts                        │
│  - Business logic orchestration                              │
│  - Input validation (Zod schemas)                            │
│  - Symbol extraction                                         │
│  - Service coordination                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Services                                │
│  lib/dreams/services/dreamService.ts                        │
│  - Database operations                                       │
│  - Pattern tracking                                          │
│  - Data persistence                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
│  dream_entries table                                         │
│  dream_patterns table                                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Lazy Imports**: Handlers use `await import()` to load services, preventing Next.js build failures from circular dependencies or missing database connections at build time.

2. **Graceful Degradation**: If the database is unavailable, handlers return extracted data with `saved: false` rather than failing entirely. This ensures users always get immediate feedback.

3. **Zod Validation**: All inputs are validated at the handler layer using Zod schemas, ensuring type safety and clear error messages.

4. **Separation of Concerns**: Routes handle HTTP, handlers orchestrate logic, services manage persistence.

---

## 2. Files Created/Modified

### New Files

| File | Purpose | Lines |
|------|---------|-------|
| `lib/dreams/handlers/recordDream.ts` | Dream recording business logic | 70 |
| `lib/dreams/handlers/analyzeDream.ts` | Dream analysis with Jungian insights | 111 |
| `lib/dreams/handlers/symbolExtract.ts` | Symbol/motif/archetype extraction | ~150 |
| `lib/dreams/handlers/types.ts` | Zod schemas for input validation | ~50 |
| `lib/dreams/handlers/index.ts` | Barrel export | 5 |
| `lib/dreams/services/dreamService.ts` | PostgreSQL persistence layer | ~200 |
| `database/migrations/20260131000001_create_dream_journal_tables.sql` | Dream tables migration | 120 |
| `scripts/db-migrate-docker.sh` | Docker migration runner | 60 |
| `docs/DEPLOYMENT.md` | Deployment guide for team | 300+ |
| `docs/SESSION-REPORT-2026-01-31.md` | This document | 600+ |

### Modified Files

| File | Change |
|------|--------|
| `app/api/dreams/record/route.ts` | Converted to thin adapter with lazy import |
| `app/api/dreams/analyze/route.ts` | Converted to thin adapter with lazy import |
| `package.json` | Added `db:migrate:docker` script |
| `/Users/soullab/MAIA-SOVEREIGN/Caddyfile` | Updated upstream to `maia-sovereign:3000` |

---

## 3. Database Schema

### dream_entries Table

```sql
CREATE TABLE dream_entries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               TEXT NOT NULL,
  title                 TEXT,
  dream_text            TEXT NOT NULL,
  occurred_at           TIMESTAMPTZ DEFAULT now(),
  symbols               TEXT[],
  motifs                TEXT[],
  archetypes            TEXT[],
  tags                  TEXT[],
  is_favorite           BOOLEAN DEFAULT false,
  lucidity_level        INTEGER CHECK (lucidity_level >= 0 AND lucidity_level <= 5),
  emotional_tone        TEXT,
  analysis              JSONB,
  analysis_generated_at TIMESTAMPTZ,
  episode_id            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
| Index | Type | Purpose |
|-------|------|---------|
| `idx_dream_entries_user_id` | B-tree | Fast user lookups |
| `idx_dream_entries_occurred_at` | B-tree (composite) | Chronological queries by user |
| `idx_dream_entries_symbols` | GIN | Full-text symbol search |
| `idx_dream_entries_archetypes` | GIN | Archetype filtering |
| `idx_dream_entries_tags` | GIN | Tag filtering |

### dream_patterns Table

```sql
CREATE TABLE dream_patterns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,
  pattern_type    TEXT NOT NULL,  -- 'symbol', 'motif', 'archetype'
  pattern_value   TEXT NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  first_seen      TIMESTAMPTZ DEFAULT now(),
  last_seen       TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pattern_type, pattern_value)
);
```

**Purpose:** Tracks recurring patterns across a user's dreams over time, enabling pattern analysis and trend detection.

---

## 4. API Contracts

### POST /api/dreams/record

Records a dream entry with automatic symbol extraction and persistence.

**Request:**
```json
{
  "dreamText": "I was flying over mountains with eagles",
  "userId": "user-123",
  "title": "Mountain Flight",
  "tags": ["lucid", "nature"],
  "occurredAt": "2026-01-31T08:00:00Z"
}
```

**Response (success):**
```json
{
  "ok": true,
  "saved": true,
  "dream": {
    "id": "c527d9cb-1048-4276-8fbd-9f325ef10d7d",
    "userId": "user-123",
    "title": "Mountain Flight",
    "tags": ["lucid", "nature"],
    "occurredAt": "2026-01-31T08:00:00Z",
    "length": 42,
    "symbolPreview": ["flying", "mountains", "eagles"],
    "motifs": ["flight", "earth"],
    "archetypes": []
  }
}
```

**Response (database unavailable):**
```json
{
  "ok": true,
  "saved": false,
  "note": "Dream analyzed but not persisted (database unavailable)",
  "dream": {
    "userId": "user-123",
    "title": "Mountain Flight",
    "tags": ["lucid", "nature"],
    "occurredAt": "2026-01-31T08:00:00Z",
    "length": 42,
    "symbolPreview": ["flying", "mountains", "eagles"],
    "motifs": ["flight", "earth"],
    "archetypes": []
  }
}
```

### POST /api/dreams/analyze

Analyzes a dream and returns Jungian-informed insights. Optionally stores analysis if `dreamId` is provided.

**Request:**
```json
{
  "dreamText": "I was chased by a shadow figure through a dark forest",
  "userId": "user-123",
  "dreamId": "c527d9cb-1048-4276-8fbd-9f325ef10d7d"
}
```

**Response:**
```json
{
  "ok": true,
  "analysis": {
    "summary": "Dominant motifs: pursuit, darkness. Archetypal presences: The Shadow. The dream is emphasizing process over explanation—watch what repeats.",
    "symbols": [
      {"term": "shadow", "count": 1},
      {"term": "figure", "count": 1},
      {"term": "dark", "count": 1},
      {"term": "forest", "count": 1}
    ],
    "motifs": ["pursuit", "darkness"],
    "archetypes": ["The Shadow"],
    "inquiries": [
      "Where in waking life does this feeling show up first—in body, relationship, or work?",
      "What part of the dream felt most \"charged,\" even if it seemed minor?",
      "If one symbol could speak one sentence, what would it say?",
      "What are you running from—or toward—in your waking life?"
    ],
    "practices": [
      "Write a 6-line dream poem: one line per scene shift.",
      "Name the \"threshold moment\" in the dream—what changed right before it?",
      "Pick one symbol and embody it for 30 seconds (posture + breath).",
      "Dialogue with the shadow figure: ask what it protects, what it needs."
    ]
  },
  "stored": true,
  "meta": {
    "userId": "user-123",
    "dreamId": "c527d9cb-1048-4276-8fbd-9f325ef10d7d",
    "title": null,
    "tags": []
  }
}
```

---

## 5. Symbol Extraction System

The `symbolExtract.ts` module provides Jungian-informed dream analysis through three extraction mechanisms:

### Symbol Detection
- Tokenizes dream text and filters stopwords
- Counts frequency to identify prominent symbols
- Returns top symbols sorted by occurrence
- Preserves original casing for proper nouns

### Motif Recognition

Detects 15+ universal dream motifs with keyword matching:

| Motif | Trigger Keywords |
|-------|------------------|
| pursuit | chased, running, fleeing, escape, hunting |
| water | ocean, river, swimming, drowning, rain, flood |
| flight | flying, soaring, falling, floating, wings |
| house | room, door, window, building, home, stairs |
| death-rebirth | dying, death, resurrection, ending, born |
| transformation | changing, metamorphosis, becoming, shifting |
| threshold | door, gate, bridge, crossing, portal, entrance |
| darkness | dark, shadow, night, black, void |
| light | bright, sun, glow, illumination, radiant |
| animals | dog, cat, bird, snake, wolf, horse |
| vehicles | car, train, plane, boat, driving |
| nakedness | naked, exposed, vulnerable, undressed |
| examination | test, exam, school, unprepared, late |
| teeth | teeth, falling out, crumbling, losing |
| evaluation | test, judgment, performance, assessment |

### Archetype Identification

Recognizes 8 Jungian archetypes with contextual triggers:

| Archetype | Triggers |
|-----------|----------|
| The Shadow | shadow, dark figure, pursuer, enemy, monster |
| The Anima/Animus | mysterious woman/man, lover, guide, muse |
| The Hero | hero, warrior, champion, savior, quest |
| The Wise Old Man | old man, sage, mentor, teacher, wizard |
| The Great Mother | mother, goddess, nurturing figure, earth |
| The Child | child, baby, innocent, playful, wonder |
| The Trickster | trickster, joker, shapeshifter, chaos |
| The Self | mandala, circle, wholeness, integration, center |

### Contextual Inquiry Generation

Based on detected motifs, the system generates relevant reflective questions:

```typescript
if (motifs.includes('pursuit')) {
  inquiries.push('What are you running from—or toward—in your waking life?');
}
if (motifs.includes('water')) {
  inquiries.push('What emotions have been rising or flooding in lately?');
}
```

### Practice Recommendations

Based on detected archetypes, specific practices are suggested:

```typescript
if (archetypes.includes('The Shadow')) {
  practices.push('Dialogue with the shadow figure: ask what it protects, what it needs.');
}
if (archetypes.includes('The Hero')) {
  practices.push('Identify the quest: what are you being called to confront or achieve?');
}
```

---

## 6. Docker Deployment

### Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                            │
│              (maia-sovereign_maia-network)                  │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  maia-sovereign  │───▶│  maia-postgres   │              │
│  │  (Next.js app)   │    │  (PostgreSQL 17) │              │
│  │  Port 3000       │    │  Port 5432       │              │
│  │  Status: Healthy │    │  Status: Healthy │              │
│  └──────────────────┘    └──────────────────┘              │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │   maia-caddy     │                                       │
│  │  (Reverse Proxy) │                                       │
│  │  Ports 80, 443   │                                       │
│  └──────────────────┘                                       │
│           │                                                  │
└───────────┼─────────────────────────────────────────────────┘
            │
            ▼
      Internet → soullab.life
```

### Container Status (Post-Deployment)

| Container | Image | Status | Ports |
|-----------|-------|--------|-------|
| maia-sovereign | quizzical-payne-maia | Healthy | 3000 |
| maia-postgres | postgres:17 | Healthy | 5432 |
| maia-caddy | caddy:2 | Running | 80, 443 |

### Migration Script

New npm script for Docker migrations:

```bash
# Apply all migrations to Docker PostgreSQL
npm run db:migrate:docker

# Apply specific migration
npm run db:migrate:docker -- 20260131000001_create_dream_journal_tables.sql
```

**Script features:**
- Auto-detects container name (`maia-postgres`)
- Applies migrations in sorted order
- Colored output for success/failure
- Stops on first failure to prevent cascade errors

---

## 7. Production Deployment

### Caddy Reverse Proxy Configuration

The production site uses Caddy as a reverse proxy with automatic HTTPS via Let's Encrypt.

**Key Configuration:**
```caddy
soullab.life {
    # Streaming endpoints (voice, etc.)
    @streaming {
        path /api/voice/stream-conversation
        path /api/*/stream*
    }
    handle @streaming {
        reverse_proxy maia-sovereign:3000 {
            flush_interval -1
        }
    }

    # All other requests
    reverse_proxy maia-sovereign:3000
}
```

**Updated Upstream:**
- Before: `reverse_proxy maia:3000`
- After: `reverse_proxy maia-sovereign:3000`

### Deployment Commands

```bash
# Navigate to project
cd /Users/soullab/.claude-worktrees/MAIA-SOVEREIGN/quizzical-payne

# Build the image
docker compose build maia

# Start containers
docker compose --env-file .env.production up -d

# Apply migrations to Docker PostgreSQL
npm run db:migrate:docker

# Reload Caddy (if config changed)
docker exec maia-caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## 8. Oracle System Verification

Confirmed all three oracle cards on `/oracle` are properly connected to their ritual pages:

| Oracle | Route | Page | Status |
|--------|-------|------|--------|
| I Ching | `/oracle/iching` | `app/oracle/iching/page.tsx` | ✅ Connected |
| Tarot | `/oracle/tarot` | `app/oracle/tarot/page.tsx` | ✅ Connected |
| Runes | `/oracle/runes` | `app/oracle/runes/page.tsx` | ✅ Connected |

Each oracle page provides:
- Cosmic chamber aesthetic with variant-specific theming
- Ritual shell wrapper for consistent experience
- Interactive divination mechanics
- Symbol-first, meaning-second approach
- Integration prompts and practices

### Oracle Themes

| Oracle | Accent | Atmosphere |
|--------|--------|------------|
| I Ching | Indigo/Cyan | Crystalline, electric-still |
| Tarot | Amber/Rose | Candlelight, velvet, mythic |
| Runes | Emerald/Teal | Stone, moss, iron |

---

## 9. Verification Results

### Local Development (port 3003)

```bash
$ curl -X POST http://localhost:3003/api/dreams/record \
  -H "Content-Type: application/json" \
  -d '{"dreamText": "flying over mountains", "userId": "test-user"}'

{"ok":true,"saved":true,"dream":{"id":"c527d9cb-...","userId":"test-user",...}}
```

### Docker Container (port 3000)

```bash
$ curl -X POST http://localhost:3000/api/dreams/record \
  -H "Content-Type: application/json" \
  -d '{"dreamText": "swimming in ocean", "userId": "docker-test"}'

{"ok":true,"saved":true,"dream":{"id":"c6b43d74-...","userId":"docker-test",...}}
```

### Production (soullab.life)

```bash
$ curl -X POST https://soullab.life/api/dreams/record \
  -H "Content-Type: application/json" \
  -d '{"dreamText": "Production test dream", "userId": "prod-test"}'

{"ok":true,"saved":true,"dream":{"id":"72787b99-...","userId":"prod-test",...}}
```

### Database Verification

```bash
$ docker exec maia-postgres psql -U soullab -d maia_consciousness -c "\dt"

             List of relations
 Schema |      Name      | Type  |  Owner
--------+----------------+-------+---------
 public | dream_entries  | table | soullab
 public | dream_patterns | table | soullab
```

---

## 10. Incident Resolution: 503 Outage

### Incident Summary

During deployment, soullab.life returned **503 Service Unavailable**.

### Root Cause

The Caddy reverse proxy was configured to forward requests to `maia:3000`, but:
- The `maia` container had exited
- The new `maia-sovereign` container was running on port 3000
- Caddy couldn't reach the exited container, resulting in 503

### Container State During Outage

| Container | Status | Port |
|-----------|--------|------|
| maia | **Exited** | - |
| maia-sovereign | Healthy | 3000 |
| maia-caddy | Running | 80, 443 |

### Resolution Steps

1. **Identified** the upstream mismatch via `docker ps`
2. **Attempted** to start `maia` but port 3000 was already bound
3. **Updated** Caddyfile to proxy to `maia-sovereign:3000`
4. **Connected** `maia-sovereign` to Caddy's Docker network
5. **Restarted** Caddy to refresh the mounted config file
6. **Reloaded** Caddy configuration
7. **Verified** site returned 200

### Key Fix

```bash
# Update Caddyfile (host file, mounted into container)
# Changed: reverse_proxy maia:3000 → reverse_proxy maia-sovereign:3000

# Restart to refresh mount
docker restart maia-caddy

# Reload configuration
docker exec maia-caddy caddy reload --config /etc/caddy/Caddyfile
```

### Lesson Learned

The Caddyfile was bind-mounted from the host. Changes to the host file weren't immediately visible in the container due to file system caching. A container restart was required to refresh the mount before the config reload would work.

---

## 11. Commit History

```
8754b91f feat: Add handler layer architecture and dream persistence
├── Created lib/dreams/handlers/ with recordDream, analyzeDream, symbolExtract
├── Created lib/dreams/services/dreamService.ts for PostgreSQL persistence
├── Added database migration for dream_entries and dream_patterns tables
├── Converted API routes to thin adapters with lazy imports
└── Added graceful degradation when database unavailable

066d1285 feat: Update Oracle sub-pages with cosmic chamber aesthetic
7edf2ab0 fix: Use double quotes for strings with apostrophes
058339f7 feat: Elegant Oracle chamber redesign with Soullab aesthetics
de25d8c7 refactor: Redesign Oracle page with elegant Soullab aesthetics
```

---

## 12. Future Enhancements

### Immediate Next Steps

1. **Pattern Tracking UI** — Display recurring symbols/motifs in dream journal
2. **Dream Search** — Full-text search using PostgreSQL GIN indexes
3. **Analysis History** — Show previous analyses for a dream
4. **Dream Timeline** — Visualize dreams over time with pattern overlays

### Architectural Evolution

1. **Event Sourcing** — Track dream edits as events for audit trail
2. **AI Integration** — Connect to MAIA's DeepSeek for deeper semantic analysis
3. **Cross-Domain Correlation** — Link dreams to oracle readings and journal entries
4. **Embedding Generation** — Vector embeddings for semantic dream similarity

### Testing

1. **Unit tests** for handlers using Jest
2. **Integration tests** for database operations
3. **E2E tests** for full dream recording flow
4. **Load testing** for production readiness

### Infrastructure

1. **Standardize container naming** — Decide on `maia` vs `maia-sovereign`
2. **Health check endpoints** — Add `/api/health/db` for database status
3. **Monitoring** — Add logging and alerting for production issues

---

## 13. Key Learnings

### Lazy Imports are Essential

Next.js builds fail when server-only modules are imported at the top level. Using `await import()` inside handlers solves this elegantly:

```typescript
// ❌ Fails during build
import { dreamService } from '@/lib/dreams/services/dreamService';

// ✅ Works - loaded at runtime only
const { dreamService } = await import('@/lib/dreams/services/dreamService');
```

### Graceful Degradation Improves UX

Returning extracted data even when the database fails means users always get immediate feedback:

```typescript
if (!savedDream) {
  return {
    ok: true,
    saved: false,  // ← Indicates persistence failed
    note: 'Dream analyzed but not persisted',
    dream: { /* extracted data still returned */ }
  };
}
```

### Docker Network Isolation

The containerized PostgreSQL is separate from the host PostgreSQL. Migrations must be applied to each environment independently:

```bash
# Host PostgreSQL
psql -U soullab -d maia_consciousness -f migration.sql

# Docker PostgreSQL
cat migration.sql | docker exec -i maia-postgres psql -U soullab -d maia_consciousness
```

### Bind Mount Caching

When files are bind-mounted into Docker containers, the container may cache the file state. Container restart is sometimes required before `caddy reload` can see changes.

### Handler Layer Benefits

| Benefit | Explanation |
|---------|-------------|
| **Testability** | Handlers can be unit tested without HTTP overhead |
| **Reusability** | Same handler can serve REST, GraphQL, or WebSocket |
| **Maintainability** | Business logic changes don't touch routing |
| **Debuggability** | Clear separation makes issues easier to isolate |

---

## Appendix A: File Locations

```
lib/dreams/
├── handlers/
│   ├── index.ts              # Barrel export
│   ├── recordDream.ts        # Dream recording handler
│   ├── analyzeDream.ts       # Dream analysis handler
│   ├── symbolExtract.ts      # Symbol/motif extraction
│   └── types.ts              # Zod schemas
└── services/
    └── dreamService.ts       # PostgreSQL operations

app/api/dreams/
├── record/route.ts           # POST /api/dreams/record
├── analyze/route.ts          # POST /api/dreams/analyze
├── retrieve/route.ts         # GET /api/dreams/retrieve (legacy)
└── correlations/route.ts     # GET /api/dreams/correlations (legacy)

app/oracle/
├── page.tsx                  # Oracle hub
├── iching/page.tsx           # I Ching ritual
├── tarot/page.tsx            # Tarot ritual
└── runes/page.tsx            # Runes ritual

components/oracle/ritual/
└── OracleRitualParts.tsx     # Shared ritual components

database/migrations/
└── 20260131000001_create_dream_journal_tables.sql

scripts/
└── db-migrate-docker.sh      # Docker migration runner

docs/
├── DEPLOYMENT.md             # Docker deployment guide
└── SESSION-REPORT-2026-01-31.md  # This document
```

---

## Appendix B: Environment Variables

Required for Docker deployment:

```env
# Database
DATABASE_URL=postgresql://soullab:password@postgres:5432/maia_consciousness

# Core
NODE_ENV=production
PORT=3000

# Security (generate with openssl rand -hex 32)
JWT_SECRET=<64-char-hex>
MAIA_AUDIT_FINGERPRINT_SECRET=<32-char-hex>

# Sovereignty
SOVEREIGNTY_MODE=true
FORCE_LOCAL_EMBEDDINGS=true
ORCHESTRATOR=spiralogic
```

---

## Appendix C: Useful Commands

### Docker Operations

```bash
# View all containers
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View container logs
docker logs -f maia-sovereign

# Shell into container
docker exec -it maia-sovereign sh

# Apply migrations
npm run db:migrate:docker
```

### Caddy Operations

```bash
# Reload configuration
docker exec maia-caddy caddy reload --config /etc/caddy/Caddyfile

# Test upstream connectivity
docker exec maia-caddy curl -s http://maia-sovereign:3000/api/health

# View Caddy logs
docker logs -f maia-caddy
```

### Database Operations

```bash
# Connect to Docker PostgreSQL
docker exec -it maia-postgres psql -U soullab -d maia_consciousness

# List tables
\dt

# Describe table
\d dream_entries

# Query dreams
SELECT id, user_id, created_at FROM dream_entries ORDER BY created_at DESC LIMIT 5;
```

### Testing Endpoints

```bash
# Record a dream
curl -X POST https://soullab.life/api/dreams/record \
  -H "Content-Type: application/json" \
  -d '{"dreamText": "test dream", "userId": "test"}'

# Analyze a dream
curl -X POST https://soullab.life/api/dreams/analyze \
  -H "Content-Type: application/json" \
  -d '{"dreamText": "I was flying", "userId": "test"}'
```

---

## Appendix D: Architecture Decision Records

### ADR-001: Lazy Imports for Database Services

**Context:** Next.js builds the entire application at build time, including API routes. If a route imports a database service at the top level, and that service initializes a database connection, the build fails because the database isn't available during build.

**Decision:** Use `await import()` inside handler functions to lazy-load services only when the route is invoked at runtime.

**Consequences:**
- ✅ Builds succeed without database
- ✅ First request has minor import overhead
- ⚠️ Type inference is slightly more complex

### ADR-002: Graceful Degradation on Database Failure

**Context:** Users should receive immediate feedback even if persistence fails temporarily.

**Decision:** Return `{ ok: true, saved: false }` with extracted data when database is unavailable.

**Consequences:**
- ✅ User always sees their dream analyzed
- ✅ UI can show warning about persistence
- ⚠️ Data may be lost if user navigates away

### ADR-003: PostgreSQL Arrays for Symbol Storage

**Context:** Dreams have multiple symbols, motifs, and archetypes.

**Decision:** Use PostgreSQL `TEXT[]` arrays with GIN indexes.

**Consequences:**
- ✅ Fast containment queries (`@>` operator)
- ✅ No join tables needed
- ⚠️ Array elements can't have their own metadata

---

*Document generated: January 31, 2026*
*Session duration: ~4 hours*
*Branch: oracle-redesign*
*Production URL: https://soullab.life*
