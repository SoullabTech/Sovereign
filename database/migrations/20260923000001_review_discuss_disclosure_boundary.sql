-- FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-2
-- One new Review Discuss disclosure boundary and one member gesture.
-- source_class remains work: the crossed historical prose is member-authored Work.

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_boundary_check
  CHECK (boundary IN (
    'writers_studio.focus->maia_cognition',
    'writers_studio.developmental_ask->maia_cognition',
    'writers_studio.review_discuss->maia_cognition'
  ));

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_gesture_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_gesture_check
  CHECK (gesture IN (
    'ask_maia',
    'work_with_this',
    'widen_focus',
    'authorize_sections',
    'discuss_finding'
  ));

COMMENT ON COLUMN context_disclosure_receipts.boundary IS
'The governed cognition boundary crossed by member-authored context. writers_studio.review_discuss->maia_cognition is historical Work text disclosed for one AS_READ Review Discuss act.';

COMMENT ON COLUMN context_disclosure_receipts.gesture IS
'The member act that caused this crossing. discuss_finding means the writer explicitly asked MAIA to discuss one exact reading-local finding; it is not standing permission, reread authority, or current-text authority.';
