-- Add profile_data column to oauth_accounts
-- Stores additional profile info from OAuth providers (name, picture, etc.)

ALTER TABLE oauth_accounts
ADD COLUMN IF NOT EXISTS profile_data JSONB;

COMMENT ON COLUMN oauth_accounts.profile_data IS 'Additional profile data from OAuth provider (name, picture, etc.)';
