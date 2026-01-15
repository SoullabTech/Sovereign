-- Coherence Field Readings Table
-- Tracks elemental balance readings per user session
-- Part of MAIA's Memory Palace - Coherence tracking

CREATE TABLE IF NOT EXISTS coherence_field_readings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  reading_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Elemental levels (0-1)
  fire_level NUMERIC(4,3) NOT NULL DEFAULT 0.5,
  water_level NUMERIC(4,3) NOT NULL DEFAULT 0.5,
  earth_level NUMERIC(4,3) NOT NULL DEFAULT 0.5,
  air_level NUMERIC(4,3) NOT NULL DEFAULT 0.5,
  aether_level NUMERIC(4,3) NOT NULL DEFAULT 0.5,

  -- Coherence metrics
  coherence_score NUMERIC(4,3) NOT NULL DEFAULT 0.5,
  balance_quality TEXT,
  elemental_deficiency TEXT,
  elemental_excess TEXT,
  balancing_recommendations JSONB DEFAULT '[]'::jsonb,

  -- Context
  conversation_context TEXT,
  spiral_stage TEXT,
  archetypal_influences JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_coherence_user_id ON coherence_field_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_coherence_timestamp ON coherence_field_readings(reading_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_coherence_session ON coherence_field_readings(session_id);

COMMENT ON TABLE coherence_field_readings IS 'Elemental balance readings per user session (MAIA coherence tracking)';
