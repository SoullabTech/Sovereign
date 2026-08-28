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
const PRODUCTION_PLATFORM_ORIGIN = 'https://soullab.life';

/**
 * DESKTOP-PLATFORM-ORIGIN-01 — which remote origin the contained view may hold.
 *
 * ⛔ WHY THIS IS A UNIT OF ITS OWN. This is not a convenience setting. Both
 * `platformEntryUrl()` and `navigationDecision()` derive their authority from
 * this one value, so it IS the containment perimeter — the thing that decides
 * what remote code is allowed inside Desktop at all.
 *
 * ⛔ WHAT IT FIXES (WITNESS-ORIGIN-01). `MAIA_BASE_URL` redirects the
 * API/session side only. The platform view's origin was hard-coded, so a
 * Desktop pointed at a local witness for its conversation still opened
 * PRODUCTION in its BrowserView. Every Desktop witness since DESKTOP-SHELL-01
 * was therefore only half-contained; the original `/journey` walk passed
 * because `/journey` exists in production, which hid the split entirely.
 *
 * ⛔ AN EXPLICIT-BUT-INVALID VALUE IS FATAL, NEVER A FALLBACK. Falling back to
 * production on a bad value would reproduce the exact defect this unit exists to
 * remove: a witness that believes it is local while its remote half quietly
 * talks to production. A typo must stop the process, not redirect it.
 *
 * ⛔ ARBITRARY HTTPS IS REFUSED. Accepting any https origin would turn an
 * environment variable into permission to redefine Desktop's remote trust
 * boundary. A staging origin, if ever needed, gets added here deliberately and
 * visibly.
 *
 * THE CONTRACT
 *   unset                          → https://soullab.life
 *   https://soullab.life           → accepted
 *   http://127.0.0.1:<port>        → accepted (local witness / dev)
 *   http://localhost:<port>        → accepted
 *   anything else                  → HARD FAIL
 *
 * The value must be an ORIGIN: no path beyond `/`, no query, no fragment, no
 * credentials. Anything richer is a sign the caller means something other than
 * "which origin", and guessing on their behalf is how perimeters rot.
 */
const LOOPBACK_HOSTS = Object.freeze(['127.0.0.1', 'localhost', '[::1]']);

function resolvePlatformOrigin(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return { origin: PRODUCTION_PLATFORM_ORIGIN, source: 'default' };
  }
  const value = String(raw).trim();
  const fatal = (why) => {
    throw new Error(
      `MAIA_PLATFORM_ORIGIN is invalid: ${why} (got "${value}"). ` +
      'Accepted: https://soullab.life, or http:// on 127.0.0.1 / localhost. ' +
      'Refusing to start rather than silently using production.',
    );
  };

  let u;
  try { u = new URL(value); } catch { return fatal('not a URL'); }

  if (u.username || u.password) fatal('credentials are not part of an origin');
  if (u.search) fatal('a query string is not part of an origin');
  if (u.hash) fatal('a fragment is not part of an origin');
  if (u.pathname !== '/' && u.pathname !== '') fatal('a path is not part of an origin');

  if (u.origin === PRODUCTION_PLATFORM_ORIGIN) return { origin: u.origin, source: 'override' };
  if (u.protocol === 'http:' && LOOPBACK_HOSTS.includes(u.hostname)) {
    return { origin: u.origin, source: 'override' };
  }
  return fatal(
    u.protocol === 'https:'
      ? 'an arbitrary https origin would redefine the remote trust boundary'
      : `scheme ${u.protocol} is only accepted on loopback`,
  );
}

const RESOLVED_PLATFORM = resolvePlatformOrigin(process.env.MAIA_PLATFORM_ORIGIN);
const PLATFORM_ORIGIN = RESOLVED_PLATFORM.origin;

// One unmistakable line, so a future witness is self-identifying and nobody has
// to infer from behaviour which server the remote half was actually talking to.
// No credential, no member, no token — only which origin, and whether it was
// chosen or defaulted.
console.log(`[Desktop platform] origin=${PLATFORM_ORIGIN} source=${RESOLVED_PLATFORM.source}`);

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
  PRODUCTION_PLATFORM_ORIGIN,
  resolvePlatformOrigin,
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
