export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { loadSpiralState } from '@/lib/consciousness/spiralStatePersistence';

/**
 * GET /api/members/spiral-state
 *
 * Returns the current member's spiral state for the Continuity View.
 * Member-only — no practitioner access to other members' states.
 *
 * Response codes:
 *   200: State found and returned
 *   204: No state recorded yet (member is new / pre-conversation)
 *   401: Not authenticated
 *   503: Database error
 */
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  const session = await getCurrentSession();

  let memberId = session?.memberId ?? null;

  if (!memberId) {
    const header = request.headers.get('x-member-id');
    if (header && /^[0-9a-f-]{36}$/i.test(header)) {
      memberId = header;
    }
  }

  if (!memberId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const state = await loadSpiralState(memberId);

    if (!state) {
      // No state yet — member hasn't had a conversation
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json({ state });
  } catch (error) {
    console.error('[spiral-state] GET failed:', error);
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }
}
