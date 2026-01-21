/**
 * TRUSTED COLLEAGUES - HARDENING V2 (Lawyer Read Fixes)
 *
 * Closes remaining loopholes from adversarial audit:
 * 1. Seal on ANY transition away from accepted (not just blocked)
 * 2. Identity NULL whenever client_name_shared=false (closes latent identity leak)
 * 3. INSERT trigger for consent sanitization
 * 4. Routing immutability (connection_id, from/to practitioner)
 * 5. Allow requester_note edits (it's a private scratchpad)
 * 6. Physics-grade CHECK constraint
 * 7. Safe view for defense-in-depth
 *
 * "The DB must be true even if app code is buggy."
 */

-- ============================================
-- 1. SEAL ON ANY TRANSITION AWAY FROM ACCEPTED
-- ============================================

-- Replace the trigger function to seal on accepted -> anything-else
CREATE OR REPLACE FUNCTION seal_referrals_on_connection_break()
RETURNS TRIGGER AS $$
BEGIN
  -- UPDATE: If connection was accepted and is now anything else, seal referrals
  IF TG_OP = 'UPDATE'
     AND OLD.status = 'accepted'
     AND NEW.status IS DISTINCT FROM 'accepted'
  THEN
    UPDATE referral_requests
    SET
      sealed_at = NOW(),
      sealed_reason = 'connection_' || NEW.status,
      -- Redact identity even if it was shared
      client_name = NULL,
      client_contact = NULL,
      client_name_shared = false,
      client_consent_given = false
    WHERE connection_id = NEW.id
      AND sealed_at IS NULL;
  END IF;

  -- DELETE: Seal all referrals for this connection
  IF TG_OP = 'DELETE' THEN
    UPDATE referral_requests
    SET
      sealed_at = NOW(),
      sealed_reason = 'connection_deleted',
      client_name = NULL,
      client_contact = NULL,
      client_name_shared = false,
      client_consent_given = false
    WHERE connection_id = OLD.id
      AND sealed_at IS NULL;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. IDENTITY NULL WHENEVER NOT SHARED
-- ============================================

-- Rename function to reflect its broader purpose
CREATE OR REPLACE FUNCTION sanitize_consent_state()
RETURNS TRIGGER AS $$
BEGIN
  -- PHYSICS RULE: If name is not shared, identity MUST NOT exist
  -- This closes the "consent true but not shared, name stored anyway" leak
  IF NEW.client_name_shared = false OR NEW.client_name_shared IS NULL THEN
    NEW.client_name := NULL;
    NEW.client_contact := NULL;
  END IF;

  -- PHYSICS RULE: name_shared requires consent_given
  IF NEW.client_name_shared = true AND (NEW.client_consent_given = false OR NEW.client_consent_given IS NULL) THEN
    NEW.client_name_shared := false;
    NEW.client_name := NULL;
    NEW.client_contact := NULL;
  END IF;

  -- If consent is being revoked, clear everything
  IF TG_OP = 'UPDATE' AND OLD.client_consent_given = true AND NEW.client_consent_given = false THEN
    NEW.client_name_shared := false;
    NEW.consent_recorded_at := NULL;
    -- client_name and client_contact already NULLed above
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger and create for both INSERT and UPDATE
DROP TRIGGER IF EXISTS trg_enforce_consent_revocation ON referral_requests;
DROP TRIGGER IF EXISTS trg_sanitize_consent_state_upd ON referral_requests;
DROP TRIGGER IF EXISTS trg_sanitize_consent_state_ins ON referral_requests;

CREATE TRIGGER trg_sanitize_consent_state_ins
  BEFORE INSERT ON referral_requests
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_consent_state();

CREATE TRIGGER trg_sanitize_consent_state_upd
  BEFORE UPDATE ON referral_requests
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_consent_state();

-- ============================================
-- 3. ROUTING + CONTENT IMMUTABILITY
-- ============================================

-- Replace the trigger function with proper allowlist
CREATE OR REPLACE FUNCTION prevent_edit_after_send()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply to referrals that have been sent (not draft)
  IF OLD.status <> 'draft' THEN

    -- NEVER allow routing changes after send
    IF NEW.connection_id IS DISTINCT FROM OLD.connection_id
       OR NEW.from_practitioner_id IS DISTINCT FROM OLD.from_practitioner_id
       OR NEW.to_practitioner_id IS DISTINCT FROM OLD.to_practitioner_id
    THEN
      RAISE EXCEPTION 'Cannot modify referral routing after sending';
    END IF;

    -- NEVER allow content field changes after send
    -- (requester_note is private scratchpad - allowed to change)
    IF NEW.client_age_range IS DISTINCT FROM OLD.client_age_range
       OR NEW.client_pronouns IS DISTINCT FROM OLD.client_pronouns
       OR NEW.presenting_themes IS DISTINCT FROM OLD.presenting_themes
       OR NEW.urgency IS DISTINCT FROM OLD.urgency
       OR NEW.constraints IS DISTINCT FROM OLD.constraints
    THEN
      RAISE EXCEPTION 'Cannot modify referral content after sending';
    END IF;

    -- Note: These are ALLOWED after send:
    -- - status (for transitions: sent -> received -> accepted/declined -> closed)
    -- - timestamps (sent_at, viewed_at, responded_at)
    -- - requester_note (private to requester, can update their own notes)
    -- - recipient_note (private to recipient, can update their own notes)
    -- - consent fields (controlled by sanitize_consent_state trigger)
    -- - sealed_at, sealed_reason (controlled by seal trigger)

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. PHYSICS-GRADE CHECK CONSTRAINT
-- ============================================

-- Drop old constraint
ALTER TABLE referral_requests
  DROP CONSTRAINT IF EXISTS consent_required_for_identity;

-- New constraint: identity exists ONLY when shared
-- This is the "laws of physics" version
ALTER TABLE referral_requests
  ADD CONSTRAINT consent_required_for_identity CHECK (
    -- Rule 1: name_shared requires consent_given
    (client_name_shared = false OR client_consent_given = true)
    AND
    -- Rule 2: identity fields exist ONLY when BOTH flags are true
    (
      (client_name_shared = true AND client_consent_given = true)
      OR
      (client_name IS NULL AND client_contact IS NULL)
    )
  );

-- ============================================
-- 5. SAFE VIEW (DEFENSE IN DEPTH)
-- ============================================

-- Force all reads through this view for maximum safety
-- Even if someone writes a naive query, the default path is safe
CREATE OR REPLACE VIEW safe_referral_requests AS
SELECT rr.*
FROM referral_requests rr
JOIN practitioner_connections pc ON pc.id = rr.connection_id
WHERE rr.sealed_at IS NULL
  AND pc.status = 'accepted';

COMMENT ON VIEW safe_referral_requests IS
  'Defense-in-depth view: only unsealed referrals with active accepted connections. '
  'Use this for inbox/sent queries instead of raw referral_requests table.';

-- ============================================
-- UPDATED COMMENTS
-- ============================================

COMMENT ON FUNCTION seal_referrals_on_connection_break() IS
  'Seals referrals when connection leaves accepted state (blocked, declined, deleted). '
  'Sealed referrals have identity redacted and become inaccessible.';

COMMENT ON FUNCTION sanitize_consent_state() IS
  'Enforces physics rule: identity fields are NULL unless client_name_shared=true AND client_consent_given=true. '
  'Fires on both INSERT and UPDATE.';

COMMENT ON FUNCTION prevent_edit_after_send() IS
  'Prevents mutation of routing and content fields after referral is sent. '
  'Allows: status transitions, timestamps, notes (private to owner), consent (via sanitizer).';
