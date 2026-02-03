-- Synastry analyses persistence
-- Stores computed synastry results for later retrieval without recomputation

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS synastry_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Either side can be a memberId OR raw birth JSON (or both)
  a_member_id uuid NULL,
  b_member_id uuid NULL,

  -- Store raw birth payloads for non-member comparisons (and reproducibility)
  -- Expected shape: { date: "YYYY-MM-DD", time?: "HH:MM", timezone?: "America/New_York", lat?: number, lng?: number }
  a_birth jsonb NULL,
  b_birth jsonb NULL,

  -- Optional: who requested it (if you want to wire auth later without schema churn)
  requested_by_member_id uuid NULL,

  -- Persist the computed synastry payload (aspects + highlights + scores + chart summaries)
  result jsonb NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Minimal integrity: must have *some* identity/birth for each side
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'synastry_analyses_has_a'
  ) THEN
    ALTER TABLE synastry_analyses
      ADD CONSTRAINT synastry_analyses_has_a
      CHECK (a_member_id IS NOT NULL OR a_birth IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'synastry_analyses_has_b'
  ) THEN
    ALTER TABLE synastry_analyses
      ADD CONSTRAINT synastry_analyses_has_b
      CHECK (b_member_id IS NOT NULL OR b_birth IS NOT NULL);
  END IF;
END $$;

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_synastry_analyses_created_at
  ON synastry_analyses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_synastry_analyses_a_member_id
  ON synastry_analyses (a_member_id);

CREATE INDEX IF NOT EXISTS idx_synastry_analyses_b_member_id
  ON synastry_analyses (b_member_id);

CREATE INDEX IF NOT EXISTS idx_synastry_analyses_requested_by
  ON synastry_analyses (requested_by_member_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION synastry_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_synastry_analyses_updated_at ON synastry_analyses;

CREATE TRIGGER trg_synastry_analyses_updated_at
BEFORE UPDATE ON synastry_analyses
FOR EACH ROW
EXECUTE FUNCTION synastry_set_updated_at();

COMMENT ON TABLE synastry_analyses IS
'Stores persisted synastry computations (inputs + computed synastry payload) for later UI retrieval.';
