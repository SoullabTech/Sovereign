-- Portal Status: draft vs live
-- Allows practitioners to keep their portal in preview mode until ready to publish

-- Add portal_status column to practitioners table
ALTER TABLE practitioners
ADD COLUMN IF NOT EXISTS portal_status TEXT NOT NULL DEFAULT 'draft'
CHECK (portal_status IN ('draft', 'live'));

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_practitioners_portal_status ON practitioners(portal_status);

-- Comment for documentation
COMMENT ON COLUMN practitioners.portal_status IS 'Portal visibility: draft (private preview) or live (public)';
