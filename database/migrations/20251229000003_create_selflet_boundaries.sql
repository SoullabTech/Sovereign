-- Migration: Create selflet_boundaries table
-- Created: 2025-12-29
-- Purpose: Persist detected "identity boundary" events (micro/major/metamorphosis/manual)

BEGIN;

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS selflet_boundaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id text NOT NULL,
  session_id text,

  from_selflet_id uuid REFERENCES selflet_nodes(id) ON DELETE SET NULL,
  to_selflet_id uuid REFERENCES selflet_nodes(id) ON DELETE SET NULL,

  -- micro|major|metamorphosis|manual
  boundary_kind text NOT NULL DEFAULT 'micro',

  -- Helpful denormalized fields for fast filtering (optional but practical)
  element_from text,
  element_to text,
  phase_from text,
  phase_to text,

  intensity real,
  continuity_score_before real,
  continuity_score_after real,

  -- Full detector payload + any future fields (reasons, cues, tags, etc.)
  signal jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- For debugging / replay (optional)
  input_excerpt text,
  assistant_excerpt text,

  -- If you want "major boundaries require acknowledgement"
  user_confirmed boolean NOT NULL DEFAULT false,
  confirmed_at timestamptz,

  detected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Constraints
DO $$
BEGIN
  -- Keep it safe even if re-run
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'selflet_boundaries_kind_chk'
  ) THEN
    ALTER TABLE selflet_boundaries
      ADD CONSTRAINT selflet_boundaries_kind_chk
      CHECK (boundary_kind IN ('micro','major','metamorphosis','manual'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_selflet_boundaries_user_time
  ON selflet_boundaries (user_id, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_selflet_boundaries_from
  ON selflet_boundaries (from_selflet_id);

CREATE INDEX IF NOT EXISTS idx_selflet_boundaries_to
  ON selflet_boundaries (to_selflet_id);

CREATE INDEX IF NOT EXISTS idx_selflet_boundaries_signal_gin
  ON selflet_boundaries USING gin (signal);

-- Optional grants (safe if roles don't exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'maia_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE selflet_boundaries TO maia_app;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'maia_readonly') THEN
    GRANT SELECT ON TABLE selflet_boundaries TO maia_readonly;
  END IF;
END $$;

COMMIT;
