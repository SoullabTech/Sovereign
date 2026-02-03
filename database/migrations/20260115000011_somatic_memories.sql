-- Somatic Memories Table
-- Tracks body wisdom patterns - where tension lives, what triggers it
-- Part of MAIA's 5-Layer Memory Palace - Layer 3

CREATE TABLE IF NOT EXISTS somatic_memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL UNIQUE,

  -- Body region
  body_region TEXT NOT NULL,

  -- Pattern details
  pattern_name TEXT NOT NULL,
  tension_level INTEGER NOT NULL DEFAULT 5,
  frequency TEXT NOT NULL DEFAULT 'episodic',

  -- Triggers (JSONB arrays)
  emotional_triggers JSONB DEFAULT '[]'::jsonb,
  situational_triggers JSONB DEFAULT '[]'::jsonb,
  relational_triggers JSONB DEFAULT '[]'::jsonb,

  -- Tracking
  progression_timeline JSONB DEFAULT '[]'::jsonb,
  current_status TEXT NOT NULL DEFAULT 'active',

  -- Interventions
  interventions_that_work JSONB DEFAULT '[]'::jsonb,
  interventions_ineffective JSONB DEFAULT '[]'::jsonb,

  -- Pattern recognition
  linked_emotional_patterns JSONB DEFAULT '[]'::jsonb,
  linked_spiral_stages JSONB DEFAULT '[]'::jsonb,
  linked_archetypal_themes JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  first_noticed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_somatic_user_id ON somatic_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_somatic_body_region ON somatic_memories(body_region);
CREATE INDEX IF NOT EXISTS idx_somatic_status ON somatic_memories(current_status);
CREATE INDEX IF NOT EXISTS idx_somatic_last_updated ON somatic_memories(last_updated DESC);

COMMENT ON TABLE somatic_memories IS 'Body wisdom pattern tracking (MAIA Memory Palace Layer 3)';
