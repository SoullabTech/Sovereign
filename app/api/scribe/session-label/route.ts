export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/session-label
 *
 * Persist (or clear) the practitioner's display label for a session — "the
 * person I was talking with in this session was Cece."
 *
 * This is a continuity aid, NOT identity infrastructure (ruling 2026-07-19):
 * - the label is stored verbatim — whatever name the practitioner gives,
 *   with no validation, normalization, or matching against client records;
 * - NO client record is created or linked (unassigned-first);
 * - no ownership, attribution, or indexing changes.
 *
 * Body: { sessionId: string, label: string | null }  (null/empty clears)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

const MAX_LABEL_CHARS = 120;

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { sessionId, label } = await request.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Missing sessionId', code: 'MISSING_SESSION' },
        { status: 400 }
      );
    }
    if (label !== null && label !== undefined && typeof label !== 'string') {
      return NextResponse.json(
        { error: 'label must be a string or null', code: 'INVALID_LABEL' },
        { status: 400 }
      );
    }
    const trimmed = typeof label === 'string' ? label.trim().slice(0, MAX_LABEL_CHARS) : '';

    // Ownership is the WHERE clause: a session you don't own is untouched and
    // reported as not found, never revealed.
    const result = trimmed
      ? await query(
          `UPDATE scribe_sessions
             SET summary = COALESCE(summary, '{}'::jsonb) || jsonb_build_object('clientLabel', $3::text)
           WHERE id = $1 AND member_id = $2
           RETURNING id`,
          [sessionId, memberId, trimmed]
        )
      : await query(
          `UPDATE scribe_sessions
             SET summary = COALESCE(summary, '{}'::jsonb) - 'clientLabel'
           WHERE id = $1 AND member_id = $2
           RETURNING id`,
          [sessionId, memberId]
        );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, label: trimmed || null });
  } catch (err: any) {
    console.error('[POST /api/scribe/session-label]', err);
    return NextResponse.json({ error: err.message || 'Failed to save label' }, { status: 500 });
  }
}
