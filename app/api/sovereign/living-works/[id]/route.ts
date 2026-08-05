// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Living Works — name later, and withdraw (Phase 2, Slice 2).
 *
 * PATCH  — the member names a work they left unnamed, or renames one.
 * DELETE — the member withdraws the declaration.
 *
 * NAMING LATER is the whole point of the optional title. A work exists when it
 * is declared; it is named when the member knows what it is. Those are
 * different moments (ledger D-16), which means the second one needs its own
 * route rather than being folded into creation.
 *
 * WITHDRAWAL — exact semantics, because the word could mean several things:
 *
 *   It removes the DECLARATION. It does not delete, complete, archive, or
 *   finish anything.
 *
 *   - Expressions are never touched. Manuscripts, drafts, revisions, sources
 *     and keeps are untouched by construction: nothing here writes to them,
 *     and `member_manuscripts` has no foreign key to a Living Work. A
 *     manuscript does not know it belonged to anything, so it cannot lose
 *     anything when the work goes.
 *   - `living_work_expressions` rows cascade. Those rows ARE declarations of
 *     membership, not the members themselves. Removing the work removes the
 *     statements "this belongs to that" — which is exactly what withdrawing a
 *     declaration means — and removes nothing that was declared.
 *   - It is reversible by a member act: the member may declare again. This
 *     route does NOT soft-delete, because a `withdrawn_at` column would be a
 *     status, and status is excluded from this ontology. The consequence is
 *     honest and stated in the UI: the name is not kept.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { refuseTitle } from '@/lib/livingWork/domain';

const MAX_TITLE_CHARS = 300;
const MAX_PURPOSE_CHARS = 2000;

interface WorkRow {
  id: string;
  title: string | null;
  purpose: string | null;
  created_at: string;
  updated_at: string;
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      title?: unknown;
      purpose?: unknown;
    };
    if (!('title' in body) && !('purpose' in body)) {
      return NextResponse.json({ error: 'nothing to change' }, { status: 400 });
    }

    /* `null` is allowed on purpose: a member may un-name a work they named too
       early. Recognition can be withdrawn without withdrawing the work. */
    let title: string | null | undefined = undefined;
    if ('title' in body) {
      title = null;
      if (body.title !== null && body.title !== undefined) {
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
    }

    /* The becoming statement (first-slice ruling, 2026-08-05): stored in the
       existing `purpose` column — the founder ruled against a new field until
       creators reveal that "why this exists" and "what it is becoming" are
       different statements. Member-authored only; blank normalizes to null
       (an unwritten becoming is a correct state, same as an unnamed work). */
    let purpose: string | null | undefined = undefined;
    if ('purpose' in body) {
      purpose = null;
      if (body.purpose !== null && body.purpose !== undefined) {
        if (typeof body.purpose !== 'string') {
          return NextResponse.json({ error: 'purpose must be text' }, { status: 400 });
        }
        if (body.purpose.length > MAX_PURPOSE_CHARS) {
          return NextResponse.json(
            { error: `purpose is longer than ${MAX_PURPOSE_CHARS} characters` },
            { status: 400 }
          );
        }
        purpose = body.purpose.trim().length === 0 ? null : body.purpose;
      }
    }

    // Member-scoped in the predicate, not after the fact: another member's id
    // cannot reach this row at all. COALESCE-free: only the fields the member
    // sent change; an untouched field keeps their earlier words.
    const updated = await query<WorkRow>(
      `UPDATE living_works
          SET title = CASE WHEN $3 THEN $4 ELSE title END,
              purpose = CASE WHEN $5 THEN $6 ELSE purpose END,
              updated_at = now()
        WHERE id = $1 AND member_id = $2
      RETURNING id, title, purpose, created_at, updated_at`,
      [id, memberId, title !== undefined, title ?? null, purpose !== undefined, purpose ?? null]
    );
    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const r = updated.rows[0];
    return NextResponse.json({
      work: {
        id: r.id,
        title: r.title,
        purpose: r.purpose,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (error) {
    console.error('[living-works] name failed', error);
    return NextResponse.json({ error: 'Could not save that name' }, { status: 500 });
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

    const removed = await query<{ id: string }>(
      `DELETE FROM living_works WHERE id = $1 AND member_id = $2 RETURNING id`,
      [id, memberId]
    );
    if (removed.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ withdrawn: removed.rows[0].id });
  } catch (error) {
    console.error('[living-works] withdraw failed', error);
    return NextResponse.json({ error: 'Could not withdraw that declaration' }, { status: 500 });
  }
}
