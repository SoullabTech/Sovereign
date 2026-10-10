import { NextRequest } from 'next/server';

const member = jest.fn(), beta = jest.fn(), query = jest.fn();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => member(...args),
}));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({
  writersStudioBetaAccess: (...args: unknown[]) => beta(...args),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => query(...args),
}));

import { POST } from '@/app/api/sovereign/writers-studio/beta-feedback/route';

const req = () => new NextRequest('http://localhost/api/sovereign/writers-studio/beta-feedback', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    signal: 'something_else',
    studioMode: 'listen',
    orientationContext: {},
    note: 'Synthetic Listen feedback. No prose.',
  }),
});

beforeEach(() => {
  jest.clearAllMocks();
  member.mockResolvedValue('synthetic-member');
  beta.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
  query.mockResolvedValue({ rows: [] });
});

describe('Listen beta feedback', () => {
  it('records the Listen mode instead of silently losing attribution', async () => {
    const r = await POST(req());
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true });
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, args] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('INSERT INTO writer_studio_beta_feedback');
    expect(args[3]).toBe('listen');
  });
  it('refuses unauthenticated or non-pilot submission without a write', async () => {
    member.mockResolvedValue(null);
    expect((await POST(req())).status).toBe(401);
    expect(query).not.toHaveBeenCalled();
    member.mockResolvedValue('synthetic-member');
    beta.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
    expect((await POST(req())).status).toBe(403);
    expect(query).not.toHaveBeenCalled();
  });
});
