-- Migration: Additional auth-related columns on members table
-- Purpose: Track auth methods and password algorithm for migration

-- Password algorithm tracking (for SHA256 -> bcrypt migration)
ALTER TABLE members ADD COLUMN IF NOT EXISTS password_algo VARCHAR(20) DEFAULT 'sha256';

-- Email verification status
ALTER TABLE members ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Preferred authentication method
ALTER TABLE members ADD COLUMN IF NOT EXISTS preferred_auth_method VARCHAR(20) DEFAULT 'password';
-- Values: 'password', 'webauthn', 'oauth_google', 'oauth_apple', 'magic_link'

-- Auth method flags (for quick checks)
ALTER TABLE members ADD COLUMN IF NOT EXISTS has_webauthn BOOLEAN DEFAULT FALSE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS has_oauth BOOLEAN DEFAULT FALSE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50); -- 'google', 'apple', etc.
ALTER TABLE members ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255); -- Provider's user ID

-- Security tracking
ALTER TABLE members ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
ALTER TABLE members ADD COLUMN IF NOT EXISTS failed_sign_in_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_failed_sign_in_at TIMESTAMPTZ;

-- Index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_members_oauth ON members(oauth_provider, oauth_id)
WHERE oauth_provider IS NOT NULL;

-- Comment updates
COMMENT ON COLUMN members.password_algo IS 'Password hashing algorithm: sha256 (legacy) or bcrypt (new)';
COMMENT ON COLUMN members.preferred_auth_method IS 'User preferred sign-in method: password, webauthn, oauth_google, oauth_apple, magic_link';
COMMENT ON COLUMN members.has_webauthn IS 'Whether user has registered a WebAuthn credential (passkey/biometric)';
