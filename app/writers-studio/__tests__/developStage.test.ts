/**
 * The Develop stage: the work is present and central. Real component; no network. Not a browser run.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/canvas/ReadScopeControl', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/writers-studio/canvas/SettledDecisions', () => ({ __esModule: true, default: () => null }));
jest.mock('@/lib/writersStudio/workKindClient', () => ({ setWorkKindClient: jest.fn(async (_w: string, k: unknown) => k) }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { DevelopStage, DevelopHoldings } from '@/app/dev/writers-studio-pc3-live/DevelopStage';

const sections = [
  { draftSectionId: 's1', heading: 'Harbour', body: 'Harbour\n\nMarta held the key by the harbour. It was cold.', position: 0 },
  { draftSectionId: 's2', heading: 'Salt', body: 'Salt\n\nThe nets were heavy that winter, and nothing was said of the lantern.', position: 1 },
  { draftSectionId: 's3', heading: 'Return', body: 'Return\n\nShe lost the key near the water. ' + 'She walked back slowly. '.repeat(30), position: 2 },
];
let root: Root; let host: HTMLDivElement;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

function mount(over: Record<string, unknown> = {}) {
  const props = { workTitle: 'The Long Harbour', sections, currentId: 's1', onSelect: jest.fn(), starters: ['What is Harbour doing in the book?'], onStarter: jest.fn(), onOpenWrite: jest.fn(), onMoreWays: jest.fn(), lastRead: null, conversation: React.createElement('div', { 'data-fake-convo': true }, 'convo'), ...over };
  act(() => root.render(React.createElement(DevelopStage, props as any)));
  return props as any;
}
const q = (s: string) => host.querySelector<HTMLElement>(s);

test('D1/D2 the chapter’s actual text is the centre, with the conversation under it', () => {
  mount();
  expect(q('[data-develop-chapter="s1"]')!.textContent).toContain('Marta held the key by the harbour.');
  expect(q('[data-develop-chapter="s1"]')!.textContent).not.toContain('Salt');            // the heading is not repeated as body
  expect(q('[data-develop-conversation] [data-fake-convo]')).not.toBeNull();
});

test('the shape of the book: one segment per chapter; choosing one moves there and nowhere else', () => {
  const p = mount();
  const seg = Array.from(host.querySelectorAll('[data-develop-ribbon] button'));
  expect(seg.map((b) => b.textContent)).toEqual(['Harbour', 'Salt', 'Return']);
  act(() => (seg[2] as HTMLElement).click());
  expect(p.onSelect).toHaveBeenCalledWith('s3');
});

test('threads: counted words that recur; choosing one marks the chapters that carry it and the word in the text', () => {
  mount();
  const chip = Array.from(host.querySelectorAll('[data-develop-threads] button')).find((b) => b.textContent?.startsWith('key'))!;
  expect(chip).toBeTruthy();
  act(() => (chip as HTMLElement).click());
  const marked = Array.from(q('[data-develop-chapter]')!.querySelectorAll('mark')).map((m) => m.textContent);
  expect(marked).toEqual(['key']);
  const seg = Array.from(host.querySelectorAll('[data-develop-ribbon] button')).map((b) => b.textContent);
  expect(seg).toEqual(['● Harbour', 'Salt', '● Return']);
  act(() => (chip as HTMLElement).click());                                              // toggles off
  expect(q('[data-develop-chapter]')!.querySelectorAll('mark').length).toBe(0);
});

test('the chapters she read are shown in place from the writer’s own copy; “Go there” moves, “Read it here” expands', () => {
  const p = mount({ lastRead: [{ sectionId: 's3', label: 'Return' }, { sectionId: 's1', label: 'Harbour' }] });
  const cards = host.querySelectorAll('[data-develop-excerpt]');
  expect(cards.length).toBe(2);
  expect(q('[data-develop-excerpt="s3"]')!.textContent).toContain('She lost the key near the water.');
  expect(q('[data-develop-excerpt="s1"]')!.textContent).toContain('this chapter');
  act(() => Array.from(q('[data-develop-excerpt="s3"]')!.querySelectorAll('button')).find((b) => b.textContent === 'Go there')!.click());
  expect(p.onSelect).toHaveBeenCalledWith('s3');
  const read = Array.from(q('[data-develop-excerpt="s3"]')!.querySelectorAll('button')).find((b) => b.textContent === 'Read it here')!;
  act(() => (read as HTMLElement).click());
  expect(q('[data-develop-excerpt="s3"]')!.textContent!.length).toBeGreaterThan(400);
});

test('D10 a starter fills the composer with the writer’s own sentence; it never sends', () => {
  const p = mount();
  act(() => Array.from(host.querySelectorAll('[data-develop-starters] button')).find((b) => b.textContent?.startsWith('What is'))!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(p.onStarter).toHaveBeenCalledWith('What is Harbour doing in the book?');
});

test('no chapters read yet: no excerpt section; the work is still the centre', () => {
  mount({ lastRead: null }); expect(q('[data-develop-excerpts]')).toBeNull(); expect(q('[data-develop-chapter]')).not.toBeNull();
});

test('the holdings column says what she read, and says so honestly before the first answer', () => {
  act(() => root.render(React.createElement(DevelopHoldings, { manuscriptId: 'm', workId: 'w', lastRead: null, kind: null, onKind: jest.fn() } as any)));
  expect(q('[data-develop-she-read]')!.textContent).toContain('Nothing yet');
  act(() => root.render(React.createElement(DevelopHoldings, { manuscriptId: 'm', workId: 'w', lastRead: [{ sectionId: 's1', label: 'Harbour' }, { sectionId: 's3', label: 'Return' }], kind: null, onKind: jest.fn() } as any)));
  expect(q('[data-develop-she-read]')!.textContent).toContain('Harbour · Return');
  expect(q('[data-develop-kind]')!.textContent).toContain('What kind of book is this?');
});
