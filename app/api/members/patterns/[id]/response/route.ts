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

    // Derive status from resonance if not explicitly provided.
    //
    // PH2-001 add-on A: "partly", "explore" and "not_now" previously mapped to
    // 'confirmed'. The comment said "to preserve status", but 'confirmed' is the one
    // value that CHANGES it — respondToPattern's preserve branch (`ELSE status`) was
    // unreachable from this, its only caller. So a member saying "not now" about a
    // pattern they had already rejected restored it to confirmed, and ambivalence was
    // recorded as agreement.
    //
    // Ambivalence is not agreement. The system may not assign stronger standing than
    // the member actually expressed. The member's real answer is still recorded in
    // `resonance_response` and `member_response`; only the STANDING is preserved.
    const responseValue: 'confirmed' | 'rejected' | 'preserve' =
      body.response === 'confirmed' || body.response === 'rejected'
        ? body.response
        : resonanceResponse === 'fits'
          ? 'confirmed'
          : resonanceResponse === 'no'
            ? 'rejected'
            : 'preserve'; // partly / explore / not_now — record the answer, keep the standing

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
