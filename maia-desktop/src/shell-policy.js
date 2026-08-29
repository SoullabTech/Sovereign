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
 * DESKTOP-MAIA-UNIFICATION-01 — Desktop opens on MAIA herself.
 *
 * ⛔ THE PROGRESSION, AND WHY IT ENDED HERE.
 *   DESKTOP-SHELL-01  `/journey`  — an entry chosen because it was safe to prove
 *                                   a shell with.
 *   DESKTOP-HOUSE-01  `/house`    — the member's threshold into the platform.
 *   THIS UNIT         `/maia`     — the member's actual centre.
 *
 * The House is a doorway, not a home screen, and the local Electron renderer is
 * witness scaffolding, not the product. There is one visible MAIA and it is the
 * canonical one. The House opens FROM here; it is no longer what Desktop opens
 * ON.
 */
const PLATFORM_ENTRY_PATH = '/maia';

/** The House, still the threshold — reached from MAIA, not instead of her. */
const PLATFORM_HOUSE_PATH = '/house';

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

/** Does the House name a place at this path? */
function isHousePath(pathname) {
  return HOUSE.allowedRoots.some((root) => isUnderRoot(pathname, root));
}

/**
 * What may happen when the platform view tries to go somewhere.
 *
 *   allow     the House names this place — it may load in the platform view
 *   external  a web address elsewhere — the OS browser, never a Desktop renderer
 *   block     our origin but not a House place, or a refused scheme
 *
 * ⛔ `external` is reachable ONLY for http/https. A `javascript:` or `file:`
 * URL handed to `shell.openExternal` is a local-code-execution primitive
 * pointed at the member's machine; it is blocked outright, not delegated.
 *
 * ⛔ DESKTOP-MAIA-UNIFICATION-01 removed a `return-to-maia` action here. `/maia`
 * used to be refused and translated into "reveal the local renderer"; it is now
 * simply the destination Desktop opens on. One MAIA, and she is canonical.
 */
function navigationDecision(url) {
  const raw = String(url == null ? '' : url);
  let parsed;
  try { parsed = new URL(raw); }
  catch { return { action: 'block', reason: 'unparseable' }; }

  if (parsed.origin === PLATFORM_ORIGIN) {
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
 * DESKTOP-MAIA-VOICE-01 — the ONE capability the platform view may hold.
 *
 * ⛔ WHAT THIS IS NOT. It is not `remote platform permissions = allow`. That
 * would hand Journal, Astrology, Studio, and every route added next week the
 * same device authority. The capability belongs to MAIA, not to the origin.
 *
 * THE GATE, all of which must hold:
 *   · the trusted platform origin, compared as an origin
 *   · the EXACT `/maia` conversation surface — not a Room beneath it, not the
 *     House, not a sub-path
 *   · audio only — camera, screen capture, geolocation and everything else stay
 *     refused, including permissions Chromium invents after this was written
 *   · `/maia` is the visible active place (the caller supplies this; a
 *     backgrounded view must not be able to open a microphone)
 *
 * A member gesture is also required, but that is Chromium's own rule for
 * `getUserMedia` and is not something main can observe — so it is named here as
 * part of the contract rather than claimed as something this function enforces.
 *
 * ⛔ WHAT IS STILL REFUSED, and stays refused: Node, filesystem, shell,
 * preload. The remote page gains a microphone, not a machine.
 *
 * ⛔ Leaving `/maia` for the House or any place ends capture structurally — the
 * page context is torn down by the navigation, so the tracks die with it. It is
 * not a promise this function keeps; it is a consequence of how the view works.
 * Returning does not restart anything: `getUserMedia` needs a fresh gesture.
 */
const AUDIO_PERMISSIONS = Object.freeze(['media', 'audioCapture']);

function isMaiaSurface(url) {
  try {
    const u = new URL(String(url));
    return u.origin === PLATFORM_ORIGIN && u.pathname === PLATFORM_ENTRY_PATH;
  } catch {
    return false;
  }
}

/**
 * The permission answer for the remote view.
 *
 * ⛔ Written as a total refusal with ONE narrow exception, rather than as
 * "deny the ones we listed". A Chromium upgrade that adds a permission class
 * must not arrive already granted because nobody edited an allow-list.
 */
function platformPermission(permission, requestingUrl, maiaIsVisible) {
  if (!AUDIO_PERMISSIONS.includes(permission)) return false;
  if (!maiaIsVisible) return false;
  return isMaiaSurface(requestingUrl);
}

module.exports = {
  PRODUCTION_PLATFORM_ORIGIN,
  resolvePlatformOrigin,
  PLATFORM_ORIGIN,
  PLATFORM_PARTITION,
  PLATFORM_ENTRY_PATH,
  PLATFORM_HOUSE_PATH,
  PLATFORM_WEB_PREFERENCES,
  REFUSED_PERMISSIONS,
  EXTERNAL_SCHEMES,
  HOUSE,
  platformEntryUrl,
  isPlatformUrl,
  isUnderRoot,
  isHousePath,
  isMaiaSurface,
  AUDIO_PERMISSIONS,
  navigationDecision,
  platformPermission,
};
