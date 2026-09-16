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

export interface MemberBookSection {
  heading: string | null;
  body: string;
  /** Structural evidence carried by the manuscript source. Null means unknown. */
  headingDepth?: 1 | 2 | 3 | null;
  /** Provenance for the structural evidence; presentation never manufactures it. */
  headingSignal?: string | null;
}

export type PublicationRole =
  | 'copyright' | 'permissions' | 'dedication' | 'disclaimer' | 'contents' | 'preface'
  | 'acknowledgments' | 'bibliography' | 'resources' | 'afterword'
  | 'part' | 'chapter' | 'section' | 'subsection' | 'unclassified';

/**
 * Conservative production semantics. Heading WORDS may name explicit
 * publication matter; hierarchy comes only from stored structural evidence.
 * Body prose is never inspected to decide what kind of book object it is.
 */
export function publicationRoleFor(section: MemberBookSection): PublicationRole {
  const heading = section.heading?.trim() ?? '';
  const normalized = heading.toLowerCase().replace(/[—–:]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (/^part\b/i.test(heading) && section.headingDepth === 1) return 'part';
  if (/^chapter\s+(?:\d+|[ivxlcdm]+)\b/i.test(heading) && section.headingDepth === 1) return 'chapter';
  if (normalized === 'copyright' || normalized === 'copyright notice') return 'copyright';
  if (normalized === 'permissions') return 'permissions';
  if (normalized === 'dedication') return 'dedication';
  if (normalized === 'disclaimer') return 'disclaimer';
  if (normalized === 'contents') return 'contents';
  if (normalized === 'preface') return 'preface';
  if (normalized === 'acknowledgments' || normalized === 'acknowledgements') return 'acknowledgments';
  if (normalized === 'bibliography') return 'bibliography';
  if (normalized === 'additional resources' || normalized === 'resources') return 'resources';
  if (normalized === 'afterword' || normalized.startsWith('afterword ')) return 'afterword';
  return section.headingDepth === 2 ? 'section'
    : section.headingDepth === 3 ? 'subsection'
      : 'unclassified';
}

export interface BookProductionIssue {
  code: 'copyright_not_governed' | 'duplicate_copyright_statements';
  severity: 'blocker';
  sectionIndexes: number[];
  message: string;
}

const COPYRIGHT_STATEMENT = /\bcopyright\s*(?:©|\(c\))?\s*\d{4}\b/i;

/**
 * Read-only production preflight. It reports; it never edits, deduplicates or
 * chooses the author's legal language. Copyright becomes governed only when an
 * explicit Copyright / Copyright Notice heading says so. Body prose cannot
 * grant itself that authority.
 */
export function inspectBookProduction(sections: readonly MemberBookSection[]): BookProductionIssue[] {
  const copyrightIndexes = sections
    .map((section, index) => COPYRIGHT_STATEMENT.test(section.body) ? index : -1)
    .filter((index) => index >= 0);
  if (copyrightIndexes.length === 0) return [];

  const issues: BookProductionIssue[] = [];
  const governed = copyrightIndexes.filter((index) => publicationRoleFor(sections[index]!) === 'copyright');
  if (governed.length !== 1 || governed[0] !== copyrightIndexes[0] || copyrightIndexes.length !== 1) {
    issues.push({
      code: 'copyright_not_governed', severity: 'blocker', sectionIndexes: copyrightIndexes,
      message: 'Copyright language exists, but there is not exactly one explicit governed Copyright object.',
    });
  }
  if (copyrightIndexes.length > 1) {
    issues.push({
      code: 'duplicate_copyright_statements', severity: 'blocker', sectionIndexes: copyrightIndexes,
      message: 'More than one section contains a copyright statement. Choose one canonical publication object before final production.',
    });
  }
  return issues;
}

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
  /** Versioned physical-composition rules used to make this artifact. */
  productionProfile: string;
}

const REPO_ROOT = process.cwd();
const PRINT_CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/print-book.css');
const EPUB_CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/epub-book.css');
const MAX_PANDOC_BUFFER = 256 * 1024 * 1024;

export const HALLMARK_PRODUCTION_PROFILE = 'hallmark-6x9-v1';

const LATIN_RANGE = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT_RANGE = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

type SpectralFace = { weight: 400 | 600; style: 'normal' | 'italic'; subset: 'latin' | 'latin-ext'; range: string };
const SPECTRAL_FACES: readonly SpectralFace[] = [
  { weight: 400, style: 'normal', subset: 'latin', range: LATIN_RANGE },
  { weight: 400, style: 'normal', subset: 'latin-ext', range: LATIN_EXT_RANGE },
  { weight: 400, style: 'italic', subset: 'latin', range: LATIN_RANGE },
  { weight: 400, style: 'italic', subset: 'latin-ext', range: LATIN_EXT_RANGE },
  { weight: 600, style: 'normal', subset: 'latin', range: LATIN_RANGE },
  { weight: 600, style: 'normal', subset: 'latin-ext', range: LATIN_EXT_RANGE },
  { weight: 600, style: 'italic', subset: 'latin', range: LATIN_RANGE },
  { weight: 600, style: 'italic', subset: 'latin-ext', range: LATIN_EXT_RANGE },
];

/** Font assets and page architecture must be separate stylesheets.
 *
 * Chromium drops the first @page rule when it immediately follows embedded
 * @font-face blocks in the same stylesheet. Paged.js would then keep its
 * built-in Letter default. Keeping these two concerns separate is therefore a
 * physical-output invariant, not an aesthetic preference.
 */
export interface HallmarkPrintStyles {
  fontCss: string;
  bookCss: string;
}

export function buildHallmarkPrintStyles(baseCss: string): HallmarkPrintStyles {
  const fontCss = SPECTRAL_FACES.map((face) => {
    const filename = `spectral-${face.weight}-${face.style}-${face.subset}.woff2`;
    const filePath = path.join(REPO_ROOT, 'public', 'fonts', 'spectral', filename);
    if (!fsSync.existsSync(filePath)) throw new Error(`Hallmark font asset missing: ${filename}`);
    const data = fsSync.readFileSync(filePath).toString('base64');
    return `@font-face {\n  font-family: 'Hallmark Spectral';\n  font-style: ${face.style};\n  font-weight: ${face.weight};\n  font-display: block;\n  src: url('data:font/woff2;base64,${data}') format('woff2');\n  unicode-range: ${face.range};\n}`;
  }).join('\n\n');

  const bookCss = baseCss
    .replace(/@import\s+url\(\s*(?:'[^']*'|"[^"]*"|[^)]*)\s*\)\s*;?/gi, '')
    .replace(/'EB Garamond',\s*Garamond,\s*'Adobe Garamond Pro',\s*'Garamond Premier Pro',\s*serif/g, "'Hallmark Spectral', serif")
    .replace(/'EB Garamond',\s*Garamond,\s*serif/g, "'Hallmark Spectral', serif")
    .replace(/font-weight:\s*(?:500|700)\b/g, 'font-weight: 600');

  return { fontCss, bookCss };
}

/**
 * Assemble the author's sections into one Markdown document without flattening
 * the book. Confirmed source depth is preserved as Markdown depth 1/2/3. An
 * unconfirmed heading is deliberately rendered at level 4: visible, but never
 * promoted into a chapter merely because it has typography or capital letters.
 * The BODY follows verbatim. Title/author remain metadata, not manuscript text.
 */
export function assembleManuscriptMarkdown(sections: MemberBookSection[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    const heading = s.heading?.trim();
    if (heading) {
      const depth = s.headingDepth === 1 || s.headingDepth === 2 || s.headingDepth === 3
        ? s.headingDepth : 4;
      const role = publicationRoleFor(s);
      const roleClass = role === 'unclassified' ? '' : ` {.book-${role}}`;
      parts.push(`${'#'.repeat(depth)} ${heading}${roleClass}`);
      parts.push('');
    }
    parts.push(s.body);
    parts.push('');
  }
  return parts.join('\n');
}

/**
 * Provenance hash: a stable digest of the exact render SOURCE: words plus the
 * stored structural evidence that determines physical hierarchy. Two renders of
 * the same manuscript state share a hash; an edit OR a structural depth change
 * changes it. No interpretation or inferred meaning enters the digest.
 */
export function computeSourceHash(sections: MemberBookSection[]): string {
  const FIELD_SEP = '\u0000';
  const RECORD_SEP = '\u001e';
  const h = createHash('sha256');
  for (const s of sections) {
    h.update(s.heading ?? '');
    h.update(FIELD_SEP);
    h.update(String(s.headingDepth ?? ''));
    h.update(FIELD_SEP);
    h.update(s.headingSignal ?? '');
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
    ? buildHallmarkPrintStyles(stripCssComments(fsSync.readFileSync(PRINT_CSS_PATH, 'utf-8')))
    : { fontCss: '', bookCss: '' };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(opts.title)}</title>
  <style data-hallmark-fonts>${css.fontCss}</style>
  <style data-hallmark-book>${css.bookCss}</style>
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
    assertPagedPageSize: true,
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
    return { filePath, sizeBytes, pageCount, sourceHash, sectionCount, productionProfile: HALLMARK_PRODUCTION_PROFILE };
  }
  const { filePath, sizeBytes } = await renderEpub(markdown, opts);
  return { filePath, sizeBytes, sourceHash, sectionCount, productionProfile: HALLMARK_PRODUCTION_PROFILE };
}
