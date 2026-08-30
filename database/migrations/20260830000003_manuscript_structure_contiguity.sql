-- WS2-05A correction — sibling ordering and contiguity, enforced by the database.
--
-- Two invariants that 20260830000002 left to the service alone. Both are now
-- structural, for the same reason 04A's round trip is: an invariant that lives
-- only in application code is one that a second client, a later refactor, or a
-- direct SQL write can quietly break.
--
--   1 · SIBLING ORDER. The first migration deliberately skipped
--       UNIQUE (parent_id, position) because top-level units have a NULL
--       parent and UNIQUE treats NULLs as distinct — the constraint would have
--       silently failed to cover exactly the rows a reader assumes it covers.
--       PostgreSQL 15 added NULLS NOT DISTINCT, which is the semantics this
--       actually needs, so the constraint can now be real. DEFERRABLE because
--       renumbering a sibling list passes through transient duplicates.
--
--       This closes a race the service could not: two tabs can read the same
--       sibling order and both write into the same position. The UI's `busy`
--       flag serialises one React instance and cannot see another client. The
--       service now also takes a row lock on the owning member_manuscripts row
--       before reading and renumbering; the constraint is what makes that
--       correct rather than merely likely.
--
--   2 · CONTIGUITY. A manuscript division is a CONTIGUOUS part of the Work.
--       The first cut permitted a unit to become two disjoint stretches and
--       merely reported it — which quietly admitted a different thing (a
--       thematic grouping) into the relation reserved for structural division.
--       A non-contiguous grouping may be worth having one day; it is not this,
--       and it must not arrive by omission.
--
--       Enforced over DERIVED membership: a unit's own placements plus every
--       descendant's. So a Part whose chapters leave a gap is refused, not only
--       a chapter with a gap of its own.
--
--       Deferred, so a legitimate reorganisation may pass through invalid
--       intermediate states inside one transaction and be judged on what it
--       commits.
--
-- Additive: no existing row is read, moved or rewritten. Both constraints are
-- satisfied by every row 20260830000002 can have produced, because nothing has
-- authored structure on any manuscript yet.
--
-- Authority: docs/design/writer-studio/WS2-05_MANUSCRIPT_STRUCTURE_AUTHORITY.md

BEGIN;

DO $$
BEGIN
  IF current_setting('server_version_num')::int < 150000 THEN
    RAISE EXCEPTION
      'NULLS NOT DISTINCT requires PostgreSQL 15 or later; this server is %',
      current_setting('server_version');
  END IF;
END $$;

ALTER TABLE manuscript_structure_units
  ADD CONSTRAINT manuscript_structure_units_sibling_order
  UNIQUE NULLS NOT DISTINCT (manuscript_id, parent_id, position)
  DEFERRABLE INITIALLY DEFERRED;

-- ── Contiguity ────────────────────────────────────────────────────────────
--
-- A unit's derived positions must be an unbroken run: max - min + 1 = count.
-- UNIQUE (draft_section_id) already forbids a section appearing twice, so the
-- count needs no DISTINCT to be trustworthy.
CREATE OR REPLACE FUNCTION manuscript_structure_contiguity()
RETURNS TRIGGER AS $$
DECLARE
  target_manuscript uuid;
  unit_key uuid;
  bad record;
BEGIN
  IF TG_TABLE_NAME = 'manuscript_structure_members' THEN
    unit_key := CASE WHEN TG_OP = 'DELETE' THEN OLD.unit_id ELSE NEW.unit_id END;
    SELECT su.manuscript_id INTO target_manuscript
      FROM manuscript_structure_units su WHERE su.id = unit_key;
  ELSE
    target_manuscript := CASE WHEN TG_OP = 'DELETE'
      THEN OLD.manuscript_id ELSE NEW.manuscript_id END;
  END IF;

  /* The unit was deleted later in the same transaction. Nothing to judge from
     this row; the rows that survive are judged by their own firings. */
  IF target_manuscript IS NULL THEN RETURN NULL; END IF;

  SELECT * INTO bad FROM (
    WITH RECURSIVE descend AS (
      SELECT id AS root, id AS node
        FROM manuscript_structure_units
       WHERE manuscript_id = target_manuscript
      UNION ALL
      SELECT d.root, u.id
        FROM descend d
        JOIN manuscript_structure_units u ON u.parent_id = d.node
    ),
    derived AS (
      SELECT d.root, ds.position
        FROM descend d
        JOIN manuscript_structure_members m ON m.unit_id = d.node
        JOIN manuscript_draft_sections ds ON ds.id = m.draft_section_id
    )
    SELECT root, count(*) AS n, min(position) AS lo, max(position) AS hi
      FROM derived
     GROUP BY root
    HAVING max(position) - min(position) + 1 <> count(*)
     LIMIT 1
  ) x;

  IF FOUND THEN
    RAISE EXCEPTION
      'structural unit % is not a contiguous part of the Work: % sections spanning positions %..%',
      bad.root, bad.n, bad.lo, bad.hi;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS manuscript_structure_members_contiguity
  ON manuscript_structure_members;
CREATE CONSTRAINT TRIGGER manuscript_structure_members_contiguity
  AFTER INSERT OR UPDATE OR DELETE ON manuscript_structure_members
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION manuscript_structure_contiguity();

-- Reparenting changes which sections a unit derives without touching a single
-- membership row, so the unit table needs the same check.
DROP TRIGGER IF EXISTS manuscript_structure_units_contiguity
  ON manuscript_structure_units;
CREATE CONSTRAINT TRIGGER manuscript_structure_units_contiguity
  AFTER INSERT OR UPDATE OR DELETE ON manuscript_structure_units
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION manuscript_structure_contiguity();

COMMIT;

-- ROLLBACK (manual):
--   DROP TRIGGER IF EXISTS manuscript_structure_units_contiguity ON manuscript_structure_units;
--   DROP TRIGGER IF EXISTS manuscript_structure_members_contiguity ON manuscript_structure_members;
--   DROP FUNCTION IF EXISTS manuscript_structure_contiguity();
--   ALTER TABLE manuscript_structure_units DROP CONSTRAINT manuscript_structure_units_sibling_order;
