-- Pattern Reflections
-- Stores generated pattern insights and user responses to them

CREATE TABLE IF NOT EXISTS pattern_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- The insight itself
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'recurring_theme',     -- "You often explore X"
    'conditional',         -- "You tend to X when Y"
    'evolution',           -- "Your relationship with X has shifted"
    'integration',         -- "X and Y seem connected for you"
    'contrast',            -- "You approach X differently than Y"
    'emergence'            -- "A new pattern is forming around X"
  )),

  -- Natural language insight
  insight_text TEXT NOT NULL,

  -- What generated this insight
  source_patterns JSONB NOT NULL DEFAULT '[]',  -- Array of pattern IDs/types that led to this
  confidence FLOAT NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),

  -- Supporting evidence
  evidence JSONB DEFAULT '{}',  -- { memory_ids: [], episode_ids: [], occurrence_count: N }

  -- User response
  user_response TEXT CHECK (user_response IN ('resonates', 'partially', 'not_me', 'skip', NULL)),
  user_notes TEXT,
  responded_at TIMESTAMPTZ,

  -- Lifecycle
  surfaced_count INTEGER DEFAULT 0,  -- How many times shown to user
  last_surfaced_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,  -- Patterns can become stale

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pattern_reflections_user ON pattern_reflections(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pattern_reflections_type ON pattern_reflections(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_pattern_reflections_unseen ON pattern_reflections(user_id, surfaced_count)
  WHERE user_response IS NULL;
CREATE INDEX IF NOT EXISTS idx_pattern_reflections_resonant ON pattern_reflections(user_id)
  WHERE user_response = 'resonates';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON pattern_reflections TO soullab;

COMMENT ON TABLE pattern_reflections IS 'Pattern insights surfaced to users, with their responses';
COMMENT ON COLUMN pattern_reflections.pattern_type IS 'Category of pattern insight';
COMMENT ON COLUMN pattern_reflections.insight_text IS 'Natural language insight like "You often explore X when Y"';
COMMENT ON COLUMN pattern_reflections.user_response IS 'How the user responded to this insight';
