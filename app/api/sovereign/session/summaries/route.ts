/**
 * GET /api/sovereign/session/summaries?memberId=...&limit=5
 *
 * Returns recent session summaries for a member.
 * Used by CORE/DEEP context priming. FAST path should NOT call this.
 *
 * Returns only continuity sessions with non-null summaries.
 * Sanctuary sessions are excluded (they have summary = NULL by design).
 */

import { NextResponse } from 'next/server';
import { SessionSummaryStore } from '@/lib/memory/stores/SessionSummaryStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');
  const limit = Number(searchParams.get('limit') ?? '5');

  if (!memberId) {
    return NextResponse.json(
      { ok: false, error: 'memberId required' },
      { status: 400 }
    );
  }

  try {
    const summaries = await SessionSummaryStore.getRecentSummaries(
      memberId,
      Math.min(Math.max(limit, 1), 10)
    );

    return NextResponse.json({ ok: true, summaries });
  } catch (err: any) {
    console.error('[session/summaries] Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
