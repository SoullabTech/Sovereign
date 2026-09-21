-- EDITORIAL DISCLOSURE · boundary vocabulary widening. ONE VALUE. NOTHING ELSE.
--
-- Authority: founder ruling 2026-09-21 — external editorial processing requires
-- authorization before dispatch AND a durable record naming destination and
-- disclosed context. Boundary ruled `writers_studio.editorial_turn->maia_cognition`.
-- Specification: docs/programme/EDITORIAL_DISCLOSURE_REPAIR_SPEC_2026-09-21.md
--
-- WHY A NEW VALUE RATHER THAN REUSE. Following 20260913000002's reasoning
-- exactly. The two admitted values name the Focus crossing and the developmental
-- Ask crossing. The editorial turn is a third path: the writer asks MAIA to work
-- on a named passage at a declared latitude, through
-- `app/api/writers-studio/editorial/turn`, which neither of the others reaches.
-- ⛔ Reusing either because its other dimensions happen to fit would falsify
-- provenance — the receipt would name a boundary the disclosure did not cross.
--
-- ⛔ WHAT THIS MIGRATION DELIBERATELY DOES NOT DO.
--   · No gesture value. `work_with_this` is ruled for this act and is ALREADY
--     admitted (20260913000003). Nothing to add, and nothing is added.
--   · No storage change, no column, no trigger, no index.
--   · ⛔ It does not wire receipt minting into the editorial path. A vocabulary
--     that admits a crossing is not a mechanism that records one, and merging
--     the two is how a migration quietly becomes an implementation.
--
-- ⛔⛔ AND ONE THING OWED, NAMED HERE RATHER THAN QUIETLY WORKED AROUND.
-- The ruling says `crossed` is confirmed from evidence of PROVIDER RECEIPT,
-- independently of whether the response validates. `StructuredOutcome`
-- (lib/ai/structured/types.ts:165) cannot express that: an HTTP 400 and a
-- refused connection both return `provider_unavailable`, differing only in a
-- `detail` string. ⭐ Until that seam reports whether a provider response was
-- observed, a `crossed` confirmation would be a guess — and a receipt that
-- guesses is worse than no receipt. ⛔ Separate governed act.
--
-- ⛔⛔ CANDIDATE ON A NON-CANONICAL BRANCH. Merging to `clean-main-no-secrets`
-- is latent schema-deploy authorization (2026-09-07 finding).

BEGIN;

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_boundary_check
  CHECK (boundary IN (
    'writers_studio.focus->maia_cognition',
    'writers_studio.developmental_ask->maia_cognition',
    'writers_studio.editorial_turn->maia_cognition'
  ));

COMMENT ON COLUMN context_disclosure_receipts.boundary IS
'The defined boundary the context crossed. Three values: the Focus crossing, the developmental Ask crossing, and the editorial turn crossing — the writer asking MAIA to work on a named passage at a declared latitude, which sends authored prose to an external provider. Each value names a distinct path into cognition; a receipt must name the boundary its disclosure actually crossed, never a nearby one whose other dimensions happen to fit.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260921000001: disclosure boundary widened by exactly one value (editorial_turn)';
END $$;

-- ROLLBACK (manual) — safe only while no row uses the new value:
--   ALTER TABLE context_disclosure_receipts
--     DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;
--   ALTER TABLE context_disclosure_receipts
--     ADD CONSTRAINT context_disclosure_receipts_boundary_check
--     CHECK (boundary IN (
--       'writers_studio.focus->maia_cognition',
--       'writers_studio.developmental_ask->maia_cognition'
--     ));
