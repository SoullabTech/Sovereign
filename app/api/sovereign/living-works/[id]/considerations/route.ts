// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Living Work material considerations — the member weighed a thing and did not
 * declare that it belongs (WS2-SUBSTRATE-01 Repair 2; founder-ruled
 * 2026-08-28).
 *
 * POST   — "I've considered this." `maybe` (unresolved) or `not_now`
 *          (declined or deferred). Neither asserts belonging.
 * DELETE — the member takes the consideration back. The material is untouched:
 *          removing "I considered this" removes a statement about a thing,
 *          not the thing.
 *
 * THE FOUR TRUTHFUL STATES of a material/Work pair, across two tables:
 *
 *   no row anywhere                       untouched · never considered
 *   consideration, state='maybe'          considered, unresolved
 *   consideration, state='not_now'        considered, declined/deferred
 *   living_work_materials row exists      BELONGS
 *
 * `belongs` is NOT a state here. Belonging is the declaration row's existence.
 * The two are mutually exclusive, enforced by database triggers that REFUSE
 * rather than silently clear — so the transition stays a visible member act in
 * this file instead of a hidden side effect in the schema.
 *
 * WHAT THIS ROUTE REFUSES:
 *
 *   - **No system consideration.** Nothing considers a material on the
 *     member's behalf. No "seems related", no bulk pass, no MAIA inference.
 *   - **No belonging by the back door.** This route never writes
 *     living_work_materials except as the DELETE half of an explicit
 *     Belongs → Maybe/Not now transition the member asked for.
 *   - **Ownership on both ends**, like its siblings: the member must own the
 *     work AND the material. A foreign id is a 404, never a hint.
 *
 * NO HISTORY. Re-considering updates the row and moves acted_by/acted_at to
 * the latest act. See the migration for why a relationship ledger is not built
 * here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { memberRef } from '@/lib/privacy/memberRef';

const MAX_TYPE_CHARS = 80;
const STATES = new Set(['maybe', 'not_now']);

interface ConsiderationRow {
  id: string;
  material_type: string;
  material_id: string;
  state: string;
  acted_at: string;
}

/**
 * The same gate the materials route uses, and for the same reason: the
 * ontology's openness is not this route's openness. A type it cannot verify is
 * refused rather than trusted.
 */
async function memberOwnsMaterial(
  materialType: string,
  materialId: string,
  memberId: string
): Promise<boolean> {
  if (materialType === 'manuscript') {
    const r = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [materialId, memberId]
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
      materialType?: unknown;
      materialId?: unknown;
      state?: unknown;
    };
    const materialType = typeof body.materialType === 'string' ? body.materialType.trim() : '';
    const materialId = typeof body.materialId === 'string' ? body.materialId : '';
    const state = typeof body.state === 'string' ? body.state : '';

    if (!materialType || !materialId) {
      return NextResponse.json({ error: 'materialType and materialId required' }, { status: 400 });
    }
    if (materialType.length > MAX_TYPE_CHARS) {
      return NextResponse.json({ error: 'materialType too long' }, { status: 400 });
    }
    /* Naming the permitted states in the refusal: the caller learns what is
       allowed instead of guessing. 'belongs' is not among them by design. */
    if (!STATES.has(state)) {
      return NextResponse.json(
        { error: "state must be 'maybe' or 'not_now'" },
        { status: 400 }
      );
    }

    /* Silence doctrine, matching the expressions and materials routes:
       no-such-work, someone-else's-work and someone-else's-material all answer
       404. A foreign id learns nothing from the difference. */
    const workRow = await query<{ id: string }>(
      `SELECT id FROM living_works WHERE id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (workRow.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (!(await memberOwnsMaterial(materialType, materialId, memberId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    /* The transition, explicit and in ONE transaction.
       Belongs → Maybe/Not now is: withdraw the declaration, record the
       consideration. Both halves or neither — a crash between them would leave
       the member's material belonging to nothing and considered by no one. */
    const { row, withdrewBelonging } = await transaction(async (client) => {
      const removed = await client.query(
        `DELETE FROM living_work_materials
          WHERE living_work_id = $1 AND material_type = $2 AND material_id = $3
        RETURNING id`,
        [id, materialType, materialId]
      );

      /* Re-considering is the member changing their mind, not an error. The
         row carries their CURRENT stance, so the later act replaces the
         earlier one — and acted_by/acted_at move with it. */
      const upserted = await client.query(
        `INSERT INTO living_work_material_considerations
           (living_work_id, material_type, material_id, state, acted_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (living_work_id, material_type, material_id)
         DO UPDATE SET state = EXCLUDED.state,
                       acted_by = EXCLUDED.acted_by,
                       acted_at = now()
         RETURNING id, material_type, material_id, state, acted_at`,
        [id, materialType, materialId, state, memberId]
      );

      return {
        row: upserted.rows[0] as ConsiderationRow,
        withdrewBelonging: removed.rows.length > 0,
      };
    });

    console.log(
      `[MAIA/press] material considered { memberRef: ${memberRef(memberId)}, ` +
        `workId: ${id}, type: ${materialType}, state: ${state}, ` +
        `withdrewBelonging: ${withdrewBelonging} }`
    );

    return NextResponse.json({
      consideration: {
        id: row.id,
        materialType: row.material_type,
        materialId: row.material_id,
        state: row.state,
        actedAt: row.acted_at,
      },
      withdrewBelonging,
    });
  } catch (error) {
    console.error('[living-works/considerations] consider failed', error);
    return NextResponse.json({ error: 'Could not record that' }, { status: 500 });
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
      materialType?: unknown;
      materialId?: unknown;
    };
    const materialType = typeof body.materialType === 'string' ? body.materialType.trim() : '';
    const materialId = typeof body.materialId === 'string' ? body.materialId : '';
    if (!materialType || !materialId) {
      return NextResponse.json({ error: 'materialType and materialId required' }, { status: 400 });
    }

    /* Member-scoped through the owning work IN THE PREDICATE, like the
       expressions route: a consideration on someone else's work cannot be
       reached, let alone removed. */
    const removed = await query<{ id: string }>(
      `DELETE FROM living_work_material_considerations c
        USING living_works w
        WHERE c.living_work_id = w.id
          AND w.id = $1 AND w.member_id = $2
          AND c.material_type = $3 AND c.material_id = $4
       RETURNING c.id`,
      [id, memberId, materialType, materialId]
    );
    if (removed.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ withdrawn: removed.rows[0].id });
  } catch (error) {
    console.error('[living-works/considerations] withdraw failed', error);
    return NextResponse.json({ error: 'Could not remove that' }, { status: 500 });
  }
}
