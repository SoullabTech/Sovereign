-- R20 unclaimed Writer Source-arrival anti-resurrection.
--
-- Reuses the table-generic r20_refuse_writer_tombstoned() function admitted by
-- 20261021000001_writer_r20_restore_refusal.sql. A deleted arrival UUID may not
-- be reused by ordinary application traffic. Governed replacement restore may
-- stage the historical row only for the immediate independent-ledger sweep.
BEGIN;

DROP TRIGGER IF EXISTS r20_refuse_writer_tombstoned
  ON manuscript_source_arrivals;

CREATE TRIGGER r20_refuse_writer_tombstoned
  BEFORE INSERT ON manuscript_source_arrivals
  FOR EACH ROW EXECUTE FUNCTION r20_refuse_writer_tombstoned();

COMMENT ON TRIGGER r20_refuse_writer_tombstoned
  ON manuscript_source_arrivals IS
  'R20: refuses ordinary resurrection/reuse of a tombstoned Writer Source-arrival UUID.';

COMMIT;
