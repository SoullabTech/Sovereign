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
 *
 * ── WS-DELETE-01 — total erasure (founder ruling 2026-09-07) ──────────────
 * That posture was written in July, before the Source layer existed. From
 * 2026-08-24 a manuscript also has custody: an arrival row naming bytes held
 * in the file vault. The CASCADE took the arrival ROW and left the BYTES —
 * unreferenced, unattributable, and permanent, because nothing in the repo
 * called deleteVaultBytes(). The system said "deleted" while retaining the
 * thing itself.
 *
 * The ruling:
 *
 *   member-visible promise   The Work is gone.
 *   must remove              source text · uploaded source bytes · manuscript,
 *                            sections and drafts · renders and derived writing
 *                            artifacts · the source-custody record · any
 *                            reconstructive provenance capable of restoring it
 *   must not mean            hidden · archived · detached · unreferenced but
 *                            retained
 *
 * If the system wants to keep the original material, the act must be called
 * Withdraw or Remove from Studio — not Delete. (Withdrawal already exists and
 * is already named honestly: DELETE /living-works/:id returns `withdrawn`.)
 *
 * Two consequences are structural here:
 *
 * 1. Vault paths are read BEFORE the cascade, because the cascade destroys the
 *    only rows that name them. Rows first, then bytes: the reverse would leave
 *    a custody row whose bytes are gone, and this migration's own comment holds
 *    that "a hash without recoverable bytes is not custody."
 *
 * 2. A manuscript MAY be an expression of more than one Living Work — the
 *    living_works migration preserves that on purpose, calling exclusivity an
 *    unruled constitutional question. Erasing shared material out from under a
 *    Work the member did not delete is not sovereignty, so this refuses instead.
 *    A future ruling may narrow it; until then the refusal never destroys.
 *
 * The act itself is lib/manuscript/source/eraseManuscript.ts — one transaction
 * covering the material AND the declaration that names it, so a detached Work
 * has no interval to exist in, plus a sweep that finishes the vault. This route
 * is the door: credential, member scope, and the member's own words back.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { memberRef } from '@/lib/privacy/memberRef';
import { eraseManuscript } from '@/lib/manuscript/source/eraseManuscript';

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
      heading_depth: number | null;
      heading_signal: string | null;
      chars: string;
    }>(
      `SELECT id, position, heading, heading_depth, heading_signal, length(body) AS chars
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
        /* WS2-08A — the depth the document itself gave the heading; null = unclassified. */
        headingDepth: s.heading_depth,
        headingSignal: s.heading_signal,
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

    const outcome = await eraseManuscript(id, memberId);

    if (!outcome.ok) {
      if (outcome.refusal === 'not_found') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(
        { refusal: outcome.refusal, works: outcome.works },
        { status: 409 },
      );
    }

    console.log(
      `[MAIA/press] manuscript erased { memberRef: ${memberRef(memberId)}, manuscriptId: ${id}, `
        + `artifactsQueued: ${outcome.artifactsQueued}, sweptAll: ${outcome.sweptAll} }`,
    );

    /* The Work is gone either way — the rows committed. But bytes still owed
       destruction are not "gone", and the member is told so rather than handed
       a success that would make the promise false. The queue guarantees we can
       finish; it does not entitle us to say we already did. */
    if (!outcome.sweptAll) {
      return NextResponse.json(
        { removed: true, refusal: 'custody_incomplete' },
        { status: 500 },
      );
    }
    return NextResponse.json({ removed: true });
  } catch (err) {
    console.error('[press/manuscripts/:id] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to remove manuscript' }, { status: 500 });
  }
}
