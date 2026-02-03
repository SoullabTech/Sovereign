-- Member birth data for personalized astrology
-- Enables MAIA to know your natal chart and current transits

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS birth_time TIME,
  ADD COLUMN IF NOT EXISTS birth_location_lat NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS birth_location_lng NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS birth_location_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS birth_timezone VARCHAR(100);

-- Index for users who have birth data (for personalized transit reports)
CREATE INDEX IF NOT EXISTS idx_members_has_birth_data
  ON members(id)
  WHERE birth_date IS NOT NULL;

COMMENT ON COLUMN members.birth_date IS 'Birth date for natal chart calculation';
COMMENT ON COLUMN members.birth_time IS 'Birth time (local) - null if unknown';
COMMENT ON COLUMN members.birth_location_lat IS 'Birth location latitude';
COMMENT ON COLUMN members.birth_location_lng IS 'Birth location longitude';
COMMENT ON COLUMN members.birth_location_name IS 'Human-readable birth location (e.g., "San Francisco, CA")';
COMMENT ON COLUMN members.birth_timezone IS 'IANA timezone of birth location (e.g., "America/Los_Angeles")';
