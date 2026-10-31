/**
 * Read-only, content-free print page-flow inspection.
 *
 * Publisher preview quality is NOT certified by a successful PDF render alone.
 * The caller must choose which purposeful sparse pages (half-title, copyright,
 * dedication, blank verso) may be exempt. This only flags pages for a human
 * proof decision. It never mutates prose, inserts page breaks, or asserts
 * bookstore/KDP acceptance.
 *
 * The input text may be private; the output MUST carry page numbers and counts
 * only — not source lines, excerpts, hashes or other author data.
 */
export type PdfPageText = { num: number; text: string };

export type PrintPageQualityIssue = Readonly<{
  code: 'empty_page' | 'sparse_page';
  page: number;
  bodyLineCount: number;
  severity: 'review';
}>;

export type PrintPageQualityReport = Readonly<{
  status: 'review' | 'no_sparse_pages_detected';
  pagesExamined: number;
  pageCount: number;
  issues: readonly PrintPageQualityIssue[];
}>;

export function assessPrintPageFlow(
  pages: readonly PdfPageText[],
  options: { readonly exemptPages?: readonly number[]; readonly sparseAtOrBelow?: number } = {},
): PrintPageQualityReport {
  const exempt = new Set(options.exemptPages ?? []);
  const threshold = Number.isInteger(options.sparseAtOrBelow) && (options.sparseAtOrBelow ?? 0) >= 1
    ? Math.min(options.sparseAtOrBelow!, 10) : 3;
  const issues: PrintPageQualityIssue[] = [];
  const encountered = new Set<number>();
  let examined = 0;

  for (const page of pages) {
    if (!Number.isSafeInteger(page.num) || page.num < 1 || encountered.has(page.num)) {
      throw new Error('Invalid or duplicated page number; proof could not be qualified.');
    }
    encountered.add(page.num);
    if (exempt.has(page.num)) continue;
    // pdf-parse puts the page folio at the beginning. Other extractors may
    // position the folio at the end. Remove it only as a standalone edge line.
    const lines = page.text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines[0] === String(page.num)) lines.shift();
    if (lines.at(-1) === String(page.num)) lines.pop();
    examined++;
    if (lines.length <= threshold) {
      issues.push({
        code: lines.length === 0 ? 'empty_page' : 'sparse_page',
        page: page.num,
        bodyLineCount: lines.length,
        severity: 'review',
      });
    }
  }

  return {
    status: issues.length > 0 ? 'review' : 'no_sparse_pages_detected',
    pagesExamined: examined,
    pageCount: pages.length,
    issues,
  };
}
