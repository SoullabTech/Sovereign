-- Fixture after R4F isolated migration has been applied.
\set ON_ERROR_STOP on
INSERT INTO astro_maia_transfer_grants
  (id, member_id, session_id, token_sha256, text_hmac_sha256, issued_at, expires_at)
VALUES
  ('eeeeeeee-0000-4000-8000-000000000001',
   'aaaaaaaa-0000-4000-8000-000000000001',
   'fictional-protected-session-A', repeat('a', 64), repeat('b',64),
   clock_timestamp(), clock_timestamp() + interval '4 minutes'),
  ('eeeeeeee-0000-4000-8000-000000000002',
   'aaaaaaaa-0000-4000-8000-000000000001',
   'fictional-revoked-session-A', repeat('c', 64), repeat('d',64),
   clock_timestamp(), clock_timestamp() + interval '4 minutes');

UPDATE astro_maia_transfer_grants SET status='revoked', revoked_at=clock_timestamp()
WHERE session_id='fictional-revoked-session-A';

INSERT INTO conversation_turns (user_id, session_id, role, content, seq) VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001','fictional-protected-session-A','user','FICTIONAL_ASTRO_PRIVATE_A',0),
  ('aaaaaaaa-0000-4000-8000-000000000001','fictional-protected-session-A','assistant','FICTIONAL_ASTRO_DERIVED_A',1),
  ('aaaaaaaa-0000-4000-8000-000000000001','fictional-revoked-session-A','user','FICTIONAL_REVOKED_A',0),
  ('aaaaaaaa-0000-4000-8000-000000000001','ordinary-session-A','user','FICTIONAL_ORDINARY_A',0),
  ('aaaaaaaa-0000-4000-8000-000000000001','ordinary-session-A','assistant','FICTIONAL_ORDINARY_REPLY_A',1),
  ('bbbbbbbb-0000-4000-8000-000000000002','ordinary-session-B','user','FICTIONAL_ORDINARY_B',0);

DO $r4f$
DECLARE
  guarded_count int;
  ordinary_count int;
  raw_count int;
  wrong_token int;
  wrong_identity int;
  wrong_digest int;
  first_consumption int;
  replay_count int;
  revoked_count int;
BEGIN
  SELECT count(*) INTO raw_count FROM conversation_turns WHERE user_id='aaaaaaaa-0000-4000-8000-000000000001';
  SELECT count(*) INTO guarded_count FROM conversation_turns ct
    WHERE user_id='aaaaaaaa-0000-4000-8000-000000000001'
      AND NOT EXISTS (SELECT 1 FROM astro_maia_transfer_grants g WHERE g.session_id=ct.session_id);
  SELECT count(*) INTO ordinary_count FROM conversation_turns ct
    WHERE user_id='bbbbbbbb-0000-4000-8000-000000000002'
      AND NOT EXISTS (SELECT 1 FROM astro_maia_transfer_grants g WHERE g.session_id=ct.session_id);
  IF raw_count <> 5 OR guarded_count <> 2 OR ordinary_count <> 1 THEN
     RAISE EXCEPTION 'R4F failed ordinary-preservation/protected-filter checks';
  END IF;
  WITH attempted AS (
    UPDATE astro_maia_transfer_grants g SET status='consumed', consumed_at=clock_timestamp()
    WHERE member_id='aaaaaaaa-0000-4000-8000-000000000001'
      AND token_sha256=repeat('wrong',12) AND text_hmac_sha256=repeat('b',64)
      AND status='issued' AND expires_at > clock_timestamp()
    RETURNING session_id
  ) SELECT count(*) INTO wrong_token FROM attempted;
  WITH attempted AS (
    UPDATE astro_maia_transfer_grants g SET status='consumed', consumed_at=clock_timestamp()
    WHERE member_id='bbbbbbbb-0000-4000-8000-000000000002'
      AND token_sha256=repeat('a',64) AND text_hmac_sha256=repeat('b',64)
      AND status='issued' AND expires_at > clock_timestamp()
    RETURNING session_id
  ) SELECT count(*) INTO wrong_identity FROM attempted;
  WITH attempted AS (
    UPDATE astro_maia_transfer_grants g SET status='consumed', consumed_at=clock_timestamp()
    WHERE member_id='aaaaaaaa-0000-4000-8000-000000000001'
      AND token_sha256=repeat('a',64) AND text_hmac_sha256=repeat('z',64)
      AND status='issued' AND expires_at > clock_timestamp()
    RETURNING session_id
  ) SELECT count(*) INTO wrong_digest FROM attempted;
  WITH attempted AS (
    UPDATE astro_maia_transfer_grants g SET status='consumed', consumed_at=clock_timestamp()
    WHERE member_id='aaaaaaaa-0000-4000-8000-000000000001'
      AND token_sha256=repeat('a',64) AND text_hmac_sha256=repeat('b',64)
      AND status='issued' AND expires_at > clock_timestamp()
      AND EXISTS (SELECT 1 FROM members m WHERE m.id=g.member_id AND m.astrology_consent='opted_in')
    RETURNING session_id
  ) SELECT count(*) INTO first_consumption FROM attempted;
  WITH attempted AS (
    UPDATE astro_maia_transfer_grants g SET status='consumed', consumed_at=clock_timestamp()
    WHERE member_id='aaaaaaaa-0000-4000-8000-000000000001'
      AND token_sha256=repeat('a',64) AND text_hmac_sha256=repeat('b',64)
      AND status='issued' AND expires_at > clock_timestamp()
    RETURNING session_id
  ) SELECT count(*) INTO replay_count FROM attempted;
  SELECT count(*) INTO revoked_count FROM astro_maia_transfer_grants WHERE status='revoked'
    AND session_id='fictional-revoked-session-A';
  IF wrong_token <> 0 OR wrong_identity <> 0 OR wrong_digest <> 0
    OR first_consumption <> 1 OR replay_count <> 0 OR revoked_count <> 1 THEN
    RAISE EXCEPTION 'R4F failed one-use/identity/revocation checks';
  END IF;
  RAISE NOTICE 'PASS R4F fictional SQL: raw=%, allowed=%, unrelated=%, first=%, replay=%, revoked=%',
    raw_count, guarded_count, ordinary_count, first_consumption, replay_count, revoked_count;
END
$r4f$;
