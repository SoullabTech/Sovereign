-- Daily Anchor: minimal continuity instrument.
-- One prompt, one response, one anchor per member per day.
-- No streaks, no aggregates, no completion state — by design.

CREATE TABLE IF NOT EXISTS member_daily_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  anchor_date DATE NOT NULL,
  prompt_shown TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, anchor_date)
);

CREATE INDEX IF NOT EXISTS idx_member_daily_anchors_member_date
  ON member_daily_anchors(member_id, anchor_date DESC);
