-- Members table for cross-device user recognition
-- Part of the robust beta system

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passkey VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  onboarded BOOLEAN DEFAULT false,
  onboarding_step VARCHAR(50) DEFAULT 'begin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in TIMESTAMPTZ
);

-- Index for fast passkey lookups
CREATE INDEX IF NOT EXISTS idx_members_passkey ON members(passkey);

-- Index for username lookups during sign-in
CREATE INDEX IF NOT EXISTS idx_members_username ON members(username);

-- Track onboarding progress
COMMENT ON COLUMN members.onboarding_step IS 'Current step: begin, test-elemental, faq, onboarding, complete';
COMMENT ON COLUMN members.onboarded IS 'True when full onboarding flow completed';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS members_updated_at ON members;
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_members_updated_at();
