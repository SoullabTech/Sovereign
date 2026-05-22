-- Member natal chart storage (canonical).
--
-- The computed natal chart lives directly on the members row as JSONB.
-- This collapses what had been five parallel chart-storage paths in the
-- codebase down to one. Birth data already lives on members.birth_*
-- (see 20260107000005_member_birth_data.sql); the chart computed from it
-- now lives alongside as natal_chart_json.
--
-- Shape of natal_chart_json: the BirthChart interface from
-- lib/astrology/ephemerisCalculator.ts (sun, moon, ..., chiron, asteroids,
-- ascendant, midheaven, houses, aspects).
--
-- Note on member_natal_chart: that table exists in this database but has
-- no creating migration on record. It is now dormant. Do not read from
-- or write to it. Chart JSON lives on members.natal_chart_json.

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS natal_chart_json JSONB,
  ADD COLUMN IF NOT EXISTS natal_chart_computed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_members_has_natal_chart
  ON members(id)
  WHERE natal_chart_json IS NOT NULL;

COMMENT ON COLUMN members.natal_chart_json IS
  'Computed natal chart. Shape: BirthChart interface from lib/astrology/ephemerisCalculator.ts. Recompute when members.birth_* fields change.';

COMMENT ON COLUMN members.natal_chart_computed_at IS
  'Timestamp of last chart computation. Compare against members.updated_at (or against the most recent birth_* field change) to detect staleness.';
