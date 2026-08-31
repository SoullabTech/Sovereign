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
 *   - ONE spacing artifact is removed, and only from DOCX: the `<w:tab/>` Word
 *     writes for a first-line indent, dropped on the document tree where the
 *     format still proves it is presentation rather than a typed character (see
 *     docxIndentTabs.ts). Left in, it is also a markdown code block, so the
 *     author's opening paragraph arrives in a monospace slab.
 *   - Nothing else is normalized, in any format. Blank lines, non-breaking
 *     spaces, trailing spaces and tabs between words are the author's text
 *     until the format gives evidence otherwise, and PDF and plain text give
 *     none at all — in a .txt or .md manuscript the whitespace IS the source.
 *   - No persistence, no network, no model. Deterministic parsing only.
 */

import mammoth from 'mammoth';
import { dropWordIndentTabs } from './docxIndentTabs';

export type UploadFormat = 'docx' | 'pdf' | 'text';

export interface ParseUploadResult {
  /** The extracted text, verbatim (Markdown for .docx, plain for the rest). */
  text: string;
  /** Non-fatal notices for the member (e.g. a scanned PDF with no text). */
  warnings: string[];
  format: UploadFormat;
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

async function extractDocxMarkdown(buffer: Buffer): Promise<string> {
  // convertToMarkdown maps Word heading styles to `#`/`##`, preserving the
  // structure the author gave the document. extractRawText would flatten it.
  const result = await mammoth.convertToMarkdown(
    { buffer },
    /* On the document tree, before it is flattened — the only place Word's
       indent mechanic is still distinguishable from a typed tab. */
    { transformDocument: dropWordIndentTabs },
  );
  return normalizeMammothMarkdown(result.value ?? '');
}

async function extractPdfText(
  buffer: Buffer,
): Promise<{ text: string; warnings: string[] }> {
  // pdf-parse v2 is dynamically imported (its ESM/CJS shim trips the RSC
  // bundler on static import — see lib/workbench/extract/pdf.ts).
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const text = result.text ?? '';
    const pageCount = result.pages?.length ?? 0;
    const avgPerPage = pageCount > 0 ? text.trim().length / pageCount : 0;
    const warnings: string[] = [];
    // Heuristic: near-empty text over the page count means an image/scanned PDF.
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
    const text = await extractDocxMarkdown(buffer);
    const warnings = text.trim().length === 0
      ? ['We could not find any text in this document.']
      : [];
    return { text, warnings, format };
  }

  if (format === 'pdf') {
    /* Verbatim. A PDF text layer carries no reliable distinction between
       spacing the author chose and spacing the typesetter produced, so there is
       nothing here we could clean on evidence. */
    const { text, warnings } = await extractPdfText(buffer);
    return { text, warnings, format };
  }

  // text / markdown — verbatim. These bytes ARE the manuscript; a blank-line
  // run may be a scene break and a leading tab may be the author's indent.
  return { text: buffer.toString('utf-8'), warnings: [], format };
}
