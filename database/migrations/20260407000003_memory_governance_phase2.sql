-- Memory Governance Phase 2: never_use_for_ai veto flag
--
-- Adds the strongest-priority consent veto to memory contracts.
-- When never_use_for_ai = true, the contract blocks ALL AI processing
-- regardless of disposition, session settings, or any other flag.
--
-- expires_at already exists on memory_contracts (Phase 1).
-- This migration only adds the new column.
--
-- Precedence (waterfall, strongest first):
--   1. never_use_for_ai = true         → deny
--   2. expired contract (expires_at)    → deny (contract no longer governing)
--   3. disposition = keep_private       → deny summaries
--   4. session-level trust settings     → apply
--   5. otherwise                        → permit

ALTER TABLE memory_contracts
  ADD COLUMN IF NOT EXISTS never_use_for_ai BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN memory_contracts.never_use_for_ai IS
  'Strongest veto: this content must NEVER be used for AI summarization, '
  'symbolic interpretation, pattern extraction, or agent processing. '
  'Stronger than disposition — overrides even allow_maia_summary.';

-- Index for fast lookup in the privacy gate query
CREATE INDEX IF NOT EXISTS idx_memory_contracts_ai_veto
  ON memory_contracts(session_id, never_use_for_ai)
  WHERE status = 'active' AND never_use_for_ai = TRUE;
