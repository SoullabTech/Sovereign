/**
 * POST /api/book-studio/render/epub
 *
 * Generates a working-draft EPUB from the sealed Elemental Alchemy
 * source. Reflowable, regeneratable on each manuscript update.
 *
 * Source:
 *   docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md
 *
 * Pipeline:
 *   markdown → pandoc EPUB3
 *
 * Output:
 *   public/exports/elemental-alchemy.epub
 *
 * Returns:
 *   { ok: true, epubUrl, sizeKB, generatedAt }
 *
 * This is a *working draft* EPUB — useful for early readers, the
 * cover designer, and reviewers. Not production-ready:
 *   - no cover image yet
 *   - no embedded illustrations (Illustration List still longlist-stage)
 *   - no ISBN
 *   - imprint resolution (Soullab Media vs Soullab Press) still pending
 */

import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const REPO_ROOT = process.cwd();
const MD_PATH = path.join(REPO_ROOT, 'docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md');
const CSS_PATH = path.join(REPO_ROOT, 'lib/manuscript/render/epub-book.css');
const OUT_DIR = path.join(REPO_ROOT, 'public/exports');
const EPUB_OUT = path.join(OUT_DIR, 'elemental-alchemy.epub');
const EPUB_URL = '/exports/elemental-alchemy.epub';

function fail(step: string, message: string, details?: string, status = 500) {
  console.error('[BookStudio/RenderEpub]', step, '—', message, details ?? '');
  return NextResponse.json({ ok: false, step, error: message, details }, { status });
}

export async function POST() {
  if (!fs.existsSync(MD_PATH)) {
    return fail(
      'validate-source',
      'Manuscript source not found',
      `Expected at ${MD_PATH}. Check .dockerignore allowance for docs/book-studio/*.md.`,
    );
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // EPUB stylesheet is optional — pandoc has a sane default if missing.
  const args: string[] = [
    MD_PATH,
    '-f', 'markdown',
    '-t', 'epub3',
    '--metadata', 'title=Elemental Alchemy',
    '--metadata', 'subtitle=The Art of Living a Phenomenal Life',
    '--metadata', 'author=Kelly Nezat',
    '--metadata', 'publisher=Soullab Press',
    '--metadata', 'lang=en-US',
    '--toc',
    '--toc-depth=2',
    // ─────────────────────────────────────────────────────────────────
    // DO NOT change to --split-level=N.
    // Production currently runs Pandoc 2.17 (Debian Bookworm apt), where
    // --split-level is *unsupported* and pandoc exits with
    //   "Unknown option --split-level."
    // --split-level was introduced in Pandoc 3.x. --epub-chapter-level
    // is the back-compatible form and continues to work in 3.x (with a
    // deprecation warning). Keep this until the Dockerfile pins Pandoc 3+.
    // ─────────────────────────────────────────────────────────────────
    '--epub-chapter-level=1',
    '--lua-filter', path.join(REPO_ROOT, 'lib/manuscript/render/canonical-plates.lua'),
    '-o', EPUB_OUT,
  ];

  if (fs.existsSync(CSS_PATH)) {
    args.splice(args.length - 2, 0, '--css', CSS_PATH);
  }

  try {
    execFileSync('pandoc', args, { maxBuffer: 256 * 1024 * 1024, encoding: 'utf-8' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('ENOENT')) {
      return fail(
        'pandoc',
        'pandoc not installed in container',
        'Add `pandoc` to Dockerfile runner stage apt-get install list.',
      );
    }
    return fail('pandoc', 'EPUB generation failed', message);
  }

  if (!fs.existsSync(EPUB_OUT)) {
    return fail('output', 'pandoc completed but no EPUB written');
  }

  const stat = fs.statSync(EPUB_OUT);

  return NextResponse.json({
    ok: true,
    epubUrl: EPUB_URL,
    sizeKB: Math.round(stat.size / 1024),
    generatedAt: new Date().toISOString(),
  });
}
