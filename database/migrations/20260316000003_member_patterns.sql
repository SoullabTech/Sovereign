-- Member Patterns: lightweight named-observation layer
-- Practitioners tag recurring patterns; members can confirm/reject
-- Separate from studio_pattern_protocols (which are multi-week behavioral experiments)

CREATE TABLE IF NOT EXISTS member_patterns (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  practitioner_id      UUID         NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  theme                TEXT         NOT NULL,
  description          TEXT,
  status               TEXT         NOT NULL DEFAULT 'emerging'
                         CHECK (status IN ('emerging', 'offered', 'confirmed', 'rejected')),
  confidence           FLOAT        CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  member_response      TEXT,
  member_responded_at  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_patterns_member_id
  ON member_patterns(member_id);

CREATE INDEX IF NOT EXISTS idx_member_patterns_practitioner_id
  ON member_patterns(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_member_patterns_member_status
  ON member_patterns(member_id, status);

CREATE OR REPLACE FUNCTION update_member_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_member_patterns_updated_at ON member_patterns;

CREATE TRIGGER trg_member_patterns_updated_at
  BEFORE UPDATE ON member_patterns
  FOR EACH ROW EXECUTE FUNCTION update_member_patterns_updated_at();
