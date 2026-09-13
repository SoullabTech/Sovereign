-- BCS-01A · Step 4 — minimum durable execution for ONE authorized workload.
--
-- SCOPED TO THE RECURRENCE SWEEP ON PURPOSE. This is not bounded_cognition_jobs,
-- not cognition_executions, not a universal commissions table. FR-J6 and BCS-M1:
-- a component exists because a specific responsibility requires it, never because
-- "bounded cognition needs somewhere to live". Success here does not make these
-- tables general infrastructure.
--
-- Mechanics are borrowed from media_jobs (claim, attempts, worker identity,
-- heartbeat, terminal timestamps). MEANING is borrowed from BCS-01A: `running`,
-- not `processing`; no domain fields copied wholesale.
--
-- DELIBERATELY ABSENT — each belongs to a later step and would be schema written
-- in anticipation of evidence: coverage · checkpoint · progress · durable output
-- · lineage · currency/stale · producer · current-protection snapshot · generic
-- metadata · execution dependency · priority · is_critical · input/output blobs.

-- ── the authority root ───────────────────────────────────────────────────────
-- One explicit authorization act, for one frozen recurrence-sweep scope.
-- Immutable in application semantics: if any of these facts must change, that is
-- a different authorization act and needs a new commission.
CREATE TABLE IF NOT EXISTS recurrence_sweep_commissions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id               UUID        NOT NULL,
  manuscript_id           UUID        NOT NULL,
  draft_id                UUID        NOT NULL,

  -- frozen Work identity: the immutable revision remains the custody location
  -- for the Work itself. No prose is copied here.
  revision_number         INTEGER     NOT NULL,
  revision_digest         TEXT        NOT NULL,

  -- AUTHORIZED to read. NOT coverage: coverage is what an execution actually
  -- read, is owed only when real work reads material, and is never seeded here.
  body_scope_section_ids  TEXT[]      NOT NULL,
  scope_fingerprint       TEXT        NOT NULL,

  -- the ceiling authorized by the act. Effective permission is this INTERSECTED
  -- with current protection at the moment of the governed act, so no current /
  -- effective permission is ever stored.
  max_jurisdiction        TEXT        NOT NULL
    CHECK (max_jurisdiction IN ('sovereign', 'external')),

  commissioned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT recurrence_sweep_commissions_scope_nonempty
    CHECK (array_length(body_scope_section_ids, 1) >= 1)
);

-- ── one authorized execution instance ────────────────────────────────────────
-- `commission_id` is the AUTHORIZATION BASIS REFERENCE. The execution never
-- restates member authority, body scope, frozen revision or jurisdiction as
-- authoritative copies — those resolve through the immutable commission.
--
-- ONE-SHOT IS STRUCTURAL, NOT A FLAG. There is no `consumed` boolean to drift:
--   no execution row for a commission → not consumed
--   an execution row exists           → consumed
CREATE TABLE IF NOT EXISTS recurrence_sweep_executions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id  UUID        NOT NULL UNIQUE
                 REFERENCES recurrence_sweep_commissions(id) ON DELETE CASCADE,

  status         TEXT        NOT NULL DEFAULT 'queued'
                 CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),

  attempts       INTEGER     NOT NULL DEFAULT 0,
  max_attempts   INTEGER     NOT NULL DEFAULT 3,

  requested_by   TEXT        NOT NULL,

  claimed_by     TEXT,
  claimed_at     TIMESTAMPTZ,
  heartbeat_at   TIMESTAMPTZ,

  queued_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at    TIMESTAMPTZ,

  -- finished_at records when a terminal state was actually recorded; it stays
  -- null while queued or running.
  CONSTRAINT recurrence_sweep_executions_finished_iff_terminal
    CHECK (
      (status IN ('completed', 'failed', 'cancelled') AND finished_at IS NOT NULL)
      OR (status IN ('queued', 'running') AND finished_at IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS recurrence_sweep_executions_claimable_idx
  ON recurrence_sweep_executions (queued_at)
  WHERE status = 'queued';

-- ── the cancellation ACT, kept separate from the lifecycle FACT ──────────────
-- Writing a request must leave the execution's status unchanged. Only the
-- execution path, observing an accepted request and actually terminating, may
-- move `running` → `cancelled`.
CREATE TABLE IF NOT EXISTS recurrence_sweep_cancel_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id  UUID        NOT NULL UNIQUE
                REFERENCES recurrence_sweep_executions(id) ON DELETE CASCADE,
  requested_by  TEXT        NOT NULL,
  authority     TEXT        NOT NULL,
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason        TEXT
);
