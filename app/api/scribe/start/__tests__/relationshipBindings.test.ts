import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockInsertOne = jest.fn<any>();
const mockQueryOne = jest.fn<any>();
const mockMember = jest.fn<any>();
const mockPractice = jest.fn<any>();

jest.mock('@/lib/db/postgres', () => ({
  insertOne: (...args: unknown[]) => mockInsertOne(...args),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
}));

jest.mock('@/lib/scribe/scribeAuth', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockMember(...args),
}));

jest.mock('@/lib/studio/getPractitionerIdForMember', () => ({
  getPractitionerIdForMember: (...args: unknown[]) => mockPractice(...args),
}));

import { POST } from '../route';

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/scribe/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Session Room relationship binding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMember.mockResolvedValue('member-a');
    mockPractice.mockResolvedValue('practice-a');
  });

  it('RB-07 refuses a foreign client rather than silently dropping it', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    const response = await POST(request({ container: 'practitioner', clientId: 'client-b' }));

    expect(response.status).toBe(404);
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it('RB-08 refuses a booking outside the selected practice', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    const response = await POST(request({ container: 'practitioner', bookingId: 'booking-b' }));

    expect(response.status).toBe(404);
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it('stores both member and practice identities for a bound practitioner session', async () => {
    mockQueryOne
      .mockResolvedValueOnce({ id: 'client-a' })
      .mockResolvedValueOnce({ id: 'booking-a', client_id: 'client-a' });
    mockInsertOne.mockResolvedValue({
      id: 'scribe-a',
      container: 'practitioner',
      started_at: '2026-09-17T00:00:00.000Z',
      consent_status: 'pending',
    });

    const response = await POST(request({
      container: 'practitioner',
      clientId: 'client-a',
      bookingId: 'booking-a',
    }));

    expect(response.status).toBe(200);
    expect(mockInsertOne).toHaveBeenCalledWith('scribe_sessions', expect.objectContaining({
      member_id: 'member-a',
      practitioner_record_id: 'practice-a',
      client_id: 'client-a',
      booking_id: 'booking-a',
    }));
  });

  it('does not silently bind an ordinary solo session to a practice owned by the member', async () => {
    mockInsertOne.mockResolvedValue({
      id: 'scribe-solo',
      container: 'solo',
      started_at: '2026-09-17T00:00:00.000Z',
      consent_status: 'pending',
    });

    const response = await POST(request({ container: 'solo' }));

    expect(response.status).toBe(200);
    const inserted = mockInsertOne.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(inserted.member_id).toBe('member-a');
    expect(inserted).not.toHaveProperty('practitioner_record_id');
  });
});
