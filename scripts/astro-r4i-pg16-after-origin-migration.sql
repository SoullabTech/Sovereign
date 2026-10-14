-- ASTRO-R4I — fictitious no-member-link origin, account deletion, retention
-- and protected memory non-recall rehearsal. This does NOT represent R20 vault.
\set ON_ERROR_STOP on
DO $r4i$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n FROM astro_maia_protected_origins WHERE session_id='fictional-private-a';
  IF n <> 1 THEN RAISE EXCEPTION 'R4I missing pre-migration protected origin'; END IF;
  SELECT count(*) INTO n FROM pg_constraint c
    WHERE c.conrelid='astro_maia_transfer_grants'::regclass
      AND c.conname='astro_maia_transfer_grants_member_id_fkey'
      AND c.confdeltype='c';
  IF n<>1 THEN RAISE EXCEPTION 'R4I FK has not been changed to cascade'; END IF;
  RAISE NOTICE 'R4I_MIGRATION_BACKFILL_AND_FK_PASS';
END
$r4i$;

-- Newly inserted grants must register their origin without a second call.
INSERT INTO astro_maia_transfer_grants (
  id, member_id, session_id, token_sha256, text_hmac_sha256,
  status, issued_at, expires_at
) VALUES (
  'eeeeeeee-0000-4000-8000-000000000002',
  'bbbbbbbb-0000-4000-8000-000000000002',
  'fictional-private-b', repeat('c',64), repeat('d',64),
  'issued', clock_timestamp(), clock_timestamp()+interval '4 minutes'
);

DO $r4i$
DECLARE
 n integer;
BEGIN
 SELECT count(*) INTO n FROM astro_maia_protected_origins
   WHERE session_id IN ('fictional-private-a','fictional-private-b');
 IF n<>2 THEN RAISE EXCEPTION 'R4I atomic forward registration failed'; END IF;
 RAISE NOTICE 'R4I_ATOMIC_GRANT_ORIGIN_REGISTRATION_PASS';
END
$r4i$;

-- The grant-bearing member row now deletes in a synthetic SQL operation;
-- the one-use grant is removed; the pseudonymous protected-origin survives.
DELETE FROM members WHERE id='aaaaaaaa-0000-4000-8000-000000000001';

DO $r4i$
DECLARE
  n integer;
  denied integer;
  eligible integer;
BEGIN
  SELECT count(*) INTO n FROM members WHERE id='aaaaaaaa-0000-4000-8000-000000000001';
  IF n<>0 THEN RAISE EXCEPTION 'R4I member delete refused'; END IF;

  SELECT count(*) INTO n FROM astro_maia_transfer_grants WHERE session_id='fictional-private-a';
  IF n<>0 THEN RAISE EXCEPTION 'R4I member bearer/digest grant retained'; END IF;

  SELECT count(*) INTO n FROM astro_maia_protected_origins WHERE session_id='fictional-private-a';
  IF n<>1 THEN RAISE EXCEPTION 'R4I privacy origin lost'; END IF;

  SELECT count(*) INTO denied FROM conversation_turns AS ct
   WHERE ct.session_id='fictional-private-a'
     AND EXISTS (
       SELECT 1 FROM (
         SELECT session_id FROM astro_maia_protected_origins
         UNION ALL
         SELECT session_id FROM astro_maia_transfer_grants
       ) AS o WHERE o.session_id=ct.session_id
     );
  SELECT count(*) INTO eligible FROM conversation_turns AS ct
   WHERE ct.session_id='fictional-ordinary-b'
     AND NOT EXISTS (
       SELECT 1 FROM (
         SELECT session_id FROM astro_maia_protected_origins
         UNION ALL
         SELECT session_id FROM astro_maia_transfer_grants
       ) AS o WHERE o.session_id=ct.session_id
     );
  IF denied<>1 OR eligible<>1 THEN RAISE EXCEPTION 'R4I origin recall isolation failed'; END IF;
  RAISE NOTICE 'R4I_MEMBER_DELETE_GRANT_ERASURE_ORIGIN_RETENTION_PASS private_denied=%, unrelated_visible=%', denied,eligible;
END
$r4i$;

-- A member lacking authorized deletion can still be blocked at route's
-- governed-content preflight. This is a SQL compatibility test only, NOT
-- a certificate of safe full-account deletion or deletion-aware backup restore.

-- Ordinary database operations must not remove or rewrite the marker.
DO $r4i$
DECLARE blocked int := 0;
BEGIN
  BEGIN
    DELETE FROM astro_maia_protected_origins WHERE session_id='fictional-private-a';
  EXCEPTION WHEN insufficient_privilege THEN
    blocked := blocked+1;
  END;
  BEGIN
    UPDATE astro_maia_protected_origins SET session_id='fictional-reused' WHERE session_id='fictional-private-a';
  EXCEPTION WHEN insufficient_privilege THEN
    blocked := blocked+1;
  END;
  BEGIN
    TRUNCATE astro_maia_protected_origins;
  EXCEPTION WHEN insufficient_privilege THEN
    blocked:=blocked+1;
  END;
  IF blocked<>3 THEN RAISE EXCEPTION 'R4I origin can be deleted, retagged or truncated, blocked=%', blocked; END IF;
  RAISE NOTICE 'R4I_IMMUTABLE_ORIGIN_TEST_PASS';
END
$r4i$;

-- Grant session ID is immutable as well. Status-only consumption/revocation
-- is still possible and must not suppress the origin record.
DO $r4i$
DECLARE blocked integer:=0;
BEGIN
  BEGIN
    UPDATE astro_maia_transfer_grants SET session_id='fictional-altered-b' WHERE session_id='fictional-private-b';
  EXCEPTION WHEN insufficient_privilege THEN
    blocked:=blocked+1;
  END;
  IF blocked<>1 THEN RAISE EXCEPTION 'R4I grant session ID unexpectedly mutable'; END IF;
  UPDATE astro_maia_transfer_grants SET status='revoked', revoked_at=clock_timestamp()
   WHERE session_id='fictional-private-b' AND status='issued';
  IF NOT EXISTS (SELECT 1 FROM astro_maia_protected_origins WHERE session_id='fictional-private-b')
  THEN RAISE EXCEPTION 'R4I marker lost after grant revocation'; END IF;
  RAISE NOTICE 'R4I_REPLAY_AND_REVOCATION_CUSTODY_PASS';
END
$r4i$;
