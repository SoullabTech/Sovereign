import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { loadSpiralState } from '@/lib/consciousness/spiralStatePersistence';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spiralState = await loadSpiralState(session.memberId);

    if (!spiralState) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        exists: true,
        currentElement: spiralState.dominant_element,
        phase: spiralState.phase,
        motion: spiralState.motion ?? null,
        autonomyStreak: spiralState.autonomy_streak,
        updatedAt: spiralState.updated_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/members/spiral-state failed:', error);
    return NextResponse.json(
      { error: 'Failed to load spiral state' },
      { status: 500 }
    );
  }
}
