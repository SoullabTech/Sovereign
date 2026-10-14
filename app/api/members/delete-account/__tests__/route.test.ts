/**
 * Account closure — actor resolution.
 *
 * The defect: the deletion target came from a body-supplied `memberId` with no
 * session resolution. The only barrier was `confirmUsername` matching that
 * member's username — a display identifier, not a secret — while member UUIDs
 * are already exposed to clients. Knowing a username and an id was enough to
 * permanently destroy someone else's account.
 *
 * Every test here calls the handler DIRECTLY. Middleware is not in the path and
 * contributes nothing to the security proof — that is deliberate.
 */
import { readFileSync } from 'fs';
import path from 'path';

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/auth/serverSessions', () => ({
  clearSessionCookie: jest.fn().mockResolvedValue(undefined),
}));

import { POST } from '../route';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockTx = transaction as jest.MockedFunction<typeof transaction>;
const mockResolve = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;

const ME = 'member-me';
const VICTIM = 'member-victim';

const req = (body: unknown) => ({ json: async () => body }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockImplementation(async (sql: string) => {
    if (sql.includes('SELECT username FROM members')) {
      return { rows: [{ username: 'my-name' }] } as never;
    }
    if (sql.includes('SELECT count(')) {
      return { rows: [{ n: '0' }] } as never;
    }
    throw new Error('unexpected synthetic SQL statement');
  });
});

describe('no verified session → refusal', () => {
  it('1. absent session is refused', async () => {
    mockResolve.mockResolvedValue(null);
    const res = await POST(req({ memberId: ME, confirmUsername: 'my-name' }));
    expect(res.status).toBe(401);
  });

  it('2. invalid/expired session is refused (resolver returns null)', async () => {
    mockResolve.mockResolvedValue(null);
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(401);
    expect(mockTx).not.toHaveBeenCalled();
  });

  it('no deletion is attempted without a session', async () => {
    mockResolve.mockResolvedValue(null);
    await POST(req({ memberId: VICTIM, confirmUsername: 'victim-name' }));
    expect(mockTx).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('a caller cannot select whose account is deleted', () => {
  it('4 + 6. supplying another member UUID is refused before any deletion', async () => {
    mockResolve.mockResolvedValue(ME);
    const res = await POST(req({ memberId: VICTIM, confirmUsername: 'victim-name' }));
    expect(res.status).toBe(403);
    expect(mockTx).not.toHaveBeenCalled();
    // refused before even reading the members table
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('5. the victim\'s correct username does not help without their session', async () => {
    mockResolve.mockResolvedValue(ME);
    mockQuery.mockResolvedValue({ rows: [{ username: 'victim-name' }] } as never);
    const res = await POST(req({ memberId: VICTIM, confirmUsername: 'victim-name' }));
    expect(res.status).toBe(403);
    expect(mockTx).not.toHaveBeenCalled();
  });

  it('the account status check uses the session member, never the body', async () => {
    mockResolve.mockResolvedValue(ME);
    const response = await POST(req({ confirmUsername: 'my-name' }));
    expect(response.status).toBe(409);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('FROM members'), [ME]);
    expect(mockTx).not.toHaveBeenCalled();
  });
});

describe('confirmation is a confirmation, not an authorization', () => {
  it('7. wrong confirmation refuses, with a session present', async () => {
    mockResolve.mockResolvedValue(ME);
    const res = await POST(req({ confirmUsername: 'not-my-name' }));
    expect(res.status).toBe(400);
    expect(mockTx).not.toHaveBeenCalled();
  });

  it('missing member row refuses', async () => {
    mockResolve.mockResolvedValue(ME);
    mockQuery.mockResolvedValue({ rows: [] } as never);
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(404);
  });
});

describe('R4J requires independently verified R20 erasure authority', () => {
  it('3. refuses confirmed member deletion even if known counts are zero', async () => {
    mockResolve.mockResolvedValue(ME);
    const res = await POST(req({ memberId: ME, confirmUsername: 'my-name' }));
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      error: 'deletion_incomplete_unavailable',
      accountChanged: false,
      nextStep: 'contact_support',
    });
    expect(mockTx).not.toHaveBeenCalled();
  });

  it('9. no sessions or member row are changed when R20 is not qualified', async () => {
    mockResolve.mockResolvedValue(ME);
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(409);
    expect(mockTx).not.toHaveBeenCalled();
    expect(mockQuery.mock.calls.every(([sql]) =>
      !/\bDELETE\b|\bUPDATE\b/i.test(String(sql)))).toBe(true);
  });

  it('8. a missing governed table refuses the request without a transaction', async () => {
    mockResolve.mockResolvedValue(ME);
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT username FROM members')) {
        return { rows: [{username: 'my-name'}] } as never;
      }
      throw new Error('synthetic required table missing');
    });
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({
      error: 'privacy_preflight_unavailable', accountChanged: false,
    });
    expect(mockTx).not.toHaveBeenCalled();
  });

  it('malformed preflight counts are not treated as zero', async () => {
    mockResolve.mockResolvedValue(ME);
    mockQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT username FROM members')) {
        return { rows: [{username: 'my-name'}] } as never;
      }
      return { rows: [{ n: 'not-a-valid-count' }] } as never;
    });
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(503);
    expect(mockTx).not.toHaveBeenCalled();
  });
});

describe('10. structural — the resolver cannot be removed', () => {
  const src = readFileSync(path.join(__dirname, '../route.ts'), 'utf8');

  it('resolves the actor through the canonical session resolver', () => {
    expect(src).toMatch(/getMemberIdFromRequest\(request\)/);
  });

  it('never uses a body-supplied id as the deletion target', () => {
    // The body value may only be bound under the "claimed" name.
    expect(src).not.toMatch(/const \{\s*memberId\s*[,}]/);
    expect(src).toMatch(/memberId: claimedMemberId/);
  });

  it('has no legacy member DELETE or deletion transaction entrypoint', () => {
    expect(src).not.toMatch(/await transaction\(/);
    expect(src).not.toMatch(/DELETE FROM members/);
    expect(src).toContain('R20_ACCOUNT_ERASURE_NOT_QUALIFIED');
  });
});

describe('the caller no longer sends an account identifier', () => {
  const caller = readFileSync(
    path.join(__dirname, '../../../../../components/account/AccountSettings.tsx'),
    'utf8',
  );

  it('the delete request body carries no memberId', () => {
    // userId here is `user.id || user.passkey` from localStorage — a passkey
    // would never match the session and would 403 a legitimate closure.
    const start = caller.indexOf("apiFetch('/api/members/delete-account'");
    expect(start).toBeGreaterThanOrEqual(0);
    const request = caller.slice(start, start + 1100);
    // Check the actual submitted JSON object, not nearby comments describing
    // why the old memberId claim was removed. A 400-character excerpt cut off
    // the payload entirely and incorrectly failed on the frozen R4H source.
    const body = request.match(/body:\s*JSON\.stringify\(\{([\s\S]*?)\}\)/);
    expect(body).not.toBeNull();
    expect(body![1]).toMatch(/confirmUsername\s*:/);
    expect(body![1]).not.toMatch(/memberId\s*:/);
  });
});
