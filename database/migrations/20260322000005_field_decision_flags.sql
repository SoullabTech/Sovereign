-- Migration: 20260322000005_field_decision_flags.sql
-- Purpose: Stores flagged decisions from field systems pages
--
-- Used by Nathan's systems page "Flag for discussion" interaction.
-- No content analysis — just records which decisions were flagged and when.

CREATE TABLE IF NOT EXISTS field_decision_flags (
  id          BIGSERIAL PRIMARY KEY,
  field_slug  TEXT NOT NULL,
  decision    TEXT NOT NULL,
  flagged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_decision_flags_field
  ON field_decision_flags (field_slug, flagged_at DESC);

COMMENT ON TABLE field_decision_flags IS
  'Records decisions flagged for discussion from field systems pages. No session content stored.';

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260322000005_field_decision_flags.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
