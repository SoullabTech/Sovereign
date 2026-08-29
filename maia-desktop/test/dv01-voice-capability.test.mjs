// DESKTOP-MAIA-VOICE-01 — the microphone belongs to MAIA, not to the origin.
//
// The first containment architecture solved the security problem by building a
// second privileged surface: the local Electron renderer got `getUserMedia`, and
// the real `/maia` — the one with the intelligence, the House, the ecosystem —
// was denied every device. That protected the boundary and split MAIA in two.
//
// This unit moves the capability to the real surface WITHOUT moving it to the
// origin. Journal does not get a microphone. Astrology does not. Neither does a
// route somebody adds next year. `/maia` does, while visible, for audio only.
//
// So these tests are written as attempts to obtain a microphone from somewhere
// that should not have one.
//
// ⚠️ EVIDENCE CLASS: SOURCE/TEST. That a Mac microphone actually opens, that
// audio reaches MAIA, and that a spoken turn becomes canonical are DEVICE legs
// and are not claimed here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createPlatformShell } = require('../src/shell.js');
const {
  PLATFORM_ORIGIN, PLATFORM_ENTRY_PATH, PLATFORM_HOUSE_PATH,
  AUDIO_PERMISSIONS, REFUSED_PERMISSIONS, platformPermission, isMaiaSurface,
} = require('../src/shell-policy.js');

/** The gate takes NAMED facts. `on(url)` is "a main frame at this URL asking". */
const on = (requestingUrl, maiaIsVisible = true) =>
  ({ requestingUrl, isMainFrame: true, maiaIsVisible });
const { createSession } = require('../src/session.js');

const MAIA_URL = `${PLATFORM_ORIGIN}${PLATFORM_ENTRY_PATH}`;
const tempDirs = [];
process.on('exit', () => tempDirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

// ════════════════════════════════════════════════════════════════════════════
// V · THE GATE  (pure)
// ════════════════════════════════════════════════════════════════════════════

test('V — audio is granted on the visible MAIA surface, and only there', () => {
  for (const p of AUDIO_PERMISSIONS) {
    assert.equal(platformPermission(p, on(MAIA_URL)), true, `${p} refused on MAIA`);
  }
});

test('V — every OTHER place is refused, including Rooms under /maia', () => {
  // ⛔ The capability belongs to MAIA, not to the origin. A House destination is
  // not MAIA merely by sharing a site with her.
  for (const p of ['/house', '/journal', '/astrology', '/studio', '/maia/anchor',
                   '/maia/ideas', '/maia/living-field', '/maia/keep-capture']) {
    assert.equal(platformPermission('media', on(`${PLATFORM_ORIGIN}${p}`)), false,
      `${p} was granted a microphone`);
    assert.ok(!isMaiaSurface(`${PLATFORM_ORIGIN}${p}`));
  }
});

test('V — a backgrounded or navigated-away view holds no microphone', () => {
  // Both halves of the visibility question matter: attached, AND showing MAIA.
  assert.equal(platformPermission('media', on(MAIA_URL, false)), false,
    'a view that is not the visible MAIA was granted a microphone');
});

test('V — only AUDIO. Camera, screen, location and the rest stay refused on MAIA', () => {
  for (const p of REFUSED_PERMISSIONS) {
    if (AUDIO_PERMISSIONS.includes(p)) continue;
    assert.equal(platformPermission(p, on(MAIA_URL)), false,
      `${p} was granted on MAIA — this unit grants a microphone, not a machine`);
  }
  // And a permission class Chromium has not invented yet.
  assert.equal(platformPermission('brand-new-permission-2027', on(MAIA_URL)), false);
});

test('V — a foreign origin cannot impersonate MAIA by path', () => {
  for (const u of [
    'https://soullab.life.evil.com/maia',
    'https://evil.com/maia',
    'http://soullab.life/maia',          // scheme downgrade
    'not a url',
    '',
  ]) {
    assert.equal(platformPermission('media', on(u)), false, `${u} was granted a microphone`);
  }
});

test('V — VOICE-CHECK-FALLBACK-01: a bare ORIGIN is enough on the check path', () => {
  // ⛔ THE REGRESSION. `setPermissionCheckHandler` is only guaranteed an ORIGIN,
  // and the first cut of this gate squeezed that origin into a `requestingUrl`
  // slot, where its pathname read as `/` and the microphone was refused. The
  // fallback existed to handle a case it could only ever fail.
  //
  // A bare origin is accepted because the PATH fact comes from main's own
  // observation (`maiaIsVisible`), not from the page — and the subframe clause
  // below, not the path, is what keeps an embedded third party out.
  assert.equal(platformPermission('media',
    { requestingOrigin: PLATFORM_ORIGIN, isMainFrame: true, maiaIsVisible: true }), true,
    'the synchronous check path still cannot obtain a microphone on MAIA');

  // …and it is NOT a way around visibility. Leaving MAIA still ends it.
  assert.equal(platformPermission('media',
    { requestingOrigin: PLATFORM_ORIGIN, isMainFrame: true, maiaIsVisible: false }), false);

  // …nor around the origin.
  assert.equal(platformPermission('media',
    { requestingOrigin: 'https://evil.com', isMainFrame: true, maiaIsVisible: true }), false);

  // …nor a way to ask for nothing and be granted it.
  assert.equal(platformPermission('media', { isMainFrame: true, maiaIsVisible: true }), false);
});

test('V — a SUBFRAME on MAIA gets no microphone, however it asks', () => {
  // An embedded third party sitting inside /maia is not MAIA. This is the
  // clause that says so; it is what lets a bare origin be safe above.
  for (const facts of [
    { requestingUrl: MAIA_URL, isMainFrame: false, maiaIsVisible: true },
    { requestingOrigin: PLATFORM_ORIGIN, isMainFrame: false, maiaIsVisible: true },
  ]) {
    assert.equal(platformPermission('media', facts), false, 'a subframe was granted a microphone');
  }
});

test('V — maiaIsVisible must be TRUE, not merely truthy-adjacent', () => {
  // The path fact is load-bearing enough that an absent or fuzzy value must
  // refuse rather than be coerced.
  for (const v of [undefined, null, 0, '', 'yes', 1]) {
    assert.equal(platformPermission('media', { requestingUrl: MAIA_URL, maiaIsVisible: v }), false,
      `maiaIsVisible=${JSON.stringify(v)} was treated as visible`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// V · THE WIRING  (all three Chromium paths consult the same policy)
// ════════════════════════════════════════════════════════════════════════════

function fakeElectron() {
  const log = { loaded: [], external: [] };
  const handlers = {};
  const partition = {
    cookies: { set: async () => {}, remove: async () => {}, get: async () => [] },
    setPermissionRequestHandler(fn) { handlers.request = fn; },
    setPermissionCheckHandler(fn) { handlers.check = fn; },
    setDevicePermissionHandler(fn) { handlers.device = fn; },
  };
  class FakeBrowserView {
    constructor() {
      const listeners = {};
      this.webContents = {
        on: (e, fn) => { (listeners[e] ||= []).push(fn); },
        emit: (e, ...a) => (listeners[e] || []).forEach((fn) => fn(...a)),
        setWindowOpenHandler() {},
        loadURL: async (u) => { log.loaded.push(u); },
        isDestroyed: () => false,
        destroy() {},
      };
    }
    setBounds() {} setAutoResize() {}
  }
  const window = { setBrowserView() {}, getContentSize: () => [900, 700], isDestroyed: () => false, setTitle() {} };
  return { log, handlers, sessionApi: { fromPartition: () => partition }, window,
           shellApi: { openExternal: (u) => log.external.push(u) }, BrowserView: FakeBrowserView };
}

async function shellOn(pathname) {
  const e = fakeElectron();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dv01-'));
  tempDirs.push(dir);
  const credential = createSession({
    app: { getPath: () => dir },
    safeStorage: { isEncryptionAvailable: () => false },
    fetchImpl: async () => ({
      ok: true, status: 200,
      json: async () => ({ success: true, memberId: 'uuid-1', token: 'tok',
        member: { id: 'uuid-1', username: 'kelly', name: 'Kelly' } }),
    }),
  });
  await credential.signIn('kelly', 'pw');
  const shell = createPlatformShell({
    BrowserView: e.BrowserView, sessionApi: e.sessionApi, shellApi: e.shellApi,
    window: e.window, credential, onPlace: () => {},
  });
  await shell.navigate(pathname);
  return { ...e, shell };
}

test('V — on MAIA, all three permission paths agree: audio yes, device no', async () => {
  const { handlers, shell } = await shellOn(PLATFORM_ENTRY_PATH);
  assert.equal(shell._maiaIsVisible(), true, 'the shell does not believe it is showing MAIA');

  let granted = null;
  handlers.request({}, 'media', (v) => { granted = v; }, { requestingUrl: MAIA_URL });
  assert.equal(granted, true, 'the microphone request was refused on MAIA');
  assert.equal(handlers.check({}, 'media', PLATFORM_ORIGIN, { requestingUrl: MAIA_URL }), true,
    'the synchronous check disagrees with the request handler');

  // ⛔ The DEVICE itself is still refused. Desktop grants a capability to one
  // surface; it never hands remote content a device chooser.
  assert.equal(handlers.device({ deviceType: 'audioInput' }), false,
    'remote content reached a device chooser');
});

test('V — the check handler works when Electron gives it ONLY an origin', async () => {
  // ⛔ The shape that actually reaches production. `setPermissionCheckHandler`
  // receives `(wc, permission, requestingOrigin, details)` and `details` may
  // carry no `requestingUrl` at all. This is VOICE-CHECK-FALLBACK-01 exercised
  // through the wiring rather than against the pure gate.
  const { handlers, shell } = await shellOn(PLATFORM_ENTRY_PATH);
  assert.equal(handlers.check({}, 'media', PLATFORM_ORIGIN, { isMainFrame: true }), true,
    'the check path refused the microphone when given only an origin');

  // The two paths agree, which is the property that matters: a gate that
  // answered differently depending on which Chromium path asked would be a gate
  // with a hole in it.
  let granted = null;
  handlers.request({}, 'media', (v) => { granted = v; },
    { requestingUrl: MAIA_URL, isMainFrame: true });
  assert.equal(granted, true);

  await shell.navigate(PLATFORM_HOUSE_PATH);
  assert.equal(handlers.check({}, 'media', PLATFORM_ORIGIN, { isMainFrame: true }), false,
    'an origin-only check kept a microphone alive off MAIA');
});

test('V — after moving to the House, MAIA-shaped requests are refused', async () => {
  const { handlers, shell } = await shellOn(PLATFORM_ENTRY_PATH);
  await shell.navigate(PLATFORM_HOUSE_PATH);
  assert.equal(shell._maiaIsVisible(), false);

  // Even a request CLAIMING to come from /maia is refused, because the view is
  // no longer there. Leaving MAIA ends the capability; the page cannot keep it
  // by asserting a URL.
  let granted = null;
  handlers.request({}, 'media', (v) => { granted = v; }, { requestingUrl: MAIA_URL });
  assert.equal(granted, false, 'a microphone survived leaving MAIA');
});

test('V — an in-page transition away from MAIA drops the capability', async () => {
  const { handlers, shell } = await shellOn(PLATFORM_ENTRY_PATH);
  // App Router moves fire no navigation event — only did-navigate-in-page.
  shell._view().webContents.emit('did-navigate-in-page', {}, `${PLATFORM_ORIGIN}/journal`, true);
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(shell._maiaIsVisible(), false, 'a client-side move left MAIA holding the microphone');
  let granted = null;
  handlers.request({}, 'media', (v) => { granted = v; }, { requestingUrl: MAIA_URL });
  assert.equal(granted, false);
});
