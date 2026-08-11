/**
 * Relationship Entries API — Timeline
 *
 * GET  — Paginated entries
 * POST — Create entry (note, reflection, threshold, rupture, repair)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insertOne } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { constrainForDisplay } from '@/lib/relationships/articleIIIBoundary';
import { resolveWriteProvenance, MEMBER_AUTHORED } from '@/lib/relationships/entryProvenance';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Depth is the design target, not recency: the room must be able to reach
    // the beginning of a long relationship, so the ceiling is generous.
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    // Verify ownership
    const rel = await queryOne(
      `SELECT id FROM member_relationships WHERE id = $1 AND member_id = $2 AND archived_at IS NULL`,
      [id, session.memberId]
    );
    if (!rel) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const entries = await query(
      `SELECT id, kind, felt_signals, free_text, maia_reflection, pattern_hint,
              field_tone_snapshot, suggested_movement, content, confidence, provenance, created_at
       FROM relationship_entries
       WHERE relationship_id = $1 AND member_id = $2
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [id, session.memberId, limit, offset]
    );

    return NextResponse.json({
      success: true,
      entries: entries.rows.map(e => ({
        id: e.id,
        kind: e.kind,
        feltSignals: e.felt_signals,
        freeText: e.free_text,
        maiaReflection: constrainForDisplay(e.maia_reflection, 'reflection'),
        patternHint: e.pattern_hint,
        fieldToneSnapshot: e.field_tone_snapshot,
        suggestedMovement: constrainForDisplay(e.suggested_movement, 'movement'),
        content: e.content,
        confidence: e.confidence,
        provenance: e.provenance,
        createdAt: e.created_at,
      })),
    });
  } catch (error) {
    console.error('[relationships/entries] GET error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { kind, content } = body;

    const validKinds = ['note', 'reflection', 'threshold', 'rupture', 'repair'];
    if (!validKinds.includes(kind)) {
      return NextResponse.json({ success: false, error: 'Invalid kind' }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    // Verify ownership
    const rel = await queryOne(
      `SELECT id FROM member_relationships WHERE id = $1 AND member_id = $2 AND archived_at IS NULL`,
      [id, session.memberId]
    );
    if (!rel) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // WHO is writing — not merely whose record this is. A valid session proves
    // which member record the write belongs to; it does NOT prove a human
    // member typed it. Derived server-side, never accepted from the body.
    const { provenance, reason } = resolveWriteProvenance(request);
    if (provenance !== MEMBER_AUTHORED) {
      console.warn(
        `[relationships/entries] non-member write → provenance=${provenance} (${reason}); ` +
          'will not render as the member\'s own words',
      );
    }

    const row = await insertOne('relationship_entries', {
      relationship_id: id,
      member_id: session.memberId,
      kind,
      content: content.trim(),
      provenance,
    });

    // Update relationship's updated_at
    await query(
      `UPDATE member_relationships SET updated_at = NOW() WHERE id = $1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      entry: {
        id: row.id,
        kind: row.kind,
        content: row.content,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('[relationships/entries] POST error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
