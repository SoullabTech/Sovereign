/**
 * AIN CORPUS BUILDER
 *
 * Compiles the AIN conversations library into a single readable corpus
 * with table of contents for the Book Companion.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import {
  loadDeclaration,
  decideAdmission,
  formatVerdict,
} from '../lib/corpus/admission';

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

/**
 * SOURCE-CUSTODY-PII-01 · ACT 4 §C — being under SRC_DIR is a candidacy, not an
 * admission. `listFiles` above answers "what is here"; it must never be allowed
 * to answer "what MAIA may know". Three beta-tester contact lists lived under
 * this directory and were ingested for no reason other than their location.
 */
function admitted(candidates: string[]): string[] {
  const declaration = loadDeclaration(ROOT);
  const verdict = decideAdmission(ROOT, candidates, declaration);
  console.log(formatVerdict(verdict));
  if (verdict.refused.length > 0) {
    /* A declaration admitted a path whose content contradicts it. Stop: this is
       a wrong declaration, not a file to skip quietly past. */
    throw new Error(
      `corpus admission REFUSED ${verdict.refused.length} declared file(s) carrying human-record signals — fix the declaration, do not bypass this`,
    );
  }
  return verdict.admitted.map((rel) => path.join(ROOT, rel));
}

async function main() {
  console.log('🏗️  Building AIN corpus...');

  const files = admitted(await listFiles(SRC_DIR));
  console.log(`📂 Found ${files.length} source files`);

  if (files.length > 0) {
    throw new Error(
      'generic compiled-corpus writes are retired for governed content; use an approved subject-specific corpus build act',
    );
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

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
