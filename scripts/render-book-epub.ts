#!/usr/bin/env tsx
/**
 * Render the full Elemental Alchemy manuscript as a reflowable EPUB3
 * for Kindle Direct Publishing eBook upload.
 *
 * Source of truth: docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md
 * (same source as the print pipeline — see render-book-print.ts).
 *
 * Pipeline: markdown → pandoc EPUB3 (with cover + metadata + CSS + plates).
 * Single pass. No puppeteer / chromium needed for eBook — Kindle reflows
 * content at read time.
 *
 * Output:
 *   exports/elemental-alchemy/book-epub-<version>.epub
 *
 * Run from repo root:
 *   npx tsx scripts/render-book-epub.ts            # version 'v1'
 *   npx tsx scripts/render-book-epub.ts kdp-2026   # version 'kdp-2026'
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = process.cwd();
// Default source is the canonical Second Edition manuscript. The interim
// current-edition ebook is rendered by pointing BOOK_MD at
// ELEMENTAL_ALCHEMY_CURRENT_EDITION.md, matching the print lane so the
// two formats never diverge on edition identity.
const MD_PATH = path.join(REPO_ROOT,
  process.env.BOOK_MD ?? 'docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md');
const CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/epub-book.css');
const LUA_FILTER = path.join(REPO_ROOT, 'lib/manuscript/render/canonical-plates.lua');
const COVER_PATH = path.join(REPO_ROOT, 'public/book-studio/elemental-alchemy-cover.jpg');
const OUT_DIR = path.join(REPO_ROOT, 'exports/elemental-alchemy');
const VERSION = process.argv[2] ?? 'v1';
const EPUB_OUT = path.join(OUT_DIR, `book-epub-${VERSION}.epub`);

async function main(): Promise<void> {
  // Pre-flight: all required files must exist.
  for (const p of [MD_PATH, CSS_PATH, LUA_FILTER, COVER_PATH]) {
    if (!fs.existsSync(p)) {
      throw new Error(`Missing required file: ${p}`);
    }
  }
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('[1/1] Converting markdown → EPUB3 via pandoc...');

  // --resource-path includes `public/` so plate <img src="book-studio/figures/...">
  // references emitted by canonical-plates.lua resolve to public/book-studio/...
  // (same relative-path convention the print pipeline now uses; see commit
  // 6e98a56d1).
  //
  // --toc --toc-depth=1 builds an eBook navigation TOC at the chapter level
  // (parts + chapters + conclusion). Kindle uses this for the reader's
  // built-in TOC navigation, separate from the in-text Contents section.
  //
  // Cover image is embedded as the EPUB cover; the source JPG at
  // public/book-studio/elemental-alchemy-cover.jpg is already at 1600×2597
  // which meets KDP eBook spec (1.6:1 ratio, ≥1000px longest side).
  // Metadata goes through a UTF-8 file, NOT inline --metadata flags.
  // Passing `Copyright © 2026` as a shell argument through execSync sent the
  // © through a non-UTF-8 shell and landed two U+FFFD replacement characters
  // in dc:rights ("Copyright \uFFFD\uFFFD 2026"), shipped inside the EPUB's
  // OPF. Pandoc reads a --metadata-file as UTF-8 directly, so the character
  // never crosses the shell boundary.
  const META_PATH = path.join(OUT_DIR, `.epub-meta-${VERSION}.yaml`);
  fs.writeFileSync(META_PATH, [
    'title: Elemental Alchemy',
    'subtitle: The Art of Living a Phenomenal Life',
    'author: Kelly W. Nezat',
    'publisher: Soullab Media',
    'date: "2026"',
    'rights: Copyright © 2026 by Kelly Nezat',
    'lang: en-US',
    '',
  ].join('\n'), 'utf-8');

  const cmd = [
    'pandoc',
    `"${MD_PATH}"`,
    '-t', 'epub3',
    '-o', `"${EPUB_OUT}"`,
    '--standalone',
    '--toc',
    '--toc-depth=1',
    '-V', 'toc-title=Contents',
    '--metadata-file', `"${META_PATH}"`,
    '--epub-cover-image', `"${COVER_PATH}"`,
    '--css', `"${CSS_PATH}"`,
    '--lua-filter', `"${LUA_FILTER}"`,
    '--resource-path', `".:${path.join(REPO_ROOT, 'public')}"`,
    '--no-highlight',
  ].join(' ');

  execSync(cmd, {
    stdio: 'inherit',
    maxBuffer: 256 * 1024 * 1024,
    encoding: 'utf-8',
  });

  const stat = fs.statSync(EPUB_OUT);
  console.log('Done.');
  console.log(`    EPUB: ${EPUB_OUT}`);
  console.log(`    size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('EPUB render failed:', err);
  process.exit(1);
});
