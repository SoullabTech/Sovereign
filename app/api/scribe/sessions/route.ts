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
        s.client_id,
        pc.name AS client_name,
        s.summary->>'clientLabel'                                              AS client_label,
        EXTRACT(EPOCH FROM (COALESCE(s.ended_at, s.started_at) - s.started_at))::int AS duration_seconds,
        COUNT(DISTINCT t.id)::int                                              AS segment_count,
        COUNT(DISTINCT m.id)::int                                              AS marker_count,
        COALESCE(sat_counts.assembled_turns, 0)::int                          AS assembled_turns,
        (sat_counts.assembled_turns IS NOT NULL
         AND sat_counts.assembled_turns > 0)                                  AS has_assembled
       FROM scribe_sessions s
       LEFT JOIN scribe_transcript_entries t ON t.session_id = s.id
       LEFT JOIN scribe_markers m ON m.session_id = s.id
       LEFT JOIN (
         SELECT sv.metadata->>'scribeSessionId' AS scribe_id,
                COUNT(sat.id)::int               AS assembled_turns
         FROM supervision_sessions sv
         JOIN supervision_assembled_turns sat ON sat.session_id = sv.id
         GROUP BY sv.metadata->>'scribeSessionId'
       ) sat_counts ON sat_counts.scribe_id = s.id::text
       LEFT JOIN practitioner_clients pc ON pc.id = s.client_id AND pc.practitioner_id = s.member_id
       WHERE s.member_id = $1 AND s.is_active = false
       GROUP BY s.id, pc.name, sat_counts.assembled_turns
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
