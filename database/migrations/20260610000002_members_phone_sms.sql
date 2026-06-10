-- ============================================================================
-- Member phone + SMS consent columns — groundwork for Co-lab SMS notifications.
-- ============================================================================
-- Directive (Kelly, 2026-06-10): add SMS as an ALERT-ONLY notification channel
-- for Co-lab. No conversation content ever rides an SMS; no inbound SMS replies.
-- This is the same delivery-channel category as email-via-Resend — a third-party
-- transport that sees "you have a message" + a contact handle, never the thread.
--
-- SMS is OPT-IN by construction:
--   * member_notification_preferences default for channel 'sms' is FALSE (code).
--   * a number must be VERIFIED (Twilio Verify OTP) before it can receive sends.
--   * sms_consent_at records the explicit opt-in timestamp (TCPA hygiene).
--
-- These columns are additive + nullable/defaulted → safe to apply with zero
-- downtime. They stay dormant until SMS_NOTIFICATIONS_ENABLED + Twilio creds are
-- set (see lib/sms/config.ts). Nothing reads them for delivery until then.
-- ============================================================================

ALTER TABLE members ADD COLUMN IF NOT EXISTS phone             TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone_verified    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
ALTER TABLE members ADD COLUMN IF NOT EXISTS sms_consent_at    TIMESTAMPTZ;

COMMENT ON COLUMN members.phone IS
  'E.164 phone number (e.g. +16172165533). Stored once the member submits it; NOT trusted for SMS until phone_verified = true.';
COMMENT ON COLUMN members.phone_verified IS
  'True only after a successful Twilio Verify OTP check. SMS notifications send only to verified numbers.';
COMMENT ON COLUMN members.phone_verified_at IS
  'Timestamp of successful phone verification.';
COMMENT ON COLUMN members.sms_consent_at IS
  'Explicit SMS opt-in timestamp (recorded at verification). Cleared when the member removes their phone / opts out.';
