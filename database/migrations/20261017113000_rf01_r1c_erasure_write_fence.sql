-- RF01 R1-C · serialize erased-member protection with late content writes.
-- HELD LOCAL CANDIDATE. No production migration or member data.
--
-- A route-only read of rf01_member_erasure_holds can race with a turn being
-- inserted before a deletion transaction commits. Both the source erasure
-- transaction and every data-bearing insert/update now take the same
-- transaction-scoped per-member advisory lock.
--
-- Linearization: a writer finishing first commits before erasure begins;
-- otherwise erasure establishes the hold before any waiting writer proceeds.
-- An HTTP packet already in transit cannot be recalled; route response
-- rechecks and client invalidation remain necessary independent protections.
BEGIN;

CREATE OR REPLACE FUNCTION rf01_r1c_serialize_content_write()
RETURNS trigger AS $$
DECLARE
  actor TEXT;
  payload JSONB;
BEGIN
  actor := COALESCE(to_jsonb(NEW)->>'member_id',
                    to_jsonb(NEW)->>'user_id');
  IF actor IS NULL OR actor='' THEN
    RETURN NEW;
  END IF;
  payload := to_jsonb(NEW);

  -- A session owner is permanent. Updating a NULL/old owner to a new member
  -- would allow laundering protected lineage through a new identity.
  IF TG_TABLE_NAME = 'maia_sessions' AND TG_OP = 'UPDATE'
     AND to_jsonb(OLD)->>'member_id' IS DISTINCT FROM actor THEN
    RAISE EXCEPTION 'RF01_SESSION_OWNER_IMMUTABLE';
  END IF;

  -- A session's metadata-only update is not a new stored memory.
  IF TG_TABLE_NAME IN ('maia_sessions','member_sessions') THEN
    IF (payload->'summary' IS NULL OR payload->'summary'='null'::jsonb)
       AND (payload->'conversation_history' IS NULL
            OR payload->'conversation_history'='null'::jsonb
            OR payload->'conversation_history'='[]'::jsonb) THEN
      RETURN NEW;
    END IF;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(actor, 81017)
  );
  IF EXISTS(
    SELECT 1 FROM public.rf01_member_erasure_holds h
    WHERE h.member_id=actor
  ) THEN
    RAISE EXCEPTION 'RF01_ERASED_MEMBER_CONTENT_WRITE_REFUSED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path=pg_catalog,public;

DO $$
DECLARE lane TEXT;
BEGIN
  FOREACH lane IN ARRAY ARRAY[
    'conversation_turns','episodic_memories',
    'member_memory_atoms','member_sessions','maia_sessions'
  ] LOOP
    IF to_regclass('public.'||lane) IS NULL THEN
      RAISE EXCEPTION 'RF01 R1-C missing required content lane %',lane;
    END IF;
    -- S5's tombstone BEFORE INSERT runs alphabetically before 'zz_': exact
    -- tombstoned backup rows are suppressed by the existing S5 refusal and
    -- never reclassified as a fresh write. Other late writes hard-fail.
    EXECUTE format(
      'DROP TRIGGER IF EXISTS zz_rf01_r1c_content_fence_trg ON public.%I',lane);
    EXECUTE format(
      'CREATE TRIGGER zz_rf01_r1c_content_fence_trg '
      || 'BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW '
      || 'EXECUTE FUNCTION public.rf01_r1c_serialize_content_write()',lane);
  END LOOP;
END $$;

COMMENT ON FUNCTION rf01_r1c_serialize_content_write() IS
  'RF01 R1-C per-member transactional barrier between exact erasure and all '
  'new or updated content-bearing rows. Held local qualification only.';
COMMIT;
