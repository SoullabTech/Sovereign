// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Living Work expressions — the member declares that an expression belongs to
 * a work (Work Home, Slice 6). This file is the FIRST writer of
 * `living_work_expressions`; until it existed the table had no writer at all.
 *
 * POST   — "this belongs to that work." A member act, never a side effect.
 * DELETE — the member takes the declaration back. The expression itself is
 *          untouched: removing "this belongs to that" removes a statement,
 *          not the thing stated about.
 *
 * WHAT THIS ROUTE REFUSES:
 *
 *   - **No system placement.** There is no classification, no "seems related",
 *     no bulk adopt. One expression per declaration, named by the member.
 *   - **Only expression types the Studio can actually hold.** `expression_type`
 *     is open in the schema by ratified design, but this route accepts only
 *     'manuscript' — the one instrument that exists. Accepting a type the
 *     Studio cannot show would store a claim no surface can honor.
 *   - **Ownership on both ends.** The declaring member must own the work
 *     (refuseDeclaration, Guard 1) AND the manuscript. A foreign id on either
 *     side is a 404, not a hint that the row exists.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { refuseDeclaration } from '@/lib/livingWork/domain';

/** The one expression type the Studio can currently hold. */
const DECLARABLE_TYPES = ['manuscript'] as const;

interface ExpressionRow {
  id: string;
  expression_type: string;
  expression_id: string;
  declared_at: string;
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id: livingWorkId } = await ctx.params;
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      expressionType?: unknown;
      expressionId?: unknown;
    };
    const expressionType = typeof body.expressionType === 'string' ? body.expressionType : '';
    const expressionId = typeof body.expressionId === 'string' ? body.expressionId : '';

    if (!(DECLARABLE_TYPES as readonly string[]).includes(expressionType)) {
      return NextResponse.json(
        { error: 'Only a manuscript can be placed in a work for now' },
        { status: 400 }
      );
    }

    // Fetch by id alone and let the domain guard decide ownership, so the
    // ratified refusal order is the one actually exercised. Both "no such
    // work" and "someone else's work" leave as 404: a foreign id learns
    // nothing.
    const workRes = await query<{ id: string; member_id: string }>(
      `SELECT id, member_id FROM living_works WHERE id = $1`,
      [livingWorkId]
    );
    const work = workRes.rows[0]
      ? { id: workRes.rows[0].id, memberId: workRes.rows[0].member_id }
      : null;

    const refusal = refuseDeclaration(
      { livingWorkId, expressionType, expressionId, declaredBy: memberId },
      work
    );
    if (refusal === 'missing_living_work' || refusal === 'not_the_owner') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (refusal !== null) {
      return NextResponse.json({ error: refusal }, { status: 400 });
    }

    const manuscript = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [expressionId, memberId]
    );
    if (manuscript.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Declaring twice is not an error — the member is saying something already
    // true. The unique constraint absorbs it; the response says which happened.
    const inserted = await query<ExpressionRow>(
      `INSERT INTO living_work_expressions
         (living_work_id, expression_type, expression_id, declared_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (living_work_id, expression_type, expression_id) DO NOTHING
       RETURNING id, expression_type, expression_id, declared_at`,
      [livingWorkId, expressionType, expressionId, memberId]
    );
    if (inserted.rows.length === 0) {
      return NextResponse.json({ alreadyDeclared: true }, { status: 200 });
    }
    const r = inserted.rows[0];
    return NextResponse.json(
      {
        expression: {
          id: r.id,
          expressionType: r.expression_type,
          expressionId: r.expression_id,
          declaredAt: r.declared_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[living-works] declare expression failed', error);
    return NextResponse.json({ error: 'Could not place that in your work' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id: livingWorkId } = await ctx.params;
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const expressionType = url.searchParams.get('expressionType') ?? '';
    const expressionId = url.searchParams.get('expressionId') ?? '';
    if (!expressionType || !expressionId) {
      return NextResponse.json({ error: 'expressionType and expressionId required' }, { status: 400 });
    }

    // Member-scoped through the owning work, in the predicate: a declaration
    // on someone else's work cannot be reached, let alone removed.
    const removed = await query<{ id: string }>(
      `DELETE FROM living_work_expressions e
        USING living_works w
        WHERE e.living_work_id = w.id
          AND w.id = $1 AND w.member_id = $2
          AND e.expression_type = $3 AND e.expression_id = $4
       RETURNING e.id`,
      [livingWorkId, memberId, expressionType, expressionId]
    );
    if (removed.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ withdrawn: removed.rows[0].id });
  } catch (error) {
    console.error('[living-works] withdraw expression failed', error);
    return NextResponse.json({ error: 'Could not remove that from your work' }, { status: 500 });
  }
}
