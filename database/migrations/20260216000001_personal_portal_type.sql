-- Add 'personal' portal type for non-practitioner Studio access
-- Personal users get field-mode tools (Decisions, Changes, MAIA, Vault)
-- without needing to set up a practice with clients/sessions/slug.

-- Update CHECK constraint to include 'personal'
ALTER TABLE practitioners
DROP CONSTRAINT IF EXISTS practitioners_portal_type_check;

ALTER TABLE practitioners
ADD CONSTRAINT practitioners_portal_type_check
CHECK (portal_type IN ('generalist', 'astrology', 'therapy', 'bodywork', 'groups', 'clinician', 'consultant', 'personal'));

COMMENT ON CONSTRAINT practitioners_portal_type_check ON practitioners IS
  'Valid portal types including personal (non-practitioner studio access)';
