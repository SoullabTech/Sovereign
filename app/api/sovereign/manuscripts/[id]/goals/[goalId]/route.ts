// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Writer's Studio — one Goal.
 *
 * PATCH  { standing } — the writer's own account of where it stands.
 * DELETE — the writer releases it.
 *
 * ONLY THE STANDING MOVES, AND ONLY BECAUSE THE WRITER SAID SO (FR-12).
 *
 * There is deliberately no path here to change a target, a metric, a kind or a
 * date. Not "not implemented yet" — absent, because a goal whose target can be
 * revised in place stops being a thing the writer declared and becomes a thing
 * the software negotiated. A writer who wants different terms releases this
 * goal and declares the one they mean; the record then says what actually
 * happened rather than presenting a moved target as the original aim.
 *
 * And nothing computes a standing. An intention is never marked complete
 * automatically, however far a count has travelled: word count does not make an
 * aim finished, which is the whole of FR-09.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import type { WriterGoalRow } from '../route';

const COLUMNS = `id, statement, kind, metric, target, section_id, anchor_heading,
                 living_work_id, by_when, standing, created_at, updated_at`;

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; goalId: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: manuscriptId, goalId } = await ctx.params;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { standing } = (payload ?? {}) as { standing?: unknown };
    if (standing !== 'open' && standing !== 'met' && standing !== 'set_aside') {
      return NextResponse.json({ error: 'standing must be open, met or set_aside' }, { status: 400 });
    }

    const updated = await query<WriterGoalRow>(
      `UPDATE writer_goals g
          SET standing = $4, updated_at = now()
         FROM member_manuscripts m
        WHERE g.id = $1 AND g.manuscript_id = $2
          AND m.id = g.manuscript_id AND m.member_id = $3
      RETURNING ${COLUMNS.replace(/(\w+)(,|$)/g, 'g.$1$2')}`,
      [goalId, manuscriptId, memberId, standing],
    );
    if (updated.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ goal: updated.rows[0] });
  } catch (error) {
    console.error('[goals] standing failed', error);
    return NextResponse.json({ error: 'Could not change that just now' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; goalId: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: manuscriptId, goalId } = await ctx.params;

    const removed = await query<{ id: string }>(
      `DELETE FROM writer_goals g
        USING member_manuscripts m
        WHERE g.id = $1 AND g.manuscript_id = $2
          AND m.id = g.manuscript_id AND m.member_id = $3
      RETURNING g.id`,
      [goalId, manuscriptId, memberId],
    );
    if (removed.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ released: removed.rows[0].id });
  } catch (error) {
    console.error('[goals] release failed', error);
    return NextResponse.json({ error: 'Could not release that goal just now' }, { status: 500 });
  }
}
