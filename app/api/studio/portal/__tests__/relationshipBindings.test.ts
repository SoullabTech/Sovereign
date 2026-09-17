import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockIdentity = jest.fn<any>();
const mockQuery = jest.fn<any>();
const mockSend = jest.fn<any>();

jest.mock('@/lib/auth/getCurrentPractitioner', () => ({
  getCurrentPractitioner: (...args: unknown[]) => mockIdentity(...args),
}));

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

jest.mock('@/lib/portal/invites', () => ({
  generateInviteCode: () => 'synthetic-invite-code',
  hashInviteCode: () => 'synthetic-invite-hash',
}));

jest.mock('@/lib/portal/notifications', () => ({
  sendPortalClaimEmail: (...args: unknown[]) => mockSend(...args),
}));

import { GET, POST } from '../route';

const identity = {
  memberId: 'member-a',
  practitionerId: 'practice-a',
  practitionerSlug: 'practice-a',
  practitionerName: 'Synthetic Practitioner',
  portalType: 'generalist',
  enabledModules: null,
  studioMode: 'practice',
};

function post(clientId: string) {
  return new NextRequest('http://localhost/api/studio/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  });
}

describe('Studio portal relationship bindings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIdentity.mockResolvedValue(identity);
    mockSend.mockResolvedValue({ success: true });
  });

  it('RB-19 refuses a foreign client before revoking or creating an invite', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await POST(post('client-b'));

    expect(response.status).toBe(404);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][1]).toEqual(['client-b', 'practice-a', 'member-a']);
  });

  it('writes an invite with the exact member, practice, and client tuple', async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{
          id: 'client-a',
          name: 'Synthetic Client',
          email: 'client@example.test',
          portal_claimed_at: null,
          slug: 'practice-a',
          prac_name: 'Synthetic Practitioner',
          prac_email: 'practitioner@example.test',
          business_name: null,
        }],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await POST(post('client-a'));

    expect(response.status).toBe(200);
    const revokeSql = String(mockQuery.mock.calls[1][0]);
    const insertSql = String(mockQuery.mock.calls[2][0]);
    expect(revokeSql).toContain('practitioner_record_id = $2');
    expect(revokeSql).toContain('practitioner_id = $3');
    expect(mockQuery.mock.calls[1][1]).toEqual(['client-a', 'practice-a', 'member-a']);
    expect(insertSql).toContain('practitioner_record_id');
    expect(mockQuery.mock.calls[2][1].slice(0, 4)).toEqual([
      'client-a',
      'member-a',
      'practice-a',
      'synthetic-invite-hash',
    ]);
  });

  it('scopes invite projection to the same practice and member', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await GET(new NextRequest('http://localhost/api/studio/portal'));

    expect(response.status).toBe(200);
    const sql = String(mockQuery.mock.calls[0][0]);
    expect(sql).toContain('ci.practitioner_record_id = c.practitioner_id');
    expect(sql).toContain('ci.practitioner_id = p.member_id');
    expect(sql).not.toContain('OR p.member_id');
    expect(mockQuery.mock.calls[0][1]).toEqual(['practice-a', 'member-a']);
  });
});
