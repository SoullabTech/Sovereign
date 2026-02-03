/**
 * PUBLIC PRICING API
 *
 * Returns public tier pricing for a practitioner portal.
 * No authentication required - this is for the client-facing subscribe page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicTierPricing } from '@/lib/practitioner/tierPricing';
import { query } from '@/lib/db/postgres';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/portal/[slug]/pricing
 *
 * Returns active tier pricing for the practitioner.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Get practitioner info
    const practitionerResult = await query<{
      id: string;
      name: string;
      stripe_connect_enabled: boolean;
    }>(
      `SELECT id, name, stripe_connect_enabled FROM practitioners WHERE slug = $1`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    const practitioner = practitionerResult.rows[0];

    // Check if payments are enabled
    if (!practitioner.stripe_connect_enabled) {
      return NextResponse.json({
        success: true,
        paymentsEnabled: false,
        practitionerName: practitioner.name,
        pricing: [],
      });
    }

    // Get public pricing
    const pricing = await getPublicTierPricing(slug);

    return NextResponse.json({
      success: true,
      paymentsEnabled: true,
      practitionerName: practitioner.name,
      pricing,
    });
  } catch (error) {
    console.error('[Portal Pricing API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}
