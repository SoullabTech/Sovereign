-- F4 privacy and deletion proof; run only in disconnected synthetic PostgreSQL.
\set ON_ERROR_STOP on
INSERT INTO public.soul_portrait_delivery_attestations
 (portrait_id,actor_member_id,recipient_fingerprint,recipient_key_version,consent_source,subject_share_attested)
 VALUES
 ('33333333-3333-4333-8333-333333333333',
 '22222222-2222-4222-8222-222222222222',
 repeat('e',64),1,'verbal',TRUE);
DO $assert$
BEGIN
 IF (SELECT count(*) FROM public.soul_portrait_delivery_attestations) != 1 THEN
   RAISE EXCEPTION 'Valid HMAC attestation not persisted';
 END IF;
 BEGIN
   INSERT INTO public.soul_portrait_delivery_attestations
     (portrait_id,actor_member_id,recipient_fingerprint,recipient_key_version,consent_source,subject_share_attested)
     VALUES ('33333333-3333-4333-8333-333333333333',
       '22222222-2222-4222-8222-222222222222',
       'recipient@example.com',1,'written',TRUE);
   RAISE EXCEPTION 'RAW RECIPIENT WAS INCORRECTLY ACCEPTED';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
 IF (SELECT count(*) FROM public.soul_portrait_delivery_attestations) != 1 THEN
   RAISE EXCEPTION 'A rejected recipient was written to audit';
 END IF;
END
$assert$;

-- A member's deletion removes the associated proof; no FK prevents deletion.
DELETE FROM public.members
 WHERE id='22222222-2222-4222-8222-222222222222';
SELECT CASE WHEN count(*)=0 THEN 'MEMBER_DELETE_CASCADE_PASS'
  ELSE 'MEMBER_DELETE_CASCADE_FAIL' END AS result
FROM public.soul_portrait_delivery_attestations;

INSERT INTO public.members(id) VALUES ('22222222-2222-4222-8222-222222222222');
INSERT INTO public.soul_portrait_delivery_attestations
 (portrait_id,actor_member_id,recipient_fingerprint,recipient_key_version,consent_source,subject_share_attested)
 VALUES
 ('33333333-3333-4333-8333-333333333333',
 '22222222-2222-4222-8222-222222222222',
 repeat('f',64),1,'written',TRUE);
DELETE FROM public.soul_portraits
 WHERE id='33333333-3333-4333-8333-333333333333';
SELECT CASE WHEN count(*)=0 THEN 'PORTRAIT_DELETE_CASCADE_PASS'
  ELSE 'PORTRAIT_DELETE_CASCADE_FAIL' END AS result
FROM public.soul_portrait_delivery_attestations;
