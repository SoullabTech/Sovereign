-- Member Contributions (Sustaining Circle)
-- Tracks Stripe subscriptions and one-time payments
-- Philosophy: "Consciousness shouldn't be paywalled" - contributions are gratitude, not access control

CREATE TABLE IF NOT EXISTS member_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,

  -- Contribution tier: sustainer, guardian, elder, founder, seva
  tier VARCHAR(50) NOT NULL,

  -- Stripe references (null for seva tier which has no payment)
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),

  -- For sustainer's sliding scale
  amount_cents INTEGER,
  currency VARCHAR(10) DEFAULT 'usd',

  -- Subscription status: active, canceled, past_due, incomplete, trialing
  status VARCHAR(50) DEFAULT 'active',

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for member lookups
CREATE INDEX IF NOT EXISTS idx_contributions_member ON member_contributions(member_id);

-- Index for Stripe customer lookups (webhook processing)
CREATE INDEX IF NOT EXISTS idx_contributions_stripe_customer ON member_contributions(stripe_customer_id);

-- Index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_contributions_stripe_subscription ON member_contributions(stripe_subscription_id);

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_contributions_active ON member_contributions(member_id, status) WHERE status = 'active';

-- Comments
COMMENT ON TABLE member_contributions IS 'Tracks member contributions to Sustaining Circle. Not access control - everyone gets full access.';
COMMENT ON COLUMN member_contributions.tier IS 'Contribution tier: sustainer ($1-99), guardian ($15+), elder ($33+), founder ($222 one-time), seva (service)';
COMMENT ON COLUMN member_contributions.amount_cents IS 'Amount in cents for sliding scale (sustainer tier)';
COMMENT ON COLUMN member_contributions.status IS 'Subscription status from Stripe: active, canceled, past_due, incomplete, trialing';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_contributions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contributions_updated_at ON member_contributions;
CREATE TRIGGER contributions_updated_at
  BEFORE UPDATE ON member_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_contributions_updated_at();

-- One-time payment tracking (for Founder tier)
CREATE TABLE IF NOT EXISTS contribution_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID REFERENCES member_contributions(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_checkout_session_id VARCHAR(255),
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL, -- succeeded, pending, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_contribution ON contribution_payments(contribution_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON contribution_payments(stripe_checkout_session_id);
