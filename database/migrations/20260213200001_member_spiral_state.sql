-- Bridge D: Member Spiral State Persistence
-- Anti-regression infrastructure: prevents treating returning members like new people.
-- NOT personalization. NOT psychometrics. Just continuity.
--
-- Philosophy: "Remember where we are in the spiral, not the content of our conversation."

-- ═══════════════════════════════════════════════════════════════
-- Core Table: Member Spiral State
-- ═══════════════════════════════════════════════════════════════
-- Single row per member. Updated fire-and-forget after each oracle turn.
-- Stores structural position (element/phase) without storing conversation content.

CREATE TABLE IF NOT EXISTS member_spiral_state (
  member_id             UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,

  -- Elemental Identity
  dominant_element      TEXT NOT NULL CHECK (dominant_element IN ('fire', 'water', 'earth', 'air', 'aether')),
  phase                 INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 12),
  motion                TEXT CHECK (motion IS NULL OR motion IN ('ascending', 'stuck', 'breakthrough')),
  intensity             NUMERIC(3, 2) CHECK (intensity IS NULL OR (intensity >= 0 AND intensity <= 1)),

  -- Relational Phase (1=orientation, 2=capacity, 3=autonomy, 4=seasonal_return)
  relational_phase      INTEGER NOT NULL DEFAULT 1 CHECK (relational_phase BETWEEN 1 AND 4),

  -- Maturation Tracking
  autonomy_streak       INTEGER NOT NULL DEFAULT 0 CHECK (autonomy_streak >= 0),
  return_count          INTEGER NOT NULL DEFAULT 0 CHECK (return_count >= 0),

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Query paths: "who updated recently?" + "element distribution"
CREATE INDEX IF NOT EXISTS idx_member_spiral_updated
  ON member_spiral_state (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_spiral_element
  ON member_spiral_state (dominant_element, phase);
CREATE INDEX IF NOT EXISTS idx_member_spiral_relational
  ON member_spiral_state (relational_phase, autonomy_streak);

COMMENT ON TABLE member_spiral_state IS
  'Anti-regression state: structural spiral position per member. NOT conversation content. Updated fire-and-forget.';

COMMENT ON COLUMN member_spiral_state.dominant_element IS
  'Current dominant element from conductor hysteresis. Changes slowly.';

COMMENT ON COLUMN member_spiral_state.relational_phase IS
  '1=orientation, 2=capacity-building, 3=autonomy, 4=seasonal return. Not forced progression.';

COMMENT ON COLUMN member_spiral_state.autonomy_streak IS
  'How many consecutive sessions the member operated autonomously (phase 3+). Resets on return.';

COMMENT ON COLUMN member_spiral_state.return_count IS
  'How many times member returned after achieving autonomy. Seasonal rhythm tracking.';

-- ═══════════════════════════════════════════════════════════════
-- Update Trigger: Auto-update timestamp
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_member_spiral_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_member_spiral_timestamp
  BEFORE UPDATE ON member_spiral_state
  FOR EACH ROW
  EXECUTE FUNCTION update_member_spiral_timestamp();

-- ═══════════════════════════════════════════════════════════════
-- Observability View: Spiral State Snapshot
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_member_spiral_summary AS
SELECT
  dominant_element,
  phase,
  relational_phase,
  COUNT(*) as member_count,
  AVG(autonomy_streak)::numeric(5,1) as avg_autonomy_streak,
  AVG(return_count)::numeric(5,1) as avg_return_count,
  MAX(updated_at) as last_updated
FROM member_spiral_state
GROUP BY dominant_element, phase, relational_phase
ORDER BY dominant_element, phase;

COMMENT ON VIEW v_member_spiral_summary IS
  'Observability: member distribution across spiral positions. No PII.';
