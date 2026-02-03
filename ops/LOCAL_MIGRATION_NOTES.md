# Local migration notes

## Status: RESOLVED (2026-01-23)

All migrations now pass. 161 total migrations applied.

## Fixes applied this session

1. **Created `conversation_memory_uses` table** (`20260113000003b_conversation_memory_uses.sql`)
   - Table was referenced but never created

2. **Fixed column name `pc.last_session` → `pc.last_session_at`** in:
   - `20260121_between_session_container.sql` (line 221)
   - `20260122_comms_spine_views.sql` (line 227)

3. **Fixed migration ordering** for `comms_worker_identity.sql`:
   - Renamed from `20260121_*` to `20260122_*` to run after `comms_analysis_queue.sql`

4. **Created `agent_runs` table** (added CREATE TABLE IF NOT EXISTS to `20260122000002_fix_agent_runs_schema.sql`)
   - Migration expected table to exist but it didn't

## Previous bypass (now resolved)

- `022_maia_training_tables.sql` was manually marked as applied - tables/views already existed
- This is now harmless as the actual objects exist

## One-command local boot

```bash
./scripts/local-prod-up.sh
```
