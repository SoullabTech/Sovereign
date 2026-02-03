-- Add preferred_name column to members table
-- This is what MAIA calls the user (can differ from their registered name)

ALTER TABLE members ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(100);

-- Comment explaining the field
COMMENT ON COLUMN members.preferred_name IS 'What the user wants MAIA to call them. Set during onboarding or via conversation ("Call me X")';

-- If preferred_name is null, MAIA falls back to name field
