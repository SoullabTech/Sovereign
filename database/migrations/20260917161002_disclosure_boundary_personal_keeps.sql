-- MAIA-MAVEN-T1A · J5-2 · boundary vocabulary widening. ONE VALUE ONLY.
-- Names the Personal Keeps READ path into MAIA cognition. No route is wired here.
BEGIN;

ALTER TABLE context_disclosure_receipts
  DROP CONSTRAINT IF EXISTS context_disclosure_receipts_boundary_check;

ALTER TABLE context_disclosure_receipts
  ADD CONSTRAINT context_disclosure_receipts_boundary_check
  CHECK (boundary IN (
    'writers_studio.focus->maia_cognition',
    'writers_studio.developmental_ask->maia_cognition',
    'maia.personal_keeps_read->maia_cognition'
  ));

COMMENT ON COLUMN context_disclosure_receipts.boundary IS
'The exact governed boundary the context crossed: Writer Focus, Writer developmental Ask, or explicit Personal Keeps READ into MAIA cognition. Nearby paths are never interchangeable.';

COMMIT;
