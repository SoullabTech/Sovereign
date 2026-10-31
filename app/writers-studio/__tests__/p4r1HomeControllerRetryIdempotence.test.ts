/**
 * F6 (#1800): a retry after a failed second step must not create a second Work.
 * Mounts the real P4R1HomeController; hooks, router and network are fictional doubles.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const mockApiFetch = jest.fn();
let viewProps: any = null;

jest.mock('next/navigation', () => {
  const params = new URLSearchParams('');
  const router = { push: jest.fn() };
  return { usePathname: () => '/dev/writers-studio-p4r1', useRouter: () => router, useSearchParams: () => params };
});
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: (...a: unknown[]) => mockApiFetch(...a) }));
jest.mock('@/app/writers-studio/atmosphere/StudioAtmosphere', () => ({ useAtmosphere: () => ({ id: 'night' }) }));
jest.mock('@/app/writers-studio/useLivingWorks', () => ({
  useLivingWorks: () => ({ phase: 'ready', works: [], reload: async () => undefined }),
}));
jest.mock('@/app/writers-studio/useCurrentManuscript', () => ({
  useCurrentManuscript: () => ({ phase: 'ready', manuscripts: [], reload: async () => undefined }),
}));
jest.mock('@/app/writers-studio/useMarkedLines', () => ({ useMarkedLines: () => ({ lines: [] }) }));
jest.mock('@/app/writers-studio/useStudioHistory', () => ({ useStudioHistory: () => ({ acts: [] }) }));
jest.mock('@/app/writers-studio/useSectionActivity', () => ({ useSectionActivity: () => null }));
jest.mock('@/app/writers-studio/useHouseStudioH1WorkClaim', () => ({
  useHouseStudioH1WorkClaim: () => jest.requireActual('@/app/writers-studio/h1Arrival').H1_UNRESOLVED,
}));
jest.mock('@/lib/writersStudio/useWriterReleaseCapabilities', () => ({
  useWriterReleaseCapabilities: () => ({ settled: true, eligible: false, authority: {} }),
}));
jest.mock('@/app/writers-studio/full-redesign/Shell', () => ({ Shell: () => null }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1WorkArrival', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1ImportManuscript', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1HomeView', () => ({
  __esModule: true,
  default: (props: unknown) => { viewProps = props; return null; },
}));

import P4R1HomeController from '@/app/dev/writers-studio-pc3-live/P4R1HomeController';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
let workCounter: number;
let failNext: Set<string>;

function reply(ok: boolean, body: unknown, status = ok ? 200 : 500) {
  return { ok, status, json: async () => body };
}
const calls = (suffix: string) =>
  mockApiFetch.mock.calls.filter(([url]) => String(url).endsWith(suffix));

beforeEach(() => {
  workCounter = 0;
  failNext = new Set();
  viewProps = null;
  mockApiFetch.mockReset();
  mockApiFetch.mockImplementation(async (url: string) => {
    const u = String(url);
    if (u === '/api/sovereign/living-works') return reply(true, { id: 'fictional-work-' + (++workCounter) });
    const key = u.endsWith('/expressions') ? 'expressions' : u.endsWith('/start-writing') ? 'start' : '';
    if (key && failNext.delete(key)) return reply(false, {});
    if (key === 'start') return reply(true, { id: 'fictional-manuscript-new' });
    return reply(true, {});
  });
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(React.createElement(P4R1HomeController)));
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

async function gesture(fn: () => void) {
  await act(async () => { fn(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });
}

describe('F6 — retry after a failed second step reuses the Work it already created', () => {
  it('Make this a Work: declare fails, retry on the same manuscript creates no second Work', async () => {
    failNext.add('expressions');
    await gesture(() => viewProps.onMakeWork('fictional-manuscript-1', 'Fictional Title'));
    expect(viewProps.error).toBeTruthy();
    await gesture(() => viewProps.onMakeWork('fictional-manuscript-1', 'Fictional Title'));
    expect(calls('/api/sovereign/living-works')).toHaveLength(1);
    const declared = calls('/expressions').map(([url]) => String(url));
    expect(declared).toEqual([
      '/api/sovereign/living-works/fictional-work-1/expressions',
      '/api/sovereign/living-works/fictional-work-1/expressions',
    ]);
    expect(viewProps.error).toBeNull();
  });

  it('Begin: start-writing fails, retry with the same title creates no second Work', async () => {
    failNext.add('start');
    await gesture(() => viewProps.onBegin('Fictional Title'));
    expect(viewProps.error).toBeTruthy();
    await gesture(() => viewProps.onBegin('Fictional Title'));
    expect(calls('/api/sovereign/living-works')).toHaveLength(1);
    expect(calls('/start-writing').map(([url]) => String(url))).toEqual([
      '/api/sovereign/living-works/fictional-work-1/start-writing',
      '/api/sovereign/living-works/fictional-work-1/start-writing',
    ]);
  });

  it('does not over-reuse: a different manuscript still gets its own new Work', async () => {
    failNext.add('expressions');
    await gesture(() => viewProps.onMakeWork('fictional-manuscript-1', null));
    await gesture(() => viewProps.onMakeWork('fictional-manuscript-2', null));
    expect(calls('/api/sovereign/living-works')).toHaveLength(2);
  });

  it('does not over-reuse: after a success, the same manuscript is not silently re-bound', async () => {
    await gesture(() => viewProps.onMakeWork('fictional-manuscript-1', null));
    await gesture(() => viewProps.onMakeWork('fictional-manuscript-1', null));
    expect(calls('/api/sovereign/living-works')).toHaveLength(2);
  });
});
