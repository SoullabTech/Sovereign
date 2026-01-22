-- practitioner_integrations: stores per-practitioner integration config
-- config is stored encrypted (app-level), so DB only sees ciphertext.

CREATE TABLE IF NOT EXISTS practitioner_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- e.g. 'email', 'sms', 'calendar', 'payments'
  integration_type TEXT NOT NULL,

  -- e.g. 'managed', 'resend', 'postmark' (later)
  provider TEXT NOT NULL DEFAULT 'managed',

  -- encrypted JSON blob: { apiKey, fromEmail, fromName, replyTo, ... }
  config_encrypted TEXT,

  -- last-known health (optional but useful)
  status TEXT NOT NULL DEFAULT 'disconnected', -- disconnected|connected|error
  last_error TEXT,
  last_checked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (practitioner_id, integration_type)
);

CREATE INDEX IF NOT EXISTS idx_practitioner_integrations_practitioner
  ON practitioner_integrations(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_practitioner_integrations_type
  ON practitioner_integrations(integration_type);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_practitioner_integrations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS practitioner_integrations_updated_at ON practitioner_integrations;
CREATE TRIGGER practitioner_integrations_updated_at
  BEFORE UPDATE ON practitioner_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_practitioner_integrations_timestamp();

COMMENT ON TABLE practitioner_integrations IS 'Per-practitioner integration configurations (email, SMS, calendar, payments). Config stored encrypted.';
COMMENT ON COLUMN practitioner_integrations.integration_type IS 'Integration category: email, sms, calendar, payments';
COMMENT ON COLUMN practitioner_integrations.provider IS 'Provider choice: managed (Soullab), resend, postmark, twilio, etc.';
COMMENT ON COLUMN practitioner_integrations.config_encrypted IS 'AES-256-GCM encrypted JSON config blob';
COMMENT ON COLUMN practitioner_integrations.status IS 'Health status: disconnected, connected, error';
