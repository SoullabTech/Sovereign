-- ============================================
-- ENCRYPTION METADATA MIGRATION
-- ============================================
-- Adds encryption support columns to members and practitioner_cases tables
-- for client name encryption functionality.

-- Add encryption key salt to members table
-- This is used to derive per-practitioner encryption keys
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS encryption_key_salt VARCHAR(128),
  ADD COLUMN IF NOT EXISTS encryption_key_version INTEGER DEFAULT 1;

-- Add key version tracking to practitioner_cases table
-- Allows for key rotation and migration tracking
ALTER TABLE practitioner_cases
  ADD COLUMN IF NOT EXISTS client_name_key_version INTEGER DEFAULT 1;

-- Add encryption salt to practitioners table for practitioner-specific encryption
ALTER TABLE practitioners
  ADD COLUMN IF NOT EXISTS encryption_key_salt VARCHAR(128),
  ADD COLUMN IF NOT EXISTS encryption_key_version INTEGER DEFAULT 1;

-- Function to generate encryption salt for new practitioners
CREATE OR REPLACE FUNCTION generate_encryption_salt()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a 64-character hex string (32 bytes)
  NEW.encryption_key_salt := encode(gen_random_bytes(32), 'hex');
  NEW.encryption_key_version := 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate encryption salt on practitioner creation
DROP TRIGGER IF EXISTS practitioner_encryption_salt_trigger ON practitioners;
CREATE TRIGGER practitioner_encryption_salt_trigger
  BEFORE INSERT ON practitioners
  FOR EACH ROW
  WHEN (NEW.encryption_key_salt IS NULL)
  EXECUTE FUNCTION generate_encryption_salt();

-- Backfill encryption salt for existing practitioners without one
UPDATE practitioners
SET encryption_key_salt = encode(gen_random_bytes(32), 'hex'),
    encryption_key_version = 1
WHERE encryption_key_salt IS NULL;

-- Index for faster lookups during key rotation
CREATE INDEX IF NOT EXISTS idx_practitioner_cases_key_version
  ON practitioner_cases(practitioner_id, client_name_key_version);

-- Comment on columns for documentation
COMMENT ON COLUMN practitioners.encryption_key_salt IS 'Salt used for deriving practitioner-specific encryption keys';
COMMENT ON COLUMN practitioners.encryption_key_version IS 'Current encryption key version for key rotation support';
COMMENT ON COLUMN practitioner_cases.client_name_key_version IS 'Version of encryption key used for this client name';
