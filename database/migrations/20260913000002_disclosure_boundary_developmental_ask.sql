-- S3 · M2 — boundary vocabulary widening. ONE VALUE. NOTHING ELSE.
--
-- Authority: founder ruling 2026-09-13 — "add exactly one boundary value
-- representing the developmental Ask crossing; no accompanying vocabulary
-- redesign, no widening to passage, no storage changes hidden inside it."
--
-- WHY A NEW VALUE RATHER THAN REUSE. `writers_studio.focus->maia_cognition`
-- denotes the Focus crossing. S3 crosses on the developmental Ask path, which
-- Focus never reaches. ⛔ Reusing that value because its OTHER dimensions happen
-- to fit would falsify provenance: the receipt would name a boundary the
-- disclosure did not cross. A convenient nearby boundary is not evidence that it
-- is the same boundary.
--
-- ⛔ WHAT THIS MIGRATION DELIBERATELY DOES NOT DO. Everything else the S3 receipt
-- needs is ALREADY admitted and is left byte-identical:
--     source_class          'work'
--     participation_basis   'member_invoked'
--     scope_kind            'section'
--     section_ref           singular, section scope only
--     authorized_by         'member'
--
-- ⚠️⚠️ AND ONE THING IS STILL OWED, NAMED HERE RATHER THAN QUIETLY ADDED.
-- `gesture` admits only ('ask_maia','work_with_this','widen_focus'). The S3 act
-- is the member authorizing named sections, which is none of those. So a
-- gesture value is owed before any real S3 receipt can mint — and adding it here
-- would be exactly the "accompanying vocabulary redesign" this change was
-- separated in order to avoid. ⛔ It is a separate governed act.
--   Consequence, stated plainly: M2 alone is NOT sufficient for a live crossing.
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
    'writers_studio.developmental_ask->maia_cognition'
  ));

COMMENT ON COLUMN context_disclosure_receipts.boundary IS
'The defined boundary the context crossed. Two values: the Focus crossing, and the developmental Ask crossing added by S3. Each value names a distinct path into cognition; a receipt must name the boundary its disclosure actually crossed, never a nearby one whose other dimensions happen to fit.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260913000002: disclosure boundary widened by exactly one value';
END $$;

-- ROLLBACK (manual) — safe only while no row uses the new value:
--   ALTER TABLE context_disclosure_receipts
--     DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;
--   ALTER TABLE context_disclosure_receipts
--     ADD CONSTRAINT context_disclosure_receipts_boundary_check
--     CHECK (boundary IN ('writers_studio.focus->maia_cognition'));
