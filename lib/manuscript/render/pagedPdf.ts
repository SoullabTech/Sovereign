/**
 * HTML → PDF via Paged.js + puppeteer (Soullab Press v1)
 *
 * The bridge step that turns design-system HTML into a print-ready
 * PDF. Uses Paged.js to paginate (widows/orphans, page rules,
 * running headers/footers) and puppeteer to drive a headless
 * browser that runs the polyfill.
 *
 * Constraints honored:
 *   - Uses the existing `puppeteer` dependency (already in package.json).
 *   - Loads Paged.js from local node_modules — no network at render
 *     time once `pagedjs` is installed.
 *   - No I/O beyond reading the bundled polyfill and writing the PDF.
 *
 * Phase 1: invoked from scripts/render-chapter-1.ts to produce one
 * Chapter 1 artifact. Reused by future chapter / book renders.
 */

import path from 'node:path';

import puppeteer from 'puppeteer';

export interface RenderPdfOptions {
  /** Absolute path where the PDF will be written. */
  outputPath: string;
  /**
   * Optional override for the Paged.js polyfill location. Defaults to
   * `node_modules/pagedjs/dist/paged.polyfill.js` resolved against the
   * current working directory.
   */
  pagedJsScriptPath?: string;
  /** Page width passed to puppeteer.pdf. Defaults to '6in'. */
  width?: string;
  /** Page height passed to puppeteer.pdf. Defaults to '9in'. */
  height?: string;
  /**
   * Maximum time (ms) to wait for Paged.js to finish pagination.
   * Defaults to 60_000.
   */
  timeoutMs?: number;
}

export async function renderHtmlToPdf(
  html: string,
  options: RenderPdfOptions,
): Promise<void> {
  const pagedJsPath =
    options.pagedJsScriptPath ??
    path.resolve(process.cwd(), 'node_modules/pagedjs/dist/paged.polyfill.js');
  const width = options.width ?? '6in';
  const height = options.height ?? '9in';
  const timeout = options.timeoutMs ?? 60_000;

  // --no-sandbox required when running Chromium in Docker (no setuid sandbox).
  // PUPPETEER_EXECUTABLE_PATH env var (set in Dockerfile) picks up system chromium.
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();

    // Stage the document with the inline CSS already embedded.
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Configure Paged.js BEFORE loading the polyfill so the `after`
    // hook is registered when pagination completes.
    //
    // Strings are used instead of arrow functions to avoid tsx /
    // esbuild injecting transpilation helpers (`__name`) into the
    // remote-evaluated source.
    await page.evaluate(
      "window.PagedConfig = { auto: true, after: function () { window._pagedDone = true; } };",
    );

    // Load the polyfill from local disk.
    await page.addScriptTag({ path: pagedJsPath });

    // Wait for Paged.js to finish.
    await page.waitForFunction('window._pagedDone === true', { timeout });

    await page.pdf({
      path: options.outputPath,
      width,
      height,
      printBackground: true,
      // Paged.js controls its own page margins via @page rules.
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}
