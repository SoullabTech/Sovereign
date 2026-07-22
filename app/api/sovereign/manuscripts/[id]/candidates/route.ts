// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Soullab Press — Recognition Room supply line.
 *
 * POST { sectionPosition? } — run the two-class quote extractor over ONE
 * section of the member's own manuscript (kind: 'manuscript') and return
 * verbatim-verified candidates. The Recognition Room walks sections in order.
 *
 * DOCTRINE (inherits app/api/sovereign/quotes/candidates verbatim):
 *   - MEMBER-PULLED ONLY. Answers an explicit member request; nothing ambient.
 *   - EVIDENCE, NEVER MEANING. Response = exact source characters + section
 *     provenance. The extractor's interpretive fields (`resonance`, `score`)
 *     are dropped server-side; ranking may use them, the member never sees
 *     them. No "resonant", no "important", no suggested themes.
 *   - PROPOSES, NEVER KEEPS. Writes nothing. Keeping is the member's separate
 *     gesture (POST ../keeps), which re-verifies verbatim presence.
 *   - PR #608's journal route is untouched; this is the manuscript-scoped
 *     sibling. Same discipline, different first-party source.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { extractQuotes } from '@/lib/analysis/extractQuotes';

const MAX_QUOTES_PER_SECTION = 6;

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // optional body
    }
    const requested = (body as { sectionPosition?: unknown })?.sectionPosition;
    const sectionPosition =
      typeof requested === 'number' && Number.isFinite(requested) && requested >= 0
        ? Math.floor(requested)
        : 0;

    const section = await query<{
      id: string;
      position: number;
      heading: string | null;
      body: string;
      total: string;
    }>(
      `SELECT s.id, s.position, s.heading, s.body,
              (SELECT count(*) FROM manuscript_sections t WHERE t.manuscript_id = m.id) AS total
         FROM manuscript_sections s
         JOIN member_manuscripts m ON m.id = s.manuscript_id
        WHERE m.id = $1 AND m.member_id = $2 AND s.position = $3`,
      [id, memberId, sectionPosition],
    );
    if (section.rows.length === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    const s = section.rows[0];

    const result = await extractQuotes(s.body, {
      maxQuotes: MAX_QUOTES_PER_SECTION,
      kind: 'manuscript',
    });

    // Evidence only. resonance/score deliberately dropped.
    const candidates = result.quotes.map((q) => ({
      text: q.text,
      context: q.context,
      provenance: 'verbatim' as const,
      sectionId: s.id,
      sectionPosition: s.position,
      sectionHeading: s.heading,
    }));

    // Log marker: counts only, never content.
    console.log(
      `[MAIA/press] manuscript candidates { memberIdPrefix: ${memberId.slice(0, 8)}, ` +
        `manuscriptId: ${id}, section: ${s.position}, candidates: ${candidates.length}, ` +
        `rejected: ${result.rejected.length}, provider: ${result.provider} }`,
    );

    return NextResponse.json({
      candidates,
      sectionPosition: s.position,
      sectionHeading: s.heading,
      totalSections: Number(s.total),
      provider: result.provider,
    });
  } catch (err) {
    console.error('[press/manuscripts/:id/candidates] POST error:', err);
    return NextResponse.json({ error: 'Failed to extract candidates' }, { status: 500 });
  }
}
