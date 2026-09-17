import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockQuery = jest.fn<any>();
const mockTransaction = jest.fn<any>();
const mockGetMemberIdFromRequest = jest.fn<any>();
const mockUuid = jest.fn<() => string>();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  transaction: (...args: unknown[]) => mockTransaction(...args),
}));

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockGetMemberIdFromRequest(...args),
}));

jest.mock('uuid', () => ({
  v4: () => mockUuid(),
}));

import { POST } from '../route';

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/practitioners/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  practiceName: 'Test Practice',
  slug: 'test-practice',
  email: 'practitioner@example.test',
};

describe('POST /api/practitioners/create authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUuid
      .mockReset()
      .mockReturnValueOnce('practitioner-1')
      .mockReturnValueOnce('theme-1');
  });

  it('refuses an unauthenticated practitioner elevation before database access', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);

    const response = await POST(request({ ...validBody, memberId: 'victim-member' }));

    expect(response.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('refuses a body memberId that differs from the authenticated member', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');

    const response = await POST(request({ ...validBody, memberId: 'member-2' }));

    expect(response.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('creates the practice for the authenticated member without requiring a body memberId', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'member-1', name: 'Member One' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const clientQuery = jest.fn<any>().mockResolvedValue({ rows: [] });
    mockTransaction.mockImplementation(async (callback: any) => callback({ query: clientQuery }));

    const response = await POST(request(validBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.practitioner.member_id).toBe('member-1');
    expect(mockQuery.mock.calls[0][1]).toEqual(['member-1']);
    expect(mockQuery.mock.calls[1][1]).toEqual(['member-1']);
    expect(clientQuery.mock.calls[0][1][1]).toBe('member-1');
    expect(clientQuery.mock.calls[1][1]).toEqual(['member-1']);
  });
});
