-- Manuscript — allow an expression to begin before it is named.
--
-- WHY. `title TEXT NOT NULL` made "Start writing" impossible without inventing
-- something. The only ways to satisfy it were all forbidden: borrow the Living
-- Work's name, generate "Untitled", or demand a title before the writer has
-- written a word. Each substitutes a system act for a member act.
--
-- The distinction being protected (founder ruling, 2026-08-02):
--
--   Living Work name  answers  "what am I in relationship with?"
--   Manuscript title  answers  "what is this expression called?"
--
-- These are SEPARATE declarations and must not be collapsed. A member may be in
-- clear relationship with a named work and have no idea yet what this
-- particular expression of it is called — or whether it is one expression or
-- three. Requiring the title at creation forces the second declaration out of
-- the first, which is a naming the member did not perform.
--
-- This mirrors 20260801000002_living_work_title_optional.sql exactly, for the
-- same reason and under the same ledger entry D-16: "Identity and recognition
-- are different moments. Never invented, never demanded early."
--
-- WHAT THIS DOES NOT DO. It adds no status, draft flag, or "untitled" state.
-- NULL is not a state to be managed — it is the absence of an act that has not
-- happened yet. Rows already written keep their titles. Nothing here creates a
-- manuscript, attaches one to a work, or writes living_work_expressions.
--
-- The CHECK lands in the same migration so the column cannot slide from "not
-- yet named" into "named with nothing". A title, once given, must be real.
--
-- ROLLBACK (only safe while every row still has a title):
--   ALTER TABLE member_manuscripts ALTER COLUMN title SET NOT NULL;
--   ALTER TABLE member_manuscripts DROP CONSTRAINT member_manuscripts_title_not_blank;

-- TWO THINGS FOUND WHILE WRITING THIS, both recorded rather than done quietly:
--
-- 1. `member_manuscripts_title_check` already exists as
--       CHECK (length(trim(title)) > 0)
--    which permits NULL only because a CHECK evaluating to NULL passes. That is
--    the exact footgun caught pre-production in #861. It works, but it states
--    the rule by accident. Replaced below with the explicit `title IS NULL OR`
--    form so the intent is readable rather than inferred.
--
-- 2. `member_manuscripts_provenance_check` pins provenance to the single value
--    'member_uploaded'. A blank page was not uploaded. The two honest options
--    were to widen the constraint or to write a falsehood into the column whose
--    entire purpose is stating where the text came from. Widened. This is an
--    EXTENSION BEYOND the founder ruling of 2026-08-02, which covered `title`
--    only; flagged in the PR rather than folded in silently. The column has no
--    readers in application code today, so the blast radius is the constraint
--    itself.

ALTER TABLE member_manuscripts
  ALTER COLUMN title DROP NOT NULL;

ALTER TABLE member_manuscripts
  DROP CONSTRAINT IF EXISTS member_manuscripts_title_check;

ALTER TABLE member_manuscripts
  ADD CONSTRAINT member_manuscripts_title_not_blank
  CHECK (title IS NULL OR length(trim(title)) > 0);

ALTER TABLE member_manuscripts
  DROP CONSTRAINT IF EXISTS member_manuscripts_provenance_check;

ALTER TABLE member_manuscripts
  ADD CONSTRAINT member_manuscripts_provenance_check
  CHECK (provenance IN ('member_uploaded', 'member_written'));

COMMENT ON COLUMN member_manuscripts.provenance IS
  'Where the text came from. ''member_uploaded'' = brought in from a file and kept as immutable Source. ''member_written'' = begun blank in the Studio, so there is no Source and no manuscript_sections rows. Never inferred; set once at creation by the gesture the member actually performed.';

COMMENT ON COLUMN member_manuscripts.title IS
  'The member''s own words, and OPTIONAL. Never generated, never inferred, never borrowed from the Living Work. NULL means this expression exists but has not yet been named — a legitimate state, not an incomplete record. The work''s name and the expression''s title are separate declarations (ledger D-16).';
