export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO MODE API
 *
 * GET  — Returns current studio_mode for the practitioner
 * POST — Switches between 'personal' (Field) and 'practice' (operations)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import db from '@/lib/db/postgres';

const VALID_MODES = ['personal', 'practice'] as const;

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ studioMode: identity.studioMode });
  } catch (error) {
    console.error('[Studio Mode] GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
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
      'UPDATE practitioners SET studio_mode = $1 WHERE id = $2',
      [studioMode, identity.practitionerId]
    );

    return NextResponse.json({ studioMode });
  } catch (error) {
    console.error('[Studio Mode] POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
