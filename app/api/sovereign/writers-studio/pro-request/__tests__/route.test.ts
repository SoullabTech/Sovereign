/**
 * "Ask about Pro" (founder ruling 2026-11-13): records a request the founder answers personally; grants nothing.
 */
const query = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: async () => 'm1' }));

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

const saved = process.env.WS_PRO_ASK_ENABLED;
const post = (body: unknown) => new NextRequest('https://soullab.life/api/sovereign/writers-studio/pro-request', { method: 'POST', body: JSON.stringify(body) });
const get = () => new NextRequest('https://soullab.life/api/sovereign/writers-studio/pro-request');
beforeEach(() => { query.mockReset(); query.mockResolvedValue({ rows: [] }); process.env.WS_PRO_ASK_ENABLED = 'true'; });
afterAll(() => { if (saved === undefined) delete process.env.WS_PRO_ASK_ENABLED; else process.env.WS_PRO_ASK_ENABLED = saved; });

it('⭐ switch off: 404 and nothing read or written', async () => {
  delete process.env.WS_PRO_ASK_ENABLED;
  expect((await POST(post({}))).status).toBe(404);
  expect((await GET(get())).status).toBe(404);
  expect(query).not.toHaveBeenCalled();
});
it('records one open request; asking again keeps one (no pile-up)', async () => {
  const res = await POST(post({ note: '  I am writing a memoir  ' }));
  expect(await res.json()).toEqual({ asked: true });
  const [sql, params] = query.mock.calls[0];
  expect(String(sql)).toContain('ON CONFLICT (member_id) WHERE answered_at IS NULL DO NOTHING');
  expect(params).toEqual(['m1', 'I am writing a memoir']);
});
it('⭐ grants nothing: it only ever writes the request table', async () => {
  await POST(post({}));
  expect(query.mock.calls.every(([sql]) => /writers_studio_pro_requests/.test(String(sql)))).toBe(true);
});
it('refuses an over-long note', async () => {
  expect((await POST(post({ note: 'x'.repeat(501) }))).status).toBe(400);
});
it('GET reports whether a request is open', async () => {
  query.mockResolvedValue({ rows: [{ '?column?': 1 }] });
  expect(await (await GET(get())).json()).toEqual({ asked: true });
});
