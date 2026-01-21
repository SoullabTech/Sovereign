/**
 * STRIPE CONNECT API
 *
 * Manages Stripe Connect onboarding for practitioners.
 *
 * GET - Returns current connect status
 * POST - Creates onboarding link (or reconnect link if already started)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import {
  createConnectAccount,
  getOnboardingLink,
  isAccountOnboarded,
  getDashboardLink,
} from '@/lib/practitioner/stripeConnect';
import { isStripeConfigured } from '@/lib/stripe/config';

interface PractitionerStripeInfo {
  id: string;
  name: string;
  email: string;
  stripe_connect_id: string | null;
  stripe_connect_enabled: boolean;
  stripe_connect_onboarded_at: string | null;
}

/**
 * Get practitioner with Stripe info for authenticated member
 */
async function getPractitionerForMember(memberId: string): Promise<PractitionerStripeInfo | null> {
  const result = await query<PractitionerStripeInfo>(
    `SELECT id, name, email, stripe_connect_id, stripe_connect_enabled, stripe_connect_onboarded_at
     FROM practitioners WHERE member_id = $1`,
    [memberId]
  );
  return result.rows[0] || null;
}

/**
 * GET /api/stellium/stripe/connect
 *
 * Returns Stripe Connect status for the authenticated practitioner.
 */
export async function GET() {
  try {
    // Check Stripe configuration
    if (!isStripeConfigured()) {
      return NextResponse.json({
        success: true,
        status: {
          configured: false,
          connected: false,
          onboarded: false,
          dashboardUrl: null,
        },
      });
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

    // Get practitioner
    const practitioner = await getPractitionerForMember(memberId);
    if (!practitioner) {
      return NextResponse.json(
        { error: 'Not a practitioner' },
        { status: 403 }
      );
    }

    // Check onboarding status if account exists
    let onboarded = false;
    let dashboardUrl: string | null = null;

    if (practitioner.stripe_connect_id) {
      try {
        onboarded = await isAccountOnboarded(practitioner.stripe_connect_id);

        // If onboarded, get dashboard link
        if (onboarded) {
          dashboardUrl = await getDashboardLink(practitioner.id);
        }
      } catch (err) {
        console.error('[Stripe Connect] Failed to check account status:', err);
      }
    }

    return NextResponse.json({
      success: true,
      status: {
        configured: true,
        connected: !!practitioner.stripe_connect_id,
        onboarded,
        enabled: practitioner.stripe_connect_enabled,
        onboardedAt: practitioner.stripe_connect_onboarded_at,
        dashboardUrl,
      },
    });
  } catch (error) {
    console.error('[Stripe Connect API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get connect status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stellium/stripe/connect
 *
 * Creates or continues Stripe Connect onboarding.
 * Returns a URL to redirect the user to Stripe's onboarding flow.
 *
 * Body (optional):
 * - returnPath: Path to redirect to after onboarding (default: /stellium/settings)
 */
export async function POST(request: NextRequest) {
  try {
    // Check Stripe configuration
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
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

    // Get practitioner
    const practitioner = await getPractitionerForMember(memberId);
    if (!practitioner) {
      return NextResponse.json(
        { error: 'Not a practitioner' },
        { status: 403 }
      );
    }

    // Parse body for return path
    let returnPath = '/stellium/settings';
    try {
      const body = await request.json();
      if (body.returnPath) {
        returnPath = body.returnPath;
      }
    } catch {
      // Body is optional
    }

    let onboardingUrl: string;

    if (practitioner.stripe_connect_id) {
      // Account exists, generate new onboarding link (for completing incomplete onboarding)
      onboardingUrl = await getOnboardingLink(practitioner.id);
    } else {
      // Create new Connect account
      const result = await createConnectAccount(
        practitioner.id,
        practitioner.email,
        practitioner.name
      );
      onboardingUrl = result.onboardingUrl;

      // Update practitioner with new account ID
      await query(
        `UPDATE practitioners
         SET stripe_connect_id = $1
         WHERE id = $2`,
        [result.accountId, practitioner.id]
      );
    }

    return NextResponse.json({
      success: true,
      url: onboardingUrl,
    });
  } catch (error) {
    console.error('[Stripe Connect API] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create onboarding link';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
