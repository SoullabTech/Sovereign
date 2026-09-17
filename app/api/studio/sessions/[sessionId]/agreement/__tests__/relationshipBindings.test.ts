import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockMember = jest.fn<any>();
const mockPractice = jest.fn<any>();
const mockQueryOne = jest.fn<any>();

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockMember(...args),
}));

jest.mock('@/lib/studio/getPractitionerIdForMember', () => ({
  getPractitionerIdForMember: (...args: unknown[]) => mockPractice(...args),
}));

jest.mock('@/lib/db/postgres', () => ({
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  transaction: jest.fn(),
}));

import { POST } from '../route';

describe('Session Room agreement relationship binding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMember.mockResolvedValue('member-a');
    mockPractice.mockResolvedValue('practice-a');
  });

  it('RB-09 refuses before token creation when the session/client tuple is outside the practice', async () => {
    mockQueryOne.mockResolvedValueOnce(null);

    const response = await POST(
      new NextRequest('http://localhost/api/studio/sessions/scribe-b/agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreementMode: 'notes', videoProvider: 'soullab' }),
      }),
      { params: Promise.resolve({ sessionId: 'scribe-b' }) },
    );

    expect(response.status).toBe(404);
    const sql = String(mockQueryOne.mock.calls[0][0]);
    expect(sql).toContain('ss.practitioner_record_id = $3');
    expect(sql).toContain('pc.practitioner_id = $3');
  });
});
