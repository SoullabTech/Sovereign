-- WS2-07 — SECTION-PARTITION UNICODE REPAIR (semantic correction, forward)
--
-- WHAT WAS WRONG. Migration 20260902000002 introduced
-- working_draft_revisions.section_partition and documented its offsets as
-- "UTF-16 code units". They are not, and could never have been: the validation
-- trigger it installed compares total coverage against length(NEW.content), and
-- PostgreSQL's length(text) counts UNICODE CODE POINTS.
--
-- The application believed the documentation. It built ranges with JavaScript's
-- String.prototype.length, which counts UTF-16 code units. The two agree on
-- every character in the Basic Multilingual Plane and disagree on every astral
-- one:
--
--     'A😀B'     JavaScript .length = 4      PostgreSQL length() = 3
--
-- So a partition could be perfectly self-consistent inside the application and
-- REJECTED here — and not only in some future reader: a new draft's revision 1
-- already records a partition, so an author writing an emoji had ordinary draft
-- creation fail. Reproduced before this repair: 'A😀B' → "section_partition
-- covers 12 of 11 characters".
--
-- WHY THE CODE MOVED AND NOT THE TRIGGER. Two units met at this boundary and one
-- had to win. PostgreSQL was already enforcing code points, and code points are
-- the unit that means the same thing on both sides of the wire — UTF-16 is an
-- encoding detail of one runtime. Changing the trigger to count code units would
-- have meant reproducing JavaScript's surrogate arithmetic in plpgsql to keep a
-- claim nobody needed. So the application now counts code points, and this
-- migration corrects the RECORD to say what the trigger always enforced.
--
-- ⛔ NO DATA IS TOUCHED, AND NONE NEEDS TO BE. Any existing non-NULL partition
-- necessarily passed the trigger, so its total already equalled the content's
-- code-point length — meaning its content contained no astral character and the
-- two units coincided. There is no partition to rewrite, nothing to backfill,
-- and no prose to re-derive. A partition that WOULD have differed was never
-- storable in the first place.
--
-- ⛔ 20260902000002 IS NOT REWRITTEN. It is canonical and already applied; its
-- comment is corrected forward here rather than edited in place, so the history
-- shows what was believed, when, and what corrected it.
--
-- Authority: founder ruling 2026-09-02 — "WS2-07 SECTION-PARTITION UNICODE
--            REPAIR · not a new Jarvis lane · not new architecture · not a
--            second prose store"

BEGIN;

COMMENT ON COLUMN working_draft_revisions.section_partition IS
  'Section ids and character ranges covering this revision''s content: [{"sectionId":uuid,"start":int,"end":int}]. Offsets are UNICODE CODE POINTS — the unit PostgreSQL''s length(text) counts and this table''s trigger enforces — NOT UTF-16 code units; the two differ on astral characters such as emoji. Ids and offsets only, never prose. NULL means the revision predates section-addressability and its boundaries were never observed; it is never backfilled.';

-- The function is replaced only to correct its inline record of the unit. The
-- checks are byte-for-byte the ones 20260902000002 installed: contiguity from
-- offset 0, and total coverage equal to length(content). Behaviour is
-- deliberately unchanged — it was the documentation, not the enforcement, that
-- was wrong.
CREATE OR REPLACE FUNCTION working_draft_revision_partition_check()
RETURNS TRIGGER AS $$
DECLARE
  expected int;
  covered int;
  contiguous boolean;
BEGIN
  IF NEW.section_partition IS NULL THEN
    RETURN NEW;
  END IF;

  IF jsonb_typeof(NEW.section_partition) <> 'array'
     OR jsonb_array_length(NEW.section_partition) = 0 THEN
    RAISE EXCEPTION
      'revision % of draft %: section_partition must be a non-empty array (use NULL when boundaries were never observed)',
      NEW.revision_number, NEW.draft_id;
  END IF;

  -- length() counts Unicode CODE POINTS, and that is the unit the offsets are
  -- expressed in. ⛔ Do not "fix" this to octet_length: bytes are a third unit
  -- again, and every offset the application computes would silently disagree.
  -- ⛔ Do not try to make this count UTF-16 code units to match a JavaScript
  -- String.length either — that was the 20260902000002 documentation error, and
  -- it would mean reproducing surrogate arithmetic here to serve one runtime's
  -- encoding.
  expected := length(NEW.content);

  SELECT bool_and(
           (r->>'start')::int = COALESCE(prev_end, 0)
           AND (r->>'end')::int >= (r->>'start')::int
         ),
         max((r->>'end')::int)
    INTO contiguous, covered
    FROM (
      SELECT r,
             lag((r->>'end')::int) OVER (ORDER BY ord) AS prev_end
        FROM jsonb_array_elements(NEW.section_partition) WITH ORDINALITY AS t(r, ord)
    ) ranges;

  IF NOT contiguous THEN
    RAISE EXCEPTION
      'revision % of draft %: section_partition is not contiguous from offset 0',
      NEW.revision_number, NEW.draft_id;
  END IF;

  IF covered IS DISTINCT FROM expected THEN
    RAISE EXCEPTION
      'revision % of draft %: section_partition covers % of % code points',
      NEW.revision_number, NEW.draft_id, covered, expected;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- ROLLBACK (manual): this migration changes no data and no behaviour — it
-- corrects a comment and the wording of one error message. Reverting it means
-- re-applying 20260902000002's version of the function and comment, which
-- restores the inaccurate documentation and nothing else. The APPLICATION-side
-- repair is what matters; reverting that without reverting this leaves the two
-- sides disagreeing again on astral text.
