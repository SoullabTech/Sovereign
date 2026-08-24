/**
 * Helper Fund Contribution API
 *
 * POST /api/pricing/helper-fund/contribute
 *
 * Initiate a Helper Fund contribution (redirects to Stripe).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createContribution, getMemberContribution } from '@/lib/pricing';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

// Stripe would be imported here in production
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    const body = await request.json();
    const { amountCents, isRecurring } = body;

    // Validate amount
    if (!amountCents || amountCents < 500) {
      return NextResponse.json(
        { error: 'Minimum contribution is $5' },
        { status: 400 }
      );
    }

    if (amountCents > 100000) {
      return NextResponse.json(
        { error: 'Maximum contribution is $1,000. For larger contributions, please contact us.' },
        { status: 400 }
      );
    }

    // In production, create Stripe checkout session
    // For now, create the contribution record directly
    /*
    const session = await stripe.checkout.sessions.create({
      mode: isRecurring ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Helper Fund Contribution',
            description: isRecurring
              ? 'Monthly contribution to support emerging practitioners'
              : 'One-time contribution to support emerging practitioners',
          },
          unit_amount: amountCents,
          ...(isRecurring && { recurring: { interval: 'month' } }),
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/helper-fund/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/helper-fund/contribute`,
      metadata: {
        memberId,
        type: 'helper_fund',
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
    */

    // For development, create contribution directly
    const contributionId = await createContribution(
      memberId,
      amountCents,
      'practitioner',
      isRecurring
    );

    return NextResponse.json({
      success: true,
      contributionId,
      message: isRecurring
        ? 'Monthly contribution started. Thank you for your support.'
        : 'Contribution received. Thank you for your support.',
    });
  } catch (error) {
    console.error('[helper-fund/contribute] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process contribution' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    const contribution = await getMemberContribution(memberId);

    if (!contribution) {
      return NextResponse.json({ contribution: null });
    }

    return NextResponse.json({
      contribution: {
        id: contribution.id,
        amountCents: contribution.amountCents,
        isRecurring: contribution.isRecurring,
        status: contribution.status,
        pausedUntil: contribution.pausedUntil,
        createdAt: contribution.createdAt,
      },
    });
  } catch (error) {
    console.error('[helper-fund/contribute GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contribution status' },
      { status: 500 }
    );
  }
}
