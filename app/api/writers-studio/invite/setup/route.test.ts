import { NextRequest } from 'next/server';
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/passwordUtils', () => ({ hashPassword: jest.fn() }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));
jest.mock('@/lib/auth/rateLimiter', () => ({
  getClientIP: jest.fn(() => '127.0.0.1'),
  checkRateLimit: jest.fn(),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));
import { query } from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/passwordUtils';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { checkRateLimit } from '@/lib/auth/rateLimiter';
import { GET, PUT } from './route';

const q = query as jest.Mock;
const hash = hashPassword as jest.Mock;
const admit = writersStudioBetaAccess as jest.Mock;
const rate = checkRateLimit as jest.Mock;
const id = '44444444-4444-4444-8444-444444444444';
const token = 'e'.repeat(64);
const valid = new NextRequest('https://beta.soullab.life/api/writers-studio/invite/setup?token=' + token);
const put = (payload: unknown) => new NextRequest('https://beta.soullab.life/api/writers-studio/invite/setup', {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
});
const prev = [
  process.env.WRITERS_STUDIO_RESTRICTED_BETA,
  process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR,
  process.env.WRITERS_STUDIO_BETA_INVITE_SETUP,
];
beforeEach(() => {
  jest.resetAllMocks();
  process.env.WRITERS_STUDIO_RESTRICTED_BETA = 'true';
  process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR = 'true';
  process.env.WRITERS_STUDIO_BETA_INVITE_SETUP = 'true';
  rate.mockResolvedValue({ allowed: true });
  q.mockResolvedValueOnce({ rows: [{ member_id: id }] }).mockResolvedValue({ rows: [{ id }] });
  admit.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
  hash.mockResolvedValue('fictional-bcrypt-hash');
});
afterAll(() => {
  ['WRITERS_STUDIO_RESTRICTED_BETA','WRITERS_STUDIO_BETA_SINGLE_DOOR','WRITERS_STUDIO_BETA_INVITE_SETUP'].forEach((k,i) => {
    if (prev[i] === undefined) delete process.env[k]; else process.env[k] = prev[i];
  });
});
describe('private member invitation setup', () => {
  it('is nonexistent when the beta invite feature is disabled', async () => {
    process.env.WRITERS_STUDIO_BETA_INVITE_SETUP = 'false';
    expect((await GET(valid)).status).toBe(404);
    expect((await PUT(put({token,password:'an acceptable passphrase'}))).status).toBe(404);
    expect(q).not.toHaveBeenCalled();
  });
  it('requires all three flags', async () => {
    process.env.WRITERS_STUDIO_RESTRICTED_BETA = 'false';
    expect((await GET(valid)).status).toBe(404);
  });
  it('refuses missing or malformed tokens before DB access', async () => {
    expect((await GET(new NextRequest('https://beta.soullab.life/api/writers-studio/invite/setup'))).status).toBe(404);
    expect((await PUT(put({token:'abc',password:'an acceptable passphrase'}))).status).toBe(404);
    expect(q).not.toHaveBeenCalled();
  });
  it('validates a 256-bit link without disclosing member profile', async () => {
    const res = await GET(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({valid:true});
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(q.mock.calls[0][1][0]).not.toEqual(token);
    expect(admit).toHaveBeenCalledWith(id);
  });
  it('refuses a revoked or unapproved member', async () => {
    admit.mockResolvedValue({eligible:false,basis:'not_in_pilot'});
    expect((await GET(valid)).status).toBe(404);
  });
  it('requires a strong confirmable password, never consuming a token', async () => {
    const res = await PUT(put({token,password:'short'}));
    expect(res.status).toBe(400);
    expect(hash).not.toHaveBeenCalled();
    expect(q).toHaveBeenCalledTimes(1);
  });
  it('refuses unknown inputs', async () => {
    expect((await PUT(put({token,password:'a good passphrase long',extra:'wrong'}))).status).toBe(400);
    expect(q).not.toHaveBeenCalled();
  });
  it('uses one atomic SQL statement to consume and set password', async () => {
    const res = await PUT(put({token,password:'a good passphrase long'}));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({success:true});
    expect(hash).toHaveBeenCalledTimes(1);
    expect(q).toHaveBeenCalledTimes(2);
    const sql: string = q.mock.calls[1][0];
    expect(sql).toContain('WITH claimed AS');
    expect(sql).toContain('SET used=TRUE');
    expect(sql).toContain("c.contact_type='beta_tester'");
    expect(sql).toContain("c.pipeline_stage='active'");
    expect(sql).toContain('c.deleted_at IS NULL');
    expect(sql).toContain('UPDATE members m SET password_hash');
    expect(q.mock.calls[1][1][0]).not.toBe(token);
  });
  it('replay after claim sees no row and is refused', async () => {
    q.mockReset();
    q.mockResolvedValueOnce({rows:[{member_id:id}]}).mockResolvedValueOnce({rows:[]});
    expect((await PUT(put({token,password:'a good passphrase long'}))).status).toBe(404);
  });
  it('fails closed without available membership authority', async () => {
    admit.mockRejectedValue(new Error('DB offline'));
    expect((await PUT(put({token,password:'a good passphrase long'}))).status).toBe(503);
  });
  it('rate-limits token probes without performing lookups', async () => {
    rate.mockResolvedValue({allowed:false});
    expect((await GET(valid)).status).toBe(429);
    expect(q).not.toHaveBeenCalled();
  });
});
