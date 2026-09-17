import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockQuery = jest.fn<any>();
const mockGetMemberIdFromRequest = jest.fn<any>();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (...args: unknown[]) => mockQuery(...args) },
}));

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockGetMemberIdFromRequest(...args),
}));

jest.mock('@/lib/practitioner/features', () => ({
  getPractitionerFeaturesBySlug: jest.fn(),
}));

jest.mock('@/lib/portal/notifications', () => ({
  sendInquiryNotification: jest.fn(),
}));

jest.mock('@/lib/focus/weightTracking', () => ({
  logAction: jest.fn(),
}));

import { GET, PATCH } from '../route';

const params = { params: Promise.resolve({ slug: 'practice-one' }) };

describe('portal inquiry administration authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refuses an unauthenticated inquiry listing before database access', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    const request = new NextRequest('http://localhost/api/portal/practice-one/inquiry');

    const response = await GET(request, params);

    expect(response.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses an unauthenticated inquiry mutation before database access', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);
    const request = new NextRequest('http://localhost/api/portal/practice-one/inquiry', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiry_id: 'inquiry-1', status: 'archived' }),
    });

    const response = await PATCH(request, params);

    expect(response.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('does not disclose whether another member owns the requested portal', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-2');
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const request = new NextRequest('http://localhost/api/portal/practice-one/inquiry');

    const response = await GET(request, params);

    expect(response.status).toBe(404);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][1]).toEqual(['practice-one', 'member-2']);
  });

  it('lists inquiries only after slug ownership is established', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'practice-1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'inquiry-1', status: 'new' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });
    const request = new NextRequest('http://localhost/api/portal/practice-one/inquiry');

    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.total).toBe(1);
    expect(mockQuery.mock.calls[1][1][0]).toBe('practice-1');
    expect(mockQuery.mock.calls[2][1][0]).toBe('practice-1');
  });

  it('owner-scopes inquiry mutation by practitioner id', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'practice-1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'inquiry-1', status: 'archived' }] });
    const request = new NextRequest('http://localhost/api/portal/practice-one/inquiry', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiry_id: 'inquiry-1', status: 'archived' }),
    });

    const response = await PATCH(request, params);

    expect(response.status).toBe(200);
    expect(mockQuery.mock.calls[1][0]).toContain('practitioner_id = $3');
    expect(mockQuery.mock.calls[1][1]).toEqual(['archived', 'inquiry-1', 'practice-1']);
  });
});
