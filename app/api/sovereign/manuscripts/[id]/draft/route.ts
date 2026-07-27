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
  assembleManuscriptMarkdown,
  computeSourceHash,
  type MemberBookSection,
} from '@/lib/manuscript/render/renderMemberBook';

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

    const content = assembleManuscriptMarkdown(sections.rows);
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
      { id: draftId, manuscriptId: id, baseSourceHash, revisionCount: 1, content },
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
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, content, base_source_hash, revision_count, created_at, updated_at
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

  try {
    if (checkpoint === true) {
      // Single-statement increment serializes concurrent checkpoints on the
      // UNIQUE (draft_id, revision_number) constraint.
      const updated = await query<{ id: string; revision_count: number; updated_at: string }>(
        `UPDATE manuscript_working_drafts
           SET content = $3, revision_count = revision_count + 1, updated_at = now()
         WHERE manuscript_id = $1 AND member_id = $2
         RETURNING id, revision_count, updated_at`,
        [id, memberId, content]
      );
      if (updated.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const row = updated.rows[0];
      const trimmedNote = typeof note === 'string' && note.trim().length > 0 ? note.trim() : null;
      await query(
        `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [row.id, row.revision_count, content, memberId, trimmedNote]
      );
      return NextResponse.json({
        revisionCount: row.revision_count,
        updatedAt: row.updated_at,
        checkpointed: true,
      });
    }

    const updated = await query<{ revision_count: number; updated_at: string }>(
      `UPDATE manuscript_working_drafts
         SET content = $3, updated_at = now()
       WHERE manuscript_id = $1 AND member_id = $2
       RETURNING revision_count, updated_at`,
      [id, memberId, content]
    );
    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({
      revisionCount: updated.rows[0].revision_count,
      updatedAt: updated.rows[0].updated_at,
      checkpointed: false,
    });
  } catch (error) {
    console.error('[manuscripts/draft] save failed', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}
