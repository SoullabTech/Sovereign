-- MAIL-02 — Delivery Ledger
-- =========================
--
-- Records every outbound email ATTEMPT and its provider OUTCOME, so the system can
-- answer "what actually left, why, and on whose behalf" from evidence rather than
-- from code shape. MAIL-01 made the transport tell the truth; this makes that truth
-- durable.
--
-- THE LOAD-BEARING RULE (see docs/ops/SOULLAB_MAIL.md):
--   The ledger OBSERVES sending; it does not AUTHORIZE sending.
-- Nothing in the send path may consult this table before calling a provider. A
-- ledger that can gate mail is a ledger that can take P0 authentication down.
--
-- TWO AXES, NEVER COLLAPSED:
--   state          answers "what do we know happened?"
--   failure_class  answers "why did it fail?"
-- Conflating them is the defect MAIL-01 removed from the transport; it must not be
-- reintroduced one layer down.
--
-- WHAT IS DELIBERATELY ABSENT: no duplicate suppression. `idempotency_key` is
-- recorded so repeats are VISIBLE, not blocked. Suppression is MAIL-03 and needs
-- per-lane semantics — a generic recipient+purpose rule would suppress a legitimate
-- second sign-in code and lock a member out.

-- ---------------------------------------------------------------------------
-- Attempts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.email_delivery_attempts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  -- When state left 'attempting'. NULL while in flight — and NULL long after
  -- created_at is itself a finding: the process died between the provider call
  -- and the outcome write.
  settled_at   timestamptz,

  purpose      text NOT NULL,
  lane         text NOT NULL CHECK (lane IN ('P0','P1','P2','P3')),

  -- Recipient attribution. NEVER the plaintext address, and never an unsalted
  -- hash of one: an email address has far too little entropy to survive an
  -- unsalted digest (unlike a UUID, which is why lib/privacy/memberRef.ts is
  -- safe for member ids and NOT safe for addresses). Keyed HMAC only.
  recipient_fingerprint             text,
  recipient_fingerprint_key_version integer,
  -- memberRef(memberId) when the recipient is a known member. Safe by entropy.
  member_ref                        text,
  -- Coarse, unhashed: what deliverability triage actually needs.
  recipient_domain                  text,

  provider     text NOT NULL,

  -- 'attempting'    in flight, or the process died before writing an outcome
  -- 'accepted'      the provider issued a message id and took responsibility
  -- 'indeterminate' outcome genuinely unknown (see failure_class mapping below)
  -- 'refused'       a known terminal non-send
  --
  -- No 'suppressed': suppression is MAIL-03, and reserving a state for work that
  -- does not exist invites it to be written early.
  state        text NOT NULL CHECK (state IN ('attempting','accepted','indeterminate','refused')),

  -- Present iff state='accepted'.
  provider_message_id text,
  -- SendFailureKind from MAIL-01. Persisted, not re-derived.
  --   indeterminate <- 'no_message_id', 'exception'
  --   refused       <- everything else
  -- 'exception' is indeterminate because a transport throw (network, DNS,
  -- timeout) may have died AFTER the provider received and acted on the request.
  -- Calling that refused asserts knowledge we do not have, in exactly the case
  -- where a duplicate send is most likely.
  failure_class text,
  -- The vendor's own error name, verbatim (e.g. 'monthly_quota_exceeded'). The
  -- fact that identified the 2026-08-24 boundary.
  failure_code  text,

  -- Recorded so repeats are VISIBLE. Deliberately NOT unique — see header.
  idempotency_key text,

  trigger_type text CHECK (trigger_type IN ('route','cron','script','worker')),
  trigger_ref  text,
  correlation_id text,
  campaign_ref   text,

  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- A message id is what 'accepted' MEANS. Enforce it here so an accepted row
  -- without one cannot exist even if a future caller gets it wrong.
  CONSTRAINT email_attempt_accepted_has_id
    CHECK (state <> 'accepted' OR provider_message_id IS NOT NULL),
  -- A fingerprint without its key version cannot be interpreted after rotation.
  CONSTRAINT email_attempt_fingerprint_has_version
    CHECK (recipient_fingerprint IS NULL OR recipient_fingerprint_key_version IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_email_attempts_created
  ON public.email_delivery_attempts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_attempts_lane_created
  ON public.email_delivery_attempts (lane, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_attempts_purpose_created
  ON public.email_delivery_attempts (purpose, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_attempts_trigger
  ON public.email_delivery_attempts (trigger_ref, created_at DESC);
-- Repeated idempotency keys: the "is something sending twice?" query.
CREATE INDEX IF NOT EXISTS idx_email_attempts_idempotency
  ON public.email_delivery_attempts (idempotency_key, created_at DESC)
  WHERE idempotency_key IS NOT NULL;
-- Rows stuck in flight.
CREATE INDEX IF NOT EXISTS idx_email_attempts_unsettled
  ON public.email_delivery_attempts (created_at)
  WHERE state = 'attempting';

COMMENT ON TABLE public.email_delivery_attempts IS
  'MAIL-02 delivery ledger. One row per send attempt. OBSERVES sending; never authorizes it. Recipient-level rows are deleted after 90 days (see prune_email_delivery_ledger).';
COMMENT ON COLUMN public.email_delivery_attempts.state IS
  'What we KNOW happened. failure_class says WHY it failed. Never collapse the two.';
COMMENT ON COLUMN public.email_delivery_attempts.idempotency_key IS
  'Observation only — repeats are visible, NOT suppressed. Suppression is MAIL-03 and requires per-lane semantics.';

-- ---------------------------------------------------------------------------
-- Aggregates — survive the 90-day prune, carry NO recipient attribution
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.email_delivery_monthly (
  month     date NOT NULL,
  purpose   text NOT NULL,
  lane      text NOT NULL,
  provider  text NOT NULL,
  state     text NOT NULL,
  attempts  bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (month, purpose, lane, provider, state)
);

COMMENT ON TABLE public.email_delivery_monthly IS
  'MAIL-02 13-month operational aggregate. month x purpose x lane x provider x state x count. Contains NO recipient_fingerprint and NO member_ref — a rollup carrying either would defeat the 90-day deletion of recipient-level rows.';

-- ---------------------------------------------------------------------------
-- Retention — 90 days recipient-level, 13 months aggregate
-- ---------------------------------------------------------------------------
--
-- A retention policy that exists only as prose is not a retention policy. Roll up
-- BEFORE deleting, so the prune never silently discards volume history.

CREATE OR REPLACE FUNCTION public.prune_email_delivery_ledger()
RETURNS TABLE (rolled_up bigint, deleted bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  v_rolled bigint := 0;
  v_deleted bigint := 0;
BEGIN
  WITH due AS (
    SELECT date_trunc('month', created_at)::date AS month,
           purpose, lane, provider, state, count(*) AS n
      FROM public.email_delivery_attempts
     WHERE created_at < NOW() - INTERVAL '90 days'
     GROUP BY 1,2,3,4,5
  ), upserted AS (
    INSERT INTO public.email_delivery_monthly AS m
                (month, purpose, lane, provider, state, attempts)
    SELECT month, purpose, lane, provider, state, n FROM due
    ON CONFLICT (month, purpose, lane, provider, state)
      DO UPDATE SET attempts = m.attempts + EXCLUDED.attempts
    RETURNING 1
  )
  SELECT count(*) INTO v_rolled FROM upserted;

  WITH gone AS (
    DELETE FROM public.email_delivery_attempts
     WHERE created_at < NOW() - INTERVAL '90 days'
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM gone;

  DELETE FROM public.email_delivery_monthly
   WHERE month < (date_trunc('month', NOW()) - INTERVAL '13 months')::date;

  RETURN QUERY SELECT v_rolled, v_deleted;
END;
$$;

COMMENT ON FUNCTION public.prune_email_delivery_ledger() IS
  'MAIL-02 retention. Rolls attempts older than 90 days into email_delivery_monthly, then deletes them; drops aggregates older than 13 months. Run daily.';
