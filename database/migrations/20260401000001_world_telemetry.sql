-- World Telemetry — doorway and world engagement signals
-- Lightweight event store for observing movement through worlds.
-- No PII. No content. Just structural movement data.

CREATE TABLE IF NOT EXISTS world_telemetry (
  id            BIGSERIAL PRIMARY KEY,
  session_id    TEXT,
  member_id     UUID,
  event_type    TEXT NOT NULL,           -- doorway_shown | doorway_clicked | doorway_dismissed | world_entered | world_exited
  intent        TEXT,                    -- enter_patterns | enter_journey | enter_depth
  world         TEXT,                    -- patterns | journey | depth
  confidence    REAL,
  time_to_click INTEGER,                -- seconds from shown to clicked (null if dismissed/not clicked)
  time_in_world INTEGER,                -- seconds spent in world (null for doorway events)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_world_telemetry_created ON world_telemetry (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_world_telemetry_event ON world_telemetry (event_type);
