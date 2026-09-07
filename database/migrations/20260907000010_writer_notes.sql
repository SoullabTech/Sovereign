-- WRITER'S STUDIO — NOTES v1 (member-authored)
--
-- Authority: docs/programme/
--   WRITERS-STUDIO-CAPABILITY-COMPLETION-01_NOTES_DECIDE_2026-09-07.md
--   …_FR-07_NOTES_SCOPE_AMENDMENT_2026-09-07.md   (scope)
--   …_FR-08_ANCHOR_LOSS_2026-09-07.md             (anchor loss)
--
-- WHAT A NOTE IS, AND THE THREE THINGS IT IS NOT
--
--   A Note is the writer's MUTABLE THINKING BESIDE THE WRITING. It belongs
--   beside the manuscript, never inside its content.
--
--   NOT A KEEP.      manuscript_keeps holds verbatim text the writer set aside
--                    — a preserved state OF the writing, re-verified against
--                    the section on write. A Note originates with the writer
--                    and is verified against nothing, because there is nothing
--                    it must match.
--   NOT MATERIAL.    living_work_materials holds what the writer BROUGHT to the
--                    Work, carrying arrival provenance. A Note is not brought;
--                    it is thought.
--   NOT PROSE.       Nothing here reaches the manuscript, the working draft,
--                    or export.
--
-- FR-07 — THE MANUSCRIPT IS THE PRIMARY ANCHOR, AND THAT IS THE POINT.
--
--   The first formulation scoped a Note to the Work. Implementation reality
--   refused it: the Canvas resolves Work context as none | work | ambiguous,
--   and a Work-scoped Note is untakeable in two of the three. That would make
--   thinking contingent on product administration — the writer has something to
--   say and the software demands they first resolve its ontology.
--
--   So manuscript_id is NOT NULL and living_work_id is not. A Note can always
--   be taken; the Work is recorded as CONTEXT when exactly one Work declares
--   the manuscript, and left null when none does or several do. A Work-level
--   view stays derivable; the writer's ability to catch a thought does not
--   depend on it.
--
-- FR-08 — DEMOTE AND KEEP. The load-bearing clause in this file is one word:
--
--       section_id ... ON DELETE SET NULL     -- not CASCADE
--
--   manuscript_keeps cascades on section_id and is right to: a Keep is an
--   excerpt OF that section, and an excerpt of a deleted section is not a
--   thing. A Note is an excerpt of nothing. Deleting a section is an ordinary
--   prose edit; it must never destroy the writer's own thinking as a side
--   effect of rearranging where that thinking was pinned.
--
--   anchor_heading is NOT A SUBSTITUTE FOREIGN KEY. It is the last-known
--   human-readable context of an anchor, written when the anchor is made. While
--   the section exists the surface prefers the live section identity; only after
--   deletion does this column speak, and then as history — "previously attached
--   to …" — never as a live anchor. Nothing may re-attach a Note by matching it,
--   including to a later section that happens to carry the same heading.
--
-- No interpretive column exists here to fill: no kind, no tag, no summary, no
-- sentiment, no salience, no MAIA-authored field. A Note has an author, and the
-- author is the member.

BEGIN;

CREATE TABLE IF NOT EXISTS writer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- RESTRICT, as manuscript_keeps does: a member's own writing is not swept up
  -- by a delete elsewhere.
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- FR-07 primary anchor. The manuscript going away takes its notes with it:
  -- there is no "beside the writing" once the writing is gone.
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,

  -- FR-07 optional context. Null is a correct, common state — no Work declared,
  -- or several (D-018 permits several, and the Studio names none of them).
  living_work_id uuid REFERENCES living_works(id) ON DELETE SET NULL,

  -- FR-08. SET NULL, never CASCADE.
  section_id uuid REFERENCES manuscript_sections(id) ON DELETE SET NULL,

  -- FR-08. Last-known human-readable context; history, not an anchor.
  -- Null while a note was never anchored. Together with section_id it
  -- discriminates three states without a status column:
  --   section_id NOT NULL                        anchored, live
  --   section_id NULL, anchor_heading NOT NULL   was anchored; the section went
  --   section_id NULL, anchor_heading NULL       never anchored
  anchor_heading text,

  body text NOT NULL CHECK (length(trim(body)) > 0),

  created_at timestamptz NOT NULL DEFAULT now(),
  -- "Durable until the member edits or deletes it" — a Note is mutable in
  -- place and has NO version history. Preserved states are what Keeps are for;
  -- a second revision substrate here would blur the boundary FR-02 drew.
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_writer_notes_manuscript
  ON writer_notes (manuscript_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_writer_notes_section
  ON writer_notes (section_id) WHERE section_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_writer_notes_member
  ON writer_notes (member_id);

COMMIT;
