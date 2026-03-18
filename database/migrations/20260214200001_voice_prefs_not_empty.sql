-- Voice prefs: prevent empty-string persistence + clean existing bad rows.
--
-- Empty strings in voice_archetype / voice_id_override cascade through the
-- resolution chain as falsy but non-NULL, causing the Kokoro resolver to
-- fall through to legacy OpenAI defaults (e.g. 'alloy' → 'af_heart').
--
-- This migration:
--   1. Cleans existing empty-string rows to NULL
--   2. Adds CHECK constraints so this can't regress

BEGIN;

-- Clean up existing bad rows
UPDATE member_voice_preferences
  SET voice_archetype = NULL
  WHERE voice_archetype IS NOT NULL
    AND length(trim(voice_archetype)) = 0;

UPDATE member_voice_preferences
  SET voice_id_override = NULL
  WHERE voice_id_override IS NOT NULL
    AND length(trim(voice_id_override)) = 0;

-- Add constraints (idempotent: drop first if they exist)
ALTER TABLE member_voice_preferences
  DROP CONSTRAINT IF EXISTS member_voice_pref_archetype_not_empty;

ALTER TABLE member_voice_preferences
  ADD CONSTRAINT member_voice_pref_archetype_not_empty
  CHECK (voice_archetype IS NULL OR length(trim(voice_archetype)) > 0);

ALTER TABLE member_voice_preferences
  DROP CONSTRAINT IF EXISTS member_voice_pref_override_not_empty;

ALTER TABLE member_voice_preferences
  ADD CONSTRAINT member_voice_pref_override_not_empty
  CHECK (voice_id_override IS NULL OR length(trim(voice_id_override)) > 0);

COMMIT;
