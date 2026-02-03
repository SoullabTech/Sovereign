/**
 * CONNECTIONS API
 *
 * GET - List connections (pending, accepted, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { getConnections } from '@/lib/practitioner/trustedColleagues';

export async function GET(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'pending' | 'accepted' | 'declined' | 'blocked' | null;

    const connections = await getConnections(
      memberId,
      status || undefined
    );

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('[Connections GET] Error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
