// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Writer's Studio — the atmosphere a member chose.
 *
 * GET → { atmosphere }   the member's choice, or the default if they have none
 * PUT { atmosphere } → { atmosphere }   a member act, and the only writer
 *
 * ── What this route may never do ──────────────────────────────────────────
 * Read anything about the member to decide this, write it on their behalf,
 * schedule it, or report it anywhere it could become a signal. An atmosphere
 * is a room, not a state: no detector sets it, MAIA does not read it, and
 * nothing branches on it. There is no history — a member who changes their
 * mind has changed their mind, not produced a data point.
 *
 * An unknown id degrades to the default rather than erroring. A member whose
 * stored room was retired should see the Studio, not a failure.
 *
 * Member-scoped by credential. No parameter here can name another member.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { DEFAULT_ATMOSPHERE, isAtmosphereId } from '@/app/writers-studio/atmosphere/atmospheres';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await query<{ atmosphere: string }>(
      `SELECT atmosphere FROM member_studio_atmosphere WHERE member_id = $1`,
      [memberId],
    );
    const stored = result.rows[0]?.atmosphere;
    /* No row means "has not chosen", which is not the same as having chosen
       the default — but it renders identically, and the difference is not the
       Studio's business to record. */
    return NextResponse.json({
      atmosphere: isAtmosphereId(stored) ? stored : DEFAULT_ATMOSPHERE,
    });
  } catch (error) {
    console.error('[sovereign/studio/atmosphere] read failed', error);
    return NextResponse.json({ error: 'Failed to read atmosphere' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { atmosphere } = (body ?? {}) as { atmosphere?: unknown };

    /* Validated against the authored rooms, not against the column. A member
       cannot store a room that does not exist — but an id retired later still
       reads back as the default rather than breaking their Studio. */
    if (!isAtmosphereId(atmosphere)) {
      return NextResponse.json({ error: 'Unknown atmosphere' }, { status: 400 });
    }

    await query(
      `INSERT INTO member_studio_atmosphere (member_id, atmosphere, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (member_id) DO UPDATE
         SET atmosphere = EXCLUDED.atmosphere, updated_at = now()`,
      [memberId, atmosphere],
    );

    return NextResponse.json({ atmosphere });
  } catch (error) {
    console.error('[sovereign/studio/atmosphere] write failed', error);
    return NextResponse.json({ error: 'Failed to save atmosphere' }, { status: 500 });
  }
}
