-- SELF-ADDRESSED-RETURN-01 · Tier 1 — "Remember for me"
--
-- Spec:  docs/specs/SELF-ADDRESSED-RETURN-01_TIER1_SPEC_2026-09-04.md
-- Ruling: docs/programme/SELF-ADDRESSED-RETURN-01_CONSTITUTIONAL_RULING_2026-09-04.md
-- Canon:  docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md §3
--
-- A member may ask Soullab to return something they deliberately chose, at a
-- time they deliberately chose. Delivery is fulfillment of that authored act,
-- NOT a judgement that contact is warranted.
--
-- WHAT IS DELIBERATELY ABSENT FROM THIS TABLE, and must stay absent:
--
--     last_seen · last_active · days_absent · engagement_score
--     return_status · opened_then_returned · inferred_need · priority
--     recipient_email
--
-- A column that does not exist cannot be read by a future well-meaning patch.
-- Enforced mechanically by refusal R32
-- (tests/constitutional/refusal-registry/refusal-32-*.ts).

CREATE TABLE IF NOT EXISTS member_reminders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id          UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- What the member pointed at. 'member_note' = typed fresh, no source object.
  source_type        TEXT NOT NULL
                       CHECK (source_type IN ('memory_atom', 'daily_anchor', 'member_note')),
  source_id          UUID,

  -- An absolute instant. The member picks a local time; the route converts ONCE,
  -- at authoring. The worker never computes a time relative to anything.
  delivery_at        TIMESTAMPTZ NOT NULL,

  -- A late message violates the authored act as much as a missing one. Past this
  -- instant the reminder is terminal-'expired' and is never sent. Spec §6.3.
  delivery_deadline  TIMESTAMPTZ NOT NULL,

  channel            TEXT NOT NULL DEFAULT 'email' CHECK (channel = 'email'),

  -- The exact member-approved words, snapshotted at creation. Never
  -- reconstructed at delivery: what arrives is what they authorized.
  delivery_text      TEXT NOT NULL CHECK (length(delivery_text) BETWEEN 1 AND 2000),

  -- Only the HASH. The opaque token lives in the email and in the member's
  -- hands; a database read cannot reconstruct a working cancellation link.
  cancel_token_hash  TEXT NOT NULL UNIQUE,

  -- Which cancel secret derived this token. A rotation must not orphan links
  -- already sitting in members' inboxes: cancellation is part of the member's
  -- continuing authority over the act, so it outlives our key hygiene.
  cancel_token_version SMALLINT NOT NULL DEFAULT 1,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at       TIMESTAMPTZ,

  -- ── DISPATCH AUTHORITY ────────────────────────────────────────────────
  -- PENDING → CLAIMED → DISPATCHING → DELIVERED.
  --
  -- CLAIMED is an internal lease only: the member may STILL cancel. The lease
  -- expires so a crashed worker cannot hold a reminder hostage.
  --
  -- dispatch_started_at is the LINEARIZATION POINT. Once set, the send has
  -- begun and cancellation is genuinely too late — an email cannot be recalled,
  -- and the member is told that truthfully rather than sold a cancellation that
  -- did not happen.
  claimed_at         TIMESTAMPTZ,
  claim_token        UUID,
  claim_expires_at   TIMESTAMPTZ,
  dispatch_started_at TIMESTAMPTZ,

  delivered_at       TIMESTAMPTZ,

  -- Operational evidence ONLY. Never an engagement signal, never joined to
  -- member behaviour. Read by the worker's own retry logic and nothing else.
  delivery_attempts  INT NOT NULL DEFAULT 0,
  -- When we FIRST tried. Retries are bounded relative to this, not to
  -- delivery_at, because the risk being bounded is duplicate delivery at the
  -- vendor — whose idempotency protection is time-limited. See the worker.
  first_attempt_at   TIMESTAMPTZ,
  failed_at          TIMESTAMPTZ,

  -- Typed, closed set. No provider prose: vendor messages can echo the payload,
  -- and free-text columns accrete content. Vendor detail stays in logs.
  failure_code       TEXT CHECK (failure_code IN (
    'no_recipient',
    'provider_unconfigured',
    'provider_rejected',
    'quota_exceeded',
    'expired',
    'cancel_secret_unavailable',
    -- The send may or may not have reached the member. Past the provider's
    -- idempotency window we can no longer retry without risking a duplicate of
    -- the member's own words, so we stop and say so rather than guess.
    'delivery_uncertain',
    'unknown'
  )),

  CONSTRAINT member_reminders_source_id_present_unless_note
    CHECK ((source_type = 'member_note') = (source_id IS NULL)),

  CONSTRAINT member_reminders_deadline_after_delivery
    CHECK (delivery_deadline >= delivery_at),

  CONSTRAINT member_reminders_failure_code_with_failed_at
    CHECK ((failure_code IS NULL) = (failed_at IS NULL)),

  -- A lease is all three fields or none of them.
  CONSTRAINT member_reminders_claim_is_whole
    CHECK (num_nonnulls(claimed_at, claim_token, claim_expires_at) IN (0, 3)),

  -- Dispatch can only follow a claim, and delivery can only follow dispatch.
  -- The ordering is enforced by the database, not merely by worker discipline.
  CONSTRAINT member_reminders_dispatch_requires_claim
    CHECK (dispatch_started_at IS NULL OR claimed_at IS NOT NULL),
  CONSTRAINT member_reminders_delivery_requires_dispatch
    CHECK (delivered_at IS NULL OR dispatch_started_at IS NOT NULL),

  -- The member's cancellation and the system's dispatch are mutually exclusive
  -- outcomes. Both being set would mean we cancelled something already sent.
  CONSTRAINT member_reminders_cancel_xor_dispatch
    CHECK (cancelled_at IS NULL OR dispatch_started_at IS NULL)
);

-- The worker's only index, deliberately shaped like the only query it may run.
CREATE INDEX IF NOT EXISTS idx_member_reminders_due
  ON member_reminders (delivery_at)
  WHERE cancelled_at IS NULL AND delivered_at IS NULL AND failed_at IS NULL
    AND dispatch_started_at IS NULL;

-- The member's own list of what they have scheduled.
CREATE INDEX IF NOT EXISTS idx_member_reminders_member
  ON member_reminders (member_id, created_at DESC);

COMMENT ON TABLE member_reminders IS
  'SELF-ADDRESSED-RETURN-01 Tier 1. A member-authored future delivery of the member''s own approved words. Absence-blind by construction: this table carries no presence, recency, or engagement data, and refusal R32 enforces that the unit reading it cannot acquire any.';

COMMENT ON COLUMN member_reminders.delivery_attempts IS
  'Operational evidence that a send failed, so failure is distinguishable from the system correctly staying quiet (canon: sacred refusal vs system failure). NEVER an engagement signal.';
