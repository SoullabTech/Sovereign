-- CLASS A / DRAFT / DO NOT MERGE UNTIL EXPLICIT SCHEMA-DEPLOY APPROVAL.
-- New admin recovery lane is separate from legacy password_reset_tokens.
-- Only a SHA-256 digest of a 256-bit random token is stored, never the bearer.
-- The records also provide a durable actor/target/delivery/redeem witness.
BEGIN;
SET LOCAL lock_timeout = '5s';

-- RECOVERY-EMAIL-BINDING-01: no legacy email_verified boolean or historic
-- timestamp is automatically admitted for privileged password recovery.
-- Only an observed completion of a fresh email-verification token establishes
-- a recovery-specific proof. A changed address invalidates this proof before
-- subsequent reads; the old recovery token cannot be redeemed.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS recovery_email_verification_id uuid;

CREATE OR REPLACE FUNCTION guard_member_recovery_email_proof()
RETURNS trigger LANGUAGE plpgsql AS $
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    -- Refuse stale verification as soon as ANY writer changes an email.
    -- Also retire the verification token sent to the old address.
    NEW.email_verified := FALSE;
    NEW.email_verified_at := NULL;
    NEW.email_verification_token := NULL;
    NEW.email_verification_sent_at := NULL;
    NEW.recovery_email_verification_id := NULL;
  ELSIF NEW.email_verified IS DISTINCT FROM TRUE THEN
    NEW.recovery_email_verification_id := NULL;
  ELSIF OLD.email_verification_token IS NOT NULL
    AND NEW.email_verification_token IS NULL
    AND OLD.email_verification_sent_at IS NOT NULL
    AND OLD.email_verification_sent_at <= clock_timestamp()
    AND OLD.email_verification_sent_at > clock_timestamp() - interval '24 hours'
    AND NEW.email IS NOT NULL
    AND btrim(NEW.email) <> ''
  THEN
    -- Current address was confirmed with a fresh outstanding verification
    -- token. Never infer this proof from a pre-existing true boolean.
    NEW.recovery_email_verification_id := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$;

CREATE TRIGGER guard_member_recovery_email_proof_on_change
BEFORE UPDATE OF email, email_verified, email_verification_token ON members
FOR EACH ROW EXECUTE FUNCTION guard_member_recovery_email_proof();

CREATE TABLE IF NOT EXISTS admin_member_recovery_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Account erasure must not be blocked by short-lived recovery receipts.
  -- Deleting either target or issuer invalidates their recovery capabilities.
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  issued_by uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  -- Proof is a random UUID created by the current-address email verification
  -- trigger, not a member-supplied claim or the historical email_verified flag.
  email_verification_id uuid NOT NULL,
  token_hash char(64) NOT NULL UNIQUE,
  -- Email-only beta. Other delivery modes require a NEW reviewed migration.
  delivery_method text NOT NULL CHECK (delivery_method = 'email'),
  reason_code text NOT NULL CHECK (reason_code = 'member_requested'),
  delivery_status text NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'provider_accepted', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  redeemed_at timestamptz,
  revoked_at timestamptz,
  CHECK (expires_at > created_at),
  CHECK (redeemed_at IS NULL OR revoked_at IS NULL)
);
CREATE INDEX IF NOT EXISTS idx_admin_member_recovery_issuer_created
  ON admin_member_recovery_tokens(issued_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_member_recovery_member_active
  ON admin_member_recovery_tokens(member_id, expires_at DESC)
  WHERE redeemed_at IS NULL AND revoked_at IS NULL;

-- No verification attestation backfill: historical/legacy email_verified=true
-- is insufficient until that account re-verifies the CURRENT address.
-- Recovery issue and redemption MUST lock rows and change state transactionally.
-- Rollback if separately authorized: stop all issuance first, then
-- DROP TABLE admin_member_recovery_tokens; all unused links become invalid.
COMMIT;
