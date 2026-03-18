-- Spiralogic Evolutionary Reports: generated reports storage
-- One report per member (upsert replaces on regenerate)

CREATE TABLE IF NOT EXISTS member_astrology_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  birth_data_snapshot JSONB NOT NULL,
  report_data JSONB NOT NULL,
  report_version VARCHAR(10) NOT NULL DEFAULT '1.0'
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_member_astrology_report
  ON member_astrology_reports (member_id);

CREATE INDEX IF NOT EXISTS idx_member_astrology_reports_member_id
  ON member_astrology_reports (member_id);
