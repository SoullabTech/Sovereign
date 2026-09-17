import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockQuery = jest.fn<any>();
const mockTxQuery = jest.fn<any>();
const mockIdentity = jest.fn<any>();
const mockResolveTeam = jest.fn<any>();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (...args: unknown[]) => mockQuery(...args) },
  transaction: async (fn: (client: { query: typeof mockTxQuery }) => unknown) =>
    fn({ query: mockTxQuery }),
}));

jest.mock('@/lib/auth/getCurrentPractitioner', () => ({
  getCurrentPractitioner: (...args: unknown[]) => mockIdentity(...args),
}));

jest.mock('@/lib/team/colabTeams', () => ({
  COLAB_TEAM_COOKIE: 'colab_team_id',
  resolveCurrentTeamId: (...args: unknown[]) => mockResolveTeam(...args),
}));

jest.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined }),
}));

import { POST } from '../route';

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/studio/encounters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('encounter relationship bindings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIdentity.mockResolvedValue({ practitionerId: 'practice-a', memberId: 'member-a' });
    mockResolveTeam.mockResolvedValue('team-a');
  });

  it('RB-20 refuses another practice meeting before encounter creation', async () => {
    mockTxQuery.mockResolvedValueOnce({ rows: [] });

    const response = await POST(request({ title: 'Synthetic encounter', session_id: 'meeting-b' }));

    expect(response.status).toBe(404);
    expect(mockTxQuery.mock.calls[0][0]).toContain('practitioner_id = $2');
    expect(mockTxQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO encounters'))).toBe(false);
  });

  it('RB-21 refuses a participant person from another team before encounter creation', async () => {
    mockTxQuery.mockResolvedValueOnce({ rows: [] });

    const response = await POST(request({
      title: 'Synthetic encounter',
      participants: [{ person_id: '00000000-0000-4000-8000-000000000002', display_name: 'B' }],
    }));

    expect(response.status).toBe(404);
    expect(mockTxQuery.mock.calls[0][0]).toContain('team_id = $2');
    expect(mockTxQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO encounters'))).toBe(false);
  });
});
