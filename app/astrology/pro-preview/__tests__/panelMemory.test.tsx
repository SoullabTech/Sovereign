/** @jest-environment jsdom */
/**
 * Pro panels keep their place for the open chart: a value comes back when the
 * panel remounts under the same scope, is gone under a new or ended scope, and
 * a panel mounted under an ended scope cannot write into the new one.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { PanelMemoryProvider, usePanelState } from '../panelMemory';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
let setFromPanel: (v: string) => void;

function Panel() {
  const [value, setValue] = usePanelState('test.value', 'start');
  setFromPanel = setValue;
  return React.createElement('output', null, value);
}

function render(scope: string | null, shown: boolean) {
  act(() => root.render(React.createElement(PanelMemoryProvider, { scope }, shown ? React.createElement(Panel) : null)));
}
const shown = () => container.querySelector('output')?.textContent;

beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

describe('panel memory', () => {
  it('returns a panel to its place when it remounts for the same chart', () => {
    render('member|7', true);
    act(() => setFromPanel('progressed 2030'));
    render('member|7', false);
    render('member|7', true);
    expect(shown()).toBe('progressed 2030');
  });

  it('forgets everything when the chart closes or changes', () => {
    render('member|7', true);
    act(() => setFromPanel('progressed 2030'));
    render(null, false);
    render('member|8', true);
    expect(shown()).toBe('start');
  });

  it('drops a write from a panel mounted before the chart changed', () => {
    render('member|7', true);
    render('member|8', true); // the same panel instance, still mounted, now under a new chart
    act(() => setFromPanel('stale result')); // e.g. a reply that was still in flight
    render('member|8', false);
    render('member|8', true);
    expect(shown()).toBe('start');
  });
});
