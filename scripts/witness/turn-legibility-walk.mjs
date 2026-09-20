/**
 * TURN LEGIBILITY WALK — capture + assertion instrument
 *
 * Lane: MOTION-CENSUS-01 · supports docs/design/contracts/conversation-turn-legibility.md
 *
 * WHAT THIS IS FOR
 * ----------------
 * It captures the two Experience Contract screenshots and asserts the parts of
 * the turn-legibility law that are machine-checkable. It runs HEADED and pauses
 * so a human signs in and holds a real conversation — the screenshots are of a
 * real session, not a synthetic fixture.
 *
 * ⛔ WHAT IT DOES NOT DO — and must never be read as doing.
 * It does not write `experience_verification`, and passing here is NOT that
 * field. The gate exists to record that a person looked. A script producing
 * PNGs does not prove anyone looked, and the contract's attestation must be
 * written from watching, not from this output. What this instrument adds is a
 * deterministic measurement a human eye cannot make reliably; what it cannot
 * add is the looking.
 *
 * ⛔ It cannot see streaming flicker. Per-token re-fade is a timing behaviour
 * this instrument does not sample. That observation stays human.
 *
 * THE ASSERTIONS, AND WHAT EACH ONE DISCRIMINATES
 * ----------------------------------------------
 *   A · no inline opacity on a turn or its wrapper
 *       Framer's `initial={{ opacity: 0 }}` works by SETTING inline
 *       `style="opacity: 0"`. If the repair were absent or reverted, this
 *       assertion fails. It is the direct structural signature of the defect.
 *
 *   B · under prefers-reduced-motion, `.maia-turn-enter` resolves to
 *       animation-name `none`
 *       Verifies the guard in app/globals.css is actually reached, rather than
 *       present in the stylesheet but overridden.
 *
 *   C · every turn's text is computed-visible (opacity 1, non-zero box)
 *       The member-facing property the whole law exists to protect.
 *
 * ⭐ The context runs with reducedMotion: 'reduce' ON PURPOSE. That is the
 * discriminating condition: our CSS keyframe is switched off, so the turn must
 * be readable from its RESTING state alone. Framer's opacity animation is not
 * disabled by reduced motion — so under the old code the turn would still
 * depend on JS to become visible, and C would fail.
 *
 * USAGE
 *   npm run dev                                   (separate tab)
 *   node scripts/witness/turn-legibility-walk.mjs
 *
 *   Browser opens → sign in → hold a short conversation so at least one MAIA
 *   turn is on screen → return to the terminal and press Enter.
 *
 *   Needs a Chromium build: npx playwright install chromium
 */

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const BASE = process.env.WALK_BASE_URL ?? 'http://localhost:3000';
const OUT = 'docs/design/contracts/screenshots';
const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

const TURN_WRAPPER = '.maia-turn-enter';

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(q, () => { rl.close(); res(); }));
}

const results = [];
const record = (id, ok, detail) => { results.push({ id, ok, detail }); };

const browser = await chromium.launch({ headless: false });
// ⭐ The discriminating condition — see header.
const ctx = await browser.newContext({ viewport: DESKTOP, reducedMotion: 'reduce' });
const page = await ctx.newPage();

console.log(`\nOpening ${BASE}/maia — sign in and hold a short conversation.`);
console.log('At least one MAIA turn must be on screen.\n');
await page.goto(`${BASE}/maia`, { waitUntil: 'domcontentloaded' });
await ask('Press Enter here once a real conversation is visible… ');

mkdirSync(OUT, { recursive: true });

const wrappers = page.locator(TURN_WRAPPER);
const n = await wrappers.count();
if (n === 0) {
  // ⛔ Fail rather than pass on an empty page. An instrument that finds nothing
  // must say so — it does not know what it did not find.
  console.error(`\n⚠️  INSTRUMENT FAILURE — no ${TURN_WRAPPER} on the page.`);
  console.error('    Either no conversation was visible, or the class is not being applied.');
  console.error('    Not a pass. Nothing captured.\n');
  await browser.close();
  process.exit(2);
}
console.log(`\nFound ${n} turn wrapper(s).\n`);

// ── A · no inline opacity anywhere on a turn or its wrapper ─────────────────
const inlineOpacity = await page.evaluate((sel) => {
  const bad = [];
  for (const el of document.querySelectorAll(sel)) {
    if (el.style.opacity !== '') bad.push({ where: 'wrapper', value: el.style.opacity });
    for (const d of el.querySelectorAll('*')) {
      if (d.style.opacity !== '' && d.textContent.trim().length > 0) {
        bad.push({ where: 'descendant', value: d.style.opacity, text: d.textContent.trim().slice(0, 40) });
      }
    }
  }
  return bad;
}, TURN_WRAPPER);
record('A', inlineOpacity.length === 0,
  inlineOpacity.length === 0
    ? 'no inline opacity on any turn wrapper or text node'
    : `inline opacity present: ${JSON.stringify(inlineOpacity.slice(0, 5))}`);

// ── B · reduced-motion guard is actually reached ────────────────────────────
const animName = await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  return el ? getComputedStyle(el).animationName : null;
}, TURN_WRAPPER);
record('B', animName === 'none',
  `computed animation-name under prefers-reduced-motion = ${animName}`);

// ── C · every turn is computed-visible ──────────────────────────────────────
const invisible = await page.evaluate((sel) => {
  const bad = [];
  for (const el of document.querySelectorAll(sel)) {
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const text = el.textContent.trim();
    if (!text) continue;
    if (parseFloat(cs.opacity) < 1 || cs.visibility === 'hidden' || box.width === 0 || box.height === 0) {
      bad.push({ opacity: cs.opacity, visibility: cs.visibility, w: box.width, h: box.height, text: text.slice(0, 40) });
    }
  }
  return bad;
}, TURN_WRAPPER);
record('C', invisible.length === 0,
  invisible.length === 0
    ? `all ${n} turn(s) computed-visible at opacity 1`
    : `not visible: ${JSON.stringify(invisible.slice(0, 5))}`);

// ── Capture ─────────────────────────────────────────────────────────────────
await page.screenshot({ path: path.join(OUT, 'conversation-turn-legibility-desktop.png') });
await page.setViewportSize(MOBILE);
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, 'conversation-turn-legibility-mobile.png') });

const spill = await page.evaluate(() => document.documentElement.scrollWidth);
record('D', spill <= MOBILE.width, `mobile document scrollWidth = ${spill} (viewport ${MOBILE.width})`);

// ── Report ──────────────────────────────────────────────────────────────────
console.log('── ASSERTIONS ─────────────────────────────────────────────────');
for (const r of results) console.log(`  ${r.ok ? '✅' : '❌'} ${r.id}  ${r.detail}`);
const failed = results.filter((r) => !r.ok);
console.log(`\nScreenshots written to ${OUT}/`);
if (failed.length) {
  console.error(`\n❌ ${failed.length} assertion(s) FAILED — the repair does not hold as written.`);
  console.error('   ⛔ Do not write experience_verification. Report this output instead.\n');
} else {
  console.log('\n✅ Machine-checkable assertions hold.');
  console.log('   ⛔ This is NOT experience_verification. Still owed, by a person:');
  console.log('      · did a streamed MAIA response settle in place, without per-token flicker?');
  console.log('      · did the room still read right?');
  console.log('   Write that field from what you watched, not from this output.\n');
}

await browser.close();
process.exit(failed.length ? 1 : 0);
