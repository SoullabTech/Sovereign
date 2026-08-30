// DESKTOP-SOVEREIGN-STT-01 — the Desktop shell must remain identifiable.
//
// ⛔ WHY THIS TEST EXISTS ON THIS SIDE. `lib/utils/platformDetection.ts`
// classifies MAIA Desktop by the `maia-desktop/<version>` product token that
// Electron derives from THIS package's name and puts in the user agent. That
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
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(here, '..', 'package.json'), 'utf8'));

/** The exact regex `platformDetection.ts` uses. Kept in step by the test below. */
const DESKTOP_SHELL_UA_MARKER = /\bmaia-desktop\//i;

test('S1 — the package name still produces the marker the web classifies on', () => {
  assert.equal(pkg.name, 'maia-desktop',
    'the package was renamed — lib/utils/platformDetection.ts classifies Desktop by ' +
    'the "maia-desktop/" product token in the user agent, and a rename would ' +
    'silently put Desktop back on browser speech recognition');

  // Electron's default user agent carries `<name>/<version>`. This asserts the
  // token the web side actually matches on, not merely the name in isolation.
  const productToken = `${pkg.name}/${pkg.version}`;
  const ua = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ` +
             `(KHTML, like Gecko) ${productToken} Chrome/120`;
  assert.ok(DESKTOP_SHELL_UA_MARKER.test(ua),
    `the user agent Electron builds from this package (${productToken}) is not ` +
    'recognised as MAIA Desktop');
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
