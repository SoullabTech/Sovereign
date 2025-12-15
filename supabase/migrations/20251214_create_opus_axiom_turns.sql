-- Migration: Create opus_axiom_turns table
-- Purpose: Store Opus Axioms evaluations for DEEP path responses
-- Context: Phase 2 - Intelligence Integration (Opus routing)

-- Create opus_axiom_turns table for logging DEEP path axiom evaluations
CREATE TABLE IF NOT EXISTS opus_axiom_turns (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT,
  session_id TEXT,
  user_id TEXT,
  facet TEXT,
  element TEXT,
  is_gold BOOLEAN NOT NULL DEFAULT false,
  warnings INTEGER NOT NULL DEFAULT 0,
  violations INTEGER NOT NULL DEFAULT 0,
  rupture_detected BOOLEAN NOT NULL DEFAULT false,
  axioms JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_turn_id
  ON opus_axiom_turns(turn_id);

CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_session_id
  ON opus_axiom_turns(session_id);

CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_user_id
  ON opus_axiom_turns(user_id);

CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_is_gold
  ON opus_axiom_turns(is_gold)
  WHERE is_gold = true;

CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_rupture
  ON opus_axiom_turns(rupture_detected)
  WHERE rupture_detected = true;

CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_created_at
  ON opus_axiom_turns(created_at DESC);

-- Add comment explaining the table structure
COMMENT ON TABLE opus_axiom_turns IS 'Stores Opus Axioms evaluation results for DEEP path consciousness consultations. Tracks relational quality metrics including gold turns, warnings, violations, and rupture detection.';

COMMENT ON COLUMN opus_axiom_turns.turn_id IS 'Foreign key to dialectical_scaffold_turns (nullable - some evaluations may not have associated turns)';
COMMENT ON COLUMN opus_axiom_turns.is_gold IS 'True when response meets gold standard for relational attunement';
COMMENT ON COLUMN opus_axiom_turns.warnings IS 'Count of non-critical attunement issues detected';
COMMENT ON COLUMN opus_axiom_turns.violations IS 'Count of serious attunement violations detected';
COMMENT ON COLUMN opus_axiom_turns.rupture_detected IS 'True when relational rupture detected in exchange';
COMMENT ON COLUMN opus_axiom_turns.axioms IS 'Full OpusAxiomSummary JSON with evaluations array and notes';
