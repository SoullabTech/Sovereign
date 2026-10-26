/**
 * Soullab Press — file-upload → plain-text extraction (Manuscript Room ingest).
 *
 * Turns an uploaded .docx / .pdf / .txt / .md file into the manuscript's own
 * text so it can flow into the existing member-confirmed segmentation +
 * save path. The member sees the extracted text before anything is saved.
 *
 * DOCTRINE:
 *   - The author's words, unchanged. We never rewrite, summarize, or add.
 *   - DOCX is converted to Markdown so Word heading styles (Heading 1/2)
 *     survive as `#` / `##`, which the mechanical segmenter already reads —
 *     structure the author chose, carried through, not invented here.
 *   - PDF yields its text layer only. Scanned/image PDFs have no text layer;
 *     we say so plainly (a warning) rather than fabricate or silently fail.
 *     OCR is deliberately out of scope for this slice.
 *   - No persistence, no network, no model. Deterministic parsing only.
 */

import path from 'node:path';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';
import { preserveDocxStructure, type DocxFidelity } from './docxFidelity';
export { UnsupportedDocxStructureError } from './docxFidelity';

export type UploadFormat = 'docx' | 'pdf' | 'epub' | 'text';

export interface ParseUploadResult {
  /** The extracted text, verbatim (Markdown for .docx, plain for the rest). */
  text: string;
  /** Non-fatal notices for the member (e.g. a scanned PDF with no text). */
  warnings: string[];
  format: UploadFormat;
  /** Human-reviewable fidelity report, for Word uploads only. */
  fidelity?: DocxFidelity;
}

/** Thrown when the file type cannot be read here (caller → 415/400). */
export class UnsupportedUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedUploadError';
  }
}

function extOf(filename: string): string {
  const m = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

/**
 * Detect the upload format from filename extension first (authoritative for the
 * formats we accept), falling back to the browser-provided MIME type.
 */
export function detectFormat(filename: string, mime?: string | null): UploadFormat | null {
  const ext = extOf(filename);
  if (ext === 'docx') return 'docx';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'epub') return 'epub';
  if (ext === 'txt' || ext === 'md' || ext === 'markdown') return 'text';

  const m = (mime ?? '').toLowerCase();
  if (m.includes('officedocument.wordprocessingml')) return 'docx';
  if (m === 'application/pdf') return 'pdf';
  if (m === 'application/epub+zip') return 'epub';
  if (m.startsWith('text/')) return 'text';
  return null;
}

/**
 * Normalize mammoth's own Markdown artifacts — NOT the author's content.
 *   - Word heading bookmarks come through as `<a id="…"></a>` anchors placed
 *     immediately before the heading, on the same line. Left in, they stop the
 *     heading from starting with `#` (breaking mechanical segmentation) and
 *     would render as stray markup. mammoth emits them; the author did not.
 *   - mammoth defensively backslash-escapes Markdown punctuation it did not
 *     author (e.g. `late\.`). Unescaping restores the author's actual
 *     characters — this makes the text MORE faithful, not less.
 */
function normalizeMammothMarkdown(md: string): string {
  return md
    .replace(/<a id="[^"]*"><\/a>/g, '')
    .replace(/\\([.\-+*_`#()[\]!>~])/g, '$1');
}

async function extractDocxMarkdown(buffer: Buffer) {
  // Convert twice, independently: Markdown carries author-visible text and
  // headings; HTML is the structural witness for tables, footnote links, and
  // exact standalone quotations. Never use the HTML as executable markup.
  // Runtime supports this legacy converter even though the published Mammoth
  // TypeScript interface omits it. Keep the actual return shape explicit.
  const markdownApi = mammoth as typeof mammoth & {
    convertToMarkdown(input: { buffer: Buffer }): Promise<{
      value: string;
      messages: Array<{ type: string; message: string }>;
    }>;
  };
  const markdown = await markdownApi.convertToMarkdown({ buffer });
  const html = await mammoth.convertToHtml({ buffer });
  const messages = [...markdown.messages, ...html.messages]
    .filter((m) => m.type === 'warning')
    .map((m) => m.message);
  return preserveDocxStructure(
    normalizeMammothMarkdown(markdown.value ?? ''),
    html.value ?? '',
    messages,
  );
}

async function extractPdfText(
  buffer: Buffer,
): Promise<{ text: string; warnings: string[] }> {
  // pdf-parse v2 is dynamically imported (its ESM/CJS shim trips the RSC
  // bundler on static import — see lib/workbench/extract/pdf.ts).
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    /* PDF-CLEAN — pdf-parse appends a synthetic page marker to every page.
       Its default `pageJoiner` is '\n-- page_number of total_number --', so a
       ten-page manuscript arrives carrying ten lines the author never wrote.
       What that costs, stated no higher than it is: the marker canNOT become a
       heading — `segment.ts` needs `#`, "Chapter", or a leading capital, and a
       line starting `--` matches none of them. The harm is fidelity, not
       structure. The member reads invented lines in their own manuscript, the
       lines persist verbatim into section bodies and into the `source_text`
       held as custody of what arrived, and they count toward the word count
       the member is shown. That is Soullab's text recorded as the author's.

       THE INVARIANT, and the whole lesson of the characterization:

           Never remove page-marker-looking text AFTER extraction. By then
           author text and parser text may be indistinguishable.

       Not a stylistic preference — a provenance fact. Characterized against
       pdf-parse 2.4.5 on a three-page subject whose page 2 carried an
       author-written `-- 2 of 3 --`. In `result.text` the author's line and
       the synthetic one landed two lines apart, byte for byte identical. Once
       flattened into that string, provenance is gone, and any filter that
       removes ours removes theirs.

       So the marker is not emitted rather than deleted. The library documents
       an empty joiner as "no page boundary marker is added", and the claim
       this earns is precise and no larger:

           No page-boundary label or replacement separator is authored by
           Soullab. pdf-parse may retain its own aggregate whitespace
           formatting.

       It would be easy to write "every character then came from the PDF", and
       it would be false: the characterization shows blank lines still standing
       between pages in the aggregate. They are pdf-parse's, not ours, and they
       are harmless — but harmless is not the same as absent, and this file's
       whole subject is the difference between what we authored and what we
       did not.

       That is also why this is the repair and reconstructing from
       `result.pages` is not: joining pages ourselves would make Soullab the
       author of whatever went between them, and even '\n\n' would then be
       our editorial act rather than the library's.

       This is the doctrine at the top of this file applied to a case where it
       had quietly lapsed: the author's words, unchanged — and nothing added. */
    const result = await parser.getText({ pageJoiner: '' });
    const text = result.text ?? '';
    const pageCount = result.pages?.length ?? 0;
    const avgPerPage = pageCount > 0 ? text.trim().length / pageCount : 0;
    const warnings: string[] = [];
    // Heuristic: near-empty text over the page count means an image/scanned PDF.
    // More reliable now that the synthetic markers are gone: they used to add
    // ~14 characters per page to a document with no text layer at all, which
    // is a real fraction of this 20-character threshold.
    if (text.trim().length === 0 || avgPerPage < 20) {
      warnings.push(
        'This PDF looks like scanned images — we can read text from typed PDFs, but not from scans yet. If you have the original Word (.docx) or a text version, that will bring your words in.',
      );
    }
    return { text, warnings };
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

const EPUB_MAX_ENTRIES = 2_000;
const EPUB_MAX_ENTRY_BYTES = 8 * 1024 * 1024;
const EPUB_MAX_TOTAL_BYTES = 64 * 1024 * 1024;
const EPUB_MAX_TEXT_CHARS = 2_000_000;

function localName(node: Node): string {
  const named = node as Node & { localName?: string | null; nodeName?: string };
  return (named.localName ?? named.nodeName?.split(':').pop() ?? '').toLowerCase();
}

function elementsNamed(root: Document | Element, wanted: string): Element[] {
  const all = root.getElementsByTagName('*');
  const found: Element[] = [];
  for (let i = 0; i < all.length; i += 1) {
    const item = all.item(i);
    if (item && localName(item) === wanted) found.push(item);
  }
  return found;
}

function parseXml(xml: string, label: string): Document {
  const errors: string[] = [];
  const parser = new DOMParser({
    errorHandler: {
      warning: () => undefined,
      error: (message: string) => errors.push(message),
      fatalError: (message: string) => errors.push(message),
    },
  });
  const document = parser.parseFromString(xml, 'application/xml');
  if (!document || errors.length > 0 || elementsNamed(document, 'parsererror').length > 0) {
    throw new UnsupportedUploadError(`This EPUB has an unreadable ${label}.`);
  }
  return document;
}

function decodedHref(href: string): string {
  const withoutFragment = href.split('#', 1)[0]!.split('?', 1)[0]!;
  try {
    return decodeURIComponent(withoutFragment);
  } catch {
    throw new UnsupportedUploadError('This EPUB contains an invalid encoded file path.');
  }
}

function safeEpubPath(baseFile: string, href: string): string {
  const joined = path.posix.normalize(
    path.posix.join(path.posix.dirname(baseFile), decodedHref(href)),
  ).replace(/^\/+/, '');
  if (!joined || joined === '..' || joined.startsWith('../') || joined.includes('/../')) {
    throw new UnsupportedUploadError('This EPUB contains a file path outside the book package.');
  }
  return joined;
}

function zipUncompressedSize(entry: unknown): number | null {
  const value = (entry as { _data?: { uncompressedSize?: unknown } })?._data?.uncompressedSize;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

async function readZipText(zip: JSZip, name: string, label: string): Promise<string> {
  const entry = zip.file(name);
  if (!entry || entry.dir) {
    throw new UnsupportedUploadError(`This EPUB is missing its ${label}.`);
  }
  const size = zipUncompressedSize(entry);
  if (size !== null && size > EPUB_MAX_ENTRY_BYTES) {
    throw new UnsupportedUploadError(`This EPUB's ${label} is unexpectedly large.`);
  }
  return entry.async('string');
}

const EPUB_SKIP = new Set(['head', 'script', 'style', 'svg', 'nav', 'noscript']);
const EPUB_BLOCK = new Set([
  'address', 'article', 'aside', 'blockquote', 'dd', 'div', 'dl', 'dt', 'figcaption',
  'figure', 'footer', 'header', 'li', 'main', 'ol', 'p', 'pre', 'section', 'table', 'ul',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

function inlineText(node: Node): string {
  if (node.nodeType === 3) return (node.nodeValue ?? '').replace(/\u00a0/g, ' ');
  if (node.nodeType !== 1) return '';
  const name = localName(node);
  if (EPUB_SKIP.has(name)) return '';
  if (name === 'br') return '\n';
  let value = '';
  for (let i = 0; i < node.childNodes.length; i += 1) {
    value += inlineText(node.childNodes.item(i)!);
  }
  return value;
}

function cleanInline(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\t \f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function directBlockChild(element: Element): boolean {
  for (let i = 0; i < element.childNodes.length; i += 1) {
    const child = element.childNodes.item(i);
    if (child?.nodeType === 1 && EPUB_BLOCK.has(localName(child))) return true;
  }
  return false;
}

function xhtmlToEditableText(xml: string): {
  text: string;
  tableLayoutLost: boolean;
  deepHeadingCollapsed: boolean;
} {
  const document = parseXml(xml, 'content document');
  const body = elementsNamed(document, 'body')[0] ?? document.documentElement;
  const blocks: string[] = [];
  let tableLayoutLost = false;
  let deepHeadingCollapsed = false;

  const push = (value: string) => {
    const cleaned = cleanInline(value);
    if (cleaned) blocks.push(cleaned);
  };

  const visit = (node: Node): void => {
    if (node.nodeType === 3) {
      push(node.nodeValue ?? '');
      return;
    }
    if (node.nodeType !== 1) return;
    const element = node as Element;
    const name = localName(element);
    if (EPUB_SKIP.has(name)) return;

    if (/^h[1-6]$/.test(name)) {
      const sourceDepth = Number(name.slice(1));
      const depth = Math.min(3, sourceDepth);
      if (sourceDepth > 3) deepHeadingCollapsed = true;
      const text = cleanInline(inlineText(element));
      if (text) blocks.push(`${'#'.repeat(depth)} ${text}`);
      return;
    }
    if (name === 'p') {
      push(inlineText(element));
      return;
    }
    if (name === 'pre') {
      const raw = (element.textContent ?? '').replace(/\r\n?/g, '\n').trimEnd();
      if (raw.trim()) blocks.push(raw);
      return;
    }
    if (name === 'blockquote') {
      const value = cleanInline(inlineText(element));
      if (value) blocks.push(value.split('\n').map((line) => `> ${line}`).join('\n'));
      return;
    }
    if (name === 'li') {
      const value = cleanInline(inlineText(element));
      if (value) blocks.push(`- ${value}`);
      return;
    }
    if (name === 'table') {
      tableLayoutLost = true;
      const rows = elementsNamed(element, 'tr');
      for (const row of rows) {
        const cells = [...elementsNamed(row, 'th'), ...elementsNamed(row, 'td')]
          .map((cell) => cleanInline(inlineText(cell)))
          .filter(Boolean);
        if (cells.length) blocks.push(cells.join('\t'));
      }
      return;
    }

    if (directBlockChild(element)) {
      for (let i = 0; i < element.childNodes.length; i += 1) visit(element.childNodes.item(i)!);
      return;
    }
    push(inlineText(element));
  };

  for (let i = 0; i < body.childNodes.length; i += 1) visit(body.childNodes.item(i)!);
  return {
    text: blocks.join('\n\n').replace(/\n{3,}/g, '\n\n').trim(),
    tableLayoutLost,
    deepHeadingCollapsed,
  };
}

async function extractEpubText(buffer: Buffer): Promise<{ text: string; warnings: string[] }> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer, { checkCRC32: true, createFolders: false });
  } catch {
    throw new UnsupportedUploadError('This EPUB is not a readable EPUB package.');
  }

  const entries = Object.values(zip.files);
  if (entries.length > EPUB_MAX_ENTRIES) {
    throw new UnsupportedUploadError('This EPUB contains too many internal files to review safely.');
  }
  const knownTotal = entries.reduce((sum, entry) => sum + (zipUncompressedSize(entry) ?? 0), 0);
  if (knownTotal > EPUB_MAX_TOTAL_BYTES) {
    throw new UnsupportedUploadError('This EPUB expands beyond the safe local review limit.');
  }

  const mimetype = zip.file('mimetype');
  if (mimetype) {
    const declared = (await mimetype.async('string')).trim();
    if (declared && declared !== 'application/epub+zip') {
      throw new UnsupportedUploadError('This file is a ZIP archive, but it is not identified as an EPUB.');
    }
  }

  const containerXml = await readZipText(zip, 'META-INF/container.xml', 'package container');
  const container = parseXml(containerXml, 'package container');
  const rootfile = elementsNamed(container, 'rootfile')[0];
  const fullPath = rootfile?.getAttribute('full-path')?.trim();
  if (!fullPath) throw new UnsupportedUploadError('This EPUB does not name its package document.');
  const opfPath = path.posix.normalize(decodedHref(fullPath)).replace(/^\/+/, '');
  if (!opfPath || opfPath.startsWith('../')) {
    throw new UnsupportedUploadError('This EPUB names a package document outside the book package.');
  }

  const opfXml = await readZipText(zip, opfPath, 'package document');
  const opf = parseXml(opfXml, 'package document');
  const manifest = new Map<string, { path: string; mediaType: string; properties: string }>();
  for (const item of elementsNamed(opf, 'item')) {
    const id = item.getAttribute('id')?.trim();
    const href = item.getAttribute('href')?.trim();
    if (!id || !href) continue;
    manifest.set(id, {
      path: safeEpubPath(opfPath, href),
      mediaType: item.getAttribute('media-type')?.trim().toLowerCase() ?? '',
      properties: item.getAttribute('properties')?.trim().toLowerCase() ?? '',
    });
  }

  const spineElement = elementsNamed(opf, 'spine')[0];
  if (!spineElement) throw new UnsupportedUploadError('This EPUB has no reading-order spine.');
  const spinePaths: string[] = [];
  for (const itemref of elementsNamed(spineElement, 'itemref')) {
    const idref = itemref.getAttribute('idref')?.trim();
    const item = idref ? manifest.get(idref) : null;
    if (!item || item.properties.split(/\s+/).includes('nav')) continue;
    if (item.mediaType && !/xhtml|html|xml/.test(item.mediaType)) continue;
    if (!spinePaths.includes(item.path)) spinePaths.push(item.path);
  }
  if (!spinePaths.length) throw new UnsupportedUploadError('This EPUB has no readable text in its spine.');

  const encryptionEntry = zip.file('META-INF/encryption.xml');
  if (encryptionEntry) {
    const encryption = parseXml(await encryptionEntry.async('string'), 'encryption manifest');
    for (const encrypted of elementsNamed(encryption, 'encrypteddata')) {
      const method = elementsNamed(encrypted, 'encryptionmethod')[0]?.getAttribute('Algorithm') ?? '';
      const uri = elementsNamed(encrypted, 'cipherreference')[0]?.getAttribute('URI') ?? '';
      if (!uri) continue;
      const target = path.posix.normalize(decodedHref(uri)).replace(/^\/+/, '');
      const knownFontObfuscation = method.includes('idpf.org/2008/embedding')
        || method.includes('adobe.com/pdf/enc');
      if (spinePaths.includes(target) || /\.(xhtml?|html?|opf|ncx|xml)$/i.test(target)
          || !knownFontObfuscation) {
        throw new UnsupportedUploadError(
          'This EPUB is encrypted or DRM-protected. Export an unprotected EPUB from the authoring application and try again.',
        );
      }
    }
  }

  const warnings = [
    'EPUB text is brought in in reading order. Typography, images, footnotes, and page layout remain in the original EPUB and are not copied into the editable draft.',
  ];
  const documents: string[] = [];
  let tableLayoutLost = false;
  let deepHeadingCollapsed = false;
  for (const spinePath of spinePaths) {
    const entry = zip.file(spinePath);
    if (!entry) {
      warnings.push(`One EPUB reading-order file was missing: ${path.posix.basename(spinePath)}.`);
      continue;
    }
    const size = zipUncompressedSize(entry);
    if (size !== null && size > EPUB_MAX_ENTRY_BYTES) {
      throw new UnsupportedUploadError('One EPUB chapter is unexpectedly large.');
    }
    const parsed = xhtmlToEditableText(await entry.async('string'));
    if (parsed.text) documents.push(parsed.text);
    tableLayoutLost ||= parsed.tableLayoutLost;
    deepHeadingCollapsed ||= parsed.deepHeadingCollapsed;
    if (documents.join('\n\n').length > EPUB_MAX_TEXT_CHARS) {
      throw new UnsupportedUploadError('This EPUB contains more than 2 MB of editable text.');
    }
  }
  if (tableLayoutLost) {
    warnings.push('This EPUB contains tables. Cell text is retained, but the table layout needs author review.');
  }
  if (deepHeadingCollapsed) {
    warnings.push('Heading levels deeper than three are shown as third-level headings for review.');
  }
  const text = documents.join('\n\n').trim();
  if (!text) warnings.push('We could not find editable text in this EPUB.');
  return { text, warnings };
}

/**
 * Parse an uploaded manuscript file into text. Throws UnsupportedUploadError
 * for a file type we cannot read here.
 */
export async function parseUpload(
  buffer: Buffer,
  filename: string,
  mime?: string | null,
): Promise<ParseUploadResult> {
  const format = detectFormat(filename, mime);
  if (!format) {
    throw new UnsupportedUploadError(
      'Unsupported file type. Bring a .docx, .pdf, .epub, .txt, or .md file.',
    );
  }

  if (format === 'docx') {
    const result = await extractDocxMarkdown(buffer);
    const warnings = result.text.trim().length === 0
      ? [...result.warnings, 'We could not find any text in this document.']
      : result.warnings;
    return { ...result, warnings, format };
  }

  if (format === 'pdf') {
    const { text, warnings } = await extractPdfText(buffer);
    return { text, warnings, format };
  }

  if (format === 'epub') {
    const { text, warnings } = await extractEpubText(buffer);
    return { text, warnings, format };
  }

  // text / markdown
  return { text: buffer.toString('utf-8'), warnings: [], format };
}
