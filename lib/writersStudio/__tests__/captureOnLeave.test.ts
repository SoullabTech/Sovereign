/**
 * The switch seam. This is where a wrong order loses the last sentence someone
 * typed, so it is tested as a function rather than proven only by clicking.
 *
 * The ordering contract itself — capture BEFORE the active section changes —
 * is structural: captureOnLeave takes the section being left as an argument,
 * so it cannot accidentally read the section being entered.
 */

import { captureOnLeave } from '../useSectionWriting';
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
});
