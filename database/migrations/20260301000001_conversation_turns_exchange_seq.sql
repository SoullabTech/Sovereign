-- ============================================================================
-- Migration: Add exchange_id, seq, visibility to conversation_turns
-- ============================================================================
-- Created: 2026-03-01
--
-- WHY: The session memory pipeline (Bridge E) requires idempotent turn storage.
-- TurnsStore.addExchange() uses exchange_id + seq to deduplicate retries.
-- The session summary worker's getSessionTurns() orders by seq.
-- Without these columns, ALL of the following are broken:
--   - New turn persistence (addExchange fails silently)
--   - Session summary generation (getSessionTurns fails with "seq not found")
--   - Turns fallback for continuity (getRecentTurns fails with "seq not found")
--   → MAIA has zero cross-session memory.
--
-- WHAT: Additive migration only. Does NOT drop meta or parent_turn_id (legacy
-- columns from 20260204000002_conversation_turns_meta.sql — kept for safety).
-- ============================================================================

BEGIN;

-- Add visibility for future per-turn privacy control
ALTER TABLE conversation_turns
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('public', 'members', 'private'));

-- Add exchange_id: UUID supplied by the caller to make writes idempotent.
-- NULL means the turn was written via the legacy addTurn() path (no dedup).
ALTER TABLE conversation_turns
  ADD COLUMN IF NOT EXISTS exchange_id UUID;

-- Add seq: 0 = user turn, 1 = assistant turn within the same exchange.
-- Combined with exchange_id, uniquely identifies each half of a pair.
ALTER TABLE conversation_turns
  ADD COLUMN IF NOT EXISTS seq SMALLINT NOT NULL DEFAULT 0;

-- Unique partial index: prevents duplicate turns on retry when exchange_id is set.
-- Partial (WHERE exchange_id IS NOT NULL) so legacy rows with NULL exchange_id
-- don't conflict with each other.
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_turns_exchange_role
  ON conversation_turns (exchange_id, seq)
  WHERE exchange_id IS NOT NULL;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260301000001: conversation_turns exchange_id/seq/visibility added. Memory pipeline now unblocked.';
END $$;
