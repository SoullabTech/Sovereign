// @vitest-environment jsdom
/**
 * STUDIO-PANELS-01: resizing and disclosure are presentation only.
 * Collapsing a panel never unmounts its manuscript/MAIA contents.
 */
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { WRITE_GEOMETRY, STATE_GEOMETRY, HOME_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';

const originalWidth = window.innerWidth;
let host: HTMLDivElement;
let root: Root;
const manuscript = createElement('span', { 'data-testid': 'original-manuscript' }, 'Unchanged manuscript text');
const maia = createElement('span', { 'data-testid': 'original-maia' }, 'Existing conversation');
const work = createElement('div', {}, 'Unchanged Work');

beforeEach(async () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1536 });
  // jsdom has no layout engine; give Shell a realistic desktop bounding box.
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    x: 0, y: 0, top: 0, left: 0, right: 1536, bottom: 960,
    width: 1536, height: 960, toJSON: () => ({}),
  }));
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true });
  localStorage.clear();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  localStorage.clear();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
});

async function mount(mode: 'write' | 'develop' | 'review' | 'home' = 'develop', opts?: {
  withMaia?: boolean;
  openMaia?: () => void;
}) {
  const geometry = mode === 'write' ? WRITE_GEOMETRY : mode === 'home' ? HOME_GEOMETRY : STATE_GEOMETRY['develop-manuscript'];
  await act(async () => root.render(createElement(Shell, {
    mode,
    appearance: 'evening',
    geometry,
    manuscript: mode === 'home' ? undefined : manuscript,
    work,
    maia: opts?.withMaia === false || mode === 'home' ? undefined : maia,
    onOpenMaia: opts?.openMaia,
    memberInitial: 'T',
  })));
}

function click(name: string) {
  const el = [...host.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === name);
  expect(el, name).toBeTruthy();
  act(() => el!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

describe('Writer Studio panel layout and content custody', () => {
  it('collapses both sides without remounting the manuscript or MAIA, then reopens them', async () => {
    await mount();
    const source = host.querySelector('[data-testid="original-manuscript"]');
    const conversation = host.querySelector('[data-testid="original-maia"]');
    const shell = host.querySelector<HTMLElement>('.fr-shell')!;
    expect(source).toBeTruthy();
    expect(conversation).toBeTruthy();
    click('Hide manuscript panel');
    expect(shell.dataset.leftOpen).toBe('false');
    expect(shell.style.getPropertyValue('--fr-ms-w')).toBe('0px');
    expect(host.querySelector('[data-testid="original-manuscript"]')).toBe(source);
    click('Show manuscript panel');
    expect(shell.dataset.leftOpen).toBe('true');
    expect(host.querySelector('[data-testid="original-manuscript"]')).toBe(source);
    click('Hide MAIA panel');
    expect(shell.dataset.rightOpen).toBe('false');
    expect(shell.style.getPropertyValue('--fr-maia-w')).toBe('0px');
    expect(host.querySelector('[data-testid="original-maia"]')).toBe(conversation);
    click('Show MAIA panel');
    expect(shell.dataset.rightOpen).toBe('true');
    expect(host.querySelector('[data-testid="original-maia"]')).toBe(conversation);
  });

  it('offers keyboard-operable splitters that move widths and save the layout', async () => {
    await mount('develop');
    const left = host.querySelector<HTMLElement>('[aria-label="Resize manuscript panel"]')!;
    const right = host.querySelector<HTMLElement>('[aria-label="Resize MAIA panel"]')!;
    expect(left.getAttribute('role')).toBe('separator');
    expect(right.getAttribute('role')).toBe('separator');
    const leftBefore = Number(left.getAttribute('aria-valuenow'));
    const rightBefore = Number(right.getAttribute('aria-valuenow'));
    await act(async () => left.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' })));
    await act(async () => right.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' })));
    expect(Number(left.getAttribute('aria-valuenow'))).toBeGreaterThan(leftBefore);
    expect(Number(right.getAttribute('aria-valuenow'))).toBeGreaterThan(rightBefore);
    const saved = JSON.parse(localStorage.getItem('soullab.studio.panel-layout.v1.develop') ?? 'null');
    expect(saved.leftWidth).toBeGreaterThan(leftBefore);
    expect(saved.rightWidth).toBeGreaterThan(rightBefore);
  });

  it('restores a member-selected collapse state without changing content', async () => {
    await mount('develop');
    click('Hide MAIA panel');
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('false');
    await act(async () => root.unmount());
    root = createRoot(host);
    await mount('develop');
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('false');
    expect(host.querySelector('[data-testid="original-maia"]')?.textContent).toBe('Existing conversation');
  });

  it('makes MAIA explicitly openable in Write even before a passage has been selected', async () => {
    const onOpenMaia = vi.fn();
    await mount('write', { withMaia: false, openMaia: onOpenMaia });
    click('Open MAIA panel');
    expect(onOpenMaia).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[aria-label="Resize MAIA panel"]')).toBeNull();
  });

  it('does not add redundant panel controls to the one-room Home experience', async () => {
    await mount('home');
    expect(host.querySelector('.fr-panel-controls')).toBeNull();
    expect(host.querySelectorAll('[role="separator"]').length).toBe(0);
  });
});
