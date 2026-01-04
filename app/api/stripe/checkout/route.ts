/**
 * Stripe Checkout Session API
 *
 * Creates Stripe checkout sessions for Sustaining Circle contributions.
 * Supports:
 * - Monthly subscriptions
 * - Annual subscriptions (17% savings)
 * - One-time gifts
 * - Elder Story Seat sponsorship
 *
 * POST /api/stripe/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import Stripe from 'stripe';

export const dynamic = 'force-static';

// Patron tier names from /patrons page
type PatronTier = 'seedkeeper' | 'storyweaver' | 'sanctuary' | 'founder';
// Special tiers
type SpecialTier = 'one-time-gift' | 'elder-sponsor';
// Legacy tier names (for backwards compatibility)
type LegacyTier = 'sustainer' | 'guardian' | 'elder' | 'seva';
type ContributionTier = PatronTier | SpecialTier | LegacyTier;

interface CheckoutRequest {
  tier: ContributionTier;
  amount?: number; // Amount in dollars
  interval?: 'month' | 'year' | 'one_time'; // Billing interval
  memberId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Tier configuration
const TIER_CONFIG: Record<PatronTier | LegacyTier, {
  name: string;
  mode: 'subscription' | 'payment' | 'none';
  minimumAmount?: number;
  amount?: number;
}> = {
  // Patron page tiers
  seedkeeper: {
    name: 'Seedkeeper',
    mode: 'subscription',
    amount: 2500, // $25/month
  },
  storyweaver: {
    name: 'Story Weaver',
    mode: 'subscription',
    amount: 7500, // $75/month
  },
  sanctuary: {
    name: 'Sanctuary Builder',
    mode: 'subscription',
    amount: 25000, // $250/month
  },
  founder: {
    name: 'Founding Patron',
    mode: 'subscription',
    amount: 100000, // $1,000/month
  },
  // Legacy tiers (backwards compatibility)
  sustainer: {
    name: 'Sustainer',
    mode: 'subscription',
    minimumAmount: 100,
  },
  guardian: {
    name: 'Guardian',
    mode: 'subscription',
    minimumAmount: 1500,
  },
  elder: {
    name: 'Elder',
    mode: 'subscription',
    minimumAmount: 3300,
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
    const { tier, amount, interval = 'month', memberId, successUrl, cancelUrl } = body;

    // Validate tier
    if (!tier) {
      return NextResponse.json(
        { success: false, error: 'Contribution tier is required' },
        { status: 400 }
      );
    }

    // Seva doesn't use Stripe
    if (tier === 'seva') {
      return NextResponse.json(
        { success: false, error: 'Seva contributions do not require payment' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Handle special tiers (one-time gifts, elder sponsorship)
    if (tier === 'one-time-gift' || tier === 'elder-sponsor') {
      const giftAmount = tier === 'elder-sponsor' ? 50000 : (amount || 50) * 100; // Convert to cents
      const giftName = tier === 'elder-sponsor' ? 'Elder Story Seat Sponsorship' : 'One-Time Gift';
      const giftDescription = tier === 'elder-sponsor'
        ? 'Sponsor one elder\'s full year of access to MAIA\'s legacy capture tools'
        : `One-time gift of $${(giftAmount / 100).toFixed(0)} to support MAIA`;

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: giftName,
              description: giftDescription,
            },
            unit_amount: giftAmount,
          },
          quantity: 1,
        }],
        success_url: successUrl || `${origin}/patrons?success=true&type=gift`,
        cancel_url: cancelUrl || `${origin}/patrons?canceled=true`,
        metadata: {
          tier,
          type: 'one_time',
          memberId: memberId || 'anonymous',
        },
        allow_promotion_codes: true,
      });

      console.log(`[Stripe] Created one-time checkout session: ${session.id} for ${giftName}`);

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    }

    // Validate standard tier
    if (!(tier in TIER_CONFIG)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contribution tier' },
        { status: 400 }
      );
    }

    const tierConfig = TIER_CONFIG[tier as PatronTier | LegacyTier];

    // Calculate amount in cents
    let amountInCents: number;
    if (amount) {
      // Use provided amount (for annual or custom amounts)
      amountInCents = amount * 100;
    } else if (tierConfig.amount) {
      // Fixed price tiers (patron tiers)
      amountInCents = tierConfig.amount;
    } else if (tierConfig.minimumAmount) {
      // Sliding scale tiers (legacy)
      amountInCents = tierConfig.minimumAmount;
    } else {
      amountInCents = 100; // $1 fallback
    }

    // Determine if subscription or one-time payment
    const isOneTime = interval === 'one_time';
    const isAnnual = interval === 'year';
    const billingInterval = isAnnual ? 'year' : 'month';

    // Build product description
    let description: string;
    if (isOneTime) {
      description = `One-time contribution of $${(amountInCents / 100).toFixed(2)}`;
    } else if (isAnnual) {
      const monthlyEquivalent = Math.round(amountInCents / 12 / 100);
      description = `Annual contribution ($${monthlyEquivalent}/mo equivalent, 2 months free)`;
    } else {
      description = `Monthly contribution of $${(amountInCents / 100).toFixed(2)}`;
    }

    // Build line items
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${tierConfig.name} Circle`,
          description,
        },
        unit_amount: amountInCents,
        ...(!isOneTime && { recurring: { interval: billingInterval as 'month' | 'year' } }),
      },
      quantity: 1,
    };

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: isOneTime ? 'payment' : 'subscription',
      line_items: [lineItem],
      success_url: successUrl || `${origin}/patrons?success=true&tier=${tier}`,
      cancel_url: cancelUrl || `${origin}/patrons?canceled=true`,
      metadata: {
        tier,
        interval: interval || 'month',
        memberId: memberId || 'anonymous',
      },
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`[Stripe] Created checkout session: ${session.id} for tier: ${tier} (${interval})`);

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
