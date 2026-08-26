-- WS-VISIBLE-01 — the writing room's conversation with MAIA.
--
-- The Writer Canvas gained a real MAIA presence (it was a hard-coded
-- placeholder sentence). A conversation the writer loses on reload is not a
-- presence in the room, it is a widget — so the exchange is durable, and the
-- room re-opens where the writer left it.
--
-- BOUNDARIES THAT ARE STRUCTURAL HERE:
--
--   1. Member-owned. member_id is NOT NULL and every read/write is scoped by
--      credential. Nothing here is cross-member, aggregated, or shared.
--
--   2. Scoped to a room, not to a person. A turn belongs to the Work and/or
--      the manuscript the writer was in. It is not a general MAIA memory and
--      is not read by any other surface.
--
--   3. Role is exactly 'writer' or 'maia' — the distinction between what the
--      member said and what MAIA said is a CHECK constraint, not a convention.
--      Build Charter §8: member declaration stays distinguishable from MAIA
--      observation.
--
--   4. Nothing derived is stored. No summary, no inferred theme, no stage, no
--      score. If a later slice wants MAIA's observations to become memory,
--      that is a member declaration and a different table.
--
--   5. Deletable by the member. ON DELETE CASCADE from living_works and from
--      member_manuscripts means removing the Work or the manuscript removes
--      the room's conversation with it — the conversation cannot outlive the
--      thing it was about.
--
-- SANCTUARY: this table holds conversation content, so a Sanctuary session
-- must not write here. The route enforces that; see the companion route.
--
-- ROLLBACK: DROP TABLE IF EXISTS studio_companion_turns;

CREATE TABLE IF NOT EXISTS studio_companion_turns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- The room. At least one must be present (a room is a Work, a manuscript,
  -- or both); a turn belonging to neither has no room to be read back into.
  living_work_id  UUID REFERENCES living_works(id) ON DELETE CASCADE,
  manuscript_id   UUID,

  role            TEXT NOT NULL CHECK (role IN ('writer', 'maia')),
  content         TEXT NOT NULL,

  -- The room state at the moment of the turn, for honest replay. A fact about
  -- the room (what existed), never a judgement about the writer.
  room_state      TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT studio_companion_turns_has_room
    CHECK (living_work_id IS NOT NULL OR manuscript_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS studio_companion_turns_room_idx
  ON studio_companion_turns (member_id, living_work_id, manuscript_id, created_at);
