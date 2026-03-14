-- Voice Archetypes: Add voice_archetype column to member_voice_preferences.
--
-- Members choose a voice archetype (maia_core, maia_warm, maia_clear, mentor, elder),
-- not a raw engine ID. The archetype resolves to a Kokoro voice in application code.
--
-- This replaces voice_id_override as the primary voice selection mechanism.
-- voice_id_override is kept for backward compatibility but voice_archetype takes precedence.

BEGIN;

-- Add archetype column with CHECK constraint for valid values
ALTER TABLE member_voice_preferences
  ADD COLUMN IF NOT EXISTS voice_archetype TEXT NULL;

-- Constrain to known archetypes (NULL means "use default / maia_core")
ALTER TABLE member_voice_preferences
  DROP CONSTRAINT IF EXISTS member_voice_pref_archetype_valid;

ALTER TABLE member_voice_preferences
  ADD CONSTRAINT member_voice_pref_archetype_valid
  CHECK (voice_archetype IS NULL OR voice_archetype IN (
    'maia_core', 'maia_warm', 'maia_clear', 'mentor', 'elder', 'puck'
  ));

COMMIT;
