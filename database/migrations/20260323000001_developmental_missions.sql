-- Developmental Missions
-- Not tasks. Consecrated next movements emerging from what MAIA has already seen.
-- MAIA reveals the pattern. Missions provide the practice. Journey holds the arc.

CREATE TABLE IF NOT EXISTS developmental_missions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('clarifying', 'integrating', 'threshold')),
  title         TEXT NOT NULL,
  invitation    TEXT NOT NULL,
  duration      TEXT NOT NULL CHECK (duration IN ('today', '24h', 'until_next_return')),
  origin        TEXT NOT NULL CHECK (origin IN ('first_descent', 'maia_session', 'pattern_return', 'attunement')),
  status        TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'accepted', 'completed', 'released')),
  origin_data   JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at   TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  released_at   TIMESTAMPTZ
);

-- Index for member lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_dev_missions_member ON developmental_missions(member_id, status, created_at DESC);

COMMENT ON TABLE developmental_missions IS 'Developmental missions — small, living practices that emerge from what your process is already asking of you.';
