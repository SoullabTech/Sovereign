/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Room from '@/app/dev/writers-studio-pc3-live/IsolatedEditorialRoom';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
let props: React.ComponentProps<typeof Room>;
const words = 'A writer’s unfinished line.\n\nKeep its spacing.  ';
beforeEach(() => {
  sessionStorage.clear(); localStorage.clear();
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  props = { appearance: 'evening', title: 'Synthetic control witness', currentText: 'The chosen passage.',
    sectionBody: 'Before.\n\nThe chosen passage.\n\nAfter.', busy: false, editingLatitude: 1,
    onEditingLatitude: jest.fn(), mayRemoveParagraphs: false, onMayRemoveParagraphs: jest.fn(),
    mayProposeImmediately: false, onMayProposeImmediately: jest.fn(), onClose: jest.fn(),
    children: React.createElement('textarea', { 'aria-label': 'Unfinished writing', defaultValue: words }) };
  act(() => root.render(React.createElement(Room, props)));
});
afterEach(() => { act(() => root.unmount()); host.remove(); });
const menu = (label: string) => [...host.querySelectorAll('details')]
  .find(d => d.querySelector('summary')?.textContent === label)!;
const open = () => [...host.querySelectorAll('details[open]')].map(d => d.querySelector('summary')!.textContent);
const click = (label: string) => act(() => menu(label).querySelector('summary')!.click());

it('opens only the most recently chosen panel and allows all panels to close', () => {
  expect(open()).toEqual([]);
  for (const label of ['Layout', 'Tools', 'Preferences', 'Layout', 'Preferences']) {
    click(label); expect(open()).toEqual([label]);
    expect(menu(label).querySelector('summary')!.getAttribute('aria-expanded')).toBe('true');
  }
  click('Preferences'); expect(open()).toEqual([]);
});
it('Escape retracts the current panel and returns keyboard focus to its heading', () => {
  click('Preferences');
  const field = host.querySelector<HTMLInputElement>('#p4r1-explanation-depth')!; field.focus();
  act(() => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(open()).toEqual([]); expect(document.activeElement).toBe(menu('Preferences').querySelector('summary'));
});
it('outside pointer retracts a panel but interaction inside it does not', () => {
  click('Preferences');
  act(() => host.querySelector('#p4r1-explanation-depth')!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })));
  expect(open()).toEqual(['Preferences']);
  act(() => host.querySelector('textarea')!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })));
  expect(open()).toEqual([]);
});
it('panel switches retain the exact editor instance, draft, chosen layout and authority settings', () => {
  const editor = host.querySelector('textarea')!;
  const before = host.querySelector('blockquote')!.textContent;
  click('Layout');
  act(() => [...menu('Layout').querySelectorAll('button')].find(b => b.textContent?.startsWith('Passage wide'))!.click());
  click('Tools'); click('Preferences'); click('Layout');
  expect(host.querySelector('textarea')).toBe(editor); expect(editor.value).toBe(words);
  expect(host.querySelector('blockquote')!.textContent).toBe(before);
  expect(host.querySelector<HTMLElement>('[data-isolated-editorial]')!.dataset.layout).toBe('passage');
  expect(props.onEditingLatitude).not.toHaveBeenCalled(); expect(props.onMayRemoveParagraphs).not.toHaveBeenCalled();
  expect(props.onMayProposeImmediately).not.toHaveBeenCalled(); expect(props.onClose).not.toHaveBeenCalled();
});
it('Reset view does not reset edit authority or the unfinished wording', () => {
  click('Preferences');
  act(() => [...host.querySelectorAll('button')].find(b => b.textContent === 'Reset view')!.click());
  expect(host.querySelector('textarea')!.value).toBe(words);
  expect(props.onEditingLatitude).not.toHaveBeenCalled(); expect(props.onMayRemoveParagraphs).not.toHaveBeenCalled();
  expect(props.onMayProposeImmediately).not.toHaveBeenCalled(); expect(props.onClose).not.toHaveBeenCalled();
});

it('keyboard resizing describes the actual custom split without changing authorial settings', () => {
  const divider = host.querySelector('.p4r1-isolated-divider')!;
  act(() => divider.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true})));
  expect(host.querySelector<HTMLElement>('[data-isolated-editorial]')!.dataset.layout).toBe('custom');
  expect(divider.getAttribute('aria-valuenow')).toBe('53');
  expect(host.querySelector('.p4r1-isolated-balance')!.textContent).toContain('Custom');
  expect(props.onEditingLatitude).not.toHaveBeenCalled();
});
