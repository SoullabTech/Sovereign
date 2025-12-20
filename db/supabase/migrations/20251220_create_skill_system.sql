-- MAIA Skills System
-- Phase 4: Operationalizing Consciousness Expertise
-- Created: 2025-12-20

-- Skills Registry (source of truth for enabled skills)
CREATE TABLE IF NOT EXISTS skills_registry (
  skill_id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  sha256 TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  trust_level INT NOT NULL DEFAULT 1, -- 1-5, for rollout control
  meta JSONB NOT NULL DEFAULT '{}'::JSONB, -- Denormalized metadata for fast queries
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_registry_enabled ON skills_registry(enabled) WHERE enabled = true;
CREATE INDEX idx_skills_registry_tier ON skills_registry((meta->>'tier'));
CREATE INDEX idx_skills_registry_category ON skills_registry((meta->>'category'));

-- Skill Unlocks (earned access to emergent skills)
CREATE TABLE IF NOT EXISTS skill_unlocks (
  user_id UUID NOT NULL,
  skill_id TEXT NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  unlock_reason TEXT, -- 'stable_level_4', 'shadow_integration', etc.
  PRIMARY KEY (user_id, skill_id)
);

CREATE INDEX idx_skill_unlocks_user ON skill_unlocks(user_id);
CREATE INDEX idx_skill_unlocks_unlocked ON skill_unlocks(unlocked) WHERE unlocked = true;

-- Skill Usage Events (execution telemetry)
CREATE TABLE IF NOT EXISTS skill_usage_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT,
  skill_id TEXT NOT NULL,
  version TEXT NOT NULL,
  tier TEXT, -- FAST/CORE/DEEP
  outcome TEXT NOT NULL, -- success | soft_fail | hard_refusal
  latency_ms INT,
  input_hash TEXT, -- For deduplication analysis
  state_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB, -- User state at execution
  artifacts JSONB NOT NULL DEFAULT '{}'::JSONB, -- What the skill produced
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skill_usage_user ON skill_usage_events(user_id);
CREATE INDEX idx_skill_usage_skill ON skill_usage_events(skill_id);
CREATE INDEX idx_skill_usage_outcome ON skill_usage_events(outcome);
CREATE INDEX idx_skill_usage_created ON skill_usage_events(created_at DESC);

-- Skill Feedback (user ratings + qualitative feedback)
CREATE TABLE IF NOT EXISTS skill_feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id TEXT NOT NULL,
  version TEXT NOT NULL,
  rating INT, -- -1, 0, +1 or 1-5
  tags TEXT[] DEFAULT '{}', -- ['helpful', 'too-directive', 'resonant', etc.]
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skill_feedback_skill ON skill_feedback(skill_id);
CREATE INDEX idx_skill_feedback_rating ON skill_feedback(rating);
CREATE INDEX idx_skill_feedback_created ON skill_feedback(created_at DESC);

-- Agent Emergence Candidates (pattern detection for new archetypes)
CREATE TABLE IF NOT EXISTS agent_emergence_candidates (
  id BIGSERIAL PRIMARY KEY,
  signature_hash TEXT NOT NULL, -- Hash of (tier, element, realm, cognitive_level_bucket, skill_cluster)
  tier TEXT,
  element TEXT,
  realm TEXT,
  cooccur_skills JSONB NOT NULL DEFAULT '[]'::JSONB, -- Skills that cluster together
  support_count INT NOT NULL DEFAULT 0, -- How many users exhibit this pattern
  avg_success_rate NUMERIC, -- Success rate of the skill cluster
  field_coherence NUMERIC, -- Average field coherence when pattern appears
  archetypal_name TEXT, -- LLM-generated suggestion
  status TEXT NOT NULL DEFAULT 'monitoring', -- monitoring | review | approved | deployed | rejected
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_emergence_signature ON agent_emergence_candidates(signature_hash);
CREATE INDEX idx_agent_emergence_status ON agent_emergence_candidates(status);
CREATE INDEX idx_agent_emergence_support ON agent_emergence_candidates(support_count DESC);

-- Comments
COMMENT ON TABLE skills_registry IS 'Registry of all skills available in the system';
COMMENT ON TABLE skill_unlocks IS 'Earned access to emergent skills (initiatory gates)';
COMMENT ON TABLE skill_usage_events IS 'Telemetry for every skill execution';
COMMENT ON TABLE skill_feedback IS 'User feedback for skill refinement';
COMMENT ON TABLE agent_emergence_candidates IS 'Detected patterns that may become new archetypes';

COMMENT ON COLUMN skills_registry.trust_level IS '1-5: controls rollout (1=beta, 5=stable)';
COMMENT ON COLUMN skill_usage_events.outcome IS 'success | soft_fail | hard_refusal';
COMMENT ON COLUMN skill_usage_events.state_snapshot IS 'User state at time of execution (for pattern mining)';
COMMENT ON COLUMN agent_emergence_candidates.signature_hash IS 'Unique identifier for pattern (for deduplication)';

-- ==============================================================================
-- HELPER FUNCTIONS
-- ==============================================================================

-- Log skill usage (called by runtime)
CREATE OR REPLACE FUNCTION log_skill_usage(
  p_user_id UUID,
  p_session_id TEXT,
  p_skill_id TEXT,
  p_version TEXT,
  p_tier TEXT,
  p_outcome TEXT,
  p_latency_ms INT DEFAULT NULL,
  p_input_hash TEXT DEFAULT NULL,
  p_state_snapshot JSONB DEFAULT '{}'::jsonb,
  p_artifacts JSONB DEFAULT '{}'::jsonb
) RETURNS BIGINT AS $$
DECLARE
  v_event_id BIGINT;
BEGIN
  INSERT INTO skill_usage_events (
    user_id, session_id, skill_id, version, tier,
    outcome, latency_ms, input_hash, state_snapshot, artifacts
  ) VALUES (
    p_user_id, p_session_id, p_skill_id, p_version, p_tier,
    p_outcome, p_latency_ms, p_input_hash, p_state_snapshot, p_artifacts
  ) RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Check if skill is unlocked for user
CREATE OR REPLACE FUNCTION is_skill_unlocked(
  p_user_id UUID,
  p_skill_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Foundational skills are always unlocked
  IF EXISTS (
    SELECT 1 FROM skills_registry
    WHERE skill_id = p_skill_id
    AND meta->>'category' = 'foundational'
  ) THEN
    RETURN true;
  END IF;

  -- Check explicit unlock
  RETURN EXISTS (
    SELECT 1 FROM skill_unlocks
    WHERE user_id = p_user_id
    AND skill_id = p_skill_id
    AND unlocked = true
  );
END;
$$ LANGUAGE plpgsql;

-- Unlock skill for user
CREATE OR REPLACE FUNCTION unlock_skill(
  p_user_id UUID,
  p_skill_id TEXT,
  p_unlock_reason TEXT DEFAULT 'manual'
) RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO skill_unlocks (user_id, skill_id, unlocked, unlocked_at, unlock_reason)
  VALUES (p_user_id, p_skill_id, true, NOW(), p_unlock_reason)
  ON CONFLICT (user_id, skill_id) DO UPDATE
  SET unlocked = true,
      unlocked_at = NOW(),
      unlock_reason = p_unlock_reason;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- VIEWS
-- ==============================================================================

-- Skill effectiveness aggregates
CREATE OR REPLACE VIEW v_skill_effectiveness AS
SELECT
  sue.skill_id,
  COUNT(*) as total_uses,
  COUNT(CASE WHEN sue.outcome = 'success' THEN 1 END) as success_count,
  ROUND(100.0 * COUNT(CASE WHEN sue.outcome = 'success' THEN 1 END) / NULLIF(COUNT(*), 0), 2) as success_rate_pct,
  AVG(sue.latency_ms)::INT as avg_latency_ms,
  AVG(sf.rating) as avg_rating,
  COUNT(DISTINCT sue.user_id) as unique_users,
  MIN(sue.created_at) as first_use,
  MAX(sue.created_at) as last_use
FROM skill_usage_events sue
LEFT JOIN skill_feedback sf ON sue.skill_id = sf.skill_id AND sue.user_id = sf.user_id
GROUP BY sue.skill_id;

COMMENT ON VIEW v_skill_effectiveness IS 'Aggregate effectiveness metrics per skill';

-- Skill co-occurrence for pattern mining
CREATE OR REPLACE VIEW v_skill_cooccurrence AS
WITH session_skills AS (
  SELECT
    session_id,
    user_id,
    (state_snapshot->>'element')::TEXT as element,
    (state_snapshot->>'realm')::TEXT as realm,
    (state_snapshot->>'tier')::TEXT as tier,
    ARRAY_AGG(DISTINCT skill_id ORDER BY skill_id) as skill_set,
    COUNT(DISTINCT skill_id) as skill_count,
    AVG(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END) as success_rate,
    MIN(created_at) as first_skill_at,
    MAX(created_at) as last_skill_at
  FROM skill_usage_events
  WHERE outcome = 'success'
  GROUP BY session_id, user_id, state_snapshot->>'element', state_snapshot->>'realm', state_snapshot->>'tier'
  HAVING COUNT(DISTINCT skill_id) >= 2 -- At least 2 skills co-occurring
)
SELECT
  skill_set,
  tier,
  element,
  realm,
  COUNT(*) as cooccurrence_count,
  COUNT(DISTINCT user_id) as distinct_users,
  AVG(success_rate)::NUMERIC(4,3) as avg_success_rate,
  MIN(first_skill_at) as first_observed,
  MAX(last_skill_at) as last_observed
FROM session_skills
GROUP BY skill_set, tier, element, realm
HAVING COUNT(*) >= 3 -- Occurred together at least 3 times
ORDER BY cooccurrence_count DESC;

COMMENT ON VIEW v_skill_cooccurrence IS 'Detects skills that frequently occur together (proto-agents)';
