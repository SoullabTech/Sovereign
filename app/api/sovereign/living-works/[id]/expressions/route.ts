// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Living Work expressions — the member declares a form (Work Continuity
 * Layer, first slice; ruled 2026-08-05).
 *
 * POST   — "this is a form of this Work." The first write path
 *          living_work_expressions has ever had, and it is a MEMBER
 *          DECLARATION, not a file attachment (founder ruling). Nothing else
 *          may create these rows: not import, not arrival, not display logic
 *          (no silent promotion — Amendment 5).
 * DELETE — the member un-declares. Removes the relationship, never the thing.
 *
 * Guard 1 lives in lib/livingWork/domain.ts (refuseDeclaration) and gets its
 * first caller here: the declaring member must OWN the Living Work, and — for
 * the manuscript type — must own the manuscript too. A declaration about
 * someone else's artifact is refused before it exists.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { refuseDeclaration } from '@/lib/livingWork/domain';

const MAX_TYPE_CHARS = 80;

interface WorkOwnerRow {
  id: string;
  member_id: string;
}
interface MembershipRow {
  id: string;
  expression_type: string;
  expression_id: string;
  declared_at: string;
}

async function ownedWork(id: string, memberId: string): Promise<WorkOwnerRow | null> {
  const r = await query<WorkOwnerRow>(
    `SELECT id, member_id FROM living_works WHERE id = $1 AND member_id = $2`,
    [id, memberId]
  );
  return r.rows[0] ?? null;
}

/**
 * The declared thing must be the member's own. Checked per type; a type this
 * route cannot yet verify is refused rather than trusted — openness of the
 * ontology (`expression_type` is open TEXT) is not openness of this gate.
 */
async function memberOwnsExpression(
  expressionType: string,
  expressionId: string,
  memberId: string
): Promise<boolean> {
  if (expressionType === 'manuscript') {
    const r = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [expressionId, memberId]
    );
    return r.rows.length > 0;
  }
  return false;
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      expressionType?: unknown;
      expressionId?: unknown;
    };
    const expressionType =
      typeof body.expressionType === 'string' ? body.expressionType.trim() : '';
    const expressionId = typeof body.expressionId === 'string' ? body.expressionId : '';
    if (expressionType.length > MAX_TYPE_CHARS) {
      return NextResponse.json({ error: 'expressionType too long' }, { status: 400 });
    }

    const work = await ownedWork(id, memberId);
    const refusal = refuseDeclaration(
      { livingWorkId: id, expressionType, expressionId, declaredBy: memberId },
      work ? { id: work.id, memberId: work.member_id } : null
    );
    if (refusal === 'missing_living_work') {
      // Not-found and not-owned are the same answer: no existence leak.
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (refusal) return NextResponse.json({ error: refusal }, { status: 400 });

    if (!(await memberOwnsExpression(expressionType, expressionId, memberId))) {
      return NextResponse.json({ error: 'missing_expression' }, { status: 400 });
    }

    /* Declaring twice is not an error — the member already said this, and the
       original declaration (its date, its act) is preserved, not overwritten. */
    const inserted = await query<MembershipRow>(
      `INSERT INTO living_work_expressions
         (living_work_id, expression_type, expression_id, declared_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (living_work_id, expression_type, expression_id) DO NOTHING
       RETURNING id, expression_type, expression_id, declared_at`,
      [id, expressionType, expressionId, memberId]
    );
    const row =
      inserted.rows[0] ??
      (
        await query<MembershipRow>(
          `SELECT id, expression_type, expression_id, declared_at
             FROM living_work_expressions
            WHERE living_work_id = $1 AND expression_type = $2 AND expression_id = $3`,
          [id, expressionType, expressionId]
        )
      ).rows[0];

    console.log(
      `[MAIA/press] expression declared { memberIdPrefix: ${memberId.slice(0, 8)}, ` +
        `workId: ${id}, type: ${expressionType} }`
    );
    return NextResponse.json(
      {
        expression: {
          id: row.id,
          expressionType: row.expression_type,
          expressionId: row.expression_id,
          declaredAt: row.declared_at,
        },
      },
      { status: inserted.rows.length > 0 ? 201 : 200 }
    );
  } catch (error) {
    console.error('[living-works/expressions] declare failed', error);
    return NextResponse.json({ error: 'Could not record that declaration' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      expressionType?: unknown;
      expressionId?: unknown;
    };
    const expressionType =
      typeof body.expressionType === 'string' ? body.expressionType.trim() : '';
    const expressionId = typeof body.expressionId === 'string' ? body.expressionId : '';
    if (!expressionType || !expressionId) {
      return NextResponse.json({ error: 'expressionType and expressionId required' }, { status: 400 });
    }

    // Member-scoped through the work in one predicate; removes the
    // DECLARATION only. The manuscript is untouched by construction.
    const removed = await query<{ id: string }>(
      `DELETE FROM living_work_expressions e
        USING living_works w
        WHERE e.living_work_id = w.id
          AND w.id = $1 AND w.member_id = $2
          AND e.expression_type = $3 AND e.expression_id = $4
        RETURNING e.id`,
      [id, memberId, expressionType, expressionId]
    );
    if (removed.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ withdrawn: removed.rows[0].id });
  } catch (error) {
    console.error('[living-works/expressions] withdraw failed', error);
    return NextResponse.json({ error: 'Could not withdraw that declaration' }, { status: 500 });
  }
}
