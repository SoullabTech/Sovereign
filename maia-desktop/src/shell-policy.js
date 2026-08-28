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
const DEFAULT_PLATFORM_ORIGIN = 'https://soullab.life';

/**
 * DESKTOP-HOUSE-WITNESS-ORIGIN-01 — the platform view's base, validated.
 *
 * ⛔ WHY THIS EXISTS. `MAIA_BASE_URL` redirects the API/session side only
 * (session.js). The platform view's origin was a hard-coded constant, so a
 * Desktop pointed at a local witness runtime for its conversation would still
 * open PRODUCTION in its BrowserView. A House witness therefore opened
 * production's `/house` — which does not exist — and reported a defect in a
 * route that was serving correctly on the witness server the whole time.
 *
 * ⛔ WHY NOT JUST REUSE `MAIA_BASE_URL`. This origin is not a convenience
 * setting; it IS the containment boundary. Every decision in
 * `navigationDecision` compares against it, so one variable doing double duty
 * would mean an API redirect silently widened the browsing perimeter. It gets
 * its own name, and it is validated rather than trusted.
 *
 * ⛔ WHY BOTH THE ENTRY URL AND THE CHECK DERIVE FROM THIS ONE VALUE. The
 * dangerous half-fix is to make the view LOAD a new origin while
 * `navigationDecision` still believes only `soullab.life` is legitimate: the
 * first navigation inside the witness server would then be judged foreign and
 * handed to the member's OS browser. One value, one source.
 *
 * Accepted: any `https:` origin, or `http:` on loopback (a witness runtime).
 * Anything else — a plain-http public host, a `file:`, a wallet of nonsense —
 * falls back to production and says so. Failing loudly toward the safe value is
 * the only sane direction for a perimeter.
 */
function normalizePlatformOrigin(raw) {
  if (!raw) return DEFAULT_PLATFORM_ORIGIN;
  let u;
  try { u = new URL(String(raw)); }
  catch {
    console.warn(`[shell] MAIA_PLATFORM_BASE_URL is not a URL (${raw}) — using ${DEFAULT_PLATFORM_ORIGIN}`);
    return DEFAULT_PLATFORM_ORIGIN;
  }
  const loopback = u.hostname === '127.0.0.1' || u.hostname === 'localhost' || u.hostname === '[::1]' || u.hostname === '::1';
  if (u.protocol === 'https:' || (u.protocol === 'http:' && loopback)) return u.origin;
  console.warn(`[shell] MAIA_PLATFORM_BASE_URL refused (${u.origin}) — plain http is accepted only on loopback. Using ${DEFAULT_PLATFORM_ORIGIN}`);
  return DEFAULT_PLATFORM_ORIGIN;
}

const PLATFORM_ORIGIN = normalizePlatformOrigin(process.env.MAIA_PLATFORM_BASE_URL);

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

/**
 * DESKTOP-HOUSE-01 — the threshold, replacing DESKTOP-SHELL-01's `/journey`
 * proof surface.
 *
 * `/journey` was an entry point chosen because it was safe to prove a shell
 * with. The House is the member's actual threshold, and it is the surface that
 * knows — canonically — which places exist and who may see them.
 */
const PLATFORM_ENTRY_PATH = '/house';

/**
 * The path authority, GENERATED from `lib/navigation/houseDestinations.ts`.
 *
 * ⛔ WHAT THIS REPLACES, and why the old rule was wrong. DESKTOP-SHELL-01
 * allowed anything on the platform origin:
 *
 *     if (parsed.origin === PLATFORM_ORIGIN) return { action: 'allow' }
 *
 * That is an ORIGIN check standing in for an AUTHORITY check. It made every
 * route the platform has ever served — admin surfaces, another member's deep
 * link, a route added next week by someone who never heard of Desktop —
 * automatically reachable inside a window the member believes is their House.
 * Sharing an origin is not the same as being a place the House opens.
 *
 * ⛔ Not fetched from the server. The perimeter around remote content must not
 * be defined by the remote content.
 */
const HOUSE = require('./house-allowlist.json');

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
 * Is `pathname` at, or inside, `root`?
 *
 * ⛔ `startsWith(root)` alone is wrong: `/journalism` is not inside `/journal`.
 * The boundary has to be a path separator.
 */
function isUnderRoot(pathname, root) {
  return pathname === root || pathname.startsWith(root + '/');
}

/**
 * Is this pathname THE member's conversation?
 *
 * ⛔ Exact, never prefix. `/maia/anchor`, `/maia/ideas`, `/maia/living-field`,
 * `/maia/keep-capture` and `/maia/vision-studio` are Rooms that happen to live
 * under this path. A prefix rule would eject a member from Anchor back to the
 * local conversation — wrong, and baffling to experience.
 */
function isConversationPath(pathname) {
  return HOUSE.returnToMaiaRoutes.includes(pathname);
}

/** Does the House name a place at this path? */
function isHousePath(pathname) {
  return HOUSE.allowedRoots.some((root) => isUnderRoot(pathname, root));
}

/**
 * What may happen when the platform view tries to go somewhere.
 *
 *   allow           the House names this place — it may load in the platform view
 *   return-to-maia  the remote conversation — Desktop already HAS the member's
 *                   MAIA locally, so this is read as "return to center": the
 *                   caller detaches the platform view and reveals it
 *   external        a web address elsewhere — the OS browser, never a Desktop renderer
 *   block           our origin but not a House place, or a refused scheme
 *
 * ⛔ `external` is reachable ONLY for http/https. A `javascript:` or `file:`
 * URL handed to `shell.openExternal` is a local-code-execution primitive
 * pointed at the member's machine; it is blocked outright, not delegated.
 *
 * ⛔ The order matters: the conversation is checked BEFORE the allow-list, so
 * `/maia` can never be admitted by some later widening of the House.
 */
function navigationDecision(url) {
  const raw = String(url == null ? '' : url);
  let parsed;
  try { parsed = new URL(raw); }
  catch { return { action: 'block', reason: 'unparseable' }; }

  if (parsed.origin === PLATFORM_ORIGIN) {
    if (isConversationPath(parsed.pathname)) {
      return { action: 'return-to-maia', reason: 'remote_conversation' };
    }
    if (isHousePath(parsed.pathname)) {
      return { action: 'allow', reason: 'house_destination' };
    }
    // Our origin, but not a place the House opens. Sharing an origin is not
    // authority — see the note on HOUSE above.
    return { action: 'block', reason: `not_a_house_path:${parsed.pathname}` };
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
  DEFAULT_PLATFORM_ORIGIN,
  normalizePlatformOrigin,
  PLATFORM_ORIGIN,
  PLATFORM_PARTITION,
  PLATFORM_ENTRY_PATH,
  PLATFORM_WEB_PREFERENCES,
  REFUSED_PERMISSIONS,
  EXTERNAL_SCHEMES,
  HOUSE,
  platformEntryUrl,
  isPlatformUrl,
  isUnderRoot,
  isConversationPath,
  isHousePath,
  navigationDecision,
  platformPermission,
};
