\set ON_ERROR_STOP on
BEGIN;
DO $proof$
DECLARE v boolean; i integer; v_before integer; v_after integer;
BEGIN
  -- Six sends to one P0 recipient in an hour are never admitted.
  FOR i IN 1..5 LOOP
    SELECT reserve_soullab_mail_capacity('P0', ARRAY[repeat('a',64)]) INTO v;
    IF v IS DISTINCT FROM true THEN RAISE EXCEPTION 'P0 allowance failed at %', i; END IF;
  END LOOP;
  SELECT reserve_soullab_mail_capacity('P0', ARRAY[repeat('a',64)]) INTO v;
  IF v IS DISTINCT FROM false THEN RAISE EXCEPTION 'P0 sixth same-recipient send not blocked'; END IF;

  -- An exhausted P3 lane must have no effect on protected P0.
  FOR i IN 1..5 LOOP
    SELECT reserve_soullab_mail_capacity('P3',
      ARRAY[repeat(chr(96+i),64)]) INTO v;
    IF v IS DISTINCT FROM true THEN RAISE EXCEPTION 'P3 allowance failed at %', i; END IF;
  END LOOP;
  SELECT reserve_soullab_mail_capacity('P3', ARRAY[repeat('f',64)]) INTO v;
  IF v IS DISTINCT FROM false THEN RAISE EXCEPTION 'P3 sixth send not blocked'; END IF;
  SELECT reserve_soullab_mail_capacity('P0', ARRAY[repeat('b',64)]) INTO v;
  IF v IS DISTINCT FROM true THEN RAISE EXCEPTION 'P3 exhausted P0 reserve'; END IF;

  -- Invalid/malformed requests must fail without changing any counters.
  SELECT COALESCE(sum(attempts),0) INTO v_before FROM soullab_mail_capacity;
  SELECT reserve_soullab_mail_capacity('BAD', ARRAY[repeat('f',64)]) INTO v;
  IF v IS DISTINCT FROM false THEN RAISE EXCEPTION 'unknown lane admitted'; END IF;
  SELECT reserve_soullab_mail_capacity('P1',
    ARRAY[repeat('a',64),repeat('a',64)]) INTO v;
  IF v IS DISTINCT FROM false THEN RAISE EXCEPTION 'duplicate recipients admitted'; END IF;
  SELECT reserve_soullab_mail_capacity('P2',ARRAY['victim@example.com']) INTO v;
  IF v IS DISTINCT FROM false THEN RAISE EXCEPTION 'raw email accepted instead of HMAC'; END IF;
  SELECT COALESCE(sum(attempts),0) INTO v_after FROM soullab_mail_capacity;
  IF v_after <> v_before THEN RAISE EXCEPTION 'invalid request consumed capacity'; END IF;

  IF EXISTS(SELECT 1 FROM soullab_mail_capacity WHERE bucket_key LIKE '%@%') THEN
    RAISE EXCEPTION 'raw mail address persisted in budget keys';
  END IF;
END
$proof$;
ROLLBACK;
SELECT 'SYNTHETIC_CAPACITY_ASSERTIONS_PASSED' AS evidence;
