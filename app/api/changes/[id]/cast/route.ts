export const dynamic = 'force-dynamic';

/**
 * MEMBER I CHING CASTING API
 *
 * POST - Cast the I Ching for a member's change.
 * Two modes: traditional cast (yarrow/coin) or browse (select hexagram directly).
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { cast } from '@/lib/iching/casting';
import { getHexagram } from '@/lib/iching/lookup';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: changeId } = await params;

    // Verify change ownership
    const changeResult = await db.query(
      `SELECT id, status FROM studio_changes WHERE id = $1 AND member_id = $2`,
      [changeId, memberId]
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
    } else if (browsedHexagramNumber) {
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
    } else {
      return NextResponse.json(
        { error: 'Either method (yarrow/coin) or hexagramNumber must be provided' },
        { status: 400 }
      );
    }

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
    const hexagram = getHexagram(hexagramNumber);
    let relatingHexagram = null;
    if (relatingHexagramNumber) {
      relatingHexagram = getHexagram(relatingHexagramNumber);
    }

    return NextResponse.json({
      change: {
        id: row.id,
        memberId: row.member_id,
        title: row.title,
        hexagramNumber: row.hexagram_number,
        hexagramName: row.hexagram_name,
        relatingHexagramNumber: row.relating_hexagram_number,
        changingLines: row.changing_lines || [],
        castingMethod: row.casting_method,
        castAt: row.cast_at,
        status: row.status,
      },
      hexagram,
      relatingHexagram,
    });
  } catch (error) {
    console.error('[Member Change Cast] Error:', error);
    return NextResponse.json({ error: 'Failed to cast hexagram' }, { status: 500 });
  }
}
