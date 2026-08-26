/**
 * WS-PRO-01 — read one kept version, so a writer can COMPARE before restoring.
 *
 * Restoring blind is the thing that makes version history frightening rather
 * than reassuring: a writer who cannot see what a version contains will not
 * use it. So a version's text is readable, and only readable — this route has
 * no write of any kind, and the append-only guarantee of working_draft_revisions
 * is untouched.
 *
 * Deliberately separate from the revisions collection route, which lists
 * summaries. Listing versions should never carry the full text of every one of
 * them across the wire.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; revision: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id, revision } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const revisionNumber = Number(revision);
  if (!Number.isInteger(revisionNumber) || revisionNumber < 1) {
    return NextResponse.json({ error: 'Unknown version' }, { status: 400 });
  }

  try {
    // Joined through the draft so ownership is asserted in the statement — a
    // revision id alone can never reach another member's writing.
    const res = await query<{ content: string; note: string | null; created_at: string }>(
      `SELECT r.content, r.note, r.created_at
         FROM working_draft_revisions r
         JOIN manuscript_working_drafts d ON d.id = r.draft_id
        WHERE d.manuscript_id = $1 AND d.member_id = $2 AND r.revision_number = $3`,
      [id, memberId, revisionNumber],
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      revisionNumber,
      content: res.rows[0].content,
      note: res.rows[0].note,
      createdAt: res.rows[0].created_at,
    });
  } catch (error) {
    console.error('[manuscripts/draft/revisions] read failed', error);
    return NextResponse.json({ error: 'Could not read that version' }, { status: 500 });
  }
}
