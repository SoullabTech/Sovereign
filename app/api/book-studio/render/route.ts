/**
 * POST /api/book-studio/render
 *
 * Generates the print PDF for Elemental Alchemy from the sealed source
 * and reports final page count + size + download URL.
 *
 * Source of truth (per book studio canon):
 *   docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md
 *
 * Pipeline:
 *   markdown → pandoc HTML → wrap with print-book.css → Paged.js + Puppeteer → PDF
 *
 * Output:
 *   public/exports/elemental-alchemy-print.pdf
 *
 * Returns:
 *   { ok: true, pdfUrl, pageCount, sizeKB, generatedAt }
 *
 * Rules (per build spec):
 *   - render only — no manuscript mutation, no content editing
 *   - fail loudly if source file missing
 *   - log clear errors server-side
 */

import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { renderHtmlToPdf } from '@/lib/manuscript/render/pagedPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes — render takes 60–120s for full book

const REPO_ROOT = process.cwd();
const MD_PATH = path.join(REPO_ROOT, 'docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md');
const CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/print-book.css');
const OUT_DIR = path.join(REPO_ROOT, 'public/exports');
const PDF_OUT = path.join(OUT_DIR, 'elemental-alchemy-print.pdf');
const PDF_URL = '/exports/elemental-alchemy-print.pdf';

interface RenderError {
  step: string;
  message: string;
  details?: string;
}

function fail(error: RenderError, status = 500) {
  console.error('[BookStudio/Render]', error.step, '—', error.message, error.details ?? '');
  return NextResponse.json({ ok: false, error: error.message, step: error.step, details: error.details }, { status });
}

export async function POST() {
  // ── 1. Validate source ────────────────────────────────────────────
  if (!fs.existsSync(MD_PATH)) {
    return fail({
      step: 'validate-source',
      message: 'Manuscript source not found',
      details: `Expected at ${MD_PATH}. Check that .dockerignore allows docs/book-studio/*.md.`,
    });
  }
  if (!fs.existsSync(CSS_PATH)) {
    return fail({
      step: 'validate-css',
      message: 'Print stylesheet not found',
      details: `Expected at ${CSS_PATH}.`,
    });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // ── 2. Pandoc: markdown → HTML ────────────────────────────────────
  let pandocStdout: string;
  try {
    pandocStdout = execFileSync(
      'pandoc',
      [
        MD_PATH,
        '-t', 'html5',
        '--standalone',
        // --no-highlight is supported on both Pandoc 2.x and 3.x.
        // (--syntax-highlighting=none was Pandoc 3.x only — production
        // runs Pandoc 2.17 from Debian Bookworm apt, which rejected it.)
        '--no-highlight',
        // No --toc: the manuscript has a curated Contents section under
        // `# Contents` that is the canonical TOC for this book. Pandoc's
        // auto-TOC duplicates and bloats it (depth=3 includes every front-
        // matter h2 and chapter sub-heading), and places the auto-TOC at
        // document head — *before* front matter — which breaks book
        // structure. The render pipeline trusts the editorial sequence
        // in the manuscript.
        '--lua-filter', path.join(REPO_ROOT, 'lib/manuscript/render/canonical-plates.lua'),
      ],
      { maxBuffer: 256 * 1024 * 1024, encoding: 'utf-8' },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('ENOENT')) {
      return fail({
        step: 'pandoc',
        message: 'pandoc not installed in container',
        details: 'Add `pandoc` to Dockerfile runner stage apt-get install list.',
      });
    }
    return fail({ step: 'pandoc', message: 'pandoc conversion failed', details: message });
  }

  const bodyMatch = pandocStdout.match(/<body[^>]*>([\s\S]*)<\/body>/);
  if (!bodyMatch) {
    return fail({ step: 'pandoc-extract', message: 'pandoc output missing <body>' });
  }
  let bodyHtml = bodyMatch[1];

  // ── 2b. Append Arendt threshold leaf (back matter, before Atlas) ──
  // A single contemplative aperture between the manuscript body and
  // the Atlas doorway. Sibling to .atlas-threshold — same render-
  // architecture layer, same page: plate discipline (footer suppressed),
  // distinct class so each threshold owns its own visual register.
  // Two voices, separated by breath:
  //   .threshold-leaf-quote      → Arendt (italic, attributed)
  //   .threshold-leaf-reflection → Kelly (upright, distinct register)
  // Not in the editorial manuscript — this is page architecture, not
  // book content. No TOC entry (never enters pandoc), no Conclusion
  // disruption, no Additional Resources displacement.
  bodyHtml += `
<section class="threshold-leaf threshold-leaf--arendt" role="region" aria-label="Reflection on flourishing">
  <blockquote class="threshold-leaf-quote">
    <p>&ldquo;The ultimate end of human acts is eudaimonia, happiness in the sense of living well&hellip;&rdquo;</p>
    <cite class="threshold-leaf-cite">&mdash; Hannah Arendt, paraphrasing Aristotle</cite>
  </blockquote>
  <p class="threshold-leaf-reflection">Beyond the pursuit of happiness is the desire for &mdash; and the attainment of &mdash; a flourishing that becomes possible when the daimon, our inner guide, and the elements enter a living rhythm together.</p>
</section>`;

  // ── 2c. Append Atlas threshold (back matter, final doorway) ────────
  // Single QR code at the very end of the back matter. Doctrine:
  // discovered-not-promoted, continuation-not-augmentation, no
  // marketing language, no "scan here", no platform energy. The
  // physical book remains sovereign; the QR is one quiet doorway.
  // Class is .atlas-threshold (NOT .canonical-plate) — structurally
  // distinct from the F00–F09 plate procession.
  // SVG is inlined raw at render time so it bypasses URL resolution
  // entirely (sibling of the data-URI plate strategy below).
  const QR_SVG_PATH = path.join(REPO_ROOT, 'public', 'book-studio', 'qr', 'qr-atlas.svg');
  const qrSvgInline = fs.existsSync(QR_SVG_PATH) ? fs.readFileSync(QR_SVG_PATH, 'utf-8') : '';
  if (qrSvgInline) {
    bodyHtml += `
<section class="atlas-threshold" role="region" aria-label="Continue to the Atlas">
  <h2 class="atlas-heading">Continue to the Atlas</h2>
  <div class="atlas-qr">${qrSvgInline}</div>
  <p class="atlas-url">soullab.life/atlas</p>
</section>`;
  } else {
    console.warn('[BookStudio/Render] QR SVG missing at', QR_SVG_PATH, '— Atlas threshold omitted');
  }

  // ── 3. Wrap with print template ───────────────────────────────────
  const css = fs.readFileSync(CSS_PATH, 'utf-8');
  // <base href="file:///app/public/"> retained as defensive belt; data
  // URIs below mean URL resolution is no longer load-bearing for
  // canonical plates. Kept so any future relative-path references in
  // the body still resolve as expected.
  const PUBLIC_BASE_HREF = 'file:///app/public/';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <base href="${PUBLIC_BASE_HREF}" />
  <title>Elemental Alchemy — Print</title>
  <style>${css}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  // ── 3b. Inline canonical plate binaries as data URIs ─────────────
  // The Lua filter emits <img src="/book-studio/figures/F0X-name.png">.
  // URL resolution at PDF render time is unreliable: setContent loads
  // the document with about:blank origin (blocking file:// fetches);
  // the <base> tag doesn't reparent *absolute* paths (only relative
  // ones); page.goto(file://) gets the origin right but absolute paths
  // resolve against filesystem root, not the base path.
  // Data URIs bypass URL resolution entirely. Each plate is read from
  // disk, base64-encoded, and substituted into the HTML before render.
  // Missing files leave the original src unchanged and are logged.
  const CANONICAL_PLATE_FILENAMES = [
    'F00-cosmogram',
    'F05-fire-calcinatio',
    'F06-water-solutio',
    'F07-earth-coagulatio',
    'F08-air-sublimatio',
    'F09-aether-conjunctio',
  ];
  const inlinedPlates: string[] = [];
  const missingPlates: string[] = [];
  let renderHtml = html;
  for (const filename of CANONICAL_PLATE_FILENAMES) {
    const srcPath = `/book-studio/figures/${filename}.png`;
    const diskPath = path.join(REPO_ROOT, 'public', 'book-studio', 'figures', `${filename}.png`);
    if (!fs.existsSync(diskPath)) {
      missingPlates.push(filename);
      continue;
    }
    const data = fs.readFileSync(diskPath);
    const dataUri = `data:image/png;base64,${data.toString('base64')}`;
    // Pandoc emits attributes with double quotes; defensively handle
    // single quotes too in case any source HTML uses them.
    const before = renderHtml;
    renderHtml = renderHtml.split(`src="${srcPath}"`).join(`src="${dataUri}"`);
    renderHtml = renderHtml.split(`src='${srcPath}'`).join(`src='${dataUri}'`);
    if (renderHtml !== before) inlinedPlates.push(filename);
  }
  console.log(
    '[BookStudio/Render] canonical plates inlined as data URIs:',
    inlinedPlates.length ? inlinedPlates.join(', ') : '(none matched src in HTML)',
  );
  if (missingPlates.length > 0) {
    console.warn(
      '[BookStudio/Render] missing plate binaries (left as original src refs, will render as broken-image):',
      missingPlates.join(', '),
    );
  }

  // ── 4. Paged.js + Puppeteer → PDF ─────────────────────────────────
  try {
    await renderHtmlToPdf(renderHtml, {
      outputPath: PDF_OUT,
      width: '6in',
      height: '9in',
      timeoutMs: 240_000, // 4 min for full book pagination
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Could not find') || message.includes('chromium') || message.includes('Browser was not found')) {
      return fail({
        step: 'puppeteer-launch',
        message: 'Chromium not available for Puppeteer',
        details: 'Add `chromium` to Dockerfile runner stage and set PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium.',
      });
    }
    return fail({ step: 'puppeteer-render', message: 'PDF render failed', details: message });
  }

  // ── 5. Read page count + size ─────────────────────────────────────
  let pageCount = 0;
  let sizeKB = 0;
  try {
    const buffer = fs.readFileSync(PDF_OUT);
    sizeKB = Math.round(buffer.length / 1024);
    // pdf-parse is CommonJS; require to avoid ESM interop edge cases
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const parsed = await pdfParse(buffer);
    pageCount = parsed.numpages ?? 0;
  } catch (err) {
    console.warn('[BookStudio/Render] pdf-parse failed (non-fatal):', err);
    // PDF was rendered; we just couldn't count pages — still return success.
  }

  return NextResponse.json({
    ok: true,
    pdfUrl: PDF_URL,
    pageCount,
    sizeKB,
    generatedAt: new Date().toISOString(),
  });
}
