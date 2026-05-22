/**
 * .pdf extractor via pdf-parse v2.
 *
 * v2 API: `new PDFParse({ data: buffer }).getText()` → `{ pages, text }`.
 *
 * Loaded via dynamic import. pdf-parse v2 ships with "type": "module" but a
 * .cjs main entry, and Next.js's RSC webpack bundler trips over the ESM/CJS
 * interop shim on static import (Object.defineProperty called on non-object).
 * Dynamic import defers resolution to runtime and avoids the bundler path.
 *
 * Returns extracted text for text-extractable PDFs. Returns empty string for
 * image-based (scanned) PDFs — caller must check and route those to OCR
 * (Slice 2, not yet wired).
 */

import { promises as fs } from 'fs';

export interface PdfExtractResult {
  text: string;
  /**
   * Heuristic: pages with effectively no extracted text suggest a scanned PDF
   * that needs OCR. If true, caller should classify as scanned_pdf rather
   * than typed_doc.
   */
  likelyScanned: boolean;
  pageCount: number;
}

export async function extractPdf(filePath: string): Promise<PdfExtractResult> {
  const { PDFParse } = await import('pdf-parse');
  const buf = await fs.readFile(filePath);
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const result = await parser.getText();
    const text = result.text ?? '';
    const pageCount = result.pages?.length ?? 0;
    const avgPerPage = pageCount > 0 ? text.trim().length / pageCount : 0;
    const likelyScanned = avgPerPage < 20;
    return { text, likelyScanned, pageCount };
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
