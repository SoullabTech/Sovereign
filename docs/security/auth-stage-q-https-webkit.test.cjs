/**
 * Stage Q — genuine WebKit HTTPS and disposable PostgreSQL acceptance.
 *
 * Real browser: Playwright WebKit (Linux), NOT the Safari application.
 * Real TLS: fresh self-signed, ephemeral, loopback-only certificate.
 * Real SQL: fresh fictional PostgreSQL 14 on loopback only.
 * Actual reviewed TypeScript modules: serverSessions, verifiedAccess, signout
 * route and client helper. A deliberately minimal Node HTTPS adapter stands in
 * for Next.js request/cookies/response plumbing; this is NOT a Next/Caddy test.
 *
 * No member credentials, production services, external URLs or browser cookies.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const https = require('node:https');
const crypto = require('node:crypto');
const { AsyncLocalStorage } = require('node:async_hooks');
const { spawnSync } = require('node:child_process');
const Module = require('node:module');
const ts = require('typescript');
const { Client } = require('pg');
const { webkit } = require('playwright');

const root = path.resolve(__dirname, '../..');
const host = '127.0.0.1';
const port = 3843;
const origin = 'https://' + host + ':' + port;
const required = {
  sentinel: 'fictional-webkit-ci-only',
  database: 'stageq_webkit_fictional',
  user: 'stageq_webkit_fixture',
  pgport: 5548,
};
if (
  process.env.STAGE_Q_WEBKIT_DISPOSABLE !== required.sentinel ||
  process.env.PGHOST !== host ||
  Number(process.env.PGPORT) !== required.pgport ||
  process.env.PGUSER !== required.user ||
  process.env.PGDATABASE !== required.database
) {
  throw Error('Refusing any non-fictional or non-loopback WebKit/PostgreSQL target');
}
// The source uses NODE_ENV only to choose the production Secure attribute.
// This is an isolated, unconnected test runtime—not a production environment.
process.env.NODE_ENV = 'production';
process.env.AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS = origin;

let db;
let browser;
let server;
let tmpdir;
const requestState = new AsyncLocalStorage();
const issued = [];
const observed = [];

function loadTs(relative, imports) {
  const filename = path.join(root, relative);
  const transpiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      isolatedModules: true,
    },
  }).outputText;
  const mod = new Module.Module(filename + '.webkit-fixture.cjs');
  mod.filename = filename + '.webkit-fixture.cjs';
  mod.paths = [];
  mod.require = name => {
    if (imports.has(name)) return imports.get(name);
    throw Error('Unapproved fixture import: ' + name);
  };
  mod._compile(transpiled, mod.filename);
  return mod.exports;
}

const sql = (...args) => db.query(...args);
const nextResponse = {
  json: (body, options = {}) => {
    const status = options.status || 200;
    return { status, body, headers: options.headers || {} };
  },
};
const cookieProvider = () => {
  const state = requestState.getStore();
  if (!state) throw Error('No HTTP request cookie context');
  return state;
};
const sessionModule = loadTs('lib/auth/serverSessions.ts', new Map([
  ['@/lib/db/postgres', { query: sql }],
  ['./passwordUtils', { generateSecureToken: n => crypto.randomBytes(n).toString('hex') }],
  ['next/headers', { cookies: cookieProvider }],
]));
const signout = loadTs('app/api/members/signout/route.ts', new Map([
  ['next/server', { NextResponse: nextResponse }],
  ['next/headers', { cookies: cookieProvider }],
  ['@/lib/db/postgres', { query: sql }],
]));
const identities = loadTs('lib/auth/identityAssertions.ts', new Map());
const access = loadTs('lib/auth/verifiedAccess.ts', new Map([
  ['./identityAssertions', identities],
  ['@/lib/db/postgres', { query: sql }],
]));
const client = loadTs('lib/auth/webSignOut.ts', new Map([
  ['@/lib/http/apiBase', { clearAuthState: () => {}, isNativeCapacitor: () => false }],
  ['@capacitor/core', { Capacitor: { isNativePlatform: () => false } }],
]));

function makeCookies(req) {
  const cookies = new Map();
  const writes = [];
  const raw = req.headers.cookie || '';
  for (const item of raw.split(';')) {
    const equals = item.indexOf('=');
    if (equals < 1) continue;
    cookies.set(item.slice(0, equals).trim(), item.slice(equals + 1).trim());
  }
  return {
    get: name => cookies.has(name) ? { value: cookies.get(name) } : undefined,
    set: (name, value, options = {}) => {
      const attributes = [name + '=' + value, 'Path=' + (options.path || '/')];
      if (options.expires instanceof Date) {
        attributes.push('Expires=' + options.expires.toUTCString());
      }
      if (options.secure) attributes.push('Secure');
      if (options.httpOnly) attributes.push('HttpOnly');
      if (options.sameSite) attributes.push('SameSite=' +
        options.sameSite.slice(0, 1).toUpperCase() + options.sameSite.slice(1));
      writes.push(attributes.join('; '));
      if (options.expires instanceof Date && options.expires.getTime() <= Date.now()) {
        cookies.delete(name);
      } else cookies.set(name, value);
    },
    flush: res => { if (writes.length) res.setHeader('Set-Cookie', writes); },
  };
}

async function newMember() {
  const id = crypto.randomUUID();
  await sql("INSERT INTO members(id,tier,roles) VALUES($1,'free',ARRAY['member'])", [id]);
  return id;
}
async function newSession(memberId) {
  return sessionModule.createSession({
    memberId,
    ipAddress: host,
    userAgent: 'fictional-webkit-test',
  });
}
async function isRevoked(token) {
  const result = await sql('SELECT revoked FROM auth_sessions WHERE session_token=$1', [token]);
  return result.rows[0]?.revoked;
}

async function handleHttps(req, res) {
  const route = new URL(req.url, origin).pathname;
  const jar = makeCookies(req);
  observed.push({
    path: route,
    method: req.method,
    origin: req.headers.origin || null,
    host: req.headers.host || null,
    hadCookie: !!jar.get('maia_session'),
    hadHeader: !!req.headers['x-session-token'],
  });
  await requestState.run(jar, async () => {
    try {
      if (route === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end('<!doctype html><html><head><title>Stage Q fictional fixture</title></head><body><main>Fixture only</main></body></html>');
        return;
      }
      if (route === '/fixture/start' && req.method === 'POST') {
        const memberId = await newMember();
        const session = await newSession(memberId);
        issued.push({ memberId, sessionToken: session.sessionToken });
        await sessionModule.setSessionCookie(session.sessionToken, session.expiresAt);
        await sessionModule.setAccessCookies(memberId, 'free', ['member'], session.expiresAt);
        jar.flush(res);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ started: true }));
        return;
      }
      if (route === '/api/members/signout' && req.method === 'POST') {
        const response = await signout.POST({
          headers: new Headers(req.headers),
          cookies: jar,
          url: origin + route,
        });
        jar.flush(res);
        res.writeHead(response.status, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          ...response.headers,
        });
        res.end(JSON.stringify(response.body));
        return;
      }
      if (route === '/api/protected' && req.method === 'GET') {
        const result = await access.deriveVerifiedAccess({
          headers: new Headers(req.headers),
          cookies: jar,
          url: origin + route,
        });
        res.writeHead(result.authenticated ? 200 : 401, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        });
        res.end(JSON.stringify({ authenticated: result.authenticated }));
        return;
      }
      res.writeHead(404);
      res.end();
    } catch (e) {
      // Do not emit session token, cookie, or detailed DB exception in logs.
      console.error('[stage-q-webkit] fixture handler failed');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Fixture server failed' }));
    }
  });
}

async function makePage() {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto(origin + '/', { waitUntil: 'load' });
  return { context, page };
}
async function webFetch(page, endpoint, options = {}) {
  return page.evaluate(async ({ endpoint, options }) => {
    const response = await fetch(endpoint, {
      credentials: 'same-origin',
      redirect: 'error',
      cache: 'no-store',
      ...options,
    });
    return { status: response.status, ok: response.ok, body: await response.json() };
  }, { endpoint, options });
}
async function webClientTransport(page, endpoint, options) {
  const result = await webFetch(page, endpoint, options);
  return {
    status: result.status,
    ok: result.ok,
    json: async () => result.body,
  };
}

test.before(async () => {
  db = new Client({
    host,
    port: required.pgport,
    database: required.database,
    user: required.user,
    password: process.env.PGPASSWORD,
    connectionTimeoutMillis: 5000,
  });
  await db.connect();
  const r = await sql('SELECT current_database() AS database, current_user AS user');
  assert.equal(r.rows[0].database, required.database);
  assert.equal(r.rows[0].user, required.user);
  await sql("CREATE TABLE members (id UUID PRIMARY KEY, tier TEXT DEFAULT 'free', roles TEXT[] DEFAULT ARRAY['member'])");
  await sql(fs.readFileSync(path.join(root, 'database/migrations/20260119000001_auth_sessions.sql'), 'utf8'));
  tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'soullab-stageq-webkit-'));
  const key = path.join(tmpdir, 'fictional.key');
  const cert = path.join(tmpdir, 'fictional.crt');
  const result = spawnSync('openssl', [
    'req', '-x509', '-nodes', '-newkey', 'rsa:2048', '-days', '1',
    '-keyout', key, '-out', cert,
    '-subj', '/CN=127.0.0.1',
    '-addext', 'subjectAltName=IP:127.0.0.1',
  ], { stdio: 'ignore' });
  assert.equal(result.status, 0, 'Ephemeral local TLS certificate generation must pass');
  fs.chmodSync(key, 0o600);
  server = https.createServer({
    key: fs.readFileSync(key),
    cert: fs.readFileSync(cert),
  }, (req, res) => { void handleHttps(req, res); });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  browser = await webkit.launch({ headless: true });
});

test.after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  if (db) await db.end();
  if (tmpdir) fs.rmSync(tmpdir, { recursive: true, force: true });
});

test('WebKit receives actual Secure HttpOnly session; sign-out expires it and denies replay', async () => {
  const { context, page } = await makePage();
  try {
    const start = await webFetch(page, '/fixture/start', { method: 'POST' });
    assert.equal(start.status, 200);
    const session = issued.at(-1);
    const authCookies = await context.cookies(origin);
    const cookie = authCookies.find(c => c.name === 'maia_session');
    assert.ok(cookie, 'WebKit must store the issued session cookie');
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(await page.evaluate(() => document.cookie.includes('maia_session')), false);
    const before = await webFetch(page, '/api/protected');
    assert.equal(before.status, 200);
    assert.equal(before.body.authenticated, true);
    const out = await webFetch(page, '/api/members/signout', { method: 'POST' });
    assert.equal(out.status, 200);
    assert.equal(out.body.serverSessionRevoked, true);
    assert.equal(await isRevoked(session.sessionToken), true);
    const after = await context.cookies(origin);
    assert.equal(after.some(c => c.name === 'maia_session'), false);
    assert.equal((await webFetch(page, '/api/protected')).status, 401);
    const replay = await webFetch(page, '/api/protected', {
      headers: { 'x-session-token': session.sessionToken },
    });
    assert.equal(replay.status, 401);
    const requests = observed.filter(x => x.path === '/api/members/signout').slice(-1);
    assert.equal(requests[0].origin, origin);
    assert.equal(requests[0].host, host + ':' + port);
  } finally {
    await context.close();
  }
});

test('WebKit header-only session revokes without relying on cookies', async () => {
  const memberId = await newMember();
  const session = await newSession(memberId);
  const { context, page } = await makePage();
  try {
    assert.equal((await context.cookies(origin)).some(c => c.name === 'maia_session'), false);
    const before = await webFetch(page, '/api/protected', {
      headers: { 'x-session-token': session.sessionToken },
    });
    assert.equal(before.status, 200);
    const out = await webFetch(page, '/api/members/signout', {
      method: 'POST',
      headers: { 'x-session-token': session.sessionToken },
    });
    assert.equal(out.status, 200);
    assert.equal(out.body.serverSessionRevoked, true);
    assert.equal(await isRevoked(session.sessionToken), true);
    const replay = await webFetch(page, '/api/protected', {
      headers: { 'x-session-token': session.sessionToken },
    });
    assert.equal(replay.status, 401);
  } finally { await context.close(); }
});

test('reviewed browser helper drives two separate WebKit POSTs for distinct sessions', async () => {
  const { context, page } = await makePage();
  try {
    await webFetch(page, '/fixture/start', { method: 'POST' });
    const cookieToken = issued.at(-1).sessionToken;
    const memberId = issued.at(-1).memberId;
    const headerToken = (await newSession(memberId)).sessionToken;
    const before = observed.length;
    const result = await client.signOutWebCredentials(
      (endpoint, options) => webClientTransport(page, endpoint, options), headerToken
    );
    assert.equal(result.kind, 'complete');
    assert.equal(result.confirmedRevocations, 2);
    assert.equal(await isRevoked(cookieToken), true);
    assert.equal(await isRevoked(headerToken), true);
    const posts = observed.slice(before).filter(x => x.path === '/api/members/signout');
    assert.equal(posts.length, 2);
    assert.equal(posts[0].hadCookie, true);
    assert.equal(posts[0].hadHeader, false);
    assert.equal(posts[1].hadCookie, false);
    assert.equal(posts[1].hadHeader, true);
  } finally { await context.close(); }
});

test('WebKit conflict refuses two live sessions and retains browser cookie', async () => {
  const { context, page } = await makePage();
  try {
    await webFetch(page, '/fixture/start', { method: 'POST' });
    const cookieToken = issued.at(-1).sessionToken;
    const headerToken = (await newSession(issued.at(-1).memberId)).sessionToken;
    const out = await webFetch(page, '/api/members/signout', {
      method: 'POST',
      headers: { 'x-session-token': headerToken },
    });
    assert.equal(out.status, 409);
    assert.equal(await isRevoked(cookieToken), false);
    assert.equal(await isRevoked(headerToken), false);
    assert.equal((await context.cookies(origin)).some(c => c.name === 'maia_session'), true);
  } finally { await context.close(); }
});

test('WebKit sees HTTP 503 and cookie expiry while SQL bearer remains valid until retry', async () => {
  const { context, page } = await makePage();
  try {
    await webFetch(page, '/fixture/start', { method: 'POST' });
    const token = issued.at(-1).sessionToken;
    await sql("CREATE FUNCTION stageq_webkit_reject() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fictional SQL revocation refusal'; END; $$");
    await sql('CREATE TRIGGER stageq_webkit_refusal BEFORE UPDATE OF revoked ON auth_sessions FOR EACH ROW EXECUTE FUNCTION stageq_webkit_reject()');
    const previousError = console.error;
    console.error = () => {};
    let out;
    try {
      out = await webFetch(page, '/api/members/signout', { method: 'POST' });
    } finally {
      console.error = previousError;
      await sql('DROP TRIGGER stageq_webkit_refusal ON auth_sessions');
      await sql('DROP FUNCTION stageq_webkit_reject()');
    }
    assert.equal(out.status, 503);
    assert.equal(out.body.success, false);
    assert.equal(out.body.localCookiesCleared, true);
    assert.equal(out.body.serverSessionRevoked, false);
    assert.equal((await context.cookies(origin)).some(c => c.name === 'maia_session'), false);
    assert.equal(await isRevoked(token), false);
    const replay = await webFetch(page, '/api/protected', {
      headers: { 'x-session-token': token },
    });
    assert.equal(replay.status, 200, 'Unrevoked bearer must not be misreported as revoked');
    const retry = await webFetch(page, '/api/members/signout', {
      method: 'POST',
      headers: { 'x-session-token': token },
    });
    assert.equal(retry.status, 200);
    assert.equal(retry.body.serverSessionRevoked, true);
    assert.equal((await webFetch(page, '/api/protected', {
      headers: { 'x-session-token': token },
    })).status, 401);
  } finally { await context.close(); }
});