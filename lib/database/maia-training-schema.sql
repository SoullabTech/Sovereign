-- backend: lib/database/maia-training-schema.sql

/**
 * MAIA TRAINING DATA SCHEMA
 *
 * Ready-to-deploy Postgres schema for MAIA's learning nervous system.
 * Designed for zero-downtime training data collection and future ML pipeline integration.
 *
 * CRITICAL: This schema supports immediate implementation - no GPU training yet,
 * but every conversation becomes training capital from day one.
 */

-- =============================================================================
-- 1️⃣ SESSIONS: Conversation containers
-- =============================================================================

CREATE TABLE IF NOT EXISTS maia_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NULL,              -- or text if you have your own user ids
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ NULL,

  -- Optional: soft linkage to context, intake, etc.
  origin          TEXT NULL,              -- e.g. 'web', 'mobile', 'kiosk'
  initial_intent  TEXT NULL,              -- e.g. 'check-in', 'shadow work', etc.

  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_maia_sessions_user_id ON maia_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_maia_sessions_started_at ON maia_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_maia_sessions_origin ON maia_sessions(origin);

-- =============================================================================
-- 2️⃣ CORE TRAINING UNIT: Each user message + MAIA reply
-- =============================================================================

CREATE TABLE IF NOT EXISTS maia_turns (
  id                  BIGSERIAL PRIMARY KEY,

  session_id          UUID NOT NULL REFERENCES maia_sessions(id) ON DELETE CASCADE,
  turn_index          INT  NOT NULL,  -- 0,1,2... within session

  -- Raw content (the training gold)
  user_text           TEXT NOT NULL,
  maia_text           TEXT NOT NULL,

  -- Runtime routing & engine info
  processing_profile  TEXT NOT NULL,      -- 'FAST' | 'CORE' | 'DEEP'
  depth_requested     TEXT NULL,          -- 'surface' | 'medium' | 'deep' | 'unknown'
  depth_detected      TEXT NULL,          -- model's guess

  primary_engine      TEXT NOT NULL,      -- e.g. 'deepseek-r1:8b', 'local-llama-8b'
  secondary_engine    TEXT NULL,          -- if you ever do multi-engine consults
  used_claude_consult BOOLEAN NOT NULL DEFAULT FALSE,

  latency_ms          INT  NULL,          -- total time to generate MAIA's reply

  -- Rupture / repair flags at the *turn* level
  rupture_flag        BOOLEAN NOT NULL DEFAULT FALSE,
  repair_flag         BOOLEAN NOT NULL DEFAULT FALSE,

  -- Consciousness intelligence metadata
  element             TEXT NULL,          -- 'fire' | 'water' | 'earth' | 'air' | 'aether'
  facet               TEXT NULL,          -- 'Fire1', 'Water2', etc.
  topic_tags          TEXT[] NULL,        -- e.g. '{relationship,shadow,grief}'

  -- Extended consciousness data (for deep path responses)
  consciousness_layers_activated TEXT[] NULL, -- layers that were triggered
  consciousness_depth_achieved   SMALLINT NULL, -- depth level reached
  observer_insights   JSONB NULL,        -- observer layer insights
  evolution_triggers  TEXT[] NULL,       -- what triggered evolution processing

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Critical indexes for training data export and analysis
CREATE INDEX IF NOT EXISTS idx_maia_turns_session ON maia_turns(session_id, turn_index);
CREATE INDEX IF NOT EXISTS idx_maia_turns_profile ON maia_turns(processing_profile);
CREATE INDEX IF NOT EXISTS idx_maia_turns_element ON maia_turns(element);
CREATE INDEX IF NOT EXISTS idx_maia_turns_rupture ON maia_turns(rupture_flag) WHERE rupture_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_maia_turns_created_at ON maia_turns(created_at);
CREATE INDEX IF NOT EXISTS idx_maia_turns_primary_engine ON maia_turns(primary_engine);
CREATE INDEX IF NOT EXISTS idx_maia_turns_topic_tags ON maia_turns USING GIN(topic_tags);

-- =============================================================================
-- 3️⃣ FEEDBACK SYSTEM: Multiple feedback sources per turn
-- =============================================================================

CREATE TABLE IF NOT EXISTS maia_turn_feedback (
  id                  BIGSERIAL PRIMARY KEY,

  turn_id             BIGINT NOT NULL REFERENCES maia_turns(id) ON DELETE CASCADE,

  -- Who is giving the feedback
  source_type         TEXT NOT NULL,   -- 'user' | 'tester' | 'dev' | 'auto'
  source_id           UUID NULL,       -- link to tester/dev if you want

  -- Core relational signals (1–5, or NULL if not set)
  felt_seen_score     SMALLINT NULL CHECK (felt_seen_score >= 1 AND felt_seen_score <= 5),
  attunement_score    SMALLINT NULL CHECK (attunement_score >= 1 AND attunement_score <= 5),
  safety_score        SMALLINT NULL CHECK (safety_score >= 1 AND safety_score <= 5),
  depth_appropriateness_score SMALLINT NULL CHECK (depth_appropriateness_score >= 1 AND depth_appropriateness_score <= 5),

  -- Rupture / repair annotations
  rupture_mark        BOOLEAN NOT NULL DEFAULT FALSE,
  ideal_for_repair    BOOLEAN NOT NULL DEFAULT FALSE,

  -- For training: ideal response override
  ideal_maia_reply    TEXT NULL,        -- curator's ideal response for this turn

  -- Qualitative annotations
  tags                TEXT[] NULL,     -- 'too heady', 'perfect repair', 'missed grief'
  comment             TEXT NULL,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_turn ON maia_turn_feedback(turn_id);
CREATE INDEX IF NOT EXISTS idx_feedback_source ON maia_turn_feedback(source_type);
CREATE INDEX IF NOT EXISTS idx_feedback_rupture ON maia_turn_feedback(rupture_mark) WHERE rupture_mark = TRUE;
CREATE INDEX IF NOT EXISTS idx_feedback_quality ON maia_turn_feedback(felt_seen_score, attunement_score);
CREATE INDEX IF NOT EXISTS idx_feedback_tags ON maia_turn_feedback USING GIN(tags);

-- =============================================================================
-- 4️⃣ TRAINING EXPORT VIEWS: Ready-to-use queries for ML pipeline
-- =============================================================================

-- Gold standard conversations: High quality turns for positive training
CREATE OR REPLACE VIEW maia_training_gold AS
SELECT
  t.id as turn_id,
  t.user_text,
  t.maia_text,
  t.processing_profile,
  t.element,
  t.topic_tags,
  t.primary_engine,
  t.consciousness_layers_activated,
  AVG(f.felt_seen_score) as avg_felt_seen,
  AVG(f.attunement_score) as avg_attunement,
  AVG(f.safety_score) as avg_safety,
  COUNT(f.id) as feedback_count,
  t.created_at
FROM maia_turns t
LEFT JOIN maia_turn_feedback f ON f.turn_id = t.id
WHERE f.source_type IN ('user', 'tester', 'dev')
GROUP BY t.id, t.user_text, t.maia_text, t.processing_profile, t.element,
         t.topic_tags, t.primary_engine, t.consciousness_layers_activated, t.created_at
HAVING AVG(f.felt_seen_score) >= 4 AND AVG(f.attunement_score) >= 4;

-- Rupture and repair pairs: Training data for avoiding bad patterns
CREATE OR REPLACE VIEW maia_training_rupture_repair AS
SELECT
  t.id as turn_id,
  t.user_text,
  t.maia_text as original_response,
  f.ideal_maia_reply as corrected_response,
  f.comment as correction_reasoning,
  t.processing_profile,
  t.element,
  t.primary_engine,
  f.tags,
  t.created_at
FROM maia_turns t
JOIN maia_turn_feedback f ON f.turn_id = t.id
WHERE f.rupture_mark = TRUE
  AND f.ideal_maia_reply IS NOT NULL
  AND f.source_type IN ('tester', 'dev');

-- Element-specific training data: For elemental consciousness tuning
CREATE OR REPLACE VIEW maia_training_by_element AS
SELECT
  element,
  COUNT(*) as total_turns,
  AVG(f.felt_seen_score) as avg_felt_seen,
  AVG(f.attunement_score) as avg_attunement,
  COUNT(CASE WHEN f.felt_seen_score >= 4 THEN 1 END) as high_quality_turns,
  COUNT(CASE WHEN f.rupture_mark THEN 1 END) as rupture_count
FROM maia_turns t
LEFT JOIN maia_turn_feedback f ON f.turn_id = t.id
WHERE t.element IS NOT NULL
GROUP BY element
ORDER BY total_turns DESC;

-- Processing profile analysis: Understanding the three-tier system performance
CREATE OR REPLACE VIEW maia_processing_profile_stats AS
SELECT
  processing_profile,
  COUNT(*) as total_turns,
  AVG(latency_ms) as avg_latency_ms,
  AVG(f.felt_seen_score) as avg_felt_seen,
  AVG(f.attunement_score) as avg_attunement,
  COUNT(CASE WHEN f.rupture_mark THEN 1 END) as rupture_count,
  COUNT(CASE WHEN used_claude_consult THEN 1 END) as claude_consult_count
FROM maia_turns t
LEFT JOIN maia_turn_feedback f ON f.turn_id = t.id
GROUP BY processing_profile
ORDER BY total_turns DESC;

-- =============================================================================
-- 5️⃣ TRAINING DATA EXPORT FUNCTIONS
-- =============================================================================

-- Export gold standard training data as JSONL
CREATE OR REPLACE FUNCTION export_maia_training_gold(
  min_feedback_count INT DEFAULT 2,
  min_avg_score DECIMAL DEFAULT 4.0
) RETURNS TABLE (
  jsonl_row TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    json_build_object(
      'messages', json_build_array(
        json_build_object('role', 'user', 'content', g.user_text),
        json_build_object('role', 'assistant', 'content', g.maia_text)
      ),
      'metadata', json_build_object(
        'turn_id', g.turn_id,
        'processing_profile', g.processing_profile,
        'element', g.element,
        'topic_tags', g.topic_tags,
        'primary_engine', g.primary_engine,
        'consciousness_layers', g.consciousness_layers_activated,
        'quality_scores', json_build_object(
          'felt_seen', g.avg_felt_seen,
          'attunement', g.avg_attunement,
          'safety', g.avg_safety
        ),
        'feedback_count', g.feedback_count,
        'created_at', g.created_at
      )
    )::TEXT as jsonl_row
  FROM maia_training_gold g
  WHERE g.feedback_count >= min_feedback_count
    AND g.avg_felt_seen >= min_avg_score
    AND g.avg_attunement >= min_avg_score
  ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Export rupture-repair pairs for negative training
CREATE OR REPLACE FUNCTION export_maia_rupture_repair()
RETURNS TABLE (
  jsonl_row TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    json_build_object(
      'original_messages', json_build_array(
        json_build_object('role', 'user', 'content', rr.user_text),
        json_build_object('role', 'assistant', 'content', rr.original_response)
      ),
      'corrected_messages', json_build_array(
        json_build_object('role', 'user', 'content', rr.user_text),
        json_build_object('role', 'assistant', 'content', rr.corrected_response)
      ),
      'metadata', json_build_object(
        'turn_id', rr.turn_id,
        'processing_profile', rr.processing_profile,
        'element', rr.element,
        'primary_engine', rr.primary_engine,
        'correction_reasoning', rr.correction_reasoning,
        'tags', rr.tags,
        'created_at', rr.created_at
      )
    )::TEXT as jsonl_row
  FROM maia_training_rupture_repair rr
  ORDER BY rr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6️⃣ DATA COLLECTION HELPER FUNCTIONS
-- =============================================================================

-- Insert a conversation turn (called from backend)
CREATE OR REPLACE FUNCTION log_maia_turn(
  p_session_id UUID,
  p_turn_index INT,
  p_user_text TEXT,
  p_maia_text TEXT,
  p_processing_profile TEXT,
  p_primary_engine TEXT DEFAULT 'deepseek-r1:latest',
  p_latency_ms INT DEFAULT NULL,
  p_element TEXT DEFAULT NULL,
  p_topic_tags TEXT[] DEFAULT NULL,
  p_consciousness_layers TEXT[] DEFAULT NULL,
  p_consciousness_depth SMALLINT DEFAULT NULL,
  p_used_claude_consult BOOLEAN DEFAULT FALSE
) RETURNS BIGINT AS $$
DECLARE
  turn_id BIGINT;
BEGIN
  INSERT INTO maia_turns (
    session_id, turn_index, user_text, maia_text,
    processing_profile, primary_engine, latency_ms,
    element, topic_tags, consciousness_layers_activated,
    consciousness_depth_achieved, used_claude_consult
  )
  VALUES (
    p_session_id, p_turn_index, p_user_text, p_maia_text,
    p_processing_profile, p_primary_engine, p_latency_ms,
    p_element, p_topic_tags, p_consciousness_layers,
    p_consciousness_depth, p_used_claude_consult
  )
  RETURNING id INTO turn_id;

  RETURN turn_id;
END;
$$ LANGUAGE plpgsql;

-- Add user feedback (called from UI)
CREATE OR REPLACE FUNCTION add_maia_feedback(
  p_turn_id BIGINT,
  p_source_type TEXT DEFAULT 'user',
  p_source_id UUID DEFAULT NULL,
  p_felt_seen_score SMALLINT DEFAULT NULL,
  p_attunement_score SMALLINT DEFAULT NULL,
  p_safety_score SMALLINT DEFAULT NULL,
  p_depth_score SMALLINT DEFAULT NULL,
  p_rupture_mark BOOLEAN DEFAULT FALSE,
  p_tags TEXT[] DEFAULT NULL,
  p_comment TEXT DEFAULT NULL,
  p_ideal_reply TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  feedback_id BIGINT;
BEGIN
  INSERT INTO maia_turn_feedback (
    turn_id, source_type, source_id,
    felt_seen_score, attunement_score, safety_score, depth_appropriateness_score,
    rupture_mark, tags, comment, ideal_maia_reply
  )
  VALUES (
    p_turn_id, p_source_type, p_source_id,
    p_felt_seen_score, p_attunement_score, p_safety_score, p_depth_score,
    p_rupture_mark, p_tags, p_comment, p_ideal_reply
  )
  RETURNING id INTO feedback_id;

  RETURN feedback_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 7️⃣ TRAINING READINESS METRICS
-- =============================================================================

-- Check if we have enough training data
CREATE OR REPLACE VIEW maia_training_readiness AS
SELECT
  (SELECT COUNT(*) FROM maia_training_gold) as gold_examples,
  (SELECT COUNT(*) FROM maia_training_rupture_repair) as repair_examples,
  (SELECT COUNT(DISTINCT element) FROM maia_turns WHERE element IS NOT NULL) as elements_covered,
  (SELECT COUNT(DISTINCT processing_profile) FROM maia_turns) as profiles_covered,
  (SELECT COUNT(*) FROM maia_turns WHERE created_at > NOW() - INTERVAL '30 days') as recent_examples,
  (
    CASE
      WHEN (SELECT COUNT(*) FROM maia_training_gold) >= 500 THEN 'READY'
      WHEN (SELECT COUNT(*) FROM maia_training_gold) >= 100 THEN 'APPROACHING'
      ELSE 'COLLECTING'
    END
  ) as training_status;

-- =============================================================================
-- 8️⃣ CLEANUP AND MAINTENANCE
-- =============================================================================

-- Clean up old sessions without meaningful turns (optional)
CREATE OR REPLACE FUNCTION cleanup_empty_sessions(days_old INT DEFAULT 30)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM maia_sessions
  WHERE started_at < NOW() - (days_old || ' days')::INTERVAL
    AND id NOT IN (SELECT DISTINCT session_id FROM maia_turns);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Index maintenance (run periodically)
CREATE OR REPLACE FUNCTION maintain_maia_indexes()
RETURNS TEXT AS $$
BEGIN
  -- Reindex for performance
  REINDEX TABLE maia_turns;
  REINDEX TABLE maia_turn_feedback;
  REINDEX TABLE maia_sessions;

  -- Update table statistics
  ANALYZE maia_turns;
  ANALYZE maia_turn_feedback;
  ANALYZE maia_sessions;

  RETURN 'Index maintenance completed at ' || NOW()::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- USAGE EXAMPLES (as comments for developer reference)
-- =============================================================================

/*

-- Example: Log a conversation turn from backend
SELECT log_maia_turn(
  'session-uuid-here',
  1,
  'I feel overwhelmed with everything in my life right now.',
  'That sounds like a lot of weight you are carrying. What feels most urgent to address first?',
  'CORE',
  'deepseek-r1:latest',
  3500,
  'water',
  ARRAY['overwhelm', 'life_stress'],
  ARRAY['witnessing', 'water'],
  2,
  false
);

-- Example: Add user feedback
SELECT add_maia_feedback(
  123, -- turn_id from above
  'user',
  NULL,
  5, -- felt_seen_score
  4, -- attunement_score
  5, -- safety_score
  4, -- depth_appropriateness_score
  false, -- not a rupture
  ARRAY['helpful', 'warm'],
  'This response felt really supportive'
);

-- Example: Export training data to JSONL
SELECT jsonl_row FROM export_maia_training_gold(2, 4.0);

-- Example: Check training readiness
SELECT * FROM maia_training_readiness;

-- Example: Get quality statistics by element
SELECT * FROM maia_training_by_element;

*/