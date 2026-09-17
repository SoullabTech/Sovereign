import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockQueryOne = jest.fn<any>();

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  transaction: jest.fn(),
}));

import { loadJoinTokenContext } from '../joinTokenStore';

describe('join token relationship binding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('RB-10 joins a token only to the Session Room row carrying the same client', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    await expect(loadJoinTokenContext('opaque-token')).resolves.toBeNull();

    const sql = String(mockQueryOne.mock.calls[0][0]);
    expect(sql).toContain('s.client_id = t.client_id');
  });
});
