-- TURN-01 — member-owned conversational space and floor control.
-- Preferences only; no psychological inference or scoring is persisted.

BEGIN;

ALTER TABLE member_voice_preferences
  ADD COLUMN IF NOT EXISTS conversational_space TEXT NOT NULL DEFAULT 'natural',
  ADD COLUMN IF NOT EXISTS floor_control_mode TEXT NOT NULL DEFAULT 'automatic',
  ADD COLUMN IF NOT EXISTS learn_turn_rhythm BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE member_voice_preferences
  DROP CONSTRAINT IF EXISTS member_voice_pref_conversational_space_valid;
ALTER TABLE member_voice_preferences
  ADD CONSTRAINT member_voice_pref_conversational_space_valid
  CHECK (conversational_space IN ('responsive', 'natural', 'spacious', 'contemplative'));

ALTER TABLE member_voice_preferences
  DROP CONSTRAINT IF EXISTS member_voice_pref_floor_control_mode_valid;
ALTER TABLE member_voice_preferences
  ADD CONSTRAINT member_voice_pref_floor_control_mode_valid
  CHECK (floor_control_mode IN ('automatic', 'explicit'));

COMMIT;
