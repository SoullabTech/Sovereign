// DESKTOP-SHELL-01 — the containment suite.
//
// The cut's whole claim is that one Desktop process can hold two authority
// domains without them collapsing into each other. That claim is worth exactly
// as much as the attempts made to break it, so this file is written as attacks
// rather than as descriptions.
//
// ⛔ WHY FAKES AND NOT REGEXES. Electron cannot run here, and the tempting move
// was to assert the security posture by matching strings in main.js. A boundary
// proven that way is a boundary nobody has ever pushed on: it would pass while
// `will-redirect` went unguarded, while `javascript:` was handed to the OS
// browser, while sign-out left a live authenticated cookie behind. So the shell
// takes its Electron surfaces as parameters and this suite drives the real
// logic with doubles. Source assertions appear only where the property IS the
// source — which preload the privileged window gets, and that no new IPC
// channel was opened.
//
// ⚠️ EVIDENCE CLASS: SOURCE/TEST. Nothing here is DEVICE or RUNTIME evidence.
// The legs that need a real Mac are named in the unit report, not implied here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs, { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'src');
const raw = (f) => readFileSync(path.join(srcDir, f), 'utf8');
const strip = (f) => raw(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');

const { createPlatformShell, MAIA, PLATFORM } = require('../src/shell.js');
const {
  PLATFORM_ORIGIN, PLATFORM_PARTITION, PLATFORM_WEB_PREFERENCES,
  REFUSED_PERMISSIONS, navigationDecision, platformEntryUrl, isPlatformUrl,
} = require('../src/shell-policy.js');
const { createSession } = require('../src/session.js');

const TOKEN = 'SECRET-SESSION-TOKEN';
const mainJs = strip('main.js');
const shellJs = strip('shell.js');

// ── the doubles ─────────────────────────────────────────────────────────────

function makePartition(name, log) {
  const cookies = [];
  return {
    name,
    handlers: {},
    cookies: {
      set: async (c) => { cookies.push(c); },
      all: () => cookies,
    },
    clearStorageData: async (opts) => {
      log.cleared.push({ partition: name, opts });
      cookies.length = 0;
    },
    setPermissionRequestHandler(fn) { this.handlers.request = fn; },
    setPermissionCheckHandler(fn) { this.handlers.check = fn; },
    setDevicePermissionHandler(fn) { this.handlers.device = fn; },
  };
}

function fakeElectron() {
  const log = { external: [], loaded: [], cleared: [], built: [], attached: [], titles: [] };
  const partitions = new Map();
  const sessionApi = {
    fromPartition(n) {
      if (!partitions.has(n)) partitions.set(n, makePartition(n, log));
      return partitions.get(n);
    },
    partitions,
  };

  class FakeBrowserView {
    constructor(opts) {
      log.built.push(opts);
      this.opts = opts;
      this.bounds = null;
      this.autoResize = null;
      const listeners = {};
      let destroyed = false;
      this.webContents = {
        listeners,
        windowOpenHandler: null,
        on: (evt, fn) => { (listeners[evt] ||= []).push(fn); },
        emit: (evt, ...args) => (listeners[evt] || []).forEach((fn) => fn(...args)),
        setWindowOpenHandler(fn) { this.windowOpenHandler = fn; },
        loadURL: async (u) => { log.loaded.push(u); },
        isDestroyed: () => destroyed,
        destroy: () => { destroyed = true; },
      };
    }
    setBounds(b) { this.bounds = b; }
    setAutoResize(a) { this.autoResize = a; }
  }

  const window = {
    current: undefined,
    title: null,
    setBrowserView(v) { this.current = v; log.attached.push(v ? 'view' : null); },
    getContentSize: () => [900, 700],
    isDestroyed: () => false,
    setTitle(t) { this.title = t; log.titles.push(t); },
  };

  const shellApi = { openExternal: (u) => { log.external.push(u); } };
  return { log, sessionApi, shellApi, window, BrowserView: FakeBrowserView };
}

/**
 * A real member session over a fake network — the credential is not faked.
 *
 * ⚠️ EACH GETS ITS OWN userData. The existing suites pass
 * `getPath: () => '/nonexistent-for-test'` on the assumption that persistence
 * quietly fails there. Under a root-owned CI container it does NOT fail —
 * `persist()` creates the directory at the filesystem root and writes a real
 * `session.bin`, which the NEXT `createSession` in the same run restores. A
 * test asserting "this member is signed out" then finds a session left behind
 * by an earlier test. Caught here by the not-signed-in case returning ok.
 * Recorded in the unit report; a fresh directory per session removes the
 * coupling deterministically rather than relying on a path being unwritable.
 */
const tempDirs = [];
function memberSession(token = TOKEN) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds01-'));
  tempDirs.push(dir);
  return createSession({
    app: { getPath: () => dir },
    safeStorage: { isEncryptionAvailable: () => false },
    fetchImpl: async () => ({
      ok: true, status: 200,
      json: async () => ({
        success: true, memberId: 'uuid-1', token,
        member: { id: 'uuid-1', username: 'kelly', name: 'Kelly', tier: 'free', roles: ['member'] },
      }),
    }),
  });
}

async function signedInShell(token = TOKEN) {
  const e = fakeElectron();
  const credential = memberSession(token);
  await credential.signIn('kelly', 'pw');
  const shell = createPlatformShell({
    BrowserView: e.BrowserView, sessionApi: e.sessionApi, shellApi: e.shellApi,
    window: e.window, credential, onPlace: (p) => e.window.setTitle(p),
  });
  return { ...e, credential, shell };
}

// ════════════════════════════════════════════════════════════════════════════
// F1 · ONE CREDENTIAL, ONE IDENTITY
// ════════════════════════════════════════════════════════════════════════════

test('F1 — the embedded surface is authenticated by the SAME credential, minted from main', async () => {
  const { shell, sessionApi, credential, log } = await signedInShell();
  const out = await shell.show();
  assert.equal(out.ok, true, `show() failed: ${out.error}`);

  const jar = sessionApi.fromPartition(PLATFORM_PARTITION).cookies.all();
  assert.equal(jar.length, 1, 'the shell wrote more than the one credential cookie');
  const c = jar[0];
  assert.equal(c.name, 'maia_session', 'not the canonical cookie readSessionCredential reads first');
  assert.equal(c.value, TOKEN, 'a different credential — that would be a second identity');
  assert.equal(c.url, credential.baseUrl, 'the credential was scoped to the wrong origin');
  assert.equal(c.httpOnly, true, 'the embedded page can read the credential from JS');
  assert.equal(c.secure, true);
  assert.equal(c.sameSite, 'lax');
  assert.equal(log.loaded[0], platformEntryUrl());
});

test('F1 — no identity or authority CLAIM is minted alongside the credential', async () => {
  const { shell, sessionApi } = await signedInShell();
  await shell.show();
  const names = sessionApi.fromPartition(PLATFORM_PARTITION).cookies.all().map((c) => c.name);
  // middleware stopped trusting these in AUTH-BOUNDARY-01B, and
  // getMemberFromRequest rejects a member-id claim that disagrees with the
  // session. Writing them would be Desktop asserting who it is.
  for (const claim of ['maia_member_id', 'maia_tier', 'maia_roles']) {
    assert.ok(!names.includes(claim), `Desktop asserted ${claim} — identity must be derived server-side`);
  }
});

test('F1 — entering the platform surface costs NO additional authentication call', async () => {
  const calls = [];
  const credential = createSession({
    app: { getPath: () => fs.mkdtempSync(path.join(os.tmpdir(), 'ds01-')) },
    safeStorage: { isEncryptionAvailable: () => false },
    fetchImpl: async (url) => {
      calls.push(url);
      return { ok: true, status: 200, json: async () => ({ success: true, memberId: 'u', token: TOKEN, member: { id: 'u', username: 'k' } }) };
    },
  });
  await credential.signIn('kelly', 'pw');
  const e = fakeElectron();
  const shell = createPlatformShell({ ...e, sessionApi: e.sessionApi, credential });
  await shell.show();
  await shell.hide();
  await shell.show();

  assert.equal(calls.length, 1, 'showing the platform surface minted a second session — one member, one auth_sessions row');
  assert.ok(calls[0].endsWith('/api/members/signin'));
});

// ⚠️ OPEN LEG, stated rather than faked. That exactly one `auth_sessions` row
// exists after sign-in + Journey is a DATABASE fact. Every assertion above is a
// source/unit proof that Desktop makes no second authentication request and
// reuses the one token; none of them observes postgres. The runtime leg is
// named in the unit report and is NOT claimed here.

// ════════════════════════════════════════════════════════════════════════════
// F2 · BRIDGE CONTAINMENT — the invariant
// ════════════════════════════════════════════════════════════════════════════

test('F2 — the platform view is constructed with NO preload, sandboxed and isolated', async () => {
  const { shell, log } = await signedInShell();
  await shell.show();

  assert.equal(log.built.length, 1);
  const prefs = log.built[0].webPreferences;
  assert.ok(!('preload' in prefs),
    'the remote view was given a preload — remote content would sit in front of a bridge');
  assert.equal(prefs.sandbox, true);
  assert.equal(prefs.contextIsolation, true);
  assert.equal(prefs.nodeIntegration, false);
  assert.equal(prefs.nodeIntegrationInSubFrames, false);
  assert.equal(prefs.webviewTag, false);
  assert.equal(prefs.webSecurity, true);
  assert.equal(prefs.partition, PLATFORM_PARTITION, 'the remote view shares a cookie jar with MAIA');
});

test('F2 — the containment prefs are FROZEN, so no call site can add a preload later', () => {
  assert.ok(Object.isFrozen(PLATFORM_WEB_PREFERENCES));
  assert.throws(() => { 'use strict'; PLATFORM_WEB_PREFERENCES.preload = '/evil.js'; });
  assert.ok(!('preload' in PLATFORM_WEB_PREFERENCES));
});

test('F2 — the shell hands the frozen object WHOLE; it never spreads or rebuilds it', () => {
  const build = /function build\(\)[\s\S]*?\n\}/.exec(shellJs)[0];
  assert.ok(build.includes('webPreferences: PLATFORM_WEB_PREFERENCES'),
    'the shell composes its own webPreferences — a composed object can grow a preload key');
  assert.ok(!/\.\.\.PLATFORM_WEB_PREFERENCES/.test(shellJs), 'the frozen prefs were spread into a mutable copy');
});

test('F2 — the PRIVILEGED renderer keeps its preload, and only the BrowserWindow gets one', () => {
  // The property is the source: which webContents is handed preload.js.
  const preloadSites = mainJs.match(/preload:\s*path\.join\(__dirname,\s*'preload\.js'\)/g) || [];
  assert.equal(preloadSites.length, 1, 'preload.js is attached in more than one place');
  const win = /mainWindow = new BrowserWindow\(\{[\s\S]*?\n  \}\);/.exec(mainJs)[0];
  assert.ok(win.includes("preload: path.join(__dirname, 'preload.js')"),
    'the MAIA renderer lost its bridge');
  assert.ok(win.includes('contextIsolation: true') && win.includes('sandbox: true'));
});

test('F2 — the shell modules never name a preload, a bridge, or the token', () => {
  for (const [file, source] of [['shell.js', shellJs], ['shell-policy.js', strip('shell-policy.js')]]) {
    for (const banned of ['preload', 'contextBridge', 'nodeIntegration: true', 'token']) {
      // `nodeIntegration: false` is expected in the policy; only the true form is banned.
      if (banned === 'preload' && file === 'shell-policy.js') continue;
      assert.ok(!source.includes(banned), `${file} references ${banned}`);
    }
  }
  // The policy names `preload` only to assert its absence in a comment, which
  // strip() removes — so the code itself must be clean too.
  assert.ok(!/preload\s*:/.test(strip('shell-policy.js')), 'shell-policy.js sets a preload key');
});

test('F2 — the MAIA renderer can never navigate, so remote content cannot reach the bridge', () => {
  assert.ok(/mainWindow\.webContents\.on\('will-navigate',\s*\(event\)\s*=>\s*event\.preventDefault\(\)\)/.test(mainJs),
    'the privileged renderer can be navigated — that is the collapse this unit forbids');
  assert.ok(/mainWindow\.webContents\.setWindowOpenHandler/.test(mainJs),
    'the privileged renderer can open an ungoverned second renderer');
});

// ════════════════════════════════════════════════════════════════════════════
// F3 · NAVIGATION CONTAINMENT
// ════════════════════════════════════════════════════════════════════════════

test('F3 — the origin test cannot be fooled by a lookalike host', () => {
  assert.equal(navigationDecision('https://soullab.life/journey').action, 'allow');
  assert.equal(navigationDecision('https://soullab.life/settings?x=1#y').action, 'allow');
  // ⭐ The one a startsWith() check would have admitted. A different site that
  // reads like ours must never load inside Desktop.
  assert.equal(navigationDecision('https://soullab.life.evil.com/journey').action, 'external');
  assert.equal(navigationDecision('https://evil.com/https://soullab.life').action, 'external');
  assert.equal(navigationDecision('https://api.soullab.life/x').action, 'external');
  assert.equal(navigationDecision('http://soullab.life/journey').action, 'external', 'a scheme downgrade was treated as our origin');
  assert.ok(isPlatformUrl(`${PLATFORM_ORIGIN}/anything`));
  assert.ok(!isPlatformUrl('https://soullab.life.evil.com'));
});

test('F3 — javascript:, file:, data: and about: are BLOCKED, never handed to the OS', () => {
  for (const url of [
    'javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,<script>1</script>',
    'about:blank', 'chrome://settings', 'ftp://x/y', '', 'not a url', null, undefined,
  ]) {
    const d = navigationDecision(url);
    assert.equal(d.action, 'block', `${String(url)} was not blocked (got ${d.action})`);
  }
});

test('F3 — a foreign navigation is prevented AND opened in the OS browser', async () => {
  const { shell, log } = await signedInShell();
  await shell.show();
  const wc = shell._view().webContents;

  let prevented = false;
  wc.emit('will-navigate', { preventDefault: () => { prevented = true; } }, 'https://example.com/x');
  assert.ok(prevented, 'a foreign origin was allowed to load in the platform renderer');
  assert.deepEqual(log.external, ['https://example.com/x']);
});

test('F3 — a javascript: navigation is prevented and NOT handed to the OS browser', async () => {
  const { shell, log } = await signedInShell();
  await shell.show();
  let prevented = false;
  shell._view().webContents.emit('will-navigate',
    { preventDefault: () => { prevented = true; } }, 'javascript:fetch("//evil")');
  assert.ok(prevented);
  assert.deepEqual(log.external, [],
    'a javascript: URL was passed to openExternal — code execution pointed at the member\'s machine');
});

test('F3 — REDIRECTS are guarded by the same rule as navigations', async () => {
  const { shell, log } = await signedInShell();
  await shell.show();
  const wc = shell._view().webContents;
  assert.ok(wc.listeners['will-redirect'], 'will-redirect is unguarded — a redirect escapes containment');

  let prevented = false;
  wc.emit('will-redirect', { preventDefault: () => { prevented = true; } }, 'https://evil.com/');
  assert.ok(prevented, 'a redirect to a foreign origin loaded inside Desktop');
  assert.deepEqual(log.external, ['https://evil.com/']);
});

test('F3 — internal navigation inside the platform origin is allowed to proceed', async () => {
  const { shell } = await signedInShell();
  await shell.show();
  let prevented = false;
  shell._view().webContents.emit('will-navigate',
    { preventDefault: () => { prevented = true; } }, `${PLATFORM_ORIGIN}/settings`);
  assert.equal(prevented, false, 'the platform view cannot move within its own origin');
});

test('F3 — window.open is DENIED in every case; no second renderer is ever created', async () => {
  const { shell, log } = await signedInShell();
  await shell.show();
  const handler = shell._view().webContents.windowOpenHandler;
  assert.ok(handler, 'no window-open policy — the default would create an ungoverned renderer');

  // Internal, external and hostile all deny. External still reaches the member.
  assert.deepEqual(handler({ url: `${PLATFORM_ORIGIN}/x` }), { action: 'deny' });
  assert.deepEqual(handler({ url: 'https://example.com/' }), { action: 'deny' });
  assert.deepEqual(handler({ url: 'javascript:alert(1)' }), { action: 'deny' });
  assert.deepEqual(log.external, ['https://example.com/'],
    'either an external link was swallowed, or a javascript: URL reached the OS');
});

// ════════════════════════════════════════════════════════════════════════════
// F4 · PERMISSION CONTAINMENT
// ════════════════════════════════════════════════════════════════════════════

test('F4 — the platform partition refuses every permission, including invented ones', async () => {
  const { shell, sessionApi } = await signedInShell();
  await shell.show();
  const h = sessionApi.fromPartition(PLATFORM_PARTITION).handlers;
  assert.ok(h.request && h.check && h.device, 'a permission handler was never installed');

  for (const p of [...REFUSED_PERMISSIONS, 'a-permission-chromium-adds-in-2027']) {
    let answer = null;
    h.request({}, p, (v) => { answer = v; });
    assert.equal(answer, false, `${p} was GRANTED to remote content`);
    assert.equal(h.check({}, p), false, `${p} passes the synchronous check`);
  }
  assert.equal(h.device({}), false, 'the device itself is reachable even with permission refused');
});

test('F4 — microphone and camera are named refusals, not incidental ones', async () => {
  const { shell, sessionApi } = await signedInShell();
  await shell.show();
  const h = sessionApi.fromPartition(PLATFORM_PARTITION).handlers;
  for (const p of ['media', 'audioCapture', 'videoCapture', 'display-capture']) {
    let answer = null;
    h.request({}, p, (v) => { answer = v; });
    assert.equal(answer, false);
    assert.ok(REFUSED_PERMISSIONS.includes(p), `${p} is not in the enumerated refusal list`);
  }
});

test('F4 — the MAIA side keeps its microphone: the audio grant is on the DEFAULT session', () => {
  // Two different sessions, so the platform refusal cannot reach MAIA and the
  // MAIA grant cannot reach the platform view.
  assert.ok(/session\.defaultSession\.setPermissionRequestHandler/.test(mainJs),
    'the MAIA microphone grant was removed or moved off the default session');
  assert.ok(/permission === 'media' \|\| permission === 'audioCapture'/.test(mainJs),
    'the MAIA audio grant changed shape — the voice path must not be weakened here');
  assert.ok(!new RegExp(`defaultSession[\\s\\S]{0,400}${PLATFORM_PARTITION}`).test(mainJs),
    'the platform partition and the default session were conflated');
});

test('F4 — the guard is armed on the PARTITION, once, so a rebuilt view is never unguarded', async () => {
  const { shell, sessionApi } = await signedInShell();
  await shell.show();
  const first = sessionApi.fromPartition(PLATFORM_PARTITION).handlers.request;
  await shell.destroy();
  await shell.show();                    // a brand-new view, same partition
  const after = sessionApi.fromPartition(PLATFORM_PARTITION).handlers.request;
  assert.equal(after, first, 'the handler was re-installed per view — a view could exist before one was');
  let answer = null;
  after({}, 'media', (v) => { answer = v; });
  assert.equal(answer, false, 'the rebuilt view has a microphone');
});

// ════════════════════════════════════════════════════════════════════════════
// F5 · NO PRELOAD AUTHORITY EXPANSION
// ════════════════════════════════════════════════════════════════════════════

test('F5 — DS01 opens no IPC channel; navigation stays main\'s authority', () => {
  const { INVOKE_CHANNEL_NAMES, PUSH_CHANNEL_NAMES } = require('./d01-preload-allowlist.mjs');
  assert.equal(INVOKE_CHANNEL_NAMES.length, 10, 'the ratified invoke allow-list changed size');
  assert.equal(PUSH_CHANNEL_NAMES.length, 6, 'the ratified push allow-list changed size');

  for (const source of [shellJs, strip('shell-policy.js')]) {
    assert.ok(!/ipcMain|ipcRenderer|exposeInMainWorld/.test(source),
      'a shell module opened its own channel');
  }
  // ⛔ The renderer must have no verb that reaches the platform view. If it
  // did, a compromised MAIA renderer could summon remote content into its own
  // window — the exact collapse the invariant forbids.
  const preload = strip('preload.js');
  for (const banned of ['journey', 'platform', 'navigate', 'goTo', 'showPlatform']) {
    assert.ok(!preload.toLowerCase().includes(banned), `preload exposes ${banned} to the renderer`);
  }
});

test('F5 — destinations are driven from the application menu, in main', () => {
  assert.ok(/Menu\.setApplicationMenu/.test(mainJs), 'no main-owned navigation surface');
  assert.ok(/accelerator: 'Alt\+CmdOrCtrl\+M'/.test(mainJs), 'the return-to-MAIA accelerator is missing');
  assert.ok(/accelerator: 'Alt\+CmdOrCtrl\+J'/.test(mainJs));
  // The remaining IA destinations exist and are visibly unavailable, not absent.
  for (const d of ['Sessions', 'Library', 'Settings']) {
    assert.ok(new RegExp(`label: '${d}'[^}]*enabled: false`).test(mainJs),
      `${d} is not present-and-disabled`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADVERSARIAL — §7
// ════════════════════════════════════════════════════════════════════════════

test('ADVERSARIAL — repeated switching never accumulates a second remote view', async () => {
  const { shell, log } = await signedInShell();
  for (let i = 0; i < 5; i++) { await shell.show(); shell.hide(); }
  await shell.show();
  assert.equal(log.built.length, 1, `${log.built.length} remote views exist — hidden views accumulated`);
});

test('ADVERSARIAL — returning to MAIA detaches without destroying, so the conversation survives', async () => {
  const { shell, window, log } = await signedInShell();
  await shell.show();
  const view = shell._view();
  shell.hide();

  assert.equal(shell.place(), MAIA);
  assert.equal(window.current, null, 'the platform view stayed attached over MAIA');
  assert.equal(view.webContents.isDestroyed(), false, 'the view was destroyed on a mere return');
  await shell.show();
  assert.equal(shell._view(), view, 'the same view was not reused');
  // The MAIA webContents is never touched by the shell at all — the strongest
  // form of the continuity claim. Nothing to restore, because nothing happened.
  assert.ok(!/mainWindow\.webContents\.(reload|loadFile|loadURL)/.test(
    shellJs + mainJs.slice(mainJs.indexOf('function goTo'))),
    'a destination change reloads the MAIA renderer — the transcript would be lost');
  assert.equal(log.loaded.length, 2, 'the platform view reloaded unexpectedly');
});

test('ADVERSARIAL — sign-out takes the cookie, not just the view', async () => {
  const { shell, sessionApi, credential, log } = await signedInShell();
  await shell.show();
  assert.equal(sessionApi.fromPartition(PLATFORM_PARTITION).cookies.all().length, 1);
  const view = shell._view();

  await shell.destroy();

  assert.equal(sessionApi.fromPartition(PLATFORM_PARTITION).cookies.all().length, 0,
    'a signed-out member left an authenticated cookie resident in the partition');
  assert.ok(log.cleared.some((c) => c.partition === PLATFORM_PARTITION));
  assert.equal(view.webContents.isDestroyed(), true, 'the authenticated view outlived the session');
  assert.equal(shell._view(), null);
  assert.equal(shell.place(), MAIA, 'the member was left staring at a torn-down surface');
  credential.signOut();
});

test('ADVERSARIAL — an EXPIRED session runs the same teardown as the sign-out button', () => {
  // session.js discovers a 401 by itself and signs out internally; before
  // onSignedOut, main never learned, and the remote view kept its cookie.
  assert.ok(/onSignedOut: teardownMemberState/.test(mainJs),
    'main does not observe an expiry-driven sign-out');
  const teardown = /function teardownMemberState\(\)[\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(/platformShell\.destroy\(\)/.test(teardown),
    'teardown hides the platform view instead of destroying it — the cookie would survive');
  const handler = /ipcMain\.handle\('maia:sign-out'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(!/threadWatch\.stop/.test(handler),
    'the button has its own teardown copy — two paths that can drift apart');
});

test('ADVERSARIAL — signOut fires the callback exactly once, and not for a no-op', async () => {
  let fired = 0;
  const s = createSession({
    app: { getPath: () => fs.mkdtempSync(path.join(os.tmpdir(), 'ds01-')) },
    safeStorage: { isEncryptionAvailable: () => false },
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ success: true, token: TOKEN, member: { username: 'k' } }) }),
    onSignedOut: () => { fired += 1; },
  });
  s.signOut();
  assert.equal(fired, 0, 'signing out when nobody was signed in tore down live state');
  await s.signIn('kelly', 'pw');
  s.signOut();
  s.signOut();
  assert.equal(fired, 1, 'teardown ran more than once for one sign-out');
});

test('ADVERSARIAL — a STALE token cannot survive into the view: the cookie is re-minted per show', async () => {
  const e = fakeElectron();
  const credential = memberSession('TOKEN-A');
  await credential.signIn('kelly', 'pw');
  const shell = createPlatformShell({ ...e, sessionApi: e.sessionApi, credential });
  await shell.show();
  shell.hide();

  // The member re-authenticated while Journey sat detached.
  const second = memberSession('TOKEN-B');
  await second.signIn('kelly', 'pw');
  const shell2 = createPlatformShell({ ...e, sessionApi: e.sessionApi, credential: second });
  await shell2.show();

  const values = e.sessionApi.fromPartition(PLATFORM_PARTITION).cookies.all().map((c) => c.value);
  assert.equal(values[values.length - 1], 'TOKEN-B', 'the view was loaded with a stale credential');
});

test('ADVERSARIAL — no view and no cookie exist for a member who is not signed in', async () => {
  const e = fakeElectron();
  const credential = memberSession();          // never signed in
  const shell = createPlatformShell({ ...e, sessionApi: e.sessionApi, credential });
  const out = await shell.show();

  assert.equal(out.ok, false);
  assert.equal(e.log.built.length, 0, 'a remote view was built for nobody');
  assert.equal(e.log.loaded.length, 0, 'remote content loaded without a member');
  assert.equal(e.sessionApi.fromPartition(PLATFORM_PARTITION).cookies.all().length, 0);
  assert.equal(shell.place(), MAIA);
});

test('ADVERSARIAL — a failed mint does not attach a blank authenticated-looking view', async () => {
  const e = fakeElectron();
  const shell = createPlatformShell({
    ...e, sessionApi: e.sessionApi,
    credential: { mintWebSession: async () => ({ ok: false, error: 'cookie jar refused' }) },
  });
  const out = await shell.show();
  assert.equal(out.ok, false);
  assert.equal(out.error, 'cookie jar refused');
  assert.equal(e.log.built.length, 0);
  assert.equal(e.window.current, undefined, 'an empty view was attached over MAIA');
});

test('ADVERSARIAL — the token never reaches the shell, a log, or an external handoff', async () => {
  const { shell, log, credential } = await signedInShell();
  await shell.show();
  shell._view().webContents.emit('will-navigate', { preventDefault() {} }, 'https://example.com/');

  assert.ok(!raw('shell.js').includes(TOKEN));
  assert.ok(!shellJs.includes('token'), 'shell.js names the credential it must never hold');
  assert.ok(!JSON.stringify(log).includes(TOKEN), 'the token appears in a loaded URL, a title or an external handoff');
  assert.ok(!JSON.stringify(Object.keys(shell)).includes('token'));
  assert.ok(!JSON.stringify(credential.state()).includes(TOKEN));
  // A query-string credential would put the token in history, logs and referers.
  assert.ok(!log.loaded.some((u) => /token|_t=|session=/i.test(u)),
    'the credential was carried in the URL rather than in the cookie jar');
});

test('ADVERSARIAL — a mint failure message cannot smuggle the credential into an error', async () => {
  const credential = memberSession();
  await credential.signIn('kelly', 'pw');
  const out = await credential.mintWebSession({
    set: async () => { throw new Error('jar exploded'); },
  });
  assert.equal(out.ok, false);
  assert.ok(!JSON.stringify(out).includes(TOKEN), 'the token leaked through an error path');
});

test('ADVERSARIAL — the view is sized to the window and follows a resize', async () => {
  const { shell } = await signedInShell();
  await shell.show();
  assert.deepEqual(shell._view().bounds, { x: 0, y: 0, width: 900, height: 700 });
  assert.deepEqual(shell._view().autoResize, { width: true, height: true });
  assert.ok(/mainWindow\.on\('resize'/.test(mainJs), 'the view does not follow a window resize');
});

test('ADVERSARIAL — the platform view does not outlive the window that owns it', () => {
  const closed = /mainWindow\.on\('closed'[\s\S]*?\n  \}\);/.exec(mainJs)[0];
  assert.ok(/platformShell\.destroy\(\)/.test(closed), 'a closed window leaves a live remote view behind');
});

test('ADVERSARIAL — no destination opens remote content for a signed-out member', () => {
  const goTo = /async function goTo\(id\)[\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(/signedIn/.test(goTo), 'Journey opens without a member');
  assert.ok(/id === MAIA/.test(goTo), 'there is no unconditional way back to MAIA');
  const menu = /function buildMenu\(\)[\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(/d\.id === MAIA \|\| signedIn/.test(menu), 'the menu offers destinations to nobody');
});

test('cleanup — temp session directories are removed', () => {
  for (const d of tempDirs) fs.rmSync(d, { recursive: true, force: true });
  assert.ok(tempDirs.length > 0);
});

test('ADVERSARIAL — the shell touches ONE partition and never the default session', async () => {
  const { shell, sessionApi } = await signedInShell();
  await shell.show();
  await shell.destroy();
  await shell.show();
  assert.deepEqual([...sessionApi.partitions.keys()], [PLATFORM_PARTITION],
    'the shell reached a session other than its own partition — cookie jars could be shared with MAIA');
});

test('ADVERSARIAL — a RESTORED session (the relaunch path) can mint without a fresh sign-in', async () => {
  // The real launch sequence: DI01 restores session.bin, nobody types a
  // password, and the member opens Journey. If minting required a live
  // sign-in, every relaunch would silently fail to authenticate the view.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds01-'));
  tempDirs.push(dir);
  const app = { getPath: () => dir };
  const safeStorage = { isEncryptionAvailable: () => false };
  const net = async () => ({ ok: true, status: 200, json: async () => ({ success: true, memberId: 'u', token: TOKEN, member: { id: 'u', username: 'kelly' } }) });

  await createSession({ app, safeStorage, fetchImpl: net }).signIn('kelly', 'pw');
  const relaunched = createSession({ app, safeStorage, fetchImpl: async () => { throw new Error('no network'); } });
  assert.equal(relaunched.state().signedIn, true);

  const e = fakeElectron();
  const shell = createPlatformShell({ ...e, sessionApi: e.sessionApi, credential: relaunched });
  const out = await shell.show();
  assert.equal(out.ok, true, `a relaunched member could not open the platform surface: ${out.error}`);
  assert.equal(e.sessionApi.fromPartition(PLATFORM_PARTITION).cookies.all()[0].value, TOKEN);
});
