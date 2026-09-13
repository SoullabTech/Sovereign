-- S3 · gesture vocabulary widening. ONE VALUE. NOTHING ELSE.
--
-- Authority: founder ruling 2026-09-13 — the naming decision the M2 record left
-- open, closed as `authorize_sections`, and deliberately NOT folded back into M2
-- retrospectively.
--
-- DEFINITION:
--   The member explicitly authorized MAIA to read the named section set for this
--   single developmental Ask.
--
-- ⛔ IT IS NOT: consent · standing permission · passage authority · generic MAIA
-- access. One gesture may yield N section-scoped receipts, and each receipt
-- truthfully carries the same `authorize_sections` gesture — the gesture names
-- the member's act, not the count of boundaries it caused.
--
-- ⛔⛔ CANDIDATE ON A NON-CANONICAL BRANCH. Merging is latent schema-deploy
-- authorization (2026-09-07 finding).

BEGIN;

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_gesture_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_gesture_check
  CHECK (gesture IN (
    'ask_maia',
    'work_with_this',
    'widen_focus',
    'authorize_sections'
  ));

COMMENT ON COLUMN context_disclosure_receipts.gesture IS
'The member act that caused this crossing. authorize_sections means the member explicitly authorized MAIA to read the named section set for one developmental Ask — never consent, standing permission, passage authority or generic access. One such gesture may yield several section-scoped receipts, each carrying it truthfully.';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260913000003: disclosure gesture widened by exactly one value';
END $$;

-- ROLLBACK (manual) — safe only while no row uses the new value:
--   ALTER TABLE context_disclosure_receipts
--     DROP CONSTRAINT IF EXISTS context_disclosure_receipts_gesture_check;
--   ALTER TABLE context_disclosure_receipts
--     ADD CONSTRAINT context_disclosure_receipts_gesture_check
--     CHECK (gesture IN ('ask_maia','work_with_this','widen_focus'));
