-- Pattern Ledger: aggregated longitudinal behavioral pattern memory
-- Source of truth for recurrence, salience trend, and trigger context.
-- conversation_insights remains the raw event stream.
-- This table is the aggregated view used by hypothesis injection and practitioners.

CREATE TABLE IF NOT EXISTS pattern_ledger (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id             uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  pattern_key           text NOT NULL,
  pattern_label         text NOT NULL,
  pattern_type          text NOT NULL CHECK (pattern_type IN ('pattern', 'growth_edge')),
  recurrence_count      integer NOT NULL DEFAULT 1,
  first_seen_at         timestamptz NOT NULL,
  last_seen_at          timestamptz NOT NULL,
  latest_significance   numeric NOT NULL DEFAULT 0.5,
  average_significance  numeric NOT NULL DEFAULT 0.5,
  max_significance      numeric NOT NULL DEFAULT 0.5,
  trigger_contexts      jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs         jsonb NOT NULL DEFAULT '[]'::jsonb,
  supporting_insight_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  status                text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pattern_ledger_member_id
  ON pattern_ledger(member_id);

CREATE INDEX IF NOT EXISTS idx_pattern_ledger_member_last_seen
  ON pattern_ledger(member_id, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_pattern_ledger_member_pattern_key
  ON pattern_ledger(member_id, pattern_key);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pattern_ledger_member_pattern_key
  ON pattern_ledger(member_id, pattern_key);

-- Register this migration
INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260315120000_pattern_ledger.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
