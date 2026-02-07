-- Add audio minutes add-on flag to member_settings
-- Allows members below Studio tier to purchase audio transcription access

ALTER TABLE member_settings
ADD COLUMN IF NOT EXISTS audio_minutes_addon boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN member_settings.audio_minutes_addon IS 'Whether member has purchased audio minutes add-on (bypasses tier gate for cloud audio)';
