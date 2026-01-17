export const dynamic = 'force-dynamic';

/**
 * Practitioner Stripe Connect API
 *
 * GET /api/practitioner/[id]/stripe - Get Stripe Connect status
 * POST /api/practitioner/[id]/stripe - Create or get Connect onboarding link
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPractitionerById,
} from '@/lib/practitioner/practitionerService';
import {
  createConnectAccount,
  getOnboardingLink,
  isAccountOnboarded,
  getDashboardLink,
  getConnectBalance,
} from '@/lib/practitioner/stripeConnect';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Get Stripe Connect status and dashboard link
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const practitioner = await getPractitionerById(id);
    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    if (!practitioner.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
        message: 'No Stripe account connected',
      });
    }

    // Check if account is fully onboarded
    const onboarded = await isAccountOnboarded(practitioner.stripeAccountId);

    // Get balance if onboarded
    let balance = { available: 0, pending: 0 };
    let dashboardUrl: string | null = null;

    if (onboarded) {
      balance = await getConnectBalance(id);
      try {
        dashboardUrl = await getDashboardLink(id);
      } catch {
        // Dashboard link may fail if account isn't fully verified
      }
    }

    return NextResponse.json({
      connected: true,
      onboarded,
      accountId: practitioner.stripeAccountId,
      balance,
      dashboardUrl,
      revenueSharePercent: practitioner.revenueSharePercent,
    });
  } catch (error) {
    console.error('[PRACTITIONER] Get Stripe status error:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe status' },
      { status: 500 }
    );
  }
}

// Create Connect account or get onboarding link
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const practitioner = await getPractitionerById(id);
    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    // If already has a Stripe account, just return a new onboarding link
    if (practitioner.stripeAccountId) {
      const onboardingUrl = await getOnboardingLink(id);
      return NextResponse.json({
        success: true,
        accountId: practitioner.stripeAccountId,
        onboardingUrl,
      });
    }

    // Create new Connect account
    const { accountId, onboardingUrl } = await createConnectAccount(
      id,
      practitioner.email,
      practitioner.businessName
    );

    return NextResponse.json({
      success: true,
      accountId,
      onboardingUrl,
    });
  } catch (error) {
    console.error('[PRACTITIONER] Create Stripe account error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}
