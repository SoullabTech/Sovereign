export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * GET /api/capture/timeline?sessionId=...   (USC-03 — Session Room convergence)
 *
 * One session, one timeline, any device.
 *
 * Merges the two write paths that exist today into a single ordered read model:
 *   - scribe_markers   in-room markers made at the desk (pre-existing, untouched)
 *   - session_captures captures from any surface (web / phone / watch / Siri)
 *
 * Convergence debt is deliberate and named: two write paths, one read model.
 * The gate for folding markers into captures is a verified live capture path
 * (a watch/phone capture surfacing in Session Room under real use). Until then
 * the live practitioner surface is not migrated.
 *
 * Every entry is L0-L2 only. No MAIA-derived material appears here; a derived
 * note references this timeline rather than joining it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership } from '@/lib/scribe/scribeAuth';
import { getSessionCaptures } from '@/lib/capture/sessionCapture';

type TimelineOrigin = 'marker' | 'capture';

interface TimelineEntry {
  id: string;
  origin: TimelineOrigin;
  at: string;
  offsetMs: number | null;
  /** marker_type for markers; capture kind/modality for captures */
  label: string;
  note: string | null;
  source: string;
  modality: string | null;
  promoted: boolean;
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
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    // Ownership via the existing Session Room gate.
    const session = await verifySessionOwnership(sessionId, memberId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not owned by member', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const startedMs = session.started_at.getTime();

    // Path A — pre-existing in-room markers.
    const markerRows = await query(
      `SELECT id, marked_at, marker_type, note, marked_by
         FROM scribe_markers
        WHERE session_id = $1
        ORDER BY marked_at ASC`,
      [sessionId]
    );

    const markerEntries: TimelineEntry[] = markerRows.rows.map((m: any) => {
      const at = m.marked_at instanceof Date ? m.marked_at : new Date(m.marked_at);
      return {
        id: m.id,
        origin: 'marker',
        at: at.toISOString(),
        offsetMs: Math.max(0, at.getTime() - startedMs),
        label: m.marker_type,
        note: m.note ?? null,
        // Markers predate source tracking; they were all made in the room.
        source: 'web',
        modality: null,
        promoted: false,
      };
    });

    // Path B — universal captures (decrypted inside the data layer).
    const captures = await getSessionCaptures(sessionId, memberId);
    const captureEntries: TimelineEntry[] = captures.map((c) => ({
      id: c.id,
      origin: 'capture',
      at: c.capturedAt,
      offsetMs: c.sessionOffsetMs,
      label: c.kind ?? c.modality,
      note: c.content ?? c.transcript ?? null,
      source: c.source,
      modality: c.modality,
      promoted: c.promotedAtomId !== null,
    }));

    const timeline = [...markerEntries, ...captureEntries].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
    );

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        container: session.container,
        title: session.title,
        startedAt: session.started_at.toISOString(),
        memoryPolicy: session.memory_policy,
      },
      timeline,
      counts: {
        total: timeline.length,
        markers: markerEntries.length,
        captures: captureEntries.length,
      },
    });
  } catch (error: any) {
    console.error('[capture] timeline failed:', error?.message);
    return NextResponse.json(
      { error: 'Failed to load session timeline', code: 'TIMELINE_FAILED' },
      { status: 500 }
    );
  }
}
