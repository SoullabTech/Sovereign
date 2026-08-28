// DESKTOP-HOUSE-01 — the House becomes the Desktop threshold.
//
// This unit removes a rule DESKTOP-SHELL-01 shipped with:
//
//     parsed.origin === PLATFORM_ORIGIN  →  allow
//
// An origin check standing in for an authority check. Every route the platform
// has ever served was reachable inside a window the member believes is their
// House — including routes written by people who never heard of Desktop.
//
// So these tests are written as attempts to get somewhere the House does not
// open onto, plus the two paths that must behave specially: the member's
// conversation (which Desktop already holds locally) and client-side App Router
// transitions (which fire no navigation event at all).
//
// ⚠️ EVIDENCE CLASS: SOURCE/TEST. H1–H8 need a real Mac; the legs that require
// the device are named in the unit report, not implied here.

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

const { createPlatformShell } = require('../src/shell.js');
const {
  PLATFORM_ORIGIN, PLATFORM_ENTRY_PATH, HOUSE, PRODUCTION_PLATFORM_ORIGIN, resolvePlatformOrigin,
  navigationDecision, platformEntryUrl, isConversationPath, isHousePath, isUnderRoot,
} = require('../src/shell-policy.js');
const { createSession } = require('../src/session.js');

const TOKEN = 'tok-house-01';
const tempDirs = [];
process.on('exit', () => tempDirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

// ════════════════════════════════════════════════════════════════════════════
// H · PATH AUTHORITY  (pure — no Electron needed)
// ════════════════════════════════════════════════════════════════════════════

test('H — the threshold is the House, not the old proof surface', () => {
  assert.equal(PLATFORM_ENTRY_PATH, '/house');
  assert.equal(platformEntryUrl(), `${PLATFORM_ORIGIN}/house`);
  // /journey was DESKTOP-SHELL-01's entry. It is not a House destination, so it
  // is now no more reachable than any other unnamed route.
  assert.equal(navigationDecision(`${PLATFORM_ORIGIN}/journey`).action, 'block');
});

test('H — a place the House names loads; the same origin alone does not', () => {
  for (const d of HOUSE.destinations) {
    if (HOUSE.returnToMaiaRoutes.includes(d.route)) continue;
    assert.equal(
      navigationDecision(`${PLATFORM_ORIGIN}${d.route}`).action, 'allow',
      `${d.id} (${d.route}) is a House destination but was refused`,
    );
  }
  // ⭐ THE DEFECT THIS UNIT REMOVES. Same origin, no House door.
  for (const p of ['/admin/secrets', '/api/members/list', '/stellium', '/press/manuscript']) {
    const dec = navigationDecision(`${PLATFORM_ORIGIN}${p}`);
    assert.equal(dec.action, 'block', `${p} loaded on origin alone`);
    assert.match(dec.reason, /^not_a_house_path:/);
  }
});

test('H — a destination admits its own sub-paths, and only its own', () => {
  assert.equal(navigationDecision(`${PLATFORM_ORIGIN}/journal/entry/123`).action, 'allow');
  assert.equal(navigationDecision(`${PLATFORM_ORIGIN}/journal?x=1#y`).action, 'allow');
  // ⛔ The boundary is a path separator. `startsWith('/journal')` alone would
  // have admitted this — a different route that merely reads like ours.
  assert.equal(navigationDecision(`${PLATFORM_ORIGIN}/journalism`).action, 'block');
  assert.ok(isUnderRoot('/journal/entry/1', '/journal'));
  assert.ok(!isUnderRoot('/journalism', '/journal'));
});

test('H5 — the remote conversation is a RETURN, never a load', () => {
  const dec = navigationDecision(`${PLATFORM_ORIGIN}/maia`);
  assert.equal(dec.action, 'return-to-maia');
  assert.equal(dec.reason, 'remote_conversation');
  assert.equal(navigationDecision(`${PLATFORM_ORIGIN}/maia?tab=x#y`).action, 'return-to-maia');
  // It is never merely 'allow' — a second MAIA must not be loadable at all.
  assert.notEqual(dec.action, 'allow');
  assert.ok(!HOUSE.allowedRoots.includes('/maia'));
});

test('H5 — Rooms living UNDER /maia are Rooms, not the conversation', () => {
  // A prefix rule would eject a member from Anchor back to the local
  // conversation the moment they opened it.
  for (const p of ['/maia/anchor', '/maia/ideas', '/maia/living-field', '/maia/keep-capture']) {
    assert.equal(navigationDecision(`${PLATFORM_ORIGIN}${p}`).action, 'allow', `${p} was treated as the conversation`);
    assert.ok(!isConversationPath(p));
    assert.ok(isHousePath(p));
  }
});

test('H — foreign origins and refused schemes are unchanged by this unit', () => {
  assert.equal(navigationDecision('https://soullab.life.evil.com/house').action, 'external');
  assert.equal(navigationDecision('https://api.soullab.life/x').action, 'external');
  assert.equal(navigationDecision('http://soullab.life/house').action, 'external');
  for (const u of ['javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,x', 'about:blank']) {
    assert.equal(navigationDecision(u).action, 'block', `${u} escaped the scheme refusal`);
  }
});

test('H — the allow-list is GENERATED, not hand-written into the policy', () => {
  const policy = readFileSync(path.join(srcDir, 'shell-policy.js'), 'utf8');
  assert.match(policy, /require\('\.\/house-allowlist\.json'\)/,
    'the policy stopped reading the generated manifest');
  // The routes themselves must not be retyped here: a hand-kept second copy is
  // exactly the drift `houseNavDrift.test.ts` exists to prevent.
  assert.doesNotMatch(policy, /'\/wisdom-keepers\/wisdom'|'\/writers-studio'|'\/team\/for-you'/,
    'a House route was hard-coded into the policy instead of generated');
});

// ════════════════════════════════════════════════════════════════════════════
// H · IN-PAGE NAVIGATION  (the one that would have made path authority decorative)
// ════════════════════════════════════════════════════════════════════════════

function fakeElectron() {
  const log = { external: [], loaded: [], returns: [] };
  const partitions = new Map();
  const partition = () => ({
    cookies: { set: async () => {}, remove: async () => {}, get: async () => [] },
    setPermissionRequestHandler() {},
    setPermissionCheckHandler() {},
    setDevicePermissionHandler() {},
  });
  const sessionApi = { fromPartition: (n) => (partitions.get(n) || (partitions.set(n, partition()), partitions.get(n))) };

  class FakeBrowserView {
    constructor(opts) {
      this.opts = opts;
      const listeners = {};
      this.webContents = {
        on: (evt, fn) => { (listeners[evt] ||= []).push(fn); },
        emit: (evt, ...args) => (listeners[evt] || []).forEach((fn) => fn(...args)),
        setWindowOpenHandler() {},
        loadURL: async (u) => { log.loaded.push(u); },
        isDestroyed: () => false,
        destroy() {},
      };
    }
    setBounds() {}
    setAutoResize() {}
  }
  const window = {
    setBrowserView() {}, getContentSize: () => [900, 700], isDestroyed: () => false, setTitle() {},
  };
  return { log, sessionApi, shellApi: { openExternal: (u) => log.external.push(u) }, window, BrowserView: FakeBrowserView };
}

async function shellFor() {
  const e = fakeElectron();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dh01-'));
  tempDirs.push(dir);
  const credential = createSession({
    app: { getPath: () => dir },
    safeStorage: { isEncryptionAvailable: () => false },
    fetchImpl: async () => ({
      ok: true, status: 200,
      json: async () => ({
        success: true, memberId: 'uuid-1', token: TOKEN,
        member: { id: 'uuid-1', username: 'kelly', name: 'Kelly', tier: 'free', roles: ['member'] },
      }),
    }),
  });
  await credential.signIn('kelly', 'pw');
  const shell = createPlatformShell({
    BrowserView: e.BrowserView, sessionApi: e.sessionApi, shellApi: e.shellApi,
    window: e.window, credential,
    onPlace: () => {},
    onReturnToMaia: (u) => e.log.returns.push(u),
  });
  await shell.show();
  return { ...e, shell };
}

test('H — a client-side transition to a non-House path is walked back to the House', async () => {
  const { shell, log } = await shellFor();
  const before = log.loaded.length;
  // ⛔ App Router moves are history.pushState: no will-navigate, no
  // will-redirect. Guarding only those two would leave in-app transitions —
  // which is to say most navigation — entirely ungoverned.
  shell._view().webContents.emit('did-navigate-in-page', {}, `${PLATFORM_ORIGIN}/admin/secrets`, true);
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(log.loaded.length, before + 1, 'the view was left on a path the House does not name');
  assert.equal(log.loaded[log.loaded.length - 1], platformEntryUrl());
});

test('H5 — a client-side transition to /maia returns to center and loads nothing', async () => {
  const { shell, log } = await shellFor();
  const before = log.loaded.length;
  shell._view().webContents.emit('did-navigate-in-page', {}, `${PLATFORM_ORIGIN}/maia`, true);
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(log.returns, [`${PLATFORM_ORIGIN}/maia`], 'return-to-center was not signalled to main');
  assert.equal(log.loaded.length, before, 'the remote conversation was loaded anyway');
});

test('H5 — a full navigation to /maia is prevented AND returns to center', async () => {
  const { shell, log } = await shellFor();
  let prevented = false;
  shell._view().webContents.emit('will-navigate',
    { preventDefault: () => { prevented = true; } }, `${PLATFORM_ORIGIN}/maia`);
  assert.ok(prevented, 'the remote conversation was allowed to load');
  assert.deepEqual(log.returns, [`${PLATFORM_ORIGIN}/maia`]);
});

test('H — a SUBFRAME moving in-page is not the member moving', async () => {
  const { shell, log } = await shellFor();
  const before = log.loaded.length;
  shell._view().webContents.emit('did-navigate-in-page', {}, `${PLATFORM_ORIGIN}/admin/secrets`, false);
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(log.loaded.length, before, 'a subframe navigation reset the whole view');
});

test('H — a House destination reached in-page is left alone', async () => {
  const { shell, log } = await shellFor();
  const before = log.loaded.length;
  shell._view().webContents.emit('did-navigate-in-page', {}, `${PLATFORM_ORIGIN}/journal/entry/9`, true);
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(log.loaded.length, before, 'entering a Room bounced the member back to the House');
  assert.deepEqual(log.returns, []);
});

// ════════════════════════════════════════════════════════════════════════════
// DESKTOP-PLATFORM-ORIGIN-01 · which remote origin the contained view may hold
//
// This is the containment perimeter, not a convenience variable: both
// platformEntryUrl() and navigationDecision() derive their authority from it.
// So an explicit-but-invalid value is FATAL. Falling back to production would
// reproduce WITNESS-ORIGIN-01 exactly — a witness believing it is local while
// its remote half quietly talks to production.
// ════════════════════════════════════════════════════════════════════════════

test('P1 — unset resolves to production, marked as a default', () => {
  assert.deepEqual(resolvePlatformOrigin(undefined), { origin: PRODUCTION_PLATFORM_ORIGIN, source: 'default' });
  assert.deepEqual(resolvePlatformOrigin(''), { origin: PRODUCTION_PLATFORM_ORIGIN, source: 'default' });
  assert.deepEqual(resolvePlatformOrigin('   '), { origin: PRODUCTION_PLATFORM_ORIGIN, source: 'default' });
});

test('P2 — the production origin, explicitly set, is accepted as an override', () => {
  assert.deepEqual(resolvePlatformOrigin('https://soullab.life'), { origin: PRODUCTION_PLATFORM_ORIGIN, source: 'override' });
});

test('P3/P4 — loopback over http is accepted for a witness or dev runtime', () => {
  assert.deepEqual(resolvePlatformOrigin('http://127.0.0.1:3110'), { origin: 'http://127.0.0.1:3110', source: 'override' });
  assert.deepEqual(resolvePlatformOrigin('http://localhost:3110'), { origin: 'http://localhost:3110', source: 'override' });
  assert.deepEqual(resolvePlatformOrigin('http://[::1]:3110'), { origin: 'http://[::1]:3110', source: 'override' });
  assert.equal(resolvePlatformOrigin('http://127.0.0.1:3110/').origin, 'http://127.0.0.1:3110');
});

test('P5 — plain http on a public host HARD FAILS', () => {
  // ⛔ Never a fallback. Accepting it would let an env var point the contained
  // view at an attacker-controlled origin over cleartext, and every
  // navigationDecision would then treat that origin as legitimate.
  assert.throws(() => resolvePlatformOrigin('http://evil.example.com'), /only accepted on loopback/);
  assert.throws(() => resolvePlatformOrigin('http://soullab.life'), /only accepted on loopback/);
});

test('P6 — an ARBITRARY https origin HARD FAILS', () => {
  // Accepting any https would turn an environment variable into permission to
  // redefine Desktop's remote trust boundary. A staging origin gets added here
  // deliberately and visibly, or not at all.
  assert.throws(() => resolvePlatformOrigin('https://staging.soullab.life'), /redefine the remote trust boundary/);
  assert.throws(() => resolvePlatformOrigin('https://evil.example.com'), /redefine the remote trust boundary/);
  assert.throws(() => resolvePlatformOrigin('https://soullab.life.evil.com'), /redefine the remote trust boundary/);
});

test('P7 — a path, query, fragment or credentials HARD FAIL: this is an ORIGIN', () => {
  assert.throws(() => resolvePlatformOrigin('http://127.0.0.1:3110/house'), /path is not part of an origin/);
  assert.throws(() => resolvePlatformOrigin('http://127.0.0.1:3110/?a=1'), /query string is not part of an origin/);
  assert.throws(() => resolvePlatformOrigin('http://127.0.0.1:3110/#x'), /fragment is not part of an origin/);
  assert.throws(() => resolvePlatformOrigin('http://u:p@127.0.0.1:3110'), /credentials are not part of an origin/);
});

test('P8 — a malformed or non-web value HARD FAILS', () => {
  for (const bad of ['not a url', 'file:///etc/passwd', 'javascript:alert(1)', '://', 'ftp://x.com']) {
    assert.throws(() => resolvePlatformOrigin(bad), Error, `${bad} was accepted`);
  }
});

test('P9/P10 — the entry URL and the navigation authority share ONE resolved origin', () => {
  // ⛔ The half-fix this guards against: the view LOADS a new origin while
  // navigationDecision still believes only soullab.life is legitimate. The first
  // navigation inside the witness server would be judged foreign and handed to
  // the member's OS browser.
  assert.equal(platformEntryUrl(), `${PLATFORM_ORIGIN}${PLATFORM_ENTRY_PATH}`);
  assert.equal(navigationDecision(`${PLATFORM_ORIGIN}/journal`).action, 'allow');
  assert.equal(navigationDecision(`${PLATFORM_ORIGIN}/maia`).action, 'return-to-maia');
});
