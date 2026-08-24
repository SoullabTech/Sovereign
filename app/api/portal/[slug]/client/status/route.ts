/**
 * CLIENT STATUS API
 *
 * Checks if a member is a client of this practitioner.
 * Used by the subscribe page to determine checkout eligibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/portal/[slug]/client/status
 *
 * Checks if the requesting member is a client of this practitioner.
 *
 * Headers:
 * - x-member-id: Member ID to check
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const memberId = await getMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({
        success: true,
        isClient: false,
      });
    }

    // Get practitioner
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

    // Check if member is a client
    const clientResult = await query<{ id: string; tier: string }>(
      `SELECT id, tier FROM practitioner_clients
       WHERE practitioner_id = $1 AND member_id = $2`,
      [practitionerId, memberId]
    );

    if (clientResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        isClient: false,
      });
    }

    const client = clientResult.rows[0];

    return NextResponse.json({
      success: true,
      isClient: true,
      clientId: client.id,
      currentTier: client.tier,
    });
  } catch (error) {
    console.error('[Client Status API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check client status' },
      { status: 500 }
    );
  }
}
