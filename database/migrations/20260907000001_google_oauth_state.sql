-- MAIL-04c — Google OAuth state transactions
-- ==========================================
--
-- The callback previously did this:
--
--     const state = searchParams.get('state'); // userId
--     const userId = state;
--     await GoogleCalendarService.storeTokens(userId, tokens);
--
-- OAuth `state` is a CSRF/transaction-binding instrument. It was being used as
-- IDENTITY. Those are not the same thing, and conflating them means anyone who
-- can reach the callback URL can name the account that receives the tokens:
-- craft a state, complete a Google consent for their own Google account, and
-- have the resulting credentials stored under someone else's key.
--
-- A state must therefore be:
--   opaque      carries no identity a caller could forge or read
--   bound       the member is recorded SERVER-SIDE at initiation
--   expiring    an OAuth round trip is seconds, not days
--   single-use  a replayed callback must not re-store tokens
--
-- The member id lives in this table, never in the URL.

CREATE TABLE IF NOT EXISTS public.google_oauth_state (
  -- The opaque value that travels as ?state=. High-entropy, meaningless alone.
  state       text PRIMARY KEY,

  -- The identity, held server-side. This is the whole point of the table.
  member_id   text NOT NULL,

  created_at  timestamptz NOT NULL DEFAULT NOW(),
  expires_at  timestamptz NOT NULL,

  -- Set when redeemed. Presence means "already used" — a replay is refused
  -- rather than silently honoured. Kept rather than deleted on use so a
  -- replay attempt is VISIBLE, the same discipline as the delivery ledger's
  -- idempotency_key.
  consumed_at timestamptz,

  -- Coarse, for correlating an abandoned or replayed flow. No token material.
  initiated_ip text
);

CREATE INDEX IF NOT EXISTS idx_google_oauth_state_expiry
  ON public.google_oauth_state (expires_at);
CREATE INDEX IF NOT EXISTS idx_google_oauth_state_member
  ON public.google_oauth_state (member_id, created_at DESC);

COMMENT ON TABLE public.google_oauth_state IS
  'MAIL-04c. Binds an OAuth round trip to the member who initiated it. state is opaque and single-use; member_id is never carried in the URL.';
COMMENT ON COLUMN public.google_oauth_state.consumed_at IS
  'Redemption time. Rows are retained after use so replay attempts are visible rather than silent.';

-- Expired and long-consumed rows carry no value. Retained briefly after use so
-- a replay lands on a CONSUMED row (refused, visible) rather than a MISSING one
-- (refused, indistinguishable from a typo).
CREATE OR REPLACE FUNCTION public.prune_google_oauth_state()
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE v_deleted bigint := 0;
BEGIN
  WITH gone AS (
    DELETE FROM public.google_oauth_state
     WHERE expires_at < NOW() - INTERVAL '24 hours'
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM gone;
  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.prune_google_oauth_state() IS
  'MAIL-04c retention. Drops state rows 24h past expiry. Run daily.';
