/**
 * WS-EDITORIAL-RECOVERY — UNDO AVAILABILITY FALSIFIERS.
 *
 * ⭐⭐ THE DEFECT THESE EXIST FOR. The 2026-09-21 live witness applied a
 * revision, watched the runtime undo it exactly, and still recorded
 * `INLINE UNDO AFFORDANCE: MISSING` — because the desk showed an applied
 * revision with no control and no reason, and nothing in the system could
 * say whether undo was withheld or had never been wired.
 *
 * ⛔ These do not prove the affordance renders. They prove the reason exists
 * to render, which is the part that was absent.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { classifyUndoAvailability } from '../recovery';

const DESK = join(__dirname, '../../../../app/writers-studio/insight/RevisionDesk.tsx');
const at = (o: Partial<Parameters<typeof classifyUndoAvailability>[0]> = {}) =>
  classifyUndoAvailability({
    hasSnapshot: true, undone: false, currentVersion: 4, resultingVersion: 4, ...o,
  });

describe('undo availability', () => {
  it('U1 · an untouched application is undoable', () => {
    expect(at()).toBe('ok');
  });

  it('U2 · writing since the application withdraws undo, and says which', () => {
    expect(at({ currentVersion: 5 })).toBe('work_moved');
  });

  it('U3 · an application already taken back is not offered again', () => {
    expect(at({ undone: true })).toBe('already_undone');
  });

  /* ⭐⭐ THE ORDERING CASE, and the reason the predicate is not three booleans
     read in any order. Without custody there is nothing to restore FROM, so
     a version difference is not what cost the writer their undo. Reporting
     `work_moved` here would tell them their own writing did it. It did not. */
  it('U4 · missing custody is never reported as the writer having moved the work', () => {
    expect(at({ hasSnapshot: false, currentVersion: 9 })).toBe('no_snapshot');
    expect(at({ hasSnapshot: false, undone: true })).toBe('no_snapshot');
  });

  /* ⭐ `canUndo` and the reason must not be able to disagree: the desk decides
     whether to show a button from one and what to say from the other. */
  it('U5 · exactly one state is undoable', () => {
    const states = [at(), at({ currentVersion: 5 }), at({ undone: true }), at({ hasSnapshot: false })];
    expect(states.filter(s => s === 'ok')).toHaveLength(1);
  });

  /* ⭐⭐ THE WITNESS-LEGIBILITY GUARD. Two labels for one control made
     *absent* and *renamed* indistinguishable to an observer looking for it —
     which is precisely how the 2026-09-21 finding was recorded. */
  it('U6 · the desk names the undo control the same way on every surface', () => {
    const src = readFileSync(DESK, 'utf8');
    expect(src).not.toContain('Undo that application');
    expect(src.match(/>Undo this change</g) ?? []).toHaveLength(2);
  });

  /* ⛔ The desk does not know what happened to the work. If it ever starts
     choosing a cause itself, this goes red. */
  it('U7 · the desk states the reason it was handed, never one it invented', () => {
    const src = readFileSync(DESK, 'utf8');
    expect(src).toContain('undoAvailability');
    expect(src).not.toMatch(/undoAvailability\s*=\s*['"]/);
  });
});
