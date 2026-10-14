-- ASTRO-R4I — pre-migration fictional grant and raw history. NEVER real data.
\set ON_ERROR_STOP on
INSERT INTO astro_maia_transfer_grants (
  id, member_id, session_id, token_sha256, text_hmac_sha256,
  status, issued_at, expires_at
) VALUES (
  'eeeeeeee-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'fictional-private-a', repeat('a',64), repeat('b',64),
  'issued', clock_timestamp(), clock_timestamp()+interval '4 minutes'
);
INSERT INTO conversation_turns (user_id, session_id, role, content) VALUES
 ('aaaaaaaa-0000-4000-8000-000000000001','fictional-private-a','user','FICTIONAL_PRIVATE_A_LEGACY_CONTENT'),
 ('bbbbbbbb-0000-4000-8000-000000000002','fictional-ordinary-b','user','FICTIONAL_UNRELATED_B');
