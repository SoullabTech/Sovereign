/**
 * Relationship Detail API — Get, Update, Archive
 *
 * GET    — Full detail with field state + recent entries
 * PATCH  — Update name, bond type, note
 * DELETE — Soft archive
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { constrainForDisplay } from '@/lib/relationships/articleIIIBoundary';
import { detectUnresolvedThreads } from '@/lib/consciousness/unresolvedThreads';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const relationship = await queryOne(
      `SELECT id, name, realm, bond_type, note, origin, created_at, updated_at
       FROM member_relationships
       WHERE id = $1 AND member_id = $2 AND archived_at IS NULL`,
      [id, session.memberId]
    );

    if (!relationship) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // Field state may not exist yet — that's valid
    const fieldState = await queryOne(
      `SELECT field_tone, active_signals, dominant_pattern, developmental_theme,
              elemental_dynamics, last_checkin_at, updated_at
       FROM relationship_field_state
       WHERE relationship_id = $1`,
      [id]
    );

    // History.
    //
    // A relationship must become MORE representable as history accumulates,
    // not less. This query used to stop at a silent `LIMIT 20` — a 25-year
    // relationship simply lost its past with no indication that anything had
    // been withheld. A record that quietly stops is worse than one that says
    // where it stops, so the page size is larger AND the true total is
    // returned, so the room can say what remains and go get it.
    const HISTORY_PAGE_SIZE = 100;

    const entries = await query(
      `SELECT id, kind, felt_signals, free_text, maia_reflection, pattern_hint,
              field_tone_snapshot, suggested_movement, content, confidence, provenance, created_at
       FROM relationship_entries
       WHERE relationship_id = $1 AND member_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [id, session.memberId, HISTORY_PAGE_SIZE]
    );

    const totalRow = await queryOne(
      `SELECT COUNT(*)::int AS total, MIN(created_at) AS first_at
       FROM relationship_entries
       WHERE relationship_id = $1 AND member_id = $2`,
      [id, session.memberId]
    );

    return NextResponse.json({
      success: true,
      relationship: {
        id: relationship.id,
        name: relationship.name,
        realm: relationship.realm,
        bondType: relationship.bond_type,
        note: relationship.note,
        // Provenance of the ROW: 'member' = the member made this;
        // 'system' = a container the system created for what it could not
        // resolve. Says nothing about the entries inside it.
        origin: relationship.origin || 'member',
        createdAt: relationship.created_at,
        updatedAt: relationship.updated_at,
      },
      fieldState: fieldState ? {
        fieldTone: fieldState.field_tone,
        activeSignals: fieldState.active_signals,
        dominantPattern: fieldState.dominant_pattern,
        developmentalTheme: fieldState.developmental_theme,
        elementalDynamics: fieldState.elemental_dynamics,
        lastCheckinAt: fieldState.last_checkin_at,
      } : null,
      entries: entries.rows.map(e => ({
        id: e.id,
        kind: e.kind,
        feltSignals: e.felt_signals,
        // The member's own words pass through untouched — always.
        freeText: e.free_text,
        // MAIA's words do not. Rows written before the Article III boundary
        // existed still hold claims about the other person ("that omission was
        // its own kind of agreement between you"). Those are WITHHELD at read
        // rather than rewritten in place — the same discipline as the
        // provenance work: never edit what a member's record already contains.
        maiaReflection: constrainForDisplay(e.maia_reflection, 'reflection'),
        patternHint: constrainForDisplay(e.pattern_hint, 'pattern'),
        fieldToneSnapshot: e.field_tone_snapshot,
        suggestedMovement: constrainForDisplay(e.suggested_movement, 'movement'),
        content: e.content,
        confidence: e.confidence,
        provenance: e.provenance,
        createdAt: e.created_at,
      })),
      // Say where the record stops, and where it began.
      history: {
        total: totalRow?.total ?? entries.rows.length,
        returned: entries.rows.length,
        firstAt: totalRow?.first_at ?? null,
      },
      unresolvedThreads: detectUnresolvedThreads(entries.rows.map(e => ({
        kind: e.kind,
        feltSignals: e.felt_signals,
        fieldToneSnapshot: e.field_tone_snapshot,
        createdAt: e.created_at,
      }))),
    });
  } catch (error) {
    console.error('[relationships/id] GET error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, bondType, note } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }
    if (bondType !== undefined) {
      updates.push(`bond_type = $${paramIndex++}`);
      values.push(bondType || null);
    }
    if (note !== undefined) {
      updates.push(`note = $${paramIndex++}`);
      values.push(note || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);

    const result = await queryOne(
      `UPDATE member_relationships
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex++} AND member_id = $${paramIndex}
       RETURNING id, name, realm, bond_type, note, updated_at`,
      [...values, id, session.memberId]
    );

    if (!result) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, relationship: result });
  } catch (error) {
    console.error('[relationships/id] PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const result = await queryOne(
      `UPDATE member_relationships
       SET archived_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND member_id = $2 AND archived_at IS NULL
       RETURNING id`,
      [id, session.memberId]
    );

    if (!result) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[relationships/id] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
