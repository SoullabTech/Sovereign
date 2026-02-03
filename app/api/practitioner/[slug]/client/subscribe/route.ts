/**
 * CLIENT SUBSCRIPTION API
 *
 * Create subscription checkout sessions for clients.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import {
  createClientSubscriptionCheckout,
  getClientSubscription,
  cancelClientSubscription,
  type BillingInterval,
} from '@/lib/practitioner/clientSubscription';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/practitioner/[slug]/client/subscribe
 *
 * Create a Stripe Checkout session for a client subscription.
 *
 * Body:
 * - clientId: Client ID
 * - tier: 'subscriber' or 'vip'
 * - billingInterval: 'monthly' or 'annual'
 * - clientEmail: Optional email for checkout prefill
 *
 * Note: Success/cancel URLs are built server-side for security.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const {
      clientId,
      tier,
      billingInterval,
      clientEmail,
    } = body;

    // Validate required fields
    if (!clientId || !tier || !billingInterval) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build success/cancel URLs server-side (never trust client input)
    // Prefer server-only APP_URL, fallback to request origin, then hardcoded default
    const baseUrl =
      process.env.APP_URL ||
      request.headers.get('origin') ||
      `https://${request.headers.get('host')}` ||
      'https://soullab.life';
    const successUrl = `${baseUrl}/portal/${slug}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/portal/${slug}/subscribe/cancel`;

    // Validate tier
    if (!['subscriber', 'vip'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "subscriber" or "vip"' },
        { status: 400 }
      );
    }

    // Validate billing interval
    if (!['monthly', 'annual'].includes(billingInterval)) {
      return NextResponse.json(
        { error: 'Invalid billing interval. Must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    // Get practitioner by slug
    const practitionerResult = await query<{ id: string; stripe_connect_enabled: boolean }>(
      'SELECT id, stripe_connect_enabled FROM practitioners WHERE slug = $1',
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    const practitioner = practitionerResult.rows[0];

    // Check if Stripe Connect is enabled
    if (!practitioner.stripe_connect_enabled) {
      return NextResponse.json(
        { error: 'Practitioner has not enabled payments' },
        { status: 400 }
      );
    }

    // Verify client exists and belongs to this practitioner
    const clientResult = await query<{ id: string; email: string }>(
      'SELECT id, email FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2',
      [clientId, practitioner.id]
    );

    if (clientResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const client = clientResult.rows[0];

    // Check for existing active subscription
    const existingSubscription = await getClientSubscription(clientId, practitioner.id);
    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'Client already has an active subscription' },
        { status: 409 }
      );
    }

    // Create checkout session
    const result = await createClientSubscriptionCheckout({
      clientId,
      practitionerId: practitioner.id,
      tier,
      billingInterval: billingInterval as BillingInterval,
      successUrl,
      cancelUrl,
      clientEmail: clientEmail || client.email,
    });

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      url: result.url,
    });
  } catch (error) {
    console.error('[Client Subscribe API] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/practitioner/[slug]/client/subscribe
 *
 * Get client's current subscription status.
 *
 * Query params:
 * - clientId: Client ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // Get practitioner by slug
    const practitionerResult = await query<{ id: string }>(
      'SELECT id FROM practitioners WHERE slug = $1',
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    const practitionerId = practitionerResult.rows[0].id;

    // Get subscription
    const subscription = await getClientSubscription(clientId, practitionerId);

    return NextResponse.json({
      hasSubscription: !!subscription,
      subscription,
    });
  } catch (error) {
    console.error('[Client Subscribe API] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/practitioner/[slug]/client/subscribe
 *
 * Cancel a client's subscription.
 *
 * Query params:
 * - subscriptionId: Subscription ID to cancel
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId is required' },
        { status: 400 }
      );
    }

    // Require authentication
    let memberId: string;
    try {
      memberId = await requireMemberId();
    } catch {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get practitioner and verify ownership
    const practitionerResult = await query<{ id: string; member_id: string }>(
      'SELECT id, member_id FROM practitioners WHERE slug = $1',
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    const practitioner = practitionerResult.rows[0];

    if (practitioner.member_id !== memberId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Cancel subscription
    const result = await cancelClientSubscription(subscriptionId, practitioner.id);

    if (!result) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: result,
    });
  } catch (error) {
    console.error('[Client Subscribe API] Cancel error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
