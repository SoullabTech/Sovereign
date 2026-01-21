/**
 * CONNECTION RESPOND API
 *
 * POST - Accept or decline a connection request
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { respondToConnection } from '@/lib/practitioner/trustedColleagues';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id: connectionId } = await params;
    const body = await request.json();

    if (!body.response || !['accepted', 'declined'].includes(body.response)) {
      return NextResponse.json(
        { error: 'response must be "accepted" or "declined"' },
        { status: 400 }
      );
    }

    const connection = await respondToConnection(
      connectionId,
      memberId,
      body.response
    );

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('[Connection Respond] Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'CONNECTION_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Connection request not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to respond to connection' },
      { status: 500 }
    );
  }
}
