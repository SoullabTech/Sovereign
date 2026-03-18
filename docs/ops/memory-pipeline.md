# MAIA Memory Pipeline — Production Operations

## Overview

The memory pipeline converts raw conversation turns into structured session remembrances that MAIA uses for cross-session continuity.

```
conversation → turns written → session closed → queue enqueued → worker processes → summary stored
```

All steps must function for MAIA to remember across sessions.

---

## Quick Health Check

Run any time to see the state of the pipeline:

```bash
docker exec -i maia-postgres psql -U soullab maia_consciousness < scripts/memory-health.sql
```

What you're looking for:
- `completed_with_summary` should grow after each session
- `queue failures` should be 0
- `stale active member sessions` should be 0 (sweeper handles this)

---

## Services

### `maia-summary-worker`
The always-on container that processes `session_summary_queue` in a loop.

```bash
# Check if it's running
docker ps --format "{{.Names}}\t{{.Status}}" | grep summary

# View recent logs
docker logs maia-summary-worker --tail=50

# Restart if crashed
docker compose -f docker-compose.production.yml up -d maia-summary-worker
```

### Summary Worker Startup (includes DB guard)
The worker logs the DB it's connected to on start:
```
[DB Guard] Connected: maia_consciousness @ 172.18.0.x:5432
[DB Guard] ✅ DB verified: maia_consciousness @ 172.18.0.x:5432
[Summary] MAIA Session Summary Worker starting...
```
If you see `[DB Guard] ❌ REFUSING TO RUN`, the DATABASE_URL is wrong.

---

## Sweeper — Closing Stale Sessions

Sessions left open (tab closed, app crash) never get enqueued without this.

### Run manually
```bash
# Dry run first — shows what would be closed without touching anything
docker exec maia-sovereign npx ts-node scripts/sweep-stale-sessions.ts --dry-run

# Run for real (default threshold: 2 hours)
docker exec maia-sovereign npx ts-node scripts/sweep-stale-sessions.ts

# Custom threshold
docker exec maia-sovereign npx ts-node scripts/sweep-stale-sessions.ts --threshold=4h
```

### Add to cron (on Mac Studio host)
Run every 15 minutes:

```bash
# Edit crontab
crontab -e

# Add this line:
*/15 * * * * docker exec maia-sovereign npx ts-node /app/scripts/sweep-stale-sessions.ts >> /var/log/maia-sweeper.log 2>&1
```

### Safety guarantees (built into sweeper)
- ✅ Sanctuary sessions NEVER touched (`mode IS NULL OR mode = 'continuity'`)
- ✅ Anonymous sessions NEVER enqueued (`member_id IS NOT NULL`)
- ✅ Sessions with < 2 turns NEVER enqueued (saves wasted worker jobs)
- ✅ Idempotent — `ON CONFLICT (session_id) DO NOTHING`
- ✅ DB guard on startup — refuses to run against wrong database
- ✅ Paranoid abort if sanctuary sessions somehow appear in result set

---

## Backfill — Legacy Sessions

For sessions that predate the turn-writing pipeline (turns in `maia_turns`, not `conversation_turns`):

```bash
# Dry run
docker exec maia-sovereign npx ts-node scripts/backfill-maia-turns-summaries.ts --dry-run

# Run for real (rate-limited to 1 summary per 2 seconds)
docker exec maia-sovereign npx ts-node scripts/backfill-maia-turns-summaries.ts

# Limit to N sessions
docker exec maia-sovereign npx ts-node scripts/backfill-maia-turns-summaries.ts --limit=10
```

> **Note**: As of March 2026, only 1 recoverable legacy session existed (`session_1772375617639`). 41 other completed sessions with no summary have 0 turns in all tables — they cannot be summarized.

---

## DB Safety Guard

Every script that writes summaries includes a startup check:

```
[DB Guard] Connected: maia_consciousness @ 172.18.0.x:5432
[DB Guard] ✅ DB verified: maia_consciousness @ 172.18.0.x:5432
```

If running from the host accidentally points at localhost postgres, the script refuses:
```
[DB Guard] ❌ REFUSING TO RUN: connected to localhost postgres.
[DB Guard]    To run from host against dev postgres, pass --allow-localhost.
[DB Guard]    To run against production, exec into the container.
```

Override for local dev: `--allow-localhost`

---

## What "0 summaries" actually means

If you query `SELECT COUNT(*) FROM maia_sessions WHERE summary IS NOT NULL` and get 0 (or fewer than expected), the most common causes in order:

1. **Counting all sessions including active ones** — active sessions are never summarized. Filter: `WHERE status = 'completed' AND mode = 'continuity'`

2. **Worker not running** — `docker ps | grep summary` should show `(healthy)`

3. **Worker connected to wrong DB** — check `[DB Guard]` lines in worker logs

4. **Sessions never closed** — run the sweeper with `--dry-run` to check

5. **Sessions truly empty** — 0 turns in `conversation_turns`. Check with:
   ```sql
   SELECT COUNT(*) FROM conversation_turns WHERE session_id = 'your-session-id';
   ```

---

## Verified State (2026-03-01)

```
completed continuity sessions: 69
  with summary:                28  (40% — limited by pre-pipeline data gaps)
  without summary:             41  (confirmed 0 turns in all tables — historical shells)

queue:                         69 done, 0 failed
worker:                        healthy, polling
stale active member sessions:  0
```

---

## Recommended Monitoring Query

```sql
-- Run weekly to spot-check
SELECT
  status,
  COUNT(*) AS sessions,
  COUNT(summary) AS with_summary
FROM maia_sessions
WHERE mode = 'continuity'
GROUP BY status;

-- Queue health
SELECT status, COUNT(*), MAX(attempts) FROM session_summary_queue GROUP BY status;

-- Recent failures (should be empty)
SELECT session_id, last_error, finished_at
FROM session_summary_queue
WHERE status = 'failed'
ORDER BY finished_at DESC LIMIT 5;
```
