-- =====================================================
-- Dream Journal Tables Migration
--
-- Dreams as episodes in the bardic memory pathway.
-- Preserves dream text, symbols, archetypes, and analysis
-- for MAIA's deepening understanding of the dreamer.
-- =====================================================

CREATE TABLE IF NOT EXISTS dream_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Core dream content
  title TEXT,
  dream_text TEXT NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),

  -- Symbol extraction (populated on record)
  symbols TEXT[],
  motifs TEXT[],
  archetypes TEXT[],

  -- User metadata
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  lucidity_level INTEGER CHECK (lucidity_level BETWEEN 0 AND 5),
  emotional_tone TEXT,

  -- Analysis results (populated by analyze endpoint)
  analysis JSONB,
  analysis_generated_at TIMESTAMPTZ,

  -- Episode linkage (for bardic memory integration)
  episode_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_dream_entries_user_id ON dream_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_dream_entries_occurred_at ON dream_entries(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_dream_entries_symbols ON dream_entries USING GIN(symbols);
CREATE INDEX IF NOT EXISTS idx_dream_entries_archetypes ON dream_entries USING GIN(archetypes);
CREATE INDEX IF NOT EXISTS idx_dream_entries_tags ON dream_entries USING GIN(tags);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_dream_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dream_entries_updated_at ON dream_entries;
CREATE TRIGGER dream_entries_updated_at
  BEFORE UPDATE ON dream_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_dream_entries_updated_at();

-- =====================================================
-- Dream Patterns Table
-- Tracks recurring symbols and themes across dreams
-- =====================================================

CREATE TABLE IF NOT EXISTS dream_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Pattern identification
  pattern_type TEXT CHECK (pattern_type IN ('symbol', 'motif', 'archetype', 'theme', 'setting', 'character')) NOT NULL,
  pattern_value TEXT NOT NULL,

  -- Frequency tracking
  occurrence_count INTEGER DEFAULT 1,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),

  -- Associated dreams
  dream_ids UUID[],

  -- MAIA interpretation
  interpretation TEXT,
  significance_score FLOAT DEFAULT 0.5,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one pattern per user per type+value
  UNIQUE(user_id, pattern_type, pattern_value)
);

CREATE INDEX IF NOT EXISTS idx_dream_patterns_user ON dream_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_dream_patterns_type ON dream_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_dream_patterns_significance ON dream_patterns(user_id, significance_score DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS dream_patterns_updated_at ON dream_patterns;
CREATE TRIGGER dream_patterns_updated_at
  BEFORE UPDATE ON dream_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_dream_entries_updated_at();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE dream_entries IS 'Individual dream records with extracted symbols and analysis';
COMMENT ON TABLE dream_patterns IS 'Recurring dream patterns tracked across a user''s dream history';
COMMENT ON COLUMN dream_entries.episode_id IS 'Links to episodes table for bardic memory integration';
COMMENT ON COLUMN dream_entries.lucidity_level IS '0=normal, 1-5=increasing lucidity awareness';

SELECT 'Dream journal tables created successfully!' as result;
