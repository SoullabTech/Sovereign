export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO MODE API
 *
 * GET  — Returns current studio_mode for the member
 * POST — Switches between 'personal' (Field) and 'practice' (operations)
 *
 * Mode lives on members, not practitioners — it's a member orientation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import db from '@/lib/db/postgres';

const VALID_MODES = ['personal', 'practice'] as const;

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.query(
      'SELECT studio_mode FROM members WHERE id = $1',
      [memberId]
    );

    return NextResponse.json({
      studioMode: result.rows[0]?.studio_mode ?? 'practice',
    });
  } catch (error) {
    console.error('[Studio Mode] GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studioMode } = body;

    if (!studioMode || !(VALID_MODES as readonly string[]).includes(studioMode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "personal" or "practice".' },
        { status: 400 }
      );
    }

    await db.query(
      'UPDATE members SET studio_mode = $1 WHERE id = $2',
      [studioMode, memberId]
    );

    return NextResponse.json({ studioMode });
  } catch (error) {
    console.error('[Studio Mode] POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
