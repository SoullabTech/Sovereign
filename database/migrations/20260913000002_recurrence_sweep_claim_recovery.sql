-- BCS-01A · Step 5 — expired-claim recovery.
--
-- NAMING (BCS-M1). This is EXPIRED-CLAIM RECOVERY, not crash detection. A missed
-- heartbeat does not establish that a process crashed, that a worker stopped
-- computing, or that the execution failed. It establishes only that the durable
-- store no longer recognizes this claim as sufficiently live to retain ownership.
-- No `crashed` state is stored, because none can be truthfully established.
--
-- "Crash recovery" remains the charter capability name (P5). The mechanism keeps
-- the narrower name it can actually support.

-- ── the current-claim invariant ──────────────────────────────────────────────
-- claimed_by / claimed_at / heartbeat_at describe the CURRENT claim. They must
-- not quietly become "historical last claim" on a terminal row. If worker
-- attribution history is later required, it earns its own representation.
DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recurrence_sweep_executions_claim_fields_match_status') THEN
    ALTER TABLE recurrence_sweep_executions
      ADD CONSTRAINT recurrence_sweep_executions_claim_fields_match_status CHECK (
        (status = 'running'
          AND claimed_by IS NOT NULL AND claimed_at IS NOT NULL AND heartbeat_at IS NOT NULL)
        OR
        (status <> 'running'
          AND claimed_by IS NULL AND claimed_at IS NULL AND heartbeat_at IS NULL)
      );
  END IF;
END $do$;

-- ── the attempt budget ───────────────────────────────────────────────────────
DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recurrence_sweep_executions_attempt_budget') THEN
    ALTER TABLE recurrence_sweep_executions
      ADD CONSTRAINT recurrence_sweep_executions_attempt_budget CHECK (
        attempts >= 0 AND max_attempts >= 1 AND attempts <= max_attempts
      );
  END IF;
END $do$;

-- `queued` means ELIGIBLE FOR CLAIM. A queued row whose attempts equal its budget
-- could never be claimed, so the word would be false. Make it unrepresentable.
DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recurrence_sweep_executions_queued_is_claimable') THEN
    ALTER TABLE recurrence_sweep_executions
      ADD CONSTRAINT recurrence_sweep_executions_queued_is_claimable CHECK (
        status <> 'queued' OR attempts < max_attempts
      );
  END IF;
END $do$;

-- ── recovery lives in the database ───────────────────────────────────────────
-- The reaping decision uses the same clock that stamps heartbeats, and the
-- database owns concurrency (FOR UPDATE SKIP LOCKED) — the strongest existing
-- precedent in this repository. Recurrence-specific: no generic job reaper.
--
-- Returns the number of execution rows whose claim was revoked.
CREATE OR REPLACE FUNCTION fn_recover_expired_recurrence_sweep_claims(p_expiry INTERVAL)
RETURNS INTEGER AS $$
DECLARE
  v_requeued  INTEGER := 0;
  v_exhausted INTEGER := 0;
BEGIN
  IF p_expiry IS NULL OR p_expiry <= INTERVAL '0' THEN
    RAISE EXCEPTION 'expiry interval must be positive';
  END IF;

  WITH expired AS (
    SELECT id, attempts, max_attempts
      FROM recurrence_sweep_executions
     WHERE status = 'running'
       AND heartbeat_at < NOW() - p_expiry
     FOR UPDATE SKIP LOCKED
  ),
  -- attempts remain → the SAME execution becomes claimable again.
  -- queued_at is NOT rewritten: its predicate is "first became eligible for
  -- claim", and stamping now() would silently change it to "most recently
  -- entered the queue". FIFO may therefore favour an older recovered execution.
  -- That is honest.
  requeued AS (
    UPDATE recurrence_sweep_executions e
       SET status = 'queued',
           claimed_by = NULL, claimed_at = NULL, heartbeat_at = NULL
      FROM expired x
     WHERE e.id = x.id AND x.attempts < x.max_attempts
     RETURNING e.id
  ),
  -- budget exhausted → it cannot truthfully return to `queued`, because it is no
  -- longer eligible for another claim. `failed` already means "terminated without
  -- normal completion and not by an accepted cancellation" — which is true here,
  -- and claims nothing about the old process.
  exhausted AS (
    UPDATE recurrence_sweep_executions e
       SET status = 'failed',
           finished_at = NOW(),
           claimed_by = NULL, claimed_at = NULL, heartbeat_at = NULL
      FROM expired x
     WHERE e.id = x.id AND x.attempts >= x.max_attempts
     RETURNING e.id
  )
  SELECT (SELECT count(*) FROM requeued), (SELECT count(*) FROM exhausted)
    INTO v_requeued, v_exhausted;

  -- Recovery NEVER: refunds an attempt · rewrites queued_at · deletes a cancel
  -- request · creates a new execution · mints a commission · sets `cancelled`.
  RETURN v_requeued + v_exhausted;
END;
$$ LANGUAGE plpgsql;
