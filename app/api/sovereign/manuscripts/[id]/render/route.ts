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
import { UNTITLED_EXPRESSION } from '@/lib/manuscript/untitledExpression';
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
  /* The draft version the caller believes is current, after settling its own
     pending saves. Optional, and enforced when present: a caller that names a
     version is refused if the draft has moved under it, rather than exporting a
     state nobody was looking at.
     ⚠️ A caller that omits it gets no settle guarantee — the server cannot
     flush a client's autosave, only decline to disagree with it. */
  const claimedVersion = (body as { draftVersion?: unknown })?.draftVersion;
  if (claimedVersion !== undefined && typeof claimedVersion !== 'number') {
    return NextResponse.json({ error: 'draftVersion must be a number' }, { status: 400 });
  }

  // Ownership gate: the manuscript must belong to the caller. 404 (never leak).
  let title: string;
  let author: string | null = null;
  let sections: MemberBookSection[];
  try {
    const ms = await query<{ title: string | null }>(
      `SELECT title FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );
    if (ms.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    /**
     * `title` is nullable since 20260802000001 — a member may begin writing
     * before naming the expression. Resolve the absence HERE, at the boundary
     * that must hand a string to pandoc, and nowhere earlier.
     *
     * Why this is stated rather than inherited: an unnamed manuscript cannot
     * currently reach this line, because `title IS NULL` implies
     * `provenance = 'member_written'`, which implies zero `manuscript_sections`
     * rows, which the check below refuses with a 400. That is a real guard but
     * an ACCIDENTAL one — it protects the renderer via an unrelated fact about
     * section counts. The moment written drafts can be produced into output
     * (the Design/Publish direction this slice is groundwork for), the
     * coincidence dissolves and `null` would reach pandoc as the literal string
     * "null", in the member's own book and its filename.
     *
     * The fallback is display/export only. Nothing is written back: the column
     * stays NULL, and the member's naming is still theirs to perform.
     */
    title = ms.rows[0].title ?? UNTITLED_EXPRESSION;

    /* ── THE CURRENT DRAFT IS THE MANUSCRIPT ────────────────────────────
       Founder ruling 2026-09-07. This read `manuscript_sections` — the SOURCE —
       so a writer could revise a chapter in WRITE, export a .docx, and receive
       the pre-revision text. Silently: the export succeeded and nothing
       refused. Export is not keeping and keeping is not exporting, so this
       reads the LIVE draft and mints no revision.

       ⛔ heading IS NULL, ALWAYS, and that is the ruling rather than a gap.
       `manuscript_draft_sections` has no heading column by decision:
       saveSection records that the stored text CONTAINS its heading bytes, and
       that a heading field would mean inferring "first line = heading" forever.
       write-state's heading is a PREFIX MATCH against the Source — a reading of
       the text, not a field beside it — so passing it here would print every
       chapter title twice, once from the renderer's `# ` and once from the
       writer's own characters.

         Export the writer's characters before beautifying the writer's structure.

       So the text travels WHOLE: no derived heading prepended, no prefix
       stripped, code point for code point. Where a draft carries `# Chapter
       One`, pandoc reads a chapter; where it carries an ordinary title line,
       that line exports as prose. A visible limitation — and the alternative,
       stripping a matched prefix, silently eats a chapter's first line when the
       match is wrong. Structural headings are a separate question. */
    const draft = await query<{ id: string; version: number; content: string; addressable: boolean }>(
      `SELECT id, version, content, (section_addressable_at IS NOT NULL) AS addressable
         FROM manuscript_working_drafts WHERE manuscript_id = $1 AND member_id = $2`,
      [id, memberId],
    );
    const live = draft.rows[0];

    if (live && claimedVersion !== undefined && claimedVersion !== live.version) {
      /* The draft moved under a caller that told us what it had settled. Refuse
         rather than export a state nobody was looking at. */
      return NextResponse.json(
        { error: 'unsettled_draft', detail: 'This draft changed while preparing the export. Try again.' },
        { status: 409 },
      );
    }

    if (live?.addressable) {
      const rows = await query<{ text: string }>(
        `SELECT text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position ASC`,
        [live.id],
      );
      sections = rows.rows.map((r) => ({ heading: null, body: r.text }));
    } else if (live) {
      /* A continuous draft is one span of the member's characters and has no
         section identity at all. It exports as itself rather than being cut. */
      sections = [{ heading: null, body: live.content }];
    } else {
      /* No draft has ever been created, so the Source IS the current state —
         and saying so is honest rather than a fallback to a stale one. */
      const secRows = await query<{ heading: string | null; body: string }>(
        `SELECT heading, body FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position`,
        [id],
      );
      sections = secRows.rows.map((r) => ({ heading: r.heading, body: r.body }));
    }

    if (sections.length === 0 || sections.every((s) => s.body.trim().length === 0)) {
      return NextResponse.json({ error: 'This manuscript has no sections to render' }, { status: 400 });
    }

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
    },
  });
}
