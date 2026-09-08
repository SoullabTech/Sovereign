/**
 * @jest-environment jsdom
 */
/**
 * WS-WHOLE-MANUSCRIPT-01 · F-3 (BRIDGE) — the view preference cannot cost a word.
 *
 * jsdom, because the subject is a browser storage boundary and the whole point
 * is how it behaves when that boundary misbehaves. The repo default is `node`;
 * this is the exception, declared per file rather than widened globally.
 *
 * The ruling is member × Work; this is device-local × Work, and these tests pin
 * the bridge honestly: what it does, and what it does NOT claim.
 */

import {
  DEFAULT_MANUSCRIPT_VIEW, readManuscriptView, writeManuscriptView,
} from '../manuscriptViewPreference';

const store = (impl: Partial<Storage>) => {
  Object.defineProperty(window, 'localStorage', { value: impl, configurable: true });
};
const working = () => {
  const map = new Map<string, string>();
  store({
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
  });
  return map;
};

describe('F-3 bridge · the choice is per Work', () => {
  it('defaults to Section for a Work that has never chosen', () => {
    working();
    expect(DEFAULT_MANUSCRIPT_VIEW).toBe('section');
    expect(readManuscriptView('work-1')).toBe('section');
  });

  it('remembers one book without deciding for another', () => {
    working();
    expect(writeManuscriptView('work-1', 'whole')).toBe(true);
    expect(readManuscriptView('work-1')).toBe('whole');
    /* Someone may keep one book almost permanently in Whole Manuscript while
       working section-by-section on another. */
    expect(readManuscriptView('work-2')).toBe('section');
  });
});

describe('F-3 bridge · storage failure is never the writer\'s problem', () => {
  it('falls back to Section when localStorage throws on read', () => {
    /* Private windows, blocked site data, some embedded webviews. This project
       has already lost member state to exactly that. */
    store({ getItem: () => { throw new Error('SecurityError'); } });
    expect(readManuscriptView('work-1')).toBe('section');
  });

  it('reports a failed write rather than throwing into the editor', () => {
    store({ getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } });
    expect(() => writeManuscriptView('work-1', 'whole')).not.toThrow();
    expect(writeManuscriptView('work-1', 'whole')).toBe(false);
  });

  it('treats a corrupt or unrecognised value as absence, not as an error', () => {
    const map = working();
    map.set('ws.manuscriptView.work-1', 'flowing');
    /* A value written by a future version must not strand a writer in a view
       this build cannot render. */
    expect(readManuscriptView('work-1')).toBe('section');
  });

  it('answers for a missing Work key without touching storage', () => {
    store({ getItem: () => { throw new Error('should not be reached'); } });
    expect(readManuscriptView('')).toBe('section');
    expect(writeManuscriptView('', 'whole')).toBe(false);
  });
});

describe('F-3 bridge · what it must not do', () => {
  it('never infers a view from age or provenance', () => {
    /* The writer chooses how to enter their book. Nothing here has any input
       but the Work key and the writer's own choice. */
    expect(readManuscriptView.length).toBe(1);
    expect(writeManuscriptView.length).toBe(2);
  });
});
