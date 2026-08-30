// MAIA Desktop — the surface permission wall.
//
// COMPANION-01A P1. Proves that a platform surface cannot acquire voice or
// camera authority, and that the proof does not depend on anyone remembering
// not to import ContinuousConversation into House.
//
// ── WHY THIS PROOF EXISTS ───────────────────────────────────────────────────
//
// The pre-Companion handler was installed on session.defaultSession and ignored
// the requesting webContents:
//
//     setPermissionRequestHandler((_wc, permission, callback) => {
//       callback(permission === 'media' || permission === 'audioCapture');
//     });
//
// One window made that harmless. A second surface would have inherited audio
// permission by default, and the Companion's central invariant would have
// rested on a convention. Phase 1B established that the web tree acquires the
// microphone from inside its own component lifecycle, so that import is a
// plausible accident rather than a hypothetical.
//
// This proof is source-level and runs anywhere. The DEVICE negative proof —
// a real platform window calling getUserMedia and being refused — is
// MAIA_DESKTOP_PLATFORM_PROBE=1 and is witnessed on the Mac.

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '../../../maia-desktop/src');

const { SURFACES, isPermitted, capabilitiesFor } = require(join(src, 'surfaces.js'));
const mainSrc = readFileSync(join(src, 'main.js'), 'utf8');
const platformPreloadRaw = readFileSync(join(src, 'preload-platform.js'), 'utf8');

// ⭐ Strip comments before asserting. The first run of this proof failed on
// preload-platform.js's own ⛔ block — the one that NAMES the verbs that must
// never be added. A guard that cannot tell "mentions" from "exposes" would
// punish the file for documenting its own boundary, and the documentation is
// worth more than the convenience of a substring match.
const platformPreload = platformPreloadRaw
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

let pass = 0, fail = 0;
const ok = (m) => { console.log('  ok:   ' + m); pass += 1; };
const bad = (m) => { console.log('  FAIL: ' + m); fail += 1; };

console.log('\n── COMPANION-01A · surface permission wall ─────────────────');

// ── the capability table ────────────────────────────────────────────────────
SURFACES.platform.capabilities.length === 0
  ? ok('platform surface declares NO capabilities')
  : bad('platform surface declares capabilities: ' + SURFACES.platform.capabilities);

JSON.stringify(SURFACES.voice.capabilities.slice().sort()) === JSON.stringify(['audioCapture', 'media'])
  ? ok('voice surface declares audio only — no video')
  : bad('voice capabilities changed: ' + SURFACES.voice.capabilities);

SURFACES.voice.partition !== SURFACES.platform.partition
  ? ok('voice and platform are separate partitions')
  : bad('voice and platform share a partition');

// ── enforcement ─────────────────────────────────────────────────────────────
for (const p of ['media', 'audioCapture', 'video', 'camera', 'geolocation', 'display-capture', 'notifications']) {
  isPermitted(SURFACES.platform.partition, p)
    ? bad('platform partition permits ' + p)
    : ok('platform partition refuses ' + p);
}
isPermitted(SURFACES.voice.partition, 'media')
  ? ok('voice partition still permits media')
  : bad('voice partition lost media — D01 voice edge broken');
isPermitted(SURFACES.voice.partition, 'video')
  ? bad('voice partition permits video')
  : ok('voice partition refuses video');

// Fail closed: an unknown partition is a mistake, and a mistake gets nothing.
capabilitiesFor('persist:something-nobody-reviewed').length === 0
  ? ok('an unrecognised partition receives no capability')
  : bad('unrecognised partition received capabilities');

// ── main.js wiring ──────────────────────────────────────────────────────────
/callback\(isPermitted\(partition, permission\)\)/.test(mainSrc)
  ? ok('main installs the wall from the capability table, per partition')
  : bad('main does not consult the capability table');

/session\.defaultSession\.setPermissionRequestHandler\(\(_wc, _p, callback\) => callback\(false\)\)/.test(mainSrc)
  ? ok('default session is denied everything (fail closed)')
  : bad('default session is not fail-closed');

/callback\(permission === 'media' \|\| permission === 'audioCapture'\)/.test(mainSrc)
  ? bad('the old global media grant is still present in main.js')
  : ok('the old global media grant is gone');

/partition: surface\.partition/.test(mainSrc)
  ? ok('windows are created against a named surface partition')
  : bad('a window can still be created without a partition');

// ── the platform preload holds no voice or credential authority ─────────────
for (const verb of ['voiceStart', 'voiceStop', 'voiceFrame', 'voiceMicResult', 'voiceCaptureLost', 'onVoiceEvent']) {
  platformPreload.includes(verb)
    ? bad('platform preload EXPOSES voice verb: ' + verb)
    : ok('platform preload exposes no ' + verb);
}
/token|sessionToken|x-session-token/i.test(platformPreload)
  ? bad('platform preload mentions the session token (P2)')
  : ok('platform preload carries no session token (P2)');

console.log('\n  ' + pass + ' passed · ' + fail + ' failed\n');
process.exit(fail === 0 ? 0 : 1);
