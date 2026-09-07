/**
 * NOTES v1 — PRODUCT WITNESS.
 *
 * The founder's acceptance question, and the only thing this script asks:
 *
 *   "Can I catch a thought without interrupting the writing,
 *    and can I find it again?"
 *
 * It deliberately does NOT re-test FR-07/FR-08 semantics by hand. Those belong
 * in the automated falsifiers (lib/writersStudio/__tests__/notesAnchor.test.ts)
 * — this is the one act a suite cannot perform: a writer, mid-manuscript,
 * catching a thought and coming back for it.
 *
 * Run against a LOCAL cluster only. Requires a seeded member, an auth_sessions
 * row whose token matches the cookie below, a manuscript and its sections.
 *
 *   node scripts/witness/notes-v1-witness.mjs
 *
 * NOTE ON THE INSTRUMENT, recorded because it produced two false readings
 * before it produced a true one: Playwright's `count()` does not auto-wait.
 * Counting `li` immediately after opening the panel races the notes fetch and
 * reports 0 while the list is loading — which reads exactly like a note that
 * was never written. Every count below is preceded by an auto-waiting
 * `waitFor`. An instrument that races the thing it measures reports the
 * absence of its own patience.
 */
import { chromium } from 'playwright';

const M = '33333333-3333-4333-8333-333333333333';
const URL = `http://localhost:3000/writers-studio/canvas?m=${M}`;
const THOUGHT = 'The torus chapter is really about grief, not geometry. Not for the prose yet.';

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'maia_session', value: 'witness-session-token', domain: 'localhost', path: '/' }]);
const p = await ctx.newPage();
const step = (s) => console.log(s);

const openNotes = async () => {
  await p.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('[data-destination="notes"][data-state="rest"]').waitFor({ timeout: 30000 });
  await p.locator('[data-destination="notes"]').click();
  await p.locator('[data-panel-role="notes"]').waitFor({ timeout: 20000 });
};

// ── the writing is on the table ─────────────────────────────────────────────
await openNotes();
step('1. writing on the table, Notes opened beside it — no navigation away');

const panel = p.locator('[data-panel-role="notes"]');
step(`2. anchor offered: "${await panel.locator('button').first().innerText()}"`);

// ── catch the thought ───────────────────────────────────────────────────────
await panel.locator('textarea').first().fill(THOUGHT);
await p.keyboard.press('Control+Enter');
await panel.locator('li').first().waitFor({ timeout: 20000 });
step(`3. caught it with ⌘↵ · it appeared beside the writing = ${await panel.locator('li').count()}`);
await p.screenshot({ path: '/tmp/witness-1-kept.png' });

// ── leave entirely ──────────────────────────────────────────────────────────
await p.goto('http://localhost:3000/writers-studio', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(1500);
step('4. left the room entirely — Studio Home');

// ── come back ───────────────────────────────────────────────────────────────
await openNotes();
const back = p.locator('[data-panel-role="notes"]');
const item = back.locator('li').filter({ hasText: 'grief, not geometry' });
await item.first().waitFor({ timeout: 20000 }).catch(() => {});
const found = await item.count();
const anchorKind = await back.locator('li').first().getAttribute('data-note-anchor');
const anchorText = await back.locator('[data-anchor-kind]').first().innerText();
const railRow = (await p.locator('[data-destination="notes"]').innerText()).replace(/\n/g, ' ');
step(`5. returned · found = ${found === 1} · anchor = ${anchorKind} · reads "${anchorText}" · rail row "${railRow}"`);
await p.screenshot({ path: '/tmp/witness-2-returned.png' });

await b.close();
console.log(`\nWITNESS ${found === 1 ? 'PASS' : 'FAIL'}`);
