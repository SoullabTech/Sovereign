// DESKTOP-SOVEREIGN-STT-01 — the Desktop shell must remain identifiable.
//
// ⛔ WHY THIS TEST EXISTS ON THIS SIDE. `lib/utils/platformDetection.ts`
// classifies MAIA Desktop by the `maia-desktop/<version>` product token that
// the main process pins into Electron's fallback user agent before startup. That
// classification decides whether `/maia` uses the sovereign local-Whisper
// transport or the browser recognition service canon forbids (D01 §XII).
//
// So the marker is load-bearing, and it lives in a file nobody would think to
// check before renaming. Renaming this package would silently reclassify
// Desktop as an ordinary browser and quietly restore the exact defect
// VOICE-PATH-SELECTION-01 documents — with no error anywhere.
//
// This makes that rename fail a test instead.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs, { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(here, '..', 'package.json'), 'utf8'));
const MAIN = readFileSync(path.join(here, '..', 'src', 'main.js'), 'utf8');

/** The exact regex `platformDetection.ts` uses. */
const DESKTOP_SHELL_UA_MARKER = /\bmaia-desktop\//i;

/**
 * ⛔ THE HALF-CONTRACT THIS CLOSES. DESKTOP-SOVEREIGN-STT-01.
 *
 * This test was carried into HOUSE-RECONCILE-01 while its counterpart was left
 * on the branch. It asserted the package name against the regex ABOVE — its own
 * copy — and never opened `platformDetection.ts`. So it passed for a lineage
 * where no such classification existed at all, and a device walk found MAIA
 * unable to listen with every proof green.
 *
 * A pin that does not read the thing it pins is not a pin. This reads it.
 */
const WEB_DETECTION = readFileSync(
  path.join(here, '..', '..', 'lib', 'utils', 'platformDetection.ts'), 'utf8',
);

test('S0 — the web side actually classifies Desktop, and on the SAME marker', () => {
  assert.ok(/DESKTOP_SHELL_UA_MARKER\s*=\s*\/\\bmaia-desktop\\\/\/i/.test(WEB_DETECTION),
    'platformDetection.ts does not carry the marker this test pins — Desktop would be ' +
    'classified as an ordinary browser and take the web-speech path canon forbids');
  assert.ok(/export function isDesktopShell/.test(WEB_DETECTION), 'no isDesktopShell()');
  assert.ok(/if \(facts\.isDesktop\) return facts\.canRecordAudio \? 'sovereign-whisper'/
    .test(WEB_DETECTION), 'Desktop does not select the sovereign transport');
  assert.ok(!/'web-speech'[\s\S]{0,40}isDesktop/.test(WEB_DETECTION),
    'Desktop can reach web-speech');
});

const CONTINUOUS = readFileSync(
  path.join(here, '..', '..', 'components', 'voice', 'ContinuousConversation.tsx'), 'utf8',
);

test('S0b — the surface actually OBEYS the Desktop route', () => {
  // ⛔ platformDetection deciding correctly is not enough. The component that
  // runs after the tap has to consult it. Proving the decision without proving
  // the obedience is the same seam-shaped miss this test was carried with.
  assert.ok(/isDesktop \|\| !hasSpeechRecognitionAPI\(\)/.test(CONTINUOUS),
    'ContinuousConversation reaches the sovereign path only when SpeechRecognition is ABSENT — ' +
    'in Electron it is present, so Desktop takes the browser path regardless of classification');
  assert.ok(/isDesktopShell|selectVoiceTransport/.test(CONTINUOUS),
    'the surface never imports the Desktop classification at all');
});

test('S1 — main pins the exact marker before Electron startup', () => {
  assert.equal(pkg.name, 'maia-desktop', 'the governed package identity changed');
  assert.ok(MAIN.includes(
    'const DESKTOP_UA_MARKER = `maia-desktop/${app.getVersion()}`;'),
  'main does not construct the exact marker the web side classifies');
  assert.ok(MAIN.includes('app.userAgentFallback = `${app.userAgentFallback} ${DESKTOP_UA_MARKER}`.trim();'),
    'main does not add the governed marker to Electron userAgentFallback');

  const markerAt = MAIN.indexOf('app.userAgentFallback');
  const readyAt = MAIN.indexOf('app.whenReady');
  assert.ok(markerAt >= 0 && readyAt >= 0 && markerAt < readyAt,
    'the Desktop marker must be pinned before app.whenReady');

  // productName becomes MAIADesktop in Electron's default UA, which does NOT
  // satisfy the web contract. The explicit marker is therefore load-bearing.
  const electronBase = `Mozilla/5.0 MAIADesktop/${pkg.version} Chrome/120`;
  assert.equal(DESKTOP_SHELL_UA_MARKER.test(electronBase), false,
    'fixture no longer represents Electron runtime behaviour');
  const governed = `${electronBase} maia-desktop/${pkg.version}`;
  assert.ok(DESKTOP_SHELL_UA_MARKER.test(governed),
    'the explicitly governed runtime marker is not recognised as MAIA Desktop');
});

test('S1 — the marker is not so loose that an ordinary browser matches it', () => {
  const ordinary = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
                   '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  assert.equal(DESKTOP_SHELL_UA_MARKER.test(ordinary), false,
    'an ordinary browser is being classified as MAIA Desktop');
});

test('S10 — this unit did not touch the Desktop permission perimeter', () => {
  // Classification is not authority. Whether /maia may open a microphone at all
  // stays governed by the main-process gate, unchanged by this unit.
  const policy = fs.readFileSync(path.join(here, '..', 'src', 'shell-policy.js'), 'utf8');
  assert.ok(/function platformPermission/.test(policy));
  assert.ok(/AUDIO_PERMISSIONS/.test(policy),
    'the audio capability gate was altered by a classification change');
  const shell = fs.readFileSync(path.join(here, '..', 'src', 'shell.js'), 'utf8');
  assert.ok(!/preload/.test(shell.replace(/⛔ There is NO `preload` key[\s\S]*?\n/, '')) ||
            /no `preload` key/i.test(shell),
    'a preload appeared in the platform view');
});
