/**
 * Class A E010 -- full *server* entry chain, with fictional cookies and rows.
 * Uses actual proxy, Lab Tools layout/guard, owner GET, password POST, and
 * read-only Reflect handler. UI boundary components are display-only mocks.
 * This is NOT a browser/production witness, nor permission to activate Reflect.
 */
import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';
import { proxy } from '@/proxy';
import LabToolsLayout from '@/app/labtools/layout';
import { GET as ownerGET, POST as adminPOST } from '@/app/api/admin/auth/route';
import { GET as reflectGET } from '@/app/api/admin/reflect-release-status/route';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    get: (key: string) => key === 'maia_session' && browserCookie
      ? { value: browserCookie } : undefined,
  })),
}));
jest.mock('@/lib/founder/founderAuth', () => ({
  isFounderMemberId: (id: string) => id === FOUNDER,
}));
jest.mock('next/navigation', () => ({
  redirect: (url: string) => { throw new Error('FICTIONAL_REDIRECT:' + url); },
}));
jest.mock('@/components/maia/MaiaBoundaryLayout', () => ({
  MaiaBoundaryLayout: ({ children }: { children: unknown }) => children,
}));
jest.mock('@/components/access/FounderGateScreen', () => ({
  __esModule: true, default: () => 'FICTIONAL_LAB_REFUSAL',
}));

const FOUNDER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CTO = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ORDINARY = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const PASSWORD = 'fictional-shared-admin-pw';
type Person = { id: string; roles: string[]; adminRole: string | null };
const identities: Record<string, Person> = {
  'fixture-founder-admin': { id: FOUNDER, roles: ['member', 'admin'], adminRole: 'founder' },
  'fixture-founder-owner-only': { id: FOUNDER, roles: ['member'], adminRole: 'founder' },
  'fixture-cto-admin': { id: CTO, roles: ['member', 'admin'], adminRole: 'cto' },
  'fixture-member': { id: ORDINARY, roles: ['member'], adminRole: null },
};
let browserCookie: string | null = null;
const mockQuery = query as jest.Mock;
function fixtureSql(sql: string, args: unknown[] = []) {
  const person = identities[String(args[0] ?? '')];
  if (sql.includes('SELECT s.member_id, m.tier, m.roles')) return Promise.resolve({
    rows: person ? [{ member_id: person.id, tier: 'free', roles: person.roles }] : [],
  });
  if (sql.includes('SELECT m.id, m.admin_role FROM members m')) return Promise.resolve({
    rows: person?.adminRole ? [{ id: person.id, admin_role: person.adminRole }] : [],
  });
  if (sql.includes('SELECT id, member_id, session_token') &&
      sql.includes('FROM auth_sessions')) return Promise.resolve({
    rows: person ? [{
      id: 'fixture-session', member_id: person.id, session_token: String(args[0]),
      device_id: null, ip_address: null, user_agent: null,
      expires_at: new Date('2099-01-01'), last_active_at: new Date('2026-01-01'),
      revoked: false,
    }] : [],
  });
  if (sql.includes('UPDATE auth_sessions SET last_active_at')) return Promise.resolve({ rows: [] });
  if (sql.includes('INSERT INTO admin_access_log')) return Promise.resolve({ rows: [] });
  throw new Error('FICTIONAL_UNEXPECTED_SQL:' + sql.slice(0, 60));
}
function req(path: string, options: {
  cookie?: string; header?: string; method?: 'GET' | 'POST'; password?: string;
} = {}) {
  const headers: Record<string, string> = { host: 'soullab.life', 'x-forwarded-for': '198.51.100.200' };
  if (options.cookie) headers.cookie = 'maia_session=' + options.cookie;
  if (options.header) headers['x-session-token'] = options.header;
  if (options.password !== undefined) headers['content-type'] = 'application/json';
  return new NextRequest('https://soullab.life' + path, {
    method: options.method ?? 'GET', headers,
    ...(options.password !== undefined ? { body: JSON.stringify({ password: options.password }) } : {}),
  });
}
async function enterCockpit(token: string | null) {
  browserCookie = token;
  const request = req('/labtools/admin/system', token ? { cookie: token } : {});
  const edge = await proxy(request);
  if (edge.status !== 200) return { edge: edge.status, layout: 'NOT_REACHED' };
  const layout = await LabToolsLayout({ children: 'FICTIONAL_COCKPIT' });
  return { edge: edge.status, layout };
}
const preserved = { ...process.env };
beforeAll(() => {
  process.env.ACCESS_CONTROL_MODE = 'strict';
  process.env.LABTOOLS_ADMIN_PASSWORD = PASSWORD;
  delete process.env.PRO_STUDIO_REFLECT_BETA_ENABLED;
  delete process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS;
});
beforeEach(() => { browserCookie = null; mockQuery.mockReset().mockImplementation(fixtureSql); });
afterAll(() => { process.env = { ...preserved }; });

describe('E010 real route/layout chain with fictional sessions', () => {
  it('verified founder with app-admin and cookie passes page, owner GET, POST and read-only status', async () => {
    const tok = 'fixture-founder-admin';
    const entry = await enterCockpit(tok);
    expect(entry.edge).toBe(200);
    expect(entry.layout).toBeTruthy();
    expect((await ownerGET(req('/api/admin/auth', { cookie: tok }))).status).toBe(200);
    expect((await (await ownerGET(req('/api/admin/auth', { cookie: tok }))).json()).role).toBe('founder');
    const challenge = await adminPOST(req('/api/admin/auth', { cookie: tok, method: 'POST', password: PASSWORD }));
    expect(challenge.status).toBe(200);
    const reflect = await reflectGET(req('/api/admin/reflect-release-status', { cookie: tok }));
    expect(reflect.status).toBe(200);
    expect(reflect.headers.get('cache-control')).toContain('no-store');
    expect((await reflect.json()).observation.operatorAuthority).toBe('NOT_QUALIFIED');
  });

  it('founder admin_role without app admin keeps owner GET, but page and password POST deny', async () => {
    const tok = 'fixture-founder-owner-only';
    expect((await ownerGET(req('/api/admin/auth', { cookie: tok }))).status).toBe(200);
    const owner = await ownerGET(req('/api/admin/auth', { cookie: tok }));
    expect(await owner.json()).toMatchObject({ isAdmin: true, role: 'founder' });
    expect((await enterCockpit(tok)).edge).toBe(403);
    expect((await adminPOST(req('/api/admin/auth', { cookie: tok, method: 'POST', password: PASSWORD }))).status).toBe(403);
    expect((await reflectGET(req('/api/admin/reflect-release-status', { cookie: tok }))).status).toBe(200);
  });

  it('application-admin CTO passes page outer proxy but not founder-only Lab Tools or Reflect', async () => {
    const tok = 'fixture-cto-admin';
    expect((await proxy(req('/labtools/admin/system', { cookie: tok }))).status).toBe(200);
    const entered = await enterCockpit(tok);
    expect(entered.layout).toBeTruthy();
    expect((entered.layout as { props?: { reason?: string } }).props?.reason).toBe('Access is limited to the founder and founding members.');
    expect((await reflectGET(req('/api/admin/reflect-release-status', { cookie: tok }))).status).toBe(403);
  });

  it('an ordinary current cookie cannot be displaced by a stale founder header', async () => {
    const opts = { cookie: 'fixture-member', header: 'fixture-founder-admin' };
    expect((await proxy(req('/labtools/admin/system', opts))).status).toBe(403);
    expect(await (await ownerGET(req('/api/admin/auth', opts))).json()).toEqual({ isAdmin: false });
    expect((await reflectGET(req('/api/admin/reflect-release-status', opts))).status).toBe(403);
  });

  it('cookie-free Safari header supports individual API probes but NOT the Lab Tools layout', async () => {
    const headerOnly = { header: 'fixture-founder-admin' };
    expect((await proxy(req('/api/admin/reflect-release-status', headerOnly))).status).toBe(200);
    expect((await reflectGET(req('/api/admin/reflect-release-status', headerOnly))).status).toBe(200);
    expect(await (await ownerGET(req('/api/admin/auth', headerOnly))).json()).toMatchObject({
      isAdmin: true, role: 'founder',
    });
    expect((await proxy(req('/labtools/admin/system', headerOnly))).status).toBe(200);
    await expect(LabToolsLayout({ children: 'FICTIONAL_COCKPIT' })).rejects.toThrow('FICTIONAL_REDIRECT:/signin?next=/labtools');
  });

  it('anonymous and forged-header users cannot reach the Cockpit or admin POST', async () => {
    expect((await enterCockpit(null)).edge).not.toBe(200);
    expect((await adminPOST(req('/api/admin/auth', { method: 'POST', password: PASSWORD }))).status).toBe(401);
    expect((await reflectGET(req('/api/admin/reflect-release-status', {}))).status).toBe(403);
  });
});
