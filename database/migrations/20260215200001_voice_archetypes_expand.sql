-- Expand voice archetypes: add 6 new voice options.
--
-- New OpenAI voices: maia_echo (echo), maia_fable (fable), maia_onyx (onyx)
-- New Kokoro voices: heart (af_heart), bella (af_bella), adam (am_adam)
--
-- Widens the CHECK constraint from 6 to 12 valid archetype values.
-- Existing member selections remain valid — no data migration needed.

BEGIN;

ALTER TABLE member_voice_preferences
  DROP CONSTRAINT IF EXISTS member_voice_pref_archetype_valid;

ALTER TABLE member_voice_preferences
  ADD CONSTRAINT member_voice_pref_archetype_valid
  CHECK (voice_archetype IS NULL OR voice_archetype IN (
    'maia_core', 'maia_warm', 'maia_clear', 'maia_echo', 'maia_fable', 'maia_onyx',
    'mentor', 'elder', 'puck', 'heart', 'bella', 'adam'
  ));

COMMIT;
