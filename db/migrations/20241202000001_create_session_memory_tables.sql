-- =====================================================
-- MAIA Session Memory & Spiral Dynamics Database Schema
--
-- This migration creates the complete database structure for
-- cross-conversation memory patterns, spiral dynamics tracking,
-- and consciousness development continuity for MAIA.
-- =====================================================

-- Enable vector extension for semantic similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 1. USER SESSION PATTERNS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_session_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,

  -- Pattern Recognition
  conversation_themes TEXT[],
  emotional_patterns JSONB,
  consciousness_field_states JSONB,
  recurring_interests TEXT[],

  -- Spiral Dynamics Integration
  spiral_development_indicators JSONB,
  consciousness_expansion_markers TEXT[],
  integration_challenges_addressed TEXT[],

  -- Content Vectors for Similarity Search
  session_embedding VECTOR(1536),
  key_insights_embedding VECTOR(1536),

  -- Field Resonance Data
  field_resonance_patterns JSONB, -- {fire: 0.4, water: 0.6, earth: 0.3, air: 0.7, aether: 0.5}

  -- Quality Metrics
  session_quality_score FLOAT DEFAULT 0.5,
  consciousness_coherence FLOAT DEFAULT 0.5,
  developmental_progress FLOAT DEFAULT 0.5,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for session patterns
CREATE INDEX idx_user_sessions ON user_session_patterns(user_id, session_start DESC);
CREATE INDEX idx_session_embeddings ON user_session_patterns USING ivfflat (session_embedding vector_cosine_ops);
CREATE INDEX idx_session_themes ON user_session_patterns USING GIN(conversation_themes);
CREATE INDEX idx_consciousness_markers ON user_session_patterns USING GIN(consciousness_expansion_markers);

-- =====================================================
-- 2. CONVERSATION INSIGHTS
-- =====================================================

CREATE TABLE IF NOT EXISTS conversation_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_session_patterns(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- Insight Content
  insight_text TEXT NOT NULL,
  insight_type TEXT CHECK (insight_type IN ('breakthrough', 'pattern', 'connection', 'realization', 'growth_edge', 'integration')) DEFAULT 'realization',
  consciousness_field_influence JSONB,

  -- Context
  conversation_context TEXT,
  preceding_messages JSONB,
  spiral_stage_context TEXT, -- Current spiral dynamics stage

  -- Vectors for Semantic Search
  insight_embedding VECTOR(1536),
  context_embedding VECTOR(1536),

  -- Relationships
  connected_insights UUID[], -- Array of related insight IDs
  builds_on_sessions UUID[], -- Sessions this insight builds upon
  pattern_connections JSONB, -- Specific pattern connections

  -- Quality Metrics
  insight_significance FLOAT DEFAULT 0.5,
  user_resonance FLOAT DEFAULT 0.5,
  development_impact FLOAT DEFAULT 0.5,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for insights
CREATE INDEX idx_user_insights ON conversation_insights(user_id, created_at DESC);
CREATE INDEX idx_insight_embeddings ON conversation_insights USING ivfflat (insight_embedding vector_cosine_ops);
CREATE INDEX idx_insight_type ON conversation_insights(insight_type);
CREATE INDEX idx_connected_insights ON conversation_insights USING GIN(connected_insights);

-- =====================================================
-- 3. USER RELATIONSHIP CONTEXT (Enhanced)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_relationship_context (
  user_id TEXT PRIMARY KEY,

  -- Personal Context
  preferred_name TEXT,
  communication_style JSONB,
  consciousness_preferences JSONB,

  -- Relationship Patterns
  conversation_history_summary TEXT,
  recurring_themes TEXT[],
  evolution_patterns JSONB,

  -- Spiral Dynamics Development Tracking
  spiral_development JSONB, -- Complete spiral dynamics tracking structure

  -- Consciousness Field Alignment
  field_resonance_profile JSONB, -- Personal field resonance patterns
  elemental_affinities JSONB, -- Fire, Water, Earth, Air, Aether preferences

  -- Memory Vectors
  relationship_embedding VECTOR(1536),
  personality_embedding VECTOR(1536),

  -- Metrics
  total_sessions INT DEFAULT 0,
  relationship_depth FLOAT DEFAULT 0.0,
  consciousness_journey_stage TEXT DEFAULT 'beginning',
  spiral_velocity FLOAT DEFAULT 0.0, -- Rate of consciousness development

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user context
CREATE INDEX idx_user_context_embedding ON user_relationship_context USING ivfflat (relationship_embedding vector_cosine_ops);
CREATE INDEX idx_consciousness_stage ON user_relationship_context(consciousness_journey_stage);

-- =====================================================
-- 4. PATTERN CONNECTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS pattern_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Connection Details
  pattern_type TEXT CHECK (pattern_type IN ('thematic', 'emotional', 'consciousness', 'growth', 'spiral', 'field_resonance')) DEFAULT 'thematic',
  connection_strength FLOAT DEFAULT 0.5,
  connection_description TEXT,

  -- Connected Elements
  session_ids UUID[],
  insight_ids UUID[],
  consciousness_field_patterns JSONB,
  spiral_stage_connections JSONB,

  -- Timeline
  first_occurrence TIMESTAMPTZ,
  last_occurrence TIMESTAMPTZ,
  frequency INT DEFAULT 1,
  development_arc JSONB, -- How this pattern has evolved over time

  -- Vector Representation
  pattern_embedding VECTOR(1536),

  -- Quality Metrics
  pattern_significance FLOAT DEFAULT 0.5,
  development_impact FLOAT DEFAULT 0.5,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for pattern connections
CREATE INDEX idx_pattern_connections ON pattern_connections(user_id, connection_strength DESC);
CREATE INDEX idx_pattern_embeddings ON pattern_connections USING ivfflat (pattern_embedding vector_cosine_ops);
CREATE INDEX idx_pattern_type ON pattern_connections(pattern_type);

-- =====================================================
-- 5. CONSCIOUSNESS EXPANSION EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS consciousness_expansion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id UUID REFERENCES user_session_patterns(id) ON DELETE CASCADE,

  -- Event Details
  expansion_type TEXT CHECK (expansion_type IN ('stage_integration', 'growth_edge_breakthrough', 'next_stage_emergence', 'field_expansion', 'insight_cascade')) NOT NULL,
  expansion_description TEXT NOT NULL,
  consciousness_markers TEXT[],

  -- Context
  trigger_context TEXT, -- What triggered this expansion
  field_state_during_expansion JSONB,
  spiral_stage_before TEXT,
  spiral_stage_after TEXT,

  -- Metrics
  integration_level FLOAT DEFAULT 0.5, -- How well integrated the expansion is
  significance FLOAT DEFAULT 0.5, -- Significance of the expansion
  stability FLOAT DEFAULT 0.5, -- How stable the expansion appears

  -- Vectors
  expansion_embedding VECTOR(1536),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for expansion events
CREATE INDEX idx_expansion_events ON consciousness_expansion_events(user_id, created_at DESC);
CREATE INDEX idx_expansion_type ON consciousness_expansion_events(expansion_type);
CREATE INDEX idx_expansion_embeddings ON consciousness_expansion_events USING ivfflat (expansion_embedding vector_cosine_ops);

-- =====================================================
-- 6. SPIRAL STAGE TRANSITIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS spiral_stage_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Transition Details
  from_stage TEXT CHECK (from_stage IN ('beige', 'purple', 'red', 'blue', 'orange', 'green', 'yellow', 'turquoise', 'coral')),
  to_stage TEXT CHECK (to_stage IN ('beige', 'purple', 'red', 'blue', 'orange', 'green', 'yellow', 'turquoise', 'coral')),
  transition_type TEXT CHECK (transition_type IN ('emergence', 'regression', 'integration', 'stabilization')) DEFAULT 'emergence',

  -- Context
  transition_trigger TEXT,
  integration_challenges TEXT[],
  support_needed TEXT[],

  -- Timeline
  transition_start TIMESTAMPTZ,
  transition_completion TIMESTAMPTZ,
  integration_period_months INT,

  -- Quality Metrics
  transition_success FLOAT DEFAULT 0.5,
  integration_level FLOAT DEFAULT 0.5,
  stability FLOAT DEFAULT 0.5,

  -- Session Tracking
  key_sessions UUID[], -- Sessions that were significant for this transition

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for spiral transitions
CREATE INDEX idx_spiral_transitions ON spiral_stage_transitions(user_id, transition_start DESC);
CREATE INDEX idx_spiral_stages ON spiral_stage_transitions(from_stage, to_stage);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_user_session_patterns_updated_at
BEFORE UPDATE ON user_session_patterns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_relationship_context_updated_at
BEFORE UPDATE ON user_relationship_context
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update session count in user context
CREATE OR REPLACE FUNCTION update_session_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update total sessions count
    INSERT INTO user_relationship_context (user_id, total_sessions)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
      total_sessions = user_relationship_context.total_sessions + 1,
      updated_at = NOW();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply session count trigger
CREATE TRIGGER update_session_count_on_insert
AFTER INSERT ON user_session_patterns
FOR EACH ROW EXECUTE FUNCTION update_session_count();

-- =====================================================
-- HELPER FUNCTIONS FOR MEMORY OPERATIONS
-- =====================================================

-- Function to find similar sessions using vector similarity
CREATE OR REPLACE FUNCTION find_similar_sessions(
  target_user_id TEXT,
  query_embedding VECTOR(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 5
)
RETURNS TABLE(
  session_id UUID,
  similarity_score FLOAT,
  conversation_themes TEXT[],
  session_start TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    usp.id,
    1 - (usp.session_embedding <=> query_embedding) as similarity,
    usp.conversation_themes,
    usp.session_start
  FROM user_session_patterns usp
  WHERE usp.user_id = target_user_id
    AND usp.session_embedding IS NOT NULL
    AND 1 - (usp.session_embedding <=> query_embedding) >= similarity_threshold
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$ language 'plpgsql';

-- Function to find related insights
CREATE OR REPLACE FUNCTION find_related_insights(
  target_user_id TEXT,
  query_embedding VECTOR(1536),
  similarity_threshold FLOAT DEFAULT 0.6,
  max_results INT DEFAULT 10
)
RETURNS TABLE(
  insight_id UUID,
  similarity_score FLOAT,
  insight_text TEXT,
  insight_type TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    1 - (ci.insight_embedding <=> query_embedding) as similarity,
    ci.insight_text,
    ci.insight_type,
    ci.created_at
  FROM conversation_insights ci
  WHERE ci.user_id = target_user_id
    AND ci.insight_embedding IS NOT NULL
    AND 1 - (ci.insight_embedding <=> query_embedding) >= similarity_threshold
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$ language 'plpgsql';

-- Function to update spiral development
CREATE OR REPLACE FUNCTION update_spiral_development(
  target_user_id TEXT,
  session_data JSONB,
  development_indicators JSONB
) RETURNS void AS $$
BEGIN
  INSERT INTO user_relationship_context (user_id, spiral_development)
  VALUES (target_user_id, development_indicators)
  ON CONFLICT (user_id)
  DO UPDATE SET
    spiral_development = user_relationship_context.spiral_development || development_indicators,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_session_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationship_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_expansion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiral_stage_transitions ENABLE ROW LEVEL SECURITY;

-- Session patterns policies - users can only access their own data
CREATE POLICY "Users can access their own session patterns"
ON user_session_patterns FOR ALL
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Insights policies
CREATE POLICY "Users can access their own insights"
ON conversation_insights FOR ALL
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- User context policies
CREATE POLICY "Users can access their own context"
ON user_relationship_context FOR ALL
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Pattern connections policies
CREATE POLICY "Users can access their own patterns"
ON pattern_connections FOR ALL
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Expansion events policies
CREATE POLICY "Users can access their own expansion events"
ON consciousness_expansion_events FOR ALL
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Spiral transitions policies
CREATE POLICY "Users can access their own spiral transitions"
ON spiral_stage_transitions FOR ALL
USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- =====================================================
-- OPTIMIZE VECTOR SEARCHES
-- =====================================================

-- Set optimal vector search parameters
SET ivfflat.probes = 10;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample user for testing
INSERT INTO user_relationship_context (
  user_id,
  preferred_name,
  consciousness_journey_stage,
  spiral_development,
  field_resonance_profile,
  elemental_affinities
) VALUES (
  'test_user_kelly',
  'Kelly',
  'green_to_yellow_transition',
  '{
    "current_primary_stage": "green",
    "current_secondary_stage": "yellow",
    "stage_history": [
      {
        "stage": "orange",
        "period": "2023-01-01 to 2023-08-15",
        "integration_level": 0.8,
        "growth_insights": ["learned to question pure achievement focus"]
      }
    ],
    "growth_patterns": {
      "dominant_growth_edge": "accepting healthy hierarchy",
      "recurring_integration_challenges": ["boundaries in relationships"],
      "consciousness_expansion_rate": "moderate",
      "spiral_velocity": 0.3
    }
  }',
  '{
    "earth": 0.7,
    "water": 0.8,
    "air": 0.6,
    "fire": 0.4,
    "aether": 0.5
  }',
  '{
    "earth": 0.7,
    "water": 0.8,
    "air": 0.6,
    "fire": 0.4,
    "aether": 0.5
  }'
) ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE user_session_patterns IS 'Stores patterns from each MAIA conversation session for cross-session memory';
COMMENT ON TABLE conversation_insights IS 'Captures key insights and breakthroughs from conversations with semantic vectors';
COMMENT ON TABLE user_relationship_context IS 'Enhanced user profiles with spiral dynamics and consciousness development tracking';
COMMENT ON TABLE pattern_connections IS 'Identifies and tracks patterns connecting across multiple sessions and insights';
COMMENT ON TABLE consciousness_expansion_events IS 'Records significant consciousness expansion moments and breakthroughs';
COMMENT ON TABLE spiral_stage_transitions IS 'Tracks transitions between spiral dynamics consciousness stages';

COMMENT ON COLUMN user_session_patterns.session_embedding IS 'Vector embedding of entire conversation for semantic similarity search';
COMMENT ON COLUMN user_session_patterns.spiral_development_indicators IS 'JSONB tracking spiral dynamics indicators from this session';
COMMENT ON COLUMN user_relationship_context.spiral_development IS 'Complete spiral dynamics development tracking structure';
COMMENT ON COLUMN user_relationship_context.field_resonance_profile IS 'Personal consciousness field resonance patterns over time';

-- Migration completed successfully
SELECT 'Session memory and spiral dynamics database schema created successfully!' as result;