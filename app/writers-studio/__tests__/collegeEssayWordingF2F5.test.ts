/**
 * College Essay live case study (#2305, 2026-11-16) — wording findings F2, F4, F5. Pure functions, a rendered CoverageLine,
 * and source pins for the conversation's scope chips. Ordinary Works keep their existing words.
 * @jest-environment jsdom
 */
import fs from 'node:fs';
import path from 'node:path';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

const fetchCoverage = jest.fn();
jest.mock('@/lib/writersStudio/coverageClient', () => ({ fetchCoverage: (...a: unknown[]) => fetchCoverage(...a) }));
jest.mock('@/app/writers-studio/full-redesign/Shell', () => ({ Shell: () => null }));
jest.mock('@/app/writers-studio/useWorkVisual', () => ({ useWorkVisual: () => ({ src: null }) }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1WorkMaterialsSummary', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1ProducePanel', () => ({ __esModule: true, default: () => null }));

import { CoverageLine } from '@/app/dev/writers-studio-pc3-live/CoverageLine';
import { workKind } from '@/app/dev/writers-studio-pc3-live/P4R1HomeView';
import { studioPathById } from '@/lib/writersStudio/studioPaths';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('F2 · the conversation names the whole Work in the program’s words', () => {
  const src = read('app/writers-studio/canvas/WorkConversation.tsx');
  test('a college essay’s whole-Work scope is "the whole essay"', () => {
    expect(studioPathById('college-essay')!.studioCopy.wholeScope).toBe('the whole essay');
  });
  test('the chip, the on-notice and the offer all use the same program-aware phrase; an ordinary Work speaks of its own form', () => {
    // Superseded 2026-11-20: an ordinary Work no longer keeps "the whole book"; it speaks of the form the writer named, or neutrally.
    expect(src).toContain('const wholeScope = workProgram?.studioCopy.wholeScope ?? vocab.whole;');
    expect(src).toContain("const vocab = formVocabulary(workProgram ? workProgram.name : work.form ?? null);");
    expect(src).toContain("{s === 'here' ? 'where I am' : wholeScope}");
    expect(src).toContain('Every question here is about {wholeScope} until you choose “where I am”.');
    expect(src).toContain('Ask about {wholeScope}?');
    expect(src).not.toMatch(/>\s*Ask about the whole book\?|: 'the whole book'\}/);
  });
});

describe('F4 · Home names a program Work by its program', () => {
  test('a college-essay Work is "College essay" on Home, with the stage the writer has put it at', () => {
    expect(workKind({ form: null, studioPath: 'college-essay' } as never)).toBe('College essay · Discover');
    expect(workKind({ form: 'Book', studioPath: 'college-essay', studioStage: 'revise' } as never)).toBe('College essay · Revise');
  });
  test('an ordinary Work is unchanged: its form, else "Work"', () => {
    expect(workKind({ form: 'Memoir', studioPath: null } as never)).toBe('Memoir');
    expect(workKind({ form: null, studioPath: null } as never)).toBe('Work');
    expect(workKind({ form: '  ', studioPath: undefined } as never)).toBe('Work');
  });
  test('both Home cards use it', () => {
    const view = read('app/dev/writers-studio-pc3-live/P4R1HomeView.tsx');
    expect(view.match(/<p className="fr-home-kind" data-work-kind>\{workKind\(work\)\}<\/p>/g)?.length).toBe(2);
    expect(view).not.toContain("<p className=\"fr-home-kind\">{work.form?.trim() || 'Work'}</p>");
  });
});

describe('F5 · no "Which ones?" on a one-part draft', () => {
  async function line(total: number, read: number) {
    fetchCoverage.mockResolvedValue({
      whole: { read, changed: 0, notRead: total - read, positionOnly: 0, total },
      sections: Array.from({ length: total }, (_, i) => ({ sectionId: `s${i}`, state: i < read ? 'read' : 'not_read' })),
    });
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => { root.render(React.createElement(CoverageLine, { manuscriptId: 'm', labelOf: () => 'x' })); });
    for (let i = 0; i < 4; i++) await act(async () => { await Promise.resolve(); });
    const toggle = host.querySelector('[data-coverage-detail-toggle]');
    const text = host.textContent;
    act(() => root.unmount()); host.remove();
    return { toggle, text };
  }
  test('one part, unread: the sentence alone, no toggle', async () => {
    const { toggle, text } = await line(1, 0);
    expect(text).toBe('No saved reading of this draft yet.');
    expect(toggle).toBeNull();
  });
  test('several parts, some unread: "Which ones?" is still offered', async () => {
    const { toggle } = await line(3, 1);
    expect(toggle?.textContent).toBe('Which ones?');
  });
});
