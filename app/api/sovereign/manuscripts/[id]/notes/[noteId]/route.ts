// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Writer's Studio — one Note.
 *
 * PATCH  { body?, sectionId? } — edit the thought, or re-anchor it.
 * DELETE — the member unmakes it. Total; a Note has no version history to keep
 *          (FR-02: preserved states are what Keeps are for).
 *
 * RE-ANCHORING IS A MEMBER ACT, AND THE ONLY ONE (FR-08). Nothing in this
 * system may move a Note on the writer's behalf: not to a neighbouring section,
 * not to whichever section "probably replaced" a deleted one, and not to a
 * later section that happens to carry the same heading. `anchor_heading` is
 * history, never a key to match on. This route is the sole path by which a
 * Note's anchor changes, and it changes only because the writer said so.
 *
 * Passing `sectionId: null` detaches deliberately. That is different from a
 * section being deleted underneath a note: the first is the writer letting go
 * of a location, and it clears the historical heading too, because there is no
 * longer a former anchor to remember — the writer took it off. The second is
 * the location vanishing while the writer's relationship to it stands, and the
 * database keeps the heading (ON DELETE SET NULL on section_id alone).
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import type { WriterNoteRow } from '../route';

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; noteId: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: manuscriptId, noteId } = await ctx.params;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { body, sectionId } = (payload ?? {}) as { body?: unknown; sectionId?: unknown };

    const editsBody = body !== undefined;
    const editsAnchor = sectionId !== undefined;
    if (!editsBody && !editsAnchor) {
      return NextResponse.json({ error: 'Nothing to change' }, { status: 400 });
    }
    if (editsBody && (typeof body !== 'string' || body.trim().length === 0)) {
      return NextResponse.json({ error: 'A note needs something in it' }, { status: 400 });
    }
    if (editsAnchor && sectionId !== null && typeof sectionId !== 'string') {
      return NextResponse.json({ error: 'sectionId must be a section of this manuscript, or null' }, { status: 400 });
    }

    /* Re-anchoring reads the new section's heading from the row, same as
       creation. A caller may say WHERE, never WHAT IS THERE. */
    let anchorHeading: string | null = null;
    if (editsAnchor && typeof sectionId === 'string') {
      const section = await query<{ heading: string | null }>(
        `SELECT s.heading
           FROM manuscript_sections s
           JOIN member_manuscripts m ON m.id = s.manuscript_id
          WHERE s.id = $1 AND s.manuscript_id = $2 AND m.member_id = $3
          LIMIT 1`,
        [sectionId, manuscriptId, memberId],
      );
      if (section.rows.length === 0) {
        return NextResponse.json({ error: 'That section is not part of this manuscript' }, { status: 400 });
      }
      anchorHeading = section.rows[0].heading;
    }

    const updated = await query<WriterNoteRow>(
      `UPDATE writer_notes n
          SET body           = COALESCE($4, n.body),
              section_id     = CASE WHEN $5::bool THEN $6::uuid ELSE n.section_id END,
              anchor_heading = CASE WHEN $5::bool THEN $7::text ELSE n.anchor_heading END,
              updated_at     = now()
         FROM member_manuscripts m
        WHERE n.id = $1
          AND n.manuscript_id = $2
          AND m.id = n.manuscript_id
          AND m.member_id = $3
      RETURNING n.id, n.body, n.section_id, n.anchor_heading, n.living_work_id,
                n.created_at, n.updated_at`,
      [
        noteId,
        manuscriptId,
        memberId,
        editsBody ? (body as string) : null,
        editsAnchor,
        editsAnchor && typeof sectionId === 'string' ? sectionId : null,
        anchorHeading,
      ],
    );
    if (updated.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ note: updated.rows[0] });
  } catch (error) {
    console.error('[notes] edit failed', error);
    return NextResponse.json({ error: 'Could not change that note just now' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; noteId: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: manuscriptId, noteId } = await ctx.params;

    const removed = await query<{ id: string }>(
      `DELETE FROM writer_notes n
        USING member_manuscripts m
        WHERE n.id = $1
          AND n.manuscript_id = $2
          AND m.id = n.manuscript_id
          AND m.member_id = $3
      RETURNING n.id`,
      [noteId, manuscriptId, memberId],
    );
    if (removed.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: removed.rows[0].id });
  } catch (error) {
    console.error('[notes] delete failed', error);
    return NextResponse.json({ error: 'Could not remove that note just now' }, { status: 500 });
  }
}
