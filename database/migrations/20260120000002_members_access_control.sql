-- Add access control columns to members table
-- Supports tier-based and role-based access control

-- Tier column for subscription level
ALTER TABLE members ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'free';
COMMENT ON COLUMN members.tier IS 'Subscription tier: free, personal, pro';

-- Roles array for RBAC
ALTER TABLE members ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['member']::TEXT[];
COMMENT ON COLUMN members.roles IS 'User roles: member, practitioner, curator, steward, partner, admin';

-- Stripe integration columns
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Preferred name for personalization
ALTER TABLE members ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(255);

-- Indexes for access control lookups
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);
CREATE INDEX IF NOT EXISTS idx_members_stripe_customer_id ON members(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_members_stripe_subscription_id ON members(stripe_subscription_id);

-- GIN index for roles array queries
CREATE INDEX IF NOT EXISTS idx_members_roles ON members USING GIN(roles);
