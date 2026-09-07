-- WRITER'S STUDIO — GOALS · the support grant (FR-13, additive)
--
-- Authority: docs/programme/
--   WRITERS-STUDIO-CAPABILITY-COMPLETION-01_FR-13_GOAL_SUPPORT_2026-09-07.md
--
--     Encouragement is invited. Pressure is imposed.
--
-- Goals should not become sterile merely to avoid becoming coercive. It exists
-- to help a writer hold an intention, see truthful progress where measurable,
-- AND receive encouragement or inspiration WHEN THEY CHOOSE IT.
--
-- WHY THIS IS A COLUMN AND NOT A GUIDELINE. The founder's words: *"if chosen"
-- needs to be structural, not just a nice tone instruction.* A grant that lives
-- only in a prompt or a doc is one refactor from being assumed — and the
-- refactor never looks like a decision to start coaching someone, it looks like
-- passing an extra field into a prompt. Written here, the question "did the
-- writer ask for this?" has an answer that a code path must go and read.
--
--   track_only   the default, and a real choice rather than an absence.
--                "Just show me 2,140 / 3,000. Don't coach me."
--   encourage    "Help me stay connected to why I'm writing this."
--   work_with    "I'm stuck. Inspire me."
--
-- The same writer may want different ones on different days, and about
-- different goals. The grant therefore lives on the GOAL, not on the member: a
-- person can want company with the book and silence about the essay.
--
-- DEFAULT IS THE QUIET ONE, and that is not timidity — an unasked-for
-- encouragement is the first move of a supervisor. FR-10 is untouched: even
-- when support is invited, no figure may be derived from the clock. MAIA may
-- say "that's a lot of movement"; she may never say "you need 215 words a day".
--
-- THIS MIGRATION COMMISSIONS NOTHING. No MAIA path to Goals exists, and adding
-- the grant does not open one. It exists so that the path, when it is designed,
-- CANNOT be built without consulting it.

BEGIN;

ALTER TABLE writer_goals
  ADD COLUMN IF NOT EXISTS support text NOT NULL DEFAULT 'track_only';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'writer_goals_support_check'
  ) THEN
    ALTER TABLE writer_goals
      ADD CONSTRAINT writer_goals_support_check
      CHECK (support IN ('track_only', 'encourage', 'work_with'));
  END IF;
END $$;

COMMIT;
