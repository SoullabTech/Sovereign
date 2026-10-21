-- MAIL-05: Atomic transport-agnostic capacity budget.
-- Distinct from the delivery ledger: policy lives here; the ledger observes.
-- Only pseudonymous HMAC recipient keys enter these counters, never email addresses.
-- A failure or provider refusal still uses capacity (abuse is attempts, not deliveries).
-- This migration MUST be independently reviewed before production application.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS public.soullab_mail_capacity (
    bucket_key text PRIMARY KEY,
    attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    expires_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS soullab_mail_capacity_expiry
    ON public.soullab_mail_capacity (expires_at);

CREATE OR REPLACE FUNCTION public.reserve_soullab_mail_capacity(
    p_lane text, p_recipients_hmac text[]
) RETURNS boolean
LANGUAGE plpgsql
AS $mail$
DECLARE
    v_hour text := to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDDHH24');
    v_day text := to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDD');
    v_hour_exp timestamptz :=
        (date_trunc('hour', now() AT TIME ZONE 'UTC') + interval '1 hour') AT TIME ZONE 'UTC';
    v_day_exp timestamptz :=
        (date_trunc('day', now() AT TIME ZONE 'UTC') + interval '1 day') AT TIME ZONE 'UTC';
    v_hour_limit integer;
    v_day_limit integer;
    v_recipient_hour integer;
    v_recipient_day integer;
    v_count integer;
    v_n integer;
    v_i integer;
    v_current integer;
    v_keys text[] := ARRAY[]::text[];
    v_amounts integer[] := ARRAY[]::integer[];
    v_limits integer[] := ARRAY[]::integer[];
    v_expires timestamptz[] := ARRAY[]::timestamptz[];
    v_address_key text;
BEGIN
    -- Fail closed for malformed calls. Do not allow a client to select its cap.
    IF p_lane IS NULL OR p_lane NOT IN ('P0','P1','P2','P3')
      OR p_recipients_hmac IS NULL THEN
        RETURN FALSE;
    END IF;
    v_n := cardinality(p_recipients_hmac);
    IF v_n < 1 OR v_n > 20 OR
       (SELECT count(DISTINCT val) FROM unnest(p_recipients_hmac) AS x(val)) <> v_n
       OR EXISTS (SELECT 1 FROM unnest(p_recipients_hmac) AS x(val)
                  WHERE val IS NULL OR val !~ '^[a-f0-9]{64}$') THEN
        RETURN FALSE;
    END IF;

    CASE p_lane
      WHEN 'P0' THEN v_hour_limit := 30; v_day_limit := 120;
                     v_recipient_hour := 5; v_recipient_day := 12;
      WHEN 'P1' THEN v_hour_limit := 25; v_day_limit := 80;
                     v_recipient_hour := 6; v_recipient_day := 12;
      WHEN 'P2' THEN v_hour_limit := 35; v_day_limit := 100;
                     v_recipient_hour := 6; v_recipient_day := 15;
      WHEN 'P3' THEN v_hour_limit := 5;  v_day_limit := 20;
                     v_recipient_hour := 2; v_recipient_day := 3;
    END CASE;

    v_keys := array_append(v_keys, 'lane:h:'||p_lane||':'||v_hour);
    v_amounts := array_append(v_amounts, v_n);
    v_limits := array_append(v_limits, v_hour_limit);
    v_expires := array_append(v_expires, v_hour_exp);

    v_keys := array_append(v_keys, 'lane:d:'||p_lane||':'||v_day);
    v_amounts := array_append(v_amounts, v_n);
    v_limits := array_append(v_limits, v_day_limit);
    v_expires := array_append(v_expires, v_day_exp);

    -- Non-identity traffic shares a bounded pool; P0 never draws from it.
    IF p_lane <> 'P0' THEN
       v_keys := array_append(v_keys, 'nonidentity:h:'||v_hour);
       v_amounts := array_append(v_amounts, v_n);
       v_limits := array_append(v_limits, 50);
       v_expires := array_append(v_expires, v_hour_exp);

       v_keys := array_append(v_keys, 'nonidentity:d:'||v_day);
       v_amounts := array_append(v_amounts, v_n);
       v_limits := array_append(v_limits, 150);
       v_expires := array_append(v_expires, v_day_exp);
    END IF;

    FOREACH v_address_key IN ARRAY p_recipients_hmac LOOP
       v_keys := array_append(v_keys,
                       'recipient:h:'||p_lane||':'||v_hour||':'||v_address_key);
       v_amounts := array_append(v_amounts, 1);
       v_limits := array_append(v_limits, v_recipient_hour);
       v_expires := array_append(v_expires, v_hour_exp);

       v_keys := array_append(v_keys,
                       'recipient:d:'||p_lane||':'||v_day||':'||v_address_key);
       v_amounts := array_append(v_amounts, 1);
       v_limits := array_append(v_limits, v_recipient_day);
       v_expires := array_append(v_expires, v_day_exp);
    END LOOP;

    -- One short transaction-scoped global lock serializes reservations across
    -- every app instance. Conservative, suitable for the measured beta volume.
    PERFORM pg_advisory_xact_lock(2026101205::bigint);
    FOR v_i IN 1..cardinality(v_keys) LOOP
        SELECT attempts INTO v_current
          FROM public.soullab_mail_capacity
         WHERE bucket_key = v_keys[v_i];
        IF coalesce(v_current, 0) + v_amounts[v_i] > v_limits[v_i] THEN
            RETURN FALSE;  -- NO increments made.
        END IF;
    END LOOP;

    FOR v_i IN 1..cardinality(v_keys) LOOP
        INSERT INTO public.soullab_mail_capacity
           (bucket_key, attempts, expires_at)
        VALUES (v_keys[v_i], v_amounts[v_i], v_expires[v_i])
        ON CONFLICT (bucket_key) DO UPDATE
          SET attempts = public.soullab_mail_capacity.attempts + EXCLUDED.attempts,
              expires_at = EXCLUDED.expires_at,
              updated_at = now();
    END LOOP;
    RETURN TRUE;
END;
$mail$;

CREATE OR REPLACE FUNCTION public.prune_soullab_mail_capacity()
RETURNS bigint LANGUAGE plpgsql AS $prune$
DECLARE v_deleted bigint;
BEGIN
    DELETE FROM public.soullab_mail_capacity
     WHERE expires_at < now() - interval '48 hours';
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$prune$;

COMMENT ON TABLE public.soullab_mail_capacity IS
  'MAIL-05 abuse budget, separate from the MAIL-02 observational ledger. HMAC keys only; prune daily.';
COMMENT ON FUNCTION public.reserve_soullab_mail_capacity(text,text[]) IS
  'Atomic MAIL-05 shared sending budget. P0 has independent reserved capacity; no plaintext recipients.';

COMMIT;
