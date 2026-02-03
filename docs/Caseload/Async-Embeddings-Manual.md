# Async Embeddings Manual

*(Operator + Developer Guide)*

## Purpose

This system enables **fast note saves** and **sovereign semantic memory** by moving embedding generation off the request path:

* Notes and memory chunks are **stored immediately**
* Embedding jobs are **queued in Postgres**
* A local worker generates embeddings via **Ollama** and updates chunks asynchronously
* UI shows a **live backlog badge** so you can see system health at a glance

This avoids slow UX, prevents timeouts, and preserves sovereignty (no cloud embeddings).

---

## Components Overview

### Database

* `case_memory_chunks`
  Stores chunked text for a case, plus optional `embedding vector(768)` and embed metadata.
* `embedding_jobs`
  A lightweight queue table tracking pending/processing/done/error jobs.

### Services / Scripts

* `lib/caseload/CaseMemoryService.ts`
  Inserts chunks; in queue mode, inserts without embeddings and enqueues jobs.
* `lib/ai/localEmbeddingClient.ts`
  Calls Ollama embeddings endpoint.
* `lib/ai/EmbeddingQueueService.ts`
  Enqueue + claim + mark done/error + backlog count.
* `scripts/embedding_worker.ts`
  Background worker loop: claim job → embed → update chunk → mark done.
* `scripts/backfill_case_memory_notes.ts`
  One-time ingestion of older `case_notes` into `case_memory_chunks` (queue mode supported).

### API + UI

* `app/api/embeddings/backlog/route.ts`
  Returns `{ ok: true, pending: N }` (or expanded status counts if you extend it).
* `components/caseload/CaseMemoryPanel.tsx`
  Polls backlog and shows badge:

  * Green `⏳ 0` = healthy
  * Amber pulsing `⏳ N` = jobs pending

---

## Data Flow

### Normal note save (queue mode)

1. Practitioner saves note
2. `CaseMemoryService.ingestText()`:

   * chunks text
   * inserts chunks into `case_memory_chunks` **without embedding**
   * enqueues one row per chunk into `embedding_jobs` (status = `pending`)
3. Worker picks up jobs:

   * calls Ollama embeddings (`nomic-embed-text`)
   * updates `case_memory_chunks.embedding`
   * marks job `done`
4. UI backlog badge decreases to zero

### Semantic search

* Only chunks with embeddings participate in vector similarity.
* As queue drains, semantic search becomes increasingly effective.

---

## Requirements

### Postgres

* Running locally or on your node
* `pgvector` installed and enabled
* `case_memory_chunks.embedding` is `vector(768)` (matches `nomic-embed-text`)

### Ollama

* Running at `http://localhost:11434` (default)
* Embedding model available: `nomic-embed-text`

---

## Environment Variables

Set in `.env.local` (and in production env config as needed):

```bash
# Mode: sync | queue | none
MAIA_EMBEDDINGS_MODE=queue

# DB (worker and server must both have correct DB access)
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness

# Ollama embeddings
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBED_MODEL=nomic-embed-text

# Optional worker controls
EMBEDDING_MAX_ATTEMPTS=5
```

### Modes explained

* `sync`
  Inserts chunks *with embeddings* in the request path (slower UX).
* `queue`
  Inserts chunks immediately, enqueues jobs (recommended).
* `none`
  Stores chunks without embeddings and does not enqueue jobs (semantic search won't work).

---

## Database Setup

### Migration: embedding_jobs

**File:** `database/migrations/20260107000003_embedding_jobs.sql`

Ensures:

* `embedding_jobs` table exists
* indexes for performance
* optional uniqueness protection for pending/processing duplicates

Apply:

```bash
psql "postgresql://soullab@localhost:5432/maia_consciousness" \
  -f database/migrations/20260107000003_embedding_jobs.sql
```

---

## Running the Worker

### Run interactively (foreground)

```bash
DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" \
MAIA_EMBEDDINGS_MODE=queue \
npx tsx scripts/embedding_worker.ts
```

### Run in background (dev)

Use your preferred process manager (recommended):

* `pm2`
* `forever`
* `systemd` on Linux nodes
* `supervisord`

Example (pm2):

```bash
pm2 start "npx tsx scripts/embedding_worker.ts" --name maia-embed-worker
pm2 logs maia-embed-worker
```

---

## Backfilling Existing Notes

When you already have `case_notes` but no memory chunks/embeddings, run:

### Dry run first

```bash
DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" \
npx tsx scripts/backfill_case_memory_notes.ts --dry-run
```

### Run (queue mode)

```bash
DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" \
MAIA_EMBEDDINGS_MODE=queue \
npx tsx scripts/backfill_case_memory_notes.ts --limit=200
```

### Force re-ingest (if needed)

```bash
DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" \
MAIA_EMBEDDINGS_MODE=queue \
npx tsx scripts/backfill_case_memory_notes.ts --limit=50 --force
```

---

## Monitoring & Validation

### Backlog API

```bash
curl -s http://localhost:3000/api/embeddings/backlog | cat
# {"ok":true,"pending":0}
```

### Queue status (DB)

```bash
psql "postgresql://soullab@localhost:5432/maia_consciousness" -c "
SELECT status, count(*)
FROM embedding_jobs
GROUP BY 1
ORDER BY 1;
"
```

### Embedding coverage (DB)

```bash
psql "postgresql://soullab@localhost:5432/maia_consciousness" -c "
SELECT
  count(*) AS total_chunks,
  count(*) FILTER (WHERE embedding IS NOT NULL) AS embedded_chunks
FROM case_memory_chunks;
"
```

### UX validation checklist

* Create a note → it saves fast (no embedding delay)
* Pending backlog rises (worker stopped)
* Start worker → backlog drains
* Badge reflects pending count, then returns to green `⏳ 0`

---

## Failure Modes & Fixes

### 1) "database 'soullab' does not exist"

Cause: `psql -c ...` does not use `DATABASE_URL` unless passed explicitly.

Fix:

```bash
export DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness"
psql "$DATABASE_URL" -c "SELECT current_database();"
```

### 2) Backlog stays high and never drains

Likely causes:

* Worker not running
* Worker using wrong `DATABASE_URL`
* Ollama not running / model missing
* Jobs stuck in `processing` due to worker crash

Fix checks:

* Worker logs show "started"
* `curl http://localhost:11434/api/tags` (or Ollama CLI) confirms service
* DB shows jobs moving pending → done

### 3) Jobs stuck in `processing`

You can add a requeue script later, but immediate manual reset:

```sql
UPDATE embedding_jobs
SET status='pending', locked_at=NULL
WHERE status='processing'
  AND locked_at < now() - interval '10 minutes';
```

### 4) Semantic search returns weak results after backfill

Expected until embeddings complete. Confirm embedded coverage increasing.

---

## Performance Notes

* Queue mode is optimized for UX: inserts are fast; embeddings happen out-of-band.
* You can tune worker throughput by:

  * running multiple workers (safe with `SKIP LOCKED`)
  * adding a short "batch claim" strategy (future enhancement)

---

## Security & Privacy

* Embeddings are generated locally via Ollama.
* No raw note content leaves your node.
* Access to backlog endpoint can be gated (optional) if you expose it beyond trusted networks.

---

## Operational Best Practices

* Always run a worker in production (systemd/pm2).
* Monitor:

  * pending backlog (should trend to 0)
  * error count (should be 0)
* Add alerting later (Grafana/Prometheus) if desired.

---

## Reference Files

* `database/migrations/20260107000003_embedding_jobs.sql`
* `lib/ai/localEmbeddingClient.ts`
* `lib/ai/EmbeddingQueueService.ts`
* `lib/caseload/CaseMemoryService.ts`
* `scripts/embedding_worker.ts`
* `scripts/backfill_case_memory_notes.ts`
* `app/api/embeddings/backlog/route.ts`
* `components/caseload/CaseMemoryPanel.tsx`
