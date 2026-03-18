-- Pattern Intelligence columns
-- Phase 1: make patterns humane — description, integration prompt, generation tracking, resonance response

ALTER TABLE pattern_ledger
  ADD COLUMN IF NOT EXISTS description          text,
  ADD COLUMN IF NOT EXISTS integration_prompt   text,
  ADD COLUMN IF NOT EXISTS generation_status    text DEFAULT 'pending'
    CHECK (generation_status IN ('pending', 'generating', 'complete', 'failed')),
  ADD COLUMN IF NOT EXISTS generation_lock      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS generated_at         timestamptz,
  ADD COLUMN IF NOT EXISTS resonance_response   text
    CHECK (resonance_response IN ('fits', 'partly', 'not_now', 'no', 'explore'));

-- Index for finding patterns needing generation
CREATE INDEX IF NOT EXISTS idx_pattern_ledger_needs_generation
  ON pattern_ledger (generation_status, confidence, recurrence_count)
  WHERE description IS NULL
    AND generation_lock = false
    AND status NOT IN ('retired');
