/** @jest-environment jsdom */
/**
 * Founder request 2026-11-07: a Soul Portrait from Pro is written inside Pro,
 * from the chart Pro already holds — the separate form asked again for it.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ProSoulPortraitPanel, { ageOn } from '../ProSoulPortraitPanel';

jest.mock('../pro-saved-charts.module.css', () => ({}), { virtual: true });

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
const fetchMock = jest.fn();

function render(props: Partial<React.ComponentProps<typeof ProSoulPortraitPanel>> = {}) {
  act(() => root.render(React.createElement(ProSoulPortraitPanel, {
    source: 'chart-1', label: 'Example Client', chartLine: 'Example Client · 1990-06-15 · 23:30',
    birthDate: '1990-06-15', onClose: () => {}, ...props,
  })));
}
const button = (text: string) =>
  Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.startsWith(text)) as HTMLButtonElement;
const minorBox = () => container.querySelector('input[type="checkbox"]') as HTMLInputElement;

beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

describe('Soul Portrait inside Pro', () => {
  it('works out age from the birth date', () => {
    expect(ageOn('1990-06-15', new Date(2026, 10, 7))).toBe(36);
    expect(ageOn('2010-11-08', new Date(2026, 10, 7))).toBe(15);
    expect(ageOn('not a date')).toBeNull();
  });

  it('shows the chart Pro holds and prefills the name and age, asking for no birth details', () => {
    render();
    expect(container.textContent).toContain('Example Client · 1990-06-15 · 23:30');
    const inputs = Array.from(container.querySelectorAll('input:not([type="checkbox"])')) as HTMLInputElement[];
    expect(inputs[0].value).toBe('Example Client');
    expect(inputs[1].value).toBe(String(ageOn('1990-06-15')));
    expect(container.querySelector('input[type="date"], input[type="time"]')).toBeNull();
    expect(minorBox().checked).toBe(false);
  });

  it('always writes an under-18 subject as a minor', () => {
    render({ birthDate: `${new Date().getFullYear() - 10}-01-01` });
    expect(minorBox().checked).toBe(true);
    expect(minorBox().disabled).toBe(true);
  });

  it('sends the chart by id only and offers the private draft without leaving Pro', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ previewUrl: '/soul-portrait/preview/abc' }) });
    render();
    await act(async () => { button('Write draft').click(); });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.proChartSource).toBe('chart-1');
    expect(body.birthData).toBeUndefined();
    expect(body).toMatchObject({ name: 'Example Client', mode: 'gift', isMinor: false });
    const draft = container.querySelector('a') as HTMLAnchorElement;
    expect(draft.textContent).toBe('Open draft');
    expect(draft.getAttribute('href')).toBe('/soul-portrait/preview/abc');
    expect(draft.target).toBe('_blank');
  });

  it('sends nothing without a name', () => {
    render({ label: '' });
    expect(button('Write draft').disabled).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
