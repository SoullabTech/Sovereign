-- Decision Iterations — Carrying the Work Forward
--
-- Each council consultation on a decision becomes a preserved iteration.
-- The practitioner returns with new context after each client session,
-- and the council sees the arc, not just the snapshot.
--
-- The parent studio_decisions row always reflects the latest iteration
-- for fast access. This table preserves the full history.

-- ─── Iterations table ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS decision_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES studio_decisions(id) ON DELETE CASCADE,
  iteration_number INTEGER NOT NULL,

  -- What the practitioner brought to this round
  session_notes TEXT,              -- "Here's what happened since last time"
  updated_context TEXT,            -- Optional: refined/expanded situation context
  emotional_state TEXT,            -- State at this iteration (may shift between rounds)

  -- AIN council result (full ConsultationResult as JSONB)
  council_result JSONB NOT NULL,

  -- Practitioner synthesis after this round
  consultant_notes TEXT,
  questions TEXT[] DEFAULT '{}',

  -- Timestamps
  consulted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each decision has exactly one of each iteration number
  UNIQUE(decision_id, iteration_number)
);

CREATE INDEX IF NOT EXISTS idx_decision_iterations_decision
  ON decision_iterations(decision_id, iteration_number);

COMMENT ON TABLE decision_iterations IS
  'Council consultation history for decisions — each round preserved with context and result';

-- ─── Schema updates to studio_decisions ─────────────────────────

-- Track how many iterations have occurred (fast access)
ALTER TABLE studio_decisions
  ADD COLUMN IF NOT EXISTS iteration_count INTEGER NOT NULL DEFAULT 0;

-- Add 'active' status for decisions with ongoing iterations
-- (drop and recreate the check constraint)
ALTER TABLE studio_decisions
  DROP CONSTRAINT IF EXISTS studio_decisions_status_check;

ALTER TABLE studio_decisions
  ADD CONSTRAINT studio_decisions_status_check
  CHECK (status IN ('draft', 'consulting', 'active', 'complete', 'archived'));

-- Backfill: any existing 'complete' decision with a council_result gets iteration_count = 1
UPDATE studio_decisions
  SET iteration_count = 1
  WHERE council_result IS NOT NULL
    AND iteration_count = 0;
