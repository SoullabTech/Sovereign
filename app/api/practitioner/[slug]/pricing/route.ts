/**
 * PRACTITIONER PRICING API
 *
 * Manage tier pricing for a practitioner.
 * GET: Retrieve pricing (public or admin view)
 * PUT: Update pricing (admin only)
 *
 * Security: Admin endpoints use httpOnly session cookie auth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';
import {
  getTierPricing,
  getPublicTierPricing,
  saveTierPricing,
  initializeDefaultPricing,
  type CreateTierPricingInput,
  type TierPricing,
} from '@/lib/practitioner/tierPricing';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/practitioner/[slug]/pricing
 *
 * Get tier pricing for a practitioner.
 * - Public view: Returns active pricing only (no auth required)
 * - Admin view: Returns all pricing (requires practitioner auth)
 *
 * Query params:
 * - view: 'public' (default) or 'admin'
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'public';

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

    if (view === 'admin') {
      // Admin view - requires session auth
      let memberId: string;
      try {
        memberId = await requireMemberId();
      } catch {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify member owns this practitioner
      const ownerResult = await query<{ member_id: string }>(
        'SELECT member_id FROM practitioners WHERE id = $1',
        [practitionerId]
      );

      if (ownerResult.rows[0]?.member_id !== memberId) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }

      // Return full pricing data
      const pricing = await getTierPricing(practitionerId);
      return NextResponse.json({ pricing });
    }

    // Public view - only active pricing
    const pricing = await getPublicTierPricing(slug);
    return NextResponse.json({ pricing });
  } catch (error) {
    console.error('[Practitioner Pricing API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/practitioner/[slug]/pricing
 *
 * Update tier pricing (admin only).
 *
 * Body:
 * - pricing: array of CreateTierPricingInput
 *
 * Auth: httpOnly session cookie
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Require session auth
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

    const body = await request.json();
    const { pricing } = body as { pricing: CreateTierPricingInput[] };

    if (!Array.isArray(pricing)) {
      return NextResponse.json(
        { error: 'Invalid pricing data' },
        { status: 400 }
      );
    }

    // Validate each pricing entry
    for (const entry of pricing) {
      if (!entry.tier || !['subscriber', 'vip'].includes(entry.tier)) {
        return NextResponse.json(
          { error: 'Invalid tier. Must be "subscriber" or "vip"' },
          { status: 400 }
        );
      }

      if (typeof entry.monthly_price_cents !== 'number' || entry.monthly_price_cents < 0) {
        return NextResponse.json(
          { error: 'Invalid monthly_price_cents' },
          { status: 400 }
        );
      }
    }

    // Save each pricing entry
    const results: TierPricing[] = [];
    for (const entry of pricing) {
      const result = await saveTierPricing(practitioner.id, entry);
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      pricing: results,
    });
  } catch (error) {
    console.error('[Practitioner Pricing API] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practitioner/[slug]/pricing
 *
 * Initialize default pricing for a new practitioner.
 *
 * Auth: httpOnly session cookie
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Require session auth
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

    // Check if pricing already exists
    const existingPricing = await getTierPricing(practitioner.id);
    if (existingPricing.length > 0) {
      return NextResponse.json(
        { error: 'Pricing already initialized' },
        { status: 409 }
      );
    }

    // Initialize default pricing
    const pricing = await initializeDefaultPricing(practitioner.id);

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.error('[Practitioner Pricing API] Init error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize pricing' },
      { status: 500 }
    );
  }
}
