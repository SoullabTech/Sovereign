-- Contrast Experience telemetry
-- Tracks when contrast moments are offered, accepted, dismissed, or engaged with.
-- Observation-first: this data teaches us how often and how delicately contrast should appear.

CREATE TABLE IF NOT EXISTS contrast_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  member_id uuid REFERENCES members(id),
  session_id text NOT NULL,
  turn_index int,
  event_type text NOT NULL,
  original_tradition text,
  contrast_tradition text,
  contrast_mode text,
  gate_reason text,
  meta jsonb DEFAULT '{}'
);

CREATE INDEX idx_contrast_events_member ON contrast_events(member_id);
CREATE INDEX idx_contrast_events_session ON contrast_events(session_id);
CREATE INDEX idx_contrast_events_type ON contrast_events(event_type);
CREATE INDEX idx_contrast_events_created ON contrast_events(created_at DESC);
