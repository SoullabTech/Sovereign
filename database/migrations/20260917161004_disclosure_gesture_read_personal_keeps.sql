-- MAIA-MAVEN-T1A · J5-2 · gesture vocabulary widening. ONE VALUE ONLY.
-- Names the explicit member act authorizing one response-scoped Personal Keeps READ.
BEGIN;

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_gesture_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_gesture_check
  CHECK (gesture IN (
    'ask_maia',
    'work_with_this',
    'widen_focus',
    'authorize_sections',
    'read_personal_keeps'
  ));

COMMENT ON COLUMN context_disclosure_receipts.gesture IS
'The member act that caused the crossing. read_personal_keeps means an explicit, response-scoped request to inspect qualifying Personal Keeps; it is not standing permission or ambient recall authority.';

COMMIT;
