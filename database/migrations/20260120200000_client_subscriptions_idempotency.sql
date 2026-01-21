-- ============================================
-- CLIENT SUBSCRIPTIONS IDEMPOTENCY
-- ============================================
-- Adds unique constraint on stripe_subscription_id to enable
-- idempotent webhook handling via ON CONFLICT UPSERT.

-- Drop the existing non-unique index
DROP INDEX IF EXISTS idx_client_subscriptions_stripe;

-- Add unique constraint (this also creates an index)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'client_subscriptions_stripe_subscription_id_key'
  ) THEN
    ALTER TABLE client_subscriptions
    ADD CONSTRAINT client_subscriptions_stripe_subscription_id_key
    UNIQUE (stripe_subscription_id);
  END IF;
END $$;

COMMENT ON CONSTRAINT client_subscriptions_stripe_subscription_id_key
  ON client_subscriptions
  IS 'Enables idempotent webhook processing - same Stripe subscription can only exist once';
