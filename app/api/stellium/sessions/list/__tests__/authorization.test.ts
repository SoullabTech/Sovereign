import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockRequirePractitioner = jest.fn<any>();
const mockGetSessions = jest.fn<any>();
const mockCreateSession = jest.fn<any>();

jest.mock('@/lib/auth/getCurrentPractitioner', () => ({
  requirePractitioner: (...args: unknown[]) => mockRequirePractitioner(...args),
}));

jest.mock('@/lib/stellium/sessions', () => ({
  getSessions: (...args: unknown[]) => mockGetSessions(...args),
  getUpcomingSessions: jest.fn(),
  createSession: (...args: unknown[]) => mockCreateSession(...args),
  getSessionStats: jest.fn(),
  getSessionsNeedingFollowUp: jest.fn(),
}));

import { GET, POST } from '../route';

describe('legacy Stellium session route authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('RB-13 refuses an unauthenticated request even when it supplies a practitionerId', async () => {
    mockRequirePractitioner.mockResolvedValue({
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    });

    const response = await GET(
      new NextRequest('http://localhost/api/stellium/sessions/list?practitionerId=practice-b'),
    );

    expect(response.status).toBe(401);
    expect(mockGetSessions).not.toHaveBeenCalled();
  });

  it('never lets a body practitionerId establish creation scope', async () => {
    mockRequirePractitioner.mockResolvedValue({
      identity: { memberId: 'member-a', practitionerId: 'practice-a' },
    });
    mockCreateSession.mockResolvedValue({ id: 'legacy-session-a' });

    const response = await POST(new NextRequest('http://localhost/api/stellium/sessions/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        practitionerId: 'practice-b',
        client_id: 'client-a',
        session_type: 'coaching',
      }),
    }));

    expect(response.status).toBe(200);
    expect(mockCreateSession.mock.calls[0][0]).toEqual({
      memberId: 'member-a',
      practitionerRecordId: 'practice-a',
    });
  });
});
