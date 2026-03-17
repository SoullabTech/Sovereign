export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

export async function GET(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT
        s.id,
        s.container,
        s.title,
        s.started_at,
        s.ended_at,
        s.memory_policy,
        s.transcript_enabled,
        EXTRACT(EPOCH FROM (COALESCE(s.ended_at, s.started_at) - s.started_at))::int AS duration_seconds,
        COUNT(t.id)::int AS segment_count,
        COUNT(m.id)::int AS marker_count
       FROM scribe_sessions s
       LEFT JOIN scribe_transcript_entries t ON t.session_id = s.id
       LEFT JOIN scribe_markers m ON m.session_id = s.id
       WHERE s.member_id = $1 AND s.is_active = false
       GROUP BY s.id
       ORDER BY s.started_at DESC
       LIMIT 30`,
      [memberId]
    );

    return NextResponse.json({ sessions: result.rows });
  } catch (err: any) {
    console.error('[GET /api/scribe/sessions]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
