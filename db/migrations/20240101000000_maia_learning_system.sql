-- supabase/migrations/20240101000000_maia_learning_system.sql
-- MAIA Sovereign Learning System Database Schema
-- Creates tables and views for conversation turn logging and feedback collection

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create sessions table
CREATE TABLE IF NOT EXISTS maia_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID,
  origin TEXT,
  meta JSONB DEFAULT '{}'::jsonb
);

-- Create turns table
CREATE TABLE IF NOT EXISTS maia_turns (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES maia_sessions(id) ON DELETE CASCADE,
  turn_index INTEGER NOT NULL,
  user_text TEXT NOT NULL,
  maia_text TEXT NOT NULL,
  processing_profile TEXT NOT NULL CHECK (processing_profile IN ('FAST','CORE','DEEP')),
  depth_requested TEXT,
  depth_detected TEXT,
  primary_engine TEXT NOT NULL,
  secondary_engine TEXT,
  used_claude_consult BOOLEAN NOT NULL DEFAULT FALSE,
  latency_ms INTEGER,
  rupture_flag BOOLEAN NOT NULL DEFAULT FALSE,
  repair_flag BOOLEAN NOT NULL DEFAULT FALSE,
  element TEXT,
  facet TEXT,
  topic_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure unique turn index per session
  UNIQUE(session_id, turn_index)
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS maia_turn_feedback (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT NOT NULL REFERENCES maia_turns(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'user' CHECK (source_type IN ('user','tester','dev','auto')),
  felt_seen_score INTEGER CHECK (felt_seen_score BETWEEN 1 AND 5),
  attunement_score INTEGER CHECK (attunement_score BETWEEN 1 AND 5),
  safety_score INTEGER CHECK (safety_score BETWEEN 1 AND 5),
  depth_appropriateness_score INTEGER CHECK (depth_appropriateness_score BETWEEN 1 AND 5),
  rupture_mark BOOLEAN NOT NULL DEFAULT FALSE,
  ideal_for_repair BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  comment TEXT,
  ideal_maia_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_maia_sessions_created_at ON maia_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_maia_sessions_user_id ON maia_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_maia_turns_session_id ON maia_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_maia_turns_created_at ON maia_turns(created_at);
CREATE INDEX IF NOT EXISTS idx_maia_turns_processing_profile ON maia_turns(processing_profile);
CREATE INDEX IF NOT EXISTS idx_maia_turns_primary_engine ON maia_turns(primary_engine);
CREATE INDEX IF NOT EXISTS idx_maia_turns_rupture_flag ON maia_turns(rupture_flag);
CREATE INDEX IF NOT EXISTS idx_maia_turn_feedback_turn_id ON maia_turn_feedback(turn_id);
CREATE INDEX IF NOT EXISTS idx_maia_turn_feedback_created_at ON maia_turn_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_maia_turn_feedback_rupture_mark ON maia_turn_feedback(rupture_mark);

-- Create view for gold turns (high-quality responses for training corpus)
CREATE OR REPLACE VIEW maia_gold_turns AS
SELECT
  t.*,
  f.felt_seen_score,
  f.attunement_score,
  f.safety_score,
  f.depth_appropriateness_score,
  f.source_type,
  f.tags,
  f.comment,
  f.created_at as feedback_created_at
FROM maia_turns t
JOIN maia_turn_feedback f ON f.turn_id = t.id
WHERE COALESCE(f.felt_seen_score, 0) >= 4
  AND COALESCE(f.attunement_score, 0) >= 4
  AND COALESCE(f.safety_score, 0) >= 4
  AND COALESCE(f.rupture_mark, FALSE) = FALSE;

-- Create view for rupture events (misattunements to learn from)
CREATE OR REPLACE VIEW maia_rupture_events AS
SELECT
  t.*,
  f.felt_seen_score,
  f.attunement_score,
  f.safety_score,
  f.depth_appropriateness_score,
  f.rupture_mark,
  f.ideal_for_repair,
  f.source_type,
  f.tags,
  f.comment,
  f.ideal_maia_reply,
  f.created_at as feedback_created_at
FROM maia_turns t
JOIN maia_turn_feedback f ON f.turn_id = t.id
WHERE COALESCE(f.rupture_mark, FALSE) = TRUE
  OR COALESCE(f.ideal_for_repair, FALSE) = TRUE
  OR COALESCE(f.felt_seen_score, 5) <= 2
  OR COALESCE(f.attunement_score, 5) <= 2;

-- Create view for training data export
CREATE OR REPLACE VIEW maia_training_export AS
SELECT
  t.id as turn_id,
  t.session_id,
  t.turn_index,
  t.user_text,
  t.maia_text,
  t.processing_profile,
  t.primary_engine,
  t.used_claude_consult,
  t.created_at as turn_created_at,

  -- Feedback aggregation
  COALESCE(f.felt_seen_score, 0) as felt_seen_score,
  COALESCE(f.attunement_score, 0) as attunement_score,
  COALESCE(f.safety_score, 0) as safety_score,
  COALESCE(f.depth_appropriateness_score, 0) as depth_appropriateness_score,
  COALESCE(f.rupture_mark, FALSE) as rupture_mark,
  f.tags,
  f.comment,
  f.ideal_maia_reply,

  -- Quality indicators
  CASE
    WHEN COALESCE(f.felt_seen_score, 0) >= 4
     AND COALESCE(f.attunement_score, 0) >= 4
     AND COALESCE(f.safety_score, 0) >= 4
     AND COALESCE(f.rupture_mark, FALSE) = FALSE
    THEN 'gold'
    WHEN COALESCE(f.rupture_mark, FALSE) = TRUE
     OR COALESCE(f.ideal_for_repair, FALSE) = TRUE
     OR COALESCE(f.felt_seen_score, 5) <= 2
     OR COALESCE(f.attunement_score, 5) <= 2
    THEN 'rupture'
    WHEN f.id IS NOT NULL
    THEN 'rated'
    ELSE 'unrated'
  END as quality_category,

  -- Overall quality score (average of available scores)
  CASE
    WHEN f.id IS NOT NULL THEN
      (COALESCE(f.felt_seen_score, 0) +
       COALESCE(f.attunement_score, 0) +
       COALESCE(f.safety_score, 0) +
       COALESCE(f.depth_appropriateness_score, 0)) /
      (CASE WHEN f.felt_seen_score IS NOT NULL THEN 1 ELSE 0 END +
       CASE WHEN f.attunement_score IS NOT NULL THEN 1 ELSE 0 END +
       CASE WHEN f.safety_score IS NOT NULL THEN 1 ELSE 0 END +
       CASE WHEN f.depth_appropriateness_score IS NOT NULL THEN 1 ELSE 0 END)
    ELSE NULL
  END as avg_score

FROM maia_turns t
LEFT JOIN maia_turn_feedback f ON f.turn_id = t.id
ORDER BY t.created_at DESC;

-- Create function to get conversation context for a turn
CREATE OR REPLACE FUNCTION get_turn_context(target_turn_id BIGINT, context_window INTEGER DEFAULT 5)
RETURNS TABLE (
  turn_id BIGINT,
  turn_index INTEGER,
  user_text TEXT,
  maia_text TEXT,
  is_target BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH target_turn AS (
    SELECT session_id, turn_index as target_index
    FROM maia_turns
    WHERE id = target_turn_id
  )
  SELECT
    t.id,
    t.turn_index,
    t.user_text,
    t.maia_text,
    (t.id = target_turn_id) as is_target
  FROM maia_turns t, target_turn tt
  WHERE t.session_id = tt.session_id
    AND t.turn_index BETWEEN (tt.target_index - context_window) AND (tt.target_index + context_window)
  ORDER BY t.turn_index;
END;
$$ LANGUAGE plpgsql;

-- Create function to get learning analytics
CREATE OR REPLACE FUNCTION get_learning_analytics(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  total_turns BIGINT,
  turns_with_feedback BIGINT,
  feedback_rate NUMERIC,
  avg_attunement NUMERIC,
  avg_felt_seen NUMERIC,
  gold_turns_count BIGINT,
  rupture_events_count BIGINT,
  fast_profile_count BIGINT,
  core_profile_count BIGINT,
  deep_profile_count BIGINT,
  claude_consult_rate NUMERIC
) AS $$
DECLARE
  date_threshold TIMESTAMPTZ := NOW() - (days_back || ' days')::INTERVAL;
BEGIN
  RETURN QUERY
  WITH turn_stats AS (
    SELECT
      t.id,
      t.processing_profile,
      t.used_claude_consult,
      f.attunement_score,
      f.felt_seen_score,
      CASE
        WHEN COALESCE(f.felt_seen_score, 0) >= 4
         AND COALESCE(f.attunement_score, 0) >= 4
         AND COALESCE(f.safety_score, 0) >= 4
         AND COALESCE(f.rupture_mark, FALSE) = FALSE
        THEN 1 ELSE 0
      END as is_gold,
      CASE
        WHEN COALESCE(f.rupture_mark, FALSE) = TRUE
         OR COALESCE(f.ideal_for_repair, FALSE) = TRUE
         OR COALESCE(f.felt_seen_score, 5) <= 2
         OR COALESCE(f.attunement_score, 5) <= 2
        THEN 1 ELSE 0
      END as is_rupture
    FROM maia_turns t
    LEFT JOIN maia_turn_feedback f ON f.turn_id = t.id
    WHERE t.created_at >= date_threshold
  )
  SELECT
    COUNT(*),
    COUNT(CASE WHEN attunement_score IS NOT NULL OR felt_seen_score IS NOT NULL THEN 1 END),
    ROUND(
      COUNT(CASE WHEN attunement_score IS NOT NULL OR felt_seen_score IS NOT NULL THEN 1 END)::NUMERIC /
      NULLIF(COUNT(*)::NUMERIC, 0),
      3
    ),
    ROUND(AVG(attunement_score), 2),
    ROUND(AVG(felt_seen_score), 2),
    SUM(is_gold),
    SUM(is_rupture),
    COUNT(CASE WHEN processing_profile = 'FAST' THEN 1 END),
    COUNT(CASE WHEN processing_profile = 'CORE' THEN 1 END),
    COUNT(CASE WHEN processing_profile = 'DEEP' THEN 1 END),
    ROUND(
      COUNT(CASE WHEN used_claude_consult THEN 1 END)::NUMERIC /
      NULLIF(COUNT(*)::NUMERIC, 0),
      3
    )
  FROM turn_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (assuming RLS is enabled)
ALTER TABLE maia_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maia_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE maia_turn_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
-- Allow service role to do everything
CREATE POLICY "Service role can manage all sessions" ON maia_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all turns" ON maia_turns
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all feedback" ON maia_turn_feedback
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read their own data (if user_id is set)
CREATE POLICY "Users can view their own sessions" ON maia_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view turns from their sessions" ON maia_turns
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM maia_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view feedback on their turns" ON maia_turn_feedback
  FOR SELECT USING (
    turn_id IN (
      SELECT t.id FROM maia_turns t
      JOIN maia_sessions s ON s.id = t.session_id
      WHERE s.user_id = auth.uid()
    )
  );

-- Add some helpful comments
COMMENT ON TABLE maia_sessions IS 'MAIA conversation sessions - each represents a distinct conversation thread';
COMMENT ON TABLE maia_turns IS 'Individual conversation turns - each user input + MAIA response pair';
COMMENT ON TABLE maia_turn_feedback IS 'User feedback on MAIA responses - drives the learning system';
COMMENT ON VIEW maia_gold_turns IS 'High-quality turns suitable for training corpus (attunement >= 4, no ruptures)';
COMMENT ON VIEW maia_rupture_events IS 'Misattunements and ruptures to learn repair patterns from';
COMMENT ON VIEW maia_training_export IS 'Complete training data export with quality categorization';
COMMENT ON FUNCTION get_turn_context IS 'Retrieves conversation context around a specific turn for analysis';
COMMENT ON FUNCTION get_learning_analytics IS 'Provides learning system health metrics and performance indicators';