/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { StudioModeBar } from '../studio/StudioModeBar';
import { STUDIO_MODES, modeLocation } from '../studioMap';

jest.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams('s=section-1') }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, ...props }: any) => React.createElement('a', props, children) }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, container: HTMLDivElement;
beforeEach(() => {
  window.history.replaceState(null, '', '/?s=section-1');
  container = document.createElement('div'); document.body.append(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
const render = (manuscriptId: string | null) => act(() => root.render(React.createElement(StudioModeBar, { current: 'write', manuscriptId })));

test('future modes disclose a dismissible preview without navigation or capability actions', () => {
  render('manuscript-1');
  for (const mode of STUDIO_MODES.filter(m => m.availability === 'later')) {
    const label = container.querySelector(`[data-mode="${mode.id}"]`)!;
    expect(label.getAttribute('data-state')).toBe('unavailable');
    expect(label.closest('a')).toBeNull();
    const before = window.location.href;
    const trigger = label.closest('button');
    if (mode.preview) {
      expect(trigger).not.toBeNull();
      act(() => trigger!.click());
      const dialog = container.querySelector('[role="dialog"]')!;
      expect(dialog.textContent).toContain('Not yet available');
      expect(dialog.textContent).toContain(mode.preview);
      expect(dialog.querySelector('a')).toBeNull();
      expect(dialog.querySelectorAll('button')).toHaveLength(1);
      act(() => dialog.querySelector<HTMLButtonElement>('button[aria-label="Close preview"]')!.click());
      expect(container.querySelector('[role="dialog"]')).toBeNull();
    } else {
      expect(trigger).toBeNull();
    }
    expect(window.location.href).toBe(before);
  }
});

test('only a built inactive room links, preserving manuscript and section', () => {
  render('manuscript-1');
  const develop = STUDIO_MODES.find(m => m.id === 'develop')!;
  expect(container.querySelector('[data-mode="develop"]')!.closest('a')!.getAttribute('href'))
    .toBe(modeLocation(develop.href!, 'manuscript-1', 'section-1'));
  expect(container.querySelector('[data-mode="write"]')!.closest('a, button')).toBeNull();
  expect(container.querySelectorAll('a')).toHaveLength(1);
});

test('a built room without manuscript identity cannot navigate', () => {
  render(null);
  const develop = container.querySelector('[data-mode="develop"]')!;
  expect(develop.getAttribute('data-state')).toBe('needs-work');
  expect(develop.closest('a, button')).toBeNull();
  expect(container.querySelectorAll('a')).toHaveLength(0);
});
