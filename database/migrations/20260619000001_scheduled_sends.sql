-- Scheduled Sends — Level 2 / Standing Authorizations (EMAIL-ONLY)
-- A human authors an email (recipient, subject, body) + a time, and explicitly
-- confirms permission to send. MAIA sends exactly that email when due — nothing
-- more. No autonomous outreach, no inferred content, no other channel.
--
-- Warrant model (Commit-tier crossing): the human authors and confirms
-- (consent_confirmed) = the only valid source of the send. The due-send worker
-- dispatches ONLY rows with consent_confirmed = true. The channel CHECK
-- structurally forbids anything but email at this layer.

CREATE TABLE IF NOT EXISTS scheduled_sends (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id     uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  author_member_id    uuid NOT NULL,                 -- members.id of the human author (audit)
  channel             text NOT NULL DEFAULT 'email' CHECK (channel = 'email'),
  recipient_email     text NOT NULL CHECK (length(btrim(recipient_email)) > 0),
  recipient_name      text,
  subject             text NOT NULL CHECK (length(btrim(subject)) > 0),
  body                text NOT NULL CHECK (length(btrim(body)) > 0),  -- human-authored, plain text
  scheduled_for       timestamptz NOT NULL,
  consent_confirmed   boolean NOT NULL DEFAULT false,  -- explicit permission to send (the warrant)
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'sent', 'failed', 'canceled')),
  -- delivery audit
  attempts            integer NOT NULL DEFAULT 0,
  sent_at             timestamptz,
  provider            text,                          -- 'managed' | 'resend'
  provider_message_id text,
  last_error          text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE scheduled_sends IS
  'Level 2 standing authorizations (email-only): a human authors recipient+subject+body+time and explicitly confirms permission (consent_confirmed); MAIA sends exactly that email when due. channel CHECK enforces email-only; the due-send worker dispatches only consent_confirmed rows. No autonomous/inferred sends.';

CREATE INDEX IF NOT EXISTS idx_scheduled_sends_due
  ON scheduled_sends (scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scheduled_sends_author
  ON scheduled_sends (practitioner_id, created_at DESC);
