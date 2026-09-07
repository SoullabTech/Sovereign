// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Soullab Press — the member's marked lines, across everything they have written.
 *
 * GET — every passage this member kept, newest first, with the manuscript and
 *       the section heading each one came from.
 *
 * ── Why this route exists ─────────────────────────────────────────────────
 * Keeps were already readable — one manuscript at a time, inside
 * GET /api/sovereign/manuscripts/[id]. Studio Home therefore knew `keepCount`
 * (a number) and could not reach a single word. The Home could say "you have
 * marked eleven lines" and could not show one. That is the recurring shape in
 * this lane: the command exists, the door doesn't.
 *
 * ── What this route may carry, and why it is safe to carry it ─────────────
 * `verbatim_text` is the member's own characters. It cannot be anything else:
 * POST /manuscripts/[id]/keeps re-verifies the passage exists verbatim inside
 * that member's own section before writing, so a keep cannot originate text,
 * and the route's doctrine bars any detector, summarizer or background job
 * from calling it. Every row here is the residue of an explicit member
 * gesture. Nothing on this path infers, ranks, scores or interprets.
 *
 * ⛔ This route ORDERS but never SELECTS. It returns the member's most recent
 * marks. It does not choose which of a member's lines is most beautiful,
 * relevant, or timely — that would be the system curating the member's book,
 * which no gesture underneath it authorizes. Any future ordering that is not
 * "when the member marked it" is a founder ruling, not an implementation
 * detail.
 *
 * ⛔ NOT a search endpoint and not a text corpus. It reads kept passages only,
 * never `manuscript_sections.body` at large.
 *
 * Member-scoped by credential. No parameter here can name another member.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/** A ceiling, never a curation. The member's own recent marks, bounded. */
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 200;

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const asked = Number(request.nextUrl.searchParams.get('limit'));
    const limit =
      Number.isFinite(asked) && asked > 0 ? Math.min(Math.floor(asked), MAX_LIMIT) : DEFAULT_LIMIT;

    const result = await query<{
      id: string;
      verbatim_text: string;
      created_at: string;
      manuscript_id: string;
      manuscript_title: string | null;
      heading: string | null;
    }>(
      `SELECT k.id,
              k.verbatim_text,
              k.created_at,
              k.manuscript_id,
              m.title AS manuscript_title,
              s.heading
         FROM manuscript_keeps k
         JOIN member_manuscripts m ON m.id = k.manuscript_id
         JOIN manuscript_sections s ON s.id = k.section_id
        WHERE k.member_id = $1
        ORDER BY k.created_at DESC
        LIMIT $2`,
      [memberId, limit],
    );

    return NextResponse.json({
      keeps: result.rows.map((r) => ({
        id: r.id,
        /* Verbatim, un-trimmed, exactly as stored — the member's characters
           are not the Studio's to tidy. */
        text: r.verbatim_text,
        markedAt: r.created_at,
        manuscriptId: r.manuscript_id,
        /* Where it came from travels WITH it. A line shown without its source
           becomes an anonymous aphorism, and a member's own sentence read back
           without provenance is indistinguishable from something a system
           wrote for them. */
        manuscriptTitle: r.manuscript_title,
        heading: r.heading,
      })),
    });
  } catch (error) {
    console.error('[sovereign/keeps] list failed', error);
    return NextResponse.json({ error: 'Failed to load marked lines' }, { status: 500 });
  }
}
