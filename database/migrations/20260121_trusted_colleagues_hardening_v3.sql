/**
 * TRUSTED COLLEAGUES - HARDENING V3 (Physics-Grade CHECK)
 *
 * Tightens the CHECK constraint to enforce:
 * - If shared: name MUST exist (NOT NULL)
 * - If not shared: name and contact MUST be NULL
 *
 * Two allowed worlds, nothing in between.
 */

-- Only execute if referral_requests table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referral_requests') THEN
    -- Drop the v2 constraint
    ALTER TABLE referral_requests
      DROP CONSTRAINT IF EXISTS consent_required_for_identity;

    -- Physics-grade CHECK: exactly two valid states
    -- World 1: Shared (both flags true, name required)
    -- World 2: Not shared (name_shared false, identity NULL)
    ALTER TABLE referral_requests
      ADD CONSTRAINT consent_required_for_identity CHECK (
        (
          -- World 1: Identity is shared
          client_name_shared = true
          AND client_consent_given = true
          AND client_name IS NOT NULL
        )
        OR
        (
          -- World 2: Identity is not shared (must be NULL)
          client_name_shared = false
          AND client_name IS NULL
          AND client_contact IS NULL
        )
      );

    COMMENT ON CONSTRAINT consent_required_for_identity ON referral_requests IS
      'Physics-grade constraint: exactly two valid states. '
      'World 1: shared (both flags true, name NOT NULL). '
      'World 2: not shared (name_shared false, identity NULL). '
      'No ambiguous states allowed.';
  END IF;
END $$;
