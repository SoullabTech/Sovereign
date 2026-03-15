export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberVisiblePatterns } from '@/lib/patterns/getMemberPatterns';

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patterns = await getMemberVisiblePatterns(session.memberId);
    return NextResponse.json({ patterns }, { status: 200 });
  } catch (error) {
    console.error('GET /api/members/patterns failed:', error);
    return NextResponse.json({ error: 'Failed to load patterns' }, { status: 500 });
  }
}
