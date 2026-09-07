// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Writer's Studio — Goals.
 *
 *     The writer declares the goal.
 *     The system may measure progress against it.
 *     MAIA may not invent the goal.
 *
 * GET   — this manuscript's goals, newest first.
 * POST  { kind, statement, metric?, target?, sectionId?, byWhen? }
 *
 * DOCTRINE:
 *
 *   WRITER-DECLARED ONLY. No detector, scheduler, background job or MAIA path
 *   may call this route. FR-12 permits MAIA to reflect a goal, report measured
 *   progress and ask about it; it forbids her to create one, alter a target,
 *   add a deadline, or convert an intention into a metric. There is no column
 *   here for her to write and no automated caller.
 *
 *   PROGRESS IS NEVER STORED. It is counted at read time from material the
 *   writer already has. A stored figure can go stale and then be believed.
 *
 *   NO CLOCK ARITHMETIC (FR-10). `byWhen` is stored as the date the writer
 *   named. Nothing in this file computes with it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export interface WriterGoalRow {
  id: string;
  statement: string;
  kind: 'measurable' | 'intention';
  metric: 'words' | 'sections' | null;
  target: number | null;
  section_id: string | null;
  anchor_heading: string | null;
  living_work_id: string | null;
  by_when: string | null;
  standing: 'open' | 'met' | 'set_aside';
  created_at: string;
  updated_at: string;
}

/**
 * Two forms, because they are read in two different places and the difference
 * is not cosmetic: every SELECT here joins `member_manuscripts`, which also has
 * an `id`, so an unqualified list makes `id` ambiguous and Postgres refuses the
 * whole query at runtime. A unit test cannot see this — it is only true when
 * the statement meets a real database.
 */
const GOAL_COLUMNS_UNQUALIFIED = `id, statement, kind, metric, target, section_id,
  anchor_heading, living_work_id, by_when, standing, created_at, updated_at`;

export const GOAL_COLUMNS = `g.id, g.statement, g.kind, g.metric, g.target, g.section_id,
  g.anchor_heading, g.living_work_id, g.by_when, g.standing, g.created_at, g.updated_at`;

/** The one Work that declares this manuscript, or null. Never a guess. */
async function soleDeclaringWork(memberId: string, manuscriptId: string): Promise<string | null> {
  const res = await query<{ id: string }>(
    `SELECT w.id
       FROM living_works w
       JOIN living_work_expressions e ON e.living_work_id = w.id
      WHERE w.member_id = $1 AND e.expression_type = 'manuscript' AND e.expression_id = $2
      LIMIT 2`,
    [memberId, manuscriptId],
  );
  return res.rows.length === 1 ? res.rows[0].id : null;
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: manuscriptId } = await ctx.params;

    const res = await query<WriterGoalRow>(
      `SELECT ${GOAL_COLUMNS}
         FROM writer_goals g
         JOIN member_manuscripts m ON m.id = g.manuscript_id
        WHERE g.manuscript_id = $1 AND m.member_id = $2
        ORDER BY g.created_at DESC`,
      [manuscriptId, memberId],
    );
    return NextResponse.json({ goals: res.rows });
  } catch (error) {
    console.error('[goals] list failed', error);
    return NextResponse.json({ error: 'Could not read your goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: manuscriptId } = await ctx.params;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { kind, statement, metric, target, sectionId, byWhen } = (payload ?? {}) as Record<string, unknown>;

    if (kind !== 'measurable' && kind !== 'intention') {
      return NextResponse.json({ error: 'kind must be measurable or intention' }, { status: 400 });
    }
    if (typeof statement !== 'string' || statement.trim().length === 0) {
      return NextResponse.json({ error: 'A goal needs to say what it is, in your words' }, { status: 400 });
    }

    /* FR-09 refused at the door as well as in the schema. An intention carrying
       a target is not a validation slip to normalize away — it is the exact
       drift the ruling forbids, so it is REFUSED rather than silently stripped:
       stripping would accept a request whose meaning we disagree with and
       record something the caller did not ask for. */
    if (kind === 'intention' && (metric !== undefined || target !== undefined)) {
      return NextResponse.json(
        { error: 'An intention has no metric and no target. Word count does not make an aim finished.' },
        { status: 400 },
      );
    }
    if (kind === 'measurable') {
      if (metric !== 'words' && metric !== 'sections') {
        return NextResponse.json({ error: 'A measurable goal counts words or sections' }, { status: 400 });
      }
      if (typeof target !== 'number' || !Number.isInteger(target) || target <= 0) {
        return NextResponse.json({ error: 'A measurable goal needs a whole target above zero' }, { status: 400 });
      }
    }
    if (sectionId !== undefined && sectionId !== null && typeof sectionId !== 'string') {
      return NextResponse.json({ error: 'sectionId must be a section of this manuscript' }, { status: 400 });
    }
    if (kind === 'measurable' && metric === 'sections' && typeof sectionId === 'string') {
      return NextResponse.json(
        { error: 'A section count is a whole-manuscript figure; it cannot be scoped to one section.' },
        { status: 400 },
      );
    }
    /* FR-10 — a date, and only a date. Stored as the writer named it. */
    if (byWhen !== undefined && byWhen !== null
        && (typeof byWhen !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(byWhen))) {
      return NextResponse.json({ error: 'byWhen must be a date (YYYY-MM-DD)' }, { status: 400 });
    }

    const owns = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 LIMIT 1`,
      [manuscriptId, memberId],
    );
    if (owns.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    /* The anchor's heading is READ from the section, never taken from the
       caller — it is a record of what was there. */
    let anchorHeading: string | null = null;
    if (typeof sectionId === 'string') {
      const section = await query<{ heading: string | null }>(
        `SELECT heading FROM manuscript_sections WHERE id = $1 AND manuscript_id = $2 LIMIT 1`,
        [sectionId, manuscriptId],
      );
      if (section.rows.length === 0) {
        return NextResponse.json({ error: 'That section is not part of this manuscript' }, { status: 400 });
      }
      anchorHeading = section.rows[0].heading;
    }

    const livingWorkId = await soleDeclaringWork(memberId, manuscriptId);

    const inserted = await query<WriterGoalRow>(
      `INSERT INTO writer_goals
         (member_id, manuscript_id, living_work_id, section_id, anchor_heading,
          kind, metric, target, statement, by_when)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING ${GOAL_COLUMNS_UNQUALIFIED}`,
      [
        memberId, manuscriptId, livingWorkId, sectionId ?? null, anchorHeading,
        kind,
        kind === 'measurable' ? (metric as string) : null,
        kind === 'measurable' ? (target as number) : null,
        statement,
        (byWhen as string | undefined) ?? null,
      ],
    );
    return NextResponse.json({ goal: inserted.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[goals] declare failed', error);
    return NextResponse.json({ error: 'Could not record that goal just now' }, { status: 500 });
  }
}
