-- Opus Axiom Turns Table
-- Stores Opus Axiom evaluations per MAIA turn
-- Part of MAIA's quality evaluation system

CREATE TABLE IF NOT EXISTS opus_axiom_turns (
  id BIGSERIAL PRIMARY KEY,
  turn_id BIGINT,  -- Optional reference to maia_turns (no FK constraint for flexibility)
  session_id TEXT,
  user_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  facet TEXT,      -- e.g. 'FIRE_1'
  element TEXT,    -- e.g. 'fire'
  is_gold BOOLEAN NOT NULL DEFAULT FALSE,
  warnings INTEGER NOT NULL DEFAULT 0,
  violations INTEGER NOT NULL DEFAULT 0,
  rupture_detected BOOLEAN NOT NULL DEFAULT FALSE,
  axioms JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_timestamp ON opus_axiom_turns(timestamp);
CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_facet_element ON opus_axiom_turns(facet, element);
CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_is_gold ON opus_axiom_turns(is_gold);
CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_rupture ON opus_axiom_turns(rupture_detected);

COMMENT ON TABLE opus_axiom_turns IS 'Opus Axiom quality evaluations per MAIA conversation turn';
