/** @jest-environment jsdom */
/**
 * Independent review 2026-11-06: re-checking access unmounted the Other
 * systems panel and reset its tab, results and luck direction; and a late
 * reply could show results for options the astrologer had since changed.
 * The working place is held by the page, and only the latest request settles.
 */
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { calculateFourPillars } from '@/lib/astrology/proFourPillars';
import { buildChineseReading } from '@/lib/astrology/chineseReading';
import { daYunByDirection } from '@/lib/astrology/proDaYun';
import { apiFetch } from '@/lib/http/apiBase';
import ProSystemsPanel, { type SystemsWork } from '../ProSystemsPanel';

jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
jest.mock('@/components/astrology/NakshatraCard', () => () => null);
jest.mock('@/components/astrology/DashaTimeline', () => () => null);
jest.mock('../pro-systems-panel.module.css', () => ({}), { virtual: true });
jest.mock('../pro-four-pillars.module.css', () => ({}), { virtual: true });
jest.mock('../pro-ask-maia.module.css', () => ({}), { virtual: true });

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function systems(dayMasterDate: string) {
  const fourPillars = calculateFourPillars(new Date(dayMasterDate + 'T12:00:00Z'), dayMasterDate, '12:00');
  return {
    vedic: { grahas: [] }, mayan: { pathOfLife: [] },
    chinese: {
      fourPillars, characteristics: [], compatibility: [], incompatible: [],
      reading: buildChineseReading(1990),
      daYun: daYunByDirection(new Date(dayMasterDate + 'T12:00:00Z'), 0, '12:00'),
    },
  };
}

/** A reply the test releases when it chooses. */
function deferredReply() {
  let release!: (body: unknown) => void;
  const promise = new Promise((resolve) => {
    release = (body) => resolve({ ok: true, status: 200, json: async () => body });
  });
  return { promise, release };
}

let root: Root;
let container: HTMLDivElement;
let setShown: (v: boolean) => void;
let setWork: React.Dispatch<React.SetStateAction<SystemsWork | null>>;

function Page() {
  const [shown, show] = useState(true);
  const [work, update] = useState<SystemsWork | null>(null);
  setShown = show;
  setWork = update;
  return shown
    ? React.createElement(ProSystemsPanel, { subjectId: 'own', chartLabel: 'my chart', work, onWork: update })
    : null;
}

const button = (text: string) =>
  Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.startsWith(text)) as HTMLButtonElement;
const dayMaster = () => container.textContent?.match(/Day Master (\S)/)?.[1];

beforeEach(() => {
  jest.mocked(apiFetch).mockReset();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(React.createElement(Page)));
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

describe('Other systems working place', () => {
  it('comes back as the astrologer left it after the panel is unmounted for an access check', async () => {
    jest.mocked(apiFetch).mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: systems('1949-10-01') }) } as never);
    act(() => button('Chinese').click());
    await act(async () => { button('Show').click(); });
    const backward = container.querySelectorAll('input[name="luck-direction"]')[1] as HTMLInputElement;
    act(() => backward.click());

    act(() => setShown(false)); // the access check masks the chart
    act(() => setShown(true)); // and it succeeds

    expect(container.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe('Chinese');
    expect(dayMaster()).toBe('甲');
    expect((container.querySelectorAll('input[name="luck-direction"]')[1] as HTMLInputElement).checked).toBe(true);
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('drops a late reply that a newer request has superseded', async () => {
    const first = deferredReply();
    const second = deferredReply();
    jest.mocked(apiFetch).mockReturnValueOnce(first.promise as never).mockReturnValueOnce(second.promise as never);
    act(() => button('Chinese').click());
    await act(async () => { button('Show').click(); });
    act(() => setShown(false));
    act(() => setShown(true));
    await act(async () => { button('Show').click(); });

    await act(async () => { second.release({ data: systems('2000-01-01') }); });
    expect(dayMaster()).toBe('戊');
    await act(async () => { first.release({ data: systems('1949-10-01') }); });
    expect(dayMaster()).toBe('戊'); // the superseded reply is not shown
  });

  it('drops a reply that arrives after the chart was closed', async () => {
    const reply = deferredReply();
    jest.mocked(apiFetch).mockReturnValueOnce(reply.promise as never);
    act(() => button('Chinese').click());
    await act(async () => { button('Show').click(); });
    act(() => setWork(null)); // closing the chart clears its working place
    await act(async () => { reply.release({ data: systems('1949-10-01') }); });
    expect(dayMaster()).toBeUndefined();
    expect(button('Show')).toBeTruthy();
  });
});
