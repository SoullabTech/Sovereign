-- Studio Modules + Consultant Portal Type
-- Adds module-driven nav, consultant portal type, and practice modes

-- ============== ADD CONSULTANT TO PORTAL TYPES ==============

-- Drop the old CHECK constraint and recreate with 'consultant' included
ALTER TABLE practitioners
DROP CONSTRAINT IF EXISTS practitioners_portal_type_check;

ALTER TABLE practitioners
ADD CONSTRAINT practitioners_portal_type_check
CHECK (portal_type IN ('generalist', 'astrology', 'therapy', 'bodywork', 'groups', 'clinician', 'consultant'));

-- ============== ADD NEW COLUMNS ==============

-- enabled_modules: array of module slugs the practitioner has turned on
-- NULL means "use portal type defaults"
ALTER TABLE practitioners
ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT NULL;

-- consultant_profile: subtypes, industries, modalities (only for consultant type)
ALTER TABLE practitioners
ADD COLUMN IF NOT EXISTS consultant_profile JSONB DEFAULT NULL;

-- practice_modes: future support for multiple practice hats within one studio
ALTER TABLE practitioners
ADD COLUMN IF NOT EXISTS practice_modes JSONB DEFAULT '[]'::jsonb;

-- ============== INDEXES ==============

CREATE INDEX IF NOT EXISTS idx_practitioners_enabled_modules
  ON practitioners USING GIN (enabled_modules) WHERE enabled_modules IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_practitioners_consultant_profile
  ON practitioners USING GIN (consultant_profile) WHERE consultant_profile IS NOT NULL;

-- ============== COMMENTS ==============

COMMENT ON COLUMN practitioners.enabled_modules IS 'Array of enabled module slugs. NULL = use portal type defaults.';
COMMENT ON COLUMN practitioners.consultant_profile IS 'Consultant-specific config: subtypes, industries, modalities. Only set when portal_type = consultant.';
COMMENT ON COLUMN practitioners.practice_modes IS 'Practice mode definitions for multi-hat practitioners. Data layer for v1.';
