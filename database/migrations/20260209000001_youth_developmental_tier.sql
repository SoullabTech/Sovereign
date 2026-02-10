-- Youth MAIA: Developmental Tier System
-- Computed from birth_date, governs all youth safety constraints
--
-- Tiers:
--   under13  = Guided mode only, guardian required
--   tier2    = 13-15, supported sovereignty, guardian mirror active
--   tier3    = 16-17, emerging independence, guardian mirror optional
--   adult    = 18+, full access
--
-- Philosophy: supported sovereignty, not surveillance.

-- Add developmental tier columns to members
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS developmental_tier VARCHAR(20)
    CHECK (developmental_tier IN ('under13', 'tier2', 'tier3', 'adult')),
  ADD COLUMN IF NOT EXISTS guardian_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS youth_onboarded BOOLEAN DEFAULT false;

-- Compute tier from birth date
CREATE OR REPLACE FUNCTION compute_developmental_tier(birth DATE)
RETURNS VARCHAR(20) AS $$
DECLARE
  age_years INTEGER;
BEGIN
  IF birth IS NULL THEN RETURN NULL; END IF;
  age_years := EXTRACT(YEAR FROM age(CURRENT_DATE, birth));
  IF age_years < 13 THEN RETURN 'under13';
  ELSIF age_years <= 15 THEN RETURN 'tier2';
  ELSIF age_years <= 17 THEN RETURN 'tier3';
  ELSE RETURN 'adult';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-compute tier when birth_date changes
CREATE OR REPLACE FUNCTION update_developmental_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.developmental_tier := compute_developmental_tier(NEW.birth_date);
  NEW.guardian_required := NEW.developmental_tier IN ('under13', 'tier2');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS compute_tier_on_birth_date ON members;
CREATE TRIGGER compute_tier_on_birth_date
  BEFORE INSERT OR UPDATE OF birth_date ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_developmental_tier();

-- Backfill existing members with birth_date
UPDATE members
SET developmental_tier = compute_developmental_tier(birth_date),
    guardian_required = compute_developmental_tier(birth_date) IN ('under13', 'tier2')
WHERE birth_date IS NOT NULL
  AND developmental_tier IS NULL;

-- Index for tier-based queries
CREATE INDEX IF NOT EXISTS idx_members_developmental_tier
  ON members(developmental_tier) WHERE developmental_tier IS NOT NULL;

COMMENT ON COLUMN members.developmental_tier IS 'under13|tier2(13-15)|tier3(16-17)|adult — computed from birth_date';
COMMENT ON COLUMN members.guardian_required IS 'true for under13 and tier2 — guardian link needed for full access';
COMMENT ON COLUMN members.youth_onboarded IS 'true when youth-specific onboarding is complete';
