/**
 * CLIENT SUBSCRIPTION SERVICE
 *
 * Handles client subscriptions to practitioner services via Stripe Connect.
 * Implements a 12% platform fee on all client subscriptions.
 */

import { query } from '@/lib/db/postgres';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import { getTierPricingByTier, type ClientTier, type BillingInterval } from './tierPricing';
export type { ClientTier, BillingInterval };
import { v4 as uuid } from 'uuid';
import type Stripe from 'stripe';

// Platform fee percentage (12%)
const PLATFORM_FEE_PERCENT = 12;

// ================================================
// TYPES
// ================================================

export interface ClientSubscription {
  id: string;
  client_id: string;
  practitioner_id: string;
  tier: 'subscriber' | 'vip';
  billing_interval: BillingInterval;
  price_cents: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: 'active' | 'past_due' | 'canceled' | 'paused' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  ended_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionCheckoutInput {
  clientId: string;
  practitionerId: string;
  tier: 'subscriber' | 'vip';
  billingInterval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
  clientEmail?: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

// ================================================
// PRACTITIONER STRIPE CONNECT
// ================================================

/**
 * Get practitioner's Stripe Connect account ID
 */
export async function getPractitionerStripeConnectId(
  practitionerId: string
): Promise<string | null> {
  const result = await query<{ stripe_connect_id: string }>(
    'SELECT stripe_connect_id FROM practitioners WHERE id = $1',
    [practitionerId]
  );
  return result.rows[0]?.stripe_connect_id || null;
}

/**
 * Check if practitioner has Stripe Connect enabled
 */
export async function isPractitionerStripeConnectEnabled(
  practitionerId: string
): Promise<boolean> {
  const result = await query<{ stripe_connect_enabled: boolean }>(
    'SELECT stripe_connect_enabled FROM practitioners WHERE id = $1',
    [practitionerId]
  );
  return result.rows[0]?.stripe_connect_enabled === true;
}

// ================================================
// SUBSCRIPTION CHECKOUT
// ================================================

/**
 * Create a Stripe Checkout session for client subscription
 * Uses Stripe Connect with application fee (12%)
 */
export async function createClientSubscriptionCheckout(
  input: CreateSubscriptionCheckoutInput
): Promise<CheckoutSessionResult> {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured');
  }

  const stripe = getStripe();

  // Get practitioner's Stripe Connect account
  const connectId = await getPractitionerStripeConnectId(input.practitionerId);
  if (!connectId) {
    throw new Error('Practitioner has not set up Stripe Connect');
  }

  // Get tier pricing
  const pricing = await getTierPricingByTier(input.practitionerId, input.tier);
  if (!pricing || !pricing.is_active) {
    throw new Error(`${input.tier} tier is not available`);
  }

  // Calculate price based on billing interval
  const priceCents = input.billingInterval === 'annual'
    ? (pricing.annual_price_cents || pricing.monthly_price_cents * 12)
    : pricing.monthly_price_cents;

  // Calculate platform fee (12%)
  const applicationFeeCents = Math.round(priceCents * PLATFORM_FEE_PERCENT / 100);

  // Create Stripe Checkout session with Connect
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: input.clientEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: pricing.name || `${input.tier} Subscription`,
            description: pricing.description || undefined,
          },
          unit_amount: priceCents,
          recurring: {
            interval: input.billingInterval === 'annual' ? 'year' : 'month',
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      application_fee_percent: PLATFORM_FEE_PERCENT,
      metadata: {
        client_id: input.clientId,
        practitioner_id: input.practitionerId,
        tier: input.tier,
        billing_interval: input.billingInterval,
      },
    },
    metadata: {
      type: 'client_subscription',
      client_id: input.clientId,
      practitioner_id: input.practitionerId,
      tier: input.tier,
      billing_interval: input.billingInterval,
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  }, {
    stripeAccount: connectId,
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

// ================================================
// SUBSCRIPTION MANAGEMENT
// ================================================

/**
 * Get client's active subscription for a practitioner
 */
export async function getClientSubscription(
  clientId: string,
  practitionerId: string
): Promise<ClientSubscription | null> {
  const result = await query<ClientSubscription>(
    `SELECT * FROM client_subscriptions
     WHERE client_id = $1 AND practitioner_id = $2
     AND status IN ('active', 'trialing', 'past_due')
     ORDER BY created_at DESC
     LIMIT 1`,
    [clientId, practitionerId]
  );
  return result.rows[0] || null;
}

/**
 * Get all subscriptions for a client
 */
export async function getClientSubscriptions(
  clientId: string
): Promise<ClientSubscription[]> {
  const result = await query<ClientSubscription>(
    `SELECT * FROM client_subscriptions
     WHERE client_id = $1
     ORDER BY created_at DESC`,
    [clientId]
  );
  return result.rows;
}

/**
 * Get all active subscriptions for a practitioner
 */
export async function getPractitionerSubscriptions(
  practitionerId: string,
  status?: ClientSubscription['status']
): Promise<ClientSubscription[]> {
  let sql = `SELECT * FROM client_subscriptions WHERE practitioner_id = $1`;
  const params: any[] = [practitionerId];

  if (status) {
    sql += ` AND status = $2`;
    params.push(status);
  }

  sql += ` ORDER BY created_at DESC`;

  const result = await query<ClientSubscription>(sql, params);
  return result.rows;
}

/**
 * Cancel a client subscription at period end
 */
export async function cancelClientSubscription(
  subscriptionId: string,
  practitionerId: string
): Promise<ClientSubscription | null> {
  // Get the subscription
  const subResult = await query<ClientSubscription>(
    `SELECT * FROM client_subscriptions
     WHERE id = $1 AND practitioner_id = $2`,
    [subscriptionId, practitionerId]
  );

  const subscription = subResult.rows[0];
  if (!subscription) {
    return null;
  }

  // Cancel in Stripe if we have a subscription ID
  if (subscription.stripe_subscription_id && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const connectId = await getPractitionerStripeConnectId(practitionerId);

      if (connectId) {
        await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          { cancel_at_period_end: true },
          { stripeAccount: connectId }
        );
      }
    } catch (err) {
      console.error('[ClientSubscription] Failed to cancel in Stripe:', err);
    }
  }

  // Update our record
  const result = await query<ClientSubscription>(
    `UPDATE client_subscriptions
     SET cancel_at_period_end = true, canceled_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [subscriptionId]
  );

  // Update client tier if cancellation is immediate (no period end)
  if (result.rows[0] && !subscription.current_period_end) {
    await updateClientTier(subscription.client_id, subscription.practitioner_id, 'free');
  }

  return result.rows[0] || null;
}

/**
 * Reactivate a canceled subscription (before period end)
 */
export async function reactivateClientSubscription(
  subscriptionId: string,
  practitionerId: string
): Promise<ClientSubscription | null> {
  const subResult = await query<ClientSubscription>(
    `SELECT * FROM client_subscriptions
     WHERE id = $1 AND practitioner_id = $2 AND cancel_at_period_end = true`,
    [subscriptionId, practitionerId]
  );

  const subscription = subResult.rows[0];
  if (!subscription) {
    return null;
  }

  // Reactivate in Stripe
  if (subscription.stripe_subscription_id && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const connectId = await getPractitionerStripeConnectId(practitionerId);

      if (connectId) {
        await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          { cancel_at_period_end: false },
          { stripeAccount: connectId }
        );
      }
    } catch (err) {
      console.error('[ClientSubscription] Failed to reactivate in Stripe:', err);
    }
  }

  const result = await query<ClientSubscription>(
    `UPDATE client_subscriptions
     SET cancel_at_period_end = false, canceled_at = NULL
     WHERE id = $1
     RETURNING *`,
    [subscriptionId]
  );

  return result.rows[0] || null;
}

// ================================================
// WEBHOOK HANDLERS
// ================================================

/**
 * Handle subscription created from webhook
 *
 * IDEMPOTENT: Uses UPSERT to safely handle Stripe webhook retries.
 * Same stripe_subscription_id will update existing record rather than fail.
 */
export async function handleSubscriptionCreated(
  stripeSubscription: Stripe.Subscription,
  practitionerId: string
): Promise<ClientSubscription> {
  const metadata = stripeSubscription.metadata || {};
  const clientId = metadata.client_id;
  const tier = metadata.tier as 'subscriber' | 'vip';
  const billingInterval = metadata.billing_interval as BillingInterval;

  if (!clientId || !tier) {
    throw new Error('Missing required metadata in subscription');
  }

  // Get price from subscription
  const item = stripeSubscription.items.data[0];
  const priceCents = item?.price?.unit_amount || 0;

  const stripeCustomerId = typeof stripeSubscription.customer === 'string'
    ? stripeSubscription.customer
    : stripeSubscription.customer?.id;

  const status = stripeSubscription.status;
  // Use type assertion - these properties exist on Stripe Subscription objects
  const sub = stripeSubscription as unknown as { current_period_start: number; current_period_end: number };
  const currentPeriodStart = new Date(sub.current_period_start * 1000).toISOString();
  const currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();

  // UPSERT subscription record (idempotent - safe for Stripe retries)
  const result = await query<ClientSubscription>(
    `INSERT INTO client_subscriptions (
      id, client_id, practitioner_id, tier, billing_interval, price_cents,
      stripe_subscription_id, stripe_customer_id, status,
      current_period_start, current_period_end, cancel_at_period_end
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (stripe_subscription_id)
    DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      tier = EXCLUDED.tier,
      billing_interval = EXCLUDED.billing_interval,
      price_cents = EXCLUDED.price_cents,
      status = EXCLUDED.status,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at = NOW()
    RETURNING *`,
    [
      uuid(),
      clientId,
      practitionerId,
      tier,
      billingInterval || 'monthly',
      priceCents,
      stripeSubscription.id,
      stripeCustomerId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      stripeSubscription.cancel_at_period_end || false,
    ]
  );

  // Update client tier (deterministic based on status)
  const isPaid = status === 'active' || status === 'trialing';
  await updateClientTier(clientId, practitionerId, isPaid ? tier : 'free');

  return result.rows[0];
}

/**
 * Handle subscription updated from webhook
 */
export async function handleSubscriptionUpdated(
  stripeSubscription: Stripe.Subscription,
  practitionerId: string
): Promise<void> {
  // Use type assertion for period timestamps
  const sub = stripeSubscription as unknown as { current_period_start: number; current_period_end: number };
  const result = await query(
    `UPDATE client_subscriptions
     SET status = $1,
         current_period_start = $2,
         current_period_end = $3,
         cancel_at_period_end = $4
     WHERE stripe_subscription_id = $5 AND practitioner_id = $6`,
    [
      stripeSubscription.status,
      new Date(sub.current_period_start * 1000).toISOString(),
      new Date(sub.current_period_end * 1000).toISOString(),
      stripeSubscription.cancel_at_period_end,
      stripeSubscription.id,
      practitionerId,
    ]
  );

  // If subscription ended or canceled, revert client to free tier
  if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'unpaid') {
    const subResult = await query<{ client_id: string }>(
      `SELECT client_id FROM client_subscriptions
       WHERE stripe_subscription_id = $1`,
      [stripeSubscription.id]
    );

    if (subResult.rows[0]) {
      await updateClientTier(subResult.rows[0].client_id, practitionerId, 'free');
    }
  }
}

/**
 * Handle payment failed from webhook
 */
export async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  practitionerId: string
): Promise<void> {
  // Use type assertion for subscription property
  const inv = invoice as unknown as { subscription?: string | { id: string } };
  if (!inv.subscription) return;

  const subscriptionId = typeof inv.subscription === 'string'
    ? inv.subscription
    : inv.subscription.id;

  await query(
    `UPDATE client_subscriptions
     SET status = 'past_due'
     WHERE stripe_subscription_id = $1 AND practitioner_id = $2`,
    [subscriptionId, practitionerId]
  );
}

// ================================================
// HELPERS
// ================================================

/**
 * Update client's tier in the practitioner_clients table
 */
async function updateClientTier(
  clientId: string,
  practitionerId: string,
  tier: ClientTier
): Promise<void> {
  await query(
    `UPDATE practitioner_clients
     SET tier = $1
     WHERE id = $2 AND practitioner_id = $3`,
    [tier, clientId, practitionerId]
  );
}

// ================================================
// EXPORTS
// ================================================

export const ClientSubscriptionService = {
  createClientSubscriptionCheckout,
  getClientSubscription,
  getClientSubscriptions,
  getPractitionerSubscriptions,
  cancelClientSubscription,
  reactivateClientSubscription,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handlePaymentFailed,
  getPractitionerStripeConnectId,
  isPractitionerStripeConnectEnabled,
};

export default ClientSubscriptionService;
