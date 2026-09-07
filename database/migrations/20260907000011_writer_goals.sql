-- WRITER'S STUDIO — GOALS v1 (writer-declared)
--
-- Authority: docs/programme/
--   WRITERS-STUDIO-CAPABILITY-COMPLETION-01_GOALS_DECIDE_2026-09-07.md
--   …_FOUNDER_RULINGS_IV_GOALS_2026-09-07.md   (FR-09 … FR-12, Q-D)
--   docs/programmes/writers-studio-v2/DECISIONS.md  D-003
--
-- THE PRODUCT BOUNDARY THIS TABLE EXISTS TO HOLD
--
--     The writer declares the goal.
--     The system may measure progress against it.
--     MAIA may not invent the goal.
--
-- D-003 (founder, 2026-08-27) already authorized the one dangerous act here —
-- "goal progress against a writer-declared target" is showable AS MEASUREMENT.
-- Goals therefore inherits its constitution; this file does not create one. What
-- it must do is make the ways that permission could be abused unrepresentable.
--
-- FR-09 — TWO KINDS, DIVIDED BY WHO CAN TRUTHFULLY OBSERVE PROGRESS.
--
--   MEASURABLE   the writer names a countable quantity and a target. Progress
--                is arithmetic over the writer's own material.
--   INTENTION    a qualitative aim. Only the writer can say how it is going.
--
--   "Finish Chapter 7" is an INTENTION unless the writer defines what
--   completion means. Word count does not become "finished" merely because
--   software can count it.
--
--   THE CHECK BELOW IS THE RULING, NOT A VALIDATION. Modelling this as a
--   nullable target would leave an intention with somewhere to put a number,
--   and the pressure to render SOMETHING beside a goal is constant: six months
--   from now a target would appear on an intention because the column happened
--   to accept it. The biconditional forbids it in both directions — a
--   measurable without a target is as impossible as an intention with one.
--
-- FR-10 — TIME BOUNDS A GOAL; IT MAY NOT JUDGE THE WRITER.
--
--   `by_when` is a date the writer named, stored as a date and displayed as a
--   date. There is deliberately NO started_at, NO pace column, NO projection,
--   NO streak, and no place to keep one. The executable form of the rule:
--
--       NO PROGRESS FIGURE MAY BE A FUNCTION OF THE CLOCK.
--
--   A number compared to the WORK is measurement. The same number compared to
--   the CALENDAR is a verdict about the writer.
--
-- FR-11 — ANCHOR LOSS MAY END MEASUREMENT WITHOUT ENDING THE GOAL.
--
--   Same ontology as writer_notes: manuscript is the primary anchor, the
--   section is optional, the Work is context when unambiguous. Same
--   ON DELETE SET NULL, for the same reason.
--
--   The addition is what it means for a MEASURABLE goal. "3,000 words in The
--   Torus" whose section is deleted has lost its denominator. The goal
--   survives, the historical anchor is kept, and measurement becomes
--   UNAVAILABLE — it is NOT re-scoped to the whole manuscript. Turning
--   "3,000 words in this chapter" into "3,000 words in this book" would be the
--   system rewriting the writer's intention.
--
--   Nothing is stored to express that. It is derived from the row: a goal whose
--   section_id is null while anchor_heading survives was anchored and no longer
--   is. A stored "unmeasurable" flag could disagree with the row.
--
-- PROGRESS IS NEVER STORED. It is counted at read time from material the writer
-- already has. A stored progress figure is a number that can go stale and then
-- be believed.
--
-- MAIA (FR-12) may reflect a goal, report measured progress, and ask about it.
-- She may not create one, alter a target, add a deadline, convert an intention
-- into a metric, or call the writer ahead or behind. There is no column here
-- for her to write to, and no automated path that writes this table.

BEGIN;

CREATE TABLE IF NOT EXISTS writer_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- FR-11 primary anchor: always present, so a goal is declarable in every
  -- Work-context state (the FR-07 lesson, unchanged).
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,

  -- Optional context. Null when no Work declares this manuscript, or several do.
  living_work_id uuid REFERENCES living_works(id) ON DELETE SET NULL,

  -- FR-11. SET NULL, never CASCADE: the goal outlives its location.
  section_id uuid REFERENCES manuscript_sections(id) ON DELETE SET NULL,
  -- Last-known human-readable context. History, not a key; nothing re-anchors
  -- a goal by matching it.
  anchor_heading text,

  kind text NOT NULL CHECK (kind IN ('measurable', 'intention')),

  -- Measurable only. v1 counts what the room already counts and nothing else.
  metric text CHECK (metric IS NULL OR metric IN ('words', 'sections')),
  target integer CHECK (target IS NULL OR target > 0),

  -- FR-09, as a constraint rather than a convention.
  CONSTRAINT writer_goals_kind_shape CHECK (
    (kind = 'measurable') = (metric IS NOT NULL AND target IS NOT NULL)
  ),
  -- "How many sections in this one section" is not a question. A sections
  -- target is a whole-manuscript figure or it is nothing.
  CONSTRAINT writer_goals_sections_metric_is_manuscript_wide CHECK (
    metric IS DISTINCT FROM 'sections' OR section_id IS NULL
  ),

  -- The writer's own words, always — for both kinds. A measurable goal is not
  -- reducible to its number; "3,000 words on the Torus chapter, in one voice"
  -- is what the writer meant, and the number is only the part we can count.
  statement text NOT NULL CHECK (length(trim(statement)) > 0),

  -- FR-10. A date the writer named. Nothing derives a rate from it.
  by_when date,

  -- The writer's own account of where it stands. Never set by the system, and
  -- an intention is never completed automatically (FR-12).
  standing text NOT NULL DEFAULT 'open'
    CHECK (standing IN ('open', 'met', 'set_aside')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_writer_goals_manuscript
  ON writer_goals (manuscript_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_writer_goals_open
  ON writer_goals (manuscript_id) WHERE standing = 'open';

CREATE INDEX IF NOT EXISTS idx_writer_goals_member
  ON writer_goals (member_id);

COMMIT;
