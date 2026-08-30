/**
 * Soullab Press — render a MEMBER's manuscript into a book they can hold.
 *
 * The book-studio render routes (app/api/book-studio/render/*) render ONE
 * founder book (Elemental Alchemy) from a sealed on-disk source, with founder
 * content injected (canonical plates, Atlas QR, Soullab imprint metadata).
 * This helper renders an ARBITRARY member manuscript from their own sections —
 * none of that founder coupling.
 *
 * CONSTITUTIONAL LINES:
 *   - The book is 100% the author's own words. Their sections, in their order,
 *     verbatim. Nothing generated, woven, summarized, or inferred.
 *   - No Soullab imprint / publisher / colophon is stamped into the private
 *     book. Only the author's own title and name appear. The book is theirs.
 *   - Output is a temp file the caller streams and deletes — a member's
 *     manuscript is never written to a public/served path.
 *
 * Pipeline mirrors the proven founder path (pandoc → HTML → Paged.js/Puppeteer
 * for PDF; pandoc epub3 for EPUB); the engine (renderHtmlToPdf, pandoc) is
 * already in the production container.
 */

import { promises as fs } from 'node:fs';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

import { renderHtmlToPdf } from '@/lib/manuscript/render/pagedPdf';

/* The assembler and its section shape live in a leaf module so callers that
   only need markdown — the WS2-04A draft census — need not pull puppeteer in
   through pagedPdf. Re-exported here so existing importers are unaffected. */
export { assembleManuscriptMarkdown, type MemberBookSection } from './assembleMarkdown';
import { assembleManuscriptMarkdown, type MemberBookSection } from './assembleMarkdown';


export interface RenderMemberBookOptions {
  title: string;
  /** The author's own name (from their member profile). Optional. */
  author?: string | null;
  format: 'pdf' | 'epub';
}

export interface MemberBookResult {
  /** Absolute path to the rendered file in the OS temp dir. Caller deletes it. */
  filePath: string;
  sizeBytes: number;
  /** Page count for PDF (best-effort); undefined for EPUB or if unavailable. */
  pageCount?: number;
  /** sha256 over the source sections — provenance / version of this render. */
  sourceHash: string;
  sectionCount: number;
}

const REPO_ROOT = process.cwd();
const PRINT_CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/print-book.css');
const EPUB_CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/epub-book.css');
const MAX_PANDOC_BUFFER = 256 * 1024 * 1024;


/**
 * Provenance hash: a stable digest of the exact source sections this render was
 * built from. Two renders of the same manuscript state share a hash; any edit
 * changes it. Records "which words became this book", never their meaning.
 * Explicit field/record separators keep section-boundary changes distinguishable.
 */
export function computeSourceHash(sections: MemberBookSection[]): string {
  const FIELD_SEP = '\u0000'; // between a section's heading and body
  const RECORD_SEP = '\u001e'; // between sections
  const h = createHash('sha256');
  for (const s of sections) {
    h.update(s.heading ?? '');
    h.update(FIELD_SEP);
    h.update(s.body);
    h.update(RECORD_SEP);
  }
  return h.digest('hex');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * The shared book stylesheets are authored for the founder book and carry its
 * name in their header comments (e.g. "Elemental Alchemy", "Soullab Press").
 * A member's private book must be theirs alone — strip CSS comments so no
 * founder identity is embedded in the file. The remaining rules are generic
 * book typography; the founder-only selectors (.canonical-plate etc.) never
 * match member content and are inert.
 */
export function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function metadataArgs(opts: RenderMemberBookOptions): string[] {
  const args = ['--metadata', `title=${opts.title}`];
  if (opts.author && opts.author.trim()) {
    args.push('--metadata', `author=${opts.author.trim()}`);
  }
  return args;
}

async function renderPdf(
  markdown: string,
  opts: RenderMemberBookOptions,
): Promise<{ filePath: string; sizeBytes: number; pageCount?: number }> {
  // pandoc: markdown (stdin) → standalone HTML5. No lua filters, no plates.
  const pandocStdout = execFileSync(
    'pandoc',
    ['-f', 'markdown', '-t', 'html5', '--standalone', '--no-highlight', ...metadataArgs(opts)],
    { input: markdown, encoding: 'utf-8', maxBuffer: MAX_PANDOC_BUFFER },
  );

  const bodyMatch = pandocStdout.match(/<body[^>]*>([\s\S]*)<\/body>/);
  const bodyHtml = bodyMatch ? bodyMatch[1] : pandocStdout;

  const css = fsSync.existsSync(PRINT_CSS_PATH)
    ? stripCssComments(fsSync.readFileSync(PRINT_CSS_PATH, 'utf-8'))
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(opts.title)}</title>
  <style>${css}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  const filePath = path.join(os.tmpdir(), `press-book-${randomUUID()}.pdf`);
  await renderHtmlToPdf(html, {
    outputPath: filePath,
    width: '6in',
    height: '9in',
    timeoutMs: 240_000,
  });

  const stat = await fs.stat(filePath);
  let pageCount: number | undefined;
  try {
    const buf = await fs.readFile(filePath);
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    try {
      const parsed = await parser.getText();
      pageCount = parsed.pages?.length;
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  } catch {
    // Page count is a nicety, not load-bearing — the PDF still rendered.
  }

  return { filePath, sizeBytes: stat.size, pageCount };
}

async function renderEpub(
  markdown: string,
  opts: RenderMemberBookOptions,
): Promise<{ filePath: string; sizeBytes: number }> {
  const filePath = path.join(os.tmpdir(), `press-book-${randomUUID()}.epub`);
  const args = [
    '-f', 'markdown',
    '-t', 'epub3',
    ...metadataArgs(opts),
    '--metadata', 'lang=en-US',
    '--toc',
    '--toc-depth=2',
    // --epub-chapter-level is back-compatible with the Pandoc 2.17 pinned in
    // the container (--split-level is 3.x only). See book-studio epub route.
    '--epub-chapter-level=1',
  ];
  // Pass a comment-stripped copy of the stylesheet (never the founder-named
  // original) so no founder identity is embedded in the member's EPUB.
  let tempCssPath: string | null = null;
  if (fsSync.existsSync(EPUB_CSS_PATH)) {
    tempCssPath = path.join(os.tmpdir(), `press-book-css-${randomUUID()}.css`);
    await fs.writeFile(tempCssPath, stripCssComments(fsSync.readFileSync(EPUB_CSS_PATH, 'utf-8')), 'utf-8');
    args.push('--css', tempCssPath);
  }
  args.push('-o', filePath);

  try {
    execFileSync('pandoc', args, {
      input: markdown,
      encoding: 'utf-8',
      maxBuffer: MAX_PANDOC_BUFFER,
    });
  } finally {
    if (tempCssPath) await fs.unlink(tempCssPath).catch(() => undefined);
  }

  const stat = await fs.stat(filePath);
  return { filePath, sizeBytes: stat.size };
}

/**
 * Render the member's manuscript sections into a PDF or EPUB temp file.
 * Throws on pandoc / Chromium failure (caller maps to an actionable message).
 */
export async function renderMemberBook(
  sections: MemberBookSection[],
  opts: RenderMemberBookOptions,
): Promise<MemberBookResult> {
  const markdown = assembleManuscriptMarkdown(sections);
  const sourceHash = computeSourceHash(sections);
  const sectionCount = sections.length;

  if (opts.format === 'pdf') {
    const { filePath, sizeBytes, pageCount } = await renderPdf(markdown, opts);
    return { filePath, sizeBytes, pageCount, sourceHash, sectionCount };
  }
  const { filePath, sizeBytes } = await renderEpub(markdown, opts);
  return { filePath, sizeBytes, sourceHash, sectionCount };
}
