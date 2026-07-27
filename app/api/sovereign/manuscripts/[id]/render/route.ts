// Production web requires force-dynamic for runtime database access.
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // full-book render (pandoc + Paged.js) can take 60–120s

/**
 * Soullab Press — render the member's manuscript into a book they can hold.
 *
 * POST { format: 'pdf' | 'epub' } → streams the rendered file as a download.
 *
 * The author's own words, set as a book — their sections, in order, verbatim.
 * Nothing generated, woven, or interpreted (see renderMemberBook.ts).
 *
 * Member-scoped + ownership-gated: the manuscript must belong to the caller,
 * or the request 404s (existence is never leaked). Rendering is an explicit
 * member act; a provenance/approval row is recorded (manuscript_renders). The
 * rendered bytes are streamed and the temp file deleted — a member's
 * manuscript is never written to a public/served path.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { renderMemberBook, type MemberBookSection } from '@/lib/manuscript/render/renderMemberBook';

type Format = 'pdf' | 'epub';

const MIME: Record<Format, string> = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
};

function safeFilename(title: string): string {
  const cleaned = title.replace(/[^\w.\- ]+/g, '').trim().slice(0, 120);
  return cleaned.length > 0 ? cleaned : 'manuscript';
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const format = (body as { format?: unknown })?.format;
  if (format !== 'pdf' && format !== 'epub') {
    return NextResponse.json({ error: "format must be 'pdf' or 'epub'" }, { status: 400 });
  }

  // Ownership gate: the manuscript must belong to the caller. 404 (never leak).
  let title: string;
  let author: string | null = null;
  let sections: MemberBookSection[];
  try {
    const ms = await query<{ title: string }>(
      `SELECT title FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );
    if (ms.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    title = ms.rows[0].title;

    const secRows = await query<{ heading: string | null; body: string }>(
      `SELECT heading, body FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position`,
      [id],
    );
    if (secRows.rows.length === 0) {
      return NextResponse.json({ error: 'This manuscript has no sections to render' }, { status: 400 });
    }
    sections = secRows.rows.map((r) => ({ heading: r.heading, body: r.body }));

    const who = await query<{ name: string | null }>(
      `SELECT name FROM members WHERE id = $1`,
      [memberId],
    );
    author = who.rows[0]?.name ?? null;
  } catch (err) {
    console.error('[press/manuscripts/:id/render] load error:', err);
    return NextResponse.json({ error: 'Failed to load manuscript' }, { status: 500 });
  }

  // Render (pandoc → PDF/EPUB). Author's verbatim words only.
  let result;
  try {
    result = await renderMemberBook(sections, { title, author, format });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[press/manuscripts/:id/render] render error:', message);
    // Distinguish tooling-absent (container/config) from an actual failure in
    // the logs; the member always sees a calm, non-technical message.
    const toolingMissing =
      message.includes('ENOENT') ||
      message.toLowerCase().includes('chromium') ||
      message.includes('Browser was not found');
    return NextResponse.json(
      { error: 'Could not make your book just now. Please try again in a moment.' },
      { status: toolingMissing ? 503 : 500 },
    );
  }

  // Record the authorization + provenance (counts + hash only, never content).
  try {
    await query(
      `INSERT INTO manuscript_renders
         (manuscript_id, member_id, format, source_section_count, source_hash, page_count)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, memberId, format, result.sectionCount, result.sourceHash, result.pageCount ?? null],
    );
  } catch (err) {
    // Provenance write failure must not deny the author their book — log loudly.
    console.error('[press/manuscripts/:id/render] provenance write failed (non-fatal):', err);
  }

  // Stream the file, then delete the temp artifact (never persisted server-side).
  let fileBuffer: Buffer;
  try {
    fileBuffer = await fs.readFile(result.filePath);
  } catch (err) {
    console.error('[press/manuscripts/:id/render] read rendered file failed:', err);
    return NextResponse.json({ error: 'Could not deliver your book. Please try again.' }, { status: 500 });
  } finally {
    fs.unlink(result.filePath).catch(() => undefined);
  }

  console.log(
    `[MAIA/press] manuscript rendered { memberIdPrefix: ${memberId.slice(0, 8)}, ` +
      `manuscriptId: ${id}, format: ${format}, sections: ${result.sectionCount}, ` +
      `pages: ${result.pageCount ?? 'n/a'}, sizeKB: ${Math.round(result.sizeBytes / 1024)} }`,
  );

  const name = safeFilename(title);
  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      'Content-Type': MIME[format],
      'Content-Length': String(fileBuffer.length),
      'Content-Disposition':
        `attachment; filename="${name}.${format}"; ` +
        `filename*=UTF-8''${encodeURIComponent(`${title}.${format}`)}`,
      'Cache-Control': 'no-store',
    },
  });
}
