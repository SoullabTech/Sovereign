/** @jest-environment jsdom */
/**
 * R41 source-only pointer gesture regression.
 * The real Shell handlers are invoked through React's event delegation.
 * JSDOM has no pointer capture/layout, so both are explicitly simulated.
 * This is not a physical Chrome/WebKit drag witness.
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

const geometry = {
  ...WRITE_GEOMETRY,
  manuscriptWidth: 300, manuscriptFloor: 176,
  maiaWidth: 355, maiaFloor: 250,
  gapLeft: 12, gapRight: 12, padLeft: 12, padRight: 12,
};
let host: HTMLDivElement;
let root: Root;
let mounted = 0;
let unmounted = 0;
const captured = new WeakMap<HTMLElement, number>();

function FictionalWork() {
  useEffect(() => { mounted++; return () => { unmounted++; }; }, []);
  return createElement('article', { 'data-fictional-original-work': 'true' },
    'Fictional lighthouse manuscript');
}

function emitPointer(node: HTMLElement, type: string, clientX: number, pointerId = 7) {
  const event = new MouseEvent(type, {
    bubbles: true, cancelable: true, button: 0, clientX,
  });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  act(() => { node.dispatchEvent(event); });
}

function split(which: 'left' | 'right') {
  const node = host.querySelector<HTMLElement>('.fr-panel-splitter-' + which);
  expect(node).not.toBeNull();
  return node!;
}
function width(which: 'left' | 'right') {
  return Number(split(which).getAttribute('aria-valuenow'));
}
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  mounted = 0;
  unmounted = 0;
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(createElement(Shell, {
    mode: 'write', appearance: 'day', geometry,
    memberInitial: 'F', work: createElement(FictionalWork),
    manuscript: createElement('p', null, 'Fictional manuscript outline'),
    maia: createElement('p', null, 'Fictional MAIA response'),
  })));
  const shell = host.querySelector<HTMLElement>('.fr-shell')!;
  shell.getBoundingClientRect = () => ({ width: 1440 } as DOMRect);
  for (const which of ['left', 'right'] as const) {
    const node = split(which);
    node.setPointerCapture = (id: number) => { captured.set(node, id); };
    node.hasPointerCapture = (id: number) => captured.get(node) === id;
    node.releasePointerCapture = (id: number) => {
      if (captured.get(node) === id) captured.delete(node);
    };
  }
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe('R41 real Shell pointer resize without remount', () => {
  it('drags both panels in opposite directions; keeps exact Work DOM and save widths', () => {
    const paper = host.querySelector('[data-fictional-original-work]');
    expect(width('left')).toBe(300);
    expect(width('right')).toBe(355);

    const left = split('left');
    emitPointer(left, 'pointerdown', 300);
    emitPointer(left, 'pointermove', 372);
    emitPointer(left, 'pointerup', 372);
    expect(width('left')).toBe(372);

    const right = split('right');
    emitPointer(right, 'pointerdown', 1000);
    emitPointer(right, 'pointermove', 948);
    emitPointer(right, 'pointerup', 948);
    expect(width('right')).toBe(407);

    expect(host.querySelector('[data-fictional-original-work]')).toBe(paper);
    expect(mounted).toBe(1);
    expect(unmounted).toBe(0);
    expect(JSON.parse(localStorage.getItem('soullab.studio.panel-layout.v1.write')!))
      .toMatchObject({ leftWidth: 372, rightWidth: 407 });
  });
  it('releases pointer capture and ignores subsequent stray movement', () => {
    const left = split('left');
    emitPointer(left, 'pointerdown', 300);
    emitPointer(left, 'pointermove', 330);
    emitPointer(left, 'pointerup', 330);
    expect(width('left')).toBe(330);
    expect(left.hasPointerCapture(7)).toBe(false);
    emitPointer(left, 'pointermove', 420);
    expect(width('left')).toBe(330);
  });
  it('restores original widths without dropping Work on Reset', () => {
    const right = split('right');
    emitPointer(right, 'pointerdown', 1000);
    emitPointer(right, 'pointermove', 922);
    emitPointer(right, 'pointerup', 922);
    expect(width('right')).toBe(433);
    const paper = host.querySelector('[data-fictional-original-work]');
    act(() => host.querySelector<HTMLButtonElement>('[data-r41-reset-column-widths]')!.click());
    expect(width('left')).toBe(300);
    expect(width('right')).toBe(355);
    expect(host.querySelector('[data-fictional-original-work]')).toBe(paper);
    expect(unmounted).toBe(0);
  });
});
