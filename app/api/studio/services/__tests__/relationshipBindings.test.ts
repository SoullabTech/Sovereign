import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockQuery = jest.fn<any>();
const mockMember = jest.fn<any>();
const mockPractice = jest.fn<any>();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (...args: unknown[]) => mockQuery(...args) },
}));

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockMember(...args),
}));

jest.mock('@/lib/studio/getPractitionerIdForMember', () => ({
  getPractitionerIdForMember: (...args: unknown[]) => mockPractice(...args),
}));

import { DELETE } from '../route';

describe('service relationship binding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMember.mockResolvedValue('member-a');
    mockPractice.mockResolvedValue('practice-a');
  });

  it('RB-05 returns generic not-found before inspecting another practice service sessions', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await DELETE(
      new NextRequest('http://localhost/api/studio/services?id=service-b', { method: 'DELETE' }),
    );

    expect(response.status).toBe(404);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][1]).toEqual(['service-b', 'practice-a']);
  });
});
