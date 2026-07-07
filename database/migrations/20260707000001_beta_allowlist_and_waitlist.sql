-- Private beta: allowlist + waitlist
-- Spec: docs/specs/PRIVATE_BETA_ALLOWLIST_SPEC_2026-07-07.md
--
-- Posture: open registration ≠ public discoverability. Keep email-code auth,
-- add a quiet gate. The gate lives in app/api/members/email-code/route.ts:
--   admit if EITHER the email is an existing member (never lock out someone
--   already in) OR the email is in beta_allowlist; otherwise send no code,
--   capture to beta_waitlist, and the client shows a warm "small groups" message.
-- No passkeys, no approved domains yet — individual admission only.

CREATE TABLE IF NOT EXISTS beta_allowlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  note        TEXT,
  added_by    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS beta_allowlist_email_key ON beta_allowlist (LOWER(email));

CREATE TABLE IF NOT EXISTS beta_waitlist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INT NOT NULL DEFAULT 1,
  admitted_at   TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS beta_waitlist_email_key ON beta_waitlist (LOWER(email));

-- Seed: Larry Closs — What Now? practitioner pilot (founder-issued admission).
INSERT INTO beta_allowlist (email, note, added_by)
VALUES ('larry@dynamichappy.com', 'Larry Closs — What Now? practitioner pilot', 'founder')
ON CONFLICT (LOWER(email)) DO NOTHING;
