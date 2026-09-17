import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockQuery = jest.fn<any>();
const mockGetMemberIdFromRequest = jest.fn<any>();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockGetMemberIdFromRequest(...args),
}));

import { POST } from '../route';

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/practitioners/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/practitioners/check authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refuses an unauthenticated member lookup', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);

    const response = await POST(request({ memberId: 'victim-member' }));

    expect(response.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses a body memberId that differs from the authenticated member', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');

    const response = await POST(request({ memberId: 'member-2' }));

    expect(response.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('looks up only the authenticated member', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');
    mockQuery.mockResolvedValue({
      rows: [{ id: 'practice-1', slug: 'mine', name: 'Mine', email: 'mine@example.test', status: 'active' }],
    });

    const response = await POST(request({}));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.hasPractitioner).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE member_id = $1'), ['member-1']);
  });
});
