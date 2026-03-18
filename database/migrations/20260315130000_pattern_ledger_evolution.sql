-- Pattern Ledger Evolution: add longitudinal tracking columns
-- to the existing pattern_ledger table.
-- Existing columns (statement, scope, confidence, status, etc.) are preserved.
-- New columns support recurrence counting, significance trending, and trigger context.

ALTER TABLE pattern_ledger
  ADD COLUMN IF NOT EXISTS pattern_key            text,
  ADD COLUMN IF NOT EXISTS pattern_type           text CHECK (pattern_type IN ('pattern', 'growth_edge')),
  ADD COLUMN IF NOT EXISTS recurrence_count       integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS latest_significance    numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS average_significance   numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS max_significance       numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS trigger_contexts       jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS supporting_insight_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill pattern_key from statement for existing rows
UPDATE pattern_ledger
SET pattern_key = lower(regexp_replace(regexp_replace(statement, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '_', 'g'))
WHERE pattern_key IS NULL AND statement IS NOT NULL;

-- Backfill average_significance from confidence for existing rows
UPDATE pattern_ledger
SET average_significance = confidence::numeric,
    latest_significance  = confidence::numeric,
    max_significance     = confidence::numeric
WHERE average_significance = 0.5 AND confidence IS NOT NULL;

-- Add indexes (these failed in the previous migration because columns didn't exist)
CREATE INDEX IF NOT EXISTS idx_pattern_ledger_member_last_seen
  ON pattern_ledger(member_id, last_evidence_at DESC);

CREATE INDEX IF NOT EXISTS idx_pattern_ledger_member_pattern_key
  ON pattern_ledger(member_id, pattern_key);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pattern_ledger_member_pattern_key
  ON pattern_ledger(member_id, pattern_key)
  WHERE pattern_key IS NOT NULL;

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260315130000_pattern_ledger_evolution.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
