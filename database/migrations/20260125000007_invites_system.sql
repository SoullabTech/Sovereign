-- Invites System: Organic Growth Through Relationship
-- MAIA spreads through trust, not advertising. Each member can gift beads.

-- Invite codes table
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The invite code itself
  passkey VARCHAR(50) NOT NULL UNIQUE,

  -- Status lifecycle
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'revoked')),

  -- Who created and for whom
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  intended_name VARCHAR(100),           -- Optional: "For Sarah" etc.
  intended_email VARCHAR(255),          -- Optional: can pre-fill

  -- Timing
  expires_at TIMESTAMPTZ,               -- NULL = never expires
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES members(id) ON DELETE SET NULL,

  -- Blessing (required for organic invites)
  blessing_text TEXT,                   -- Required: "Why I'm inviting you to MAIA"
  personal_note TEXT,                   -- Optional private note: "Met at meditation retreat"

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Bead tier (for organic growth tracking)
  bead_tier VARCHAR(20) DEFAULT 'seed' CHECK (bead_tier IN ('seed', 'root', 'heart', 'crown'))
);

-- Indexes for invites
CREATE INDEX IF NOT EXISTS idx_invites_passkey ON invites(passkey);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON invites(created_by);
CREATE INDEX IF NOT EXISTS idx_invites_redeemed_by ON invites(redeemed_by);

-- Waitlist table (for those without invites)
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(50) DEFAULT 'landing',  -- Where they found us

  -- When they get invited
  invited_at TIMESTAMPTZ,
  invited_by UUID REFERENCES members(id) ON DELETE SET NULL,
  invite_id UUID REFERENCES invites(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_uninvited ON waitlist(invited_at) WHERE invited_at IS NULL;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON invites TO soullab;
GRANT SELECT, INSERT, UPDATE ON waitlist TO soullab;

-- Comments
COMMENT ON TABLE invites IS 'Organic invite codes - MAIA spreads through relationship, not ads';
COMMENT ON COLUMN invites.passkey IS 'The actual invite code users enter (e.g., MAIA-7ABC2D)';
COMMENT ON COLUMN invites.bead_tier IS 'Seed=regular, Root=referred 5+, Heart=referred 25+, Crown=founding';
COMMENT ON TABLE waitlist IS 'Those waiting for a bead - when a door opens, they will know';
