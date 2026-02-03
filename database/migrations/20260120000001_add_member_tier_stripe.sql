-- Add membership tier and Stripe subscription columns to members table
-- Part of the tier system integration (TIER_STRUCTURE.md)

-- Add tier column with canonical values: free, personal, pro
ALTER TABLE members ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'free';

-- Add Stripe integration columns
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Add constraint to ensure valid tier values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_tier_check'
  ) THEN
    ALTER TABLE members ADD CONSTRAINT members_tier_check
      CHECK (tier IN ('free', 'personal', 'pro'));
  END IF;
END $$;

-- Index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_members_stripe_customer ON members(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_members_stripe_subscription ON members(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Index for tier-based queries
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);

-- Index for active subscriptions (for renewal reminders)
CREATE INDEX IF NOT EXISTS idx_members_subscription_active ON members(subscription_active, subscription_expires_at)
  WHERE subscription_active = true;

-- Comments for clarity
COMMENT ON COLUMN members.tier IS 'Membership tier: free, personal, or pro (canonical names)';
COMMENT ON COLUMN members.stripe_customer_id IS 'Stripe customer ID for payment management';
COMMENT ON COLUMN members.stripe_subscription_id IS 'Stripe subscription ID for recurring billing';
COMMENT ON COLUMN members.subscription_active IS 'Whether subscription is currently active';
COMMENT ON COLUMN members.subscription_expires_at IS 'When current subscription period ends';
