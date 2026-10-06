jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));

import { apiFetch } from '@/lib/http/apiBase';
import { persistPlaceReturnOrdered } from '../returnStateClient';

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const scope = { livingWorkId: 'work-1', manuscriptId: 'manuscript-1' };

function deferredResponse() {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((r) => { resolve = r; });
  return { promise, resolve };
}

describe('A2-7 ordered place persistence', () => {
  beforeEach(() => mockedFetch.mockReset());

  it('coalesces repeated reports of the same place instead of issuing unbounded PUTs', async () => {
    const sameScope = { livingWorkId: 'work-repeat', manuscriptId: 'manuscript-repeat' };
    const pending = deferredResponse();
    mockedFetch.mockImplementationOnce(() => pending.promise);

    const first = persistPlaceReturnOrdered(sameScope, 'section-X');
    const second = persistPlaceReturnOrdered(sameScope, 'section-X');
    const third = persistPlaceReturnOrdered(sameScope, 'section-X');

    await new Promise((resolve) => setImmediate(resolve));
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    expect(third).toBe(first);

    pending.resolve(new Response('{}', { status: 200 }));
    await expect(first).resolves.toBe(true);

    await expect(persistPlaceReturnOrdered(sameScope, 'section-X')).resolves.toBe(true);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it('allows the same place to retry after a failed write', async () => {
    const retryScope = { livingWorkId: 'work-retry', manuscriptId: 'manuscript-retry' };
    mockedFetch
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await expect(persistPlaceReturnOrdered(retryScope, 'section-R')).resolves.toBe(false);
    await expect(persistPlaceReturnOrdered(retryScope, 'section-R')).resolves.toBe(true);
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });

  it('never lets an older A write finish after a newer B write', async () => {
    const a = deferredResponse();
    const b = deferredResponse();
    mockedFetch.mockImplementationOnce(() => a.promise).mockImplementationOnce(() => b.promise);

    const first = persistPlaceReturnOrdered(scope, 'section-A');
    const second = persistPlaceReturnOrdered(scope, 'section-B');

    await new Promise((resolve) => setImmediate(resolve));
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(mockedFetch.mock.calls[0]?.[1]?.body))).toMatchObject({ draftSectionId: 'section-A' });

    a.resolve(new Response('{}', { status: 200 }));
    await new Promise((resolve) => setImmediate(resolve));
    expect(mockedFetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(mockedFetch.mock.calls[1]?.[1]?.body))).toMatchObject({ draftSectionId: 'section-B' });

    b.resolve(new Response('{}', { status: 200 }));
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
  });
});
