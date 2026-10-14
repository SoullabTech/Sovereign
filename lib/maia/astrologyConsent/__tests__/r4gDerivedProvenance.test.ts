import { query } from '@/lib/db/postgres';
import { excludeProtectedDevelopmentalMemories } from '../r4gDerivedProvenance';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const queryMock = query as jest.Mock;

const user = 'aaaaaaaa-0000-4000-8000-000000000001';

beforeEach(() => queryMock.mockReset());

describe('R4G protected developmental source ancestry', () => {
  it('filters known protected derivations but retains unrelated human memory', async () => {
    queryMock.mockResolvedValue({ rows: [{ id: 'memory-from-protected-chart' }] });
    const input = [
      { id: 'memory-from-protected-chart', content: 'FICTIONAL_PRIVATE' },
      { id: 'ordinary-untagged-memory', content: 'FICTIONAL_ORDINARY' },
    ];
    const result = await excludeProtectedDevelopmentalMemories(user, input);
    expect(result).toEqual([input[1]]);
    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain('d.source_exchange_id');
    expect(sql).toContain('astro_maia_transfer_grants');
    expect(params).toEqual([user, ['memory-from-protected-chart','ordinary-untagged-memory']]);
  });
  it('does not query database for an empty candidate list', async () => {
    expect(await excludeProtectedDevelopmentalMemories(user, [])).toEqual([]);
    expect(queryMock).not.toHaveBeenCalled();
  });
  it('never returns unsafe memories after a privacy-registry failure', async () => {
    queryMock.mockRejectedValue(new Error('synthetic database unavailable'));
    await expect(excludeProtectedDevelopmentalMemories(user, [{ id: 'a' }])).rejects.toThrow('synthetic database unavailable');
  });
});
