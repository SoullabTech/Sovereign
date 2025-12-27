-- Migration: Relationship Memory Tables
-- Created: 2025-12-27
-- Purpose: Support comprehensive relational memory and continuity tracking
--
-- Tables created:
-- - conversation_themes: Track recurring conversation topics
-- - breakthrough_moments: Store key insights and realizations
-- - relationship_patterns: Identify recurring behavioral/emotional patterns

BEGIN;

-- =================================================================
-- CONVERSATION THEMES
-- Track what members talk about over time
-- =================================================================
CREATE TABLE IF NOT EXISTS conversation_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  theme TEXT NOT NULL,
  first_mentioned TIMESTAMP NOT NULL DEFAULT NOW(),
  last_mentioned TIMESTAMP NOT NULL DEFAULT NOW(),
  occurrences INTEGER NOT NULL DEFAULT 1,
  significance DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (significance >= 0 AND significance <= 1),
  context TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, theme)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_conversation_themes_user
  ON conversation_themes(user_id);

-- Index for finding recent themes
CREATE INDEX IF NOT EXISTS idx_conversation_themes_last_mentioned
  ON conversation_themes(last_mentioned DESC);

-- Index for finding significant themes
CREATE INDEX IF NOT EXISTS idx_conversation_themes_significance
  ON conversation_themes(significance DESC);

COMMENT ON TABLE conversation_themes IS
'Tracks recurring conversation topics and their significance over time. Enables MAIA to remember what matters to each member.';

COMMENT ON COLUMN conversation_themes.significance IS
'0-1 scale indicating how important this theme is to the member. Auto-calculated from frequency and emotional weight.';

-- =================================================================
-- BREAKTHROUGH MOMENTS
-- Track key insights and realizations
-- =================================================================
CREATE TABLE IF NOT EXISTS breakthrough_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  insight TEXT NOT NULL,
  element TEXT,  -- Which element (fire/water/earth/air/aether) this relates to
  integrated BOOLEAN NOT NULL DEFAULT FALSE,  -- Has this insight been integrated?
  related_themes TEXT[] DEFAULT ARRAY[]::TEXT[],  -- Themes this breakthrough relates to
  conversation_id TEXT,  -- Optional: which conversation produced this
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_breakthrough_moments_user
  ON breakthrough_moments(user_id);

-- Index for finding recent breakthroughs
CREATE INDEX IF NOT EXISTS idx_breakthrough_moments_timestamp
  ON breakthrough_moments(timestamp DESC);

-- Index for finding unintegrated breakthroughs
CREATE INDEX IF NOT EXISTS idx_breakthrough_moments_integrated
  ON breakthrough_moments(integrated) WHERE integrated = FALSE;

-- Index for finding breakthroughs by element
CREATE INDEX IF NOT EXISTS idx_breakthrough_moments_element
  ON breakthrough_moments(element) WHERE element IS NOT NULL;

COMMENT ON TABLE breakthrough_moments IS
'Captures key insights, realizations, and "aha moments" in members journeys. Allows MAIA to reference growth milestones.';

COMMENT ON COLUMN breakthrough_moments.integrated IS
'Whether this insight has been integrated into practice/life. Used to track which breakthroughs need support.';

-- =================================================================
-- RELATIONSHIP PATTERNS
-- Identify recurring patterns in member behavior/experience
-- =================================================================
CREATE TABLE IF NOT EXISTS relationship_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  pattern TEXT NOT NULL,  -- Description of the pattern
  frequency INTEGER NOT NULL DEFAULT 1,  -- How many times we've seen this
  first_seen TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
  evolution TEXT,  -- How this pattern has changed/evolved
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, pattern)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_relationship_patterns_user
  ON relationship_patterns(user_id);

-- Index for finding frequent patterns
CREATE INDEX IF NOT EXISTS idx_relationship_patterns_frequency
  ON relationship_patterns(frequency DESC);

-- Index for finding emerging patterns (2-4 occurrences)
CREATE INDEX IF NOT EXISTS idx_relationship_patterns_emerging
  ON relationship_patterns(frequency)
  WHERE frequency >= 2 AND frequency <= 4;

COMMENT ON TABLE relationship_patterns IS
'Tracks recurring patterns in how members show up, process, and relate. Enables pattern recognition and evolution tracking.';

COMMENT ON COLUMN relationship_patterns.evolution IS
'Free-text description of how this pattern has changed over time. Updated when significant shifts occur.';

-- =================================================================
-- TRIGGERS FOR UPDATED_AT
-- =================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_themes_updated_at
  BEFORE UPDATE ON conversation_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breakthrough_moments_updated_at
  BEFORE UPDATE ON breakthrough_moments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationship_patterns_updated_at
  BEFORE UPDATE ON relationship_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 014: Relationship Memory Tables created successfully';
  RAISE NOTICE '  - conversation_themes: Track recurring topics';
  RAISE NOTICE '  - breakthrough_moments: Store key insights';
  RAISE NOTICE '  - relationship_patterns: Identify recurring patterns';
  RAISE NOTICE 'MAIA can now remember and reference relational evolution!';
END $$;
