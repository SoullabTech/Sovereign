/**
 * SOULLAB-FWE-01: TEST-ONLY, OFFLINE, LOOPBACK browser/API episode.
 *
 * IMPORTANT: The HTML is a synthetic navigation projection, NOT the real
 * Next.js Home/House or Writer's Studio React UI. We run the actual source
 * for auth/proxy, Living Work/manuscript/context reads and section-save PUT.
 * MAIA, sign-in, and unsaved-leave affordances are explicitly simulated.
 *
 * Requires env -i, CI=true, FWE01_PG_SOCKET under /private/tmp, no real
 * provider or database environment, and one disposable PG17 instance.
 */
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';
import { chromium, type Browser } from 'playwright';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const WORK = '33333333-3333-4333-8333-333333333333';
const MANUSCRIPT = '44444444-4444-4444-8444-444444444444';
const SECTION = '66666666-6666-4666-8666-666666666666';
const A_TOKEN = 'FWE01_FICTIONAL_A_SESSION';
const B_TOKEN = 'FWE01_FICTIONAL_B_SESSION';
const A_FRESH = 'FWE01_FICTIONAL_A_FRESH_SESSION';
const ORIGINAL = 'A fictional opening passage.';
const WRITTEN = 'A fictional opening passage. The writer adds one small sentence.';
const MALICIOUS_STALE = 'A fabricated stale overwrite attempt.';

let mockPool: Pool;
let mockCookieToken: string | null = null;
let mockHeaderValue: string | null = null;
let mockObservedQueries = 0;

jest.mock('next/headers', () => ({
  __esModule: true,
  cookies: async () => ({
    get: (name: string) => name === 'maia_session' && mockCookieToken
      ? { name, value: mockCookieToken } : undefined,
  }),
  headers: async () => new Headers(mockHeaderValue ? { 'x-session-token': mockHeaderValue } : {}),
}));
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => {
    mockObservedQueries++;
    return mockPool.query(sql, params as unknown[] | undefined);
  },
  transaction: async <T>(callback: (tx: {
    query: (sql: string, params?: unknown[]) => Promise<unknown>;
  }) => Promise<T>): Promise<T> => {
    const client = await mockPool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback({
        query: (sql, params) => client.query(sql, params as unknown[] | undefined),
      });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
}));

// This route's Cabin branch is never exercised in the fictional WEB test.
// Refuse any accidental offline-member/file-store path rather than importing
// server-only Cabin infrastructure into the isolated Jest runner.
jest.mock('@/lib/cabin/request', () => ({
  __esModule: true,
  cabinStore: () => { throw new Error('FWE01_REFUSE_CABIN_FILESYSTEM'); },
  cabinMemberFromRequest: () => { throw new Error('FWE01_REFUSE_CABIN_MEMBER'); },
  setCabinSessionCookie: () => { throw new Error('FWE01_REFUSE_CABIN_COOKIE'); },
}));

import { requireMemberId } from '@/lib/auth/session';
import { proxy } from '@/proxy';
import { GET as worksGET } from '@/app/api/sovereign/living-works/route';
import { GET as manuscriptsGET } from '@/app/api/sovereign/manuscripts/route';
import { GET as contextGET } from '@/app/api/writers-studio/rebuild/context/route';
import { PUT as sectionPUT } from '@/app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route';
import { GET as admissionGET } from '@/app/api/house-studio/admission/route';
import { houseWritingHref } from '@/app/writers-studio/h1Arrival';
import { studioArrivalFromHouse } from '@/app/writers-studio/situatedWork';

const isReady = process.env.FWE01_WITNESS === '1' ? describe : describe.skip;
let server: Server;
let browser: Browser;
let origin = '';

function gitBlob(path: string): string {
  const bytes = readFileSync(path);
  return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
}
function tokenFromCookie(value: string | undefined): string | null {
  const fragment = value?.split(';').map(x => x.trim())
    .find(x => x.startsWith('maia_session='));
  return fragment ? fragment.substring('maia_session='.length) : null;
}
function safeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
async function sendResponse(out: ServerResponse, response: Response) {
  const body = Buffer.from(await response.arrayBuffer());
  out.writeHead(response.status, {
    'content-type': response.headers.get('content-type') ?? 'application/json',
    'cache-control': 'no-store',
    'x-fwe01-test-harness': 'not-the-running-soullab-ui',
  });
  out.end(body);
}
function html(out: ServerResponse, status: number, body: string, cookie?: string) {
  out.writeHead(status, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'x-fwe01-test-harness': 'synthetic-navigation',
    ...(cookie ? { 'set-cookie': cookie } : {}),
  });
  out.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>' +
    '<body><strong>FWE-01 FICTIONAL BROWSER HARNESS — NOT THE SOULLAB APPLICATION</strong>' +
    body + '</body></html>');
}
function makeNextReq(incoming: IncomingMessage, path: string, raw?: Buffer): NextRequest {
  const headers = new Headers(incoming.headers as Record<string, string>);
  const method = incoming.method ?? 'GET';
  return new NextRequest(origin + path, {
    method,
    headers,
    ...(raw && raw.length ? { body: raw } : {}),
  });
}
async function readIncomingBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const part of req) chunks.push(Buffer.isBuffer(part) ? part : Buffer.from(part));
  return Buffer.concat(chunks);
}

async function handler(incoming: IncomingMessage, outgoing: ServerResponse) {
  try {
    const path = incoming.url ?? '/';
    const url = new URL(path, origin);
    // Never accept any public hostname or unexpected test-only path.
    const allowed = new Set(['/home', '/writers-studio', '/fwe01/signout',
      '/fwe01/signin', '/api/sovereign/living-works',
      '/api/sovereign/manuscripts', '/api/writers-studio/rebuild/context',
      '/api/house-studio/admission']);
    const sectionPath = '/api/sovereign/manuscripts/' + MANUSCRIPT +
      '/sections/' + SECTION;
    if (!allowed.has(url.pathname) && url.pathname !== sectionPath) {
      html(outgoing, 404, '<p>Not a fictional route.</p>');
      return;
    }
    mockCookieToken = tokenFromCookie(incoming.headers.cookie);
    mockHeaderValue = typeof incoming.headers['x-session-token'] === 'string'
      ? incoming.headers['x-session-token'] : null;

    if (url.pathname === '/fwe01/signout') {
      if (mockCookieToken) {
        await mockPool.query('UPDATE auth_sessions SET revoked=TRUE WHERE session_token=$1',
          [mockCookieToken]);
      }
      html(outgoing, 200, '<h2>Fictional session ended</h2>' +
        '<a id="fresh-session" href="/fwe01/signin?actor=a-fresh">Start a different fictional A session</a>',
      'maia_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
      return;
    }
    if (url.pathname === '/fwe01/signin') {
      if (url.searchParams.get('actor') !== 'a-fresh') {
        html(outgoing, 403, 'Only fictional A refresh is permitted.');
        return;
      }
      await mockPool.query(
        'INSERT INTO auth_sessions(member_id,session_token,expires_at,revoked) ' +
        'VALUES($1,$2,NOW()+interval \'2 hours\',FALSE) ' +
        'ON CONFLICT(session_token) DO NOTHING',
        [A, A_FRESH],
      );
      html(outgoing, 200, '<p id="fresh-session-status">Fictional new session issued</p>' +
        '<a id="return-home" href="/home">Return to Home</a>',
        'maia_session=' + A_FRESH + '; Path=/; HttpOnly; SameSite=Lax');
      return;
    }

    const body = incoming.method === 'PUT' ? await readIncomingBody(incoming) : undefined;
    const req = makeNextReq(incoming, path, body);
    if (url.pathname.startsWith('/api/')) {
      const result = await proxy(req);
      if (result.headers.get('x-middleware-next') !== '1') {
        await sendResponse(outgoing, result);
        return;
      }
      if (url.pathname === '/api/sovereign/living-works') {
        await sendResponse(outgoing, await worksGET(req));
      } else if (url.pathname === '/api/sovereign/manuscripts') {
        await sendResponse(outgoing, await manuscriptsGET(req));
      } else if (url.pathname === '/api/writers-studio/rebuild/context') {
        await sendResponse(outgoing, await contextGET(req));
      } else if (url.pathname === '/api/house-studio/admission') {
        await sendResponse(outgoing, await admissionGET(req));
      } else {
        await sendResponse(outgoing, await sectionPUT(req, {
          params: Promise.resolve({ id: MANUSCRIPT, sectionId: SECTION }),
        }));
      }
      return;
    }

    let member: string;
    try {
      member = await requireMemberId();
    } catch {
      html(outgoing, 401, '<h2>Sign in to your fictional Work</h2>' +
        '<p>Member authentication is required.</p>');
      return;
    }
    const workJson = await worksGET(req);
    const workBody = await workJson.json() as { works?: Array<{ id: string; title: string }> };
    if (url.pathname === '/home') {
      const works = workBody.works ?? [];
      const links = works.map(w =>
        '<li><span>' + safeHtml(w.title ?? '') + '</span> ' +
        '<a id="enter-writing" href="' +
        safeHtml(houseWritingHref(false, w.id, studioArrivalFromHouse)) + '">Writing</a></li>'
      ).join('');
      html(outgoing, 200, '<h1>Fictional House</h1><p id="member-scope">' +
        (member === A ? 'fictional A' : 'fictional B') +
        '</p><h2>What’s Alive</h2><ul id="works">' + links + '</ul>' +
        '<a id="signout" href="/fwe01/signout">Leave and sign out</a>');
      return;
    }
    const manuscripts = await manuscriptsGET(req);
    const list = (await manuscripts.json() as {
      manuscripts?: Array<{ id: string; title: string }>;
    }).manuscripts ?? [];
    if (url.searchParams.get('mode') !== 'write') {
      const options = list.map(m =>
        '<li><a id="choose-manuscript" href="/writers-studio?mode=write&amp;m=' +
        m.id + '">' + safeHtml(m.title ?? 'Unnamed') + '</a></li>').join('');
      html(outgoing, 200, '<h1>Fictional Writer’s Studio Home</h1>' +
        '<p>Select your manuscript. A Work URL parameter is not authority.</p>' +
        '<ul id="studio-manuscripts">' + options + '</ul>' +
        '<a href="/home">Back to fictional House</a>');
      return;
    }
    if (url.searchParams.get('m') !== MANUSCRIPT) {
      html(outgoing, 404, '<p>Unrecognized fictional manuscript.</p>');
      return;
    }
    const contextResponse = await contextGET(req);
    if (!contextResponse.ok) {
      await sendResponse(outgoing, contextResponse);
      return;
    }
    const snapshot = await contextResponse.json() as {
      state: string; title: string | null; version: number;
      sections?: Array<{ body: string; draftSectionId: string }>;
    };
    if (snapshot.state !== 'section_aware' ||
        snapshot.sections?.[0]?.draftSectionId !== SECTION) {
      html(outgoing, 409, '<p>Refused non-section-addressable manuscript.</p>');
      return;
    }
    const initialText = JSON.stringify(snapshot.sections[0].body);
    const savePath = JSON.stringify(sectionPath);
    const pageScript = [
      'const edit = document.getElementById("draft-text");',
      'const status = document.getElementById("save-status");',
      'let savedText = ' + initialText + ';',
      'let draftVersion = ' + snapshot.version + ';',
      'edit.addEventListener("input", () => { document.body.dataset.unsaved = edit.value !== savedText ? "true" : "false"; });',
      'document.getElementById("save-writing").addEventListener("click", async () => {',
      ' const r = await fetch(' + savePath + ', {method:"PUT",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({body:edit.value,baseVersion:draftVersion})});',
      ' const j = await r.json();',
      ' if (r.ok) { draftVersion = j.version; savedText = edit.value; document.body.dataset.unsaved = "false"; status.textContent = "Saved version " + j.version; }',
      ' else { status.textContent = "Save refused " + r.status; }',
      '});',
      'document.getElementById("simulated-maia").addEventListener("click", () => {',
      ' document.getElementById("maia-offer").textContent = "SIMULATED MAIA ALTERNATIVE: A different fictional sentence. No model was used; nothing was applied.";',
      '});',
      'document.getElementById("keep-own-words").addEventListener("click", () => {',
      ' document.getElementById("maia-offer").textContent = "Writer chose to keep their wording. No server write was sent.";',
      '});',
      // Harness-only guard; NOT evidence of the actual Writer’s Studio React guard.
      'window.addEventListener("beforeunload", event => { if (document.body.dataset.unsaved === "true") { event.preventDefault(); event.returnValue = ""; } });',
    ].join('\n');
    html(outgoing, 200, '<h1>Fictional Write surface</h1>' +
      '<p id="selected-work">' + safeHtml(snapshot.title ?? 'Untitled') + '</p>' +
      '<textarea id="draft-text">' + safeHtml(snapshot.sections[0].body) + '</textarea>' +
      '<p id="save-status">No new edit saved</p>' +
      '<button id="save-writing">Save writing</button>' +
      '<button id="simulated-maia">Show SIMULATED MAIA alternative</button>' +
      '<button id="keep-own-words">Keep my wording</button>' +
      '<p id="maia-offer"></p>' +
      '<a id="leave-to-house" href="/home">Leave for House</a>' +
      '<script>' + pageScript + '</script>');
  } catch (error) {
    console.error('FWE01_SYNTHETIC_ROUTE_FAILURE',error instanceof Error ? error.message : 'unknown');
    html(outgoing, 503, '<p>Test harness route failed closed.</p>');
  }
}

isReady('FWE-01 isolated loopback browser + real source handlers', () => {
  beforeAll(async () => {
    const socket = process.env.FWE01_PG_SOCKET;
    if (!socket ||
      !/^\/private\/tmp\/soullab-fwe01pg-20261019\.[A-Za-z0-9]+\/socket$/.test(socket) ||
      process.env.FWE01_PG_DATABASE !== 'c0_fwe_fictional' ||
      process.env.CI !== 'true' ||
      process.env.DATABASE_URL || process.env.SMTP_HOST ||
      process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
      throw new Error('FWE01_REFUSE_UNSAFE_PG_OR_PROVIDER_ENV');
    }
    const expected = [
      ['app/home/page.tsx','1061586de7585be2925b06c7344340fe46e01f3d'],
      ['app/writers-studio/page.tsx','56ff91dca2d18fd0d1d0d8968535f7f7bda2239c'],
      ['app/api/writers-studio/rebuild/context/route.ts','9e6886ac00f218325c21690e3cf87713b92e7421'],
      ['app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route.ts','47d8cd3c0b45abe958cc493513c7e8164bada4f2'],
    ];
    for (const [path, sha] of expected) {
      if (gitBlob(path) !== sha) throw new Error('FWE01_REFUSE_SOURCE_HASH_MISMATCH: ' + path);
    }
    mockPool = new Pool({
      host: socket, database: 'c0_fwe_fictional', user: 'soullab',
      port: 55484, max: 3, connectionTimeoutMillis: 2000,
    });
    const proof = await mockPool.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS socket_only,' +
      ' current_setting($1)::integer AS pg_version',
      ['server_version_num'],
    );
    if (proof.rows[0]?.db !== 'c0_fwe_fictional' ||
        proof.rows[0]?.socket_only !== true ||
        proof.rows[0]?.pg_version < 170000) {
      throw new Error('FWE01_REFUSE_DB_IDENTITY');
    }
    const counts = await mockPool.query(
      'SELECT (SELECT count(*) FROM members)::integer AS members,' +
      ' (SELECT count(*) FROM member_manuscripts)::integer AS manuscripts',
    );
    if (counts.rows[0]?.members !== 2 || counts.rows[0]?.manuscripts !== 1) {
      throw new Error('FWE01_REFUSE_NONFICTIONAL_FIXTURE');
    }
    server = createServer((incoming, outgoing) => { void handler(incoming, outgoing); });
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address() as AddressInfo;
    if (!address || address.address !== '127.0.0.1') {
      throw new Error('FWE01_REFUSE_NOT_LOOPBACK');
    }
    origin = 'http://127.0.0.1:' + address.port;
    browser = await chromium.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--disable-background-networking','--no-first-run'],
    });
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (server) await new Promise<void>((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve()));
    if (mockPool) await mockPool.end();
  });

  it('reuses exact canonical source instead of a copied React implementation', () => {
    expect(houseWritingHref(false, WORK, studioArrivalFromHouse))
      .toBe('/writers-studio');
    expect(gitBlob('app/home/page.tsx'))
      .toBe('1061586de7585be2925b06c7344340fe46e01f3d');
    expect(gitBlob('app/writers-studio/page.tsx'))
      .toBe('56ff91dca2d18fd0d1d0d8968535f7f7bda2239c');
  });

  it('runs a fictional A writing episode, choice, session departure, fresh return, and B refusals', async () => {
    const context = await browser.newContext({ viewport: {width: 1250, height: 800} });
    await context.route('**/*', route => {
      if (route.request().url().startsWith(origin + '/')) return route.continue();
      return route.abort();
    });
    await context.addCookies([
      {name:'maia_session',value:A_TOKEN,url:origin,sameSite:'Lax'},
    ]);
    const page = await context.newPage();
    const second = await browser.newContext();
    await second.route('**/*', route => {
      if (route.request().url().startsWith(origin + '/')) return route.continue();
      return route.abort();
    });
    try {
      await page.goto(origin + '/home');
      expect(await page.locator('#member-scope').textContent()).toBe('fictional A');
      expect(await page.locator('#works').textContent()).toContain('An entirely fictional book');
      await page.locator('#enter-writing').click();
      expect(new URL(page.url()).pathname).toBe('/writers-studio');
      expect(await page.locator('#studio-manuscripts').textContent()).toContain('Fictional Manuscript');
      await page.locator('#choose-manuscript').click();
      expect(new URL(page.url()).searchParams.get('mode')).toBe('write');
      expect(new URL(page.url()).searchParams.get('m')).toBe(MANUSCRIPT);
      expect(await page.locator('#draft-text').inputValue()).toBe(ORIGINAL);

      await page.locator('#draft-text').fill(WRITTEN);
      await page.locator('#save-writing').click();
      await page.waitForFunction(() => document.querySelector('#save-status')?.textContent === 'Saved version 2');
      const persisted = await mockPool.query(
        'SELECT text FROM manuscript_draft_sections WHERE id=$1',[SECTION]);
      expect(persisted.rows[0].text).toBe(WRITTEN);
      const draftVersion = await mockPool.query(
        'SELECT version,content FROM manuscript_working_drafts WHERE manuscript_id=$1',[MANUSCRIPT]);
      expect(draftVersion.rows[0].version).toBe(2);
      expect(draftVersion.rows[0].content).toBe(WRITTEN);

      await page.locator('#simulated-maia').click();
      expect(await page.locator('#maia-offer').textContent())
        .toContain('SIMULATED MAIA ALTERNATIVE');
      await page.locator('#keep-own-words').click();
      expect(await page.locator('#maia-offer').textContent()).toContain('Writer chose to keep');
      const afterSuggestion = await mockPool.query(
        'SELECT text FROM manuscript_draft_sections WHERE id=$1',[SECTION]);
      expect(afterSuggestion.rows[0].text).toBe(WRITTEN);

      // Real handler receives a stale-version edit without a body digest.
      const stale = await page.evaluate(async args => {
        const res = await fetch(args.url, {
          method: 'PUT', credentials:'same-origin',
          headers:{'content-type':'application/json'},
          body: JSON.stringify({body:args.text,baseVersion:1}),
        });
        return {status:res.status,body:await res.json()};
      }, {url:'/api/sovereign/manuscripts/'+MANUSCRIPT+'/sections/'+SECTION,
        text:MALICIOUS_STALE});
      expect(stale.status).toBe(409);

      // Signed-in but nonadmitted Work URL claims have NO H1 authority.
      const admission = await page.evaluate(async () => {
        const res = await fetch('/api/house-studio/admission?work=' +
          '33333333-3333-4333-8333-333333333333', {credentials:'same-origin'});
        return {status:res.status,body:await res.json()};
      });
      expect(admission).toMatchObject({status:200,body:{admitted:false}});

      // A completely independent B session cannot read or mutate A's content.
      await second.addCookies([
        {name:'maia_session',value:B_TOKEN,url:origin,sameSite:'Lax'},
      ]);
      const pageB = await second.newPage();
      await pageB.goto(origin + '/writers-studio?work=' + WORK);
      expect(await pageB.locator('#studio-manuscripts').textContent()).not.toContain('Fictional Manuscript');
      const denial = await pageB.evaluate(async args => {
        const c = await fetch('/api/writers-studio/rebuild/context?manuscriptId=' + args.manuscript);
        const w = await fetch('/api/sovereign/manuscripts/' + args.manuscript +
          '/sections/' + args.section, {
          method:'PUT',headers:{'content-type':'application/json'},
          body:JSON.stringify({body:'FICTIONAL_CROSS_MEMBER_OVERWRITE',baseVersion:2}),
        });
        const spoof = await fetch('/api/writers-studio/rebuild/context?manuscriptId=' + args.manuscript,
          {headers:{'x-member-id':args.owner}});
        return {context:c.status,put:w.status,claim:spoof.status};
      }, {manuscript:MANUSCRIPT,section:SECTION,owner:A});
      expect(denial.context).toBe(404);
      expect(denial.put).not.toBe(200);
      expect(denial.claim).not.toBe(200);

      await page.locator('#leave-to-house').click();
      expect(await page.locator('#member-scope').textContent()).toBe('fictional A');
      await page.locator('#signout').click();
      expect(await page.locator('h2').textContent()).toContain('Fictional session ended');
      const oldSession = await mockPool.query(
        'SELECT revoked FROM auth_sessions WHERE session_token=$1',[A_TOKEN]);
      expect(oldSession.rows[0].revoked).toBe(true);
      await page.goto(origin + '/home');
      expect((await page.locator('h2').textContent())?.toLowerCase()).toContain('sign in');

      await page.goto(origin + '/fwe01/signin?actor=a-fresh');
      expect(await page.locator('#fresh-session-status').textContent()).toContain('new session');
      const newSession = await mockPool.query(
        'SELECT member_id, revoked FROM auth_sessions WHERE session_token=$1',[A_FRESH]);
      expect(newSession.rows[0]).toMatchObject({member_id:A,revoked:false});
      await page.locator('#return-home').click();
      await page.locator('#enter-writing').click();
      await page.locator('#choose-manuscript').click();
      expect(await page.locator('#draft-text').inputValue()).toBe(WRITTEN);
      console.log('FWE01_FICTIONAL_BROWSER_WITNESS',
        JSON.stringify({source:'canonical-pinned',browser:'desktop-chrome-loopback',
          appUi:'simulated-navigation-only',actualHandlerRoutes:true,
          writerAEditSaved:true,staleSaveRefused:true,simulatedMaiaNoWrite:true,
          memberBCrossAccountDenied:true,oldSessionRevoked:true,
          freshSessionReopenedExactText:true,externalNetwork:false}));
    } finally {
      await context.close();
      await second.close();
    }
  }, 45000);
});
