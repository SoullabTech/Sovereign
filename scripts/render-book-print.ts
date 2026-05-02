#!/usr/bin/env tsx
/**
 * Render the full polished Elemental Alchemy manuscript as a
 * print-ready PDF.
 *
 * Source of truth: docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md
 * (the canonical edited file — NOT the JSON used by render-chapter-1).
 *
 * Pipeline: markdown → pandoc HTML → wrap with print CSS → puppeteer
 * + Paged.js → 6×9 PDF.
 *
 * Output:
 *   exports/elemental-alchemy/book-print-v1.html
 *   exports/elemental-alchemy/book-print-v1.pdf
 *
 * Run from repo root:
 *   npx tsx scripts/render-book-print.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { renderHtmlToPdf } from '../lib/manuscript/render/pagedPdf';

const REPO_ROOT = process.cwd();
const MD_PATH = path.join(REPO_ROOT, 'docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md');
const CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/print-book.css');
const OUT_DIR = path.join(REPO_ROOT, 'exports/elemental-alchemy');
const VERSION = process.argv[2] ?? 'v1';
const HTML_OUT = path.join(OUT_DIR, `book-print-${VERSION}.html`);
const PDF_OUT = path.join(OUT_DIR, `book-print-${VERSION}.pdf`);

async function main(): Promise<void> {
  if (!fs.existsSync(MD_PATH)) {
    throw new Error(`Manuscript not found: ${MD_PATH}`);
  }
  if (!fs.existsSync(CSS_PATH)) {
    throw new Error(`Print CSS not found: ${CSS_PATH}`);
  }
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('[1/4] Converting markdown → HTML via pandoc...');
  const bodyHtml = execSync(
    `pandoc "${MD_PATH}" -t html5 --no-highlight`,
    {
      maxBuffer: 256 * 1024 * 1024, // 256MB — manuscript has base64 images
      encoding: 'utf-8',
    },
  );

  console.log(`    body length: ${(bodyHtml.length / 1024 / 1024).toFixed(2)} MB`);

  console.log('[2/4] Wrapping with print CSS...');
  const css = fs.readFileSync(CSS_PATH, 'utf-8');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Elemental Alchemy: The Art of Living a Phenomenal Life</title>
<style>
${css}
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  fs.writeFileSync(HTML_OUT, html, 'utf-8');
  console.log(`    HTML written: ${HTML_OUT} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);

  console.log('[3/4] Rendering PDF via Paged.js + puppeteer (this can take a few minutes)...');
  const startTime = Date.now();
  await renderHtmlToPdf(html, {
    outputPath: PDF_OUT,
    width: '6in',
    height: '9in',
    timeoutMs: 5 * 60 * 1000, // 5 min
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`    PDF rendered in ${elapsed}s`);

  console.log('[4/4] Done.');
  console.log(`    PDF: ${PDF_OUT}`);
  const stat = fs.statSync(PDF_OUT);
  console.log(`    size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});
