-- PostgreSQL-only MAIA Learning System Migration
-- Creates tables for conversation turn logging and feedback collection

-- Create turns table (works with existing maia_sessions)
CREATE TABLE IF NOT EXISTS maia_turns (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL, -- References existing maia_sessions.id
  turn_index INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','maia','system')),
  content TEXT NOT NULL,
  processing_profile TEXT NOT NULL CHECK (processing_profile IN ('FAST','CORE','DEEP')),
  engine TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
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
CREATE INDEX IF NOT EXISTS idx_maia_turns_session_id ON maia_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_maia_turns_created_at ON maia_turns(created_at);
CREATE INDEX IF NOT EXISTS idx_maia_turns_processing_profile ON maia_turns(processing_profile);
CREATE INDEX IF NOT EXISTS idx_maia_turns_engine ON maia_turns(engine);
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

-- Add helpful comments
COMMENT ON TABLE maia_turns IS 'Individual conversation turns - each user input + MAIA response';
COMMENT ON TABLE maia_turn_feedback IS 'User feedback on MAIA responses - drives the learning system';
COMMENT ON VIEW maia_gold_turns IS 'High-quality turns suitable for training corpus (attunement >= 4, no ruptures)';
COMMENT ON VIEW maia_rupture_events IS 'Misattunements and ruptures to learn repair patterns from';