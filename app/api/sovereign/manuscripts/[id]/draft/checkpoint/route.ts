/**
 * WS2 — member-authored checkpoint of a section-addressable draft.
 *
 * KEEP A VERSION CHECKPOINTS SERVER TRUTH. The client sends NO manuscript body:
 * no `content`, no section list, and in fact no request body at all. It sends
 * only the concurrency guard as headers. The server freezes the sections it
 * already holds, in their current order, and writes the append-only revision
 * from that state.
 *
 * Why a separate endpoint exists. A section-native Work can be hundreds of KB
 * or more. Sending every section back through a middleware-matched PUT made
 * Next reconstruct the body stream before the route handler and could throw
 * `Response body object should not be disturbed or locked`. That is a transport
 * failure before auth or application logic. This endpoint removes manuscript
 * bytes from that transport while KEEPING the route under `/api/sovereign`, so
 * the central access rule remains in force.
 */
import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  flattenSections,
  partitionFromSections,
  type DraftSectionState,
} from '@/lib/manuscript/draftSections';
import {
  conflictBody,
  normalizeVersion,
  payloadHash,
  precheck,
  readGuard,
  type DraftGuardRow,
} from '@/lib/manuscript/draftConcurrency';

export const dynamic = 'force-dynamic';

class CheckpointHttp extends Error {
  constructor(readonly status: number, readonly body: unknown) {
    super(`checkpoint ${status}`);
  }
}

function answer(error: unknown): NextResponse | null {
  return error instanceof CheckpointHttp
    ? NextResponse.json(error.body as object, { status: error.status })
    : null;
}

function guardFromHeaders(request: NextRequest) {
  const rawBase = request.headers.get('x-draft-base-revision');
  const baseRevisionId = rawBase === null ? NaN : Number(rawBase);
  return readGuard({
    baseRevisionId,
    idempotencyKey: request.headers.get('idempotency-key'),
  });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const guard = guardFromHeaders(request);
  if ('error' in guard) {
    return NextResponse.json({ error: guard.error }, { status: 400 });
  }

  try {
    const response = await transaction(async (tx) => {
      const locked = await tx.query<DraftGuardRow & {
        id: string;
        content: string;
        revision_count: number;
        section_addressable_at: string | null;
      }>(
        `SELECT id, content, revision_count, version, section_addressable_at,
                last_idempotency_key, last_idempotency_op,
                last_idempotency_payload_hash, last_idempotency_response
           FROM manuscript_working_drafts
          WHERE manuscript_id = $1 AND member_id = $2
          FOR UPDATE`,
        [id, memberId],
      );
      if (locked.rows.length === 0) {
        throw new CheckpointHttp(404, { error: 'Not found' });
      }

      const row = locked.rows[0];
      if (row.section_addressable_at === null) {
        throw new CheckpointHttp(409, {
          refusal: 'not_section_addressable',
          detail: 'this checkpoint endpoint is only for section-addressable drafts',
        });
      }

      /* Judge replay/staleness while the draft row is locked and BEFORE reading
         the manuscript. A stale or replayed checkpoint has no right to make us
         traverse 185 sections merely to discover it was never going to write. */
      const guardRow: DraftGuardRow = { ...row, version: normalizeVersion(row.version) };
      const hash = payloadHash('save', { checkpoint: true, source: 'server' });
      const decision = precheck(
        guardRow,
        'save',
        guard.idempotencyKey,
        hash,
        guard.baseRevisionId,
      );
      if (decision.kind === 'replay') {
        throw new CheckpointHttp(200, decision.response);
      }
      if (decision.kind === 'conflict') {
        throw new CheckpointHttp(
          409,
          conflictBody(decision.reason, decision.currentRevisionId),
        );
      }

      const current = await tx.query<DraftSectionState>(
        `SELECT id, text
           FROM manuscript_draft_sections
          WHERE draft_id = $1
          ORDER BY position ASC`,
        [row.id],
      );
      if (current.rows.length === 0) {
        throw new CheckpointHttp(409, {
          refusal: 'not_readable',
          detail: 'the draft is section-addressable but has no readable sections',
        });
      }

      const content = flattenSections(current.rows);
      if (content !== row.content) {
        throw new Error('section-addressable draft content does not equal its section flattening');
      }

      const updated = await tx.query<{
        revision_count: number;
        version: number;
        last_idempotency_response: unknown;
      }>(
        `UPDATE manuscript_working_drafts
            SET version = version + 1,
                revision_count = revision_count + 1,
                updated_at = now(),
                last_idempotency_key = $4,
                last_idempotency_op = 'save',
                last_idempotency_payload_hash = $5,
                last_idempotency_response = jsonb_build_object(
                  'revisionCount', revision_count + 1,
                  'revisionId', version + 1,
                  'updatedAt', now(),
                  'checkpointed', true
                )
          WHERE id = $1 AND member_id = $2 AND version = $3
        RETURNING revision_count, version, last_idempotency_response`,
        [row.id, memberId, guard.baseRevisionId, guard.idempotencyKey, hash],
      );
      if (updated.rows.length === 0) {
        throw new CheckpointHttp(409, conflictBody('stale_base', guardRow.version));
      }

      await tx.query(
        `INSERT INTO working_draft_revisions
           (draft_id, revision_number, content, saved_by, note, section_partition)
         VALUES ($1, $2, $3, $4, NULL, $5::jsonb)`,
        [
          row.id,
          updated.rows[0].revision_count,
          content,
          memberId,
          JSON.stringify(partitionFromSections(current.rows)),
        ],
      );

      return updated.rows[0].last_idempotency_response;
    });

    return NextResponse.json(response as object);
  } catch (error) {
    const typed = answer(error);
    if (typed) return typed;
    console.error('[manuscripts/draft/checkpoint] failed', error);
    return NextResponse.json({ error: 'Failed to checkpoint draft' }, { status: 500 });
  }
}
