/**
 * Stripe Membership Checkout API
 *
 * Creates Stripe checkout sessions for membership tier subscriptions.
 * POST /api/stripe/membership/checkout
 *
 * Tiers (from TIER_STRUCTURE.md):
 * - personal: $12/month or $120/year (Continuity - MAIA remembers)
 * - pro: $35/month or $350/year (Stewardship - serve others)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

type MembershipTier = 'personal' | 'pro';
type BillingInterval = 'month' | 'year';

interface MembershipCheckoutRequest {
  tier: MembershipTier;
  interval?: BillingInterval;
  memberId: string;
  memberEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Canonical pricing from TIER_STRUCTURE.md
const MEMBERSHIP_PRICING: Record<MembershipTier, {
  name: string;
  displayName: string;
  tagline: string;
  monthly: number; // cents
  annual: number;  // cents
}> = {
  personal: {
    name: 'Continuity',
    displayName: 'Personal',
    tagline: 'MAIA remembers',
    monthly: 1200,  // $12
    annual: 12000,  // $120 (2 months free)
  },
  pro: {
    name: 'Stewardship',
    displayName: 'Pro',
    tagline: 'Serve others',
    monthly: 3500,  // $35
    annual: 35000,  // $350 (2 months free)
  },
};

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Payment system not configured' },
        { status: 503 }
      );
    }

    const body: MembershipCheckoutRequest = await request.json();
    const {
      tier,
      interval = 'month',
      memberId,
      memberEmail,
      successUrl,
      cancelUrl,
    } = body;

    // Validate tier
    if (!tier || !(tier in MEMBERSHIP_PRICING)) {
      return NextResponse.json(
        { success: false, error: 'Invalid membership tier. Use "personal" or "pro".' },
        { status: 400 }
      );
    }

    // Require member ID for database linking
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const pricing = MEMBERSHIP_PRICING[tier];
    const isAnnual = interval === 'year';
    const amountInCents = isAnnual ? pricing.annual : pricing.monthly;

    // Build product description
    const description = isAnnual
      ? `${pricing.name} membership - annual (2 months free)`
      : `${pricing.name} membership - ${pricing.tagline}`;

    // Create line item for subscription
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `MAIA ${pricing.name}`,
          description,
          metadata: {
            tier,
            interval,
          },
        },
        unit_amount: amountInCents,
        recurring: {
          interval: isAnnual ? 'year' : 'month',
        },
      },
      quantity: 1,
    };

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [lineItem],
      success_url: successUrl || `${origin}/maia/membership?success=true&tier=${tier}`,
      cancel_url: cancelUrl || `${origin}/maia/membership?canceled=true`,
      metadata: {
        type: 'membership',
        tier,
        interval,
        memberId,
      },
      subscription_data: {
        metadata: {
          type: 'membership',
          tier,
          memberId,
        },
      },
      allow_promotion_codes: true,
      ...(memberEmail && { customer_email: memberEmail }),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`[Stripe Membership] Created checkout: ${session.id} for ${tier} (${interval}) member: ${memberId}`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[Stripe Membership] Checkout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
