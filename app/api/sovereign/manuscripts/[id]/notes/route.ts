// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Writer's Studio — Notes (the writer's mutable thinking beside the writing).
 *
 * GET    — every note on this manuscript, newest first.
 * POST   { body, sectionId? } — write one.
 *
 * DOCTRINE, and every line of it is a boundary something else in this room
 * already holds:
 *
 *   MEMBER-AUTHORED ONLY. Written by an explicit member gesture. No detector,
 *   summarizer, background job or MAIA path may call this route, and there is
 *   no interpretive column to fill if one did — no kind, tag, summary,
 *   salience or sentiment exists on the row.
 *
 *   NOT PROSE. Nothing here reaches the manuscript, the working draft or
 *   export. A Note sits BESIDE the writing.
 *
 *   THE WORK IS DERIVED, NEVER CLAIMED. `living_work_id` is resolved here from
 *   the member's own declarations, exactly as workSituation.ts resolves a
 *   situated Work: what a client says about a Work is a claim, not a fact. It
 *   is recorded only when EXACTLY ONE Work declares this manuscript — with none
 *   or several (D-018 permits several) the column stays null and the note is
 *   still written, because FR-07 rules that a writer must be able to catch a
 *   thought without first resolving an ontology.
 *
 *   THE ANCHOR IS VERIFIED. A sectionId must name a section of THIS manuscript;
 *   the heading is read from that row, never accepted from the caller.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export interface WriterNoteRow {
  id: string;
  body: string;
  section_id: string | null;
  anchor_heading: string | null;
  living_work_id: string | null;
  created_at: string;
  updated_at: string;
}

/** The one Work that declares this manuscript, or null. Never a guess. */
async function soleDeclaringWork(memberId: string, manuscriptId: string): Promise<string | null> {
  const res = await query<{ id: string }>(
    `SELECT w.id
       FROM living_works w
       JOIN living_work_expressions e ON e.living_work_id = w.id
      WHERE w.member_id = $1
        AND e.expression_type = 'manuscript'
        AND e.expression_id = $2
      LIMIT 2`,
    [memberId, manuscriptId],
  );
  /* Two rows is not an error and not a tie to break — it is the ambiguous state
     the Studio refuses to resolve on the member's behalf. The note is written
     without Work context. */
  return res.rows.length === 1 ? res.rows[0].id : null;
}

async function ownsManuscript(memberId: string, manuscriptId: string): Promise<boolean> {
  const res = await query<{ id: string }>(
    `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 LIMIT 1`,
    [manuscriptId, memberId],
  );
  return res.rows.length === 1;
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: manuscriptId } = await ctx.params;

    /* Member-scoped in the predicate, not checked afterwards: a note on someone
       else's manuscript cannot be reached, let alone read. */
    const res = await query<WriterNoteRow>(
      `SELECT n.id, n.body, n.section_id, n.anchor_heading, n.living_work_id,
              n.created_at, n.updated_at
         FROM writer_notes n
         JOIN member_manuscripts m ON m.id = n.manuscript_id
        WHERE n.manuscript_id = $1 AND m.member_id = $2
        ORDER BY n.created_at DESC`,
      [manuscriptId, memberId],
    );
    return NextResponse.json({ notes: res.rows });
  } catch (error) {
    console.error('[notes] list failed', error);
    return NextResponse.json({ error: 'Could not read your notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: manuscriptId } = await ctx.params;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { body, sectionId } = (payload ?? {}) as { body?: unknown; sectionId?: unknown };
    if (typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json({ error: 'A note needs something in it' }, { status: 400 });
    }
    if (sectionId !== undefined && sectionId !== null && typeof sectionId !== 'string') {
      return NextResponse.json({ error: 'sectionId must be a section of this manuscript' }, { status: 400 });
    }

    if (!(await ownsManuscript(memberId, manuscriptId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    /* The anchor's heading is READ from the section, never taken from the
       caller — anchor_heading is a record of what was there, and a caller-
       supplied one would be a record of what the caller said was there. */
    let anchorHeading: string | null = null;
    if (typeof sectionId === 'string') {
      const section = await query<{ heading: string | null }>(
        `SELECT s.heading
           FROM manuscript_sections s
          WHERE s.id = $1 AND s.manuscript_id = $2
          LIMIT 1`,
        [sectionId, manuscriptId],
      );
      if (section.rows.length === 0) {
        return NextResponse.json({ error: 'That section is not part of this manuscript' }, { status: 400 });
      }
      anchorHeading = section.rows[0].heading;
    }

    const livingWorkId = await soleDeclaringWork(memberId, manuscriptId);

    const inserted = await query<WriterNoteRow>(
      `INSERT INTO writer_notes
         (member_id, manuscript_id, living_work_id, section_id, anchor_heading, body)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, body, section_id, anchor_heading, living_work_id, created_at, updated_at`,
      [memberId, manuscriptId, livingWorkId, sectionId ?? null, anchorHeading, body],
    );
    return NextResponse.json({ note: inserted.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[notes] create failed', error);
    return NextResponse.json({ error: 'Could not keep that note just now' }, { status: 500 });
  }
}
