-- WS2-07 prerequisite — THE SECTION↔REVISION RELATION
--
-- CONSTITUTIONAL POSITION (load-bearing):
--
--   - THIS IS THE RULED ALTERNATIVE TO A SECOND PROSE STORE. The BUILD-07A
--     recoverability boundary put three options; a second durable store of
--     manuscript prose (per-section snapshots or per-section history) was
--     REJECTED, and establishing the section↔revision relation was AUTHORIZED
--     in its place, "as a prerequisite that completes the section-addressable
--     write path." This migration is that relation and nothing else.
--
--   - IT CARRIES NO PROSE. section_partition holds section ids and character
--     ranges. Not one character of the member's words is duplicated by it, so
--     the Work continues to exist in exactly ONE custody domain, with one
--     deletion cascade, one retention answer and one Sanctuary boundary. A
--     column here that ever held text would silently re-create the store that
--     was rejected.
--
--   - OFFSETS ARE ONLY MEANINGFUL BECAUSE THE TARGET IS IMMUTABLE.
--     working_draft_revisions is append-only: a row is never rewritten, so a
--     range into its content names the same characters forever. The identical
--     ranges against manuscript_working_drafts.content would rot on the next
--     keystroke. ⛔ This shape must never be carried over to live draft text.
--
--   - IT ANSWERS A QUESTION THAT WAS PREVIOUSLY UNANSWERABLE. Before this,
--     "what did section X contain at revision N" could only be approached by
--     re-partitioning the older content — which produces boundaries with NO id
--     continuity to the sections that exist now. Re-partitioning was rejected
--     for exactly that reason. With the partition frozen at write time, the
--     answer is recovered rather than inferred.
--
--   - NULL IS AN HONEST ANSWER, NOT A DEFAULT TO FILL IN. NULL means this
--     revision was written before its draft became section-addressable, so its
--     boundaries were never observed. ⛔ No backfill may invent them. Restore
--     refuses on a NULL partition rather than guessing.
--
-- Authority: docs/programme/WS2-07-BUILD-07A_RECOVERABILITY_BOUNDARY_2026-09-02.md §4
--            (ruling: option 2 AUTHORIZED, option 1 REJECTED, mechanism (d))

BEGIN;

ALTER TABLE working_draft_revisions
  ADD COLUMN IF NOT EXISTS section_partition jsonb;

COMMENT ON COLUMN working_draft_revisions.section_partition IS
  'Section ids and character ranges covering this revision''s content: [{"sectionId":uuid,"start":int,"end":int}]. Ids and offsets only — never prose. NULL means the revision predates section-addressability and its boundaries were never observed; it is never backfilled.';

-- ── The partition must describe THIS revision's content, exactly ───────────
--
-- Checked at write time rather than trusted, because a partition that is out
-- by one character restores prose the member never wrote at a boundary they
-- never drew — and the error is invisible until the day they use it.
--
-- Contiguity, zero-basing and full coverage are all checked. The comparison is
-- on character length, matching the offsets, which are UTF-16 code units on the
-- writing side; ⛔ do not "fix" this to octet_length, which would silently
-- disagree with every offset the application computes.
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

  expected := length(NEW.content);

  -- Contiguous and zero-based: every range starts where the previous one ended.
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
      'revision % of draft %: section_partition covers % of % characters',
      NEW.revision_number, NEW.draft_id, covered, expected;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS working_draft_revision_partition_valid ON working_draft_revisions;
CREATE TRIGGER working_draft_revision_partition_valid
  BEFORE INSERT OR UPDATE OF section_partition ON working_draft_revisions
  FOR EACH ROW EXECUTE FUNCTION working_draft_revision_partition_check();

COMMIT;

-- ROLLBACK (manual):
--   DROP TRIGGER IF EXISTS working_draft_revision_partition_valid ON working_draft_revisions;
--   DROP FUNCTION IF EXISTS working_draft_revision_partition_check();
--   ALTER TABLE working_draft_revisions DROP COLUMN IF EXISTS section_partition;
