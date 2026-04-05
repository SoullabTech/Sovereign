-- Agent monitoring: one row per bounded agent execution
-- Observability layer — no automatic feedback into agent behavior
-- Named bounded_agent_runs to avoid collision with existing oracle agent_runs telemetry table

CREATE TABLE IF NOT EXISTS bounded_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  agent_name TEXT NOT NULL,              -- e.g. 'content_pipeline_agent'
  source_type TEXT NOT NULL,             -- e.g. 'book_chapter'
  source_id TEXT NOT NULL,               -- e.g. chapter slug or manuscript id
  source_title TEXT,                     -- human-readable label

  status TEXT NOT NULL DEFAULT 'started', -- started | completed | partial | failed

  attempt_count INT NOT NULL DEFAULT 1,
  max_attempts INT NOT NULL DEFAULT 1,
  retry_count INT NOT NULL DEFAULT 0,

  duration_ms INT,
  model_used TEXT,                       -- e.g. claude-sonnet
  orchestration_mode TEXT,               -- e.g. 'agent_sdk'

  output_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,

  human_review_status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | revised | rejected
  human_review_notes TEXT,

  error_text TEXT,

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bounded_agent_runs_agent_name
  ON bounded_agent_runs(agent_name);

CREATE INDEX IF NOT EXISTS idx_bounded_agent_runs_status
  ON bounded_agent_runs(status);

CREATE INDEX IF NOT EXISTS idx_bounded_agent_runs_flagged
  ON bounded_agent_runs(is_flagged);

CREATE INDEX IF NOT EXISTS idx_bounded_agent_runs_human_review
  ON bounded_agent_runs(human_review_status);

CREATE INDEX IF NOT EXISTS idx_bounded_agent_runs_created_at
  ON bounded_agent_runs(created_at DESC);

COMMENT ON TABLE bounded_agent_runs IS 'Bounded agent execution log. Observability only — no auto-feedback.';
COMMENT ON COLUMN bounded_agent_runs.flags IS 'Deterministic flag codes: retry_used, max_attempts_reached, schema_invalid, zero_passages, generic_tone_high, high_rejection_rate, parse_failure, runtime_error';
COMMENT ON COLUMN bounded_agent_runs.human_review_status IS 'pending → approved | revised | rejected. Set by human only.';
