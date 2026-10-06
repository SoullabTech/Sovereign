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
import { inspectBookProduction, renderMemberBook } from '@/lib/manuscript/render/renderMemberBook';
import { loadMemberRenderSource } from '@/lib/manuscript/render/loadMemberRenderSource';
import { memberRef } from '@/lib/privacy/memberRef';

type Format = 'pdf' | 'epub';

const MIME: Record<Format, string> = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
};

function safeFilename(title: string): string {
  const cleaned = title.replace(/[^\w.\- ]+/g, '').trim().slice(0, 120);
  return cleaned.length > 0 ? cleaned : 'manuscript';
}


export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const source = await loadMemberRenderSource(id, memberId);
  if (!source.ok) {
    return NextResponse.json({ error: source.error }, { status: source.status });
  }

  const issues = inspectBookProduction(source.sections);
  return NextResponse.json({
    ready: issues.length === 0,
    title: source.title,
    sectionCount: source.sections.length,
    sourceAuthority: source.sourceAuthority,
    sourceRevision: source.sourceRevision,
    issues,
    publicationBoundary: 'This creates a file from your current writing. It does not publish or distribute it.',
  });
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

  const source = await loadMemberRenderSource(id, memberId);
  if (!source.ok) {
    return NextResponse.json({ error: source.error }, { status: source.status });
  }

  const {
    title,
    author,
    sections,
    sourceAuthority,
    sourceRevision,
  } = source;

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
         (manuscript_id, member_id, format, source_section_count, source_hash, page_count,
          production_profile, source_authority, source_revision)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, memberId, format, result.sectionCount, result.sourceHash, result.pageCount ?? null,
        result.productionProfile, sourceAuthority, sourceRevision],
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
    `[MAIA/press] manuscript rendered { memberRef: ${memberRef(memberId)}, ` +
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
      'X-Soullab-Source-Hash': result.sourceHash,
      'X-Soullab-Source-Authority': sourceAuthority,
      'X-Soullab-Source-Revision': sourceRevision ?? '',
      'X-Soullab-Section-Count': String(result.sectionCount),
      'X-Soullab-Page-Count': String(result.pageCount ?? ''),
      'X-Soullab-Section-First-Pages': result.sectionFirstPages ? JSON.stringify(result.sectionFirstPages) : '',
      'X-Soullab-Production-Profile': result.productionProfile,
    },
  });
}
