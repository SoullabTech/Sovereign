-- ============================================
-- Migration: Practitioner Tiers
-- ============================================
-- Adds tier-related columns to the members table for the pricing system.
--
-- Tiers:
-- - Free: Personal growth (no practitioner status)
-- - Supporter: $9/mo (no practitioner status)
-- - Earn: 3% per booking (practitioner)
-- - Studio: $35/mo flat (practitioner)

-- Add practitioner tier to members
ALTER TABLE members
ADD COLUMN IF NOT EXISTS practitioner_tier VARCHAR(20) DEFAULT NULL
CHECK (practitioner_tier IS NULL OR practitioner_tier IN ('earn', 'studio'));

COMMENT ON COLUMN members.practitioner_tier IS 'Practitioner pricing tier: earn (3% per booking) or studio ($35/mo)';

-- Add supporter since date (when they started paying $9/mo)
ALTER TABLE members
ADD COLUMN IF NOT EXISTS supporter_since TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN members.supporter_since IS 'Date member became a Supporter ($9/mo)';

-- Add Stripe fields for subscription management
ALTER TABLE members
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) DEFAULT NULL;

ALTER TABLE members
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) DEFAULT NULL;

-- Index for finding members by tier
CREATE INDEX IF NOT EXISTS idx_members_practitioner_tier
ON members(practitioner_tier)
WHERE practitioner_tier IS NOT NULL;

-- Index for finding supporters
CREATE INDEX IF NOT EXISTS idx_members_supporter
ON members(supporter_since)
WHERE supporter_since IS NOT NULL;
