/**
 * Refusal Registry harness — source-position locating contract.
 *
 * Regression cover for the 2026-09-04 detector defect (see
 * docs/ops/REFUSAL_REGISTRY_DETECTOR_DEFECT_2026-09-04.md).
 *
 * Five assertions across R19 and R21 reported red with `@NaN` line numbers while
 * every guard they police was intact. Cause: the ordering assertions parsed field
 * [1] of a `path:line:text` grep line, but GNU grep OMITS the filename when `-r`
 * is given exactly one non-directory operand (BSD grep and ugrep include it).
 * Field [1] was then source text, `parseInt` returned NaN, and every `NaN < NaN`
 * comparison is false — so each assertion failed closed and read like a breach.
 * Whether the constitutional registry was red depended on which `grep` happened
 * to be first on PATH.
 *
 * These tests hold the two properties that make that impossible to recur:
 *   1. grep() emits `path:line:text` regardless of grep implementation or operand count.
 *   2. The locating helpers never return NaN — they raise DetectorDefect instead,
 *      so a check that cannot find its anchor says so rather than issuing a verdict.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DetectorDefect,
  REPO_ROOT,
  enclosingScope,
  grep,
  guardDomination,
  lineOf,
  linesOf,
  requireLine,
  requireLines,
  scopesOf,
} from './harness';

const HARNESS = 'tests/constitutional/refusal-registry/harness.ts';
// A marker that occurs exactly once in harness.ts, used as a self-referential fixture.
const MARKER = 'class DetectorDefect extends Error';

describe('grep() output contract', () => {
  it('prefixes the filename even for a SINGLE file operand (the portability defect)', () => {
    // The regression condition: one non-directory operand. GNU grep drops the
    // filename here unless -H is passed; BSD grep and ugrep do not.
    const matches = grep(MARKER, [HARNESS]);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatch(/^tests\/constitutional\/refusal-registry\/harness\.ts:\d+:/);
  });

  it('reports the TRUE source line, cross-checked against the file itself', () => {
    const expected =
      readFileSync(join(REPO_ROOT, HARNESS), 'utf8')
        .split('\n')
        .findIndex((l) => l.includes(MARKER)) + 1;

    expect(expected).toBeGreaterThan(0); // fixture still present
    expect(lineOf(grep(MARKER, [HARNESS]))).toBe(expected);
  });

  it('returns an empty array when there are no matches', () => {
    expect(grep('this_string_does_not_occur_anywhere_zzzq', [HARNESS])).toEqual([]);
  });
});

describe('lineOf()', () => {
  it('parses a well-formed path:line:text match', () => {
    expect(lineOf(['a/b.ts:1467:      await sessionMemoryService.storeSessionPattern('])).toBe(1467);
  });

  it('returns -1 for an absent anchor — a substantive result, not a defect', () => {
    // Absence is interpretable by the caller: a missing guard is a breach, a
    // missing INSERT is not. Only the caller can tell those apart.
    expect(lineOf([])).toBe(-1);
  });

  it('NEVER returns NaN: the exact GNU-grep input that caused the defect now throws', () => {
    const gnuGrepStyle = ['1467:      await sessionMemoryService.storeSessionPattern('];
    expect(() => lineOf(gnuGrepStyle)).toThrow(DetectorDefect);
    expect(() => lineOf(gnuGrepStyle)).toThrow(/path:line:text/);
  });

  it('is never silently falsy-comparable — the failure is loud, not a false verdict', () => {
    let thrown: unknown;
    try {
      lineOf(['no line number here at all']);
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(DetectorDefect);
    expect(Number.isNaN(thrown as unknown as number)).toBe(false);
  });
});

describe('requireLine()', () => {
  it('returns the line number when the anchor is present', () => {
    expect(requireLine(['a/b.ts:81:     SET conversation_history'], 'anchor')).toBe(81);
  });

  it('raises DetectorDefect naming the anchor when the landmark has moved', () => {
    expect(() => requireLine([], 'SET conversation_history in sessionManager.ts')).toThrow(
      DetectorDefect
    );
    expect(() => requireLine([], 'SET conversation_history in sessionManager.ts')).toThrow(
      /anchor not found: SET conversation_history in sessionManager\.ts/
    );
  });

  it('tells the reader the assertion proves nothing, rather than implying a breach', () => {
    // The message is load-bearing: a detector that cannot locate its anchor must
    // not be mistaken for a demonstrated constitutional violation.
    expect(() => requireLine([], 'x')).toThrow(/proves nothing either way/);
    expect(() => requireLine([], 'x')).toThrow(/do not relax the assertion/);
  });
});

describe('linesOf() / requireLines()', () => {
  it('returns EVERY match, not just the first (the first-match-only gap)', () => {
    expect(linesOf(['a.ts:113:g', 'a.ts:206:g', 'a.ts:256:g'])).toEqual([113, 206, 256]);
  });

  it('returns an empty array for an absent anchor', () => {
    expect(linesOf([])).toEqual([]);
  });

  it('raises DetectorDefect rather than yielding NaN inside the array', () => {
    expect(() => linesOf(['a.ts:113:g', '206:      guard('])).toThrow(DetectorDefect);
  });

  it('requireLines() treats absence as a lost anchor, not a verdict', () => {
    expect(() => requireLines([], 'INSERT INTO conversation_turns')).toThrow(
      /anchor not found: INSERT INTO conversation_turns/
    );
    expect(() => requireLines([], 'x')).toThrow(/proves nothing either way/);
  });
});

/**
 * A fixture with the exact shape that made line-order too weak: several guarded
 * methods, one method holding TWO writes, and one method with no guard at all.
 * Line numbers are 1-based and stated in the test so a drift is legible.
 */
const FIXTURE = [
  /*  1 */ 'export const Store = {',
  /*  2 */ '  async guarded(posture: TurnPosture): Promise<void> {',
  /*  3 */ '    if (!contentWritable(posture, "a")) return;',
  /*  4 */ '    await query(`INSERT INTO turns (a) VALUES ($1)`);',
  /*  5 */ '  },',
  /*  6 */ '  async twoWrites(posture: TurnPosture): Promise<void> {',
  /*  7 */ '    if (!contentWritable(posture, "b")) return;',
  /*  8 */ '    await query(`INSERT INTO turns (b) VALUES ($1)`);',
  /*  9 */ '    await query(`INSERT INTO turns (c) VALUES ($1)`);',
  /* 10 */ '  },',
  /* 11 */ '  async unguarded(userId: string): Promise<void> {',
  /* 12 */ '    await query(`INSERT INTO turns (d) VALUES ($1)`);',
  /* 13 */ '  },',
  /* 14 */ '};',
].join('\n');

const fixtureDomination = () =>
  guardDomination({
    relPath: 'fixture.ts',
    source: FIXTURE,
    guardLines: [3, 7],
    writeLines: [4, 8, 9, 12],
  });

describe('scopesOf()', () => {
  it('finds each method as its own span', () => {
    const scopes = scopesOf(FIXTURE, 'fixture.ts');
    expect(scopes).toEqual([
      { name: 'guarded', startLine: 2, endLine: 5 },
      { name: 'twoWrites', startLine: 6, endLine: 10 },
      { name: 'unguarded', startLine: 11, endLine: 13 },
    ]);
  });

  it('is not fooled by braces inside SQL strings and template interpolations', () => {
    const src = [
      'function f() {',
      '  const s = `not a brace: { ${x ? "{" : "}"} }`;',
      '  const t = "} unbalanced in a string {";',
      '  // } a brace in a comment {',
      '  return s + t;',
      '}',
    ].join('\n');
    expect(scopesOf(src, 'f.ts')).toEqual([{ name: 'f', startLine: 1, endLine: 6 }]);
  });

  it('does not mistake a Promise<{ … }> return type for the function body', () => {
    const src = [
      'export async function f(a: string): Promise<{',
      '  x: string;',
      '}> {',
      '  return { x: a };',
      '}',
    ].join('\n');
    expect(scopesOf(src, 'f.ts')).toEqual([{ name: 'f', startLine: 1, endLine: 5 }]);
  });

  it('keeps offsets aligned across surrogate pairs (an emoji must not truncate a scope)', () => {
    // Regression: building the code-only view with Array.from() iterates CODE
    // POINTS, collapsing each surrogate pair into one element and shifting every
    // offset after it. One emoji in a log string silently truncated the
    // enclosing scope (observed on corpusCallosumService.ts: 317-466 vs 317-524).
    const src = [
      'function f() {',
      '  console.log(`🧠 emoji in a template literal`);',
      '  if (true) {',
      '    console.log("🔥🌊 more");',
      '  }',
      '  return 1;',
      '}',
    ].join('\n');
    expect(scopesOf(src, 'f.ts')).toEqual([{ name: 'f', startLine: 1, endLine: 7 }]);
  });

  it('does not treat control-flow keywords as function definitions', () => {
    const src = ['function f() {', '  if (a) {', '    for (const b of c) {', '    }', '  }', '}'].join('\n');
    expect(scopesOf(src, 'f.ts').map((s) => s.name)).toEqual(['f']);
  });

  it('raises DetectorDefect on a file it cannot tokenize', () => {
    expect(() => scopesOf('function f() { /* unterminated', 'f.ts')).toThrow(DetectorDefect);
  });
});

describe('enclosingScope()', () => {
  it('returns the tightest span containing the line', () => {
    const scopes = scopesOf(FIXTURE, 'fixture.ts');
    expect(enclosingScope(scopes, 9)?.name).toBe('twoWrites');
    expect(enclosingScope(scopes, 12)?.name).toBe('unguarded');
  });

  it('returns undefined outside every function body', () => {
    expect(enclosingScope(scopesOf(FIXTURE, 'fixture.ts'), 1)).toBeUndefined();
  });
});

describe('guardDomination()', () => {
  it('credits a guard for EVERY write in its own scope, not just the first', () => {
    const r = fixtureDomination();
    // Line 9 is the write a first-match ordering assertion could never speak to.
    expect(r.dominated).toContainEqual({ line: 9, scope: 'twoWrites', guardLine: 7 });
  });

  it('refuses to credit a guard from a DIFFERENT scope', () => {
    // Guards at 3 and 7 both PRECEDE the write at 12, so pure line order would
    // pass it. Domination does not, because neither is inside unguarded().
    const r = fixtureDomination();
    expect(r.ok).toBe(false);
    expect(r.undominated).toEqual([{ line: 12, scope: 'unguarded' }]);
  });

  it('reports ok when every write has a guard above it in its own scope', () => {
    const r = guardDomination({
      relPath: 'fixture.ts',
      source: FIXTURE,
      guardLines: [3, 7],
      writeLines: [4, 8, 9],
    });
    expect(r.ok).toBe(true);
    expect(r.undominated).toEqual([]);
  });

  it('does not credit a guard that sits BELOW the write it supposedly governs', () => {
    const r = guardDomination({
      relPath: 'fixture.ts',
      source: FIXTURE,
      guardLines: [7],
      writeLines: [8, 9],
    });
    expect(r.ok).toBe(true);
    // Same scope, but a guard at 7 cannot govern a write at 6.
    const hoisted = guardDomination({
      relPath: 'fixture.ts',
      source: FIXTURE,
      guardLines: [9],
      writeLines: [8],
    });
    expect(hoisted.ok).toBe(false);
  });

  it('treats a total absence of guards as a breach, not a lost anchor', () => {
    const r = guardDomination({
      relPath: 'fixture.ts',
      source: FIXTURE,
      guardLines: [],
      writeLines: [4, 8, 9, 12],
    });
    expect(r.ok).toBe(false);
    expect(r.undominated).toHaveLength(4);
  });

  it('raises DetectorDefect for a write in no recognised scope (cannot adjudicate)', () => {
    expect(() =>
      guardDomination({ relPath: 'fixture.ts', source: FIXTURE, guardLines: [3], writeLines: [1] })
    ).toThrow(DetectorDefect);
  });
});

describe('R21 anchors on the real stores', () => {
  // The concrete claim §6.1 of the detector-defect record said was unproven:
  // TurnsStore has 3 guards and 4 INSERTs, and `113 < 125` says nothing about
  // the INSERT at 281. This binds that write to the guard that actually governs it.
  it('binds each TurnsStore INSERT to a guard inside the same method', () => {
    const rel = 'lib/memory/stores/TurnsStore.ts';
    const source = readFileSync(join(REPO_ROOT, rel), 'utf8');
    const r = guardDomination({
      relPath: rel,
      source,
      guardLines: linesOf(grep('contentWritable\\(', [rel])),
      writeLines: requireLines(grep('INSERT INTO conversation_turns', [rel]), 'TurnsStore INSERT'),
    });

    expect(r.ok).toBe(true);
    expect(r.dominated.length).toBeGreaterThanOrEqual(4);

    // Both addExchange INSERTs must answer to addExchange's own guard.
    const addExchange = r.dominated.filter((d) => d.scope === 'addExchange');
    expect(addExchange.length).toBe(2);
    expect(new Set(addExchange.map((d) => d.guardLine)).size).toBe(1);
    // ...and never to the first guard in the file, which governs addTurn.
    const addTurnGuard = r.dominated.find((d) => d.scope === 'addTurn')?.guardLine;
    expect(addExchange.every((d) => d.guardLine !== addTurnGuard)).toBe(true);
  });
});
