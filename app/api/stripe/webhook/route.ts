/**
 * Stripe Webhook Handler
 *
 * Processes Stripe events for membership subscriptions.
 * Updates members.tier in database based on subscription status.
 *
 * POST /api/stripe/webhook
 *
 * Key events handled:
 * - checkout.session.completed → Set tier to paid tier
 * - customer.subscription.updated → Handle tier changes
 * - customer.subscription.deleted → Downgrade to free
 * - invoice.payment_failed → Mark past_due (grace period)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import { query } from '@/lib/db/postgres';
import type Stripe from 'stripe';

export const dynamic = 'force-static';

type MembershipTier = 'free' | 'personal' | 'pro';

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) {
    throw new Error('No request body');
  }

  const chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (value) {
      chunks.push(value);
    }
    done = readerDone;
  }

  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      console.error('[Stripe Webhook] Stripe not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Stripe Webhook] No webhook secret configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
    }

    // Get raw body for signature verification
    const rawBody = await getRawBody(request);
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] No signature header');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription, stripe);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook error' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session - upgrade member tier
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] Checkout completed: ${session.id}`);

  const metadata = session.metadata || {};

  // Only handle membership checkouts
  if (metadata.type !== 'membership') {
    console.log('[Stripe Webhook] Not a membership checkout, skipping tier update');
    return;
  }

  const { tier, memberId } = metadata as { tier?: MembershipTier; memberId?: string };

  if (!memberId) {
    console.error('[Stripe Webhook] No memberId in checkout metadata');
    return;
  }

  if (!tier || !['personal', 'pro'].includes(tier)) {
    console.error('[Stripe Webhook] Invalid tier in checkout metadata:', tier);
    return;
  }

  try {
    // Calculate subscription expiry (Stripe provides this in subscription object)
    // For now, set to 1 month/year from now as a fallback
    const isAnnual = metadata.interval === 'year';
    const expiresAt = new Date();
    if (isAnnual) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Update member tier in database
    await query(
      `UPDATE members SET
        tier = $1,
        stripe_customer_id = $2,
        stripe_subscription_id = $3,
        subscription_active = true,
        subscription_expires_at = $4,
        updated_at = NOW()
      WHERE id = $5`,
      [
        tier,
        session.customer,
        session.subscription,
        expiresAt,
        memberId,
      ]
    );

    console.log(`[Stripe Webhook] Updated member ${memberId} to tier: ${tier}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error updating member tier:', error);
  }
}

/**
 * Handle subscription changes (upgrades, downgrades, renewals)
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription, stripe: Stripe) {
  console.log(`[Stripe Webhook] Subscription change: ${subscription.id} - ${subscription.status}`);

  // Get tier from subscription metadata
  const metadata = subscription.metadata || {};

  if (metadata.type !== 'membership') {
    console.log('[Stripe Webhook] Not a membership subscription, skipping');
    return;
  }

  const memberId = metadata.memberId;
  if (!memberId) {
    console.error('[Stripe Webhook] No memberId in subscription metadata');
    return;
  }

  try {
    const isActive = ['active', 'trialing'].includes(subscription.status);

    // Get current period end for expiry (cast to access property)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subAny = subscription as any;
    const currentPeriodEnd = new Date((subAny.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) * 1000);

    // Update subscription status
    await query(
      `UPDATE members SET
        subscription_active = $1,
        subscription_expires_at = $2,
        updated_at = NOW()
      WHERE id = $3`,
      [isActive, currentPeriodEnd, memberId]
    );

    console.log(`[Stripe Webhook] Updated subscription status for member ${memberId}: active=${isActive}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error updating subscription:', error);
  }
}

/**
 * Handle subscription cancellation - downgrade to free
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] Subscription canceled: ${subscription.id}`);

  const metadata = subscription.metadata || {};

  if (metadata.type !== 'membership') {
    console.log('[Stripe Webhook] Not a membership subscription, skipping');
    return;
  }

  const memberId = metadata.memberId;
  if (!memberId) {
    console.error('[Stripe Webhook] No memberId in subscription metadata');
    return;
  }

  try {
    // Downgrade to free tier
    await query(
      `UPDATE members SET
        tier = 'free',
        subscription_active = false,
        subscription_expires_at = NULL,
        stripe_subscription_id = NULL,
        updated_at = NOW()
      WHERE id = $1`,
      [memberId]
    );

    console.log(`[Stripe Webhook] Downgraded member ${memberId} to free tier`);
  } catch (error) {
    console.error('[Stripe Webhook] Error downgrading member:', error);
  }
}

/**
 * Handle successful payment - ensure tier is active
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Payment succeeded: ${invoice.id}`);

  // Get subscription ID from invoice (cast to access subscription property)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string'
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId) {
    console.log('[Stripe Webhook] No subscription on invoice, skipping');
    return;
  }

  try {
    // Ensure subscription is marked active
    await query(
      `UPDATE members SET
        subscription_active = true,
        updated_at = NOW()
      WHERE stripe_subscription_id = $1`,
      [subscriptionId]
    );

    console.log(`[Stripe Webhook] Confirmed active status for subscription: ${subscriptionId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error confirming payment:', error);
  }
}

/**
 * Handle failed payment - grace period, keep tier but mark inactive
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Payment failed: ${invoice.id}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string'
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId) {
    console.log('[Stripe Webhook] No subscription on invoice, skipping');
    return;
  }

  try {
    // Mark subscription as inactive (grace period - tier remains)
    // After grace period exhausted, subscription.deleted event will trigger downgrade
    await query(
      `UPDATE members SET
        subscription_active = false,
        updated_at = NOW()
      WHERE stripe_subscription_id = $1`,
      [subscriptionId]
    );

    console.log(`[Stripe Webhook] Marked subscription inactive (payment failed): ${subscriptionId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling failed payment:', error);
  }
}
