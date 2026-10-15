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

import mammoth from 'mammoth';
import { preserveDocxStructure, type DocxFidelity } from './docxFidelity';
export { UnsupportedDocxStructureError } from './docxFidelity';

export type UploadFormat = 'docx' | 'pdf' | 'text';

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
  if (ext === 'txt' || ext === 'md' || ext === 'markdown') return 'text';

  const m = (mime ?? '').toLowerCase();
  if (m.includes('officedocument.wordprocessingml')) return 'docx';
  if (m === 'application/pdf') return 'pdf';
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
      'Unsupported file type. Bring a .docx, .pdf, .txt, or .md file.',
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

  // text / markdown
  return { text: buffer.toString('utf-8'), warnings: [], format };
}
