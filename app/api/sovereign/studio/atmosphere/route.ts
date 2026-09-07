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
import {
  DEFAULT_CANVAS_SURFACE,
  isCanvasSurfaceId,
} from '@/app/writers-studio/atmosphere/canvasSurfaces';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await query<{ atmosphere: string; canvas_surface: string | null }>(
      `SELECT atmosphere, canvas_surface FROM member_studio_atmosphere WHERE member_id = $1`,
      [memberId],
    );
    const stored = result.rows[0];
    /* No row means "has not chosen", which is not the same as having chosen
       the default — but it renders identically, and the difference is not the
       Studio's business to record.

       Two axes, read and returned independently: a writer may have chosen a
       room and never a page, or a page and never a room. */
    return NextResponse.json({
      atmosphere: isAtmosphereId(stored?.atmosphere) ? stored.atmosphere : DEFAULT_ATMOSPHERE,
      canvasSurface: isCanvasSurfaceId(stored?.canvas_surface)
        ? stored.canvas_surface
        : DEFAULT_CANVAS_SURFACE,
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
    const { atmosphere, canvasSurface } = (body ?? {}) as {
      atmosphere?: unknown;
      canvasSurface?: unknown;
    };

    /* The two axes are independent, so a write may carry either, or both. A
       request naming neither is a mistake worth refusing rather than a no-op
       worth reporting as success. */
    const setsRoom = atmosphere !== undefined;
    const setsPage = canvasSurface !== undefined;
    if (!setsRoom && !setsPage) {
      return NextResponse.json({ error: 'Nothing to change' }, { status: 400 });
    }

    /* Validated against the authored rooms and materials, not against the
       columns. A member cannot store one that does not exist — but an id
       retired later still reads back as the default rather than breaking their
       Studio.

       The room axis was closed here on 2026-09-07 as unratified and reopened
       the same day by founder act. */
    if (setsRoom && !isAtmosphereId(atmosphere)) {
      return NextResponse.json({ error: 'Unknown atmosphere' }, { status: 400 });
    }
    if (setsPage && !isCanvasSurfaceId(canvasSurface)) {
      return NextResponse.json({ error: 'Unknown canvas material' }, { status: 400 });
    }

    /* COALESCE on the update so choosing a page never silently resets the
       room, and vice versa — the axes must not be able to overwrite each
       other through a partial write. */
    const saved = await query<{ atmosphere: string; canvas_surface: string | null }>(
      `INSERT INTO member_studio_atmosphere (member_id, atmosphere, canvas_surface, updated_at)
       VALUES ($1, COALESCE($2, $4), $3, now())
       ON CONFLICT (member_id) DO UPDATE
         SET atmosphere    = COALESCE($2, member_studio_atmosphere.atmosphere),
             canvas_surface = COALESCE($3, member_studio_atmosphere.canvas_surface),
             updated_at    = now()
     RETURNING atmosphere, canvas_surface`,
      [
        memberId,
        setsRoom ? (atmosphere as string) : null,
        setsPage ? (canvasSurface as string) : null,
        DEFAULT_ATMOSPHERE,
      ],
    );

    const row = saved.rows[0];
    return NextResponse.json({
      atmosphere: isAtmosphereId(row?.atmosphere) ? row.atmosphere : DEFAULT_ATMOSPHERE,
      canvasSurface: isCanvasSurfaceId(row?.canvas_surface)
        ? row.canvas_surface
        : DEFAULT_CANVAS_SURFACE,
    });
  } catch (error) {
    console.error('[sovereign/studio/atmosphere] write failed', error);
    return NextResponse.json({ error: 'Failed to save atmosphere' }, { status: 500 });
  }
}
