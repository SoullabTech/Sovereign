-- Consciousness Evolution Table
-- Tracks 7-stage consciousness development journey per user
-- Part of MAIA's 5-Layer Memory Palace - Phase 3

CREATE TABLE IF NOT EXISTS consciousness_evolution (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,

  -- Current stage (1-7)
  current_stage INTEGER NOT NULL DEFAULT 1,
  current_stage_name TEXT NOT NULL DEFAULT 'Awakening',

  -- Stage progression (JSONB array of StageProgress objects)
  stage_progression JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metrics (stored as JSONB)
  presence_depth JSONB NOT NULL DEFAULT '{"bodyAwareness":0,"emotionalRange":0,"witnessCapacity":0,"presentMomentAccess":0,"depthOfListening":0}'::jsonb,
  somatic_awareness JSONB NOT NULL DEFAULT '{"bodyListening":0,"tensionRecognition":0,"somaticIntelligence":0,"embodiedPresence":0}'::jsonb,
  morphic_contribution JSONB NOT NULL DEFAULT '{"patternRecognition":0,"archetypeIntegration":0,"fieldContribution":0,"collectiveResonance":0}'::jsonb,
  witness_capacity JSONB NOT NULL DEFAULT '{"selfObservation":0,"nonReactivity":0,"metaCognition":0,"perspectiveTaking":0}'::jsonb,
  trust_evolution JSONB NOT NULL DEFAULT '{"bodyTrust":0,"processTrust":0,"fieldTrust":0,"selfTrust":0}'::jsonb,

  -- Development indicators
  breakthrough_count INTEGER NOT NULL DEFAULT 0,
  integration_cycles_completed INTEGER NOT NULL DEFAULT 0,
  wisdom_embodiment_level NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  next_stage_readiness NUMERIC(3,2) NOT NULL DEFAULT 0.0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_consciousness_evolution_user_id ON consciousness_evolution(user_id);

-- Comment
COMMENT ON TABLE consciousness_evolution IS 'Tracks consciousness development stages per user (MAIA Memory Palace Phase 3)';
