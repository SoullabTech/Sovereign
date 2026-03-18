export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberVisiblePatterns, getMaiaDetectedPatterns } from '@/lib/patterns/getMemberPatterns';

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [practitionerPatterns, maiaPatterns] = await Promise.all([
      getMemberVisiblePatterns(session.memberId),
      getMaiaDetectedPatterns(session.memberId),
    ]);

    // Deduplicate: if a maia pattern was already surfaced by a practitioner, skip it
    const practitionerThemes = new Set(practitionerPatterns.map((p) => p.theme.toLowerCase()));
    const filteredMaia = maiaPatterns.filter(
      (p) => !practitionerThemes.has(p.theme.toLowerCase())
    );

    const patterns = [...practitionerPatterns, ...filteredMaia];
    return NextResponse.json({ patterns }, { status: 200 });
  } catch (error) {
    console.error('GET /api/members/patterns failed:', error);
    return NextResponse.json({ error: 'Failed to load patterns' }, { status: 500 });
  }
}
