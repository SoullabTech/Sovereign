/**
 * CONNECTION BLOCK API
 *
 * POST - Block a connection (prevents future requests)
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

    const connection = await respondToConnection(
      connectionId,
      memberId,
      'blocked'
    );

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('[Connection Block] Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'CONNECTION_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Connection not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to block connection' },
      { status: 500 }
    );
  }
}
