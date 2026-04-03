-- Add pronouns to members table
-- Pronouns are core identity data that should reach all MAIA layers.
-- Stored as freeform text (e.g. 'he/him', 'she/her', 'they/them', or any custom preference).

ALTER TABLE members ADD COLUMN IF NOT EXISTS pronouns TEXT;

COMMENT ON COLUMN members.pronouns IS 'User preferred pronouns (e.g. he/him, she/her, they/them). Surfaced to MAIA in identity context.';
