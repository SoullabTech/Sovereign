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
        '--toc',
        '--toc-depth=3',
        '-V', 'toc-title=',
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
  const bodyHtml = bodyMatch[1];

  // ── 3. Wrap with print template ───────────────────────────────────
  const css = fs.readFileSync(CSS_PATH, 'utf-8');
  // <base href="file:///app/public/"> resolves absolute image src paths
  // (e.g. /book-studio/figures/F05-fire-calcinatio.png) against the
  // container's public directory when Puppeteer loads via setContent
  // (which uses about:blank as document URL by default). Without this,
  // canonical-plate <img> tags fall back to the broken-image icon.
  // Container-only path; production runs in Docker with /app as repo root.
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

  // ── 4. Paged.js + Puppeteer → PDF ─────────────────────────────────
  try {
    await renderHtmlToPdf(html, {
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
