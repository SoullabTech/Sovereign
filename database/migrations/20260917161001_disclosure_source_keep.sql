-- MAIA-MAVEN-T1A · J5-2 · source-class vocabulary widening. ONE VALUE ONLY.
-- Admits Personal Keep as a possible disclosed source class. No crossing is wired here.
BEGIN;

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_source_class_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_source_class_check
  CHECK (source_class IN ('work', 'keep'));

COMMENT ON COLUMN context_disclosure_receipts.source_class IS
'What kind of governed context crossed. Admitted: work and keep. Availability alone never authorizes participation; a Keep still requires a separately governed member-invoked crossing.';

COMMIT;
