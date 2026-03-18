-- Session Occupancy Ratings
-- A structured 1-5 rating of relational occupancy per session.
-- Tracks whether the relational channel is opening over time.
--
-- Conceptually: "How occupied was the channel in this session?"
-- 1 = reciprocal (genuine back-and-forth)
-- 2 = mild (some over-talking, readily redirectable)
-- 3 = occupied (frequent occupation, pauses difficult)
-- 4 = sustained (extended monologue, minimal reciprocal contact)
-- 5 = total (no usable intervention channel)
--
-- This table is lightweight and intended to be filled after every session.
-- It provides longitudinal progression data.

CREATE TABLE IF NOT EXISTS session_occupancy_ratings (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id             UUID NOT NULL,
  client_id                   UUID,
  studio_session_id           UUID,
  decision_id                 UUID REFERENCES studio_decisions(id) ON DELETE SET NULL,
  change_id                   UUID REFERENCES studio_changes(id) ON DELETE SET NULL,
  score                       SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  warm_interruption_tolerated BOOLEAN,
  moment_of_contact           TEXT,           -- brief note on any genuine contact moment
  notes                       TEXT,
  rated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_occupancy_practitioner ON session_occupancy_ratings(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_occupancy_client ON session_occupancy_ratings(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_occupancy_decision ON session_occupancy_ratings(decision_id) WHERE decision_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_occupancy_change ON session_occupancy_ratings(change_id) WHERE change_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_occupancy_rated_at ON session_occupancy_ratings(rated_at);
