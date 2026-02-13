export const dynamic = 'force-dynamic';

/**
 * I CHING CASTING API
 *
 * POST - Cast the I Ching for a change (or set a browsed hexagram).
 *
 * Two modes:
 * 1. Cast: { method: 'yarrow' | 'coin' } — traditional probabilistic cast
 * 2. Browse: { hexagramNumber: 1-64 } — user selects hexagram directly (no changing lines)
 *
 * Updates the change record with hexagram details and advances status to 'active'.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { cast } from '@/lib/iching/casting';
import { getHexagram } from '@/lib/iching/lookup';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: changeId } = await params;

    // Verify change ownership
    const changeResult = await db.query(
      `SELECT id, status FROM studio_changes WHERE id = $1 AND practitioner_id = $2`,
      [changeId, practitionerId]
    );

    if (changeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    if (changeResult.rows[0].status === 'archived') {
      return NextResponse.json({ error: 'Cannot cast for archived change' }, { status: 400 });
    }

    const body = await request.json();
    const { method, hexagramNumber: browsedHexagramNumber } = body;

    let hexagramNumber: number;
    let hexagramName: string;
    let relatingHexagramNumber: number | null = null;
    let changingLines: number[] = [];
    let castingMethod: 'yarrow' | 'coin' | 'browsed';

    // Mode 1: Traditional cast
    if (method) {
      if (method !== 'yarrow' && method !== 'coin') {
        return NextResponse.json({ error: 'Invalid casting method' }, { status: 400 });
      }

      const castResult = cast(method);
      hexagramNumber = castResult.hexagramNumber;
      changingLines = castResult.changingLines;
      relatingHexagramNumber = castResult.relatingHexagramNumber;
      castingMethod = method;

      const hexagram = getHexagram(hexagramNumber);
      if (!hexagram) {
        return NextResponse.json({ error: 'Hexagram lookup failed' }, { status: 500 });
      }
      hexagramName = `${hexagram.english} (${hexagram.name})`;
    }
    // Mode 2: Browse and select
    else if (browsedHexagramNumber) {
      if (browsedHexagramNumber < 1 || browsedHexagramNumber > 64) {
        return NextResponse.json({ error: 'Hexagram number must be between 1 and 64' }, { status: 400 });
      }

      hexagramNumber = browsedHexagramNumber;
      castingMethod = 'browsed';

      const hexagram = getHexagram(hexagramNumber);
      if (!hexagram) {
        return NextResponse.json({ error: 'Hexagram not found' }, { status: 404 });
      }
      hexagramName = `${hexagram.english} (${hexagram.name})`;
      // Browsed hexagrams have no changing lines or relating hexagram
    }
    else {
      return NextResponse.json(
        { error: 'Either method (yarrow/coin) or hexagramNumber must be provided' },
        { status: 400 }
      );
    }

    // Update the change with hexagram data
    const result = await db.query(
      `UPDATE studio_changes
       SET hexagram_number = $1,
           hexagram_name = $2,
           relating_hexagram_number = $3,
           changing_lines = $4,
           casting_method = $5,
           cast_at = NOW(),
           status = CASE WHEN status = 'naming' THEN 'active' ELSE status END,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [hexagramNumber, hexagramName, relatingHexagramNumber, changingLines, castingMethod, changeId]
    );

    const row = result.rows[0];

    // Fetch the full hexagram details to return
    const hexagram = getHexagram(hexagramNumber);
    let relatingHexagram = null;
    if (relatingHexagramNumber) {
      relatingHexagram = getHexagram(relatingHexagramNumber);
    }

    return NextResponse.json({
      change: {
        id: row.id,
        practitionerId: row.practitioner_id,
        memberId: row.member_id,
        clientId: row.client_id,
        teamId: row.team_id,
        title: row.title,
        description: row.description,
        changeType: row.change_type,
        emotionalState: row.emotional_state,
        urgency: row.urgency,
        hexagramNumber: row.hexagram_number,
        hexagramName: row.hexagram_name,
        relatingHexagramNumber: row.relating_hexagram_number,
        changingLines: row.changing_lines || [],
        castingMethod: row.casting_method,
        castAt: row.cast_at,
        councilResult: row.council_result,
        hexagramInterpretation: row.hexagram_interpretation,
        notes: row.notes,
        questions: row.questions || [],
        status: row.status,
        iterationCount: row.iteration_count || 0,
        consultedAt: row.consulted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        parentChangeId: row.parent_change_id,
        rootChangeId: row.root_change_id,
      },
      hexagram,
      relatingHexagram,
    });
  } catch (error) {
    console.error('[Change Cast] Error:', error);
    return NextResponse.json({ error: 'Failed to cast hexagram' }, { status: 500 });
  }
}
