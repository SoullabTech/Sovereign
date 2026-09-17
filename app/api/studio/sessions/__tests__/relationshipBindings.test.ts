import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockQuery = jest.fn<any>();
const mockMember = jest.fn<any>();
const mockPractice = jest.fn<any>();
const mockTeam = jest.fn<any>();

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

jest.mock('@/lib/team/sessionTeamScope', () => ({
  resolveSessionTeamId: (...args: unknown[]) => mockTeam(...args),
}));

jest.mock('@/lib/notifications/SessionNotificationService', () => ({
  sendBookingConfirmation: jest.fn(),
}));

jest.mock('@/lib/calendar/syncSessionToGoogle', () => ({
  syncNewSessionToGoogle: jest.fn().mockResolvedValue({}),
  syncUpdatedSessionToGoogle: jest.fn().mockResolvedValue({}),
  syncCancelledSessionToGoogle: jest.fn().mockResolvedValue({}),
}));

import { GET, POST } from '../route';

function post(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/studio/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Studio session relationship bindings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMember.mockResolvedValue('member-a');
    mockPractice.mockResolvedValue('practice-a');
    mockTeam.mockResolvedValue('team-a');
  });

  it('RB-02 refuses another practice client before inserting a session', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await POST(post({
      client_id: 'client-b',
      scheduled_at: '2026-09-18T12:00:00.000Z',
    }));

    expect(response.status).toBe(404);
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO sessions'))).toBe(false);
  });

  it('RB-03 refuses another practice service before inserting a session', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'client-a' }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await POST(post({
      client_id: 'client-a',
      service_id: 'service-b',
      scheduled_at: '2026-09-18T12:00:00.000Z',
    }));

    expect(response.status).toBe(404);
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO sessions'))).toBe(false);
  });

  it('RB-04 scopes client and service projections to the session practice', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await GET(new NextRequest('http://localhost/api/studio/sessions'));

    expect(response.status).toBe(200);
    const sql = String(mockQuery.mock.calls[0][0]);
    expect(sql).toContain('c.practitioner_id = s.practitioner_id');
    expect(sql).toContain('svc.practitioner_id = s.practitioner_id');
  });
});
