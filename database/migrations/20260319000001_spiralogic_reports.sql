-- Spiralogic Evolutionary Reports
-- Stores generated reports for members, optionally linked to a practitioner

CREATE TABLE IF NOT EXISTS spiralogic_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  practitioner_id UUID REFERENCES members(id) ON DELETE SET NULL,
  birth_data    JSONB NOT NULL DEFAULT '{}',
  report_data   JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS spiralogic_reports_member_idx
  ON spiralogic_reports (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS spiralogic_reports_practitioner_idx
  ON spiralogic_reports (practitioner_id, created_at DESC);

COMMENT ON TABLE spiralogic_reports IS
  'Spiralogic Evolutionary Reports — birth-chart-derived elemental narratives generated for members.';
