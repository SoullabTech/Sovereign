/**
 * W-1 — exit-boundary safety for the Working Draft editor.
 *
 * The defect these cover: text typed inside the AUTOSAVE_DELAY_MS debounce
 * window was queued but not sent, and the unmount path CLEARED THE DEBOUNCE
 * TIMER WITHOUT FLUSHING. Switching Room tabs, changing route, or leaving the
 * page silently discarded the writer's most recent words — while the room said
 * "It autosaves as you write."
 *
 * These tests exist so that pairing can never be separated again.
 */
import { createDraftSaver, createExitGuard, type SaveResult } from '../workingDraftClient';

function makeSaver(save: (c: string) => Promise<SaveResult>) {
  const states: string[] = [];
  const saver = createDraftSaver(save, { onState: (s) => states.push(s) });
  return { saver, states };
}

const ok = (): Promise<SaveResult> =>
  Promise.resolve({ kind: 'ok', revisionCount: 1, revisionId: 1, updatedAt: '2026-07-30T00:00:00Z' });

describe('createExitGuard — W-1', () => {
  it('flushes text queued inside the debounce window (the core defect)', async () => {
    const saved: string[] = [];
    const { saver } = makeSaver((c) => {
      saved.push(c);
      return ok();
    });
    let timerCleared = false;
    const guard = createExitGuard(saver, () => {
      timerCleared = true;
    });

    // Writer types; the debounce timer has NOT fired yet.
    saver.queue('the last sentence I wrote');
    expect(saved).toEqual([]); // nothing sent yet — this is the danger window

    const wasPending = guard.flushNow();

    expect(wasPending).toBe(true);
    expect(timerCleared).toBe(true); // timer cleared...
    await saver.whenIdle();
    expect(saved).toEqual(['the last sentence I wrote']); // ...AND content saved
  });

  it('clears the timer but does not save when nothing is pending', async () => {
    const saved: string[] = [];
    const { saver } = makeSaver((c) => {
      saved.push(c);
      return ok();
    });
    let cleared = false;
    const guard = createExitGuard(saver, () => {
      cleared = true;
    });

    expect(guard.flushNow()).toBe(false);
    expect(cleared).toBe(true);
    await saver.whenIdle();
    expect(saved).toEqual([]);
  });

  it('does NOT duplicate saves when several exit handlers fire at once', async () => {
    // Kelly's race: visibilitychange + pagehide + unmount can all fire during a
    // single exit. Single-flight ordering must collapse them into one write.
    const saved: string[] = [];
    const { saver } = makeSaver((c) => {
      saved.push(c);
      return ok();
    });
    const guard = createExitGuard(saver, () => {});

    saver.queue('one body of text');
    guard.flushNow(); // visibilitychange
    guard.flushNow(); // pagehide
    guard.flushNow(); // unmount

    await saver.whenIdle();
    expect(saved).toEqual(['one body of text']); // exactly once
  });

  it('reports still-pending after a FAILED flush, so beforeunload can warn', async () => {
    const { saver } = makeSaver(() => Promise.resolve({ kind: 'error' }));
    const guard = createExitGuard(saver, () => {});

    saver.queue('unsaveable text');
    guard.flushNow();
    await saver.whenIdle();

    // The save failed; the words are still unpersisted. The browser must ask.
    expect(guard.stillPending()).toBe(true);
  });

  it('never reports "saved" after a failed save', async () => {
    const { saver, states } = makeSaver(() => Promise.resolve({ kind: 'error' }));
    const guard = createExitGuard(saver, () => {});

    saver.queue('text');
    guard.flushNow();
    await saver.whenIdle();

    expect(states).toContain('error');
    expect(states[states.length - 1]).toBe('error');
    expect(states).not.toContain('saved');
  });

  it('preserves the newest text when an exit interrupts an in-flight save', async () => {
    // A slow earlier save must never overwrite the words typed just before exit.
    const saved: string[] = [];
    let release: (() => void) | null = null;
    const { saver } = makeSaver((c) => {
      saved.push(c);
      if (saved.length === 1) {
        return new Promise<SaveResult>((res) => {
          release = () => res({ kind: 'ok', revisionCount: 1, revisionId: 1, updatedAt: null });
        });
      }
      return ok();
    });
    const guard = createExitGuard(saver, () => {});

    saver.queue('first');
    saver.flush(); // in flight, unresolved
    saver.queue('second — typed just before leaving');
    guard.flushNow(); // exit while the first save is still open

    release!();
    await saver.whenIdle();

    expect(saved[saved.length - 1]).toBe('second — typed just before leaving');
    expect(guard.stillPending()).toBe(false);
  });
});
