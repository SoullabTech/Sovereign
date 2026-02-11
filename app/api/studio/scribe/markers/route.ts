export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/studio/scribe/markers — Add a moment marker during recording
 * GET  /api/studio/scribe/markers — Fetch markers for a session
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, insertOne } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership } from '@/lib/scribe/scribeAuth';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, markerType, note, tsMs } = body;

    if (!sessionId || !markerType || tsMs == null) {
      return NextResponse.json(
        { error: 'sessionId, markerType, and tsMs are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Verify ownership
    const session = await verifySessionOwnership(sessionId, memberId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not owned by member', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Consent gate: witness/practitioner sessions require confirmed consent
    if (session.container !== 'solo' && session.consent_status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Consent not confirmed for this session', code: 'CONSENT_REQUIRED' },
        { status: 403 }
      );
    }

    // Insert marker
    const marker = await insertOne('studio_session_markers', {
      session_id: sessionId,
      ts_ms: tsMs,
      marker_type: markerType,
      ...(note ? { note } : {}),
      chair: session.container,
      created_by: memberId,
    });

    console.log(`[Studio Scribe] Marker "${markerType}" at ${tsMs}ms in session ${sessionId}`);

    return NextResponse.json({
      success: true,
      marker: {
        id: marker.id,
        markerType: marker.marker_type,
        note: marker.note,
        tsMs: marker.ts_ms,
        createdAt: marker.created_at,
      },
    });
  } catch (error: any) {
    console.error('[Studio Scribe] Marker error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add marker', code: 'MARKER_FAILED' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const since = searchParams.get('since');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    // Verify ownership
    const session = await verifySessionOwnership(sessionId, memberId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not owned by member', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Consent gate: witness/practitioner sessions require confirmed consent
    if (session.container !== 'solo' && session.consent_status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Consent not confirmed for this session', code: 'CONSENT_REQUIRED' },
        { status: 403 }
      );
    }

    let sql = `SELECT id, marker_type, note, ts_ms, chair, created_at
               FROM studio_session_markers
               WHERE session_id = $1`;
    const params: any[] = [sessionId];

    if (since) {
      sql += ` AND created_at > $2`;
      params.push(since);
    }

    sql += ` ORDER BY ts_ms ASC`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      markers: result.rows.map((row: any) => ({
        id: row.id,
        markerType: row.marker_type,
        note: row.note,
        tsMs: row.ts_ms,
        chair: row.chair,
        createdAt: row.created_at,
      })),
    });
  } catch (error: any) {
    console.error('[Studio Scribe] Fetch markers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch markers', code: 'FETCH_FAILED' },
      { status: 500 }
    );
  }
}
