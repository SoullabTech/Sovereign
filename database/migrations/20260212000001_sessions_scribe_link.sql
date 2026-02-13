-- Link Studio bookings (sessions) to Session Room recordings (scribe_sessions)
-- Only relevant for practitioner container sessions (client work).
-- Solo and witness scribe sessions remain standalone.

-- Forward link: booking → scribe recording
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS scribe_session_id UUID REFERENCES scribe_sessions(id);

CREATE INDEX IF NOT EXISTS idx_sessions_scribe_session_id
  ON sessions(scribe_session_id) WHERE scribe_session_id IS NOT NULL;

-- Reverse link: scribe recording → booking
ALTER TABLE scribe_sessions
  ADD COLUMN IF NOT EXISTS booking_id UUID;

CREATE INDEX IF NOT EXISTS idx_scribe_sessions_booking_id
  ON scribe_sessions(booking_id) WHERE booking_id IS NOT NULL;
