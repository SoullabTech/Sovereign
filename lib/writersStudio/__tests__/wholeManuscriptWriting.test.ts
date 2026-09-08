/**
 * WS-WHOLE-MANUSCRIPT-01 · F-1 — several sections mounted, none losing words.
 *
 * ⚠️ WHAT THIS INSTRUMENT IS. `useSectionWriting` is a React hook and this repo
 * has no hook-rendering harness; its writing tests pin pure functions
 * (`captureOnLeave`, `SectionSaveQueue`) and source contracts (the import
 * allow-lists in developSurfaceCannotAct). So the capture SEMANTICS are covered
 * where they live — `captureOnLeave` is pure and already tested — and what is
 * asserted here is the ORDER and REACH that only exist inside the hook, as a
 * source contract. That is weaker than a behavioural test and is named as such
 * rather than dressed up: it can prove the ordering is written, not that a
 * browser honours it. The browser's part is the witness's.
 *
 * ⛔ Comments are stripped before every scan — the C21 lesson of 2026-09-07,
 * where a file failed its own gate because its prose documented the behaviour
 * being banned. This file's subject documents its invariants at length.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { captureOnLeave, type WritingSection } from '../useSectionWriting';

const strip = (code: string) =>
  code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const SOURCE = strip(readFileSync(join(__dirname, '..', 'useSectionWriting.ts'), 'utf8'));

const fn = (name: string): string => {
  const from = SOURCE.indexOf(`const ${name} = useCallback(`);
  if (from < 0) return '';
  /* To the end of that useCallback's dependency array. */
  const end = SOURCE.indexOf(']);', from);
  return SOURCE.slice(from, end < 0 ? undefined : end);
};

describe('F-1 · the hook can hold more than one dirty section', () => {
  it('publishes the three members the continuous view needs', () => {
    for (const member of ['editSection:', 'captureForUnmount:', 'bodyOf:']) {
      expect(`interface publishes ${member} ${SOURCE.includes(member)}`)
        .toBe(`interface publishes ${member} true`);
    }
  });

  it('keeps one autosave timer per section, not one for the surface', () => {
    /* A single timer shared by several mounted editors would let a keystroke in
       section 87 cancel section 86's pending save. */
    expect(SOURCE).toMatch(/timers = useRef\(new Map<string, ReturnType<typeof setTimeout>>\(\)\)/);
    expect(fn('editSection')).toContain('clearTimerFor(sectionId)');
    expect(fn('editSection')).toContain('timers.current.set(sectionId');
  });

  it('resolves a body for ANY section, staged first', () => {
    /* Unmounted-but-dirty is lawful, so a remounting editor must get what the
       writer last saw — not what the server last stored. */
    const body = fn('bodyOf');
    expect(body.indexOf('staged.current.get(sectionId)')).toBeGreaterThan(-1);
    expect(body.indexOf('staged.current.get(sectionId)'))
      .toBeLessThan(body.indexOf('queue.localBody(sectionId)'));
    expect(body.indexOf('queue.localBody(sectionId)'))
      .toBeLessThan(body.indexOf('persisted.get(sectionId)'));
  });
});

describe('F-1 · capture precedes unmount, and the timer dies first', () => {
  it('cancels that section\'s pending save BEFORE capturing', () => {
    const c = fn('captureForUnmount');
    /* A timer left armed would fire against a section whose editor is gone —
       the same race captureOnLeave exists to close at a section switch. */
    expect(c.indexOf('clearTimerFor(sectionId)')).toBeGreaterThan(-1);
    expect(c.indexOf('clearTimerFor(sectionId)')).toBeLessThan(c.indexOf('captureOnLeave('));
  });

  it('captures from the body the caller can still see, not from state', () => {
    /* Reading the editor after the DOM has moved on returns the next section's
       text or nothing. The visible body is a parameter for that reason. */
    expect(fn('captureForUnmount')).toMatch(/captureOnLeave\(queue, leaving, visible,/);
  });

  it('is synchronous — nothing in it awaits', () => {
    expect(fn('captureForUnmount')).not.toContain('await');
    expect(fn('captureForUnmount')).not.toContain('async');
  });
});

describe('W-4 · settling settles every dirty section', () => {
  it('flushPending flushes all staged sections, not only the active one', () => {
    const f = fn('flushPending');
    /* Keep a version and Export are the callers. A version that omits the
       paragraph typed two seconds ago in another section is worse than none. */
    expect(f).toContain('for (const id of [...staged.current.keys()]) flush(id)');
    expect(f).not.toMatch(/if \(activeId\) flush\(activeId\);/);
  });
});

describe('the active section keeps its own contract', () => {
  it('visibleBody follows the ACTIVE section only', () => {
    /* goToSection captures from visibleBody. Pointing it at another section's
       text is exactly how the wrong body gets captured on a switch. */
    expect(fn('editSection')).toMatch(/if \(sectionId === activeId\) visibleBody\.current = body;/);
  });

  it('the section view\'s edit path is the same path, not a second one', () => {
    expect(fn('edit')).toContain('editSection(activeId, body)');
  });

  it('a read-only section is never staged', () => {
    expect(fn('editSection')).toMatch(/if \(!section\?\.editable\) return;/);
  });
});

describe('captureOnLeave — the semantics the unmount path reuses', () => {
  const section = (over: Partial<WritingSection> = {}): WritingSection => ({
    id: 's1', position: 0, heading: null, body: 'as loaded', editable: true, ...over,
  });
  const queue = (localBody: string | undefined = undefined) => {
    const enqueued: { id: string; body: string }[] = [];
    return {
      q: {
        localBody: () => localBody,
        statusOf: () => 'saved' as const,
        enqueue: (id: string, body: string) => { enqueued.push({ id, body }); },
      },
      enqueued,
    };
  };

  it('captures a changed body', () => {
    const { q, enqueued } = queue();
    expect(captureOnLeave(q, section(), 'edited', 'as loaded')).toBe(true);
    expect(enqueued).toEqual([{ id: 's1', body: 'edited' }]);
  });

  it('captures nothing when the visible text is what is already known', () => {
    const { q, enqueued } = queue();
    expect(captureOnLeave(q, section(), 'as loaded', 'as loaded')).toBe(false);
    expect(enqueued).toEqual([]);
  });

  it('never captures from a read-only section', () => {
    const { q, enqueued } = queue();
    expect(captureOnLeave(q, section({ editable: false }), 'edited', 'as loaded')).toBe(false);
    expect(enqueued).toEqual([]);
  });
});
