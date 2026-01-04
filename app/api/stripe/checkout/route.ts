/**
 * Stripe Checkout Session API
 *
 * Creates Stripe checkout sessions for Sustaining Circle contributions.
 * POST /api/stripe/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

type ContributionTier = 'sustainer' | 'guardian' | 'elder' | 'founder' | 'seva';

interface CheckoutRequest {
  tier: ContributionTier;
  amount?: number; // For sustainer tier sliding scale (in dollars)
  memberId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Tier configuration
const TIER_CONFIG: Record<ContributionTier, {
  name: string;
  mode: 'subscription' | 'payment' | 'none';
  minimumAmount?: number;
  amount?: number;
}> = {
  sustainer: {
    name: 'Sustainer',
    mode: 'subscription',
    minimumAmount: 100, // $1 minimum
  },
  guardian: {
    name: 'Guardian',
    mode: 'subscription',
    minimumAmount: 1500, // $15 minimum
  },
  elder: {
    name: 'Elder',
    mode: 'subscription',
    minimumAmount: 3300, // $33 minimum
  },
  founder: {
    name: 'Pioneer Founder',
    mode: 'payment',
    amount: 22200, // $222 one-time
  },
  seva: {
    name: 'Seva',
    mode: 'none',
  },
};

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Payment system not configured' },
        { status: 503 }
      );
    }

    const body: CheckoutRequest = await request.json();
    const { tier, amount, memberId, successUrl, cancelUrl } = body;

    // Validate tier
    if (!tier || !(tier in TIER_CONFIG)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contribution tier' },
        { status: 400 }
      );
    }

    const tierConfig = TIER_CONFIG[tier];

    // Seva doesn't use Stripe
    if (tier === 'seva') {
      return NextResponse.json(
        { success: false, error: 'Seva contributions do not require payment' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Calculate amount in cents
    let amountInCents: number;
    if (tier === 'founder') {
      amountInCents = tierConfig.amount || 22200;
    } else {
      const minAmount = tierConfig.minimumAmount || 100;
      amountInCents = amount ? Math.max(minAmount, amount * 100) : minAmount;
    }

    // Build line items
    const isSubscription = tierConfig.mode === 'subscription';
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${tierConfig.name} Circle`,
          description: isSubscription
            ? `Monthly contribution of $${(amountInCents / 100).toFixed(2)}`
            : `Lifetime membership - $${(amountInCents / 100).toFixed(2)} one-time`,
        },
        unit_amount: amountInCents,
        ...(isSubscription && { recurring: { interval: 'month' as const } }),
      },
      quantity: 1,
    };

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [lineItem],
      success_url: successUrl || `${origin}/patrons?success=true&tier=${tier}`,
      cancel_url: cancelUrl || `${origin}/patrons?canceled=true`,
      metadata: {
        tier,
        memberId: memberId || 'anonymous',
      },
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`[Stripe] Created checkout session: ${session.id} for tier: ${tier}`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[Stripe] Checkout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
