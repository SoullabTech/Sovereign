-- Team Message Kinds
-- Adds lightweight message classification to channel and DM messages.
-- 'build' is the silent default — no badge, no noise.
-- Only 'question', 'decision', 'insight' show a badge in the UI.

ALTER TABLE team_messages
  ADD COLUMN IF NOT EXISTS message_kind VARCHAR(20) NOT NULL DEFAULT 'build'
  CHECK (message_kind IN ('build', 'question', 'decision', 'insight'));

ALTER TABLE team_dm_messages
  ADD COLUMN IF NOT EXISTS message_kind VARCHAR(20) NOT NULL DEFAULT 'build'
  CHECK (message_kind IN ('build', 'question', 'decision', 'insight'));
