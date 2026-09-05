/**
 * R2 — THE DRAFT METADATA CONTRACT, WHOLE ACROSS THE PROP BOUNDARY.
 *
 * ── The defect these tests exist to fail against ───────────────────────────
 *
 * Observed in production on de0f35434, 2026-09-05, opening a 185-section
 * continuous manuscript:
 *
 *   TypeError: Cannot read properties of undefined (reading 'toLocaleString')
 *   App error: … → the app error boundary, "Something Went Wrong"
 *
 * The consumer declared one shape and both producers declared and emitted a
 * smaller one:
 *
 *   page.tsx          onMeta: ({ updatedAt; revisionCount; words: number })
 *   Worktable.tsx     onMeta?: ({ updatedAt; revisionCount })      ← no words
 *   WritingSurface    onMeta?: ({ updatedAt; revisionCount })      ← no words
 *
 * `onMeta` is wired straight to `setDraftMeta`, so `draftMeta` became truthy
 * with `words === undefined`, and the consumer guarded the OBJECT while
 * reading the FIELD:
 *
 *   {draftMeta && <>{draftMeta.words.toLocaleString()} words</>}
 *
 * Only non-`section_aware` manuscripts could reach it: `FieldBody` mounts
 * `SectionWritingSession` with no `onMeta`, and everything else falls through
 * to `Worktable` with it. The sibling read one line away — the lower band's
 * `draftMeta?.words ?? null` — was already hardened, which is exactly how the
 * gap survived review.
 *
 * ── Why the repair is not a guard ──────────────────────────────────────────
 *
 * `?.words ?? 0` or `?.words?.toLocaleString()` would stop the throw and
 * print "0 words" over a real draft. The missing datum IS the defect. So
 * these tests pin the count at the PRODUCERS and explicitly forbid the
 * display guard at the consumer.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { countDraftWords } from '@/lib/writersStudio/draftWords';

const read = (...p: string[]) => readFileSync(join(__dirname, '..', ...p), 'utf8');
const worktable = read('canvas', 'Worktable.tsx');
const writingSurface = read('canvas', 'WritingSurface.tsx');
const page = read('canvas', 'page.tsx');

/** Every `onMeta?.({ … })` call in a file, as its literal text. */
function emitSites(source: string): string[] {
  const sites: string[] = [];
  const marker = 'onMeta?.({';
  let i = source.indexOf(marker);
  while (i !== -1) {
    // Balance braces from the opening `{` of the object literal.
    let depth = 0;
    let j = i + marker.length - 1;
    for (; j < source.length; j++) {
      if (source[j] === '{') depth++;
      else if (source[j] === '}' && --depth === 0) break;
    }
    sites.push(source.slice(i, j + 1));
    i = source.indexOf(marker, j);
  }
  return sites;
}

describe('R2 · the count itself', () => {
  it('is zero for nothing, and for whitespace that looks like something', () => {
    expect(countDraftWords('')).toBe(0);
    expect(countDraftWords('   \n\t  ')).toBe(0);
  });

  it('counts whitespace-separated runs, however they are spaced', () => {
    expect(countDraftWords('one')).toBe(1);
    expect(countDraftWords('one two three')).toBe(3);
    expect(countDraftWords('  one   two\n\nthree\t four  ')).toBe(4);
  });

  it('is a number the consumer can format', () => {
    expect(typeof countDraftWords('a b')).toBe('number');
    expect(() => countDraftWords('a b').toLocaleString()).not.toThrow();
  });
});

describe('R2 · producers emit the whole contract', () => {
  const producers: Array<[string, string]> = [
    ['Worktable', worktable],
    ['WritingSurface', writingSurface],
  ];

  it.each(producers)('%s declares words on its onMeta prop', (_name, source) => {
    expect(source).toMatch(/onMeta\?:[\s\S]{0,200}words: number/);
  });

  it.each(producers)('%s has emit sites at all', (_name, source) => {
    expect(emitSites(source).length).toBeGreaterThan(0);
  });

  it.each(producers)('EVERY %s emit site carries words — none may be partial', (name, source) => {
    const sites = emitSites(source);
    const partial = sites.filter((s) => !s.includes('words:'));
    expect({ file: name, partialEmitSites: partial }).toEqual({
      file: name,
      partialEmitSites: [],
    });
  });

  it.each(producers)('%s counts words through the shared helper', (_name, source) => {
    // Three inline `split(/\s+/)` calls are three chances to drift apart.
    expect(source).toContain('countDraftWords');
    expect(source).not.toMatch(/words:\s*[^,\n]*\.split\(/);
  });
});

describe('R2 · the consumer keeps the datum rather than hiding it', () => {
  it('declares words on the prop it hands to the producers', () => {
    expect(page).toMatch(/onMeta: \(m: \{[\s\S]{0,160}words: number/);
  });

  it('renders the count', () => {
    expect(page).toContain('draftMeta.words.toLocaleString()');
  });

  it('FORBIDDEN: no display guard standing in for the missing number', () => {
    // Either of these would paint "0 words" over a real draft and pass.
    expect(page).not.toContain('draftMeta.words?.toLocaleString');
    expect(page).not.toMatch(/draftMeta\?\.words \?\? 0/);
    expect(page).not.toMatch(/words \?\? 0\)\.toLocaleString/);
  });

  it('the lower band still receives a nullable count, unchanged', () => {
    // This sibling was always safe; the repair must not disturb it.
    expect(page).toContain('draftMeta?.words ?? null');
  });
});
