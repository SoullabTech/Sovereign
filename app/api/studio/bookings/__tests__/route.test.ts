import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockQuery = jest.fn<any>();
const mockGetMemberIdFromRequest = jest.fn<any>();
const mockGetPractitionerIdForMember = jest.fn<any>();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (...args: unknown[]) => mockQuery(...args) },
}));

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockGetMemberIdFromRequest(...args),
}));

jest.mock('@/lib/studio/getPractitionerIdForMember', () => ({
  getPractitionerIdForMember: (...args: unknown[]) => mockGetPractitionerIdForMember(...args),
}));

import { PATCH } from '../route';

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/studio/bookings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/studio/bookings authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refuses an unauthenticated mutation before database access', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue(null);

    const response = await PATCH(request({ id: 'booking-1', status: 'completed' }));

    expect(response.status).toBe(401);
    expect(mockGetPractitionerIdForMember).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses a member without a practitioner identity', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');
    mockGetPractitionerIdForMember.mockResolvedValue(null);

    const response = await PATCH(request({ id: 'booking-1', status: 'completed' }));

    expect(response.status).toBe(404);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('returns not found when the booking is not owned by the practitioner', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');
    mockGetPractitionerIdForMember.mockResolvedValue('practice-1');
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await PATCH(request({ id: 'booking-2', status: 'completed' }));

    expect(response.status).toBe(404);
    expect(mockQuery.mock.calls[0][0]).toContain('practitioner_id = $3');
    expect(mockQuery.mock.calls[0][1]).toEqual(['booking-2', 'completed', 'practice-1']);
  });

  it('refuses a Session Room record not owned by the authenticated practitioner member', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');
    mockGetPractitionerIdForMember.mockResolvedValue('practice-1');
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await PATCH(request({ id: 'booking-1', scribeSessionId: 'scribe-2' }));

    expect(response.status).toBe(404);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][1]).toEqual(['scribe-2', 'booking-1', 'practice-1', 'member-1']);
  });

  it('RB-06 refuses a Session Room record bound to a different booking client', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');
    mockGetPractitionerIdForMember.mockResolvedValue('practice-1');
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await PATCH(request({ id: 'booking-1', scribeSessionId: 'scribe-other-client' }));

    expect(response.status).toBe(404);
    const sql = String(mockQuery.mock.calls[0][0]);
    expect(sql).toContain('booking.client_id = ss.client_id');
    expect(sql).toContain('ss.practitioner_record_id = $3');
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('updates only an owned booking with an owned practitioner Session Room record', async () => {
    mockGetMemberIdFromRequest.mockResolvedValue('member-1');
    mockGetPractitionerIdForMember.mockResolvedValue('practice-1');
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'scribe-1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'booking-1' }] });

    const response = await PATCH(request({
      id: 'booking-1',
      status: 'completed',
      scribeSessionId: 'scribe-1',
    }));

    expect(response.status).toBe(200);
    expect(mockQuery.mock.calls[1][0]).toContain('practitioner_id = $4');
    expect(mockQuery.mock.calls[1][1]).toEqual([
      'booking-1',
      'completed',
      'scribe-1',
      'practice-1',
    ]);
  });
});
