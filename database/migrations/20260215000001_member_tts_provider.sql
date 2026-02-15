-- Member TTS Provider Choice: let members choose between cloud and local voice.
--
-- Values:
--   NULL / 'auto' — current behavior (Kokoro first, OpenAI fallback)
--   'cloud'       — prefer OpenAI TTS (higher quality, requires internet)
--   'local'       — prefer Kokoro only (sovereign, works offline)

BEGIN;

ALTER TABLE member_voice_preferences
  ADD COLUMN IF NOT EXISTS tts_provider TEXT NULL;

ALTER TABLE member_voice_preferences
  DROP CONSTRAINT IF EXISTS member_voice_pref_tts_provider_valid;

ALTER TABLE member_voice_preferences
  ADD CONSTRAINT member_voice_pref_tts_provider_valid
  CHECK (tts_provider IS NULL OR tts_provider IN ('auto', 'cloud', 'local'));

COMMIT;
