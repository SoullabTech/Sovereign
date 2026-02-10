-- ============================================================
-- Threshold Events
-- Tracks life pivots — moments where path or identity shifted
--
-- Unlike expansion_events (growth within trajectory), threshold_events
-- capture crossings: decisions made, roles changed, collapses, initiations.
--
-- This is the "narrative spine" — what MAIA recalls when asked
-- "what has happened in this person's life?"
-- ============================================================

CREATE TABLE IF NOT EXISTS threshold_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  session_id TEXT,

  -- Event type (keep this list tight)
  event_type TEXT NOT NULL CHECK (event_type IN (
    'decision',        -- committed choice made
    'commitment',      -- pledged to a direction
    'boundary',        -- limit set or held
    'role_shift',      -- identity/role changed
    'collapse',        -- system breakdown/burnout
    'initiation',      -- entering new phase
    'completion',      -- cycle/chapter closed
    'kairos_crossing'  -- threshold moment in time
  )),

  -- Elemental context
  element TEXT CHECK (element IN ('earth', 'water', 'fire', 'air', 'aether')),

  -- Intensity
  intensity TEXT NOT NULL DEFAULT 'medium'
    CHECK (intensity IN ('low', 'medium', 'high', 'profound')),

  -- The crossing in words (1-2 sentences)
  summary TEXT NOT NULL,

  -- Source
  source TEXT NOT NULL DEFAULT 'maia_detected'
    CHECK (source IN ('maia_detected', 'member_declared', 'practitioner_noted', 'retrospective')),

  -- Link to state at time of crossing
  state_vector_id UUID REFERENCES state_vectors(id),

  -- Metadata
  meta JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_threshold_member_time
  ON threshold_events(member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_threshold_type
  ON threshold_events(event_type);

-- View: member's threshold timeline
CREATE OR REPLACE VIEW v_threshold_timeline AS
SELECT
  te.id,
  te.member_id,
  m.name AS member_name,
  te.event_type,
  te.element,
  te.intensity,
  te.summary,
  te.source,
  te.created_at
FROM threshold_events te
LEFT JOIN members m ON m.id = te.member_id
ORDER BY te.created_at DESC;

COMMENT ON TABLE threshold_events IS 'Life pivots: decisions, role shifts, collapses, initiations, completions';
