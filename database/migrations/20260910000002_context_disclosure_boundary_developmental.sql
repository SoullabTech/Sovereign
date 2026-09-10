-- S3 · P1 — admit the developmental Ask's body crossing as its own boundary.
--
--   ⭐ A SECOND BOUNDARY, NOT A SECOND MEANING FOR THE FIRST.
--
-- `context_disclosure_receipts` records WHICH governed seam was crossed. The
-- developmental Ask now establishes section-scoped body-disclosure authority of
-- its own, and recording those crossings as `writers_studio.focus->maia_cognition`
-- would make every receipt describe a crossing that did not happen where it says
-- it did — an auditor could no longer tell the two seams apart, and the Focus
-- witness would be polluted by traffic it never saw.
--
-- The table's own comment already governs this: *"each axis admits only what v1
-- can produce, and widening either is a governed migration."* This is that
-- migration, and it widens ONE axis by ONE value.
--
-- ⛔ NOTHING ELSE CHANGES. No column is added, no constraint is relaxed, no
-- existing row is touched, and the content-free constitution is untouched: this
-- boundary is subject to the same refusal of text, excerpt, summary, embedding,
-- hash, offset, length, geometry and passage-level section_ref.
--
-- ⚠️ UNLIKE `20260910000001_pending_ask_claims.sql`, WHICH IS PURELY ADDITIVE,
-- this alters a CHECK on an existing table that already holds production rows.
-- It only ADMITS a value that was previously refused, so no existing row can
-- become invalid — but it is a change to a governed accountability substrate and
-- is named as such rather than filed as routine.
--
-- Authority: docs/programme/S3-DESIGN-01_SECTION_AUTHORITY_DESIGN_2026-09-10.md

BEGIN;

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_boundary_check
  CHECK (boundary IN (
    'writers_studio.focus->maia_cognition',
    'writers_studio.ask->maia_developmental'
  ));

COMMENT ON COLUMN context_disclosure_receipts.boundary IS
  'Which governed seam was crossed. Closed vocabulary; widening it is a governed migration. writers_studio.focus->maia_cognition is the Focus crossing; writers_studio.ask->maia_developmental is the developmental Ask body crossing (S3/P1), section-scoped and never passage-scoped.';

COMMIT;

-- ROLLBACK (manual):
--   Narrowing the CHECK again will FAIL if any developmental receipt exists —
--   correctly, because those rows are evidence of crossings that occurred. Delete
--   nothing to make the constraint fit; a receipt is not disposable.
--
--   ALTER TABLE context_disclosure_receipts
--     DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;
--   ALTER TABLE context_disclosure_receipts
--     ADD CONSTRAINT context_disclosure_receipts_boundary_check
--     CHECK (boundary IN ('writers_studio.focus->maia_cognition'));
