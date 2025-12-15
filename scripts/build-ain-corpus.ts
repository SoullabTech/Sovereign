/**
 * AIN CORPUS BUILDER
 *
 * Compiles the AIN conversations library into a single readable corpus
 * with table of contents for the Book Companion.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

type TocItem = {
  id: string;
  title: string;
  filename: string;
  bytes: number;
};

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'data/ain/source');
const OUT_DIR = path.join(ROOT, 'data/ain/build');

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await listFiles(full)));
    } else if (e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.txt'))) {
      files.push(full);
    }
  }

  return files;
}

async function main() {
  console.log('🏗️  Building AIN corpus...');

  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = await listFiles(SRC_DIR);
  console.log(`📂 Found ${files.length} source files`);

  // Heuristic ordering: filename sort (stable + predictable)
  files.sort((a, b) => a.localeCompare(b));

  const toc: TocItem[] = [];
  const chunks: string[] = [];

  for (const file of files) {
    const rel = path.relative(SRC_DIR, file);
    const raw = await fs.readFile(file, 'utf8');

    // Skip tiny fragments (optional, prevents TOC spam)
    if (raw.trim().length < 400) {
      console.log(`⏭️  Skipping (too small): ${rel}`);
      continue;
    }

    const baseTitle = rel.replace(/\.(md|txt)$/i, '');
    const title = baseTitle.split(path.sep).join(' / ');
    const id = slugify(title);

    toc.push({
      id,
      title,
      filename: rel,
      bytes: Buffer.byteLength(raw, 'utf8'),
    });

    chunks.push(
      [
        `\n\n---\n\n`,
        `# ${title}\n`,
        `> source: ${rel}\n\n`,
        raw.trim(),
        `\n`,
      ].join('')
    );
  }

  const compiled = [
    `# AIN Corpus (Compiled)\n`,
    `> Built: ${new Date().toISOString()}\n`,
    `> Items: ${toc.length}\n`,
    chunks.join('\n'),
  ].join('\n');

  await fs.writeFile(path.join(OUT_DIR, 'ain_compiled.md'), compiled, 'utf8');
  await fs.writeFile(path.join(OUT_DIR, 'toc.json'), JSON.stringify(toc, null, 2), 'utf8');

  console.log(`\n✅ Built AIN corpus: ${toc.length} items`);
  console.log(`📄 data/ain/build/ain_compiled.md (${Math.round(compiled.length / 1024)} KB)`);
  console.log(`🧭 data/ain/build/toc.json`);
}

main().catch((err) => {
  console.error('❌ build-ain-corpus failed:', err);
  process.exit(1);
});
