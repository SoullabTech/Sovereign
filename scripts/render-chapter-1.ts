#!/usr/bin/env tsx
/**
 * Phase 1 proof — render Chapter 1 of Elemental Alchemy as a PDF
 * via the canonical Manuscript → HTML → Paged.js → PDF chain.
 *
 * Source of truth (per Kelly's direction 2026-04-26):
 *   app/api/_backend/data/founder-knowledge/elemental-alchemy-book.json
 *   (this is the Library / interactive-book version — not Atticus,
 *   not Obsidian. Obsidian remains archive-only for this proof.)
 *
 * Output:
 *   exports/elemental-alchemy/chapter-01-v1.pdf
 *
 * Run:
 *   npx tsx scripts/render-chapter-1.ts
 */

import fs from 'node:fs';
import path from 'node:path';

import { elementalAlchemyJsonToManuscript } from '../lib/manuscript/adapters/elementalAlchemyJsonToManuscript';
import { renderChapterDocument } from '../lib/manuscript/render/html';
import { renderHtmlToPdf } from '../lib/manuscript/render/pagedPdf';
import type { ElementalAlchemyJsonShape } from '../lib/manuscript/types';

const REPO_ROOT = process.cwd();

const JSON_PATH = path.join(
  REPO_ROOT,
  'app/api/_backend/data/founder-knowledge/elemental-alchemy-book.json',
);
const CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/print.css');
const OUT_DIR = path.join(REPO_ROOT, 'exports/elemental-alchemy');
// Version label for the artifact. Pass via argv[2] (e.g. `npx tsx
// scripts/render-chapter-1.ts v2`) so previous versions stay frozen
// for side-by-side comparison.
const VERSION = process.argv[2] ?? 'v1';
const HTML_OUT = path.join(OUT_DIR, `chapter-01-${VERSION}.html`);
const PDF_OUT = path.join(OUT_DIR, `chapter-01-${VERSION}.pdf`);

async function main(): Promise<void> {
  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`Source JSON not found at ${JSON_PATH}`);
  }
  if (!fs.existsSync(CSS_PATH)) {
    throw new Error(`print.css not found at ${CSS_PATH}`);
  }
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  const json = JSON.parse(raw) as ElementalAlchemyJsonShape;
  const manuscript = elementalAlchemyJsonToManuscript(json);

  const ch1 = manuscript.chapters?.find((c) => c.number === 1);
  if (!ch1) {
    throw new Error('Chapter 1 not found in elemental-alchemy-book.json');
  }

  const css = fs.readFileSync(CSS_PATH, 'utf8');
  const html = renderChapterDocument(ch1, {
    css,
    bookTitle: manuscript.title,
    author: manuscript.author,
  });

  fs.writeFileSync(HTML_OUT, html);
  console.log(`HTML : ${HTML_OUT}`);

  await renderHtmlToPdf(html, { outputPath: PDF_OUT });
  console.log(`PDF  : ${PDF_OUT}`);
}

main().catch((err: unknown) => {
  console.error('[render-chapter-1] failed:', err);
  process.exit(1);
});
