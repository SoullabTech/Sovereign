// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Soullab Press — single manuscript (detail + removal).
 *
 * GET    — the manuscript with its sections (headings + positions; body sizes,
 *          not bodies), keeps, and collections. Everything member-scoped by
 *          credential. Evidence only: counts, positions, the member's own words.
 * DELETE — removal is the member's, total, and hard (CASCADE takes sections,
 *          keeps, collections, placements). Mirrors the Moments-room posture:
 *          "the words are gone, not archived."
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { memberRef } from '@/lib/privacy/memberRef';

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;

    const ms = await query<{ id: string; title: string; created_at: string }>(
      `SELECT id, title, created_at FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );
    if (ms.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const sections = await query<{
      id: string;
      position: number;
      heading: string | null;
      chars: string;
    }>(
      `SELECT id, position, heading, length(body) AS chars
         FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position`,
      [id],
    );
    const keeps = await query<{
      id: string;
      section_id: string;
      verbatim_text: string;
      created_at: string;
      heading: string | null;
      position: number;
    }>(
      `SELECT k.id, k.section_id, k.verbatim_text, k.created_at, s.heading, s.position
         FROM manuscript_keeps k
         JOIN manuscript_sections s ON s.id = k.section_id
        WHERE k.manuscript_id = $1 AND k.member_id = $2
        ORDER BY k.created_at DESC`,
      [id, memberId],
    );
    const collections = await query<{
      id: string;
      name: string;
      created_at: string;
      keep_ids: string[] | null;
    }>(
      `SELECT c.id, c.name, c.created_at,
              array_agg(i.keep_id) FILTER (WHERE i.keep_id IS NOT NULL) AS keep_ids
         FROM manuscript_collections c
         LEFT JOIN manuscript_collection_items i ON i.collection_id = c.id
        WHERE c.manuscript_id = $1 AND c.member_id = $2
        GROUP BY c.id ORDER BY c.created_at`,
      [id, memberId],
    );

    return NextResponse.json({
      manuscript: { id: ms.rows[0].id, title: ms.rows[0].title, createdAt: ms.rows[0].created_at },
      sections: sections.rows.map((s) => ({
        id: s.id,
        position: s.position,
        heading: s.heading,
        chars: Number(s.chars),
      })),
      keeps: keeps.rows.map((k) => ({
        id: k.id,
        sectionId: k.section_id,
        verbatimText: k.verbatim_text,
        createdAt: k.created_at,
        sectionHeading: k.heading,
        sectionPosition: k.position,
      })),
      collections: collections.rows.map((c) => ({
        id: c.id,
        name: c.name,
        createdAt: c.created_at,
        keepIds: c.keep_ids ?? [],
      })),
    });
  } catch (err) {
    console.error('[press/manuscripts/:id] GET error:', err);
    return NextResponse.json({ error: 'Failed to load manuscript' }, { status: 500 });
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

    const result = await query(
      `DELETE FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );
    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.log(
      `[MAIA/press] manuscript removed { memberRef: ${memberRef(memberId)}, manuscriptId: ${id} }`,
    );
    return NextResponse.json({ removed: true });
  } catch (err) {
    console.error('[press/manuscripts/:id] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to remove manuscript' }, { status: 500 });
  }
}
