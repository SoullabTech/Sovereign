-- Add email verification columns to members table
-- Used post-beta when email verification is enforced

ALTER TABLE members
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

ALTER TABLE members
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);

ALTER TABLE members
ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMPTZ;

-- Index for token lookups during verification
CREATE INDEX IF NOT EXISTS idx_members_email_verification_token
ON members(email_verification_token)
WHERE email_verification_token IS NOT NULL;

COMMENT ON COLUMN members.email_verified IS 'True when email has been verified via link';
COMMENT ON COLUMN members.email_verification_token IS 'Token sent in verification email';
COMMENT ON COLUMN members.email_verification_sent_at IS 'When verification email was last sent';
