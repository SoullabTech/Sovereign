-- PUSH-NOTIFICATIONS / P1 — a member's registered iOS devices.
-- Additive: one new table. No existing table or row is touched. Nothing reads
-- this table yet (no caller); P1 is built dark. Registering a device is the
-- member's own act and confers no consent to any particular notification:
-- what may be sent is governed separately (member_notification_preferences,
-- channel 'push'), which P1 does not use.
-- Stores only what Apple's service needs to address a device. No message
-- content is ever stored here.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS member_push_devices (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  platform       text NOT NULL CHECK (platform IN ('ios')),
  environment    text NOT NULL CHECK (environment IN ('sandbox', 'production')),
  token          text NOT NULL CHECK (length(token) BETWEEN 32 AND 400),
  app_id         text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_seen_at   timestamptz NOT NULL DEFAULT now(),
  revoked_at     timestamptz,
  revoked_reason text
);

-- One row per physical registration. A device handed to another member keeps
-- one row, re-pointed by the registration endpoint.
CREATE UNIQUE INDEX IF NOT EXISTS member_push_devices_token_uniq
  ON member_push_devices (platform, environment, token);

CREATE INDEX IF NOT EXISTS member_push_devices_member_active
  ON member_push_devices (member_id) WHERE revoked_at IS NULL;

COMMIT;
