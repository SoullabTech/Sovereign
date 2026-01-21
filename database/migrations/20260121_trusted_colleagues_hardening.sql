/**
 * TRUSTED COLLEAGUES - HARDENING
 *
 * Adversarial QA fixes:
 * 1. Sealed referrals when connection breaks
 * 2. Destructive identity revocation
 * 3. Stronger consent CHECK constraints
 *
 * "The DB must be true even if app code is buggy."
 */

-- ============================================
-- 1. SEAL COLUMNS FOR REFERRALS
-- ============================================

-- Add sealing columns to referrals
ALTER TABLE referral_requests
  ADD COLUMN IF NOT EXISTS sealed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sealed_reason TEXT;

-- Index for filtering out sealed referrals
CREATE INDEX IF NOT EXISTS idx_referrals_sealed
  ON referral_requests(sealed_at) WHERE sealed_at IS NULL;

-- ============================================
-- 2. TRIGGER: SEAL REFERRALS ON CONNECTION BREAK
-- ============================================

-- When a connection is blocked or deleted, seal all referrals between the pair
-- and redact any shared identity
CREATE OR REPLACE FUNCTION seal_referrals_on_connection_break()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to blocked
  IF TG_OP = 'UPDATE' AND NEW.status = 'blocked' AND OLD.status != 'blocked' THEN
    UPDATE referral_requests
    SET
      sealed_at = NOW(),
      sealed_reason = 'connection_blocked',
      -- Redact identity even if it was shared
      client_name = NULL,
      client_contact = NULL,
      client_name_shared = false
    WHERE connection_id = NEW.id
      AND sealed_at IS NULL;
  END IF;

  -- If connection is being deleted
  IF TG_OP = 'DELETE' THEN
    UPDATE referral_requests
    SET
      sealed_at = NOW(),
      sealed_reason = 'connection_deleted',
      client_name = NULL,
      client_contact = NULL,
      client_name_shared = false
    WHERE connection_id = OLD.id
      AND sealed_at IS NULL;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS trg_seal_referrals_on_connection_break ON practitioner_connections;
CREATE TRIGGER trg_seal_referrals_on_connection_break
  AFTER UPDATE OR DELETE ON practitioner_connections
  FOR EACH ROW
  EXECUTE FUNCTION seal_referrals_on_connection_break();

-- ============================================
-- 3. TRIGGER: DESTRUCTIVE IDENTITY REVOCATION
-- ============================================

-- When consent is revoked, immediately NULL the identity fields
-- This ensures revocation is destructive, not just a flag flip
CREATE OR REPLACE FUNCTION enforce_consent_revocation()
RETURNS TRIGGER AS $$
BEGIN
  -- If consent is being revoked (was true, now false)
  IF OLD.client_consent_given = true AND NEW.client_consent_given = false THEN
    NEW.client_name := NULL;
    NEW.client_contact := NULL;
    NEW.client_name_shared := false;
    NEW.consent_recorded_at := NULL;
  END IF;

  -- If name sharing is being revoked (was true, now false)
  IF OLD.client_name_shared = true AND NEW.client_name_shared = false THEN
    NEW.client_name := NULL;
    NEW.client_contact := NULL;
  END IF;

  -- Enforce: name_shared requires consent
  IF NEW.client_name_shared = true AND NEW.client_consent_given = false THEN
    NEW.client_name_shared := false;
    NEW.client_name := NULL;
    NEW.client_contact := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS trg_enforce_consent_revocation ON referral_requests;
CREATE TRIGGER trg_enforce_consent_revocation
  BEFORE UPDATE ON referral_requests
  FOR EACH ROW
  EXECUTE FUNCTION enforce_consent_revocation();

-- ============================================
-- 4. STRONGER CHECK CONSTRAINTS
-- ============================================

-- Drop the old constraint and add a more comprehensive one
ALTER TABLE referral_requests
  DROP CONSTRAINT IF EXISTS consent_required_for_identity;

-- New constraint covers all invalid states:
-- 1. client_name_shared=true requires client_consent_given=true
-- 2. client_name or client_contact requires BOTH consent flags true
-- 3. sealed referrals cannot have identity (enforced by sealing trigger)
ALTER TABLE referral_requests
  ADD CONSTRAINT consent_required_for_identity CHECK (
    -- Rule: name_shared requires consent_given
    (client_name_shared = false OR client_consent_given = true)
    AND
    -- Rule: identity fields require both flags true
    (
      (client_consent_given = true AND client_name_shared = true)
      OR (client_name IS NULL AND client_contact IS NULL)
    )
  );

-- ============================================
-- 5. PREVENT EDIT-AFTER-SEND
-- ============================================

-- Trigger to prevent mutation of content fields after send
CREATE OR REPLACE FUNCTION prevent_edit_after_send()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply to referrals that have been sent
  IF OLD.status NOT IN ('draft') THEN
    -- Prevent changes to content fields
    IF NEW.client_age_range IS DISTINCT FROM OLD.client_age_range
       OR NEW.client_pronouns IS DISTINCT FROM OLD.client_pronouns
       OR NEW.presenting_themes IS DISTINCT FROM OLD.presenting_themes
       OR NEW.urgency IS DISTINCT FROM OLD.urgency
       OR NEW.constraints IS DISTINCT FROM OLD.constraints
       OR NEW.requester_note IS DISTINCT FROM OLD.requester_note THEN
      RAISE EXCEPTION 'Cannot modify referral content after sending';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS trg_prevent_edit_after_send ON referral_requests;
CREATE TRIGGER trg_prevent_edit_after_send
  BEFORE UPDATE ON referral_requests
  FOR EACH ROW
  EXECUTE FUNCTION prevent_edit_after_send();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN referral_requests.sealed_at IS 'Set when connection breaks. Sealed referrals are read-only and redacted.';
COMMENT ON COLUMN referral_requests.sealed_reason IS 'Why the referral was sealed: connection_blocked, connection_deleted';
COMMENT ON TRIGGER trg_seal_referrals_on_connection_break ON practitioner_connections IS 'Seals referrals when connection is blocked/deleted';
COMMENT ON TRIGGER trg_enforce_consent_revocation ON referral_requests IS 'Destructively clears identity when consent is revoked';
COMMENT ON TRIGGER trg_prevent_edit_after_send ON referral_requests IS 'Prevents content mutation after referral is sent';
