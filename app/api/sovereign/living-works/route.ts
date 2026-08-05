// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Living Works — declaration (Phase 2, Slice 2).
 *
 * GET  — the member's declared works. Member-scoped by credential.
 * POST — the member declares that a work exists. Optionally names it.
 *
 * THE ONE THING THIS ROUTE IS FOR: a Living Work comes into existence ONLY
 * here, and only because a member said so. There is no other creation path in
 * the codebase — not on signup, not on import, not on first save, not as a
 * side effect of any other act (`CREATION_REQUIRES_A_MEMBER_ACT`).
 *
 * WHAT IT REFUSES, and why each refusal is structural rather than intended:
 *
 *   - **No inferred identity.** The body accepts `title` and nothing else. A
 *     type, stage, status, theme, summary or purpose sent by a client is
 *     ignored, not stored — see NEVER_AUTHORED_BY_THE_SYSTEM.
 *   - **No invented name.** An absent title is stored as NULL. The route never
 *     substitutes "Untitled", a date, a counter, or the member's first
 *     manuscript title. Identity and recognition are different moments
 *     (ledger D-16); this route is the identity half only.
 *   - **No attachment.** Nothing is linked to the new work. Manuscripts are
 *     untouched and do not learn they belong to anything.
 *   - **No sanitizing of the member's words.** A given title is stored as
 *     typed apart from the blank check the schema enforces.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { refuseTitle } from '@/lib/livingWork/domain';

const MAX_TITLE_CHARS = 300;

interface WorkRow {
  id: string;
  title: string | null;
  purpose: string | null;
  form: string | null;
  stage: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpressionRow {
  living_work_id: string;
  expression_type: string;
  expression_id: string;
  declared_at: string;
}
interface MaterialRow {
  living_work_id: string;
  material_type: string;
  material_id: string;
  relationship_sentence: string | null;
  declared_at: string;
}

const shape = (r: WorkRow) => ({
  id: r.id,
  title: r.title,
  purpose: r.purpose,
  form: r.form,
  stage: r.stage,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await query<WorkRow>(
      `SELECT id, title, purpose, form, stage, created_at, updated_at
         FROM living_works
        WHERE member_id = $1
        ORDER BY updated_at DESC`,
      [memberId]
    );

    /* Each work carries what the member declared into it (Work Home, Slice 6).
       Raw declarations only — type, id, when. What the id points at (its
       title, its size) is the expression's own truth and stays with the
       expression's own reads; this route asserts nothing beyond "the member
       said this belongs here". Member-scoped through the owning work. */
    const expressions = await query<ExpressionRow>(
      `SELECT e.living_work_id, e.expression_type, e.expression_id, e.declared_at
         FROM living_work_expressions e
         JOIN living_works w ON w.id = e.living_work_id
        WHERE w.member_id = $1
        ORDER BY e.declared_at ASC`,
      [memberId]
    );
    const byWork = new Map<string, { expressionType: string; expressionId: string; declaredAt: string }[]>();
    for (const e of expressions.rows) {
      const list = byWork.get(e.living_work_id) ?? [];
      list.push({
        expressionType: e.expression_type,
        expressionId: e.expression_id,
        declaredAt: e.declared_at,
      });
      byWork.set(e.living_work_id, list);
    }

    /* Materials ride along the same way (Work relationship loop, first
       slice): belongings the member declared — the sentence is their words
       or null, and null is a correct state, not a gap. Same member-scoping
       through the owning work; this route asserts nothing beyond "the
       member said this feeds that". */
    const materials = await query<MaterialRow>(
      `SELECT m.living_work_id, m.material_type, m.material_id,
              m.relationship_sentence, m.declared_at
         FROM living_work_materials m
         JOIN living_works w ON w.id = m.living_work_id
        WHERE w.member_id = $1
        ORDER BY m.declared_at ASC`,
      [memberId]
    );
    const materialsByWork = new Map<
      string,
      { materialType: string; materialId: string; sentence: string | null; declaredAt: string }[]
    >();
    for (const m of materials.rows) {
      const list = materialsByWork.get(m.living_work_id) ?? [];
      list.push({
        materialType: m.material_type,
        materialId: m.material_id,
        sentence: m.relationship_sentence,
        declaredAt: m.declared_at,
      });
      materialsByWork.set(m.living_work_id, list);
    }

    return NextResponse.json({
      works: rows.rows.map((r) => ({
        ...shape(r),
        expressions: byWork.get(r.id) ?? [],
        materials: materialsByWork.get(r.id) ?? [],
      })),
    });
  } catch (error) {
    console.error('[living-works] list failed', error);
    return NextResponse.json({ error: 'Could not read your works' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as { title?: unknown };

    /* An absent title and an empty one are different acts. Absent means "I am
       not ready to name this" and is legitimate. Empty means a name was
       submitted with nothing in it, which is a mistake worth reporting rather
       than silently storing as unnamed. */
    let title: string | null = null;
    if (body.title !== undefined && body.title !== null) {
      if (typeof body.title !== 'string') {
        return NextResponse.json({ error: 'title must be text' }, { status: 400 });
      }
      if (body.title.length > MAX_TITLE_CHARS) {
        return NextResponse.json(
          { error: `title is longer than ${MAX_TITLE_CHARS} characters` },
          { status: 400 }
        );
      }
      if (refuseTitle(body.title) === 'blank_title') {
        return NextResponse.json({ error: 'blank_title' }, { status: 400 });
      }
      title = body.title;
    }

    const created = await query<WorkRow>(
      `INSERT INTO living_works (member_id, title)
       VALUES ($1, $2)
       RETURNING id, title, purpose, form, stage, created_at, updated_at`,
      [memberId, title]
    );
    return NextResponse.json({ work: shape(created.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('[living-works] declare failed', error);
    return NextResponse.json({ error: 'Could not begin your work' }, { status: 500 });
  }
}
