-- Migration: Add canonical spiral_state to user_relationship_context
-- Date: 2025-12-18
-- Purpose: Enable structured spiral/phase memory injection (bond-safe longitudinal tracking)

-- Add spiral_state column (canonical current state)
ALTER TABLE user_relationship_context
ADD COLUMN IF NOT EXISTS spiral_state JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS spiral_state_updated_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_spiral_state_updated
ON user_relationship_context(spiral_state_updated_at DESC);

-- Add comment
COMMENT ON COLUMN user_relationship_context.spiral_state IS
'Canonical current spiral/phase state: { element, phase, facet, arc, confidence, source, updatedAt }';

COMMENT ON COLUMN user_relationship_context.spiral_state_updated_at IS
'Timestamp of last spiral state update (for staleness detection)';

-- Example spiral_state structure:
-- {
--   "element": "Water",
--   "phase": 2,
--   "facet": "Water 2",
--   "arc": "death/rebirth integration",
--   "confidence": 0.74,
--   "source": "user_checkin|detector|manual",
--   "updatedAt": "2025-12-18T18:12:00Z"
-- }

-- Migration completed
SELECT 'Spiral state tracking schema added successfully!' as result;
