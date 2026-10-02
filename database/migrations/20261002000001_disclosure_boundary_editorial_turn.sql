-- Editorial turn crossing: one boundary value, and the full vocabulary stated once.
--
-- Founder ruling 2026-09-21: external editorial processing requires authorization
-- BEFORE dispatch and a durable record naming destination and disclosed context.
-- Boundary ruled `writers_studio.editorial_turn->maia_cognition`; gesture
-- `work_with_this` already exists and is NOT widened here.
--
-- ⚠️ WHY THIS IS NOT DATED 20260921. The first cut of this migration (20260921000001,
-- never merged, never deployed) re-created the CHECK from a list of three. Canonical
-- then widened the same CHECK for review_discuss (20260923000001), and a migration
-- that re-states the whole list DROPS whatever it does not name. Applied after that
-- one, a three-value list would silently remove review_discuss; applied out of order
-- against a database that already carries review_discuss rows, it would fail the
-- ADD CONSTRAINT and halt the sequence under ON_ERROR_STOP.
--
-- ⭐ So the list below is the UNION of every constituted boundary, and the migration
-- is dated after all of them. Idempotent: DROP IF EXISTS then ADD. The TypeScript
-- `DisclosureBoundary` union is the SECOND enforcement of this vocabulary and must
-- carry exactly these four values.
--
-- ⛔ Receipts are not rewritten, not backfilled, not deleted. Existing rows already
-- satisfy a superset of their previous vocabulary.

BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_boundary_check
  CHECK (boundary IN (
    'writers_studio.focus->maia_cognition',
    'writers_studio.developmental_ask->maia_cognition',
    'writers_studio.review_discuss->maia_cognition',
    'writers_studio.editorial_turn->maia_cognition'
  ));

COMMENT ON COLUMN context_disclosure_receipts.boundary IS
'The governed cognition boundary crossed by member-authored context. Four values, each a distinct path into cognition: the Focus crossing; the developmental Ask crossing; the Review Discuss crossing (historical Work text for one AS_READ act); and the editorial turn crossing (the writer asking MAIA to work on a named passage, which sends authored prose to an external provider). A receipt must name the boundary its disclosure actually crossed, never a nearby one whose other dimensions happen to fit.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20261002000001: disclosure boundary vocabulary now focus + developmental_ask + review_discuss + editorial_turn';
END $$;
