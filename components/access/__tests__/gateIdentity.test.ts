/**
 * Refusal screens must name the surface that refused you.
 *
 * THE DEFECT THIS LOCKS OUT (founder ruling 2026-09-04): the only refusal
 * screen in the codebase was components/book-studio/FounderGateScreen, written
 * for Soullab Press editorial surfaces. Three layouts outside Book Studio had
 * adopted it — /labtools, /commons/circles, /voice-controller-test — so a
 * person refused at Lab Tools was told they had reached a book's private
 * editorial environment and offered "Read the manuscript →".
 *
 * A refusal is often the ONLY thing a person ever sees of a surface. It is the
 * one moment the system must name the place correctly.
 *
 *   Someone refused at a surface should understand what that surface is.
 *
 * The generic screen (components/access/FounderGateScreen) requires identity as
 * an input precisely so it cannot be inherited by accident.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '../../..');
const BOOK_STUDIO_GATE = 'components/book-studio/FounderGateScreen';

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

/** Files that IMPORT the Book Studio gate (its own definition excluded). */
function bookStudioGateImporters(): string[] {
  return walk(path.join(REPO, 'app'))
    .filter((f) => new RegExp(`from ['"]@/${BOOK_STUDIO_GATE}['"]`).test(readFileSync(f, 'utf8')))
    .map((f) => path.relative(REPO, f));
}

describe("Book Studio's gate belongs to Book Studio", () => {
  it('is imported only from inside app/book-studio', () => {
    for (const file of bookStudioGateImporters()) {
      expect(`${file}:${file.startsWith('app/book-studio/')}`).toBe(`${file}:true`);
    }
  });

  it('is still used there — the wrapper was kept, not orphaned', () => {
    expect(bookStudioGateImporters().length).toBeGreaterThan(0);
  });
});

describe('the generic gate cannot inherit an identity', () => {
  const source = readFileSync(
    path.join(REPO, 'components/access/FounderGateScreen.tsx'),
    'utf8',
  );
  /** Comments explain the defect and necessarily quote it; only code is scanned. */
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('requires eyebrow, title and description — no defaults to fall into', () => {
    // Optional props are declared `name?:`. These three must not be.
    for (const prop of ['eyebrow', 'title', 'description']) {
      expect(`${prop}:${new RegExp(`\\n  ${prop}\\?:`).test(source)}`).toBe(`${prop}:false`);
    }
  });

  it('carries no surface-specific copy of its own', () => {
    // Exits and wording belong to the caller. If these appear here, the generic
    // screen has started growing somebody's identity again.
    expect(code).not.toMatch(/manuscript|Soullab Press|Book Studio index/i);
  });
});

describe('every surface that refuses names itself', () => {
  const GATED = [
    'app/labtools/layout.tsx',
    'app/commons/circles/layout.tsx',
    'app/voice-controller-test/layout.tsx',
  ];

  it.each(GATED)('%s passes its own eyebrow to the gate', (rel) => {
    const source = readFileSync(path.join(REPO, rel), 'utf8');
    expect(source).toMatch(/eyebrow="/);
    expect(source).not.toMatch(new RegExp(BOOK_STUDIO_GATE));
  });
});
