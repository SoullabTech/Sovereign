// @vitest-environment jsdom
/**
 * STUDIO-PANELS-01: resizing and disclosure are presentation only.
 * Collapsing a panel never unmounts its manuscript/MAIA contents.
 */
import { act, createElement, type ReactNode } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/writers-studio',
}));

import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { WriteMaiaUnlinked } from '@/app/dev/writers-studio-pc3-live/WriteMaiaUnlinked';
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
  initiallyExpanded?: boolean;
  reveal?: string | null;
  initialReveal?: string | null;
  maiaNode?: ReactNode;
}) {
  const geometry = mode === 'write' ? { ...WRITE_GEOMETRY, maiaWidth: 360, maiaFloor: 300, padRight: 9, gapRight: 13 } : mode === 'home' ? HOME_GEOMETRY : STATE_GEOMETRY['develop-manuscript'];
  await act(async () => root.render(createElement(Shell, {
    mode,
    appearance: 'evening',
    geometry,
    manuscript: mode === 'home' ? undefined : manuscript,
    work,
    maia: opts?.withMaia === false || mode === 'home' ? undefined : (opts?.maiaNode ?? maia),
    maiaInitiallyExpanded: opts?.initiallyExpanded,
    maiaRevealRequest: opts?.reveal,
    maiaInitialRevealRequest: opts?.initialReveal,
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
  it('does not display an inert avatar or three-dot menu in the Studio header', async () => {
    await mount('write');
    expect(host.querySelector('.fr-avatar')).toBeNull();
    expect(host.querySelector('.fr-more')).toBeNull();
    expect(host.querySelector('.fr-brand')).toBeTruthy();
    expect(host.querySelector('.fr-work')).toBeTruthy();
    expect(host.querySelector('[data-studio-topbar-accessories]')).toBeTruthy();
  });

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


describe('Write panel regression: presentation is not conversation authority', () => {
  const key = (mode: string) => 'soullab.studio.panel-layout.v1.' + mode;
  const geometry = { leftExpanded: true, rightExpanded: true, leftWidth: 325, rightWidth: 410 };

  it('restores an explicitly opened Write panel and both widths after a full remount', async () => {
    await mount('write', { initiallyExpanded: false });
    expect(host.querySelector('.fr-maia')?.getAttribute('aria-hidden')).toBe('true');
    const content = host.querySelector('[data-testid="original-maia"]');
    click('Show MAIA panel');
    const right = host.querySelector<HTMLElement>('[aria-label="Resize MAIA panel"]')!;
    await act(async () => right.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' })));
    const remembered = right.getAttribute('aria-valuenow');
    expect(host.querySelector('[data-testid="original-maia"]')).toBe(content);
    await act(async () => root.unmount());
    root = createRoot(host);
    await mount('write', { initiallyExpanded: false });
    expect(host.querySelector('.fr-maia')?.getAttribute('aria-hidden')).toBe('false');
    expect(host.querySelector('[aria-label="Resize MAIA panel"]')?.getAttribute('aria-valuenow')).toBe(remembered);
  });

  it('restores a deliberately collapsed Write panel rather than reopening it', async () => {
    localStorage.setItem(key('write'), JSON.stringify(geometry));
    await mount('write', { initiallyExpanded: false });
    click('Hide MAIA panel');
    await act(async () => root.unmount()); root = createRoot(host);
    await mount('write', { initiallyExpanded: false });
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('false');
    expect(JSON.parse(localStorage.getItem(key('write'))!).rightWidth).toBe(410);
  });

  it('keeps each mode preference intact during a Write-Develop-Review-Write switch', async () => {
    const variants = {
      write: { ...geometry, rightExpanded: false, rightWidth: 415 },
      develop: { ...geometry, leftWidth: 285, rightWidth: 385 },
      review: { ...geometry, leftExpanded: false, rightWidth: 350 },
    };
    for (const [mode,value] of Object.entries(variants))localStorage.setItem(key(mode),JSON.stringify(value));
    for (const mode of ['write','develop','review','write'] as const) {
      await mount(mode, { initiallyExpanded: mode !== 'write' });
      expect(JSON.parse(localStorage.getItem(key(mode))!)).toEqual(variants[mode]);
    }
  });

  it('handles malformed preferences without treating them as authority or losing controls', async () => {
    localStorage.setItem(key('write'), '{not-valid-json');
    await mount('write', { initiallyExpanded: false });
    click('Show MAIA panel');
    expect(host.querySelector('[aria-label="Resize MAIA panel"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="original-manuscript"]')?.textContent).toBe('Unchanged manuscript text');
  });

  it('remains usable when browser preference storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage blocked'); });
    await mount('write', { initiallyExpanded: false });
    click('Show MAIA panel');click('Hide MAIA panel');click('Show MAIA panel');
    expect(host.querySelector('.fr-maia')?.getAttribute('aria-hidden')).toBe('false');
  });

  it('gives an unresolved manuscript a real panel and explicit Home action without writes', async () => {
    const choose = vi.fn(); const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await mount('write', { initiallyExpanded: false, maiaNode: createElement(WriteMaiaUnlinked, { onChooseWork: choose }) });
    click('Show MAIA panel');
    expect(host.querySelector('[data-write-maia-unlinked]')).not.toBeNull();
    expect(host.querySelector('[aria-label="Resize MAIA panel"]')).not.toBeNull();
    expect(choose).not.toHaveBeenCalled();expect(fetchSpy).not.toHaveBeenCalled();
    const button=[...host.querySelectorAll('button')].find(b=>b.textContent==='Choose a Work in Home');
    expect(button).toBeTruthy();
    act(()=>button!.click());
    expect(choose).toHaveBeenCalledTimes(1);expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps the production Write MAIA slot mounted independently of selections and conversation state', () => {
    const code=readFileSync(resolve(process.cwd(),'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),'utf8');
    expect(code).toContain('maia={writeMaia}');
    expect(code).toContain('geometry={WRITE_RELATIONAL_GEOMETRY}');
    expect(code).toContain('maiaInitiallyExpanded={false}');
    expect(code).toContain("<WriteMaiaUnlinked onChooseWork={() => props.onMode('home')} />");
    expect(code).not.toContain('maia={railSelectionId || workConversationOpen ?');
  });
});


describe('Addressed editorial work reveals the same resizable MAIA region', () => {
  it('retains deliberate collapse when an addressed thread arrives asynchronously after reload', async () => {
    localStorage.setItem('soullab.studio.panel-layout.v1.write', JSON.stringify({leftExpanded:true,rightExpanded:false,leftWidth:360,rightWidth:400}));
    await mount('write', { initiallyExpanded:false, initialReveal:'owned-thread', reveal:null });
    await mount('write', { initiallyExpanded:false, initialReveal:'owned-thread', reveal:'owned-thread' });
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('false');
    click('Show MAIA panel');
    expect(host.querySelector('[aria-label="Resize MAIA panel"]')?.getAttribute('aria-valuenow')).toBe('400');
    click('Hide MAIA panel');
    await mount('write', { initiallyExpanded:false, initialReveal:'owned-thread', reveal:null });
    await mount('write', { initiallyExpanded:false, initialReveal:'owned-thread', reveal:'owned-thread' });
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('true');
  });

  it('shows a newly addressed editor by default without overwriting a deliberately collapsed reload', async () => {
    await mount('write', { initiallyExpanded: false, reveal: 'thread-one' });
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('true');
    click('Hide MAIA panel');
    await act(async () => root.unmount()); root = createRoot(host);
    await mount('write', { initiallyExpanded: false, reveal: 'thread-one' });
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('false');
    click('Show MAIA panel');
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('true');
  });

  it('reveals a requested editorial workspace once and respects subsequent collapse', async () => {
    await mount('write', { initiallyExpanded: false });
    const source = host.querySelector('[data-testid="original-manuscript"]');
    await mount('write', { initiallyExpanded: false, reveal: 'thread-one' });
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('true');
    expect(host.querySelector('[data-testid="original-manuscript"]')).toBe(source);
    click('Hide MAIA panel');
    await mount('write', { initiallyExpanded: false, reveal: 'thread-one' });
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('false');
    await mount('write', { initiallyExpanded: false, reveal: 'thread-two' });
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('true');
  });

  it('allows a closed editorial workspace to be explicitly opened again', async () => {
    await mount('write', { initiallyExpanded: false, reveal: 'thread-one' });
    click('Hide MAIA panel');
    await mount('write', { initiallyExpanded: false, reveal: null });
    await mount('write', { initiallyExpanded: false, reveal: 'thread-one' });
    expect(host.querySelector('.fr-shell')?.getAttribute('data-right-open')).toBe('true');
  });

  it('mounts resumed editorial content only inside the Shell-themed right region', () => {
    const code = readFileSync(resolve(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'), 'utf8');
    const rail = code.slice(code.indexOf('  const writeMaia ='), code.indexOf('  const blankArrival ='));
    expect(rail).toContain('props.work || editorial');
    expect(rail).toContain('{editorial ??');
    expect(code).not.toContain('{contextualActions}\n          {editorial}');
    expect(code).toContain('maiaRevealRequest=');
  });
});
