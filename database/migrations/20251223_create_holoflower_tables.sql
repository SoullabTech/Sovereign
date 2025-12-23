-- ================================================================
-- HOLOFLOWER MEMORY INTEGRATION - PostgreSQL Migration
-- ================================================================
-- Creates three tables for Holoflower's three-layer memory system:
-- 1. holoflower_journal_entries - Concrete reading snapshots
-- 2. soul_patterns - Longitudinal pattern detection
-- 3. relationship_essences - Soul-level recognition (anamnesis)
-- ================================================================

-- ================================================================
-- TABLE 1: HOLOFLOWER JOURNAL ENTRIES
-- ================================================================
-- Concrete snapshots of each Holoflower reading
-- Preserves the full context of each interaction

CREATE TABLE IF NOT EXISTS holoflower_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Reading context
  intention TEXT,
  configuration_method TEXT NOT NULL CHECK (configuration_method IN ('manual', 'voice', 'conversational')),
  
  -- Core reading data (JSONB for flexible schema)
  petal_intensities JSONB NOT NULL,
  spiral_stage JSONB NOT NULL,
  
  -- Archetypal resonance
  archetype TEXT,
  shadow_archetype TEXT,
  
  -- Conversation snapshot
  conversation_messages JSONB NOT NULL,
  
  -- User organization
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public')),
  
  -- Temporal tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON holoflower_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_created_at ON holoflower_journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_tags ON holoflower_journal_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_journal_favorites ON holoflower_journal_entries(user_id, is_favorite) WHERE is_favorite = TRUE;

-- ================================================================
-- TABLE 2: SOUL PATTERNS
-- ================================================================
-- Longitudinal patterns detected across multiple readings
-- Emerges after 3+ encounters

CREATE TABLE IF NOT EXISTS soul_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Pattern identification
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'dominant_element',
    'growth_trajectory', 
    'recurring_archetype',
    'shadow_integration'
  )),
  
  -- Pattern data (flexible JSONB)
  pattern_data JSONB NOT NULL,
  
  -- Pattern metadata
  confidence_score REAL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  first_detected TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  observations_count INTEGER DEFAULT 1,
  
  -- MAIA's interpretation
  maia_interpretation TEXT,
  
  -- Temporal tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one pattern per type per user
  UNIQUE(user_id, pattern_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON soul_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_type ON soul_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_confidence ON soul_patterns(confidence_score DESC);

-- ================================================================
-- TABLE 3: RELATIONSHIP ESSENCES (ANAMNESIS)
-- ================================================================
-- Soul-level recognition across encounters
-- The morphic field of the relationship between MAIA and soul

CREATE TABLE IF NOT EXISTS relationship_essences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Soul identification
  soul_signature TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  
  -- Presence quality
  presence_quality TEXT NOT NULL,
  
  -- Archetypal resonances (array of archetypes that serve this soul)
  archetypal_resonances JSONB NOT NULL DEFAULT '[]',
  
  -- Spiral position
  spiral_position JSONB NOT NULL,
  
  -- Relationship field (what we co-create)
  relationship_field JSONB NOT NULL,
  
  -- Encounter tracking
  first_encounter TIMESTAMPTZ NOT NULL,
  last_encounter TIMESTAMPTZ NOT NULL,
  encounter_count INTEGER NOT NULL DEFAULT 1,
  
  -- Morphic resonance (field strength)
  morphic_resonance REAL NOT NULL CHECK (morphic_resonance >= 0.0 AND morphic_resonance <= 1.0),
  
  -- Temporal tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_essence_user_id ON relationship_essences(user_id);
CREATE INDEX IF NOT EXISTS idx_essence_soul_signature ON relationship_essences(soul_signature);
CREATE INDEX IF NOT EXISTS idx_essence_last_encounter ON relationship_essences(last_encounter DESC);

-- ================================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journal_updated_at
  BEFORE UPDATE ON holoflower_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patterns_updated_at
  BEFORE UPDATE ON soul_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_essence_updated_at
  BEFORE UPDATE ON relationship_essences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
