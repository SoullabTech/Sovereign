// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Soullab Press — Manuscripts (list + ingest).
 *
 * GET  — the member's own manuscripts (id, title, counts). Member-scoped by
 *        credential; no parameter can name another member.
 * POST — two-step ingest, so segmentation is member-confirmed:
 *        { title, text }              → { preview: sections[] }  (nothing saved)
 *        { title, sections: [...] }   → saves manuscript + sections as confirmed
 *
 * DOCTRINE:
 *   - provenance = 'member_uploaded': MEMBER-ASSERTED authorship. Recorded,
 *     never verified or doubted. The upload act is the assertion.
 *   - Segmentation is MECHANICAL ONLY (markdown/plain-text heading detection).
 *     The member confirms or redraws the cuts before save — chapter boundaries
 *     are structure, structure is authorship. The system never segments
 *     semantically and never invents headings.
 *   - Body text is stored verbatim (no trim, no normalization).
 *
 * Authority: docs/specs/MANUSCRIPT_INGEST_SPEC_2026-07-21.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { segment, MAX_SECTIONS, type SectionInput } from '@/lib/manuscript/ingest/segment';

const MAX_TEXT_CHARS = 2_000_000; // ~a very long book; hard cap for sanity

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await query<{
      id: string;
      title: string | null;
      created_at: string;
      section_count: string;
      char_count: string;
      keep_count: string;
      last_written_at: string | null;
    }>(
      `SELECT m.id, m.title, m.created_at,
              (SELECT count(*) FROM manuscript_sections s WHERE s.manuscript_id = m.id) AS section_count,
              (SELECT coalesce(sum(length(s.body)), 0) FROM manuscript_sections s WHERE s.manuscript_id = m.id) AS char_count,
              (SELECT count(*) FROM manuscript_keeps k WHERE k.manuscript_id = m.id) AS keep_count,
              -- WRITING ACTIVITY — a member act, not a row mutation.
              --
              -- ⚠️ CORRECTED 2026-08-14. The previous version returned the raw
              -- working-draft updated_at and its comment claimed that column
              -- "moves when the member actually writes". Production disproved
              -- that: manuscript 33a9233c carries 374,697 characters with
              -- created_at == updated_at == 08-06 18:02:42 — manuscript, draft
              -- and its only revision all written in the SAME SECOND by the
              -- import path, and never touched since. Studio Home would have
              -- offered to "continue writing" a book nobody had written a word
              -- of in this system.
              --
              -- The discriminator is exact rather than heuristic, and rests on
              -- an enumeration of every writer to this column on this SHA:
              --   draft INSERT (seed from sections) — no updated_at → == created
              --   blank INSERT (empty page)         — no updated_at → == created
              --   draft UPDATE (save / autosave)    — updated_at = now()  MEMBER
              --   revisions UPDATE (restore)        — updated_at = now()  MEMBER
              -- No migration backfills the column. So updated_at can only have
              -- advanced past created_at through a member act, and equality
              -- means the row has only ever been created.
              --
              -- ⛔ If a future migration, normalisation job, or import-completion
              -- step ever writes updated_at, this stops being authority and the
              -- Home needs a dedicated authored-activity signal. Re-run the
              -- enumeration before trusting it again.
              --
              -- NULL = no writing has happened here. Studio Home requires this
              -- AND charCount > 0 before a Work is continuable, and never uses
              -- living_works.updated_at, which a rename moves.
              (SELECT CASE WHEN d.updated_at > d.created_at THEN d.updated_at END
                 FROM manuscript_working_drafts d
                WHERE d.manuscript_id = m.id) AS last_written_at
         FROM member_manuscripts m
        WHERE m.member_id = $1
        ORDER BY m.created_at DESC`,
      [memberId],
    );
    return NextResponse.json({
      manuscripts: result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        createdAt: r.created_at,
        sectionCount: Number(r.section_count),
        charCount: Number(r.char_count),
        keepCount: Number(r.keep_count),
        lastWrittenAt: r.last_written_at,
      })),
    });
  } catch (err) {
    console.error('[press/manuscripts] GET error:', err);
    return NextResponse.json({ error: 'Failed to load manuscripts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { title, text, sections } = (body ?? {}) as {
      title?: unknown;
      text?: unknown;
      sections?: unknown;
    };

    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    // Preview step: mechanical segmentation only; nothing is saved.
    if (typeof text === 'string') {
      if (text.trim().length === 0) {
        return NextResponse.json({ error: 'text is empty' }, { status: 400 });
      }
      if (text.length > MAX_TEXT_CHARS) {
        return NextResponse.json({ error: 'manuscript too large (2MB text max)' }, { status: 400 });
      }
      return NextResponse.json({ preview: segment(text) });
    }

    // Save step: member-confirmed sections.
    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: 'Provide { title, text } to preview or { title, sections } to save' },
        { status: 400 },
      );
    }
    if (sections.length > MAX_SECTIONS) {
      return NextResponse.json({ error: `too many sections (max ${MAX_SECTIONS})` }, { status: 400 });
    }
    const clean: SectionInput[] = [];
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i] as { heading?: unknown; body?: unknown };
      if (typeof s?.body !== 'string' || s.body.trim().length === 0) continue;
      clean.push({
        position: clean.length,
        heading: typeof s.heading === 'string' && s.heading.trim().length > 0 ? s.heading : null,
        body: s.body,
      });
    }
    if (clean.length === 0) {
      return NextResponse.json({ error: 'no non-empty sections' }, { status: 400 });
    }

    const ms = await query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
      [memberId, title.trim()],
    );
    const manuscriptId = ms.rows[0].id;
    for (const s of clean) {
      await query(
        `INSERT INTO manuscript_sections (manuscript_id, position, heading, body)
         VALUES ($1, $2, $3, $4)`,
        [manuscriptId, s.position, s.heading, s.body],
      );
    }

    // Log marker: counts only, never content.
    console.log(
      `[MAIA/press] manuscript saved { memberIdPrefix: ${memberId.slice(0, 8)}, ` +
        `manuscriptId: ${manuscriptId}, sections: ${clean.length} }`,
    );
    return NextResponse.json({ id: manuscriptId, sectionCount: clean.length }, { status: 201 });
  } catch (err) {
    console.error('[press/manuscripts] POST error:', err);
    return NextResponse.json({ error: 'Failed to save manuscript' }, { status: 500 });
  }
}
