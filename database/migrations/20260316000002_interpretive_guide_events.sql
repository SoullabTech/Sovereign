-- Interpretive Council telemetry
-- Logs which guide was active at response time and when members change their default.
-- Structural signal only — no conversation content ever stored here.

CREATE TABLE IF NOT EXISTS interpretive_guide_events (
  id           UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id    UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_type   VARCHAR(40)  NOT NULL, -- 'guide_selected' | 'guide_active_at_response'
  guide_id     VARCHAR(20)  NOT NULL, -- InterpretiveGuideId
  source       VARCHAR(30),           -- 'account_default' | 'session_override' | 'auto_integrator'
  depth_tier   VARCHAR(10),           -- 'threshold' | 'core' | 'deep' (nullable; for response events)
  metadata     JSONB,                 -- extensible; never include message content
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Lookup patterns expected: by member, by event type, by guide, by recency
CREATE INDEX IF NOT EXISTS idx_guide_events_member
  ON interpretive_guide_events(member_id);

CREATE INDEX IF NOT EXISTS idx_guide_events_type
  ON interpretive_guide_events(event_type);

CREATE INDEX IF NOT EXISTS idx_guide_events_guide
  ON interpretive_guide_events(guide_id);

CREATE INDEX IF NOT EXISTS idx_guide_events_created
  ON interpretive_guide_events(created_at DESC);

-- Compound: member + recency (primary read pattern for per-member history)
CREATE INDEX IF NOT EXISTS idx_guide_events_member_created
  ON interpretive_guide_events(member_id, created_at DESC);

COMMENT ON TABLE interpretive_guide_events IS
  'Structural telemetry for the Interpretive Council. Records guide selection and activation events. No message content.';
