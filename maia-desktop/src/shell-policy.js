// MAIA Desktop — the platform-view policy. DESKTOP-SHELL-01.
//
// Every rule that decides what the REMOTE surface may do lives here, as pure
// functions over strings. Not in main.js, and deliberately not inside the view
// lifecycle: a boundary asserted by a regex over source is a boundary nobody
// has actually exercised, and this one is load-bearing enough to be run.
//
// THE INVARIANT THIS FILE SERVES
//
//     Remote platform content and the privileged MAIA bridge must never
//     coexist in the same webContents.
//
// The shell holds it structurally — two webContents, two sessions, one preload
// between them — and this module holds the perimeter of the remote one.

'use strict';

/**
 * The single origin the platform view may hold.
 *
 * ⛔ An ORIGIN, compared as an origin. A prefix test (`startsWith`) would admit
 * `https://soullab.life.example.com`, which is a different site that reads like
 * ours; `new URL(u).origin` cannot be fooled that way. Scheme and port are part
 * of the comparison for the same reason — `http://soullab.life` is not this.
 */
const PLATFORM_ORIGIN = 'https://soullab.life';

/**
 * A NAMED, NON-PERSISTENT partition.
 *
 * ⛔ Deliberately not `persist:`. The shell must not become a second place a
 * credential lives at rest. Main already holds the token under `safeStorage`
 * in `session.bin`; the platform cookie is minted from it at attach time and
 * dies with the process. One at-rest credential store, governed by the unit
 * that already governs it.
 *
 * Named rather than default so the remote view can never share a cookie jar,
 * a cache, or a permission decision with the privileged MAIA renderer.
 */
const PLATFORM_PARTITION = 'maia-platform';

/** The proof surface for this cut: member-scoped, free tier, read-only. */
const PLATFORM_ENTRY_PATH = '/journey';

/**
 * webPreferences for the remote view.
 *
 * Frozen because these are not defaults to be adjusted at a call site — they
 * are the containment, and a caller that could spread-and-override them could
 * hand a preload to remote content one refactor from now.
 *
 * ⛔ There is NO `preload` key. Not `preload: undefined` — absent. The test
 * asserts absence, so adding one has to be a deliberate act against a red test.
 */
const PLATFORM_WEB_PREFERENCES = Object.freeze({
  partition: PLATFORM_PARTITION,
  sandbox: true,
  contextIsolation: true,
  nodeIntegration: false,
  nodeIntegrationInSubFrames: false,
  webviewTag: false,
  // Remote content gets no reach into the local machine's file surface.
  webSecurity: true,
  allowRunningInsecureContent: false,
  experimentalFeatures: false,
});

/** Schemes that may be handed to the operating system's browser. */
const EXTERNAL_SCHEMES = Object.freeze(['http:', 'https:']);

/**
 * Every permission class the remote view is refused.
 *
 * Enumerated rather than implied by a bare `false`, so the refusal is legible
 * and so a reviewer can see that microphone and camera are named — the two the
 * MAIA side is allowed and this side is not. `/journey` needs none of them.
 *
 * ⛔ This list is not the gate. The gate is `platformPermission()`, which
 * refuses EVERYTHING including a permission invented after this file was
 * written. The list exists so the refusal can be tested by name.
 */
const REFUSED_PERMISSIONS = Object.freeze([
  'media', 'audioCapture', 'videoCapture', 'display-capture',
  'geolocation', 'notifications', 'midi', 'midiSysex', 'pointerLock',
  'fullscreen', 'openExternal', 'clipboard-read', 'clipboard-sanitized-write',
  'hid', 'serial', 'usb', 'idle-detection', 'window-management',
  'speaker-selection', 'storage-access', 'top-level-storage-access-permission',
]);

/** The URL the platform view opens on. */
function platformEntryUrl() {
  return `${PLATFORM_ORIGIN}${PLATFORM_ENTRY_PATH}`;
}

/** True when a URL is inside the one origin the platform view may hold. */
function isPlatformUrl(url) {
  try {
    return new URL(String(url)).origin === PLATFORM_ORIGIN;
  } catch {
    return false;                        // unparseable is not our origin
  }
}

/**
 * What may happen when the platform view tries to go somewhere.
 *
 *   allow     it is our origin — it may load in the platform view
 *   external  a web address elsewhere — the OS browser, never a Desktop renderer
 *   block     everything else — javascript:, file:, data:, about:, garbage
 *
 * ⛔ `external` is reachable ONLY for http/https. A `javascript:` or `file:`
 * URL handed to `shell.openExternal` is a local-code-execution primitive
 * pointed at the member's machine; it is blocked outright, not delegated.
 */
function navigationDecision(url) {
  const raw = String(url == null ? '' : url);
  let parsed;
  try { parsed = new URL(raw); }
  catch { return { action: 'block', reason: 'unparseable' }; }

  if (parsed.origin === PLATFORM_ORIGIN) {
    return { action: 'allow', reason: 'platform_origin' };
  }
  if (EXTERNAL_SCHEMES.includes(parsed.protocol)) {
    return { action: 'external', reason: 'foreign_origin', url: parsed.toString() };
  }
  return { action: 'block', reason: `refused_scheme:${parsed.protocol}` };
}

/**
 * The permission answer for the remote view: always no.
 *
 * ⛔ Written as a total refusal rather than as "deny the ones we listed". A
 * Chromium upgrade that adds a permission class must not arrive already
 * granted because nobody edited an allow-list. The MAIA view keeps its own
 * handler on the default session and is untouched by this.
 */
function platformPermission() {
  return false;
}

module.exports = {
  PLATFORM_ORIGIN,
  PLATFORM_PARTITION,
  PLATFORM_ENTRY_PATH,
  PLATFORM_WEB_PREFERENCES,
  REFUSED_PERMISSIONS,
  EXTERNAL_SCHEMES,
  platformEntryUrl,
  isPlatformUrl,
  navigationDecision,
  platformPermission,
};
