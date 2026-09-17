/** F5 P5-D · canonical route authority + governed projection. */
import { readFileSync } from 'fs';
import path from 'path';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/auth/serverSessions', () => ({ clearSessionCookie: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/lib/erasure/accountErasureExecutor', () => ({ executeAccountErasure: jest.fn() }));

import { POST } from '../route';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { clearSessionCookie } from '@/lib/auth/serverSessions';
import { executeAccountErasure } from '@/lib/erasure/accountErasureExecutor';

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockResolve = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const mockExecute = executeAccountErasure as jest.MockedFunction<typeof executeAccountErasure>;
const mockClear = clearSessionCookie as jest.MockedFunction<typeof clearSessionCookie>;
const ME = '11111111-1111-4111-8111-111111111111';
const VICTIM = '22222222-2222-4222-8222-222222222222';
const req = (body: unknown) => ({ json: async () => body }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  mockResolve.mockResolvedValue(ME);
  mockQuery.mockResolvedValue({ rows: [{ username: 'my-name' }] } as never);
  mockExecute.mockResolvedValue({
    state: 'refused', httpStatus: 409, accountChanged: false, actRef: 'act-1',
    message: 'Nothing was changed.', blocked: ['journal entries'],
  });
});

describe('server-owned subject authority', () => {
  it('refuses without a verified session before database or executor', async () => {
    mockResolve.mockResolvedValue(null);
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('refuses a mismatched body member id before lookup or executor', async () => {
    const res = await POST(req({ memberId: VICTIM, confirmUsername: 'victim' }));
    expect(res.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('uses the session member for authoritative username confirmation', async () => {
    await POST(req({ confirmUsername: 'my-name' }));
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('FROM members'), [ME]);
  });

  it('wrong confirmation never reaches the executor', async () => {
    const res = await POST(req({ confirmUsername: 'wrong' }));
    expect(res.status).toBe(400);
    expect(mockExecute).not.toHaveBeenCalled();
  });
});

describe('durable governed outcome projection', () => {
  it('surfaces a governed refusal unchanged and leaves the session intact', async () => {
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      state: 'refused', accountChanged: false, actRef: 'act-1', blocked: ['journal entries'],
    });
    expect(mockClear).not.toHaveBeenCalled();
  });

  it('surfaces evidence-unavailable as 503/no-change', async () => {
    mockExecute.mockResolvedValue({
      state: 'unavailable', httpStatus: 503, accountChanged: false, actRef: 'act-2',
      message: 'Nothing was changed.', blocked: [],
    });
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ state: 'unavailable', accountChanged: false });
    expect(mockClear).not.toHaveBeenCalled();
  });


  it('never converts post-executor uncertainty into a false no-change claim', async () => {
    mockExecute.mockRejectedValue(new Error('transport uncertainty'));
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ state: 'unknown', accountChanged: null });
  });
  it('clears the presentation cookie only after durable completion', async () => {
    mockExecute.mockResolvedValue({
      state: 'completed', httpStatus: 200, accountChanged: true, actRef: 'act-3',
      message: 'Completed.', blocked: [],
    });
    const res = await POST(req({ confirmUsername: 'my-name' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ state: 'completed', accountChanged: true });
    expect(mockClear).toHaveBeenCalledTimes(1);
  });
});

describe('structural boundary', () => {
  const src = readFileSync(path.join(__dirname, '../route.ts'), 'utf8');
  it('keeps the canonical session resolver and never destructs tables itself', () => {
    expect(src).toMatch(/getMemberIdFromRequest\(request\)/);
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/DELETE FROM|UPDATE auth_sessions|GOVERNED_CONTENT/);
    expect(code).toMatch(/executeAccountErasure\(memberId/);
  });

  it('the caller still sends no member id', () => {
    const caller = readFileSync(path.join(__dirname, '../../../../../components/account/AccountSettings.tsx'), 'utf8');
    const start = caller.indexOf("apiFetch('/api/members/delete-account'");
    const call = caller.slice(start, start + 500).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(call).toMatch(/confirmUsername/);
    expect(call).not.toMatch(/memberId/);
  });
});
