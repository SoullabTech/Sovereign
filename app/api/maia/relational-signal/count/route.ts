/**
 * GET /api/maia/relational-signal/count
 *
 * Powers the Relational Field continuity hint: "This has surfaced before."
 * Returns { count } matching prior signals for the authenticated member
 * against an optional tone + counterpart filter.
 *
 * Intentionally narrow. Used only by the Relational Field labtool's
 * reflection step.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { countMatchingSignals } from '@/lib/relationships/relationshipSignalService';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ count: 0, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tone = searchParams.get('tone');
    const counterpart = searchParams.get('counterpart');

    const count = await countMatchingSignals(session.memberId, {
      tone: tone && tone.length > 0 && tone.length < 40 ? tone : null,
      counterpart:
        counterpart && counterpart.length > 0 && counterpart.length < 40 ? counterpart : null,
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error('[api/maia/relational-signal/count] error:', err);
    return NextResponse.json({ count: 0, error: 'Server error' }, { status: 500 });
  }
}
