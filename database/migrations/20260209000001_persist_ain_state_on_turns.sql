-- Migration: Persist AIN Knowledge Gate state on conversation turns
-- Created: 2026-02-09
-- Purpose: Store ain_state (source mix, awareness level, raw scores) alongside each oracle turn
--          so we can reconstruct "why FIELD:50%?" without digging through logs.
--          Part of Phase 1.1 hardening — makes the Knowledge Gate decision reconstructable.

BEGIN;

-- Add AIN state columns to conversation_turns
ALTER TABLE IF EXISTS conversation_turns
  ADD COLUMN IF NOT EXISTS ain_state JSONB;

ALTER TABLE IF EXISTS conversation_turns
  ADD COLUMN IF NOT EXISTS ain_raw_scores JSONB;

ALTER TABLE IF EXISTS conversation_turns
  ADD COLUMN IF NOT EXISTS ain_awareness_level INT;

ALTER TABLE IF EXISTS conversation_turns
  ADD COLUMN IF NOT EXISTS ain_awareness_confidence DOUBLE PRECISION;

-- Index for querying analytics / debugging
-- "Show me all turns where awareness was L3+"
CREATE INDEX IF NOT EXISTS idx_conversation_turns_ain_awareness_level
  ON conversation_turns (ain_awareness_level)
  WHERE ain_awareness_level IS NOT NULL;

-- GIN index for querying inside the JSONB (e.g., "which turns had FIELD > 50%?")
CREATE INDEX IF NOT EXISTS idx_conversation_turns_ain_state_gin
  ON conversation_turns USING GIN (ain_state)
  WHERE ain_state IS NOT NULL;

COMMENT ON COLUMN conversation_turns.ain_state IS
'AIN Knowledge Gate state: { sourceMix, awarenessLevel, awarenessConfidence, awarenessDescription, derived }';

COMMENT ON COLUMN conversation_turns.ain_raw_scores IS
'Pre-normalization raw scores from scoreKnowledgeGate() — the "why" behind the mix';

COMMENT ON COLUMN conversation_turns.ain_awareness_level IS
'Awareness level (1-5) for fast scalar queries without JSONB extraction';

COMMENT ON COLUMN conversation_turns.ain_awareness_confidence IS
'Awareness confidence (0.0-1.0) for fast scalar queries';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260209000001: ain_state columns added to conversation_turns';
END $$;
