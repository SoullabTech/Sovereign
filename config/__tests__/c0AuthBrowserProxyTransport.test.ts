/**
 * C0-AUTH opt-in browser → actual Next proxy → isolated PostgreSQL witness.
 * Local-only temporary HTTP listener on 127.0.0.1, fictional member sessions.
 *
 * Does NOT boot Next.js, run an account login, touch a deployed host, or load
 * remote pages. It exercises browser cookie/header transport into proxy().
 */
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';
import { chromium, devices, webkit, type Browser } from 'playwright';

const BROWSER_ENABLED = process.env.C0_BROWSER_WITNESS === '1' && process.env.C0_PG_WITNESS === '1';
const suite = BROWSER_ENABLED ? describe : describe.skip;
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));
import { proxy } from '@/proxy';

let pool: Pool;
let server: Server;
let desktop: Browser;
let mobile: Browser;
let baseUrl = '';

async function stopHttp() {
  if (!server) return;
  await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
}

suite('C0-AUTH local Chrome/WebKit → strict Next proxy → PG17', () => {
  beforeAll(async () => {
    const socket = process.env.C0_PG_SOCKET;
    if (!socket || !/^\/(?:private\/)?tmp\/soullab-c0pg-20261018\.[A-Za-z0-9]+\/socket$/.test(socket) ||
      process.env.C0_PG_DATABASE !== 'c0_fictional' ||
      process.env.CI !== 'true' ||
      process.env.DATABASE_URL || process.env.SMTP_HOST || process.env.EMAIL_PROVIDER) {
      throw new Error('C0-AUTH browser witness refused: scratch-only database and clean environment required');
    }
    process.env.ACCESS_CONTROL_MODE = 'strict';
    pool = new Pool({ host: socket, port: 55473, database: 'c0_fictional', user: 'soullab',
      max: 3, connectionTimeoutMillis: 2000 });
    const proof = await pool.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS socket_only, current_setting($1)::integer AS pg_version',
      ['server_version_num'],
    );
    if (proof.rows[0]?.db !== 'c0_fictional' || proof.rows[0]?.socket_only !== true ||
      proof.rows[0]?.pg_version < 170000) {
      throw new Error('C0-AUTH browser witness refused: unexpected DB transport or version');
    }
    mockQuery.mockImplementation(async (sql, args) =>
      (await pool.query(sql, args as unknown[] | undefined)));

    // Dedicated test-only HTTP shim. The REAL proxy function enforces each
    // request; this shim emits its disposition, never accesses real accounts.
    server = createServer(async (incoming, outgoing) => {
      try {
        if (incoming.url === '/') {
          outgoing.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store' });
          outgoing.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>C0 fictional browser</body></html>');
          return;
        }
        const parsed = new URL(incoming.url ?? '/', baseUrl);
        if (parsed.pathname !== '/api/members/profile' || incoming.method !== 'GET') {
          outgoing.writeHead(404);
          outgoing.end();
          return;
        }
        const nextRequest = new NextRequest(parsed.toString(), {
          method: 'GET',
          headers: new Headers(incoming.headers as Record<string, string>),
        });
        const result = await proxy(nextRequest);
        const forwarded = result.headers.get('x-middleware-next') === '1';
        const memberId = forwarded
          ? result.headers.get('x-middleware-request-x-access-member-id')
          : null;
        outgoing.writeHead(result.status, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': baseUrl,
        });
        outgoing.end(JSON.stringify({ forwarded, memberId }));
      } catch {
        outgoing.writeHead(503);
        outgoing.end(JSON.stringify({ forwarded: false }));
      }
    });
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const bind = server.address() as AddressInfo;
    if (!bind || bind.address !== '127.0.0.1') throw new Error('C0 loopback-only browser bind failed');
    baseUrl = 'http://127.0.0.1:' + bind.port;

    desktop = await chromium.launch({ headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--disable-background-networking', '--no-first-run'] });
    mobile = await webkit.launch({ headless: true });
  }, 45000);

  afterAll(async () => {
    if (mobile) await mobile.close();
    if (desktop) await desktop.close();
    await stopHttp();
    if (pool) await pool.end();
  });

  async function runBrowser(browser: Browser, mobileView: boolean, opts: {
    cookie?: string; header?: string; memberClaim?: string;
  }) {
    const context = await browser.newContext(mobileView ? { ...devices['iPhone 13'] } : {
      viewport: { width: 1280, height: 800 },
    });
    try {
      // Only requests to this exact in-process loopback listener are permitted.
      await context.route('**/*', route => {
        if (route.request().url().startsWith(baseUrl + '/')) return route.continue();
        return route.abort();
      });
      if (opts.cookie) {
        await context.addCookies([{
          name: 'maia_session', value: opts.cookie,
          url: baseUrl, sameSite: 'Lax',
        }]);
      }
      const page = await context.newPage();
      await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded' });
      const res = await page.evaluate(async ({ header, memberClaim }) => {
        const headers: Record<string, string> = {};
        if (header) headers['x-session-token'] = header;
        if (memberClaim) headers['x-member-id'] = memberClaim;
        const reply = await fetch('/api/members/profile', {
          method: 'GET', credentials: 'include', headers,
        });
        return { status: reply.status, body: await reply.json() };
      }, { header: opts.header ?? null, memberClaim: opts.memberClaim ?? null });
      return res;
    } finally {
      await context.close();
    }
  }

  it('Chrome sends verified desktop cookie through real strict proxy', async () => {
    const result = await runBrowser(desktop, false, { cookie: 'FICTIONAL_VALID_COOKIE' });
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ forwarded: true, memberId: A });
  }, 60000);

  it('mobile WebKit sends a verified header with no cookie through real strict proxy', async () => {
    const result = await runBrowser(mobile, true, { header: 'FICTIONAL_VALID_SAFARI' });
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ forwarded: true, memberId: A });
  }, 60000);

  it('mobile WebKit recovers when stale cookie and valid header coexist', async () => {
    const result = await runBrowser(mobile, true, {
      cookie: 'FICTIONAL_EXPIRED', header: 'FICTIONAL_VALID_SAFARI',
    });
    expect(result.status).toBe(200);
    expect(result.body.memberId).toBe(A);
  }, 60000);

  it('mobile WebKit refuses conflicting VALID cookie and header members', async () => {
    const result = await runBrowser(mobile, true, {
      cookie: 'FICTIONAL_VALID_COOKIE', header: 'FICTIONAL_OTHER_MEMBER',
    });
    expect(result.status).toBe(401);
    expect(result.body.forwarded).toBe(false);
  }, 60000);

  it('desktop Chrome refuses forged member claim without a real session', async () => {
    const result = await runBrowser(desktop, false, { memberClaim: B });
    expect(result.status).toBe(401);
    expect(result.body.forwarded).toBe(false);
  }, 60000);
});
