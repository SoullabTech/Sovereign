-- CLASS A / DRAFT / DO NOT MERGE UNTIL EXPLICIT SCHEMA-DEPLOY APPROVAL.
-- New admin recovery lane is separate from legacy password_reset_tokens.
-- Only a SHA-256 digest of a 256-bit random token is stored, never the bearer.
-- The records also provide a durable actor/target/delivery/redeem witness.
CREATE TABLE IF NOT EXISTS admin_member_recovery_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  issued_by uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  token_hash char(64) NOT NULL UNIQUE,
  delivery_method text NOT NULL CHECK (delivery_method IN ('email', 'private_handoff')),
  reason_code text NOT NULL CHECK (reason_code IN ('member_requested', 'email_unavailable', 'verified_in_person')),
  delivery_status text NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'provider_accepted', 'handoff_issued', 'failed')),
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

-- Recovery issue and redemption MUST lock rows and change state transactionally.
-- Rollback if separately authorized: stop all issuance first, then
-- DROP TABLE admin_member_recovery_tokens; all unused links become invalid.
