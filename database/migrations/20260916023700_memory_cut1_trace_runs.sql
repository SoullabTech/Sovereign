-- TEMPORAL-MEMORY-CUT1-TRACEABILITY-01 · I0
-- Traceability is the instrument for future reconciliation, not the reconciliation itself.

BEGIN;

CREATE TABLE memory_cut1_trace_runs (
  retrieval_id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  policy_key TEXT NOT NULL,
  cutoff SMALLINT NOT NULL,
  eligible_count INTEGER NOT NULL,
  live_top JSONB NOT NULL,
  neutral_top JSONB NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT memory_cut1_trace_runs_policy_key_check
    CHECK (policy_key = 'developmental_nonvector_decay_v1'),
  CONSTRAINT memory_cut1_trace_runs_cutoff_check
    CHECK (cutoff = 12),
  CONSTRAINT memory_cut1_trace_runs_eligible_count_check
    CHECK (eligible_count >= 1),
  CONSTRAINT memory_cut1_trace_runs_live_top_array_check
    CHECK (
      jsonb_typeof(live_top) = 'array'
      AND jsonb_array_length(live_top) BETWEEN 1 AND 12
    ),
  CONSTRAINT memory_cut1_trace_runs_neutral_top_array_check
    CHECK (
      jsonb_typeof(neutral_top) = 'array'
      AND jsonb_array_length(neutral_top) BETWEEN 1 AND 12
    ),
  CONSTRAINT memory_cut1_trace_runs_eligible_covers_live_check
    CHECK (eligible_count >= jsonb_array_length(live_top)),
  CONSTRAINT memory_cut1_trace_runs_eligible_covers_neutral_check
    CHECK (eligible_count >= jsonb_array_length(neutral_top)),
  CONSTRAINT memory_cut1_trace_runs_session_id_nonempty_check
    CHECK (length(btrim(session_id)) > 0),
  CONSTRAINT memory_cut1_trace_runs_message_id_nonempty_check
    CHECK (length(btrim(message_id)) > 0)
);

CREATE INDEX idx_memory_cut1_trace_runs_user_captured
  ON memory_cut1_trace_runs (user_id, captured_at DESC);

CREATE INDEX idx_memory_cut1_trace_runs_session_message
  ON memory_cut1_trace_runs (session_id, message_id);

COMMENT ON TABLE memory_cut1_trace_runs IS
  'Append-only Cut-1 temporal trace: bounded observed live and decay-neutral top sets per retrieval invocation.';
COMMENT ON COLUMN memory_cut1_trace_runs.retrieval_id IS
  'Identity/idempotency key for one MemoryBundle retrieval invocation; not the member turn id.';
COMMENT ON COLUMN memory_cut1_trace_runs.message_id IS
  'Existing turn/message trace id binding this retrieval invocation to its member encounter.';
COMMENT ON COLUMN memory_cut1_trace_runs.live_top IS
  'Ordered bounded observed top set under the live decay-bearing Cut-1 score; no memory body.';
COMMENT ON COLUMN memory_cut1_trace_runs.neutral_top IS
  'Ordered bounded observed top set under identical Cut-1 scoring with only decay neutralized; no memory body.';

COMMIT;

-- Rollback (manual, authorized separately if needed):
-- DROP TABLE memory_cut1_trace_runs;
