-- backend: lib/database/maia-opus-axioms-schema.sql

-- Table to store Opus Axiom evaluations per MAIA turn
CREATE TABLE IF NOT EXISTS opus_axiom_turns (
  id BIGSERIAL PRIMARY KEY,

  turn_id BIGINT REFERENCES maia_turns(id),
  session_id TEXT,
  user_id TEXT,

  timestamp TIMESTAMPTZ DEFAULT now(),

  facet TEXT,     -- e.g. 'FIRE_1'
  element TEXT,   -- e.g. 'fire'

  is_gold BOOLEAN NOT NULL DEFAULT false,
  warnings INT NOT NULL DEFAULT 0,
  violations INT NOT NULL DEFAULT 0,
  rupture_detected BOOLEAN NOT NULL DEFAULT false,

  axioms JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_timestamp
  ON opus_axiom_turns (timestamp);

CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_facet_element
  ON opus_axiom_turns (facet, element);

CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_is_gold
  ON opus_axiom_turns (is_gold);

CREATE INDEX IF NOT EXISTS idx_opus_axiom_turns_rupture
  ON opus_axiom_turns (rupture_detected);
