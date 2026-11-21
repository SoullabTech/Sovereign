/**
 * Step 1 — the coverage line beside the manuscript. Real component, jsdom, stubbed client; not a browser run.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const fetchCoverage = jest.fn();
jest.mock('@/lib/writersStudio/coverageClient', () => ({ fetchCoverage: (...a: unknown[]) => fetchCoverage(...a) }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import { CoverageLine, coverageSentence } from '@/app/dev/writers-studio-pc3-live/CoverageLine';

const map = (states: string[]) => ({
  draftRevision: 5,
  sections: states.map((state, i) => ({ sectionId: `s${i + 1}`, state, readAt: null, lenses: [] })),
  whole: {
    read: states.filter((s) => s === 'read').length, changed: states.filter((s) => s === 'changed').length,
    positionOnly: states.filter((s) => s === 'position_only').length, notRead: states.filter((s) => s === 'not_read').length, total: states.length,
  },
  lensesCurrentForWholeDraft: [],
}) as any;

let root: Root; let host: HTMLDivElement;
beforeEach(() => { fetchCoverage.mockReset(); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
async function mount() {
  act(() => root.render(React.createElement(CoverageLine, { manuscriptId: 'm', labelOf: (id: string) => `Chapter ${id.slice(1)}` })));
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
}

describe('the coverage sentence says only what the record proves', () => {
  it('all read', () => expect(coverageSentence(map(['read', 'read']))).toBe('I’ve read all 2 sections of this draft.'));
  it('⭐ some changed since: says so, never "all"', () => {
    const t = coverageSentence(map(['read', 'changed', 'read']));
    expect(t).toBe('I’ve read 2 of 3 sections of this draft; 1 has changed since I read it.');
  });
  it('one-section draft (a college essay): never "all 1 sections"', () => {
    expect(coverageSentence(map(['read']))).toBe('I’ve read this draft.');
    expect(coverageSentence(map(['changed']))).toBe('This draft has changed since I read it.');
    expect(coverageSentence(map(['not_read']))).toBe('I haven’t kept a reading of this draft yet.');
  });
  it('nothing read yet', () => expect(coverageSentence(map(['not_read', 'position_only']))).toBe('I haven’t kept a reading of this draft yet.'));
  it('⭐ position-only is counted as not read', () => {
    expect(coverageSentence(map(['read', 'position_only']))).toBe('I’ve read 1 of 2 sections of this draft; 1 has no saved reading.');
    expect(coverageSentence(map(['read', 'not_read', 'not_read']))).toBe('I’ve read 1 of 3 sections of this draft; 2 have no saved reading.');
  });
  it('⭐ beta 2026-11-16: it counts saved readings only, so it never says "I haven\'t read" (MAIA may have just quoted the page, unkept)', () => {
    for (const s of [['not_read'], ['position_only'], ['not_read', 'not_read'], ['read', 'not_read'], ['changed', 'position_only']]) {
      expect(coverageSentence(map(s))).not.toMatch(/haven’t read|haven't read/);
    }
  });
});

describe('the line', () => {
  it('⭐ the detail opens only on the writer\'s click, and names the sections', async () => {
    fetchCoverage.mockResolvedValue(map(['read', 'changed', 'not_read']));
    await mount();
    expect(host.querySelector('[data-coverage-detail]')).toBeNull();
    act(() => (host.querySelector('[data-coverage-detail-toggle]') as HTMLElement).click());
    expect(host.querySelector('[data-coverage-changed]')?.textContent).toContain('Chapter 2');
    expect(host.querySelector('[data-coverage-unread]')?.textContent).toBe('No saved reading: Chapter 3');
  });
  it('⭐ a draft that cannot be established is said, never guessed', async () => {
    fetchCoverage.mockResolvedValue(null);
    await mount();
    expect(host.querySelector('[data-coverage-line="unestablished"]')).not.toBeNull();
    expect(host.textContent).not.toMatch(/I’ve read \d|I’ve read all/);
  });
  it('a failed check is said, never guessed', async () => {
    fetchCoverage.mockResolvedValue(undefined);
    await mount();
    expect(host.querySelector('[data-coverage-line="unknown"]')).not.toBeNull();
  });
});
