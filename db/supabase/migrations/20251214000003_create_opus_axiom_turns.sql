-- Migration: Create opus_axiom_turns table
-- Purpose: Store Opus Axioms evaluations for DEEP path responses
-- Context: Phase 2 - Intelligence Integration (Opus routing)

-- Create opus_axiom_turns table for logging DEEP path axiom evaluations
-- Note: Table may already exist with 'timestamp' column instead of 'created_at'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'opus_axiom_turns') THEN
    CREATE TABLE opus_axiom_turns (
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
  ELSE
    -- Table exists, check if we need to rename timestamp to created_at
    IF EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'opus_axiom_turns'
      AND column_name = 'timestamp'
    ) THEN
      ALTER TABLE opus_axiom_turns RENAME COLUMN timestamp TO created_at;
    END IF;
  END IF;
END $$;

-- Create indexes for common query patterns (some may already exist)
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

-- Use created_at for new index (table might have had timestamp before rename)
DROP INDEX IF EXISTS idx_opus_axiom_turns_timestamp;
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
