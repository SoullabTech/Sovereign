/** @jest-environment jsdom */
/**
 * Fictional real-React Studio reading preference witness.
 * Preference is presentation-only and device-local, never manuscript text.
 */
import { act, createElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('mode=write'),
  usePathname: () => '/writers-studio',
}));
jest.mock('@/lib/cabin/doorway', () => ({
  isCabinOrigin: () => false,
  cabinReturnPath: () => '/cabin',
}));
import { Shell } from '../Shell';
import { WRITE_GEOMETRY } from '../tokens';
import IsolatedEditorialRoom from '@/app/dev/writers-studio-pc3-live/IsolatedEditorialRoom';
import {
  readSavedStudioReadingSize,
  STUDIO_READING_SIZE_KEY,
  STUDIO_READING_SIZE_EVENT,
} from '@/lib/writersStudio/readingSizePreference';

let host: HTMLDivElement;
let root: Root;
let mounts = 0;
let unmounts = 0;
const fictionalPassage = 'The fictional lighthouse has one lamp.';

function RealIsolatedWork() {
  useEffect(() => { mounts++; return () => { unmounts++; }; }, []);
  return createElement(
    IsolatedEditorialRoom, {
      appearance: 'day', title: 'Fictional passage',
      currentText: fictionalPassage,
      sectionBody: 'Before.\n\n' + fictionalPassage + '\n\nAfter.',
      busy: false, editingLatitude: 1,
      onEditingLatitude: jest.fn(),
      mayRemoveParagraphs: false, onMayRemoveParagraphs: jest.fn(),
      mayProposeImmediately: false, onMayProposeImmediately: jest.fn(),
      onClose: jest.fn(),
      children: createElement('p', { 'data-fictional-exact-words': 'true' }, fictionalPassage),
    },
  );
}
function renderStudio() {
  act(() => root.render(createElement(Shell, {
    mode: 'write', appearance: 'day',
    geometry: { ...WRITE_GEOMETRY, manuscriptWidth: 300, maiaWidth: 355 },
    memberInitial: 'F',
    manuscript: createElement('p', null, 'Fictional outline'),
    work: createElement(RealIsolatedWork),
    maia: createElement('p', null, 'Fictional MAIA'),
  })));
}
function shell() { return host.querySelector<HTMLElement>('.fr-shell')!; }
function room() { return host.querySelector<HTMLElement>('[data-isolated-editorial]')!; }
function chooseShell(size: string) {
  const select = host.querySelector<HTMLSelectElement>('[aria-label="Studio reading size"]')!;
  expect(select).toBeTruthy();
  act(() => {
    select.value = size;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
function chooseIsolated(size: string) {
  const input = host.querySelector<HTMLInputElement>(
    'input[name="isolated-reading-size"][value="' + size + '"]',
  )!;
  expect(input).toBeTruthy();
  act(() => input.click());
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  window.localStorage.clear();
  window.sessionStorage.clear();
  mounts = 0; unmounts = 0;
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe('Studio-wide reading size, author-owned presentation only', () => {
  it('synchronizes Shell and isolated editorial room without changing or remounting text', () => {
    renderStudio();
    const authored = host.querySelector('[data-fictional-exact-words]');
    expect(shell().dataset.studioReadingSize).toBe('large');
    expect(room().dataset.readingSize).toBe('large');
    expect(mounts).toBe(1);

    chooseShell('largest');
    expect(shell().dataset.studioReadingSize).toBe('largest');
    expect(room().dataset.readingSize).toBe('largest');
    expect(readSavedStudioReadingSize()).toBe('largest');
    expect(host.querySelector('[data-fictional-exact-words]')).toBe(authored);
    expect(authored?.textContent).toBe(fictionalPassage);
    expect(unmounts).toBe(0);

    chooseIsolated('larger');
    expect(shell().dataset.studioReadingSize).toBe('larger');
    expect(room().dataset.readingSize).toBe('larger');
    expect(localStorage.getItem(STUDIO_READING_SIZE_KEY)).toBe('larger');
    expect(authored?.textContent).toBe(fictionalPassage);
  });

  it('restores the same preference after closing and reopening the Studio', () => {
    renderStudio();
    chooseShell('largest');
    act(() => root.unmount());
    root = createRoot(host);
    renderStudio();
    expect(shell().dataset.studioReadingSize).toBe('largest');
    expect(room().dataset.readingSize).toBe('largest');
    expect(host.textContent).toContain(fictionalPassage);
  });

  it('rejects unsupported stored values and unrelated cross-tab changes', () => {
    localStorage.setItem(STUDIO_READING_SIZE_KEY, 'not-a-size');
    expect(readSavedStudioReadingSize()).toBeNull();
    renderStudio();
    expect(shell().dataset.studioReadingSize).toBe('large');
    act(() => window.dispatchEvent(new StorageEvent('storage', {
      key: 'unrelated-pref', newValue: 'largest',
    })));
    expect(shell().dataset.studioReadingSize).toBe('large');
    act(() => window.dispatchEvent(new StorageEvent('storage', {
      key: STUDIO_READING_SIZE_KEY, newValue: 'larger',
    })));
    expect(shell().dataset.studioReadingSize).toBe('larger');
  });

  it('ignores forged same-tab preference events', () => {
    renderStudio();
    act(() => window.dispatchEvent(new CustomEvent(STUDIO_READING_SIZE_EVENT, {
      detail: 'untrusted-size',
    })));
    expect(shell().dataset.studioReadingSize).toBe('large');
    expect(room().dataset.readingSize).toBe('large');
  });
});
