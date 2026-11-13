-- Writer's Studio — the one complimentary whole-book editorial pass for a Free writer (step C2). Built dark.
--
-- Founder rulings 2026-11-13 (docs/programme/WRITERS-STUDIO_FREE_STUDIO_STEP_C_DESIGN_2026-11-13.md §5):
--   "the taste is one complimentary whole-book editorial pass per Free writer", on a Work of their choosing; the
--   letter is theirs forever; no timer; nothing taken away afterwards; former beta testers do not receive another.
-- Read only while WS_PRO_TASTE_ENABLED = 'true'.
--
-- One row per member. The taste is claimed for one manuscript when a pass starts; it is given back (returned_at) if
-- that pass fails, stops or is cancelled, and spent (completed_at) when the letter is kept. The letter itself lives
-- with the writer's other writing and is never removed by this table. No content: ids and timestamps only.
-- Erasing a member removes their row with them (R20).
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS writers_studio_pro_tastes (
  member_id     UUID        PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  manuscript_id UUID        NOT NULL,
  claimed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  returned_at   TIMESTAMPTZ,
  CONSTRAINT writers_studio_pro_taste_one_outcome CHECK (NOT (completed_at IS NOT NULL AND returned_at IS NOT NULL))
);

COMMENT ON TABLE writers_studio_pro_tastes IS
  'Writer''s Studio: one complimentary whole-book editorial pass per Free writer (founder ruling 2026-11-13). Read only when WS_PRO_TASTE_ENABLED=true.';

COMMIT;
