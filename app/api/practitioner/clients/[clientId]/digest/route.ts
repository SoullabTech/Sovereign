/**
 * CLIENT MESSAGE DIGEST API
 *
 * GET /api/practitioner/clients/[clientId]/digest
 *
 * Get message digest for session prep.
 * Returns messages since last session for this client.
 *
 * AUTHORIZATION: Session-based. Practitioner can only access their own clients.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { getMessageDigest } from '@/lib/practitioner/messages';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

/**
 * GET /api/practitioner/clients/[clientId]/digest
 *
 * Get messages since last session for session prep view.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { clientId } = await params;

    const digest = await getMessageDigest(practitionerId, clientId);

    if (!digest) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ digest });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Client Digest API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch digest' },
      { status: 500 }
    );
  }
}
