/**
 * Soullab Press — Working Draft (Author Environment R1 foundation)
 *
 * "This is where your manuscript lives."
 *
 * - Source stays immutable: POST initializes the draft VERBATIM from the
 *   manuscript's source sections; the sections themselves are never touched.
 *   base_source_hash records exactly which words the draft began from.
 * - Only the author writes the draft: every handler is member-scoped, with the
 *   same no-existence-leak 404 gate as the render route.
 * - Autosave (PUT) updates the draft in place; a checkpoint (PUT with
 *   checkpoint: true) additionally preserves an append-only revision.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  computeSourceHash,
  type MemberBookSection,
} from '@/lib/manuscript/render/renderMemberBook';

/**
 * Compose the draft's starting text from the source sections.
 *
 * Deliberately NOT assembleManuscriptMarkdown: that assembler writes
 * `# `-prefixed headings because pandoc's chapter splitting depends on them,
 * and it stays the render path's business. The draft is a WRITING SURFACE —
 * the 2026-08-05 persona walk found the `#` scaffolding sitting inside the
 * novelist's prose at the worktable. Headings appear here as their own plain
 * lines, the author's words only; chapter structure stays canonical in
 * manuscript_sections, not in draft markup.
 */
function composeDraftText(sections: MemberBookSection[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    const heading = s.heading?.trim();
    if (heading) {
      parts.push(heading);
      parts.push('');
    }
    parts.push(s.body);
    parts.push('');
  }
  return parts.join('\n');
}
import {
  conflictBody,
  payloadHash,
  normalizeVersion,
  precheck,
  readGuard,
  type DraftGuardRow,
} from '@/lib/manuscript/draftConcurrency';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const ms = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (ms.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const existing = await query<{ id: string }>(
      `SELECT id FROM manuscript_working_drafts WHERE manuscript_id = $1`,
      [id]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Draft already exists' }, { status: 409 });
    }

    const sections = await query<MemberBookSection>(
      `SELECT heading, body FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position ASC`,
      [id]
    );
    if (sections.rows.length === 0) {
      return NextResponse.json({ error: 'Manuscript has no sections' }, { status: 409 });
    }

    const content = composeDraftText(sections.rows);
    const baseSourceHash = computeSourceHash(sections.rows);

    const draft = await query<{ id: string }>(
      `INSERT INTO manuscript_working_drafts
         (manuscript_id, member_id, content, base_source_hash, revision_count)
       VALUES ($1, $2, $3, $4, 1)
       RETURNING id`,
      [id, memberId, content, baseSourceHash]
    );
    const draftId = draft.rows[0].id;

    await query(
      `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
       VALUES ($1, 1, $2, $3, 'Initialized verbatim from source')`,
      [draftId, content, memberId]
    );

    return NextResponse.json(
      { id: draftId, manuscriptId: id, baseSourceHash, revisionCount: 1, revisionId: 1, content },
      { status: 201 }
    );
  } catch (error) {
    console.error('[manuscripts/draft] create failed', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const draft = await query<{
      id: string;
      content: string;
      base_source_hash: string;
      revision_count: number;
      version: number;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, content, base_source_hash, revision_count, version, created_at, updated_at
       FROM manuscript_working_drafts
       WHERE manuscript_id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (draft.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const row = draft.rows[0];
    return NextResponse.json({
      id: row.id,
      manuscriptId: id,
      content: row.content,
      baseSourceHash: row.base_source_hash,
      revisionCount: row.revision_count,
      revisionId: Number(row.version),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('[manuscripts/draft] get failed', error);
    return NextResponse.json({ error: 'Failed to load draft' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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
  const { content, checkpoint, note } = body as {
    content?: unknown;
    checkpoint?: unknown;
    note?: unknown;
  };
  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'content must be a string' }, { status: 400 });
  }
  if (note !== undefined && note !== null && typeof note !== 'string') {
    return NextResponse.json({ error: 'note must be a string' }, { status: 400 });
  }

  const guard = readGuard(body as Record<string, unknown>);
  if ('error' in guard) {
    return NextResponse.json({ error: guard.error }, { status: 400 });
  }
  const trimmedNote = typeof note === 'string' && note.trim().length > 0 ? note.trim() : null;
  const hash = payloadHash('save', { content, checkpoint: checkpoint === true, note: trimmedNote });

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

    /* `version` is bigint, and node-postgres returns bigint as a STRING to
       avoid silent precision loss past 2^53. precheck compares it with !==
       against a number, so an unconverted "1" never equals 1 and EVERY write
       was rejected as stale_base. Coerced at the driver boundary, which is the
       only place the string form is real. */
    const guardRow = { ...current.rows[0], version: normalizeVersion(current.rows[0].version) };
    const decision = precheck(guardRow, 'save', guard.idempotencyKey, hash, guard.baseRevisionId);
    if (decision.kind === 'replay') {
      return NextResponse.json(decision.response as object);
    }
    if (decision.kind === 'conflict') {
      return NextResponse.json(conflictBody(decision.reason, decision.currentRevisionId), { status: 409 });
    }

    // Compare-and-advance, recording the idempotency result in the SAME
    // statement. The version predicate is what makes this safe: a client that
    // raced us between the SELECT above and here matches zero rows. Recording
    // the key separately would leave a window in which a successful save
    // answers stale_base to its own retry. SET expressions read the OLD column
    // values, so version + 1 is exactly the version being written, and now()
    // is one timestamp for the whole statement.
    const updated = await query<{
      revision_count: number;
      version: number;
      last_idempotency_response: unknown;
    }>(
      `UPDATE manuscript_working_drafts
          SET content = $3,
              version = version + 1,
              revision_count = revision_count + CASE WHEN $5::boolean THEN 1 ELSE 0 END,
              updated_at = now(),
              last_idempotency_key = $6,
              last_idempotency_op = 'save',
              last_idempotency_payload_hash = $7,
              last_idempotency_response = jsonb_build_object(
                'revisionCount', revision_count + CASE WHEN $5::boolean THEN 1 ELSE 0 END,
                'revisionId', version + 1,
                'updatedAt', now(),
                'checkpointed', $5::boolean
              )
        WHERE manuscript_id = $1 AND member_id = $2 AND version = $4
      RETURNING revision_count, version, last_idempotency_response`,
      [id, memberId, content, guard.baseRevisionId, checkpoint === true, guard.idempotencyKey, hash]
    );
    if (updated.rows.length === 0) {
      const now = await query<{ version: number }>(
        `SELECT version FROM manuscript_working_drafts WHERE manuscript_id = $1 AND member_id = $2`,
        [id, memberId]
      );
      if (now.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(conflictBody('stale_base', normalizeVersion(now.rows[0].version)), { status: 409 });
    }
    const row = updated.rows[0];

    if (checkpoint === true) {
      await query(
        `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [draftId, row.revision_count, content, memberId, trimmedNote]
      );
    }

    // Reply with the stored record itself, so a first response and its replay
    // are byte-identical rather than merely equivalent.
    return NextResponse.json(row.last_idempotency_response as object);
  } catch (error) {
    console.error('[manuscripts/draft] save failed', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}
