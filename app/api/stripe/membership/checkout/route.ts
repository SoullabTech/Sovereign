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
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
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

    // G1: Stripe subscription metadata MUST carry the authenticated actor.
    // A request-body memberId is an untrusted assertion, not grant authority.
    // Fail before any paid Stripe operation if it disagrees with session.
    const verifiedMemberId = await getMemberIdFromRequest(request);
    if (!verifiedMemberId) {
      return NextResponse.json(
        { success: false, error: 'Sign in required' }, { status: 401 });
    }

    const body: MembershipCheckoutRequest = await request.json();
    const {
      tier,
      interval = 'month',
      memberId: claimedMemberId,
      memberEmail,
      successUrl,
      cancelUrl,
    } = body;
    if (claimedMemberId != null && claimedMemberId !== verifiedMemberId) {
      return NextResponse.json(
        { success: false, error: 'Account mismatch' }, { status: 403 });
    }
    if (memberEmail !== undefined || successUrl !== undefined || cancelUrl !== undefined) {
      // A paid checkout should never send the member to arbitrary caller URLs
      // or give the customer identity to a supplied unrelated email address.
      return NextResponse.json(
        { success: false, error: 'Checkout destination overrides are not accepted' },
        { status: 400 });
    }
    const memberId = verifiedMemberId;

    // Validate tier
    if (!tier || !(tier in MEMBERSHIP_PRICING)) {
      return NextResponse.json(
        { success: false, error: 'Invalid membership tier. Use "personal" or "pro".' },
        { status: 400 }
      );
    }

    if (interval !== 'month' && interval !== 'year') {
      return NextResponse.json(
        { success: false, error: 'Invalid billing interval' }, { status: 400 });
    }

    const stripe = getStripe();
    // Use only operator-controlled return destinations in production. Incoming
    // Origin and callback parameters are not redirect authority.
    const origin = process.env.NODE_ENV === 'production'
      ? 'https://soullab.life'
      : new URL(process.env.NEXT_PUBLIC_BASE_URL || request.url).origin;
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
      success_url: `${origin}/maia/membership?success=true&tier=${tier}`,
      cancel_url: `${origin}/maia/membership?canceled=true`,
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
      // No client-supplied customer_email. Stripe collects a billing address.
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[Stripe Membership] Created authenticated checkout', { tier, interval });

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
