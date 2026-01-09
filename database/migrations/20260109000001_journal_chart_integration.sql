-- Journal-Chart Integration Tables
-- Links journal entries to astrological elements and tracks patterns

-- Table for linking journal entries to planets/houses
CREATE TABLE IF NOT EXISTS journal_chart_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  entry_id TEXT NOT NULL UNIQUE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('quick', 'holoflower', 'elemental')),
  planets JSONB DEFAULT '[]',
  houses JSONB DEFAULT '[]',
  dominant_element TEXT CHECK (dominant_element IN ('fire', 'water', 'earth', 'air', NULL)),
  active_transits JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_journal_chart_links_user_id ON journal_chart_links(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_chart_links_created_at ON journal_chart_links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_chart_links_planets ON journal_chart_links USING GIN(planets);
CREATE INDEX IF NOT EXISTS idx_journal_chart_links_houses ON journal_chart_links USING GIN(houses);
CREATE INDEX IF NOT EXISTS idx_journal_chart_links_element ON journal_chart_links(dominant_element) WHERE dominant_element IS NOT NULL;

-- Table for detected journaling patterns
CREATE TABLE IF NOT EXISTS journal_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('planet_timing', 'house_theme', 'element_cycle', 'transit_correlation')),
  description TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.5,
  examples JSONB DEFAULT '[]',
  insight TEXT,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pattern_type, description)
);

-- Indexes for pattern queries
CREATE INDEX IF NOT EXISTS idx_journal_patterns_user_id ON journal_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_patterns_type ON journal_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_journal_patterns_confidence ON journal_patterns(confidence DESC);

-- Comment for documentation
COMMENT ON TABLE journal_chart_links IS 'Links journal entries to astrological planets, houses, and elements';
COMMENT ON TABLE journal_patterns IS 'Detected patterns in journaling behavior related to astrological cycles';
