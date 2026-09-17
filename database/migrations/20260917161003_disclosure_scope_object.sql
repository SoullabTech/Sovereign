-- MAIA-MAVEN-T1A · J5-2 · scope vocabulary widening. ONE VALUE ONLY.
-- Adds object scope for singular Personal Keep receipts. No selection or crossing is wired here.
BEGIN;

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_scope_kind_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_scope_kind_check
  CHECK (scope_kind IN ('whole_work', 'section', 'passage', 'object'));

COMMENT ON COLUMN context_disclosure_receipts.scope_kind IS
'The shape of the disclosed selection, never its content or location: whole_work, section, passage, or one governed object. section_ref remains valid only for section scope.';

COMMIT;
