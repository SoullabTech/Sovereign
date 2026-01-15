-- =====================================================
-- COLLECTIVE BREAKTHROUGH SYSTEM
-- Holonic Memory Architecture for MAIA
--
-- Individual breakthroughs → Anonymized patterns → Collective wisdom
-- Privacy-preserving: Only patterns, never personal content
-- =====================================================

BEGIN;

-- =====================================================
-- 1. COLLECTIVE BREAKTHROUGHS TABLE (Anonymized Patterns)
-- =====================================================

CREATE TABLE IF NOT EXISTS collective_breakthroughs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Anonymized identifier (SHA-256 hash of userId + salt)
  pattern_id TEXT NOT NULL,

  -- Catalyst information (what triggered the breakthrough)
  catalyst_type TEXT NOT NULL CHECK (catalyst_type IN (
    'question', 'reflection', 'practice', 'archetypal_shift', 'elemental_transition'
  )),
  archetype_from TEXT,
  archetype_to TEXT,
  elemental_phase_from TEXT,
  elemental_phase_to TEXT,
  practice_offered TEXT,

  -- Transformation signature (semantic, not content)
  transformation_type TEXT NOT NULL CHECK (transformation_type IN (
    'insight', 'embodiment', 'integration', 'release', 'awakening'
  )),
  emotional_shift TEXT,  -- e.g., "stuck → flowing"
  body_involvement BOOLEAN DEFAULT false,
  duration_to_breakthrough INTEGER DEFAULT 0,  -- Days

  -- Outcome metrics
  integration_level TEXT CHECK (integration_level IN ('emerging', 'stabilizing', 'embodied')),
  follow_through BOOLEAN DEFAULT false,
  resonance_strength DECIMAL(3,2) DEFAULT 0.5 CHECK (resonance_strength >= 0 AND resonance_strength <= 1),

  -- Field conditions when breakthrough occurred
  spiralogic_phase TEXT,
  dominant_element TEXT,
  moon_phase TEXT,
  collective_phase TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for pattern queries
CREATE INDEX IF NOT EXISTS idx_collective_breakthroughs_created
  ON collective_breakthroughs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collective_breakthroughs_phase
  ON collective_breakthroughs(spiralogic_phase);
CREATE INDEX IF NOT EXISTS idx_collective_breakthroughs_element
  ON collective_breakthroughs(dominant_element);
CREATE INDEX IF NOT EXISTS idx_collective_breakthroughs_catalyst
  ON collective_breakthroughs(catalyst_type);
CREATE INDEX IF NOT EXISTS idx_collective_breakthroughs_archetype_shift
  ON collective_breakthroughs(archetype_from, archetype_to)
  WHERE archetype_from IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collective_breakthroughs_elemental_shift
  ON collective_breakthroughs(elemental_phase_from, elemental_phase_to)
  WHERE elemental_phase_from IS NOT NULL;

COMMENT ON TABLE collective_breakthroughs IS
'Privacy-preserving breakthrough patterns for collective wisdom. No personal content stored.';

-- =====================================================
-- 2. BREAKTHROUGH CLUSTERS (Synthesized Wisdom)
-- =====================================================

CREATE TABLE IF NOT EXISTS breakthrough_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cluster identity
  cluster_id TEXT UNIQUE NOT NULL,
  theme TEXT NOT NULL,  -- e.g., "Fire → Water through slowing"

  -- Aggregated patterns
  pattern_ids TEXT[] DEFAULT '{}',
  common_catalysts TEXT[] DEFAULT '{}',
  success_indicators TEXT[] DEFAULT '{}',

  -- Synthesized wisdom
  typical_timeline_days INTEGER,
  collective_wisdom TEXT,
  practices_that_work TEXT[] DEFAULT '{}',

  -- Metrics
  pattern_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.0,
  last_pattern_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breakthrough_clusters_theme
  ON breakthrough_clusters USING gin(to_tsvector('english', theme));
CREATE INDEX IF NOT EXISTS idx_breakthrough_clusters_pattern_count
  ON breakthrough_clusters(pattern_count DESC);

COMMENT ON TABLE breakthrough_clusters IS
'Aggregated breakthrough patterns synthesized into collective wisdom themes.';

-- =====================================================
-- 3. FIELD STATE SNAPSHOTS (Historical Field Data)
-- =====================================================

CREATE TABLE IF NOT EXISTS field_state_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Field coherence metrics
  field_coherence DECIMAL(3,2) DEFAULT 0.5 CHECK (field_coherence >= 0 AND field_coherence <= 1),
  field_resonance DECIMAL(3,2) DEFAULT 0.5 CHECK (field_resonance >= 0 AND field_resonance <= 1),

  -- Participants
  active_participants INTEGER DEFAULT 0,

  -- Elemental balance (JSONB for flexibility)
  collective_elemental_balance JSONB DEFAULT '{"fire": 0.5, "water": 0.5, "earth": 0.5, "air": 0.5, "aether": 0.5}',

  -- Dominant archetypes (JSONB array)
  dominant_archetypes JSONB DEFAULT '[]',
  emerging_archetypes JSONB DEFAULT '[]',

  -- Growth metrics
  breakthrough_potential DECIMAL(3,2) DEFAULT 0.5,
  integration_need DECIMAL(3,2) DEFAULT 0.5,
  collective_growth_rate DECIMAL(3,2) DEFAULT 0.0,

  -- Field weather description
  field_weather TEXT,
  active_movements TEXT[] DEFAULT '{}',

  -- Timestamp
  snapshot_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_snapshots_time
  ON field_state_snapshots(snapshot_at DESC);

COMMENT ON TABLE field_state_snapshots IS
'Periodic snapshots of collective field state for trend analysis.';

-- =====================================================
-- 4. ARCHETYPE WISDOM LIBRARY (Cross-Archetype Sharing)
-- =====================================================

CREATE TABLE IF NOT EXISTS archetype_wisdom_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Archetype this wisdom applies to
  archetype TEXT NOT NULL,

  -- Wisdom content
  wisdom_type TEXT CHECK (wisdom_type IN ('catalyst', 'practice', 'transition', 'blocker', 'timing')),
  wisdom_content TEXT NOT NULL,

  -- Source (where this wisdom came from)
  derived_from_clusters TEXT[] DEFAULT '{}',
  pattern_count INTEGER DEFAULT 0,

  -- Effectiveness metrics
  success_rate DECIMAL(3,2) DEFAULT 0.0,
  applicable_phases TEXT[] DEFAULT '{}',
  applicable_elements TEXT[] DEFAULT '{}',

  -- Cross-archetype resonance
  resonates_with_archetypes TEXT[] DEFAULT '{}',
  resonance_strength DECIMAL(3,2) DEFAULT 0.0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archetype_wisdom_archetype
  ON archetype_wisdom_library(archetype);
CREATE INDEX IF NOT EXISTS idx_archetype_wisdom_type
  ON archetype_wisdom_library(wisdom_type);
CREATE INDEX IF NOT EXISTS idx_archetype_wisdom_resonance
  ON archetype_wisdom_library USING gin(resonates_with_archetypes);

COMMENT ON TABLE archetype_wisdom_library IS
'Synthesized wisdom per archetype, with cross-archetype resonance for sharing.';

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to get active field movements (last 30 days)
CREATE OR REPLACE FUNCTION get_active_field_movements(min_count INTEGER DEFAULT 3)
RETURNS TABLE(
  movement_type TEXT,
  movement_description TEXT,
  participant_count BIGINT
) AS $$
BEGIN
  -- Elemental transitions
  RETURN QUERY
  SELECT
    'elemental_transition'::TEXT,
    elemental_phase_from || ' → ' || elemental_phase_to,
    COUNT(*)
  FROM collective_breakthroughs
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND elemental_phase_from IS NOT NULL
    AND elemental_phase_to IS NOT NULL
  GROUP BY elemental_phase_from, elemental_phase_to
  HAVING COUNT(*) >= min_count;

  -- Archetypal shifts
  RETURN QUERY
  SELECT
    'archetypal_shift'::TEXT,
    archetype_from || ' → ' || archetype_to,
    COUNT(*)
  FROM collective_breakthroughs
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND archetype_from IS NOT NULL
    AND archetype_to IS NOT NULL
  GROUP BY archetype_from, archetype_to
  HAVING COUNT(*) >= min_count;
END;
$$ LANGUAGE plpgsql;

-- Function to find relevant patterns for user's current state
CREATE OR REPLACE FUNCTION get_relevant_breakthrough_patterns(
  p_phase TEXT,
  p_element TEXT,
  p_archetype TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  id UUID,
  catalyst_type TEXT,
  transformation_type TEXT,
  emotional_shift TEXT,
  practice_offered TEXT,
  resonance_strength DECIMAL,
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cb.id,
    cb.catalyst_type,
    cb.transformation_type,
    cb.emotional_shift,
    cb.practice_offered,
    cb.resonance_strength,
    (
      CASE WHEN cb.spiralogic_phase = p_phase THEN 3 ELSE 0 END +
      CASE WHEN cb.dominant_element = p_element THEN 2 ELSE 0 END +
      CASE WHEN p_archetype IS NOT NULL AND (cb.archetype_from = p_archetype OR cb.archetype_to = p_archetype) THEN 3 ELSE 0 END +
      CASE WHEN cb.created_at >= NOW() - INTERVAL '7 days' THEN 2 ELSE 0 END
    )::INTEGER as relevance_score
  FROM collective_breakthroughs cb
  WHERE cb.created_at >= NOW() - INTERVAL '30 days'
    AND (cb.spiralogic_phase = p_phase OR cb.dominant_element = p_element)
  ORDER BY relevance_score DESC, cb.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Auto-update timestamp on breakthrough_clusters
CREATE OR REPLACE FUNCTION update_breakthrough_cluster_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cluster_timestamp ON breakthrough_clusters;
CREATE TRIGGER trigger_update_cluster_timestamp
  BEFORE UPDATE ON breakthrough_clusters
  FOR EACH ROW EXECUTE FUNCTION update_breakthrough_cluster_timestamp();

-- Auto-update timestamp on archetype_wisdom_library
DROP TRIGGER IF EXISTS trigger_update_wisdom_timestamp ON archetype_wisdom_library;
CREATE TRIGGER trigger_update_wisdom_timestamp
  BEFORE UPDATE ON archetype_wisdom_library
  FOR EACH ROW EXECUTE FUNCTION update_breakthrough_cluster_timestamp();

COMMIT;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Collective breakthrough system tables created successfully!';
END $$;
