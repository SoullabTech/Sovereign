// Production web requires force-dynamic for runtime database access.
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // full-book render (pandoc + Paged.js) can take 60–120s

/**
 * Soullab Press — render the member's manuscript into a book they can hold.
 *
 * POST { format: 'pdf' | 'epub' } may stream a rendered download only after
 * separate member-delivery certification. Until then, owned current requests
 * fail closed with HTTP 423 before manuscript prose or renderer work is reached.
 *
 * When released, the author's own words are set as a book — their sections,
 * in order, verbatim.
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
import { isMemberBookExportReleased } from '@/lib/manuscript/render/memberBookExportRelease';
import { memberRef } from '@/lib/privacy/memberRef';
import { writerReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';

type Format = 'pdf' | 'epub';

const MIME: Record<Format, string> = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
};

function safeFilename(title: string): string {
  const cleaned = title.replace(/[^\w.\- ]+/g, '').trim().slice(0, 120);
  return cleaned.length > 0 ? cleaned : 'manuscript';
}

type HeldExportBoundary =
  | {
      ok: true;
      sourceAuthority: 'working_draft' | 'source';
      sourceRevision: string | null;
    }
  | {
      ok: false;
      status: 404 | 500;
      error: string;
    };

/**
 * Prove ownership and current source identity without reading manuscript prose.
 *
 * The member export hold must preserve the existing 404 and stale-revision 409
 * boundaries, while refusing before section text, author metadata, renderer,
 * temp artifact, provenance write, or downloadable bytes are reached.
 */
async function heldExportBoundary(
  manuscriptId: string,
  memberId: string,
): Promise<HeldExportBoundary> {
  try {
    const owned = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );
    if (owned.rows.length === 0) {
      return { ok: false, status: 404, error: 'Not found' };
    }

    const draft = await query<{
      version: string;
      section_addressable_at: Date | null;
    }>(
      `SELECT version, section_addressable_at
         FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );
    const currentDraft = draft.rows[0] ?? null;
    return currentDraft?.section_addressable_at
      ? {
          ok: true,
          sourceAuthority: 'working_draft',
          sourceRevision: currentDraft.version,
        }
      : { ok: true, sourceAuthority: 'source', sourceRevision: null };
  } catch {
    console.error('[press/manuscripts/:id/render] export hold boundary unavailable');
    return {
      ok: false,
      status: 500,
      error: 'Could not verify this manuscript just now.',
    };
  }
}

function privateJson(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
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
  const release = writerReleaseAuthority();
  return NextResponse.json({
    ready: issues.length === 0,
    title: source.title,
    sectionCount: source.sections.length,
    sourceAuthority: source.sourceAuthority,
    sourceRevision: source.sourceRevision,
    issues,
    releaseManifestId: release.manifestId,
    exportsCertified: release.exportsCertified,
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
  const input = body && typeof body === 'object' && !Array.isArray(body)
    ? body as { format?: unknown; expectedSourceAuthority?: unknown; expectedSourceRevision?: unknown }
    : {};
  const format = input.format;
  if (format !== 'pdf' && format !== 'epub') {
    return NextResponse.json({ error: "format must be 'pdf' or 'epub'" }, { status: 400 });
  }

  // Current Publish sends its preflight identity. Legacy authorized callers
  // remain supported until separately governed migration; neither client flag
  // nor an untrusted revision grants publication or member permission.
  const hasVersionClaim =
    Object.prototype.hasOwnProperty.call(input, 'expectedSourceAuthority') ||
    Object.prototype.hasOwnProperty.call(input, 'expectedSourceRevision');
  if (hasVersionClaim) {
    const authority = input.expectedSourceAuthority;
    const revision = input.expectedSourceRevision;
    if ((authority !== 'working_draft' && authority !== 'source') ||
        (authority === 'working_draft'
          ? typeof revision !== 'string' || revision.length === 0
          : revision !== null)) {
      return NextResponse.json({ error: 'Invalid production preflight.' }, { status: 400 });
    }
  }

  if (!isMemberBookExportReleased()) {
    const boundary = await heldExportBoundary(id, memberId);
    if (!boundary.ok) {
      return privateJson({ error: boundary.error }, boundary.status);
    }
    if (hasVersionClaim &&
        (boundary.sourceAuthority !== input.expectedSourceAuthority ||
         boundary.sourceRevision !== input.expectedSourceRevision)) {
      return privateJson(
        { error: 'Your writing changed since the production check. Check again before preparing a file.' },
        409,
      );
    }
    return privateJson(
      {
        error: 'PDF and EPUB delivery is not yet available.',
        code: 'MEMBER_BOOK_EXPORT_HELD',
      },
      423,
    );
  }

  const source = await loadMemberRenderSource(id, memberId);
  if (!source.ok) {
    return NextResponse.json({ error: source.error }, { status: source.status });
  }
  if (hasVersionClaim &&
      (source.sourceAuthority !== input.expectedSourceAuthority ||
       source.sourceRevision !== input.expectedSourceRevision)) {
    return NextResponse.json(
      { error: 'Your writing changed since the production check. Check again before preparing a file.' },
      { status: 409, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const release = writerReleaseAuthority();
  if (release.exportsCertified[format] !== true) {
    return NextResponse.json(
      {
        error: `${format.toUpperCase()} preparation is not certified on this Writer image.`,
        format,
        exportsCertified: false,
        releaseManifestId: release.manifestId,
      },
      { status: 423, headers: { 'Cache-Control': 'private, no-store' } },
    );
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

  if (hasVersionClaim) {
    // PDF setting can take minutes. A writer may have saved another revision
    // while the file was being prepared. Recheck before recording provenance
    // or exposing bytes. A failed or unavailable recheck is NOT permission to
    // deliver an edition labeled as the author's current text.
    const confirmed = await loadMemberRenderSource(id, memberId);
    if (!confirmed.ok ||
        confirmed.sourceAuthority !== input.expectedSourceAuthority ||
        confirmed.sourceRevision !== input.expectedSourceRevision) {
      await fs.unlink(result.filePath).catch(() => undefined);
      return NextResponse.json(
        { error: 'Your writing changed or could not be reconfirmed during production. Check again before making a file.' },
        { status: 409, headers: { 'Cache-Control': 'no-store' } },
      );
    }
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
      // Only an authenticated owner reaches this response. These non-content
      // production facts bind Publish's cover/proof UI to the bytes downloaded.
      // Unknown page count is omitted rather than invented for spine geometry.
      ...(Number.isInteger(result.pageCount) && (result.pageCount ?? 0) > 0
        ? { 'X-Soullab-Page-Count': String(result.pageCount) }
        : {}),
      'X-Soullab-Production-Profile': result.productionProfile,
      'X-Soullab-Source-Hash': result.sourceHash,
    },
  });
}
