-- Scheduled messages — Level 2 / Standing Authorizations (smallest slice: one-time send)
-- Scope/derivation: docs/architecture/MAIA_ASSIST_SCOPE_2026-06-17.md
--
-- THE ROW IS THE PERMISSION. A human authors the recipient, body, and time; the
-- existence of an active (status='pending') row authorizes exactly one send. The worker
-- atomically claims a row (pending -> sending) before sending, so a row revoked between
-- scheduling and firing is never sent (the active-check). status='revoked' withdraws it.
--
-- Smallest slice ONLY: one-time, email channel, human-authored content. No recurring,
-- no event triggers, no MAIA-authored content, no autonomous outreach.

CREATE TABLE IF NOT EXISTS scheduled_messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_member_id   uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  channel           text NOT NULL DEFAULT 'email' CHECK (channel IN ('email')),
  recipient         text NOT NULL CHECK (length(btrim(recipient)) > 0),
  subject           text NOT NULL DEFAULT '',
  body              text NOT NULL CHECK (length(btrim(body)) > 0),
  scheduled_at      timestamptz NOT NULL,
  status            text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','sending','sent','failed','revoked')),
  attempts          int  NOT NULL DEFAULT 0,
  last_error        text,
  sent_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE scheduled_messages IS
  'Level 2 / Standing Authorizations (smallest slice: one-time send). The row is the permission: a human authors recipient/body/scheduled_at; an active (pending) row authorizes exactly one send. The worker atomically claims (pending->sending) before sending, so a revoked row is never sent. No recurring, no event triggers, no MAIA-authored content.';

-- Due-row lookup for the worker (partial index: only active rows).
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_due
  ON scheduled_messages (scheduled_at) WHERE status = 'pending';

-- Owner's list (for the revoke/cancel surface).
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_owner
  ON scheduled_messages (owner_member_id, created_at DESC);
