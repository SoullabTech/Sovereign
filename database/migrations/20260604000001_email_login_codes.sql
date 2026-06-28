-- Email one-time login codes (MAIA auth: code-primary, 2026-06-04)
--
-- Codes reuse the magic_link_tokens table so that register-email's
-- "recently verified email" check continues to work unchanged. Adding the
-- columns here keeps fresh databases in sync; the email-code request route
-- also adds them on the fly (ADD COLUMN IF NOT EXISTS) for resilience.

ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS code VARCHAR(6);
ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;
-- Heal older tables that predate used_at (the magic-link route records it).
ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Fast lookup of the latest live code for an email during verification.
CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_email_live
  ON magic_link_tokens (email, used, expires_at);
