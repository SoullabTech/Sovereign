-- ============================================
-- CLIENT SUBSCRIPTIONS MIGRATION
-- ============================================
-- Adds tables for practitioner tier pricing and client subscriptions
-- Enables the client checkout/subscription flow with Stripe Connect.

-- Practitioner tier pricing configuration
-- Each practitioner can configure their own pricing for subscriber/vip tiers
CREATE TABLE IF NOT EXISTS practitioner_tier_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('subscriber', 'vip')),
  monthly_price_cents INTEGER NOT NULL CHECK (monthly_price_cents >= 0),
  annual_price_cents INTEGER CHECK (annual_price_cents >= 0),
  name VARCHAR(100),
  description TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practitioner_id, tier)
);

-- Client subscription tracking
-- Tracks active subscriptions from clients to practitioners
CREATE TABLE IF NOT EXISTS client_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('subscriber', 'vip')),
  billing_interval VARCHAR(10) NOT NULL CHECK (billing_interval IN ('monthly', 'annual')),
  price_cents INTEGER NOT NULL,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'paused', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add client tier column to practitioner_clients if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioner_clients'
    AND column_name = 'tier'
  ) THEN
    ALTER TABLE practitioner_clients
    ADD COLUMN tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'subscriber', 'vip'));
  END IF;
END $$;

-- Add Stripe Connect fields to practitioners table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practitioners'
    AND column_name = 'stripe_connect_id'
  ) THEN
    ALTER TABLE practitioners
    ADD COLUMN stripe_connect_id VARCHAR(255),
    ADD COLUMN stripe_connect_enabled BOOLEAN DEFAULT false,
    ADD COLUMN stripe_connect_onboarded_at TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_practitioner_tier_pricing_practitioner
  ON practitioner_tier_pricing(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_client_subscriptions_client
  ON client_subscriptions(client_id);

CREATE INDEX IF NOT EXISTS idx_client_subscriptions_practitioner
  ON client_subscriptions(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_client_subscriptions_stripe
  ON client_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_client_subscriptions_status
  ON client_subscriptions(practitioner_id, status);

-- Trigger to update updated_at on tier pricing changes
CREATE OR REPLACE FUNCTION update_tier_pricing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tier_pricing_updated_at ON practitioner_tier_pricing;
CREATE TRIGGER tier_pricing_updated_at
  BEFORE UPDATE ON practitioner_tier_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_tier_pricing_timestamp();

-- Trigger to update updated_at on subscription changes
DROP TRIGGER IF EXISTS client_subscription_updated_at ON client_subscriptions;
CREATE TRIGGER client_subscription_updated_at
  BEFORE UPDATE ON client_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_tier_pricing_timestamp();

-- Comments for documentation
COMMENT ON TABLE practitioner_tier_pricing IS 'Practitioner-specific pricing for subscriber and VIP tiers';
COMMENT ON TABLE client_subscriptions IS 'Client subscriptions to practitioner services via Stripe Connect';
COMMENT ON COLUMN client_subscriptions.price_cents IS 'Price at time of subscription (may differ from current tier pricing)';
COMMENT ON COLUMN practitioners.stripe_connect_id IS 'Stripe Connect account ID for receiving payments';
