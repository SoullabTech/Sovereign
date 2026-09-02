/**
 * Soullab Press — Working Draft revisions (Author Environment R1 foundation)
 *
 * - Revisions are append-only: this surface can list them and restore FROM
 *   one, never modify or delete one.
 * - Restore writes a NEW revision carrying the restored content — history is
 *   never rewritten, so a restore is itself always recoverable.
 * - Member-scoped throughout, same no-existence-leak 404 gate as the other
 *   manuscript routes.
 *
 * RESTORE ON A SECTION-ADDRESSABLE DRAFT. Once a draft is section-addressable,
 * its sections are the writable truth and content is their flattening —
 * enforced at COMMIT by a deferred trigger. A bare content write here would
 * therefore ABORT, and the member's undo would arrive as a 500.
 *
 * The fix is the section↔revision relation, not a re-partition. Each revision
 * written since the draft became addressable carries the section ranges it was
 * saved from, so restoring REBUILDS the exact sections that produced that text.
 *
 * ⛔ AN OLDER REVISION IS NEVER RE-PARTITIONED. Re-deriving boundaries from
 * older prose produces slices with NO id continuity to the sections that exist
 * now — the option the recoverability ruling rejected. Where the partition was
 * never observed, restore REFUSES, typed, with zero writes. A member told
 * plainly that a pre-conversion revision cannot be restored section-wise keeps
 * their history; a member silently given reassigned identities does not.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  conflictBody,
  payloadHash,
  normalizeVersion,
  precheck,
  readGuard,
  type DraftGuardRow,
} from '@/lib/manuscript/draftConcurrency';
import {
  partitionFromSections,
  sectionsFromPartition,
  type DraftSectionState,
  type RevisionSectionRange,
} from '@/lib/manuscript/draftSections';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const draft = await query<{ id: string; section_addressable_at: string | null }>(
      `SELECT id, section_addressable_at FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2`,
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
      partition_recorded: boolean;
    }>(
      `SELECT revision_number, note, length(content) AS content_chars, created_at,
              (section_partition IS NOT NULL) AS partition_recorded
       FROM working_draft_revisions
       WHERE draft_id = $1
       ORDER BY revision_number DESC`,
      [draft.rows[0].id]
    );

    /* A section-addressable draft can only be restored to a revision whose
       section boundaries were recorded. Saying so HERE lets the history
       surface be honest before the member commits to an action, rather than
       refusing them after they choose. On an unconverted draft every revision
       is restorable under the existing contract, so the flag is true. */
    const addressable = draft.rows[0].section_addressable_at !== null;

    return NextResponse.json({
      draftId: draft.rows[0].id,
      sectionAddressable: addressable,
      revisions: revisions.rows.map((r) => ({
        revisionNumber: r.revision_number,
        note: r.note,
        contentChars: r.content_chars,
        createdAt: r.created_at,
        restorable: addressable ? r.partition_recorded : true,
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
    const current = await query<DraftGuardRow & { id: string; section_addressable_at: string | null }>(
      `SELECT id, version, section_addressable_at, last_idempotency_key, last_idempotency_op,
              last_idempotency_payload_hash, last_idempotency_response
         FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (current.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const draftId = current.rows[0].id;

    if (current.rows[0].section_addressable_at !== null) {
      return await restoreSectionAddressable({
        draftId,
        memberId,
        revisionNumber,
        guard,
        hash,
      });
    }

    /* Same bigint coercion as the save route: node-postgres returns bigint as
       a string, and precheck compares with !== against a number. Without this,
       restore — the undo path — rejects every attempt as stale_base. */
    const guardRow = { ...current.rows[0], version: normalizeVersion(current.rows[0].version) };
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
      return NextResponse.json(conflictBody('stale_base', normalizeVersion(now.rows[0].version)), { status: 409 });
    }

    await query(
      `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [draftId, updated.rows[0].revision_count, restoredContent, memberId, `Restored from revision ${revisionNumber}`]
    );

    return NextResponse.json(updated.rows[0].last_idempotency_response as object);
  } catch (error) {
    if (error instanceof RestoreHttp) {
      return NextResponse.json(error.body as object, { status: error.status });
    }
    console.error('[manuscripts/draft/revisions] restore failed', error);
    return NextResponse.json({ error: 'Failed to restore revision' }, { status: 500 });
  }
}

/**
 * A finished HTTP answer raised from inside a transaction.
 *
 * ⛔ `transaction()` COMMITs when its callback RETURNS and ROLLBACKs only when
 * it THROWS. A refusal RETURNED from inside one would commit whatever partial
 * work preceded it while telling the member the restore failed. Every
 * non-success exit below is a throw.
 */
class RestoreHttp extends Error {
  constructor(readonly status: number, readonly body: unknown) {
    super(`restore ${status}`);
  }
}

/**
 * Restore on a section-addressable draft — by RECOVERY, never by inference.
 *
 * The revision's frozen partition is what makes this possible: it names the
 * exact section ids and character ranges the revision was saved from, so the
 * sections are rebuilt rather than re-derived. Content is then the flattening
 * of those rebuilt sections, which is the same string the revision holds — so
 * the round-trip trigger is satisfied by construction, not by luck.
 *
 * Sections and content are written in ONE transaction because the invariant is
 * checked at COMMIT; either both land or neither does.
 */
async function restoreSectionAddressable(args: {
  draftId: string;
  memberId: string;
  revisionNumber: number;
  guard: { idempotencyKey: string; baseRevisionId: number };
  hash: string;
}): Promise<NextResponse> {
  const { draftId, memberId, revisionNumber, guard, hash } = args;

  const result = await transaction(async (tx) => {
    const locked = await tx.query(
      `SELECT version, last_idempotency_key, last_idempotency_op,
              last_idempotency_payload_hash, last_idempotency_response
         FROM manuscript_working_drafts
        WHERE id = $1 AND member_id = $2
        FOR UPDATE`,
      [draftId, memberId]
    );
    if (locked.rows.length === 0) {
      throw new RestoreHttp(404, { error: 'Not found' });
    }

    const guardRow = {
      ...(locked.rows[0] as DraftGuardRow),
      version: normalizeVersion((locked.rows[0] as DraftGuardRow).version),
    };
    const decision = precheck(guardRow, 'restore', guard.idempotencyKey, hash, guard.baseRevisionId);
    if (decision.kind === 'replay') {
      /* A success that must write nothing. Raised, so the transaction rolls
         back instead of committing an empty advance. */
      throw new RestoreHttp(200, decision.response);
    }
    if (decision.kind === 'conflict') {
      throw new RestoreHttp(409, conflictBody(decision.reason, decision.currentRevisionId));
    }

    const revision = await tx.query(
      `SELECT content, section_partition FROM working_draft_revisions
        WHERE draft_id = $1 AND revision_number = $2`,
      [draftId, revisionNumber]
    );
    if (revision.rows.length === 0) {
      throw new RestoreHttp(404, { error: 'Revision not found' });
    }
    const restoredContent = revision.rows[0].content as string;
    const partition = revision.rows[0].section_partition as RevisionSectionRange[] | null;

    const currentSections = await tx.query(
      `SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position ASC`,
      [draftId]
    );
    const currentIds = (currentSections.rows as DraftSectionState[]).map((r) => r.id);

    const rebuilt = sectionsFromPartition(restoredContent, partition, currentIds);
    if (!rebuilt.ok) {
      /* Typed, zero writes. The member is told their history is intact and
         this particular revision cannot be restored section-wise — never given
         boundaries the system invented on their behalf. */
      throw new RestoreHttp(409, { refusal: rebuilt.refusal, detail: rebuilt.detail });
    }
    const sections = rebuilt.value;

    const updated = await tx.query(
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
      throw new RestoreHttp(409, conflictBody('stale_base', guardRow.version));
    }

    const written = await tx.query(
      `UPDATE manuscript_draft_sections s
          SET text = v.text, updated_at = now()
         FROM (SELECT unnest($2::uuid[]) AS id, unnest($3::text[]) AS text) v
        WHERE s.id = v.id AND s.draft_id = $1`,
      [draftId, sections.map((x) => x.id), sections.map((x) => x.text)]
    );
    if (written.rowCount !== sections.length) {
      throw new RestoreHttp(409, {
        refusal: 'topology_change_requires_explicit_command',
        detail: 'the draft\'s sections changed during the restore',
      });
    }

    /* The displaced draft is preserved by construction — it is already an
       immutable revision — and the restore appends its own, so a restore is
       itself always recoverable. Its partition is frozen from the sections
       just written, so THAT is restorable too. */
    await tx.query(
      `INSERT INTO working_draft_revisions
         (draft_id, revision_number, content, saved_by, note, section_partition)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [draftId, updated.rows[0].revision_count, restoredContent, memberId,
       `Restored from revision ${revisionNumber}`,
       JSON.stringify(partitionFromSections(sections))]
    );

    return updated.rows[0].last_idempotency_response;
  });

  return NextResponse.json(result as object);
}
