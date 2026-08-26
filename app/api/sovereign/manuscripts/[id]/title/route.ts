/**
 * WS-VISIBLE-01 — the writer names their own book.
 *
 * Imported manuscripts take their title from the uploaded FILENAME, so a book
 * whose own first page reads "Elemental Alchemy" appears in the Studio as
 * "book-print-kdp-final". The Studio must not guess a better title from the
 * document either — a title is the writer's act. So this route exists: the
 * member renames, and nothing else in the room may.
 *
 * Deliberately a separate route from the manuscript resource: the WS-01 source
 * custody candidate owns app/api/sovereign/manuscripts/[id]/route.ts and is in
 * acceptance. Renaming touches no custody field — the arrival, its bytes, and
 * its hashes are untouched by a title change, and a rename cannot alter what a
 * source proves.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const dynamic = 'force-dynamic';

const MAX_TITLE_CHARS = 200;

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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
  const raw = (body as { title?: unknown }).title;
  if (raw !== null && typeof raw !== 'string') {
    return NextResponse.json({ error: 'title must be a string or null' }, { status: 400 });
  }
  // An emptied title is untitled, not the empty string — the Studio has one
  // representation of "the writer has not named this" and it is NULL.
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  const title = trimmed.length === 0 ? null : trimmed;
  if (title !== null && title.length > MAX_TITLE_CHARS) {
    return NextResponse.json({ error: 'Title is too long' }, { status: 400 });
  }

  try {
    // Member-scoped in the statement itself: no other member's manuscript can
    // be named by this route, and a miss is a 404 that leaks no existence.
    const res = await query<{ id: string; title: string | null }>(
      `UPDATE member_manuscripts SET title = $3
        WHERE id = $1 AND member_id = $2
        RETURNING id, title`,
      [id, memberId, title],
    );
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ id: res.rows[0].id, title: res.rows[0].title });
  } catch (error) {
    console.error('[manuscripts/title] rename failed', error);
    return NextResponse.json({ error: 'Failed to rename' }, { status: 500 });
  }
}
