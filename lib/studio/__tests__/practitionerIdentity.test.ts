import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockQuery = jest.fn<any>();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));

import { getPractitionerIdForMember } from '../getPractitionerIdForMember';

describe('practitioner identity selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('RB-01 refuses an ambiguous member instead of choosing a practice row', async () => {
    mockQuery.mockResolvedValue({
      rows: [{ id: 'practice-a' }, { id: 'practice-b' }],
    });

    await expect(getPractitionerIdForMember('member-a')).resolves.toBeNull();
    expect(mockQuery.mock.calls[0][0]).not.toContain('LIMIT 1');
  });
});
