-- ROLLBACK for 20260917160000_ain_knowledge_provenance.sql
--
-- CORPUS-BUILD-EA-01 adds provenance columns plus a new-row mint gate.
-- If application code must roll back before/after schema deployment, remove
-- only the gate that would reject a legacy writer lacking provenance fields.
--
-- Provenance columns, checksum-shape constraint, and indexes are deliberately
-- retained: rollback must never erase already-recorded custody evidence.

BEGIN;

ALTER TABLE ain_knowledge_chunks
  DROP CONSTRAINT IF EXISTS ain_knowledge_new_rows_require_provenance;

COMMIT;

DO $$
BEGIN
  RAISE NOTICE 'AIN new-row provenance gate dropped. Provenance columns/indexes retained intentionally.';
END $$;
