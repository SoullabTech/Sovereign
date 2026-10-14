-- Test R4H theme write/read exclusion. Only fictional rows, no live DB.
\set ON_ERROR_STOP on
INSERT INTO astro_maia_transfer_grants
 (id,member_id,session_id,token_sha256,text_hmac_sha256,issued_at,expires_at,status,consumed_at)
VALUES
 ('eeeeeeee-0000-4000-8000-000000000001',
 'aaaaaaaa-0000-4000-8000-000000000001','fictional-private-astro',
 repeat('a',64),repeat('b',64),clock_timestamp(),
 clock_timestamp()+interval '4 minutes','consumed',clock_timestamp());

INSERT INTO member_theme_signals (member_id,session_id,theme,origin_scope)
VALUES
 ('aaaaaaaa-0000-4000-8000-000000000001','fictional-private-astro','wise_acceptance','conversation_only'),
 ('aaaaaaaa-0000-4000-8000-000000000001','fictional-unclassified-session','pattern_recurrence','unknown'),
 ('aaaaaaaa-0000-4000-8000-000000000001','fictional-ordinary-session','field_awareness','ordinary'),
 ('bbbbbbbb-0000-4000-8000-000000000002','fictional-B-ordinary','field_awareness','ordinary');

DO $r4h$
DECLARE allowed int; private_rows int; unknown_rows int;
BEGIN
 SELECT count(*) INTO allowed FROM member_theme_signals t
 WHERE t.member_id='aaaaaaaa-0000-4000-8000-000000000001'
   AND t.origin_scope='ordinary' AND t.session_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM astro_maia_transfer_grants g WHERE g.session_id=t.session_id);
 SELECT count(*) INTO private_rows FROM member_theme_signals WHERE origin_scope='conversation_only';
 SELECT count(*) INTO unknown_rows FROM member_theme_signals WHERE origin_scope='unknown';
 IF allowed <> 1 OR private_rows <> 1 OR unknown_rows <> 1 THEN
   RAISE EXCEPTION 'R4H themes incorrect ordinary/protected/unknown counts';
 END IF;
 -- Simulate source authorization row loss: origin_scope still suppresses.
 DELETE FROM astro_maia_transfer_grants WHERE session_id='fictional-private-astro';
 SELECT count(*) INTO allowed FROM member_theme_signals t
 WHERE t.member_id='aaaaaaaa-0000-4000-8000-000000000001'
 AND t.origin_scope='ordinary';
 IF allowed <> 1 THEN RAISE EXCEPTION 'R4H protected origin resurrected'; END IF;
 RAISE NOTICE 'R4H_THEME_FICTIONAL_PASS ordinary=1 protected=1 unknown=1 after_source_grant_loss=1';
END
$r4h$;
