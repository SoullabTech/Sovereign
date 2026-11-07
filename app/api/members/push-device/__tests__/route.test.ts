import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockQuery = jest.fn<(...args: unknown[]) => Promise<{ rows: unknown[] }>>();
const mockMember = jest.fn<(...args: unknown[]) => Promise<string | null>>();
jest.mock('@/lib/db/postgres', () => ({ query: (...args: unknown[]) => mockQuery(...args) }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: (...args: unknown[]) => mockMember(...args) }));

import { POST, DELETE } from '../route';

const TOKEN = 'AB'.repeat(32);
const req = (body: unknown) => ({ json: async () => body }) as never;

describe('push device registration', () => {
  beforeEach(() => { mockQuery.mockReset().mockResolvedValue({ rows: [{ id: 'device-1' }] }); mockMember.mockReset(); });

  it('requires a session', async () => {
    mockMember.mockResolvedValue(null);
    expect((await POST(req({ token: TOKEN, environment: 'production' }))).status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('uses the session member, never a member id in the body', async () => {
    mockMember.mockResolvedValue('session-member');
    const res = await POST(req({ token: TOKEN, environment: 'production', memberId: 'someone-else', userId: 'x' }));
    expect(res.status).toBe(200);
    const params = mockQuery.mock.calls[0][1] as string[];
    expect(params[0]).toBe('session-member');
    expect(params).not.toContain('someone-else');
    expect(params[2]).toBe(TOKEN.toLowerCase());
  });

  it('rejects a bad token, environment or app id', async () => {
    mockMember.mockResolvedValue('m');
    expect((await POST(req({ token: 'zz', environment: 'production' }))).status).toBe(400);
    expect((await POST(req({ token: TOKEN, environment: 'staging' }))).status).toBe(400);
    expect((await POST(req({ token: TOKEN, environment: 'production', appId: 'bad id!' }))).status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('removal is scoped to the member own registration', async () => {
    mockMember.mockResolvedValue('session-member');
    expect((await DELETE(req({ token: TOKEN }))).status).toBe(200);
    const sql = String(mockQuery.mock.calls[0][0]);
    expect(sql).toContain('member_id = $1');
    expect((mockQuery.mock.calls[0][1] as string[])[0]).toBe('session-member');
  });

  it('a database failure is a 500 that leaks nothing', async () => {
    mockMember.mockResolvedValue('m');
    mockQuery.mockRejectedValue(new Error('secret detail'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await POST(req({ token: TOKEN, environment: 'production' }));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('secret');
  });

  it('refuses to take over a token that is active under another member', async () => {
    mockMember.mockResolvedValue('member-b');
    mockQuery.mockResolvedValue({ rows: [] }); // the guarded upsert touched no row
    const res = await POST(req({ token: TOKEN, environment: 'production' }));
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe('DEVICE_REGISTERED_ELSEWHERE');
  });

  it('the takeover guard lives inside the upsert, not in a prior read', async () => {
    mockMember.mockResolvedValue('member-a');
    await POST(req({ token: TOKEN, environment: 'production' }));
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const sql = String(mockQuery.mock.calls[0][0]);
    expect(sql).toMatch(/DO UPDATE SET[\s\S]*WHERE member_push_devices\.member_id = EXCLUDED\.member_id\s+OR member_push_devices\.revoked_at IS NOT NULL/);
    expect(sql).toContain('RETURNING id');
  });
});
