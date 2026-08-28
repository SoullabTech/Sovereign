// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Living Work materials — the member brings a thing into relationship
 * (Work Continuity Layer, first slice; ruled 2026-08-05).
 *
 * POST   — "bring this to this Work." A belonging: the thing keeps its home,
 *          nothing is copied or moved; the member's optional sentence is the
 *          content. THE CROSSING IS THE CONSENT EVENT — nothing feeds a work
 *          except through this gesture.
 * DELETE — "this no longer feeds this work." Removes the relationship,
 *          never the thing.
 *
 * First material type: 'manuscript' (platform-native things first — walk
 * finding M1 defers the arrival-home for outside things). The sentence is
 * member-authored only; a blank sentence is the ABSENCE of a sentence
 * (normalizeSentence), which is a correct state, not a gap.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { normalizeSentence, refuseBelonging } from '@/lib/livingWork/domain';
import { memberRef } from '@/lib/privacy/memberRef';

const MAX_TYPE_CHARS = 80;
const MAX_SENTENCE_CHARS = 2000;

interface WorkOwnerRow {
  id: string;
  member_id: string;
}
interface BelongingRow {
  id: string;
  material_type: string;
  material_id: string;
  relationship_sentence: string | null;
  declared_at: string;
}

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
  // Openness of the ontology is not openness of this gate: a type this route
  // cannot verify is refused rather than trusted.
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
      sentence?: unknown;
    };
    const materialType = typeof body.materialType === 'string' ? body.materialType.trim() : '';
    const materialId = typeof body.materialId === 'string' ? body.materialId : '';
    if (materialType.length > MAX_TYPE_CHARS) {
      return NextResponse.json({ error: 'materialType too long' }, { status: 400 });
    }
    if (body.sentence !== undefined && body.sentence !== null && typeof body.sentence !== 'string') {
      return NextResponse.json({ error: 'sentence must be text' }, { status: 400 });
    }
    const rawSentence = typeof body.sentence === 'string' ? body.sentence : null;
    if (rawSentence !== null && rawSentence.length > MAX_SENTENCE_CHARS) {
      return NextResponse.json(
        { error: `sentence is longer than ${MAX_SENTENCE_CHARS} characters` },
        { status: 400 }
      );
    }
    const sentence = normalizeSentence(rawSentence);

    const workRow = await query<WorkOwnerRow>(
      `SELECT id, member_id FROM living_works WHERE id = $1 AND member_id = $2`,
      [id, memberId]
    );
    const work = workRow.rows[0] ?? null;
    const refusal = refuseBelonging(
      { livingWorkId: id, materialType, materialId, relationshipSentence: sentence, declaredBy: memberId },
      work ? { id: work.id, memberId: work.member_id } : null
    );
    /* Same silence doctrine as the expressions route (reconciled to trunk's
       shipped semantics): no-such-work, someone-else's-work, and someone
       else's material all answer 404 — a foreign id learns nothing. */
    if (refusal === 'missing_living_work' || refusal === 'not_the_owner') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (refusal) return NextResponse.json({ error: refusal }, { status: 400 });

    if (!(await memberOwnsMaterial(materialType, materialId, memberId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    /* Maybe/Not now → Belongs, explicit and in ONE transaction.
       A consideration and a declaration are mutually exclusive (WS2-SUBSTRATE-01
       Repair 2): the database refuses to hold both, deliberately REFUSING
       rather than silently clearing, so the transition is a visible member act
       here rather than a hidden side effect in the schema. The member declaring
       belonging IS the resolution of the consideration, so the withdrawal
       belongs in the same gesture — and in the same transaction, because a
       crash between the two halves would leave the material considered by no
       one and belonging to nothing.

       Bringing the same thing twice is the member re-affirming, not an error.
       The original belonging (its date, its sentence) is preserved — a repeat
       gesture never silently overwrites the sentence they wrote before. */
    const { row, resolvedConsideration, created } = await transaction(async (client) => {
      const cleared = await client.query(
        `DELETE FROM living_work_material_considerations
          WHERE living_work_id = $1 AND material_type = $2 AND material_id = $3
        RETURNING state`,
        [id, materialType, materialId]
      );

      const ins = await client.query(
        `INSERT INTO living_work_materials
           (living_work_id, material_type, material_id, relationship_sentence, declared_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (living_work_id, material_type, material_id) DO NOTHING
         RETURNING id, material_type, material_id, relationship_sentence, declared_at`,
        [id, materialType, materialId, sentence, memberId]
      );
      const existing =
        ins.rows[0] ??
        (
          await client.query(
            `SELECT id, material_type, material_id, relationship_sentence, declared_at
               FROM living_work_materials
              WHERE living_work_id = $1 AND material_type = $2 AND material_id = $3`,
            [id, materialType, materialId]
          )
        ).rows[0];

      return {
        row: existing as BelongingRow,
        resolvedConsideration: (cleared.rows[0]?.state as string | undefined) ?? null,
        created: ins.rows.length > 0,
      };
    });

    console.log(
      `[MAIA/press] material brought { memberRef: ${memberRef(memberId)}, ` +
        `workId: ${id}, type: ${materialType}, sentence: ${sentence ? 'written' : 'unwritten'}, ` +
        `resolvedConsideration: ${resolvedConsideration ?? 'none'} }`
    );
    return NextResponse.json(
      {
        material: {
          id: row.id,
          materialType: row.material_type,
          materialId: row.material_id,
          sentence: row.relationship_sentence,
          declaredAt: row.declared_at,
        },
        resolvedConsideration,
      },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    console.error('[living-works/materials] bring failed', error);
    return NextResponse.json({ error: 'Could not bring that in' }, { status: 500 });
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

    // Removes the BELONGING only; the thing stays exactly where it lives.
    const removed = await query<{ id: string }>(
      `DELETE FROM living_work_materials m
        USING living_works w
        WHERE m.living_work_id = w.id
          AND w.id = $1 AND w.member_id = $2
          AND m.material_type = $3 AND m.material_id = $4
        RETURNING m.id`,
      [id, memberId, materialType, materialId]
    );
    if (removed.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ withdrawn: removed.rows[0].id });
  } catch (error) {
    console.error('[living-works/materials] withdraw failed', error);
    return NextResponse.json({ error: 'Could not remove that relationship' }, { status: 500 });
  }
}
