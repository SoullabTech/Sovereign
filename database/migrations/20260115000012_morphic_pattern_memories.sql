-- Morphic Pattern Memories Table
-- Detects and tracks archetypal cycles - universal patterns that repeat
-- Part of MAIA's 5-Layer Memory Palace - Layer 4

CREATE TABLE IF NOT EXISTS morphic_pattern_memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL UNIQUE,

  -- Pattern identification
  pattern_name TEXT NOT NULL,
  archetypal_pattern TEXT NOT NULL,
  current_phase TEXT,
  cyclical_nature BOOLEAN NOT NULL DEFAULT TRUE,

  -- Evolution tracking
  first_appearance TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_appearance TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  appearance_count INTEGER NOT NULL DEFAULT 1,
  integration_level INTEGER NOT NULL DEFAULT 1,
  current_status TEXT NOT NULL DEFAULT 'active',

  -- Pattern phases
  phases_completed JSONB DEFAULT '[]'::jsonb,
  current_lessons JSONB DEFAULT '[]'::jsonb,
  wisdom_gained JSONB DEFAULT '[]'::jsonb,

  -- Cross-references
  related_episodes JSONB DEFAULT '[]'::jsonb,
  related_somatic_patterns JSONB DEFAULT '[]'::jsonb,
  related_semantic_concepts JSONB DEFAULT '[]'::jsonb,

  -- Archetypal intelligence
  shadow_aspects JSONB DEFAULT '[]'::jsonb,
  light_aspects JSONB DEFAULT '[]'::jsonb,
  integration_opportunities JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_morphic_user_id ON morphic_pattern_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_morphic_archetypal ON morphic_pattern_memories(archetypal_pattern);
CREATE INDEX IF NOT EXISTS idx_morphic_status ON morphic_pattern_memories(current_status);
CREATE INDEX IF NOT EXISTS idx_morphic_last_appearance ON morphic_pattern_memories(last_appearance DESC);

COMMENT ON TABLE morphic_pattern_memories IS 'Archetypal pattern tracking (MAIA Memory Palace Layer 4)';
