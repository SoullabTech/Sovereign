export type CoverPdfRefusal =
  | 'not_pdf'
  | 'cover_pdf_must_be_single_page'
  | 'cover_pdf_has_invalid_geometry';

export type CoverPdfInspection =
  | {
      status: 'ok';
      pageCount: 1;
      widthPt: number;
      heightPt: number;
    }
  | {
      status: 'refused';
      refusal: CoverPdfRefusal;
      pageCount?: number;
    };

export interface ParsedPdfGeometry {
  pageCount: number;
  widthPt: number;
  heightPt: number;
}

const finitePositive = (value: number): boolean => Number.isFinite(value) && value > 0;

export function judgeCoverPdfGeometry(parsed: ParsedPdfGeometry): CoverPdfInspection {
  if (parsed.pageCount !== 1) {
    return { status: 'refused', refusal: 'cover_pdf_must_be_single_page', pageCount: parsed.pageCount };
  }
  if (!finitePositive(parsed.widthPt) || !finitePositive(parsed.heightPt)) {
    return { status: 'refused', refusal: 'cover_pdf_has_invalid_geometry', pageCount: 1 };
  }
  return { status: 'ok', pageCount: 1, widthPt: parsed.widthPt, heightPt: parsed.heightPt };
}

/**
 * Server-side physical inspection. Browser/file metadata is never authoritative.
 * PDF.js is loaded dynamically because its production bundle is native ESM.
 */
export async function inspectCoverPdf(bytes: Uint8Array): Promise<CoverPdfInspection> {
  if (bytes.length < 5 || new TextDecoder('ascii').decode(bytes.slice(0, 5)) !== '%PDF-') {
    return { status: 'refused', refusal: 'not_pdf' };
  }

  try {
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = getDocument({ data: bytes.slice() });
    const document = await loadingTask.promise;
    try {
      if (document.numPages < 1) {
        return { status: 'refused', refusal: 'cover_pdf_has_invalid_geometry', pageCount: document.numPages };
      }
      const page = await document.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      return judgeCoverPdfGeometry({
        pageCount: document.numPages,
        widthPt: viewport.width,
        heightPt: viewport.height,
      });
    } finally {
      await document.destroy().catch(() => undefined);
      await loadingTask.destroy().catch(() => undefined);
    }
  } catch {
    return { status: 'refused', refusal: 'not_pdf' };
  }
}
