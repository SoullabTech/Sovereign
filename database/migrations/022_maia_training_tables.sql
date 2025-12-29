-- Migration: MAIA Training Data Tables
-- Created: 2025-12-29
-- Purpose: Support MaiaTrainingDataService for turn logging and feedback collection

BEGIN;

-- =============================================================================
-- MAIA TURNS TABLE - Core training data storage
-- =============================================================================
CREATE TABLE IF NOT EXISTS maia_turns (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  turn_index INTEGER NOT NULL,
  user_text TEXT NOT NULL,
  maia_text TEXT NOT NULL,
  processing_profile TEXT NOT NULL CHECK (processing_profile IN ('FAST', 'CORE', 'DEEP')),
  primary_engine TEXT NOT NULL DEFAULT 'deepseek-r1:latest',
  secondary_engine TEXT,
  used_claude_consult BOOLEAN NOT NULL DEFAULT FALSE,
  latency_ms INTEGER,
  element TEXT CHECK (element IS NULL OR element IN ('fire', 'water', 'earth', 'air', 'aether')),
  facet TEXT,
  topic_tags TEXT[] DEFAULT '{}',
  consciousness_layers_activated TEXT[] DEFAULT '{}',
  consciousness_depth_achieved SMALLINT,
  observer_insights JSONB,
  evolution_triggers TEXT[],
  rupture_flag BOOLEAN NOT NULL DEFAULT FALSE,
  repair_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique turn index per session
  UNIQUE(session_id, turn_index)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_maia_turns_session_id ON maia_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_maia_turns_created_at ON maia_turns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maia_turns_processing_profile ON maia_turns(processing_profile);
CREATE INDEX IF NOT EXISTS idx_maia_turns_element ON maia_turns(element) WHERE element IS NOT NULL;

-- =============================================================================
-- MAIA TURN FEEDBACK TABLE - User/tester feedback for training
-- =============================================================================
CREATE TABLE IF NOT EXISTS maia_turn_feedback (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT NOT NULL REFERENCES maia_turns(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'user' CHECK (source_type IN ('user', 'tester', 'dev', 'auto')),
  source_id UUID,
  felt_seen_score SMALLINT CHECK (felt_seen_score IS NULL OR felt_seen_score BETWEEN 1 AND 5),
  attunement_score SMALLINT CHECK (attunement_score IS NULL OR attunement_score BETWEEN 1 AND 5),
  safety_score SMALLINT CHECK (safety_score IS NULL OR safety_score BETWEEN 1 AND 5),
  depth_appropriateness_score SMALLINT CHECK (depth_appropriateness_score IS NULL OR depth_appropriateness_score BETWEEN 1 AND 5),
  rupture_mark BOOLEAN NOT NULL DEFAULT FALSE,
  ideal_for_repair BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  comment TEXT,
  ideal_maia_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maia_turn_feedback_turn_id ON maia_turn_feedback(turn_id);
CREATE INDEX IF NOT EXISTS idx_maia_turn_feedback_rupture_mark ON maia_turn_feedback(rupture_mark) WHERE rupture_mark = TRUE;

-- =============================================================================
-- LOG FUNCTION - Called from TypeScript service
-- =============================================================================
CREATE OR REPLACE FUNCTION log_maia_conversation_turn(
  p_session_id TEXT,
  p_turn_index INTEGER,
  p_user_text TEXT,
  p_maia_text TEXT,
  p_processing_profile TEXT,
  p_primary_engine TEXT,
  p_latency_ms INTEGER,
  p_element TEXT,
  p_topic_tags TEXT[],
  p_consciousness_layers TEXT[],
  p_consciousness_depth SMALLINT,
  p_used_claude_consult BOOLEAN
) RETURNS BIGINT AS $$
DECLARE
  v_turn_id BIGINT;
BEGIN
  INSERT INTO maia_turns (
    session_id,
    turn_index,
    user_text,
    maia_text,
    processing_profile,
    primary_engine,
    latency_ms,
    element,
    topic_tags,
    consciousness_layers_activated,
    consciousness_depth_achieved,
    used_claude_consult
  ) VALUES (
    p_session_id,
    p_turn_index,
    p_user_text,
    p_maia_text,
    p_processing_profile,
    COALESCE(p_primary_engine, 'deepseek-r1:latest'),
    p_latency_ms,
    p_element,
    COALESCE(p_topic_tags, '{}'),
    COALESCE(p_consciousness_layers, '{}'),
    p_consciousness_depth,
    COALESCE(p_used_claude_consult, FALSE)
  )
  ON CONFLICT (session_id, turn_index) DO UPDATE SET
    user_text = EXCLUDED.user_text,
    maia_text = EXCLUDED.maia_text,
    processing_profile = EXCLUDED.processing_profile,
    primary_engine = EXCLUDED.primary_engine,
    latency_ms = EXCLUDED.latency_ms,
    element = EXCLUDED.element,
    topic_tags = EXCLUDED.topic_tags,
    consciousness_layers_activated = EXCLUDED.consciousness_layers_activated,
    consciousness_depth_achieved = EXCLUDED.consciousness_depth_achieved,
    used_claude_consult = EXCLUDED.used_claude_consult
  RETURNING id INTO v_turn_id;

  RETURN v_turn_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ADD FEEDBACK FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION add_maia_feedback(
  p_turn_id BIGINT,
  p_source_type TEXT,
  p_source_id UUID,
  p_felt_seen_score SMALLINT,
  p_attunement_score SMALLINT,
  p_safety_score SMALLINT,
  p_depth_score SMALLINT,
  p_rupture_mark BOOLEAN,
  p_tags TEXT[],
  p_comment TEXT,
  p_ideal_reply TEXT
) RETURNS BIGINT AS $$
DECLARE
  v_feedback_id BIGINT;
BEGIN
  INSERT INTO maia_turn_feedback (
    turn_id,
    source_type,
    source_id,
    felt_seen_score,
    attunement_score,
    safety_score,
    depth_appropriateness_score,
    rupture_mark,
    tags,
    comment,
    ideal_maia_reply
  ) VALUES (
    p_turn_id,
    COALESCE(p_source_type, 'user'),
    p_source_id,
    p_felt_seen_score,
    p_attunement_score,
    p_safety_score,
    p_depth_score,
    COALESCE(p_rupture_mark, FALSE),
    COALESCE(p_tags, '{}'),
    p_comment,
    p_ideal_reply
  )
  RETURNING id INTO v_feedback_id;

  RETURN v_feedback_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEWS FOR TRAINING DATA EXPORT
-- =============================================================================

-- Gold standard turns (high attunement, no ruptures)
CREATE OR REPLACE VIEW maia_gold_turns AS
SELECT
  t.*,
  f.felt_seen_score,
  f.attunement_score,
  f.safety_score,
  f.depth_appropriateness_score,
  f.source_type AS feedback_source,
  f.tags AS feedback_tags,
  f.comment AS feedback_comment,
  f.created_at AS feedback_created_at
FROM maia_turns t
JOIN maia_turn_feedback f ON f.turn_id = t.id
WHERE COALESCE(f.felt_seen_score, 0) >= 4
  AND COALESCE(f.attunement_score, 0) >= 4
  AND COALESCE(f.safety_score, 0) >= 4
  AND COALESCE(f.rupture_mark, FALSE) = FALSE;

-- Rupture events for repair learning
CREATE OR REPLACE VIEW maia_rupture_events AS
SELECT
  t.*,
  f.felt_seen_score,
  f.attunement_score,
  f.safety_score,
  f.depth_appropriateness_score,
  f.rupture_mark,
  f.ideal_for_repair,
  f.source_type AS feedback_source,
  f.tags AS feedback_tags,
  f.comment AS feedback_comment,
  f.ideal_maia_reply,
  f.created_at AS feedback_created_at
FROM maia_turns t
JOIN maia_turn_feedback f ON f.turn_id = t.id
WHERE COALESCE(f.rupture_mark, FALSE) = TRUE
  OR COALESCE(f.ideal_for_repair, FALSE) = TRUE
  OR COALESCE(f.felt_seen_score, 5) <= 2
  OR COALESCE(f.attunement_score, 5) <= 2;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 022: maia_turns and maia_turn_feedback tables + functions created successfully';
END $$;
