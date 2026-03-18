-- Onboarding funnel telemetry
-- Tracks every state transition so we can see exactly where testers fail.
-- Fire-and-forget writes; table absence is handled gracefully in telemetry.ts.

CREATE TABLE IF NOT EXISTS onboarding_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event        TEXT NOT NULL,
  member_id    UUID REFERENCES members(id) ON DELETE SET NULL,
  email        TEXT,
  path         TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast funnel queries: all events for a member in order
CREATE INDEX IF NOT EXISTS idx_onboarding_events_member
  ON onboarding_events (member_id, created_at);

-- Aggregate queries: count by event type across date range
CREATE INDEX IF NOT EXISTS idx_onboarding_events_event_date
  ON onboarding_events (event, created_at);

-- Lookup by email (pre-member events like magic_link_sent)
CREATE INDEX IF NOT EXISTS idx_onboarding_events_email
  ON onboarding_events (email, created_at)
  WHERE email IS NOT NULL;
