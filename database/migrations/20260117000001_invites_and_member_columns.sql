-- Invites table and missing member columns for robust beta onboarding
-- Ensures registration works reliably for all testers

-- =============================================================================
-- INVITES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passkey VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'expired', 'revoked')),
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  redeemed_by UUID REFERENCES members(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invites_passkey ON invites(passkey);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON invites(created_by);

COMMENT ON TABLE invites IS 'Invite passkeys for member onboarding';
COMMENT ON COLUMN invites.status IS E'State machine (monotonic, terminal states cannot transition):\n  pending → redeemed (exactly-once, sets redeemed_by + redeemed_at)\n  pending → revoked  (idempotent, manual disable)\n  pending → expired  (conditional, time-based)\nAll transitions require WHERE status=''pending'' to prevent overwrites.';

-- Invariant: redeemed status must have redemption metadata
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_redeemed_metadata;
ALTER TABLE invites ADD CONSTRAINT invites_redeemed_metadata
  CHECK (status != 'redeemed' OR (redeemed_at IS NOT NULL AND redeemed_by IS NOT NULL));

-- =============================================================================
-- ADD MISSING COLUMNS TO MEMBERS TABLE
-- =============================================================================

-- Add preferred_name if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'preferred_name') THEN
    ALTER TABLE members ADD COLUMN preferred_name VARCHAR(255);
  END IF;
END $$;

-- Add invited_by if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'invited_by') THEN
    ALTER TABLE members ADD COLUMN invited_by UUID REFERENCES members(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add invites_remaining if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'invites_remaining') THEN
    ALTER TABLE members ADD COLUMN invites_remaining INTEGER DEFAULT 3;
  END IF;
END $$;

-- Add can_invite_after if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'can_invite_after') THEN
    ALTER TABLE members ADD COLUMN can_invite_after TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add invite_tier if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'invite_tier') THEN
    ALTER TABLE members ADD COLUMN invite_tier VARCHAR(20) DEFAULT 'standard' CHECK (invite_tier IN ('founding', 'standard', 'invited'));
  END IF;
END $$;

-- =============================================================================
-- NOTE: Seed data removed from migration (seeds belong in separate seed.sql)
-- Admin passkeys (SOULLAB-*) are validated by prefix in register route,
-- not by invite table lookup. See isAdminPasskey() in register/route.ts.
-- =============================================================================
