/**
 * Soullab Press — Working Draft revisions (Author Environment R1 foundation)
 *
 * - Revisions are append-only: this surface can list them and restore FROM
 *   one, never modify or delete one.
 * - Restore writes a NEW revision carrying the restored content — history is
 *   never rewritten, so a restore is itself always recoverable.
 * - Member-scoped throughout, same no-existence-leak 404 gate as the other
 *   manuscript routes.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  conflictBody,
  payloadHash,
  precheck,
  readGuard,
  type DraftGuardRow,
} from '@/lib/manuscript/draftConcurrency';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const draft = await query<{ id: string }>(
      `SELECT id FROM manuscript_working_drafts WHERE manuscript_id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (draft.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const revisions = await query<{
      revision_number: number;
      note: string | null;
      content_chars: number;
      created_at: string;
    }>(
      `SELECT revision_number, note, length(content) AS content_chars, created_at
       FROM working_draft_revisions
       WHERE draft_id = $1
       ORDER BY revision_number DESC`,
      [draft.rows[0].id]
    );

    return NextResponse.json({
      draftId: draft.rows[0].id,
      revisions: revisions.rows.map((r) => ({
        revisionNumber: r.revision_number,
        note: r.note,
        contentChars: r.content_chars,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    console.error('[manuscripts/draft/revisions] list failed', error);
    return NextResponse.json({ error: 'Failed to list revisions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { revisionNumber } = body as { revisionNumber?: unknown };
  if (typeof revisionNumber !== 'number' || !Number.isInteger(revisionNumber) || revisionNumber < 1) {
    return NextResponse.json({ error: 'revisionNumber must be a positive integer' }, { status: 400 });
  }

  const guard = readGuard(body as Record<string, unknown>);
  if ('error' in guard) {
    return NextResponse.json({ error: guard.error }, { status: 400 });
  }
  const hash = payloadHash('restore', { revisionNumber });

  try {
    const current = await query<DraftGuardRow & { id: string }>(
      `SELECT id, version, last_idempotency_key, last_idempotency_op,
              last_idempotency_payload_hash, last_idempotency_response
         FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (current.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const draftId = current.rows[0].id;

    /* Same bigint coercion as the save route: node-postgres returns bigint as
       a string, and precheck compares with !== against a number. Without this,
       restore — the undo path — rejects every attempt as stale_base. */
    const guardRow = { ...current.rows[0], version: Number(current.rows[0].version) };
    const decision = precheck(guardRow, 'restore', guard.idempotencyKey, hash, guard.baseRevisionId);
    if (decision.kind === 'replay') {
      return NextResponse.json(decision.response as object);
    }
    if (decision.kind === 'conflict') {
      return NextResponse.json(conflictBody(decision.reason, decision.currentRevisionId), { status: 409 });
    }

    const revision = await query<{ content: string }>(
      `SELECT content FROM working_draft_revisions WHERE draft_id = $1 AND revision_number = $2`,
      [draftId, revisionNumber]
    );
    if (revision.rows.length === 0) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }
    const restoredContent = revision.rows[0].content;

    // Same compare-and-advance as a save: restoring cannot discard work the
    // writer has not seen. The displaced draft is preserved by construction —
    // it is already an immutable revision, and history is never rewritten.
    // The idempotency record is written in the SAME statement.
    const updated = await query<{ revision_count: number; last_idempotency_response: unknown }>(
      `UPDATE manuscript_working_drafts
          SET content = $2,
              revision_count = revision_count + 1,
              version = version + 1,
              updated_at = now(),
              last_idempotency_key = $4,
              last_idempotency_op = 'restore',
              last_idempotency_payload_hash = $5,
              last_idempotency_response = jsonb_build_object(
                'revisionCount', revision_count + 1,
                'revisionId', version + 1,
                'restoredFrom', $6::int,
                'updatedAt', now()
              )
        WHERE id = $1 AND version = $3
      RETURNING revision_count, last_idempotency_response`,
      [draftId, restoredContent, guard.baseRevisionId, guard.idempotencyKey, hash, revisionNumber]
    );
    if (updated.rows.length === 0) {
      const now = await query<{ version: number }>(
        `SELECT version FROM manuscript_working_drafts WHERE id = $1`,
        [draftId]
      );
      if (now.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(conflictBody('stale_base', Number(now.rows[0].version)), { status: 409 });
    }

    await query(
      `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [draftId, updated.rows[0].revision_count, restoredContent, memberId, `Restored from revision ${revisionNumber}`]
    );

    return NextResponse.json(updated.rows[0].last_idempotency_response as object);
  } catch (error) {
    console.error('[manuscripts/draft/revisions] restore failed', error);
    return NextResponse.json({ error: 'Failed to restore revision' }, { status: 500 });
  }
}
