-- R20 Writer anti-resurrection: stable identities may not be reused after a
-- sovereignty deletion. Historical rows may enter only through a governed
-- replacement restore, where the imported independent ledger sweep removes them.
BEGIN;

CREATE OR REPLACE FUNCTION r20_refuse_writer_tombstoned()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  hit_manifest UUID;
  lane TEXT := NULLIF(current_setting('s5.restore_lane', TRUE), '');
BEGIN
  SELECT manifest_id INTO hit_manifest
    FROM public.provenance_tombstones
   WHERE object_kind = TG_TABLE_NAME AND object_id = NEW.id::text
   LIMIT 1;

  IF hit_manifest IS NULL THEN RETURN NEW; END IF;

  IF lane = 'governed' THEN
    RAISE WARNING '[R20] governed restore staged tombstoned Writer row table=% id_prefix=% manifest=%',
      TG_TABLE_NAME, left(NEW.id::text, 12), hit_manifest;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'r20_writer_tombstone_refusal'
    USING ERRCODE = '23514',
          DETAIL = format('table=%s manifest=%s', TG_TABLE_NAME, hit_manifest);
END;
$$;

DROP TRIGGER IF EXISTS r20_refuse_writer_tombstoned ON member_manuscripts;
CREATE TRIGGER r20_refuse_writer_tombstoned
  BEFORE INSERT ON member_manuscripts
  FOR EACH ROW EXECUTE FUNCTION r20_refuse_writer_tombstoned();

DROP TRIGGER IF EXISTS r20_refuse_writer_tombstoned ON living_works;
CREATE TRIGGER r20_refuse_writer_tombstoned
  BEFORE INSERT ON living_works
  FOR EACH ROW EXECUTE FUNCTION r20_refuse_writer_tombstoned();

COMMENT ON FUNCTION r20_refuse_writer_tombstoned() IS
  'R20: hard-refuses ordinary reuse of deleted Writer manuscript/Work UUIDs. Governed replacement restore may stage old rows only for immediate independent-ledger sweep.';

COMMIT;
