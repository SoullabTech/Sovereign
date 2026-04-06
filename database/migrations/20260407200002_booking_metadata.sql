-- Booking Metadata
-- Thin layer on top of sessions for public booking concerns:
-- confirmation tokens, intake responses, timezone, calendar_events bridge.
-- sessions remains the booking record; this adds what sessions doesn't have.

CREATE TABLE IF NOT EXISTS booking_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  calendar_event_id UUID REFERENCES calendar_events(id),
  confirmation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  booker_timezone TEXT,
  intake_responses JSONB DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'portal',       -- portal | chat | studio
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id),
  UNIQUE(confirmation_token)
);

CREATE INDEX IF NOT EXISTS idx_booking_meta_token
  ON booking_metadata(confirmation_token);
