/**
 * SESSION PREP API
 *
 * GET /api/practitioner/clients/[clientId]/prep
 *
 * Returns the "Before They Walk In" summary for a client.
 * Everything a practitioner needs to know before a session.
 *
 * AUTHORIZATION: Session-based. Practitioner can only access their own clients.
 */

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { getSessionPrep } from '@/lib/practitioner/sessionPrep';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

/**
 * GET /api/practitioner/clients/[clientId]/prep
 *
 * Auth: Requires valid session. Practitioner ID derived from session.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    // Auth: Get practitioner ID from verified session
    const practitionerId = await requireMemberId();

    const { clientId } = await params;

    const prep = await getSessionPrep(practitionerId, clientId);

    if (!prep) {
      // Return 403 for "client not found" to not leak existence info
      // The library already checks practitioner_id ownership
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ prep });
  } catch (error) {
    // Handle auth errors specifically
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Session Prep API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session prep' },
      { status: 500 }
    );
  }
}
