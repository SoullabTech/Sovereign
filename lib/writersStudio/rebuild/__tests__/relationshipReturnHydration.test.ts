const fetchMock = jest.fn();

jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => fetchMock(...args),
}));

import { parseReturnEditorialEpisode, readA2Relationship } from '../relationshipOrchestration';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json' },
});

const relationship = {
  id: 'rel-1', livingWorkId: 'work-1', manuscriptId: 'manuscript-1',
  createdAt: '2026-10-28T12:00:00.000Z',
};

const editorial = (sequence: number, threadId: string) => ({
  sequence, childKind: 'EDITORIAL_TURN', continuationAuthorized: true,
  authorityClass: 'EDITORIAL_CHAIN', threadId,
});

describe('fresh Writer return thread authority', () => {
  beforeEach(() => fetchMock.mockReset());

  it('selects only the newest server-owned editorial episode', async () => {
    fetchMock.mockResolvedValueOnce(response({
      relationship,
      active: true,
      episodes: [
        editorial(2, 'thread-old'),
        { sequence: 4, childKind: 'REVIEW_DISCUSS', continuationAuthorized: false },
        editorial(7, 'thread-current'),
      ],
    }));
    const out = await readA2Relationship('rel-1');
    expect(out).toEqual({
      ok: true,
      relationship: {
        ...relationship,
        episodeCount: 3,
        latestEditorialThreadId: 'thread-current',
      },
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/writers-studio/relationships/rel-1');
  });

  it('returns null when an active relationship has no editorial episode', () => {
    expect(parseReturnEditorialEpisode([
      { sequence: 1, childKind: 'REVIEW_DISCUSS', continuationAuthorized: false },
    ])).toEqual({ ok: true, latestEditorialThreadId: null });
  });

  it.each([
    ['non-array', {}],
    ['duplicate sequence', [editorial(1, 'a'), editorial(1, 'b')]],
    ['unknown child kind', [{ sequence: 1, childKind: 'UNKNOWN' }]],
    ['unauthorized editorial pointer', [{
      sequence: 1, childKind: 'EDITORIAL_TURN', continuationAuthorized: false,
      authorityClass: 'EDITORIAL_CHAIN', threadId: 'thread-1',
    }]],
    ['wrong authority class', [{
      sequence: 1, childKind: 'EDITORIAL_TURN', continuationAuthorized: true,
      authorityClass: 'R2_DISCLOSURE', threadId: 'thread-1',
    }]],
  ])('fails closed on %s episode metadata', async (_name, episodes) => {
    fetchMock.mockResolvedValueOnce(response({ relationship, active: true, episodes }));
    await expect(readA2Relationship('rel-1')).resolves.toEqual({ ok: false, reason: 'unreadable' });
  });
});
