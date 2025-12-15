-- ============================================================================
-- MAIA 5-LAYER MEMORY PALACE - Complete Implementation
-- ============================================================================
-- Phase 2, 3, and 4 memory systems
-- Date: December 13, 2025
-- ============================================================================

-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- LAYER 1: EPISODIC MEMORY (Vector-Enabled Experiences)
-- ============================================================================

CREATE TABLE IF NOT EXISTS episodic_memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  episode_id TEXT NOT NULL UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Experience data
  experience_title TEXT NOT NULL,
  experience_description TEXT NOT NULL,
  experience_context TEXT,
  significance INTEGER CHECK (significance >= 1 AND significance <= 10),
  emotional_intensity DECIMAL(3,2) CHECK (emotional_intensity >= 0 AND emotional_intensity <= 1),
  breakthrough_level INTEGER CHECK (breakthrough_level >= 0 AND breakthrough_level <= 10),

  -- Vector embeddings for semantic search
  semantic_vector vector(768),  -- 768-dimensional semantic embeddings
  emotional_vector vector(256), -- 256-dimensional emotional embeddings
  somatic_vector vector(128),   -- 128-dimensional somatic embeddings

  -- Connections to other episodes
  related_episodes TEXT[] DEFAULT '{}',
  connection_strengths DECIMAL(3,2)[] DEFAULT '{}',
  connection_types TEXT[] DEFAULT '{}', -- similar, contrast, progression, pattern, insight

  -- Metadata
  spiral_stage TEXT,
  archetypal_resonances TEXT[] DEFAULT '{}',
  frameworks_active TEXT[] DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_episodic_user_id ON episodic_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_episodic_timestamp ON episodic_memories(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_episodic_significance ON episodic_memories(significance DESC);

-- Vector similarity search index (using HNSW for fast approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_episodic_semantic_vector ON episodic_memories
  USING hnsw (semantic_vector vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_episodic_emotional_vector ON episodic_memories
  USING hnsw (emotional_vector vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_episodic_somatic_vector ON episodic_memories
  USING hnsw (somatic_vector vector_cosine_ops);

-- ============================================================================
-- LAYER 2: SEMANTIC MEMORY (Concept Learning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS semantic_memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  concept_id TEXT NOT NULL UNIQUE,

  -- Concept data
  concept_name TEXT NOT NULL,
  concept_category TEXT, -- framework, archetype, somatic_pattern, element, stage
  definition TEXT,

  -- Learning progression
  first_encounter TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reinforcement TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mastery_level INTEGER CHECK (mastery_level >= 1 AND mastery_level <= 10) DEFAULT 1,
  understanding_depth DECIMAL(3,2) DEFAULT 0.1,

  -- Application tracking
  times_applied INTEGER DEFAULT 0,
  successful_applications INTEGER DEFAULT 0,
  contexts_used TEXT[] DEFAULT '{}',

  -- Integration
  related_concepts TEXT[] DEFAULT '{}',
  prerequisite_concepts TEXT[] DEFAULT '{}',
  builds_toward_concepts TEXT[] DEFAULT '{}',

  -- Evidence of understanding
  user_demonstrations JSONB DEFAULT '[]'::jsonb, -- [{timestamp, context, quality}]

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_semantic_user_id ON semantic_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_semantic_mastery ON semantic_memories(mastery_level DESC);
CREATE INDEX IF NOT EXISTS idx_semantic_category ON semantic_memories(concept_category);

-- ============================================================================
-- LAYER 3: SOMATIC MEMORY (Body Wisdom Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS somatic_memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL UNIQUE,

  -- Body region
  body_region TEXT NOT NULL, -- shoulders, chest, throat, jaw, back, belly, hips, legs, full_body

  -- Pattern details
  pattern_name TEXT NOT NULL,
  tension_level INTEGER CHECK (tension_level >= 1 AND tension_level <= 10),
  frequency TEXT, -- chronic, episodic, rare, seasonal

  -- Triggers
  emotional_triggers TEXT[] DEFAULT '{}',
  situational_triggers TEXT[] DEFAULT '{}',
  relational_triggers TEXT[] DEFAULT '{}',

  -- Tracking timeline
  progression_timeline JSONB DEFAULT '[]'::jsonb, -- [{date, tensionLevel, context, spiralStage}]
  current_status TEXT, -- active, improving, resolved, monitoring

  -- Interventions
  interventions_that_work JSONB DEFAULT '[]'::jsonb, -- [{intervention, effectiveness, lastUsed}]
  interventions_ineffective JSONB DEFAULT '[]'::jsonb,

  -- Pattern recognition
  linked_emotional_patterns TEXT[] DEFAULT '{}',
  linked_spiral_stages TEXT[] DEFAULT '{}',
  linked_archetypal_themes TEXT[] DEFAULT '{}',

  first_noticed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_somatic_user_id ON somatic_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_somatic_body_region ON somatic_memories(body_region);
CREATE INDEX IF NOT EXISTS idx_somatic_status ON somatic_memories(current_status);

-- ============================================================================
-- LAYER 4: MORPHIC PATTERN MEMORY (Archetypal Cycles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS morphic_pattern_memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL UNIQUE,

  -- Pattern identification
  pattern_name TEXT NOT NULL,
  archetypal_pattern TEXT NOT NULL, -- heroes_journey, dark_night, sacred_wound, inner_marriage, axis_mundi, rebirth, initiation
  current_phase TEXT,
  cyclical_nature BOOLEAN DEFAULT true,

  -- Evolution tracking
  first_appearance TIMESTAMP WITH TIME ZONE,
  last_appearance TIMESTAMP WITH TIME ZONE,
  appearance_count INTEGER DEFAULT 1,
  integration_level INTEGER CHECK (integration_level >= 1 AND integration_level <= 10) DEFAULT 1,
  current_status TEXT, -- active, dormant, integrated, transforming

  -- Pattern phases
  phases_completed TEXT[] DEFAULT '{}',
  current_lessons JSONB DEFAULT '[]'::jsonb,
  wisdom_gained JSONB DEFAULT '[]'::jsonb,

  -- Cross-references
  related_episodes TEXT[] DEFAULT '{}', -- Episode IDs
  related_somatic_patterns TEXT[] DEFAULT '{}', -- Somatic pattern IDs
  related_semantic_concepts TEXT[] DEFAULT '{}', -- Semantic concept IDs

  -- Archetypal intelligence
  shadow_aspects JSONB DEFAULT '[]'::jsonb,
  light_aspects JSONB DEFAULT '[]'::jsonb,
  integration_opportunities JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_morphic_user_id ON morphic_pattern_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_morphic_archetypal_pattern ON morphic_pattern_memories(archetypal_pattern);
CREATE INDEX IF NOT EXISTS idx_morphic_status ON morphic_pattern_memories(current_status);

-- ============================================================================
-- LAYER 5: SOUL MEMORY (Life Purpose & Transformation)
-- ============================================================================
-- Note: Some soul memory is already captured in relationship_essence table
-- This table adds life purpose evolution tracking

CREATE TABLE IF NOT EXISTS soul_memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,

  -- Life purpose evolution
  life_purpose_statements JSONB DEFAULT '[]'::jsonb, -- [{timestamp, statement, clarityLevel}]
  current_life_purpose TEXT,
  purpose_clarity_level DECIMAL(3,2) DEFAULT 0.1,

  -- Archetypal identity
  primary_archetypes TEXT[] DEFAULT '{}',
  shadow_archetypes TEXT[] DEFAULT '{}',
  integrating_archetypes TEXT[] DEFAULT '{}',

  -- Transformation milestones
  major_transformations JSONB DEFAULT '[]'::jsonb, -- [{timestamp, type, description, significance}]
  current_transformation_phase TEXT,

  -- Soul gifts & medicine
  soul_gifts JSONB DEFAULT '[]'::jsonb, -- Identified gifts and medicine to offer
  soul_wounds JSONB DEFAULT '[]'::jsonb, -- Sacred wounds being worked with

  -- Spiritual development
  spiritual_practices JSONB DEFAULT '[]'::jsonb,
  mystical_experiences JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soul_user_id ON soul_memories(user_id);

-- ============================================================================
-- PHASE 3: ACHIEVEMENT SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS consciousness_achievements (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL UNIQUE,

  -- Achievement details
  achievement_type TEXT NOT NULL, -- first_shoulders_drop, deep_witness, morphic_sight, elemental_balance, etc.
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  rarity TEXT NOT NULL, -- common, uncommon, rare, legendary

  -- Unlock conditions
  unlock_conditions JSONB NOT NULL, -- Conditions that were met
  unlock_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Context
  unlocked_during_session TEXT,
  spiral_stage_at_unlock TEXT,
  significance_score DECIMAL(3,2),

  -- Celebration
  celebration_message TEXT,
  user_acknowledged BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON consciousness_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_timestamp ON consciousness_achievements(unlock_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON consciousness_achievements(rarity);

-- ============================================================================
-- PHASE 3: CONSCIOUSNESS EVOLUTION TRACKING (7-Stage System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS consciousness_evolution (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,

  -- Current stage (1-7)
  current_stage INTEGER CHECK (current_stage >= 1 AND current_stage <= 7) DEFAULT 1,
  current_stage_name TEXT,

  -- Stage progression tracking
  stage_progression JSONB DEFAULT '[]'::jsonb, -- [{stage, startDate, masteryLevel, stageQualities}]

  -- Metrics for each dimension
  presence_depth JSONB DEFAULT '{}'::jsonb, -- {bodyAwareness, emotionalRange, witnessCapacity, ...}
  somatic_awareness JSONB DEFAULT '{}'::jsonb, -- {bodyListening, tensionRecognition, somaticIntelligence, ...}
  morphic_contribution JSONB DEFAULT '{}'::jsonb, -- {patternRecognition, archetypeIntegration, fieldContribution, ...}
  witness_capacity JSONB DEFAULT '{}'::jsonb, -- {selfObservation, nonReactivity, metaCognition, ...}
  trust_evolution JSONB DEFAULT '{}'::jsonb, -- {bodyTrust, processTrust, fieldTrust, ...}

  -- Development indicators
  breakthrough_count INTEGER DEFAULT 0,
  integration_cycles_completed INTEGER DEFAULT 0,
  wisdom_embodiment_level DECIMAL(3,2) DEFAULT 0.1,

  -- Stage transition readiness
  next_stage_readiness DECIMAL(3,2) DEFAULT 0.0,
  transition_blockers JSONB DEFAULT '[]'::jsonb,
  transition_opportunities JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evolution_user_id ON consciousness_evolution(user_id);
CREATE INDEX IF NOT EXISTS idx_evolution_stage ON consciousness_evolution(current_stage);

-- ============================================================================
-- PHASE 3: COHERENCE FIELD TRACKING (Real-time Elemental Balance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS coherence_field_readings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  reading_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Elemental balance (Fire, Water, Earth, Air, Aether)
  fire_level DECIMAL(3,2), -- Vision, passion, initiation
  water_level DECIMAL(3,2), -- Emotion, flow, grief
  earth_level DECIMAL(3,2), -- Grounding, embodiment, stability
  air_level DECIMAL(3,2), -- Clarity, communication, perspective
  aether_level DECIMAL(3,2), -- Spirit, mystery, connection

  -- Overall coherence
  coherence_score DECIMAL(3,2),
  balance_quality TEXT, -- harmonious, fire_dominant, water_flooding, earth_depleted, etc.

  -- Imbalance detection
  elemental_deficiency TEXT[] DEFAULT '{}',
  elemental_excess TEXT[] DEFAULT '{}',

  -- Recommendations
  balancing_recommendations JSONB DEFAULT '[]'::jsonb,

  -- Context
  conversation_context TEXT,
  spiral_stage TEXT,
  archetypal_influences TEXT[] DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coherence_user_id ON coherence_field_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_coherence_session ON coherence_field_readings(session_id);
CREATE INDEX IF NOT EXISTS idx_coherence_timestamp ON coherence_field_readings(reading_timestamp DESC);

-- ============================================================================
-- PHASE 4: EXPERIENTIAL TEACHING SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS experiential_teachings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  teaching_id TEXT NOT NULL UNIQUE,

  -- Teaching content
  concept_being_taught TEXT NOT NULL,
  teaching_approach TEXT NOT NULL, -- experiential, somatic, cognitive, metaphoric, story

  -- Developmental matching
  user_stage_at_teaching INTEGER,
  user_readiness_level DECIMAL(3,2),
  teaching_effectiveness DECIMAL(3,2),

  -- Delivery
  teaching_delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  teaching_context TEXT,

  -- User response
  user_understanding_demonstrated BOOLEAN,
  user_integration_level DECIMAL(3,2),
  follow_up_needed BOOLEAN DEFAULT false,

  -- Adaptive learning
  teaching_adjusted JSONB DEFAULT '[]'::jsonb, -- Adjustments made based on user response

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teachings_user_id ON experiential_teachings(user_id);
CREATE INDEX IF NOT EXISTS idx_teachings_effectiveness ON experiential_teachings(teaching_effectiveness DESC);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_episodic_memories_updated_at BEFORE UPDATE ON episodic_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semantic_memories_updated_at BEFORE UPDATE ON semantic_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_somatic_memories_updated_at BEFORE UPDATE ON somatic_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_morphic_pattern_memories_updated_at BEFORE UPDATE ON morphic_pattern_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_soul_memories_updated_at BEFORE UPDATE ON soul_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consciousness_evolution_updated_at BEFORE UPDATE ON consciousness_evolution
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETE - All 5 Layers + Evolution Systems Ready
-- ============================================================================
