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
const { createSession } = require('../src/session.js');

const MAIA_URL = `${PLATFORM_ORIGIN}${PLATFORM_ENTRY_PATH}`;
const tempDirs = [];
process.on('exit', () => tempDirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

// ════════════════════════════════════════════════════════════════════════════
// V · THE GATE  (pure)
// ════════════════════════════════════════════════════════════════════════════

test('V — audio is granted on the visible MAIA surface, and only there', () => {
  for (const p of AUDIO_PERMISSIONS) {
    assert.equal(platformPermission(p, MAIA_URL, true), true, `${p} refused on MAIA`);
  }
});

test('V — every OTHER place is refused, including Rooms under /maia', () => {
  // ⛔ The capability belongs to MAIA, not to the origin. A House destination is
  // not MAIA merely by sharing a site with her.
  for (const p of ['/house', '/journal', '/astrology', '/studio', '/maia/anchor',
                   '/maia/ideas', '/maia/living-field', '/maia/keep-capture']) {
    assert.equal(platformPermission('media', `${PLATFORM_ORIGIN}${p}`, true), false,
      `${p} was granted a microphone`);
    assert.ok(!isMaiaSurface(`${PLATFORM_ORIGIN}${p}`));
  }
});

test('V — a backgrounded or navigated-away view holds no microphone', () => {
  // Both halves of the visibility question matter: attached, AND showing MAIA.
  assert.equal(platformPermission('media', MAIA_URL, false), false,
    'a view that is not the visible MAIA was granted a microphone');
});

test('V — only AUDIO. Camera, screen, location and the rest stay refused on MAIA', () => {
  for (const p of REFUSED_PERMISSIONS) {
    if (AUDIO_PERMISSIONS.includes(p)) continue;
    assert.equal(platformPermission(p, MAIA_URL, true), false,
      `${p} was granted on MAIA — this unit grants a microphone, not a machine`);
  }
  // And a permission class Chromium has not invented yet.
  assert.equal(platformPermission('brand-new-permission-2027', MAIA_URL, true), false);
});

test('V — a foreign origin cannot impersonate MAIA by path', () => {
  for (const u of [
    'https://soullab.life.evil.com/maia',
    'https://evil.com/maia',
    'http://soullab.life/maia',          // scheme downgrade
    'not a url',
    '',
  ]) {
    assert.equal(platformPermission('media', u, true), false, `${u} was granted a microphone`);
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
