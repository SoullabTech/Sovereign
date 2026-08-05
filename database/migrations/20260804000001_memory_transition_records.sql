-- Memory Transition Records — Sprint 1 (Truth Layer) accountability substrate.
--
-- Authority:
--   docs/governance/MEMORY_SELECTION_PHILOSOPHY_RULING_INSTRUMENT_2026-08-04.md
--     (staged trajectory ruled 2026-08-04 — Stage 2 observability)
--   docs/ops/MAIA_OPERATIONAL_MEMORY_STAGED_REBUILD_CHARTER_2026-08-04.md §IV
--
-- What this is: a per-turn, per-source record of the memory pathway
-- (available → retrieved → eligible → offered → injected) with the WHY as
-- sentences. An accountability layer, NOT a retrieval improvement: nothing on
-- the conversation path reads this table.
--
-- Hard rules:
--   - selection_reasons are sentences describing policy decisions — never
--     numeric rankings of memories or humans.
--   - NULL counts mean "not measured". Unknown is a valid state; never
--     backfill with guesses (injected_count in particular stays NULL until
--     injection observability exists).
--
-- Release unit: ships with the route writer (lib/maia/memoryTransitionRecord.ts,
-- same PR). The writer is failure-tolerant if this migration has not run
-- (warn + continue, conversation unaffected) — but deploy via the FULL deploy
-- path (scripts/deploy-production.sh deploy <SHA>) so migrations execute; the
-- quick deploy-maia path does NOT run migrations.

BEGIN;

CREATE TABLE IF NOT EXISTS memory_transition_records (
  id BIGSERIAL PRIMARY KEY,
  member_id UUID NOT NULL,
  session_id TEXT,
  source_type TEXT NOT NULL CHECK (
    source_type IN ('member_memory_atoms', 'conversational', 'episodic', 'developmental')
  ),
  available_count INTEGER,
  retrieved_count INTEGER,
  eligible_count INTEGER,
  offered_count INTEGER,
  injected_count INTEGER,
  selection_policy_version TEXT NOT NULL,
  selection_reasons TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_transition_records_member_time
  ON memory_transition_records (member_id, created_at DESC);

COMMENT ON TABLE memory_transition_records IS
  'Per-turn memory pathway accountability (Sprint 1 Truth Layer): what was available/retrieved/eligible/offered per source, and why — reasons as sentences, never scores. NULL = not measured; unknown is a valid state.';

COMMIT;
