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

/** Records every statement the transaction body issues. */
function captureTx() {
  const statements: string[] = [];
  mockTx.mockImplementation(async (cb: never) => {
    const tx = { query: async (sql: string) => { statements.push(sql); return { rows: [] }; } };
    return (cb as unknown as (c: unknown) => Promise<unknown>)(tx);
  });
  return statements;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [{ username: 'my-name' }] } as never);
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

  it('the deletion always targets the session member, never the body', async () => {
    mockResolve.mockResolvedValue(ME);
    captureTx();
    await POST(req({ confirmUsername: 'my-name' }));
    // the authoritative username lookup used the session id
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('FROM members'), [ME]);
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

describe('the authorized path', () => {
  it('3. a member deletes their own account with the correct confirmation', async () => {
    mockResolve.mockResolvedValue(ME);
    captureTx();
    const res = await POST(req({ memberId: ME, confirmUsername: 'my-name' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
  });

  it('9. the session is revoked inside the same transaction as the deletion', async () => {
    mockResolve.mockResolvedValue(ME);
    const statements = captureTx();
    await POST(req({ confirmUsername: 'my-name' }));

    const revokeAt = statements.findIndex((s) => /auth_sessions[\s\S]*revoked = TRUE/.test(s));
    const deleteAt = statements.findIndex((s) => /DELETE FROM members/.test(s));
    expect(revokeAt).toBeGreaterThanOrEqual(0);
    expect(deleteAt).toBeGreaterThanOrEqual(0);
    // revoked first: a rollback then leaves the account intact AND usable
    expect(revokeAt).toBeLessThan(deleteAt);
  });

  it('8. a failure propagates so the transaction rolls back — no partial deletion', async () => {
    mockResolve.mockResolvedValue(ME);
    mockTx.mockRejectedValue(new Error('db exploded'));
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(500);
    expect(await res.json()).not.toMatchObject({ success: true });
  });

  it('all destructive work happens inside the transaction, none outside it', async () => {
    mockResolve.mockResolvedValue(ME);
    captureTx();
    await POST(req({ confirmUsername: 'my-name' }));
    for (const call of mockQuery.mock.calls) {
      expect(String(call[0])).not.toMatch(/\bDELETE\b|\bUPDATE\b/i);
    }
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

  it('deletes transactionally', () => {
    expect(src).toMatch(/await transaction\(/);
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
    const call = caller.slice(
      caller.indexOf("apiFetch('/api/members/delete-account'"),
      caller.indexOf("apiFetch('/api/members/delete-account'") + 400,
    );
    expect(call).toMatch(/confirmUsername/);
    expect(call).not.toMatch(/memberId/);
  });
});
