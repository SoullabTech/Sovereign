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

  try {
    const draft = await query<{ id: string }>(
      `SELECT id FROM manuscript_working_drafts WHERE manuscript_id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (draft.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const draftId = draft.rows[0].id;

    const revision = await query<{ content: string }>(
      `SELECT content FROM working_draft_revisions WHERE draft_id = $1 AND revision_number = $2`,
      [draftId, revisionNumber]
    );
    if (revision.rows.length === 0) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }
    const restoredContent = revision.rows[0].content;

    const updated = await query<{ revision_count: number; updated_at: string }>(
      `UPDATE manuscript_working_drafts
         SET content = $2, revision_count = revision_count + 1, updated_at = now()
       WHERE id = $1
       RETURNING revision_count, updated_at`,
      [draftId, restoredContent]
    );
    const newNumber = updated.rows[0].revision_count;

    await query(
      `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [draftId, newNumber, restoredContent, memberId, `Restored from revision ${revisionNumber}`]
    );

    return NextResponse.json({
      revisionCount: newNumber,
      restoredFrom: revisionNumber,
      updatedAt: updated.rows[0].updated_at,
    });
  } catch (error) {
    console.error('[manuscripts/draft/revisions] restore failed', error);
    return NextResponse.json({ error: 'Failed to restore revision' }, { status: 500 });
  }
}
