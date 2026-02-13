export const dynamic = 'force-dynamic';

/**
 * GET /api/studio/scribe/summary?scribeSessionId=xxx
 *
 * Fetches a structured summary of a scribe session for display on the
 * session detail page (Studio > Sessions > [sessionId]).
 *
 * Returns: duration, marker count + highlights, insight count,
 * transcript segment count, and top MAIA exchanges.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function GET(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scribeSessionId = req.nextUrl.searchParams.get('scribeSessionId');
    if (!scribeSessionId) {
      return NextResponse.json({ error: 'scribeSessionId required' }, { status: 400 });
    }

    // Fetch scribe session
    const sessionResult = await db.query(
      `SELECT id, container, memory_policy, consent_status, is_active,
              started_at, ended_at, created_at
       FROM scribe_sessions
       WHERE id = $1 AND member_id = $2`,
      [scribeSessionId, memberId]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Scribe session not found' }, { status: 404 });
    }

    const session = sessionResult.rows[0];

    // Calculate duration
    let durationSeconds = 0;
    if (session.started_at && session.ended_at) {
      durationSeconds = Math.round(
        (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000
      );
    }

    // Count transcript segments (from supervision_transcripts linked via session)
    const segmentResult = await db.query(
      `SELECT COUNT(*) as count FROM supervision_transcripts st
       JOIN supervision_sessions ss ON st.session_id = ss.id
       WHERE ss.metadata->>'scribeSessionId' = $1`,
      [scribeSessionId]
    );
    const segmentCount = parseInt(segmentResult.rows[0]?.count || '0');

    // Fetch markers
    const markerResult = await db.query(
      `SELECT id, marker_type, note, ts_ms, created_at
       FROM scribe_markers
       WHERE session_id = $1
       ORDER BY ts_ms ASC`,
      [scribeSessionId]
    );
    const markers = markerResult.rows.map(m => ({
      id: m.id,
      markerType: m.marker_type,
      note: m.note,
      tsMs: m.ts_ms,
      createdAt: m.created_at,
    }));

    // Count insights
    const insightResult = await db.query(
      `SELECT COUNT(*) as count FROM supervision_insights si
       JOIN supervision_sessions ss ON si.session_id = ss.id
       WHERE ss.metadata->>'scribeSessionId' = $1`,
      [scribeSessionId]
    );
    const insightCount = parseInt(insightResult.rows[0]?.count || '0');

    // Fetch MAIA exchanges (live prompts)
    const promptResult = await db.query(
      `SELECT id, prompt, response, created_at
       FROM scribe_live_prompts
       WHERE session_id = $1
       ORDER BY created_at ASC
       LIMIT 5`,
      [scribeSessionId]
    );
    const exchanges = promptResult.rows.map(p => ({
      id: p.id,
      prompt: p.prompt,
      response: p.response,
      createdAt: p.created_at,
    }));

    return NextResponse.json({
      success: true,
      summary: {
        scribeSessionId: session.id,
        container: session.container,
        memoryPolicy: session.memory_policy,
        durationSeconds,
        segmentCount,
        markerCount: markers.length,
        markers,
        insightCount,
        exchangeCount: exchanges.length,
        exchanges,
        startedAt: session.started_at,
        endedAt: session.ended_at,
      },
    });
  } catch (error) {
    console.error('[Studio Scribe Summary] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scribe summary' },
      { status: 500 }
    );
  }
}
