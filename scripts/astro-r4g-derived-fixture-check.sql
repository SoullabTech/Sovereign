-- R4G fictional protected origin survives deleted source turn and registry.
\set ON_ERROR_STOP on
INSERT INTO astro_maia_transfer_grants
 (id,member_id,session_id,token_sha256,text_hmac_sha256,issued_at,expires_at,status,consumed_at)
VALUES
 ('eeeeeeee-0000-4000-8000-000000000001',
 'aaaaaaaa-0000-4000-8000-000000000001','fictional-private-chart-A',
 repeat('a',64),repeat('b',64),clock_timestamp(),
 clock_timestamp()+interval '4 minutes','consumed',clock_timestamp());

INSERT INTO conversation_turns (user_id,session_id,role,content,exchange_id) VALUES
 ('aaaaaaaa-0000-4000-8000-000000000001','fictional-private-chart-A','user','FICTIONAL_PRIVATE_CHART','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('aaaaaaaa-0000-4000-8000-000000000001','fictional-ordinary-A','user','FICTIONAL_ORDINARY','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

INSERT INTO developmental_memories
 (id,user_id,source_exchange_id,source_session_id,origin_scope,content_text) VALUES
 ('11111111-1111-4111-8111-111111111111','aaaaaaaa-0000-4000-8000-000000000001',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','fictional-private-chart-A','conversation_only','FICTIONAL_PRIVATE_DERIVED'),
 ('22222222-2222-4222-8222-222222222222','aaaaaaaa-0000-4000-8000-000000000001',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','fictional-ordinary-A','ordinary','FICTIONAL_ORDINARY_DERIVED'),
 ('33333333-3333-4333-8333-333333333333','aaaaaaaa-0000-4000-8000-000000000001',
  NULL,NULL,'unknown','FICTIONAL_UNCLASSIFIED_HISTORY');

INSERT INTO breakthrough_moments
 (id,user_id,source_exchange_id,source_session_id,origin_scope,insight) VALUES
 ('44444444-4444-4444-8444-444444444444','aaaaaaaa-0000-4000-8000-000000000001',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','fictional-private-chart-A','conversation_only','FICTIONAL_PRIVATE_BREAKTHROUGH'),
 ('55555555-5555-4555-8555-555555555555','aaaaaaaa-0000-4000-8000-000000000001',
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','fictional-ordinary-A','ordinary','FICTIONAL_ORDINARY_BREAKTHROUGH');

INSERT INTO semantic_memory_vectors
 (id,user_id,source_exchange_id,source_session_id,origin_scope,chunk_text) VALUES
 ('66666666-6666-4666-8666-666666666666','aaaaaaaa-0000-4000-8000-000000000001',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','fictional-private-chart-A','conversation_only','FICTIONAL_PRIVATE_VECTOR'),
 ('77777777-7777-4777-8777-777777777777','aaaaaaaa-0000-4000-8000-000000000001',
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','fictional-ordinary-A','ordinary','FICTIONAL_ORDINARY_VECTOR');

DO $r4g$
DECLARE
 eligible_dev int;
 eligible_break int;
 eligible_vector int;
 unclassified int;
BEGIN
 -- Adversarial fixture: a historical restore or deletion can remove source
 -- conversation turns. Source-independent origin tags must still be enforced.
 DELETE FROM conversation_turns WHERE session_id='fictional-private-chart-A';
 DELETE FROM astro_maia_transfer_grants WHERE session_id='fictional-private-chart-A';

 SELECT count(*) INTO eligible_dev
 FROM developmental_memories d
 WHERE d.origin_scope <> 'conversation_only'
   AND NOT EXISTS (
     SELECT 1 FROM astro_maia_transfer_grants g
     WHERE g.session_id=d.source_session_id);
 SELECT count(*) INTO eligible_break FROM breakthrough_moments b
 WHERE b.origin_scope <> 'conversation_only'
   AND NOT EXISTS (
     SELECT 1 FROM astro_maia_transfer_grants g
     WHERE g.session_id=b.source_session_id);
 SELECT count(*) INTO eligible_vector FROM semantic_memory_vectors v
 WHERE v.origin_scope <> 'conversation_only'
   AND NOT EXISTS (
     SELECT 1 FROM astro_maia_transfer_grants g
     WHERE g.session_id=v.source_session_id);
 SELECT count(*) INTO unclassified FROM developmental_memories
 WHERE origin_scope='unknown' AND source_exchange_id IS NULL;

 IF eligible_dev<>2 OR eligible_break<>1 OR eligible_vector<>1 OR unclassified<>1 THEN
   RAISE EXCEPTION 'R4G durable origin filter failed after fictional source deletion';
 END IF;
 RAISE NOTICE 'PASS R4G source-independent provenance: dev=%, breakthrough=%, vector=%, historical-unclassified=%', eligible_dev,eligible_break,eligible_vector,unclassified;
END
$r4g$;
