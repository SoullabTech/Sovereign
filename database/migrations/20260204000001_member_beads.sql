-- Add beads tracking to members table
-- Each member gets beads they can share with friends

-- Add beads_remaining column to members
ALTER TABLE members
ADD COLUMN IF NOT EXISTS beads_remaining INTEGER DEFAULT 10;

-- Add gifter_member_id to gift_passkeys to track which member sent the bead
ALTER TABLE gift_passkeys
ADD COLUMN IF NOT EXISTS gifter_member_id UUID REFERENCES members(id);

-- Index for finding beads sent by a specific member
CREATE INDEX IF NOT EXISTS idx_gift_passkeys_gifter_member
ON gift_passkeys(gifter_member_id);

COMMENT ON COLUMN members.beads_remaining IS 'Number of beads (gift invitations) this member can still send';
COMMENT ON COLUMN gift_passkeys.gifter_member_id IS 'Member who sent this gift (for member-initiated beads)';
