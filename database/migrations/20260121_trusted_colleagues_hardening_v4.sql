/**
 * TRUSTED COLLEAGUES - HARDENING V4 (Whitespace Rejection)
 *
 * Prevents whitespace-only names from passing the CHECK.
 * Belt and suspenders: library already rejects, DB now also rejects.
 */

-- Only execute if referral_requests table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referral_requests') THEN
    -- Drop the v3 constraint
    ALTER TABLE referral_requests
      DROP CONSTRAINT IF EXISTS consent_required_for_identity;

    -- Physics-grade CHECK with whitespace rejection
    ALTER TABLE referral_requests
      ADD CONSTRAINT consent_required_for_identity CHECK (
        (
          -- World 1: Identity is shared (name must be non-empty after trim)
          client_name_shared = true
          AND client_consent_given = true
          AND client_name IS NOT NULL
          AND length(btrim(client_name)) > 0
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
      'Physics-grade constraint with whitespace rejection. '
      'World 1: shared (both flags true, name NOT NULL and non-empty). '
      'World 2: not shared (name_shared false, identity NULL). '
      'No ambiguous states, no whitespace-only names.';
  END IF;
END $$;
