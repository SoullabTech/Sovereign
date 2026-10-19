/**
 * C0-SSE opt-in real-browser transport witness.
 * Chrome/WebKit -> temporary 127.0.0.1 HTTP shim -> actual proxy()
 * -> fictional PostgreSQL 17 Unix socket. The shim is NOT a deployed Next
 * app or actual Team message-stream handler. No external network or accounts.
 */
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';
import { chromium, devices, webkit, type Browser } from 'playwright';

const suite = process.env.C0_PG_WITNESS === '1' && process.env.C0_BROWSER_WITNESS === '1'
  ? describe : describe.skip;
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{
  rows: Record<string, unknown>[];
  rowCount: number | null;
}>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));
import { proxy } from '@/proxy';

let pool: Pool;
let server: Server;
let desktop: Browser;
let mobile: Browser;
let origin = '';

const channel = '/api/team/channels/fictional-channel/stream';
const dm = '/api/team/dm/fictional-dm/stream';
const dottedChannel = '/api/team/channels/fictional.channel/stream';
const dottedDm = '/api/team/dm/fictional.dm/stream';
const allowedStreamPaths = new Set([channel, dm, dottedChannel, dottedDm]);
const allowedPages = new Set([
  '/api/members/profile',
  '/api/steward/opus-pulse',
  '/api/admin/partners/prelude/default',
  '/api/feedback',
  channel,
  dm,
  dottedChannel,
  dottedDm,
  '/api/members/profile.json',
]);

suite('C0-SSE real Chrome and mobile WebKit query-token transport', () => {
  beforeAll(async () => {
    const socket = process.env.C0_PG_SOCKET;
    if (!socket ||
        !/^\/(?:private\/)?tmp\/soullab-c0pg-20261018\.[A-Za-z0-9]+\/socket$/.test(socket) ||
        process.env.C0_PG_DATABASE !== 'c0_fictional' ||
        process.env.CI !== 'true' ||
        process.env.DATABASE_URL || process.env.SMTP_HOST || process.env.EMAIL_PROVIDER) {
      throw new Error('C0-SSE browser witness refused non-fictional environment');
    }
    process.env.ACCESS_CONTROL_MODE = 'strict';
    pool = new Pool({
      host: socket, database: 'c0_fictional', user: 'soullab',
      port: 55473, connectionTimeoutMillis: 2000, max: 3,
    });
    const proof = await pool.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS local, current_setting($1)::integer AS version',
      ['server_version_num'],
    );
    if (proof.rows[0]?.db !== 'c0_fictional' ||
        proof.rows[0]?.local !== true || proof.rows[0]?.version < 170000) {
      throw new Error('C0-SSE browser witness refused unexpected database transport/version');
    }
    mockQuery.mockImplementation(async (sql, args) =>
      (await pool.query(sql, args as unknown[] | undefined)));

    server = createServer(async (incoming, outgoing) => {
      try {
        if (incoming.url === '/') {
          outgoing.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
          });
          outgoing.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>Fictional C0 SSE browser</body></html>');
          return;
        }
        const target = new URL(incoming.url ?? '/', origin);
        if (!allowedPages.has(target.pathname) || !['GET','POST'].includes(incoming.method ?? '')) {
          outgoing.writeHead(404);
          outgoing.end();
          return;
        }
        const actual = new NextRequest(
          'https://fictional-c0.invalid' + target.pathname + target.search,
          {
            method: incoming.method,
            headers: new Headers(incoming.headers as Record<string, string>),
          },
        );
        const response = await proxy(actual);
        const forwarded = response.headers.get('x-middleware-next') === '1';
        const memberId = forwarded
          ? response.headers.get('x-middleware-request-x-access-member-id')
          : null;
        const payload = JSON.stringify({ forwarded, memberId });
        const stream = allowedStreamPaths.has(target.pathname) &&
          incoming.method === 'GET' &&
          String(incoming.headers.accept ?? '').includes('text/event-stream');
        if (stream && forwarded) {
          // Only the *browser transport* is being tested, not Team business data.
          outgoing.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': origin,
          });
          outgoing.end('event: ready\ndata: ' + payload + '\n\n');
          return;
        }
        outgoing.writeHead(response.status, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': origin,
        });
        outgoing.end(payload);
      } catch {
        outgoing.writeHead(503, { 'Content-Type': 'application/json' });
        outgoing.end(JSON.stringify({ forwarded: false, memberId: null }));
      }
    });
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address() as AddressInfo;
    if (!address || address.address !== '127.0.0.1') {
      throw new Error('C0-SSE browser witness not limited to loopback');
    }
    origin = 'http://127.0.0.1:' + address.port;
    desktop = await chromium.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--disable-background-networking', '--no-first-run'],
    });
    mobile = await webkit.launch({ headless: true });
  }, 45000);

  afterAll(async () => {
    if (mobile) await mobile.close();
    if (desktop) await desktop.close();
    if (server) {
      await new Promise<void>((resolve, reject) =>
        server.close(err => err ? reject(err) : resolve()));
    }
    if (pool) await pool.end();
  });

  async function browserRequest(browser: Browser, mobileView: boolean, path: string, opts: {
    method?: 'GET'|'POST'; cookie?: string; header?: string; eventSource?: boolean;
  } = {}) {
    const context = await browser.newContext(mobileView
      ? { ...devices['iPhone 13'] } : { viewport: { width: 1280, height: 800 } });
    try {
      await context.route('**/*', route => {
        if (route.request().url().startsWith(origin + '/')) return route.continue();
        return route.abort();
      });
      if (opts.cookie) {
        await context.addCookies([{
          name: 'maia_session', value: opts.cookie, url: origin, sameSite: 'Lax',
        }]);
      }
      const page = await context.newPage();
      await page.goto(origin + '/', { waitUntil: 'domcontentloaded' });
      return await page.evaluate(async ({ target, method, header, eventSource }) => {
        if (eventSource) {
          return await new Promise<unknown>((resolve, reject) => {
            const stream = new EventSource(target);
            const timeout = window.setTimeout(() => {
              stream.close();
              reject(new Error('Fictional SSE event did not arrive'));
            }, 8000);
            stream.addEventListener('ready', e => {
              window.clearTimeout(timeout);
              stream.close();
              try {
                resolve({ status: 200, body: JSON.parse((e as MessageEvent).data) });
              } catch (error) {
                reject(error);
              }
            });
            stream.onerror = () => {
              window.clearTimeout(timeout);
              stream.close();
              reject(new Error('Fictional SSE stream rejected'));
            };
          });
        }
        const headers: Record<string, string> = {};
        if (header) headers['x-session-token'] = header;
        const reply = await fetch(target, {
          method,
          credentials: 'include',
          headers,
        });
        return { status: reply.status, body: await reply.json() };
      }, { target: path, method: opts.method ?? 'GET', header: opts.header ?? null,
        eventSource: opts.eventSource ?? false }) as {
          status: number;
          body: { forwarded: boolean; memberId: string | null };
        };
    } finally {
      await context.close();
    }
  }

  it('desktop Chrome EventSource accepts fictional Team channel URL ticket', async () => {
    const result = await browserRequest(desktop, false,
      channel + '?_t=FICTIONAL_VALID_COOKIE', { eventSource: true });
    expect(result).toEqual({ status: 200, body: { forwarded: true, memberId: A } });
  }, 45000);

  it('mobile WebKit EventSource accepts fictional Team DM URL ticket', async () => {
    const result = await browserRequest(mobile, true,
      dm + '?_t=FICTIONAL_VALID_SAFARI', { eventSource: true });
    expect(result).toEqual({ status: 200, body: { forwarded: true, memberId: A } });
  }, 45000);

  it('mobile WebKit GET cannot authenticate a Steward route with admin URL bearer', async () => {
    const result = await browserRequest(mobile, true,
      '/api/steward/opus-pulse?_t=FICTIONAL_OTHER_MEMBER');
    expect(result.status).toBe(401);
    expect(result.body).toEqual({ forwarded: false, memberId: null });
  }, 45000);

  it('desktop Chrome GET cannot authenticate an admin route with admin URL bearer', async () => {
    const result = await browserRequest(desktop, false,
      '/api/admin/partners/prelude/default?_t=FICTIONAL_OTHER_MEMBER');
    expect(result.status).toBe(401);
  }, 45000);

  it('mobile WebKit GET cannot authenticate an ordinary profile with a query bearer', async () => {
    const result = await browserRequest(mobile, true,
      '/api/members/profile?_t=FICTIONAL_VALID_SAFARI');
    expect(result.status).toBe(401);
  }, 45000);

  it('public feedback may pass but must not carry query-derived identity', async () => {
    const result = await browserRequest(desktop, false,
      '/api/feedback?_t=FICTIONAL_OTHER_MEMBER');
    expect(result.body.memberId).toBeNull();
  }, 45000);

  it('POST on a Team stream cannot authenticate with query bearer', async () => {
    const result = await browserRequest(mobile, true,
      channel + '?_t=FICTIONAL_VALID_SAFARI', { method: 'POST' });
    expect(result.status).toBe(401);
  }, 45000);

  it('cookie and Safari header remain independently authorized on normal member APIs', async () => {
    const chrome = await browserRequest(desktop, false,
      '/api/members/profile', { cookie: 'FICTIONAL_VALID_COOKIE' });
    const safari = await browserRequest(mobile, true,
      '/api/members/profile', { header: 'FICTIONAL_VALID_SAFARI' });
    expect(chrome.body).toEqual({ forwarded: true, memberId: A });
    expect(safari.body).toEqual({ forwarded: true, memberId: A });
  }, 45000);

  it('SSE route refuses an invalid or revoked URL bearer', async () => {
    const response = await browserRequest(desktop, false,
      channel + '?_t=FICTIONAL_REVOKED');
    expect(response.status).toBe(401);
  }, 45000);

  it('mobile WebKit refuses a dotted Team stream without credentials at real proxy', async () => {
    const result = await browserRequest(mobile, true, dottedChannel);
    expect(result.status).toBe(401);
    expect(result.body.memberId).toBeNull();
  }, 45000);

  it('desktop Chrome refuses a dotted DM stream with a revoked URL token', async () => {
    const result = await browserRequest(desktop, false, dottedDm + '?_t=FICTIONAL_REVOKED');
    expect(result.status).toBe(401);
    expect(result.body.forwarded).toBe(false);
  }, 45000);

  it('desktop Chrome admits a valid cookie at the dotted API proxy while still deriving identity', async () => {
    const result = await browserRequest(desktop, false, dottedChannel, {
      cookie: 'FICTIONAL_VALID_COOKIE',
    });
    expect(result).toEqual({ status: 200, body: { forwarded: true, memberId: A } });
  }, 45000);

  it('mobile WebKit refuses two different valid cookie/header members even with an SSE URL token', async () => {
    const result = await browserRequest(mobile, true,
      channel + '?_t=FICTIONAL_VALID_SAFARI', {
        cookie: 'FICTIONAL_VALID_COOKIE',
        header: 'FICTIONAL_OTHER_MEMBER',
      });
    expect(result.status).toBe(401);
    expect(result.body.forwarded).toBe(false);
  }, 45000);

  it('mobile WebKit retains stale-cookie fallback through a valid Safari header on a dotted API path', async () => {
    const result = await browserRequest(mobile, true, dottedDm, {
      cookie: 'FICTIONAL_EXPIRED',
      header: 'FICTIONAL_VALID_SAFARI',
    });
    expect(result).toEqual({ status: 200, body: { forwarded: true, memberId: A } });
  }, 45000);

  it('desktop Chrome never bypasses an unmapped dotted member route in strict mode', async () => {
    const result = await browserRequest(desktop, false,
      '/api/members/profile.json');
    expect(result.status).toBe(404);
    expect(result.body.forwarded).toBe(false);
  }, 45000);

  it('SSE query bearer does not override an expired cookie', async () => {
    const response = await browserRequest(mobile, true,
      dm + '?_t=FICTIONAL_VALID_SAFARI', { cookie: 'FICTIONAL_EXPIRED' });
    expect(response.status).toBe(401);
  }, 45000);
});
