-- Add portal_type to practitioners table
-- Determines which Studio UI variant and defaults to use

ALTER TABLE practitioners
ADD COLUMN IF NOT EXISTS portal_type TEXT NOT NULL DEFAULT 'generalist';

-- Add check constraint for valid portal types
ALTER TABLE practitioners
ADD CONSTRAINT practitioners_portal_type_check
CHECK (portal_type IN ('generalist', 'astrology', 'therapy', 'bodywork', 'groups', 'clinician'));

-- Index for filtering by portal type
CREATE INDEX IF NOT EXISTS idx_practitioners_portal_type ON practitioners(portal_type);

-- Comment for documentation
COMMENT ON COLUMN practitioners.portal_type IS 'Portal design variant: generalist, astrology, therapy, bodywork, groups';
