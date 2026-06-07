import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { countOpenAttention } from '@/lib/team/attention';
import { countUnreadDMs } from '@/lib/team/DMService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/team/colab-badge — the top-level Co-lab count for the MAIA field rail.
 *
 * Scope (Kelly directive 2026-06-07): DIRECTED attention only.
 *   total = open For-You attention loops (@mentions / requests addressed to me)
 *         + unread direct messages.
 * Ambient channel activity is DELIBERATELY EXCLUDED — it stays visible inside
 * Co-lab, never a main-field pull. This is coordination (human-authored): it goes
 * to zero when the member handles real obligations and cannot be inflated to
 * manufacture return. It is NOT a MAIA engagement bell.
 */
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [attention, dmUnread] = await Promise.all([
    countOpenAttention(memberId),
    countUnreadDMs(memberId),
  ]);

  return NextResponse.json({ attention, dmUnread, total: attention + dmUnread });
}
