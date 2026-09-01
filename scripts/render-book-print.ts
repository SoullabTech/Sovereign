#!/usr/bin/env tsx
/**
 * Render the full polished Elemental Alchemy manuscript as a
 * print-ready PDF.
 *
 * Source of truth: docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md
 * (canonical editorial source — same file rendered by /book-studio/read
 *  via StudioMarkdown. Repointed from ELEMENTAL_ALCHEMY_MANUSCRIPT.md
 *  after MANUSCRIPT.md fell behind editorial state and the dual-canon
 *  drift was caught while preparing a KDP correction pass. Web Read Flow
 *  and print pipeline now share one source.)
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
import { pathToFileURL } from 'node:url';

import { renderHtmlToPdf } from '../lib/manuscript/render/pagedPdf';

const REPO_ROOT = process.cwd();
// Default source is the canonical Second Edition manuscript. The interim
// current-edition production file is rendered by pointing BOOK_MD at
// ELEMENTAL_ALCHEMY_CURRENT_EDITION.md, so both editions render through the
// identical pipeline, CSS, and trim - the only variable is the manuscript.
const MD_PATH = path.join(REPO_ROOT,
  process.env.BOOK_MD ?? 'docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md');
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

  console.log('[1/4] Converting markdown → HTML via pandoc (with TOC)...');
  // Use --standalone so pandoc emits the <nav id="TOC"> block; --toc requires it.
  // Then we extract just the body content and post-process the TOC position.
  const LUA_FILTER = path.join(REPO_ROOT, 'lib/manuscript/render/canonical-plates.lua');
  const fullHtml = execSync(
    // --no-highlight is supported on both Pandoc 2.x and 3.x.
    // (--syntax-highlighting=none was Pandoc 3.x only — production
    // runs Pandoc 2.17 from Debian Bookworm apt, which rejected it.)
    // No --toc: FROM_ORIGINAL_FULL.md carries a hand-curated prose TOC
    // under `# Contents` (markdown lines 44-113) that gives the printed
    // book a compact, editorial TOC matching the May 9 KDP upload.
    // Adding pandoc's --toc on top produces a duplicate auto-TOC parked
    // at body-top because the post-processing relocation only knew how
    // to handle MANUSCRIPT.md's H2-Preface anchor — see git history of
    // c32768c05 / b569f1928 for why the two manuscripts diverge here.
    `pandoc "${MD_PATH}" -t html5 --standalone --no-highlight --lua-filter "${LUA_FILTER}"`,
    {
      maxBuffer: 256 * 1024 * 1024,
      encoding: 'utf-8',
    },
  );

  // Extract body content from the standalone document
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/);
  if (!bodyMatch) {
    throw new Error('Could not extract <body> from pandoc standalone output');
  }
  let bodyHtml = bodyMatch[1];
  console.log(`    body length: ${(bodyHtml.length / 1024 / 1024).toFixed(2)} MB`);

  // Post-process: move pandoc's auto-generated <nav id="TOC"> from top of body
  // to right after the manual `# Table of Contents` heading position so TOC
  // lands in the natural front-matter slot rather than before the title page.
  const navRe = /<nav id="TOC"[\s\S]*?<\/nav>/;
  const navMatch = bodyHtml.match(navRe);
  if (navMatch) {
    const navHtml = navMatch[0];
    bodyHtml = bodyHtml.replace(navHtml, '');
    // Anchor: insert TOC right before the Preface heading (former manual TOC
    // heading was removed; Preface is the first content after front matter).
    const prefaceRe = /<h2 id="preface"[^>]*>[\s\S]*?<\/h2>/;
    const prefaceMatch = bodyHtml.match(prefaceRe);
    if (prefaceMatch) {
      const tocHeading = '<h1 id="table-of-contents">Table of Contents</h1>';
      bodyHtml = bodyHtml.replace(
        prefaceMatch[0],
        `${tocHeading}\n${navHtml}\n${prefaceMatch[0]}`,
      );
      console.log('    TOC + heading injected before Preface');
    } else {
      console.warn('    [warn] could not find Preface heading; TOC remains at top');
      bodyHtml = `${navHtml}\n${bodyHtml}`;
    }
  } else {
    console.warn('    [warn] no <nav id="TOC"> found in pandoc output');
  }

  // Mark truly-italic-only paragraphs with class="epigraph". Only paragraphs
  // whose entire content is a single <em> qualify — paragraphs with plain
  // prose plus one inline italic citation are left untouched.
  const epigraphRe = /<p>\s*<em>([\s\S]+?)<\/em>\s*<\/p>/g;
  let epigraphCount = 0;
  bodyHtml = bodyHtml.replace(epigraphRe, (_match, inner) => {
    epigraphCount++;
    return `<p class="epigraph"><em>${inner}</em></p>`;
  });
  console.log(`    epigraph paragraphs marked: ${epigraphCount}`);

  console.log('[2/4] Wrapping with print CSS...');
  // Inline the static font faces. The @import in print-book.css cannot be
  // followed from a file:// document with no network, and MUST NOT be replaced
  // by the Google Fonts css2 URL — that serves a variable font and Chromium
  // rasterizes the whole interior rather than embedding it. See
  // lib/manuscript/render/fonts/eb-garamond-static.css for the full finding.
  const FONT_CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/fonts/eb-garamond-static.css');
  let css = fs.readFileSync(CSS_PATH, 'utf-8');
  const fontCss = fs.readFileSync(FONT_CSS_PATH, 'utf-8');
  const beforeLen = css.length;
  css = css.replace(/@import url\('fonts\/eb-garamond-static\.css'\);/, fontCss);
  if (css.length === beforeLen) {
    throw new Error('font @import not found in print-book.css — fonts would not embed');
  }
  console.log('    fonts inlined: EB Garamond static (' + (fontCss.length / 1024 / 1024).toFixed(2) + ' MB)');

  // <base href="file://.../public/"> resolves absolute image src paths
  // (e.g. /book-studio/figures/F05-fire-calcinatio.png) against the
  // public directory when Puppeteer loads via setContent (which uses
  // about:blank as document URL). Without this, canonical-plate <img>
  // tags render as broken-image placeholders.
  const publicBaseHref = pathToFileURL(path.join(REPO_ROOT, 'public') + path.sep).toString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<base href="${publicBaseHref}" />
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
