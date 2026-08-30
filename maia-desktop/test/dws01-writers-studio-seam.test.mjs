// DESKTOP ↔ WRITER'S STUDIO CONTINUITY — the seam, not the snapshot.
//
// ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
//
// Writer's Studio develops on its own programme. Desktop converges on canonical
// `/maia` and the canonical platform routes. Those two facts together create a
// normal moving-target problem: Desktop can be green against WS2-03C today and
// WS2-04 can change a route or a contract tomorrow.
//
// The wrong answer is to pin Desktop to a Writer's Studio snapshot and call it
// done. Pin SHAs for EVIDENCE; never pin the product architecture to them.
//
// The right answer is a small compatibility contract, checked continuously.
// This file is that contract in executable form. Every meaningful WS2 milestone
// answers one extra question — *did this change alter any of these seven seams?*
// If no, Desktop does nothing. If yes, the Studio lane records the changed
// contract and the DESKTOP lane adapts its container/navigation boundary —
// never the Studio implementation.
//
//   1. open the current Writer's Studio from House
//   2. see the same canonical Work
//   3. open canonical /maia situated in that Work
//   4. preserve the same conversation identity
//   5. return to that same Work
//   6. respect current Studio permissions
//   7. require no Desktop-specific Studio implementation
//
// ⚠️ EVIDENCE CLASS: SOURCE/TEST. That a member actually walks House → Studio →
// MAIA → back on a Mac is a DEVICE leg and is not claimed here. What IS claimed
// is that no Desktop code can make that walk impossible, and that Desktop holds
// no copy of Studio to drift from.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  PLATFORM_ORIGIN, PLATFORM_ENTRY_PATH, PLATFORM_HOUSE_PATH,
  navigationDecision, isMaiaSurface, platformPermission, HOUSE,
} = require('../src/shell-policy.js');

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const STUDIO = '/writers-studio';
const url = (p) => `${PLATFORM_ORIGIN}${p}`;

// ════════════════════════════════════════════════════════════════════════════
// SEAM 1 · open the current Writer's Studio from House
// ════════════════════════════════════════════════════════════════════════════

test('SEAM 1 — Writer\'s Studio is reachable, and reachable FROM THE HOUSE', () => {
  // ⭐ The route is not asserted as a literal in policy — dh01 forbids exactly
  // that. It is asserted as a House destination, which is where the Studio
  // programme declares it. If WS2 renames the route, the House renames it, the
  // allow-list regenerates, and this passes without Desktop being touched.
  const dest = HOUSE.destinations.find((d) => d.route === STUDIO);
  assert.ok(dest, `${STUDIO} is not a House destination — seam 1 is broken`);
  assert.ok(HOUSE.allowedRoots.includes(STUDIO), `${STUDIO} is not a navigable root`);
  assert.equal(navigationDecision(url(STUDIO)).action, 'allow');
  // …and its sub-paths, because a Studio is not one page.
  for (const p of [`${STUDIO}/`, `${STUDIO}/a-work`, `${STUDIO}/a-work/chapter-3`]) {
    assert.equal(navigationDecision(url(p)).action, 'allow', `${p} was blocked`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SEAM 2 · see the same canonical Work   ·   SEAM 7 · no Desktop Studio
// ════════════════════════════════════════════════════════════════════════════
//
// These two are one assertion from Desktop's side. Desktop sees the same Work
// precisely BECAUSE it has no Work of its own to see instead.

function desktopSources() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (/\.(js|json|html)$/.test(e.name)) out.push(full);
    }
  })(SRC);
  return out;
}

test('SEAM 7 — Desktop holds NO Studio implementation, Work model, or route table', () => {
  // ⛔ THE LOAD-BEARING GUARD OF THIS FILE. Everything else here can be
  // repaired by editing a route. This one is the class of mistake that cannot
  // be repaired later: a copy of Studio inside `maia-desktop/` would be green
  // on the day it was written and silently diverge forever after.
  const offenders = [];
  for (const file of desktopSources()) {
    const rel = path.relative(SRC, file);
    // The generated allow-list is the ONE place a Studio route may appear, and
    // it is generated from the House rather than authored here.
    if (rel === 'house-allowlist.json') continue;
    const body = fs.readFileSync(file, 'utf8');
    // Comments are documentation, not implementation — this very seam is
    // described in prose in several modules and must stay describable.
    const code = body
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n').filter((l) => !/^\s*(\/\/|\*|#)/.test(l)).join('\n');
    for (const pattern of [
      /writers?-?studio/i,        // a Studio route or component, hard-coded
      /\bWorkModel\b|\bcreateWork\b|\bworkId\b/,   // a Work model of its own
      // ⛔ Studio domain nouns — deliberately NARROW. The first cut of this
      // list included `draft`, which flagged `main.js`'s tail-invariant salvage
      // buffer: material rescued from a dying epoch becomes "the member's own
      // draft". That is a voice concept that happens to share a word with a
      // Studio one. A guard that cries wolf gets suppressed, so the word came
      // out rather than the file being exempted.
      /\bchapter(s)?\b|\bmanuscript\b|\brevision(s)?\b/i,
    ]) {
      if (pattern.test(code)) offenders.push(`${rel} :: ${pattern}`);
    }
  }
  assert.deepEqual(offenders, [],
    `Desktop grew its own Studio/Work implementation:\n  ${offenders.join('\n  ')}`);
});

test('SEAM 2 — Desktop reads canonical routes only; it mints no Studio state', () => {
  // Desktop's entire knowledge of where Studio is comes from a GENERATED file
  // whose header names its source. That is the seam.
  const raw = fs.readFileSync(path.join(SRC, 'house-allowlist.json'), 'utf8');
  assert.match(raw, /GENERATED by scripts\/generate-desktop-house-allowlist\.ts/);
  assert.match(raw, /lib\/navigation\/houseDestinations\.ts/);
  assert.match(raw, /Do not edit by hand/);
});

// ════════════════════════════════════════════════════════════════════════════
// SEAM 3 · open canonical /maia situated in that Work
// SEAM 5 · return to that same Work
// ════════════════════════════════════════════════════════════════════════════

test('SEAM 3 + 5 — Studio → MAIA → Studio is navigable in both directions', () => {
  for (const hop of [STUDIO, PLATFORM_ENTRY_PATH, `${STUDIO}/a-work`,
                     PLATFORM_HOUSE_PATH, STUDIO]) {
    assert.equal(navigationDecision(url(hop)).action, 'allow',
      `the walk broke at ${hop}`);
  }
  // ⭐ And MAIA opened from Studio is the CANONICAL MAIA — not a Desktop-local
  // one, and not a Studio-scoped variant.
  assert.ok(isMaiaSurface(url(PLATFORM_ENTRY_PATH)));
  assert.equal(PLATFORM_ENTRY_PATH, '/maia');
});

// ════════════════════════════════════════════════════════════════════════════
// SEAM 4 · preserve the same conversation identity
// ════════════════════════════════════════════════════════════════════════════

test('SEAM 4 — conversation identity is the canonical thread, never a Studio-scoped one', () => {
  const conv = fs.readFileSync(path.join(SRC, 'conversation.js'), 'utf8');
  // The canonical routes, as data rather than as a promise.
  const { TURNS_PATH, MAIA_PATH } = require('../src/conversation.js');
  assert.equal(TURNS_PATH, '/api/conversation/turns');
  assert.equal(MAIA_PATH, '/api/sovereign/app/maia/list');
  // ⛔ No second continuity key. A Studio-scoped or surface-scoped thread id
  // would fork the conversation the moment a member opened a Work.
  assert.doesNotMatch(conv, /studio[_-]?session|work[_-]?session|surface[_-]?thread/i,
    'a surface-scoped conversation identity appeared — seam 4 is broken');
});

// ════════════════════════════════════════════════════════════════════════════
// SEAM 6 · respect current Studio permissions
// ════════════════════════════════════════════════════════════════════════════

test('SEAM 6 — Desktop grants Studio nothing the platform would not', () => {
  // Navigability is not capability. Studio is reachable (seam 1) and holds no
  // microphone — the same answer the platform gives it.
  for (const p of [STUDIO, `${STUDIO}/a-work`]) {
    assert.equal(platformPermission('media', {
      requestingUrl: url(p), isMainFrame: true, maiaIsVisible: true }), false,
      `${p} was granted a microphone by Desktop`);
  }
  // ⛔ And Desktop adds no entitlement of its own. Audience/permission for a
  // Studio destination is the House's to state; Desktop must not carry a second
  // opinion about who may enter.
  const dest = HOUSE.destinations.find((d) => d.route === STUDIO);
  assert.ok(typeof dest.audience === 'string' && dest.audience.length > 0,
    'the Studio destination carries no audience — Desktop cannot infer one');
  const policy = fs.readFileSync(path.join(SRC, 'shell-policy.js'), 'utf8');
  assert.doesNotMatch(policy, /audience\s*[=!]==?\s*['"]/,
    'Desktop policy started deciding audience — that authority belongs upstream');
});
