export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { respondToPattern } from '@/lib/patterns/respondToPattern';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();

    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const VALID_RESONANCE = ['fits', 'partly', 'not_now', 'no', 'explore'] as const;
    type ResonanceResponse = typeof VALID_RESONANCE[number];

    const resonanceResponse = VALID_RESONANCE.includes(body.resonanceResponse)
      ? (body.resonanceResponse as ResonanceResponse)
      : null;

    // Derive status from resonance if not explicitly provided
    const responseValue: 'confirmed' | 'rejected' =
      body.response === 'confirmed' || body.response === 'rejected'
        ? body.response
        : resonanceResponse === 'fits'
          ? 'confirmed'
          : resonanceResponse === 'no'
            ? 'rejected'
            : 'confirmed'; // partly/explore/not_now keep as confirmed to preserve status

    const responseText =
      typeof body.responseText === 'string' && body.responseText.trim().length > 0
        ? body.responseText.trim()
        : undefined;

    const pattern = await respondToPattern({
      patternId: id,
      memberId: session.memberId,
      response: responseValue,
      resonanceResponse: resonanceResponse ?? undefined,
      responseText,
    });

    if (!pattern) {
      return NextResponse.json(
        { error: 'Pattern not found or no longer available' },
        { status: 404 }
      );
    }

    return NextResponse.json({ pattern }, { status: 200 });
  } catch (error) {
    console.error('POST /api/members/patterns/[id]/response failed:', error);
    return NextResponse.json({ error: 'Failed to respond to pattern' }, { status: 500 });
  }
}
