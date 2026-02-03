-- Member Tiers: Free, Personal, Pro
-- See /docs/TIER_STRUCTURE.md for full definitions

-- Add tier column to members
ALTER TABLE members
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'personal', 'pro'));

-- Track when tier started (for billing/analytics)
ALTER TABLE members
ADD COLUMN IF NOT EXISTS tier_started_at TIMESTAMPTZ DEFAULT NOW();

-- Index for tier-based queries
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);

-- Comments for clarity
COMMENT ON COLUMN members.tier IS 'Membership tier: free (touch), personal (continuity), pro (stewardship)';
COMMENT ON COLUMN members.tier_started_at IS 'When current tier began (for billing cycles)';
