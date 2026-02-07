-- Add studio_session_id to practitioner_sessions for write-back from Studio
-- This links Studio bookings (sessions table) to practitioner session history
-- (practitioner_sessions table) so the briefing engine can see Studio-native work.

ALTER TABLE practitioner_sessions
  ADD COLUMN IF NOT EXISTS studio_session_id UUID UNIQUE;

-- Index for fast lookup when writing back
CREATE INDEX IF NOT EXISTS idx_practitioner_sessions_studio_session
  ON practitioner_sessions(studio_session_id)
  WHERE studio_session_id IS NOT NULL;
