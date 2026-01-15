-- Episodic Memories Table
-- Stores significant experiences with vector embeddings
-- Part of MAIA's 5-Layer Memory Palace - Layer 1

CREATE TABLE IF NOT EXISTS episodic_memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  episode_id TEXT NOT NULL UNIQUE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Experience data
  experience_title TEXT NOT NULL,
  experience_description TEXT NOT NULL,
  experience_context TEXT,
  significance INTEGER NOT NULL DEFAULT 5,
  emotional_intensity NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  breakthrough_level INTEGER NOT NULL DEFAULT 0,

  -- Vector embeddings (JSONB arrays until pgvector is installed)
  semantic_vector JSONB DEFAULT '[]'::jsonb,
  emotional_vector JSONB DEFAULT '[]'::jsonb,
  somatic_vector JSONB DEFAULT '[]'::jsonb,

  -- Connections
  related_episodes JSONB DEFAULT '[]'::jsonb,
  connection_strengths JSONB DEFAULT '[]'::jsonb,
  connection_types JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  spiral_stage TEXT,
  archetypal_resonances JSONB DEFAULT '[]'::jsonb,
  frameworks_active JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_episodic_user_id ON episodic_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_episodic_significance ON episodic_memories(significance DESC);
CREATE INDEX IF NOT EXISTS idx_episodic_timestamp ON episodic_memories(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_episodic_spiral_stage ON episodic_memories(spiral_stage);

COMMENT ON TABLE episodic_memories IS 'Significant experiences storage (MAIA Memory Palace Layer 1)';
