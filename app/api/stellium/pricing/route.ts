/**
 * TIER PRICING API
 *
 * Manages practitioner tier pricing (subscriber/VIP).
 *
 * GET - Returns current pricing configuration
 * POST - Creates or updates tier pricing
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import {
  getTierPricing,
  saveTierPricing,
  type TierPricing,
  type CreateTierPricingInput,
} from '@/lib/practitioner/tierPricing';

/**
 * Get practitioner ID for authenticated member
 */
async function getPractitionerForMember(memberId: string): Promise<string | null> {
  const result = await query<{ id: string }>(
    'SELECT id FROM practitioners WHERE member_id = $1',
    [memberId]
  );
  return result.rows[0]?.id || null;
}

/**
 * GET /api/stellium/pricing
 *
 * Returns tier pricing for the authenticated practitioner.
 */
export async function GET() {
  try {
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
    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Not a practitioner' },
        { status: 403 }
      );
    }

    const pricing = await getTierPricing(practitionerId);

    // Transform to object for easier frontend use
    const pricingMap: Record<string, TierPricing> = {};
    for (const tier of pricing) {
      pricingMap[tier.tier] = tier;
    }

    return NextResponse.json({
      success: true,
      pricing: pricingMap,
    });
  } catch (error) {
    console.error('[Tier Pricing API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get pricing' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stellium/pricing
 *
 * Creates or updates tier pricing.
 *
 * Body:
 * - tier: 'subscriber' | 'vip'
 * - monthly_price_cents: number
 * - annual_price_cents?: number
 * - name?: string
 * - description?: string
 * - features?: string[]
 * - is_active?: boolean
 */
export async function POST(request: NextRequest) {
  try {
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
    const practitionerId = await getPractitionerForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Not a practitioner' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.tier || !['subscriber', 'vip'].includes(body.tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "subscriber" or "vip"' },
        { status: 400 }
      );
    }

    if (typeof body.monthly_price_cents !== 'number' || body.monthly_price_cents < 0) {
      return NextResponse.json(
        { error: 'monthly_price_cents must be a non-negative number' },
        { status: 400 }
      );
    }

    const input: CreateTierPricingInput = {
      tier: body.tier,
      monthly_price_cents: body.monthly_price_cents,
      annual_price_cents: body.annual_price_cents,
      name: body.name,
      description: body.description,
      features: body.features,
      is_active: body.is_active,
    };

    const result = await saveTierPricing(practitionerId, input);

    return NextResponse.json({
      success: true,
      pricing: result,
    });
  } catch (error) {
    console.error('[Tier Pricing API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save pricing' },
      { status: 500 }
    );
  }
}
