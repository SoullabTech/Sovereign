-- ============================================================
-- Trajectory Focus
-- Tracks where a member is trying to go — their current direction
--
-- This is not a history table. One row per member, updated when
-- direction becomes clear or changes.
--
-- Answers: "Where are they trying to go?"
-- ============================================================

CREATE TABLE IF NOT EXISTS trajectory_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Domain of focus
  domain TEXT NOT NULL CHECK (domain IN (
    'career',
    'relationship',
    'identity',
    'health',
    'creative',
    'spiritual',
    'boundaries',
    'integration'
  )),

  -- The intention in their words
  intention TEXT NOT NULL,

  -- Elemental tone of the direction
  element_tone TEXT CHECK (element_tone IN ('earth', 'water', 'fire', 'air', 'aether')),

  -- When this was set/updated
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique per member per domain (one focus per domain)
  UNIQUE(member_id, domain)
);

-- Index for member lookup
CREATE INDEX IF NOT EXISTS idx_trajectory_member
  ON trajectory_focus(member_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_trajectory_focus_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trajectory_focus_updated_at ON trajectory_focus;
CREATE TRIGGER trajectory_focus_updated_at
  BEFORE UPDATE ON trajectory_focus
  FOR EACH ROW
  EXECUTE FUNCTION update_trajectory_focus_timestamp();

-- View: member's current trajectory
CREATE OR REPLACE VIEW v_member_trajectory AS
SELECT
  tf.member_id,
  m.name AS member_name,
  tf.domain,
  tf.intention,
  tf.element_tone,
  tf.updated_at
FROM trajectory_focus tf
LEFT JOIN members m ON m.id = tf.member_id
ORDER BY tf.updated_at DESC;

COMMENT ON TABLE trajectory_focus IS 'Current direction per member per domain — where they are trying to go';
COMMENT ON COLUMN trajectory_focus.intention IS 'The direction in their words: "I want to step into leadership"';
