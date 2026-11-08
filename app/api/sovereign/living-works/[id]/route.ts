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
 *   It removes the WORK, and with it everything that hangs from the Work row.
 *   It does not delete the member's writing, and it is not an archive.
 *
 *   - Manuscripts, drafts, revisions, sources and keeps are untouched by
 *     construction: nothing here writes to them, and `member_manuscripts` has
 *     no foreign key to a Living Work. A manuscript does not know it belonged
 *     to anything, so it cannot lose anything when the work goes.
 *   - EVERYTHING that references the Work row with ON DELETE CASCADE goes with
 *     it: the declarations of membership (`living_work_expressions`), and since
 *     September 2026 also the conversations that belong to the Work row itself
 *     (`ask_threads.living_work_id`; a conversation about a WRITING belongs to the
 *     manuscript, carries no Work id, and stays), what the
 *     writer told MAIA about it (`living_work_writer_understanding`), the
 *     writer's corrections, the Work's materials and their considerations, its
 *     editorial relationship record and where the writer last returned, and its
 *     image (the row cascades; the BYTES are queued below and destroyed by the
 *     sweep). The authoritative list is lib/writersStudio/__tests__/
 *     removalCopyDrift.test.ts, which fails when a table is added without the
 *     member-facing copy being revisited.
 *   - It cannot be undone. The member may declare a new Work, but the name, the
 *     conversations and the corrections of this one are not kept. This route
 *     does NOT soft-delete, because a `withdrawn_at` column would be a status,
 *     and status is excluded from this ontology.
 *   - The image bytes are the one part that is not transactional. If they are
 *     not yet destroyed when the response is written, the response says so
 *     (500 {removed:true, refusal:'image_bytes_owed'}) instead of reporting a
 *     plain success: the row is gone, the bytes are queued, and the member is
 *     not told it is finished until it is.
 *   - The removal is RECORDED, in the same transaction: the recovery-capture
 *     advisory lock first, then the Work row, and once the row is really gone a
 *     `member_deletion` manifest and a `living_works` tombstone
 *     (lib/manuscript/source/workDeletionRecord.ts). Without the tombstone a
 *     governed restore from a backup taken before the removal would bring the
 *     Work back. The independent R20 ledger is NOT sealed here (see that module).
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { sweepVaultErasureQueue } from '@/lib/manuscript/source/eraseManuscript';
import { takeRecoveryCaptureLock, writeWorkDeletionRecord } from '@/lib/manuscript/source/workDeletionRecord';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { refuseTitle } from '@/lib/livingWork/domain';
import { cabinStore, cabinMemberFromRequest, setCabinSessionCookie } from '@/lib/cabin/request';

const MAX_TITLE_CHARS = 300;

interface WorkRow {
  id: string;
  title: string | null;
  purpose: string | null;
  form: string | null;
  stage: string | null;
  manuscript_state: string | null;
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

  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      const { member, issuedToken } = cabinMemberFromRequest(store, request);
      const body = (await request.json().catch(() => ({}))) as {
        title?: unknown;
        purpose?: unknown;
        form?: unknown;
        stage?: unknown;
        manuscriptState?: unknown;
      };

      const patch: Record<string, string | null> = {};
      for (const key of ['title', 'purpose', 'form', 'stage', 'manuscriptState']) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          const value = body[key as keyof typeof body];
          if (value !== null && typeof value !== 'string') {
            return NextResponse.json({ error: key + ' must be text' }, { status: 400 });
          }
          patch[key] = value as string | null;
        }
      }

      if (Object.keys(patch).length === 0) {
        return NextResponse.json({ error: 'nothing to change' }, { status: 400 });
      }

      const work = store.updateWork(member.id, id, patch);
      if (!work) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const response = NextResponse.json({
        work: {
          id: work.id,
          title: work.title,
          purpose: work.purpose,
          form: work.form,
          stage: work.stage,
          manuscriptState: work.manuscriptState,
          createdAt: work.createdAt,
          updatedAt: work.updatedAt,
        },
      });
      setCabinSessionCookie(response, issuedToken);
      return response;
    } finally {
      store.close();
    }
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      title?: unknown;
      purpose?: unknown;
      form?: unknown;
      stage?: unknown;
      manuscriptState?: unknown;
    };
    if (!('title' in body) && !('purpose' in body) && !('form' in body) && !('stage' in body) && !('manuscriptState' in body)) {
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

    const MANUSCRIPT_STATES = ['pre-manuscript', 'partial-manuscript', 'existing-manuscript'] as const;
    let manuscriptState: string | null = null;
    if (body.manuscriptState !== null && body.manuscriptState !== undefined) {
      if (
        typeof body.manuscriptState !== 'string'
        || !(MANUSCRIPT_STATES as readonly string[]).includes(body.manuscriptState)
      ) {
        return NextResponse.json({ error: 'unknown_manuscript_state' }, { status: 400 });
      }
      manuscriptState = body.manuscriptState;
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
    if ('manuscriptState' in body) {
      params.push(manuscriptState);
      sets.push(`manuscript_state = $${params.length}`);
    }

    // Member-scoped in the predicate, not after the fact: another member's id
    // cannot reach this row at all.
    const updated = await query<WorkRow>(
      `UPDATE living_works
          SET ${sets.join(', ')}, updated_at = now()
        WHERE id = $1 AND member_id = $2
      RETURNING id, title, purpose, form, stage, manuscript_state, created_at, updated_at`,
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
        manuscriptState: r.manuscript_state,
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

  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      const { member, issuedToken } = cabinMemberFromRequest(store, request);
      if (!store.deleteWork(member.id, id)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const response = NextResponse.json({ withdrawn: id });
      setCabinSessionCookie(response, issuedToken);
      return response;
    } finally {
      store.close();
    }
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    /* One transaction, because a withdrawn Work's image must not outlive it.
       ON DELETE CASCADE takes the living_work_visuals ROW; it cannot take the
       bytes. Reading the path first and enqueueing it in the same transaction
       is what keeps the vault from accumulating images nothing can name — the
       *unreferenced but retained* state WS-DELETE-01 forbids, restated by the
       founder for Work visuals on 2026-09-07. */
    const removed = await transaction(async (tx) => {
      /* LOCK ORDER. eraseManuscript takes the recovery-capture advisory lock FIRST, then the Work row, then the image row afterwards, so
         this takes all three in the SAME order. Taking the Work row before the advisory lock, or the image row (the read below is FOR
         UPDATE) before the Work row, forms a real cycle with a Delete of the Work's writing: PostgreSQL breaks it by aborting one of the
         two with a 500 for an act that did not happen. The advisory lock is unconditional (it is taken even for an id that is not this
         member's), because a lock taken only after finding the row would come after a row lock on that path. It also means a Remove
         waits, with no timeout, while anything else holds the key: a writing Delete holds it for its whole transaction, and eraseManuscript.ts
         documents a coherent R20 backup as a holder too (no such backup caller is in this tree). A row that is not this member's, or is
         already gone, ends at the next statement (404) without writing anything. */
      await takeRecoveryCaptureLock(tx);
      const owned = await tx.query<{ id: string }>(
        `SELECT id FROM living_works WHERE id = $1 AND member_id = $2 FOR UPDATE`,
        [id, memberId],
      );
      if (owned.rows.length === 0) return null;
      const visual = await tx.query<{ storage_path: string }>(
        `SELECT storage_path FROM living_work_visuals WHERE living_work_id = $1 AND member_id = $2 FOR UPDATE`,
        [id, memberId],
      );
      const gone = await tx.query<{ id: string }>(
        `DELETE FROM living_works WHERE id = $1 AND member_id = $2 RETURNING id`,
        [id, memberId],
      );
      if (gone.rows.length === 0) return null;

      /* The record of the removal, written only now that THIS statement really deleted the row (a lost race writes nothing), with the
         id the DELETE returned and not the one from the URL. Same transaction: if it cannot be written the Work is not removed. */
      await writeWorkDeletionRecord(tx, gone.rows[0].id, 'Writer Work removed by verified member request');

      const path = visual.rows[0]?.storage_path;
      let queueId: string | null = null;
      if (path) {
        const queued = await tx.query<{ id: string }>(
          `INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1) RETURNING id`,
          [path],
        );
        queueId = queued.rows[0]?.id ?? null;
      }
      return { id: gone.rows[0].id, queueId };
    });

    if (!removed) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (removed.queueId) {
      await sweepVaultErasureQueue(100, [removed.queueId]);
      /* Only THIS Work's image decides the answer: the queue is shared, and someone else's stuck row is not this member's. */
      const stillOwed = await query<{ id: string }>(
        `SELECT id FROM vault_erasure_queue WHERE id = $1`,
        [removed.queueId],
      );
      if (stillOwed.rows.length > 0) {
        console.error('[living-works] Work removed; its image bytes are still owed destruction');
        return NextResponse.json({ removed: true, refusal: 'image_bytes_owed', unconfirmed: { image: true } }, { status: 500 });
      }
    }
    return NextResponse.json({ withdrawn: removed.id });
  } catch (error) {
    console.error('[living-works] withdraw failed', error);
    return NextResponse.json({ error: 'Could not withdraw that declaration' }, { status: 500 });
  }
}
