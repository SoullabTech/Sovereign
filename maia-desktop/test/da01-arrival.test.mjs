// DESKTOP-ARRIVAL-01 — where the member actually arrives.
//
// ⛔ THE GAP THIS CLOSES. HOUSE-RECONCILE-01 carried the House, the shell, the
// menu and the containment — and dropped the three lines that make the House the
// ARRIVAL. The candidate reached canonical `/maia` only by a manual menu click,
// so cold launch and post-sign-in both showed the local D01 witness renderer as
// the member's home. A device walk found it at step 1.
//
// Every existing proof passed. dh01 proves the House threshold, ds01 proves
// containment, and both drive `shell.js` with fakes. `shell.show()` was correct
// the whole time; nothing owned the question of whether main ever CALLS it.
// That is the sixth gap of one shape in this programme: the assertion existed
// for the component, never for the caller.
//
// ⛔ So these assertions bind to the two ACTUAL arrival sites. Finding the
// string `/maia` somewhere in main.js is not a proof of arrival.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PLATFORM_ENTRY_PATH, PLATFORM_HOUSE_PATH } = require('../src/shell-policy.js');

const rawMain = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
// Comments stripped for the CODE assertions, so doctrine about arrival can never
// be mistaken for arrival. The header test deliberately reads the raw file.
const mainJs = rawMain
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');

/** The restored-session cold-launch callback, and nothing else. */
const coldArrival = () => /did-finish-load'[\s\S]*?\n {4}\}\);/.exec(mainJs)[0];
/** The sign-in success block, and nothing else. */
const signInSuccess = () => {
  const handler = /ipcMain\.handle\('maia:sign-in'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  return /if \(out\.ok\) \{[\s\S]*?\n {2}\}/.exec(handler)[0];
};

// ── the destination ─────────────────────────────────────────────────────────

test('the Desktop centre is canonical /maia', () => {
  assert.equal(PLATFORM_ENTRY_PATH, '/maia', 'the canonical entry path moved');
  assert.equal(PLATFORM_HOUSE_PATH, '/house');
  const goTo = /async function goTo\([\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(/id === MAIA \? PLATFORM_ENTRY_PATH/.test(goTo),
    'goTo(MAIA) no longer resolves to the canonical entry path');
});

// ── ⭐ ARRIVAL PATH 1: restored session, cold launch ────────────────────────

test('⭐ cold launch with a restored session reveals canonical MAIA', () => {
  const arrival = coldArrival();
  assert.ok(/goTo\(MAIA\)/.test(arrival),
    'a returning member arrives on the local witness renderer — scaffolding shown as a destination');
});

test('cold arrival still joins the canonical thread, and reveals AFTER the window has loaded', () => {
  const arrival = coldArrival();
  assert.ok(/continuity\.join\(\)/.test(arrival), 'the restored thread is no longer joined');
  // Placement is load-bearing and was proven on a device: the window exists and
  // the local renderer has finished loading before anything is revealed over it.
  assert.ok(/did-finish-load/.test(arrival));
});

// ── ⭐ ARRIVAL PATH 2: signing in ───────────────────────────────────────────

test('⭐ signing in reveals canonical MAIA', () => {
  const success = signInSuccess();
  assert.ok(/goTo\(MAIA\)/.test(success),
    'a member who just authenticated is left looking at the local witness renderer');
});

test('signing in opens the destinations for a member', () => {
  assert.ok(/buildMenu\(\)/.test(signInSuccess()),
    'the menu still reflects a signed-out member after sign-in');
});

test('sign-in reveals MAIA only on success, never on a failed attempt', () => {
  const handler = /ipcMain\.handle\('maia:sign-in'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  const outside = handler.replace(signInSuccess(), '');
  assert.ok(!/goTo\(/.test(outside), 'a failed sign-in reveals the canonical surface');
});

// ── the shape of the defect, asserted directly ─────────────────────────────

test('⭐ the menu is NOT the only way to reach MAIA', () => {
  // The exact defect: goTo existed, the menu called it, and nothing else did.
  const calls = [...mainJs.matchAll(/goTo\(/g)].length;
  assert.ok(calls >= 4,
    'arrival is reachable only by a manual gesture — the member must find their own way home');
  const menuOnly = /click: \(\) => \{ void goTo\(d\.id\); \}/.test(mainJs);
  assert.ok(menuOnly, 'the menu no longer navigates');
});

test('⛔ the local renderer stays MOUNTED as infrastructure, and is not removed', () => {
  // Not part of this repair. It owns the microphone and carries the voice
  // bridge; the defect was showing it, never its existence.
  assert.ok(/loadFile\(path\.join\(__dirname, 'index\.html'\)\)/.test(mainJs),
    'the privileged local renderer was removed — that is a different unit');
});

test('⛔ the header no longer claims this file is the D01 witness shell', () => {
  const header = rawMain.slice(0, 2000);
  assert.ok(!/It is NOT the MAIA Desktop Companion/.test(header),
    'the header still denies the House it now contains');
  // Whitespace-tolerant: the phrase wraps across comment lines in the source.
  assert.ok(/index\.html/.test(header), 'the header does not name the local renderer');
  assert.ok(/not\s+(?:\/\/\s*)?a\s+(?:\/\/\s*)?destination/i.test(header),
    'the header does not say the local renderer is not a destination');
});
