-- SelfletChain: Temporal Identity Layer
-- Implements Michael Levin's "selflet" concept - treating identity as a chain
-- of distinct selves sending messages across time

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- SELFLET NODES
-- Temporal identity snapshots - each node represents a "version" of the user
-- =============================================================================
CREATE TABLE IF NOT EXISTS selflet_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Temporal identity signature (Spiralogic alignment)
  phase VARCHAR(32) NOT NULL,          -- e.g., "Fire 1", "Water 3"
  element VARCHAR(16) NOT NULL,        -- fire, water, earth, air, aether
  archetypes TEXT[] NOT NULL,          -- e.g., ["Sage", "Empath"]
  dominant_emotions TEXT[],            -- emotional signature at this time

  -- Continuity tracking
  parent_selflet_id UUID REFERENCES selflet_nodes(id) ON DELETE SET NULL,
  continuity_score FLOAT DEFAULT 1.0 CHECK (continuity_score >= 0 AND continuity_score <= 1),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  active_until TIMESTAMPTZ,            -- NULL = current active selflet

  -- Semantic search for finding relevant past selves
  essence_embedding VECTOR(1536),
  essence_summary TEXT                 -- Human-readable essence snapshot
);

-- Indexes for selflet_nodes
CREATE INDEX IF NOT EXISTS idx_selflet_user ON selflet_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_selflet_parent ON selflet_nodes(parent_selflet_id);
CREATE INDEX IF NOT EXISTS idx_selflet_active ON selflet_nodes(user_id, active_until)
  WHERE active_until IS NULL;
CREATE INDEX IF NOT EXISTS idx_selflet_element ON selflet_nodes(user_id, element);
CREATE INDEX IF NOT EXISTS idx_selflet_created ON selflet_nodes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_selflet_essence_vector ON selflet_nodes
  USING ivfflat (essence_embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================================================
-- SELFLET MESSAGES
-- Communications across temporal selves - "letters" from past to future
-- =============================================================================
CREATE TABLE IF NOT EXISTS selflet_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_selflet_id UUID NOT NULL REFERENCES selflet_nodes(id) ON DELETE CASCADE,
  to_selflet_id UUID REFERENCES selflet_nodes(id) ON DELETE SET NULL,  -- NULL = addressed to future self

  -- Message content
  message_type VARCHAR(32) NOT NULL CHECK (message_type IN ('letter', 'symbolic_state', 'future_projection', 'wisdom_seed')),
  title VARCHAR(255),
  content TEXT NOT NULL,
  symbolic_objects TEXT[],             -- e.g., ["phoenix", "candle flame"]
  ritual_trigger VARCHAR(128),         -- e.g., "Full Moon in Aries", "when_struggling_with_boundaries"

  -- Delivery tracking
  delivered_at TIMESTAMPTZ,            -- When MAIA surfaced this message
  received_interpretation TEXT,        -- User's reflection on receiving

  -- Context for MAIA's intuition
  delivery_context JSONB,              -- Conditions under which to surface
  relevance_themes TEXT[],             -- Themes that make this message relevant

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for selflet_messages
CREATE INDEX IF NOT EXISTS idx_messages_from ON selflet_messages(from_selflet_id);
CREATE INDEX IF NOT EXISTS idx_messages_to ON selflet_messages(to_selflet_id);
CREATE INDEX IF NOT EXISTS idx_messages_undelivered ON selflet_messages(to_selflet_id)
  WHERE delivered_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_themes ON selflet_messages USING GIN(relevance_themes);

-- =============================================================================
-- SELFLET REINTERPRETATIONS
-- How current self reads/translates messages from past selves
-- The caterpillar→butterfly translation layer
-- =============================================================================
CREATE TABLE IF NOT EXISTS selflet_reinterpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interpreting_selflet_id UUID NOT NULL REFERENCES selflet_nodes(id) ON DELETE CASCADE,
  source_selflet_id UUID NOT NULL REFERENCES selflet_nodes(id) ON DELETE CASCADE,
  source_message_id UUID REFERENCES selflet_messages(id) ON DELETE SET NULL,

  -- The interpretation
  interpretation TEXT NOT NULL,
  emotional_resonance VARCHAR(64),     -- How it lands now (e.g., "warmth", "grief", "integration")
  integration_depth FLOAT DEFAULT 0.5 CHECK (integration_depth >= 0 AND integration_depth <= 1),

  -- What changed in the translation
  translation_notes TEXT,              -- What had to be "translated" for new context

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reinterpretations
CREATE INDEX IF NOT EXISTS idx_reinterpret_interpreting ON selflet_reinterpretations(interpreting_selflet_id);
CREATE INDEX IF NOT EXISTS idx_reinterpret_source ON selflet_reinterpretations(source_selflet_id);

-- =============================================================================
-- SELFLET METAMORPHOSIS
-- Radical identity transitions where old memories need translation, not just recall
-- =============================================================================
CREATE TABLE IF NOT EXISTS selflet_metamorphosis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  selflet_id UUID NOT NULL REFERENCES selflet_nodes(id) ON DELETE CASCADE,

  -- Transition details
  from_element VARCHAR(16) NOT NULL,
  to_element VARCHAR(16) NOT NULL,
  symbol VARCHAR(64),                  -- e.g., "steam" (fire→water), "ash", "light"
  interpretation TEXT,                 -- User's meaning-making of the transition

  -- Transition metadata
  discontinuity_score FLOAT CHECK (discontinuity_score >= 0 AND discontinuity_score <= 1),
  translation_needed BOOLEAN DEFAULT TRUE,
  bridging_ritual_completed BOOLEAN DEFAULT FALSE,

  -- What triggered the metamorphosis
  trigger_context JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for metamorphosis
CREATE INDEX IF NOT EXISTS idx_metamorphosis_user ON selflet_metamorphosis(user_id);
CREATE INDEX IF NOT EXISTS idx_metamorphosis_selflet ON selflet_metamorphosis(selflet_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get the current active selflet for a user
CREATE OR REPLACE FUNCTION get_current_selflet(p_user_id TEXT)
RETURNS TABLE (
  id UUID,
  phase VARCHAR(32),
  element VARCHAR(16),
  archetypes TEXT[],
  dominant_emotions TEXT[],
  continuity_score FLOAT,
  created_at TIMESTAMPTZ,
  essence_summary TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sn.id,
    sn.phase,
    sn.element,
    sn.archetypes,
    sn.dominant_emotions,
    sn.continuity_score,
    sn.created_at,
    sn.essence_summary
  FROM selflet_nodes sn
  WHERE sn.user_id = p_user_id
    AND sn.active_until IS NULL
  ORDER BY sn.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get undelivered messages for a user's current selflet
CREATE OR REPLACE FUNCTION get_pending_selflet_messages(p_user_id TEXT)
RETURNS TABLE (
  message_id UUID,
  from_phase VARCHAR(32),
  from_element VARCHAR(16),
  message_type VARCHAR(32),
  title VARCHAR(255),
  content TEXT,
  symbolic_objects TEXT[],
  ritual_trigger VARCHAR(128),
  relevance_themes TEXT[],
  from_created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sm.id as message_id,
    sn_from.phase as from_phase,
    sn_from.element as from_element,
    sm.message_type,
    sm.title,
    sm.content,
    sm.symbolic_objects,
    sm.ritual_trigger,
    sm.relevance_themes,
    sn_from.created_at as from_created_at
  FROM selflet_messages sm
  JOIN selflet_nodes sn_from ON sm.from_selflet_id = sn_from.id
  WHERE sn_from.user_id = p_user_id
    AND sm.delivered_at IS NULL
    AND sm.to_selflet_id IS NULL  -- Addressed to future self (any)
  ORDER BY sn_from.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Calculate overall continuity score for a user's selflet chain
CREATE OR REPLACE FUNCTION calculate_chain_continuity(p_user_id TEXT)
RETURNS FLOAT AS $$
DECLARE
  v_total_score FLOAT := 0;
  v_count INT := 0;
  v_reinterpretation_count INT := 0;
  v_node_count INT := 0;
BEGIN
  -- Get weighted average of continuity scores
  SELECT
    COALESCE(AVG(continuity_score), 1.0),
    COUNT(*)
  INTO v_total_score, v_node_count
  FROM selflet_nodes
  WHERE user_id = p_user_id;

  -- Bonus for reinterpretations (shows integration work)
  SELECT COUNT(*) INTO v_reinterpretation_count
  FROM selflet_reinterpretations sr
  JOIN selflet_nodes sn ON sr.interpreting_selflet_id = sn.id
  WHERE sn.user_id = p_user_id;

  -- Add integration bonus (up to 0.2 extra)
  IF v_node_count > 1 THEN
    v_total_score := v_total_score + LEAST(0.2, v_reinterpretation_count::FLOAT / v_node_count * 0.1);
  END IF;

  RETURN LEAST(1.0, v_total_score);
END;
$$ LANGUAGE plpgsql;
