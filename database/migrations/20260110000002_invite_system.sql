-- Invite System Migration
-- Enables member-to-member invitations with tracking and limits

-- Add invite-related columns to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES members(id),
ADD COLUMN IF NOT EXISTS invites_remaining INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS can_invite_after TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invite_tier VARCHAR(50) DEFAULT 'standard';

-- Create invites table to track all generated invites
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The passkey generated for this invite
  passkey VARCHAR(255) UNIQUE NOT NULL,

  -- Who created this invite
  created_by UUID NOT NULL REFERENCES members(id),

  -- Optional: who the invite is intended for (for tracking)
  intended_name VARCHAR(255),
  intended_email VARCHAR(255),

  -- Who actually used this invite (filled when redeemed)
  redeemed_by UUID REFERENCES members(id),
  redeemed_at TIMESTAMPTZ,

  -- Status: pending, redeemed, expired, revoked
  status VARCHAR(50) DEFAULT 'pending',

  -- Expiration (30 days from creation by default)
  expires_at TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Optional note from inviter
  personal_note TEXT
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON invites(created_by);
CREATE INDEX IF NOT EXISTS idx_invites_passkey ON invites(passkey);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_members_invited_by ON members(invited_by);

-- Comments for documentation
COMMENT ON COLUMN members.invited_by IS 'UUID of the member who invited this person';
COMMENT ON COLUMN members.invites_remaining IS 'Number of invites this member can still create';
COMMENT ON COLUMN members.can_invite_after IS 'Date after which this member can start inviting (cooling period)';
COMMENT ON COLUMN members.invite_tier IS 'Invite tier: founding (unlimited), standard (10), earned (bonus invites)';

COMMENT ON TABLE invites IS 'Tracks all invitations created by members';
COMMENT ON COLUMN invites.passkey IS 'The SOULLAB-XXX passkey for this invite';
COMMENT ON COLUMN invites.intended_name IS 'Name of intended recipient (optional, for tracking)';
COMMENT ON COLUMN invites.status IS 'pending: available, redeemed: used, expired: past expiry, revoked: cancelled';

-- Function to auto-expire invites
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
  UPDATE invites
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant founding members (existing beta testers) unlimited invites
-- Run this after migration to upgrade existing members
-- UPDATE members SET invite_tier = 'founding', invites_remaining = 100 WHERE created_at < '2026-01-15';
