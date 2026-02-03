-- Google Calendar OAuth Credentials Storage
-- Stores refresh tokens for users who have connected their Google Calendar

CREATE TABLE IF NOT EXISTS google_calendar_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_google_calendar_user ON google_calendar_credentials(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_google_calendar_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS google_calendar_credentials_updated_at ON google_calendar_credentials;
CREATE TRIGGER google_calendar_credentials_updated_at
  BEFORE UPDATE ON google_calendar_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_google_calendar_credentials_updated_at();
