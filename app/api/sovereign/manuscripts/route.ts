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

const MAX_TEXT_CHARS = 2_000_000; // ~a very long book; hard cap for sanity
const MAX_SECTIONS = 400;

interface SectionInput {
  position: number;
  heading: string | null;
  body: string;
}

/**
 * Mechanical segmentation: split on markdown headings (#, ##, ###) or
 * ALL-CAPS / "Chapter N" lines. Fallback: whole text as one section.
 * Detection only — headings come from the document's own characters.
 */
function segment(text: string): SectionInput[] {
  const lines = text.split('\n');
  const headingIdx: { line: number; heading: string }[] = [];

  const headingRe = /^(#{1,3}\s+.+|chapter\s+\w+.*|[A-Z][A-Z0-9 ,'&\-—:]{3,80})$/;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    if (headingRe.test(raw) && raw.length <= 100) {
      headingIdx.push({ line: i, heading: raw.replace(/^#{1,3}\s+/, '') });
    }
  }

  if (headingIdx.length < 2) {
    return [{ position: 0, heading: null, body: text }];
  }

  const sections: SectionInput[] = [];
  // Preamble before the first heading, if substantial.
  const preamble = lines.slice(0, headingIdx[0].line).join('\n');
  if (preamble.trim().length > 0) {
    sections.push({ position: 0, heading: null, body: preamble });
  }
  for (let h = 0; h < headingIdx.length && sections.length < MAX_SECTIONS; h++) {
    const start = headingIdx[h].line + 1;
    const end = h + 1 < headingIdx.length ? headingIdx[h + 1].line : lines.length;
    const body = lines.slice(start, end).join('\n');
    if (body.trim().length === 0) continue;
    sections.push({ position: sections.length, heading: headingIdx[h].heading, body });
  }
  return sections.length > 0 ? sections : [{ position: 0, heading: null, body: text }];
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await query<{
      id: string;
      title: string;
      created_at: string;
      section_count: string;
      char_count: string;
      keep_count: string;
    }>(
      `SELECT m.id, m.title, m.created_at,
              (SELECT count(*) FROM manuscript_sections s WHERE s.manuscript_id = m.id) AS section_count,
              (SELECT coalesce(sum(length(s.body)), 0) FROM manuscript_sections s WHERE s.manuscript_id = m.id) AS char_count,
              (SELECT count(*) FROM manuscript_keeps k WHERE k.manuscript_id = m.id) AS keep_count
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
