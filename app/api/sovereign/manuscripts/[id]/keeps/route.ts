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
 *
 * SANCTUARY (SANCTUARY-MANUSCRIPT-KEEP-01 / S1): a manuscript Keep is a
 * secondary durable member-marking object and inherits the Sanctuary
 * non-persistence boundary. The POST must carry the member's CURRENT posture
 * as an explicit boolean `sanctuary`. Under Sanctuary the route reads nothing
 * and writes nothing and answers with a non-content receipt
 * `{ success: true, sanctuary: true, persisted: false }`. A missing or
 * malformed posture is NOT ordinary — it is refused `400 posture_required`
 * before any manuscript read. ⛔ Never `TurnPosture.resolve({})`: absence of a
 * signal must not be manufactured into an ordinary turn. DELETE is deliberately
 * NOT gated — removing durable material is a sovereign act, in Sanctuary too.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { memberRef } from '@/lib/privacy/memberRef';
import { TurnPosture, contentWritable } from '@/lib/sanctuary/turnPosture';

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

    // S1 — posture first, before anything about the passage is looked at.
    // An explicit boolean is required; anything else is an unresolved posture
    // and fails closed. The posture is minted server-side from the request
    // (contradictory nested signals still fail closed to Sanctuary).
    const { sanctuary } = (body ?? {}) as { sanctuary?: unknown };
    if (typeof sanctuary !== 'boolean') {
      return NextResponse.json({ error: 'posture_required', persisted: false }, { status: 400 });
    }
    const posture = TurnPosture.resolve(body);
    if (!contentWritable(posture, 'manuscript_keeps')) {
      // Sanctuary: nothing read, nothing written, nothing echoed. A receipt,
      // not an error — the member did nothing wrong.
      return NextResponse.json({ success: true, sanctuary: true, persisted: false });
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
