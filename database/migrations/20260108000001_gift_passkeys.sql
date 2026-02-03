-- Gift passkeys tracking table
-- Allows Kelly to create and track gifted passkeys

CREATE TABLE IF NOT EXISTS gift_passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passkey VARCHAR(255) UNIQUE NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  gifter_name VARCHAR(255),  -- Who gifted this (optional)
  gifter_email VARCHAR(255), -- Gifter's email (optional)
  personal_message TEXT,      -- Optional personal note
  email_sent_at TIMESTAMPTZ,  -- When invite email was sent
  redeemed_at TIMESTAMPTZ,    -- When passkey was used to register
  redeemed_by_member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for passkey lookups
CREATE INDEX IF NOT EXISTS idx_gift_passkeys_passkey ON gift_passkeys(passkey);

-- Index for finding unredeemed gifts
CREATE INDEX IF NOT EXISTS idx_gift_passkeys_unredeemed ON gift_passkeys(redeemed_at) WHERE redeemed_at IS NULL;

COMMENT ON TABLE gift_passkeys IS 'Tracks gifted passkeys for organic growth';
COMMENT ON COLUMN gift_passkeys.gifter_name IS 'Name of person who gifted (for email personalization)';
