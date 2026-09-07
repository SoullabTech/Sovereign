/**
 * MAIL-04c — a caller may never choose another actor's sending identity.
 * ======================================================================
 *
 * MAIL-03 established that a caller may not choose a DESTINATION. This is the
 * same rule on the other axis: the SENDING IDENTITY. The Google connector let
 * a request body name whose OAuth credentials to spend, which is the more
 * serious of the two — a destination gets you a mail-bomb, an identity gets you
 * someone else's account.
 *
 * The combined invariant:
 *
 *   a caller may choose a destination only when they hold verified authority
 *   for the sending act — and may NEVER choose another actor's sending identity
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockGetMemberId = jest.fn<(req: unknown) => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (r: unknown) => mockGetMemberId(r),
}));

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({ query: (s: string, p?: unknown[]) => mockQuery(s, p) }));

const mockSendGmail = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockHasPermission = jest.fn<(...a: unknown[]) => Promise<boolean>>();
jest.mock('@/lib/gmail/GmailService', () => ({
  GmailService: {
    sendEmail: (...a: unknown[]) => mockSendGmail(...a),
    hasGmailPermission: (...a: unknown[]) => mockHasPermission(...a),
    getUserEmail: async () => 'member@example.com',
  },
}));
jest.mock('@/lib/connectors/connectorDb', () => ({ upsertConnector: async () => {} }));
jest.mock('@/lib/focus/weightTracking', () => ({
  checkThreshold: async () => ({ level: 'none' }),
  logAction: async () => {},
}));

import { POST as sendPOST, GET as sendGET } from '../../../gmail/send/route';
import { POST as disconnectPOST } from '../disconnect/route';

const VICTIM = '11111111-1111-1111-1111-111111111111';
const ATTACKER = '22222222-2222-2222-2222-222222222222';

const req = (url: string, body?: Record<string, unknown>) =>
  new (require('next/server').NextRequest)(`http://localhost${url}`, {
    method: body ? 'POST' : 'GET',
    ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
  });

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.CAPACITOR_BUILD;
  mockQuery.mockResolvedValue({ rows: [] });
  mockHasPermission.mockResolvedValue(true);
  mockSendGmail.mockResolvedValue({ success: true, messageId: 'm-1' });
});

describe('POST /api/gmail/send', () => {
  it('REFUSES an anonymous caller', async () => {
    mockGetMemberId.mockResolvedValue(null);

    const res = await sendPOST(req('/api/gmail/send', {
      userId: VICTIM, to: 'x@y.z', subject: 's', body: 'b',
    }));

    expect(res.status).toBe(401);
    expect(mockSendGmail).not.toHaveBeenCalled();
  });

  it('sends from the SESSION member, ignoring a userId in the body', async () => {
    // The defect: body.userId chose whose OAuth credentials were spent.
    mockGetMemberId.mockResolvedValue(ATTACKER);

    await sendPOST(req('/api/gmail/send', {
      userId: VICTIM, to: 'x@y.z', subject: 's', body: 'b',
    }));

    expect(mockSendGmail).toHaveBeenCalled();
    const usedIdentity = mockSendGmail.mock.calls[0][0];
    expect(usedIdentity).toBe(ATTACKER);
    expect(usedIdentity).not.toBe(VICTIM);
  });

  it('lets an authenticated member choose the recipient — that is the feature', async () => {
    // Member-delegated mail. A caller-chosen destination is legitimate HERE
    // precisely because the sending identity is proven.
    mockGetMemberId.mockResolvedValue(ATTACKER);

    const res = await sendPOST(req('/api/gmail/send', {
      to: 'anyone@example.com', subject: 's', body: 'b',
    }));

    expect(res.status).toBe(200);
    expect(mockSendGmail).toHaveBeenCalled();
  });
});

describe('GET /api/gmail/send — connection status is not enumerable', () => {
  it('REFUSES an anonymous caller instead of answering about ?userId=', async () => {
    mockGetMemberId.mockResolvedValue(null);
    const res = await sendGET(req(`/api/gmail/send?userId=${VICTIM}`));
    expect(res.status).toBe(401);
  });

  it('answers about the session member, not the query parameter', async () => {
    mockGetMemberId.mockResolvedValue(ATTACKER);
    await sendGET(req(`/api/gmail/send?userId=${VICTIM}`));
    expect(mockHasPermission).toHaveBeenCalledWith(ATTACKER);
  });
});

describe('POST /api/auth/google/disconnect — destructive, and it was unauthenticated', () => {
  it('REFUSES an anonymous caller', async () => {
    mockGetMemberId.mockResolvedValue(null);

    const res = await disconnectPOST(req('/api/auth/google/disconnect', { userId: VICTIM }));

    expect(res.status).toBe(401);
    const deletes = mockQuery.mock.calls.filter(([sql]) => /DELETE FROM google_calendar_credentials/i.test(String(sql)));
    expect(deletes).toHaveLength(0);
  });

  it('deletes only the SESSION member\'s credentials, never a named one', async () => {
    mockGetMemberId.mockResolvedValue(ATTACKER);

    await disconnectPOST(req('/api/auth/google/disconnect', { userId: VICTIM }));

    const deletes = mockQuery.mock.calls.filter(([sql]) => /DELETE FROM google_calendar_credentials/i.test(String(sql)));
    expect(deletes).toHaveLength(1);
    expect(deletes[0][1]).toEqual([ATTACKER]);
    expect(deletes[0][1]).not.toContain(VICTIM);
  });
});
