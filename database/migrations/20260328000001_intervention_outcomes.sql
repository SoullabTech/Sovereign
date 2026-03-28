-- Transformation Loop Closure: Intervention Outcome Tracking
-- Links what MAIA did → what shifted → what to learn
--
-- Design principles:
--   1. Fire-and-forget writes (never block oracle)
--   2. No conversation content stored (only structural signals)
--   3. Supports lightweight synthesis without ML
--   4. Catalyst invariant: autonomy_signal is a first-class field

CREATE TABLE IF NOT EXISTS member_intervention_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  session_id TEXT,

  -- What MAIA did (intervention)
  relational_stance TEXT NOT NULL,          -- HOLD / MIRROR / CHALLENGE / RELEASE / SEASONAL_RETURN
  element TEXT NOT NULL,                     -- fire / water / earth / air / aether
  phase INTEGER,                             -- spiral phase at time of intervention
  intensity NUMERIC(3,2),                    -- 0-1 signal strength

  -- What shifted (outcome — captured on NEXT user message)
  shift_detected BOOLEAN DEFAULT FALSE,
  shift_type TEXT,                            -- language / emotional / pattern / none
  shift_direction TEXT,                       -- positive / neutral / negative
  coherence_delta NUMERIC(4,3),              -- -1.0 to +1.0
  repetition_flag BOOLEAN DEFAULT FALSE,     -- same pattern repeated?
  autonomy_signal TEXT,                      -- naming_own_direction / asking_system / neither

  -- Context and tone (analytic, not identity-defining)
  interaction_context TEXT DEFAULT 'unknown',  -- self / relationship / group / practitioner_client / unknown
  tone_profile TEXT DEFAULT 'neutral',         -- grounded / directive / reflective / ceremonial / neutral

  -- Structural metadata (never content)
  conversation_depth INTEGER,
  trust_level NUMERIC(3,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  outcome_captured_at TIMESTAMPTZ            -- NULL until next-turn shift detection runs
);

-- Index for member synthesis queries
CREATE INDEX IF NOT EXISTS idx_intervention_outcomes_member
  ON member_intervention_outcomes (member_id, created_at DESC);

-- Index for aggregate learning queries (what works across members)
CREATE INDEX IF NOT EXISTS idx_intervention_outcomes_stance_element
  ON member_intervention_outcomes (relational_stance, element);

-- Index for cross-member pattern analysis (context × tone)
CREATE INDEX IF NOT EXISTS idx_intervention_outcomes_context_tone
  ON member_intervention_outcomes (interaction_context, tone_profile);
