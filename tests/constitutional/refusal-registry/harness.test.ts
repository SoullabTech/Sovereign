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
import { grep, lineOf, requireLine, DetectorDefect, REPO_ROOT } from './harness';

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
