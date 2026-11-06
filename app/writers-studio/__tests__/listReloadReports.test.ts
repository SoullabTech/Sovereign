/**
 * The list loaders (Works, writings, History) say whether a re-read WORKED. The delete flow tells the member "Home now shows what is current" only when both
 * did (Home's own short History is one of the lists); a loader that always answered true would make that sentence false exactly when a list could not be read.
 *
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '../useLivingWorks';
import { useCurrentManuscript } from '../useCurrentManuscript';
import { useStudioHistory } from '../useStudioHistory';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const fetchMock = apiFetch as unknown as jest.Mock;
const res = (status: number, body: unknown = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => body }) as unknown as Response;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => { fetchMock.mockReset(); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

const mount = async <T,>(useIt: () => T): Promise<{ current: T }> => {
  const box = { current: undefined as unknown as T };
  const Probe = () => { box.current = useIt(); return null; };
  await act(async () => { root.render(React.createElement(Probe)); });
  return box;
};

const loaders: Array<[string, () => { reload: () => Promise<boolean> }, string]> = [
  ['useLivingWorks', () => useLivingWorks(), 'works'],
  ['useCurrentManuscript', () => useCurrentManuscript(), 'manuscripts'],
  ['useStudioHistory', () => useStudioHistory(), 'acts'],
];
for (const [name, useIt, key] of loaders) {
  describe(`${name}.reload reports whether the list was read`, () => {
    it('a good answer: true', async () => {
      fetchMock.mockResolvedValue(res(200, { [key]: [] }));
      const box = await mount(useIt);
      let out: boolean | undefined;
      await act(async () => { out = await box.current.reload(); });
      expect(out).toBe(true);
    });
    it('a good answer with an older payload shape (no list): still read', async () => {
      fetchMock.mockResolvedValue(res(200, {}));
      const box = await mount(useIt);
      let out: boolean | undefined;
      await act(async () => { out = await box.current.reload(); });
      expect(out).toBe(true);
    });
    it('a server error: false', async () => {
      fetchMock.mockResolvedValue(res(200, { [key]: [] }));
      const box = await mount(useIt);
      fetchMock.mockResolvedValue(res(500));
      let out: boolean | undefined;
      await act(async () => { out = await box.current.reload(); });
      expect(out).toBe(false);
    });
    it('a session that ended: false', async () => {
      fetchMock.mockResolvedValue(res(200, { [key]: [] }));
      const box = await mount(useIt);
      fetchMock.mockResolvedValue(res(401));
      let out: boolean | undefined;
      await act(async () => { out = await box.current.reload(); });
      expect(out).toBe(false);
    });
    it('no answer at all: false (never a rejection)', async () => {
      fetchMock.mockResolvedValue(res(200, { [key]: [] }));
      const box = await mount(useIt);
      fetchMock.mockRejectedValue(new Error('offline'));
      let out: boolean | undefined;
      await act(async () => { out = await box.current.reload(); });
      expect(out).toBe(false);
    });
  });
}
