/**
 * WS-EDITORIAL-SCOPE-01 · READ-SCOPE FALSIFIERS.
 *
 * ⭐ S3 is the one that matters: a passage occurring twice yields NO surround.
 * A "nearest match" surround is a neighbourhood the writer is not standing in.
 */

import { SURROUND_CHARS_PER_SIDE, surroundOf } from '../surround';

const SECTION =
  'The morning had been long.\n\nHe was there, fixated, and the river ran on.\n\nHe did not move.';
const PASSAGE = 'He was there, fixated, and the river ran on.';

describe('WS-EDITORIAL-SCOPE-01 · the surround', () => {
  it('S1 · splits the section around a uniquely located passage', () => {
    const s = surroundOf(SECTION, PASSAGE);
    expect(s).not.toBeNull();
    expect(s!.before).toBe('The morning had been long.\n\n');
    expect(s!.after).toBe('\n\nHe did not move.');
    expect(s!.truncated).toBe(false);
  });

  it('S2 · ⛔ the passage itself never appears in its own surround', () => {
    const s = surroundOf(SECTION, PASSAGE)!;
    expect(s.before).not.toContain(PASSAGE);
    expect(s.after).not.toContain(PASSAGE);
  });

  it('S3 · ⭐⭐ an ambiguous passage yields NO surround, never a guess', () => {
    const twice = `${PASSAGE} And later: ${PASSAGE}`;
    expect(surroundOf(twice, PASSAGE)).toBeNull();
  });

  it('S4 · an absent passage yields no surround', () => {
    expect(surroundOf(SECTION, 'words that are not there')).toBeNull();
  });

  it('S5 · an empty passage yields no surround', () => {
    expect(surroundOf(SECTION, '')).toBeNull();
  });

  it('S6 · a passage opening or closing the section gives an empty side', () => {
    const opens = surroundOf(`${PASSAGE} Then more.`, PASSAGE)!;
    expect(opens.before).toBe('');
    const closes = surroundOf(`Before it. ${PASSAGE}`, PASSAGE)!;
    expect(closes.after).toBe('');
  });

  it('S7 · ⭐ a long section is windowed to the text NEAREST the passage', () => {
    const far = 'X'.repeat(SURROUND_CHARS_PER_SIDE * 2);
    const near = 'NEAR-BEFORE ';
    const s = surroundOf(`${far}${near}${PASSAGE}${' NEAR-AFTER'}${far}`, PASSAGE)!;
    expect(s.truncated).toBe(true);
    /* ⛔ Not the OPENING of the section — the part least likely to explain it. */
    expect(s.before.endsWith(near)).toBe(true);
    expect(s.after.startsWith(' NEAR-AFTER')).toBe(true);
    expect(s.before.length).toBe(SURROUND_CHARS_PER_SIDE);
    expect(s.after.length).toBe(SURROUND_CHARS_PER_SIDE);
  });

  it('S8 · a section that fits is not reported as truncated', () => {
    expect(surroundOf(SECTION, PASSAGE)!.truncated).toBe(false);
  });

  it('S9 · ⛔ no normalisation — whitespace and marks are matched exactly', () => {
    expect(surroundOf(SECTION, 'He was there, fixated and the river ran on.')).toBeNull();
  });
});
