/**
 * PRACTITIONER STRIPE WEBHOOK HANDLER
 *
 * Handles Stripe Connect webhooks for client subscriptions.
 * Events are forwarded from practitioners' connected accounts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handlePaymentFailed,
} from '@/lib/practitioner/clientSubscription';
import type Stripe from 'stripe';

// Disable body parsing - we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * POST /api/stripe/webhook/practitioner
 *
 * Handles Stripe Connect webhooks for practitioner accounts.
 * Requires STRIPE_CONNECT_WEBHOOK_SECRET environment variable.
 */
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Practitioner Webhook] Missing STRIPE_CONNECT_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[Practitioner Webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Get the connected account ID from the event
  const connectAccountId = event.account;
  if (!connectAccountId) {
    console.error('[Practitioner Webhook] Missing account in event');
    return NextResponse.json(
      { error: 'Missing account in event' },
      { status: 400 }
    );
  }

  // Look up the practitioner by their Stripe Connect account ID
  const practitionerId = await getPractitionerIdByStripeConnectId(connectAccountId);
  if (!practitionerId) {
    console.warn(`[Practitioner Webhook] Unknown Stripe Connect account: ${connectAccountId}`);
    // Return 200 to prevent Stripe from retrying for unknown accounts
    return NextResponse.json({ received: true, warning: 'Unknown account' });
  }

  console.log(`[Practitioner Webhook] Processing ${event.type} for practitioner ${practitionerId}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only process subscription checkouts
        if (session.mode === 'subscription' && session.metadata?.type === 'client_subscription') {
          // The subscription is created separately, so we just log this
          console.log(`[Practitioner Webhook] Checkout completed for subscription`);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription, practitionerId);
        console.log(`[Practitioner Webhook] Subscription created: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, practitionerId);
        console.log(`[Practitioner Webhook] Subscription updated: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Treat deleted as updated with canceled status
        await handleSubscriptionUpdated(subscription, practitionerId);
        console.log(`[Practitioner Webhook] Subscription deleted: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, practitionerId);
        console.log(`[Practitioner Webhook] Payment failed for invoice: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Could update subscription status or send confirmation
        console.log(`[Practitioner Webhook] Payment succeeded for invoice: ${invoice.id}`);
        break;
      }

      default:
        console.log(`[Practitioner Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[Practitioner Webhook] Error processing ${event.type}:`, err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Get practitioner ID by their Stripe Connect account ID
 */
async function getPractitionerIdByStripeConnectId(
  stripeConnectId: string
): Promise<string | null> {
  // Import here to avoid circular dependency
  const { query } = await import('@/lib/db/postgres');

  const result = await query<{ id: string }>(
    'SELECT id FROM practitioners WHERE stripe_connect_id = $1',
    [stripeConnectId]
  );

  return result.rows[0]?.id || null;
}
