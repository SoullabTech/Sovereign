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

interface WorkRow {
  id: string;
  title: string | null;
  purpose: string | null;
  form: string | null;
  stage: string | null;
  created_at: string;
  updated_at: string;
}

const MAX_PURPOSE_CHARS = 2000;
const MAX_FORM_CHARS = 100;

/** The five stage words a member may claim. Orientation, never progress. */
const STAGES = ['capturing', 'developing', 'writing', 'refining', 'sharing'] as const;

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
      form?: unknown;
      stage?: unknown;
    };
    if (!('title' in body) && !('purpose' in body) && !('form' in body) && !('stage' in body)) {
      return NextResponse.json({ error: 'nothing to change' }, { status: 400 });
    }

    /* `null` is allowed on purpose: a member may un-name a work they named too
       early. Recognition can be withdrawn without withdrawing the work. */
    let title: string | null = null;
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

    /* Purpose (Work Home, Slice 6): the member's stated intention for the
       work. Same member-authored rules as title — NEVER_AUTHORED_BY_THE_SYSTEM
       lists purpose; the only writer is this member act. Null un-states it. */
    let purpose: string | null = null;
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
      if (body.purpose.trim().length === 0) {
        return NextResponse.json({ error: 'blank_purpose' }, { status: 400 });
      }
      purpose = body.purpose;
    }

    /* Form and stage (Slice 6e): member-declared, same precedent as title and
       purpose — the NEVER_AUTHORED_BY_THE_SYSTEM list governs authorship, not
       existence, and the only writer is this member act. Form is the member's
       own word ("Book", "Blog series"); stage is one of five canonical words
       and is orientation, never progress — the system never advances it. */
    let form: string | null = null;
    if (body.form !== null && body.form !== undefined) {
      if (typeof body.form !== 'string') {
        return NextResponse.json({ error: 'form must be text' }, { status: 400 });
      }
      if (body.form.length > MAX_FORM_CHARS) {
        return NextResponse.json(
          { error: `form is longer than ${MAX_FORM_CHARS} characters` },
          { status: 400 }
        );
      }
      if (body.form.trim().length === 0) {
        return NextResponse.json({ error: 'blank_form' }, { status: 400 });
      }
      form = body.form;
    }

    let stage: string | null = null;
    if (body.stage !== null && body.stage !== undefined) {
      if (typeof body.stage !== 'string' || !(STAGES as readonly string[]).includes(body.stage)) {
        return NextResponse.json({ error: 'unknown_stage' }, { status: 400 });
      }
      stage = body.stage;
    }

    // Only the fields the member actually addressed change; COALESCE-style
    // partial updates would silently keep a value the member tried to clear.
    const sets: string[] = [];
    const params: unknown[] = [id, memberId];
    if ('title' in body) {
      params.push(title);
      sets.push(`title = $${params.length}`);
    }
    if ('purpose' in body) {
      params.push(purpose);
      sets.push(`purpose = $${params.length}`);
    }
    if ('form' in body) {
      params.push(form);
      sets.push(`form = $${params.length}`);
    }
    if ('stage' in body) {
      params.push(stage);
      sets.push(`stage = $${params.length}`);
    }

    // Member-scoped in the predicate, not after the fact: another member's id
    // cannot reach this row at all.
    const updated = await query<WorkRow>(
      `UPDATE living_works
          SET ${sets.join(', ')}, updated_at = now()
        WHERE id = $1 AND member_id = $2
      RETURNING id, title, purpose, form, stage, created_at, updated_at`,
      params
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
        form: r.form,
        stage: r.stage,
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
