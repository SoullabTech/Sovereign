-- Migration: Deliberation Feedback Linkage
-- Created: 2026-01-13
-- Purpose: Enable agent evolution by linking user feedback to deliberation vote bundles
--
-- This allows answering questions like:
--   - "Which agents were right when user gave thumbs up?"
--   - "Is CBT Agent overconfident?"
--   - "Which deliberation outcomes correlate with positive feedback?"

BEGIN;

-- =============================================================================
-- DELIBERATIONS TABLE - Store vote bundles for later analysis
-- =============================================================================
CREATE TABLE IF NOT EXISTS deliberations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Context identifiers
  conversation_id TEXT,
  turn_id BIGINT REFERENCES maia_turns(id) ON DELETE SET NULL,
  session_id TEXT,

  -- Committee info
  committee TEXT DEFAULT 'mythic_atlas',

  -- Final decision
  final_classification TEXT NOT NULL,
  final_confidence DOUBLE PRECISION,
  decided_by TEXT DEFAULT 'committee',  -- "committee" | "atlas_fallback"

  -- Vote audit trail (the gold for agent evolution)
  votes_json JSONB NOT NULL,  -- [{member, classification, confidence, weight, rationale}, ...]

  -- Additional context
  deliberation_ms INTEGER,
  notes TEXT,
  meta_json JSONB
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_deliberations_turn_id ON deliberations(turn_id);
CREATE INDEX IF NOT EXISTS idx_deliberations_session_id ON deliberations(session_id);
CREATE INDEX IF NOT EXISTS idx_deliberations_created_at ON deliberations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deliberations_final_classification ON deliberations(final_classification);

-- GIN index for querying vote details
CREATE INDEX IF NOT EXISTS idx_deliberations_votes_gin ON deliberations USING GIN (votes_json);

-- =============================================================================
-- ADD DELIBERATION_ID TO MAIA_TURNS - Link turns to their deliberation
-- =============================================================================
ALTER TABLE maia_turns
ADD COLUMN IF NOT EXISTS deliberation_id UUID REFERENCES deliberations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_maia_turns_deliberation_id ON maia_turns(deliberation_id)
WHERE deliberation_id IS NOT NULL;

-- =============================================================================
-- ADD DELIBERATION_ID TO FEEDBACK - Direct linkage for analysis
-- =============================================================================
ALTER TABLE maia_turn_feedback
ADD COLUMN IF NOT EXISTS deliberation_id UUID REFERENCES deliberations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_deliberation_id ON maia_turn_feedback(deliberation_id)
WHERE deliberation_id IS NOT NULL;

-- =============================================================================
-- HELPER FUNCTION: Persist deliberation and return ID
-- =============================================================================
CREATE OR REPLACE FUNCTION persist_deliberation(
  p_session_id TEXT,
  p_turn_id BIGINT,
  p_committee TEXT,
  p_final_classification TEXT,
  p_final_confidence DOUBLE PRECISION,
  p_decided_by TEXT,
  p_votes_json JSONB,
  p_deliberation_ms INTEGER,
  p_notes TEXT,
  p_meta_json JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_deliberation_id UUID;
BEGIN
  INSERT INTO deliberations (
    session_id,
    turn_id,
    committee,
    final_classification,
    final_confidence,
    decided_by,
    votes_json,
    deliberation_ms,
    notes,
    meta_json
  ) VALUES (
    p_session_id,
    p_turn_id,
    COALESCE(p_committee, 'mythic_atlas'),
    p_final_classification,
    p_final_confidence,
    COALESCE(p_decided_by, 'committee'),
    p_votes_json,
    p_deliberation_ms,
    p_notes,
    p_meta_json
  )
  RETURNING id INTO v_deliberation_id;

  -- Link the turn to this deliberation if turn_id provided
  IF p_turn_id IS NOT NULL THEN
    UPDATE maia_turns
    SET deliberation_id = v_deliberation_id
    WHERE id = p_turn_id;
  END IF;

  RETURN v_deliberation_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEWS FOR AGENT EVOLUTION ANALYSIS
-- =============================================================================

-- View: Deliberations with user feedback (the training signal)
CREATE OR REPLACE VIEW deliberation_feedback_pairs AS
SELECT
  d.id AS deliberation_id,
  d.created_at,
  d.session_id,
  d.committee,
  d.final_classification,
  d.final_confidence,
  d.decided_by,
  d.votes_json,
  d.deliberation_ms,
  f.id AS feedback_id,
  f.felt_seen_score,
  f.attunement_score,
  f.safety_score,
  f.depth_appropriateness_score,
  f.rupture_mark,
  f.ideal_for_repair,
  f.tags AS feedback_tags,
  f.comment AS feedback_comment,
  -- Computed: was this a "good" outcome?
  CASE
    WHEN COALESCE(f.attunement_score, 0) >= 4
     AND COALESCE(f.felt_seen_score, 0) >= 4
     AND COALESCE(f.rupture_mark, FALSE) = FALSE
    THEN TRUE
    ELSE FALSE
  END AS positive_outcome,
  -- Computed: was this a "bad" outcome?
  CASE
    WHEN COALESCE(f.rupture_mark, FALSE) = TRUE
      OR COALESCE(f.attunement_score, 5) <= 2
      OR COALESCE(f.felt_seen_score, 5) <= 2
    THEN TRUE
    ELSE FALSE
  END AS negative_outcome
FROM deliberations d
LEFT JOIN maia_turn_feedback f ON f.deliberation_id = d.id OR f.turn_id = d.turn_id
WHERE f.id IS NOT NULL;

-- View: Agent accuracy tracking (unnest votes and correlate with outcomes)
CREATE OR REPLACE VIEW agent_vote_outcomes AS
SELECT
  v->>'member' AS agent,
  v->>'classification' AS agent_vote,
  (v->>'confidence')::DOUBLE PRECISION AS agent_confidence,
  v->>'rationale' AS agent_rationale,
  d.final_classification,
  d.final_confidence,
  f.attunement_score,
  f.felt_seen_score,
  f.rupture_mark,
  -- Did this agent vote for the final decision?
  (v->>'classification' = d.final_classification) AS voted_with_consensus,
  -- Was the final outcome positive?
  CASE
    WHEN COALESCE(f.attunement_score, 0) >= 4
     AND COALESCE(f.rupture_mark, FALSE) = FALSE
    THEN TRUE
    ELSE FALSE
  END AS positive_outcome,
  d.created_at
FROM deliberations d
CROSS JOIN LATERAL jsonb_array_elements(d.votes_json) AS v
LEFT JOIN maia_turn_feedback f ON f.deliberation_id = d.id OR f.turn_id = d.turn_id
WHERE f.id IS NOT NULL;

-- View: Dissent mining - find cases where minority vote was "right"
CREATE OR REPLACE VIEW prescient_dissent AS
SELECT
  agent,
  agent_vote,
  agent_confidence,
  agent_rationale,
  final_classification,
  attunement_score,
  felt_seen_score,
  created_at
FROM agent_vote_outcomes
WHERE voted_with_consensus = FALSE  -- Agent dissented
  AND positive_outcome = FALSE       -- Outcome was bad
ORDER BY created_at DESC;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration: deliberation_feedback_linkage created successfully';
  RAISE NOTICE 'Tables: deliberations';
  RAISE NOTICE 'Columns added: maia_turns.deliberation_id, maia_turn_feedback.deliberation_id';
  RAISE NOTICE 'Views: deliberation_feedback_pairs, agent_vote_outcomes, prescient_dissent';
END $$;
