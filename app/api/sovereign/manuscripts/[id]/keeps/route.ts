// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Soullab Press — Keeps (the recognition gesture).
 *
 * POST   { sectionId, text } — keep a passage. THE ONLY candidate→recognized
 *          transition in the Manuscript Room. Server re-verifies the text
 *          exists verbatim inside that section of the member's own manuscript
 *          before writing (whitespace-normalized location; stored value = the
 *          member's submitted characters, un-trimmed). A passage the section
 *          does not contain is refused — keeps cannot originate text.
 * DELETE ?keepId= — unkeep. Total and hard; placements cascade away.
 *
 * DOCTRINE: written only by an explicit member gesture; no detector,
 * summarizer, or background job may call this route. No interpretive columns
 * exist to fill. Recognition is not inferred; recognition is enacted.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { memberRef } from '@/lib/privacy/memberRef';

/** Whitespace/curly-quote-normalized containment check (mirror of extractQuotes' tolerance). */
function containsVerbatim(haystack: string, needle: string): boolean {
  const norm = (t: string) =>
    t
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  return norm(haystack).includes(norm(needle));
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { sectionId, text } = (body ?? {}) as { sectionId?: unknown; text?: unknown };
    if (typeof sectionId !== 'string' || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'sectionId and non-empty text are required' }, { status: 400 });
    }

    const section = await query<{ id: string; body: string }>(
      `SELECT s.id, s.body
         FROM manuscript_sections s
         JOIN member_manuscripts m ON m.id = s.manuscript_id
        WHERE s.id = $1 AND m.id = $2 AND m.member_id = $3`,
      [sectionId, id, memberId],
    );
    if (section.rows.length === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    if (!containsVerbatim(section.rows[0].body, text)) {
      return NextResponse.json(
        { error: 'Passage not found verbatim in this section — keeps cannot originate text' },
        { status: 422 },
      );
    }

    const result = await query<{ id: string; created_at: string }>(
      `INSERT INTO manuscript_keeps (member_id, manuscript_id, section_id, verbatim_text)
       VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [memberId, id, sectionId, text],
    );

    // Log marker: counts/sizes only, never content.
    console.log(
      `[MAIA/press] passage kept { memberRef: ${memberRef(memberId)}, ` +
        `manuscriptId: ${id}, keepId: ${result.rows[0].id}, chars: ${text.length} }`,
    );
    return NextResponse.json(
      { keep: { id: result.rows[0].id, createdAt: result.rows[0].created_at } },
      { status: 201 },
    );
  } catch (err) {
    console.error('[press/manuscripts/:id/keeps] POST error:', err);
    return NextResponse.json({ error: 'Failed to keep passage' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;
    const keepId = request.nextUrl.searchParams.get('keepId');
    if (!keepId) return NextResponse.json({ error: 'keepId is required' }, { status: 400 });

    const result = await query(
      `DELETE FROM manuscript_keeps WHERE id = $1 AND manuscript_id = $2 AND member_id = $3`,
      [keepId, id, memberId],
    );
    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ removed: true });
  } catch (err) {
    console.error('[press/manuscripts/:id/keeps] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to remove keep' }, { status: 500 });
  }
}
