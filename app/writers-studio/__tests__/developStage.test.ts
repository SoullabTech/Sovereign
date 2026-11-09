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
  const props = { workTitle: 'The Long Harbour', sections, currentId: 's1', onSelect: jest.fn(), starters: ['What is Harbour doing in the book?'], onStarter: jest.fn(), onOpenWrite: jest.fn(), onMoreWays: jest.fn(), lastRead: null, plan: null, planBusy: false, planNote: null, onMakePlan: jest.fn(), onEditPlan: jest.fn(), onWorkOnStep: jest.fn(), conversation: React.createElement('div', { 'data-fake-convo': true }, 'convo'), ...over };
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

const step = (id: string, over: Record<string, unknown> = {}) => ({ id, chapterId: 's2', anchor: 'nothing was said of the lantern', direction: 'Bring the lantern back in Return.', why: 'It pays off an earlier silence.', status: 'open', ...over });
const planOf = (steps: unknown[]) => ({ plan: { id: 'p1', summary: 'Connect Return to Salt.', ask: 'connect Return to Salt', steps, basis: [] } as any, staleStepIds: [] as string[] });

test('M4 a plan is asked for in the writer’s own words, and never sends itself', () => {
  const p = mount();
  act(() => q('[data-develop-plan-start]')!.click());
  const input = q('#develop-plan-ask') as HTMLInputElement;
  const make = Array.from(host.querySelectorAll('[data-develop-plan] button')).find((b) => /Make a plan/.test(b.textContent ?? '')) as HTMLButtonElement;
  expect(make.disabled).toBe(true);                       // empty ask: nothing to send
  expect(p.onMakePlan).not.toHaveBeenCalled();
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => { set.call(input, 'connect Return to Salt'); input.dispatchEvent(new Event('input', { bubbles: true })); });
  act(() => (Array.from(host.querySelectorAll('[data-develop-plan] button')).find((b) => /Make a plan/.test(b.textContent ?? '')) as HTMLElement).click());
  expect(p.onMakePlan).toHaveBeenCalledWith('connect Return to Salt');
});

test('M4 a step shows the writer’s manuscript passage as its anchor, in the writer’s own words, and says nothing changes the work', () => {
  mount({ plan: planOf([step('a')]) });
  const el = q('[data-develop-plan-step="a"]')!;
  expect(el.textContent).toContain('nothing was said of the lantern');
  expect(el.textContent).toContain('Bring the lantern back in Return.');
  expect(q('[data-develop-plan]')!.textContent).toMatch(/Nothing here changes your work/);
});

test('M4 editing a step sends only wording, status, or removal; the anchor has no control at all', () => {
  const p = mount({ plan: planOf([step('a')]) });
  const sel = q('[data-develop-plan-step="a"] select') as HTMLSelectElement;
  const setSel = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!;
  act(() => { setSel.call(sel, 'working'); sel.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(p.onEditPlan).toHaveBeenCalledWith([{ id: 'a', status: 'working' }]);
  const rm = Array.from(host.querySelectorAll('[data-develop-plan-step="a"] button')).find((b) => b.textContent === 'Remove') as HTMLElement;
  act(() => rm.click());
  expect(p.onEditPlan).toHaveBeenLastCalledWith([{ id: 'a', remove: true }]);
  const editable = host.querySelectorAll('[data-develop-plan-step="a"] textarea, [data-develop-plan-step="a"] input');
  expect(editable.length).toBe(1);                         // the direction only
});

test('M4 a step whose chapter has changed says so, and the unchanged one does not', () => {
  mount({ plan: { ...planOf([step('a'), step('b', { chapterId: 's3', anchor: 'She lost the key' })]), staleStepIds: ['b'] } });
  expect(q('[data-develop-plan-step="a"]')!.textContent).not.toMatch(/has changed since the plan was made/);
  expect(q('[data-develop-plan-step="b"]')!.textContent).toMatch(/has changed since the plan was made/);
});

test('M4 a plan with no grounded step says so plainly instead of inventing one', () => {
  mount({ plan: planOf([]) });
  expect(q('[data-develop-plan]')!.textContent).toMatch(/could not ground a step in your text/);
});

test('M4b “Work on this passage” hands over the step id only; it changes nothing by itself', () => {
  const p = mount({ plan: planOf([step('a')]) });
  const b = q('[data-develop-plan-work="a"]') as HTMLElement;
  expect(b.textContent).toBe('Work on this passage');
  act(() => b.click());
  expect(p.onWorkOnStep).toHaveBeenCalledWith('a');
  expect(p.onEditPlan).not.toHaveBeenCalled();             // the stage itself edits nothing
});

test('M4c applied and resolved stay separate: an applied change is shown as an event, and the step is not called resolved', () => {
  mount({ plan: { ...planOf([step('a', { status: 'working' })]), events: { a: { state: 'applied', at: '2026-11-09T10:00:00Z', applications: 1 } } } });
  const el = q('[data-develop-plan-step="a"]')!;
  expect(q('[data-develop-plan-event="applied"]')!.textContent).toMatch(/applied a change here in the passage desk/);
  expect(el.textContent).toMatch(/Whether that resolves the step is yours to say/);
  expect((el.querySelector('select') as HTMLSelectElement).value).toBe('working');
});

test('M4c an undone change reads as undone; a resolved step with no edit shows no event at all', () => {
  mount({ plan: { ...planOf([step('a'), step('b', { status: 'done' })]), events: { a: { state: 'undone', at: '2026-11-09T10:00:00Z', applications: 1 } } } });
  expect(q('[data-develop-plan-step="a"]')!.textContent).toMatch(/then undid it/);
  expect(q('[data-develop-plan-step="b"] [data-develop-plan-event]')).toBeNull();
  expect(Array.from((q('[data-develop-plan-step="b"] select') as HTMLSelectElement).options).find((o) => o.selected)!.textContent).toBe('Resolved');
});

test('M4c a step MAIA cannot verify says so', () => {
  mount({ plan: { ...planOf([step('a')]), unverifiedStepIds: ['a'] } });
  expect(q('[data-develop-plan-step="a"]')!.textContent).toMatch(/can’t confirm this chapter is the one MAIA read/);
});
