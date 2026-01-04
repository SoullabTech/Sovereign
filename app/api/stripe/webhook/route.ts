/**
 * Stripe Webhook Handler
 *
 * Processes Stripe events for subscription and payment management.
 * POST /api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import { pool } from '@/lib/db/postgres';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

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
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
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
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe] Checkout completed: ${session.id}`);

  const { tier, memberId } = (session.metadata || {}) as { tier?: string; memberId?: string };

  if (!memberId || memberId === 'anonymous') {
    console.log('[Stripe] Anonymous checkout - skipping database update');
    return;
  }

  if (!pool) {
    console.error('[Stripe] Database pool not available');
    return;
  }

  try {
    // Determine amount and status based on mode
    const amountTotal = session.amount_total || 0;
    const isSubscription = session.mode === 'subscription';

    // Insert or update contribution record
    await pool.query(
      `INSERT INTO member_contributions (
        member_id,
        tier,
        stripe_customer_id,
        stripe_subscription_id,
        amount_cents,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, 'active'
      )
      ON CONFLICT (member_id)
      DO UPDATE SET
        tier = $2,
        stripe_customer_id = $3,
        stripe_subscription_id = $4,
        amount_cents = $5,
        status = 'active',
        updated_at = NOW()`,
      [
        memberId,
        tier || 'sustainer',
        session.customer,
        isSubscription ? session.subscription : null,
        amountTotal,
      ]
    );

    // Record payment if it's a one-time payment
    if (!isSubscription && session.payment_intent) {
      await pool.query(
        `INSERT INTO contribution_payments (
          contribution_id,
          stripe_payment_intent_id,
          stripe_checkout_session_id,
          amount_cents,
          status
        )
        SELECT id, $1, $2, $3, 'succeeded'
        FROM member_contributions
        WHERE member_id = $4`,
        [session.payment_intent, session.id, amountTotal, memberId]
      );
    }

    console.log(`[Stripe] Updated contribution for member: ${memberId}`);
  } catch (error) {
    console.error('[Stripe] Error updating contribution:', error);
  }
}

/**
 * Handle subscription changes
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription change: ${subscription.id} - ${subscription.status}`);

  if (!pool) {
    console.error('[Stripe] Database pool not available');
    return;
  }

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  try {
    // Get current period end from subscription
    const currentPeriodEnd = subscription.items?.data?.[0]?.current_period_end
      || Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    // Update subscription status
    await pool.query(
      `UPDATE member_contributions
       SET status = $1,
           current_period_end = $2,
           updated_at = NOW()
       WHERE stripe_subscription_id = $3 OR stripe_customer_id = $4`,
      [
        subscription.status,
        new Date(currentPeriodEnd * 1000),
        subscription.id,
        customerId,
      ]
    );

    console.log(`[Stripe] Updated subscription status: ${subscription.status}`);
  } catch (error) {
    console.error('[Stripe] Error updating subscription:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription canceled: ${subscription.id}`);

  if (!pool) {
    console.error('[Stripe] Database pool not available');
    return;
  }

  try {
    await pool.query(
      `UPDATE member_contributions
       SET status = 'canceled',
           canceled_at = NOW(),
           updated_at = NOW()
       WHERE stripe_subscription_id = $1`,
      [subscription.id]
    );

    console.log(`[Stripe] Marked subscription as canceled`);
  } catch (error) {
    console.error('[Stripe] Error canceling subscription:', error);
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Payment succeeded: ${invoice.id}`);

  // Access subscription from invoice (may be string or object depending on expand)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string'
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId) return;

  if (!pool) {
    console.error('[Stripe] Database pool not available');
    return;
  }

  try {
    // Update subscription status to active
    await pool.query(
      `UPDATE member_contributions
       SET status = 'active',
           updated_at = NOW()
       WHERE stripe_subscription_id = $1`,
      [subscriptionId]
    );

    // Record the payment
    const paymentIntentId = typeof invoiceAny.payment_intent === 'string'
      ? invoiceAny.payment_intent
      : invoiceAny.payment_intent?.id;

    if (paymentIntentId) {
      await pool.query(
        `INSERT INTO contribution_payments (
          contribution_id,
          stripe_payment_intent_id,
          amount_cents,
          status
        )
        SELECT id, $1, $2, 'succeeded'
        FROM member_contributions
        WHERE stripe_subscription_id = $3`,
        [paymentIntentId, invoice.amount_paid, subscriptionId]
      );
    }

    console.log(`[Stripe] Payment recorded for subscription: ${subscriptionId}`);
  } catch (error) {
    console.error('[Stripe] Error recording payment:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Payment failed: ${invoice.id}`);

  // Access subscription from invoice (may be string or object depending on expand)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string'
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId) return;

  if (!pool) {
    console.error('[Stripe] Database pool not available');
    return;
  }

  try {
    await pool.query(
      `UPDATE member_contributions
       SET status = 'past_due',
           updated_at = NOW()
       WHERE stripe_subscription_id = $1`,
      [subscriptionId]
    );

    console.log(`[Stripe] Marked subscription as past_due`);
  } catch (error) {
    console.error('[Stripe] Error updating failed payment:', error);
  }
}
