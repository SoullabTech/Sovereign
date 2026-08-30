// MAIA Desktop — the surface capability table.
//
// ⛔ THIS FILE IS AN AUTHORITY DECISION, NOT CONFIGURATION.
//
// COMPANION-01A, founder ruling superseding D01 witness-only scope. The shell
// may now become the Companion; the security posture did not move with it.
//
// ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
//
// Until now Desktop had one window, and the permission handler was installed on
// `session.defaultSession` with the requesting webContents ignored:
//
//     setPermissionRequestHandler((_wc, permission, callback) => {
//       callback(permission === 'media' || permission === 'audioCapture');
//     });
//
// The file header said media was granted "only to our own file URL". The code
// checked no URL and no window. With one window loading file:// that was
// harmless — and it stops being harmless the moment a second surface exists,
// because a platform window would inherit audio permission by default.
//
// The Companion invariant would then rest on nobody ever importing
// ContinuousConversation into House. Phase 1B established that the web tree
// acquires the microphone from inside its component lifecycle, so that import
// is a plausible accident, not a hypothetical one. A convention is not a wall.
//
// ── WHAT THIS EXPRESSES ─────────────────────────────────────────────────────
//
// Which SURFACE may hold which CAPABILITY. It is deliberately written in domain
// terms rather than Electron terms: Electron is the current host adapter, not
// the architecture, and this policy must survive being carried into a native
// supervisor. main.js maps these names onto partitions and permission handlers;
// nothing else should.
//
// ⛔ Adding a capability to a surface widens Desktop's authority. It requires a
// ruling recorded in `review` below — not an edit to a test expectation.

'use strict';

const SURFACES = {
  // The governed voice edge. Unchanged from D01: its single privileged act is
  // acquiring the microphone, and it hands PCM to main with no further
  // authority. See renderer.js and MAIA-D01.
  voice: {
    partition: 'persist:maia-voice',
    entry: 'index.html',
    preload: 'preload.js',
    capabilities: ['media', 'audioCapture'],
    review: 'MAIA-D01. The governed voice edge; audio only, never video.',
  },

  // The Companion platform surface: House, History, Settings, MAIA
  // presentation. It renders the member's canonical realm and owns nothing.
  //
  // ⛔ capabilities is EMPTY and that is the point (prohibition P1). A platform
  // surface calling getUserMedia() correctly is refused by Desktop authority,
  // not by code review.
  platform: {
    partition: 'persist:maia-platform',
    entry: 'platform.html',
    preload: 'preload-platform.js',
    capabilities: [],
    review: 'COMPANION-01A P1. Renders the realm, owns no voice authority.',
  },
};

// A surface used only to prove the wall: it asks for the microphone the way web
// code would, and must be refused. Never shipped in a member build.
const PROBE_SURFACE = {
  partition: 'persist:maia-platform',
  entry: 'platform-probe.html',
  preload: 'preload-platform.js',
  capabilities: [],
  review: 'COMPANION-01A negative proof. Dev-only, gated by env.',
};

// Everything not named above is refused, including anything that reaches the
// default session. Fail closed: an unrecognised surface gets nothing.
function capabilitiesFor(partition) {
  for (const s of Object.values(SURFACES)) {
    if (s.partition === partition) return s.capabilities;
  }
  return [];
}

function isPermitted(partition, permission) {
  return capabilitiesFor(partition).includes(permission);
}

module.exports = { SURFACES, PROBE_SURFACE, capabilitiesFor, isPermitted };
