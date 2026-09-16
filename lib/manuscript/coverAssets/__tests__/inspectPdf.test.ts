import { inspectCoverPdf, judgeCoverPdfGeometry } from '../inspectPdf';

describe('HPB-05 cover PDF inspection law', () => {
  it('accepts one-page physical geometry in PDF points', () => {
    expect(judgeCoverPdfGeometry({ pageCount: 1, widthPt: 432, heightPt: 648 })).toEqual({
      status: 'ok', pageCount: 1, widthPt: 432, heightPt: 648,
    });
  });

  it('refuses a multi-page upload instead of choosing a page', () => {
    expect(judgeCoverPdfGeometry({ pageCount: 2, widthPt: 432, heightPt: 648 })).toEqual({
      status: 'refused', refusal: 'cover_pdf_must_be_single_page', pageCount: 2,
    });
  });

  it('refuses non-positive physical geometry', () => {
    expect(judgeCoverPdfGeometry({ pageCount: 1, widthPt: 0, heightPt: 648 })).toEqual({
      status: 'refused', refusal: 'cover_pdf_has_invalid_geometry', pageCount: 1,
    });
  });

  it('refuses bytes that are not a PDF before loading PDF.js', async () => {
    await expect(inspectCoverPdf(new TextEncoder().encode('not a cover'))).resolves.toEqual({
      status: 'refused', refusal: 'not_pdf',
    });
  });
});
