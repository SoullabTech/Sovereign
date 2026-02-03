-- Migration: Decision Trace (Clean Schema)
-- Created: 2026-01-13
-- Purpose: Clean, future-proof schema for agent evolution with candidates vs votes separated
--
-- Tables:
--   maia_decisions: one per assistant reply (orchestrator output)
--   maia_decision_candidates: classifier top-k outputs (NOT votes)
--   maia_decision_votes: actual committee votes (only when committee runs)
--   maia_decision_feedback: user ratings attached to decisions
--
-- This replaces the earlier deliberations table approach with a cleaner design.

BEGIN;

-- =============================================================================
-- 1) DECISIONS: one per assistant reply (orchestrator output)
-- =============================================================================
CREATE TABLE IF NOT EXISTS maia_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  session_id TEXT NOT NULL,                     -- session identifier
  turn_id BIGINT NOT NULL,                      -- references maia_turns.id
  assistant_message_id TEXT,                    -- optional: frontend message id for exact linking

  -- Orchestrator final choice
  final_label TEXT NOT NULL,                    -- e.g. "WATER_2::ORPHAN", "FIRE_1::WARRIOR"
  final_confidence DOUBLE PRECISION,            -- 0..1 if available
  decided_by TEXT NOT NULL,                     -- "atlas_confident" | "deliberation_pending" | "committee" | "manual_override"
  mode TEXT,                                    -- "dialogue" | "counsel" | "scribe"

  -- Timing + trace
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decision_ms INTEGER,                          -- total decision time
  deliberation_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  trigger_reason TEXT,                          -- "atlas_uncertain" | "gap_below_threshold" | "confident_classification" | "risk_flag"

  -- Extra metadata (element/facet/phase and debug)
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Uniqueness: 1 decision per assistant reply turn
  CONSTRAINT maia_decisions_turn_unique UNIQUE (turn_id)
);

CREATE INDEX IF NOT EXISTS idx_maia_decisions_session_id ON maia_decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_maia_decisions_created_at ON maia_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maia_decisions_final_label ON maia_decisions(final_label);
CREATE INDEX IF NOT EXISTS idx_maia_decisions_deliberation_triggered ON maia_decisions(deliberation_triggered) WHERE deliberation_triggered = TRUE;

-- =============================================================================
-- 2) CANDIDATES: classifier top-k outputs (NOT votes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS maia_decision_candidates (
  id BIGSERIAL PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES maia_decisions(id) ON DELETE CASCADE,

  source TEXT NOT NULL,                         -- "mythic_atlas", "router", "classifier_v2"
  label TEXT NOT NULL,                          -- candidate label
  score DOUBLE PRECISION,                       -- raw score from source (0..1 if normalized)
  rank INTEGER,                                 -- 1..k
  rationale TEXT,                               -- short tag like "gap=12.5%" or "top2_close"
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,  -- structured evidence if needed

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidates_decision_id ON maia_decision_candidates(decision_id);
CREATE INDEX IF NOT EXISTS idx_candidates_label ON maia_decision_candidates(label);
CREATE INDEX IF NOT EXISTS idx_candidates_source ON maia_decision_candidates(source);

-- =============================================================================
-- 3) VOTES: actual committee voting (ONLY when committee runs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS maia_decision_votes (
  id BIGSERIAL PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES maia_decisions(id) ON DELETE CASCADE,

  committee TEXT NOT NULL,                      -- "mythic_atlas_committee", "ain_deliberation"
  member TEXT NOT NULL,                         -- "shadow_agent", "cbt_agent", "dream_agent"
  label TEXT NOT NULL,                          -- the member's voted label
  confidence DOUBLE PRECISION,                  -- 0..1
  weight DOUBLE PRECISION,                      -- weight used in aggregation
  rationale TEXT,                               -- short string or tag
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,      -- extra details (signals, cues, quotes)

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_votes_decision_id ON maia_decision_votes(decision_id);
CREATE INDEX IF NOT EXISTS idx_votes_member ON maia_decision_votes(member);
CREATE INDEX IF NOT EXISTS idx_votes_label ON maia_decision_votes(label);

-- =============================================================================
-- 4) FEEDBACK: attach user signal to the decision
-- =============================================================================
CREATE TABLE IF NOT EXISTS maia_decision_feedback (
  id BIGSERIAL PRIMARY KEY,

  decision_id UUID NOT NULL REFERENCES maia_decisions(id) ON DELETE CASCADE,
  turn_id BIGINT,                               -- redundancy for easier joins
  source_type TEXT NOT NULL DEFAULT 'user',     -- 'user' | 'tester' | 'dev' | 'auto'

  -- Scores
  felt_seen_score INTEGER CHECK (felt_seen_score BETWEEN 1 AND 5),
  attunement_score INTEGER CHECK (attunement_score BETWEEN 1 AND 5),
  safety_score INTEGER CHECK (safety_score BETWEEN 1 AND 5),
  depth_score INTEGER CHECK (depth_score BETWEEN 1 AND 5),

  -- Classification correction (super valuable for learning)
  corrected_label TEXT,                         -- user says: "No, it was Water-2 not Fire-1"

  -- Freeform
  tags TEXT[],
  comment TEXT,
  ideal_reply TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decision_feedback_decision_id ON maia_decision_feedback(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_feedback_created_at ON maia_decision_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_feedback_corrected_label ON maia_decision_feedback(corrected_label) WHERE corrected_label IS NOT NULL;

-- =============================================================================
-- VIEWS FOR ANALYSIS
-- =============================================================================

-- View: Decisions with their feedback (the training signal)
CREATE OR REPLACE VIEW decision_feedback_pairs AS
SELECT
  d.id AS decision_id,
  d.session_id,
  d.turn_id,
  d.final_label,
  d.final_confidence,
  d.decided_by,
  d.deliberation_triggered,
  d.trigger_reason,
  d.mode,
  d.created_at,
  f.felt_seen_score,
  f.attunement_score,
  f.safety_score,
  f.depth_score,
  f.corrected_label,
  f.tags AS feedback_tags,
  f.comment AS feedback_comment,
  -- Computed: was this a "good" outcome?
  CASE
    WHEN COALESCE(f.attunement_score, 0) >= 4
     AND COALESCE(f.felt_seen_score, 0) >= 4
    THEN TRUE
    ELSE FALSE
  END AS positive_outcome,
  -- Computed: was this a "bad" outcome?
  CASE
    WHEN COALESCE(f.attunement_score, 5) <= 2
      OR COALESCE(f.felt_seen_score, 5) <= 2
    THEN TRUE
    ELSE FALSE
  END AS negative_outcome,
  -- Computed: was the classification corrected?
  CASE
    WHEN f.corrected_label IS NOT NULL
     AND f.corrected_label <> d.final_label
    THEN TRUE
    ELSE FALSE
  END AS was_corrected
FROM maia_decisions d
LEFT JOIN maia_decision_feedback f ON f.decision_id = d.id;

-- View: Prescient dissent (agents who voted for what user said was correct)
-- Drop existing view if columns changed (from previous migration)
DROP VIEW IF EXISTS prescient_dissent;
CREATE OR REPLACE VIEW prescient_dissent AS
SELECT
  d.id AS decision_id,
  d.final_label,
  f.corrected_label,
  v.member,
  v.label AS member_vote,
  v.confidence AS member_confidence,
  v.rationale,
  d.created_at
FROM maia_decisions d
JOIN maia_decision_feedback f ON f.decision_id = d.id
JOIN maia_decision_votes v ON v.decision_id = d.id
WHERE f.corrected_label IS NOT NULL
  AND v.label = f.corrected_label
  AND d.final_label <> f.corrected_label
ORDER BY d.created_at DESC;

-- View: Agent accuracy tracking
CREATE OR REPLACE VIEW agent_accuracy AS
SELECT
  v.member,
  COUNT(*) AS total_votes,
  AVG(v.confidence) AS avg_confidence,
  SUM(CASE WHEN v.label = d.final_label THEN 1 ELSE 0 END) AS voted_with_consensus,
  SUM(CASE WHEN f.corrected_label IS NOT NULL AND v.label = f.corrected_label THEN 1 ELSE 0 END) AS correct_when_corrected,
  SUM(CASE WHEN f.corrected_label IS NOT NULL THEN 1 ELSE 0 END) AS total_corrections
FROM maia_decision_votes v
JOIN maia_decisions d ON d.id = v.decision_id
LEFT JOIN maia_decision_feedback f ON f.decision_id = d.id
GROUP BY v.member;

-- View: Confident vs uncertain decisions with outcomes
CREATE OR REPLACE VIEW confidence_calibration AS
SELECT
  d.deliberation_triggered,
  d.trigger_reason,
  CASE
    WHEN d.final_confidence >= 0.8 THEN 'high'
    WHEN d.final_confidence >= 0.5 THEN 'medium'
    ELSE 'low'
  END AS confidence_band,
  COUNT(*) AS total,
  SUM(CASE WHEN f.attunement_score >= 4 THEN 1 ELSE 0 END) AS positive_outcomes,
  SUM(CASE WHEN f.attunement_score <= 2 THEN 1 ELSE 0 END) AS negative_outcomes,
  SUM(CASE WHEN f.corrected_label IS NOT NULL THEN 1 ELSE 0 END) AS corrections
FROM maia_decisions d
LEFT JOIN maia_decision_feedback f ON f.decision_id = d.id
WHERE f.attunement_score IS NOT NULL
GROUP BY d.deliberation_triggered, d.trigger_reason, confidence_band;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration: decision_trace_clean created successfully';
  RAISE NOTICE 'Tables: maia_decisions, maia_decision_candidates, maia_decision_votes, maia_decision_feedback';
  RAISE NOTICE 'Views: decision_feedback_pairs, prescient_dissent, agent_accuracy, confidence_calibration';
END $$;
