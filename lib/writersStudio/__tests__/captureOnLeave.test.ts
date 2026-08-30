/**
 * The switch seam. This is where a wrong order loses the last sentence someone
 * typed, so it is tested as a function rather than proven only by clicking.
 *
 * The ordering contract itself — capture BEFORE the active section changes —
 * is structural: captureOnLeave takes the section being left as an argument,
 * so it cannot accidentally read the section being entered.
 */

import { captureOnLeave, resolveSectionStatus } from '../useSectionWriting';
import { SectionSaveQueue } from '../sectionSaveQueue';

const section = (id: string, body: string, editable = true) =>
  ({ id, position: 0, heading: 'H', body, editable });

const quiet = () => new SectionSaveQueue(1, async () => ({ ok: true, version: 2 }));

describe('captureOnLeave', () => {
  it('captures text the writer changed', () => {
    const q = quiet();
    expect(captureOnLeave(q, section('A', 'server text'), 'server text plus more')).toBe(true);
    expect(q.localBody('A')).toBe('server text plus more');
  });

  it('does not enqueue when nothing changed', () => {
    const q = quiet();
    expect(captureOnLeave(q, section('A', 'unchanged'), 'unchanged')).toBe(false);
    expect(q.localBody('A')).toBeNull();
  });

  it('does not re-enqueue text already queued', () => {
    const q = new SectionSaveQueue(1, () => new Promise(() => {})); // never resolves
    q.enqueue('A', 'already queued');
    expect(captureOnLeave(q, section('A', 'server text'), 'already queued')).toBe(false);
  });

  it('captures a further edit made after the text was queued', () => {
    const q = new SectionSaveQueue(1, () => new Promise(() => {}));
    q.enqueue('A', 'first');
    expect(captureOnLeave(q, section('A', 'server'), 'first and more')).toBe(true);
    expect(q.localBody('A')).toBe('first and more');
  });

  it('never captures from a read-only section', () => {
    const q = quiet();
    expect(captureOnLeave(q, section('A', 'opaque', false), 'anything')).toBe(false);
    expect(q.localBody('A')).toBeNull();
  });

  it('is a no-op when nothing was active', () => {
    const q = quiet();
    expect(captureOnLeave(q, null, 'stray text')).toBe(false);
  });

  it('THE LOSS CASE: an edit made and immediately navigated away from survives', () => {
    // No blur, no debounce timer, no await. The writer typed and clicked.
    const q = new SectionSaveQueue(1, () => new Promise(() => {}));
    captureOnLeave(q, section('A', ''), 'the last sentence they typed');
    expect(q.localBody('A')).toBe('the last sentence they typed');
    expect(q.hasUnsavedWork()).toBe(true);
  });

  describe('the persisted baseline', () => {
    it('does NOT re-enqueue an edit that was already saved', () => {
      // After a successful save the section's `body` from initialSections is
      // stale. Comparing against it forever means leaving the section queues
      // the same edit a second time.
      const q = quiet();
      const persistedBody = 'the edit, already saved';
      expect(captureOnLeave(q, section('A', 'the ORIGINAL text'), persistedBody, persistedBody))
        .toBe(false);
      expect(q.localBody('A')).toBeNull();
    });

    it('still captures a NEW edit made after a save', () => {
      const q = quiet();
      const persistedBody = 'the edit, already saved';
      expect(captureOnLeave(q, section('A', 'the ORIGINAL text'), persistedBody + ' and more', persistedBody))
        .toBe(true);
      expect(q.localBody('A')).toBe('the edit, already saved and more');
    });

    it('falls back to the loaded body when nothing has been persisted yet', () => {
      const q = quiet();
      expect(captureOnLeave(q, section('A', 'loaded'), 'loaded', undefined)).toBe(false);
      expect(captureOnLeave(q, section('A', 'loaded'), 'changed', undefined)).toBe(true);
    });

    it('a queued body still outranks the persisted baseline', () => {
      const q = new SectionSaveQueue(1, () => new Promise(() => {}));
      q.enqueue('A', 'queued');
      expect(captureOnLeave(q, section('A', 'loaded'), 'queued', 'persisted')).toBe(false);
    });
  });
});

describe('resolveSectionStatus', () => {
  it('a latched conflict survives further typing', () => {
    // The bug this prevents: after a real cross-device conflict, typing more
    // flipped the outline from "! needs attention" to "· unsaved" while the
    // conflict was still latched and no save could dispatch.
    expect(resolveSectionStatus('conflict', true)).toBe('conflict');
    expect(resolveSectionStatus('conflict', false)).toBe('conflict');
  });

  it('an error MAY become dirty — the new body has a safe retry ahead of it', () => {
    expect(resolveSectionStatus('error', true)).toBe('dirty');
    expect(resolveSectionStatus('error', false)).toBe('error');
  });

  it('staged text over a clean or saving section reads as dirty', () => {
    expect(resolveSectionStatus('clean', true)).toBe('dirty');
    expect(resolveSectionStatus('saving', true)).toBe('dirty');
  });

  it('no staged text passes the queue status through', () => {
    expect(resolveSectionStatus('clean', false)).toBe('clean');
    expect(resolveSectionStatus('saving', false)).toBe('saving');
    expect(resolveSectionStatus('dirty', false)).toBe('dirty');
  });
});
