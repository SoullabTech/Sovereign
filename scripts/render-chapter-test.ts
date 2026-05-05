#!/usr/bin/env tsx
/**
 * Test render for a single chapter — validates the production image
 * system on one chapter at a time.
 *
 * Usage:
 *   npx tsx scripts/render-chapter-test.ts <chapter_number>
 *   npx tsx scripts/render-chapter-test.ts 5
 *
 * Output:
 *   exports/elemental-alchemy/ch{N}-test.{md,html,pdf}
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { renderHtmlToPdf } from '../lib/manuscript/render/pagedPdf';

const REPO_ROOT = process.cwd();
const MD_PATH = path.join(REPO_ROOT, 'docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md');
const CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/print-book.css');
const OUT_DIR = path.join(REPO_ROOT, 'exports/elemental-alchemy');

const chapterNum = parseInt(process.argv[2] ?? '', 10);
if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 10) {
  console.error('Usage: render-chapter-test.ts <chapter_number 1-10>');
  process.exit(1);
}

const TEMP_MD = path.join(OUT_DIR, `ch${chapterNum}-test.md`);
const HTML_OUT = path.join(OUT_DIR, `ch${chapterNum}-test.html`);
const PDF_OUT = path.join(OUT_DIR, `ch${chapterNum}-test.pdf`);

async function main(): Promise<void> {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[1/5] Extracting Ch ${chapterNum} + referenced image definitions...`);
  const fullContent = fs.readFileSync(MD_PATH, 'utf-8');

  // Find chapter boundaries — handle both single and double space after `#`
  const chapterRe = /^#\s+Chapter (\d+):/gm;
  const chapterStarts: { num: number; idx: number }[] = [];
  let match;
  while ((match = chapterRe.exec(fullContent)) !== null) {
    chapterStarts.push({ num: parseInt(match[1], 10), idx: match.index });
  }

  const startEntry = chapterStarts.find((c) => c.num === chapterNum);
  if (!startEntry) {
    throw new Error(`Could not find Chapter ${chapterNum}`);
  }
  const startIdx = startEntry.idx;
  const nextEntry = chapterStarts.find((c) => c.idx > startIdx);
  const endIdx = nextEntry ? nextEntry.idx : fullContent.length;

  const chapterContent = fullContent.substring(startIdx, endIdx);

  // Find which images this chapter references
  const usedImages = new Set<string>();
  const imgUseRegex = /!\[\]\[(image\d+)\]/g;
  let m;
  while ((m = imgUseRegex.exec(chapterContent)) !== null) {
    usedImages.add(m[1]);
  }

  // Pull matching reference definitions from anywhere in the full doc
  const refRegex = /^(\[image\d+\]:[^\n]*)$/gm;
  const allRefs = fullContent.match(refRegex) ?? [];
  const usedRefs = allRefs.filter((ref) => {
    const idMatch = ref.match(/^\[(image\d+)\]:/);
    return idMatch && usedImages.has(idMatch[1]);
  });

  console.log(`    Ch ${chapterNum} references ${usedImages.size} images; matched ${usedRefs.length} definitions`);

  const tempMd = `${chapterContent}\n\n${usedRefs.join('\n\n')}\n`;
  fs.writeFileSync(TEMP_MD, tempMd, 'utf-8');
  console.log(`    Temp markdown: ${TEMP_MD} (${(tempMd.length / 1024).toFixed(1)} KB)`);

  console.log('[2/5] Converting to HTML via pandoc...');
  const bodyHtml = execSync(`pandoc "${TEMP_MD}" -t html5 --syntax-highlighting=none`, {
    maxBuffer: 256 * 1024 * 1024,
    encoding: 'utf-8',
  });
  console.log(`    body length: ${(bodyHtml.length / 1024 / 1024).toFixed(2)} MB`);

  console.log('[3/5] Wrapping with print CSS...');
  const css = fs.readFileSync(CSS_PATH, 'utf-8');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Elemental Alchemy — Ch ${chapterNum} Test</title>
<style>
${css}
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
  fs.writeFileSync(HTML_OUT, html, 'utf-8');
  console.log(`    HTML written: ${HTML_OUT}`);

  console.log('[4/5] Rendering PDF via Paged.js + puppeteer...');
  const startTime = Date.now();
  await renderHtmlToPdf(html, {
    outputPath: PDF_OUT,
    width: '6in',
    height: '9in',
    timeoutMs: 5 * 60 * 1000,
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`    PDF rendered in ${elapsed}s`);

  const stat = fs.statSync(PDF_OUT);
  console.log(`[5/5] Done. PDF: ${PDF_OUT} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});
