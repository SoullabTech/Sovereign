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

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

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
  //
  // --allow-file-access-from-files is retained as a defensive belt for
  // Chromium versions where it's still consulted; it has no effect on
  // newer Chromium for setContent-loaded documents but is harmless. The
  // load mechanism below (page.goto on a file:// URL) is what actually
  // enables canonical plate <img> resolution.
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--allow-file-access-from-files',
    ],
  });
  // Stage the rendered HTML to a temp file so the document loads from
  // a file:// origin. Modern Chromium silently blocks file:// resource
  // fetches from about:blank documents (which is what setContent
  // produces), regardless of <base> tag or --allow-file-access-from-files
  // flag. Loading via page.goto('file://...') puts the document in a
  // file:// origin, which can natively dereference sibling file://
  // resources (canonical plate PNGs at /app/public/book-studio/figures/).
  // The temp file is removed in the finally block whether render
  // succeeds or fails.
  const tmpHtmlPath = path.join(
    os.tmpdir(),
    `book-studio-render-${randomUUID()}.html`,
  );
  await fs.writeFile(tmpHtmlPath, html, 'utf-8');
  try {
    const page = await browser.newPage();

    // Load from file:// so the document inherits a file:// origin.
    // The <base href="file:///app/public/"> in the wrapper HTML still
    // resolves absolute /book-studio/figures/... paths into that
    // directory; from a file:// origin Chromium will fetch them.
    await page.goto(pathToFileURL(tmpHtmlPath).toString(), {
      waitUntil: 'networkidle0',
    });

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
    // Best-effort cleanup; surfacing the unlink failure would mask any
    // earlier render error, so we swallow it.
    try {
      await fs.unlink(tmpHtmlPath);
    } catch {
      /* temp file already gone or unreachable */
    }
  }
}
