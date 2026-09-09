/**
 * WS-WHOLE-MANUSCRIPT-01 · the runtime falsifier.
 *
 * ⛔ WHAT THIS CAN AND CANNOT DECIDE. Every check here is a question a browser
 * can answer without a person: does the window advance, does a character
 * survive an eviction, does the boundary refuse, does the gold row name the
 * place the viewport is actually showing. None of them is the §4b instrument.
 * Whether the divisions perceptually recede, whether movement feels continuous,
 * whether the refusal reads as quiet rather than as an error — a machine has no
 * standing on any of it.
 *
 *   A machine PASS makes the runtime mechanics eligible for human witnessing.
 *   It does not promote the human witness.
 *
 * ⛔ UNOBSERVABLE IS NOT PASS. Nothing here is skipped, tolerated, or softened
 * when the browser cannot reach the state a check needs. A check that cannot be
 * exercised FAILS, because "we could not look" and "we looked and it was fine"
 * are different facts and the harness must never blur them. In particular, no
 * check manufactures internal state to force a case the browser could not reach
 * on its own — a forced negative would prove the harness can write to React,
 * not that the product behaves.
 */

import { appendFileSync } from 'node:fs';
import { test, expect, type Browser, type Page } from '@playwright/test';
import {
  MANUSCRIPT_ID, PASSWORD, SECTION_COUNT, USERNAME, draftSectionId, headingFor,
} from './fixture';

test.describe.configure({ mode: 'serial' });

const SCROLLER = '[data-whole-manuscript]';
const NOTE = '[data-whole-manuscript-note]';
const OUTLINE = '[data-structured-outline]';
const shell = (i: number) => `[data-whole-manuscript-section="${draftSectionId(i)}"]`;
const editor = (i: number) => `${shell(i)} textarea`;

let page: Page;
/** Every console error and uncaught exception for the whole run, in order. */
const faults: string[] = [];

/**
 * ⭐ THE DATABASE IS DISPOSABLE. THE CLAIM THAT IT PASSED IS NOT.
 *
 * The harness destroys its cluster, its build and its run directory on a pass —
 * which is right, and would also destroy the only record that the pass ever
 * happened. Each check therefore reports its own outcome to a durable file the
 * caller composes into a result block, so the evidence survives the evidence's
 * environment.
 *
 * Written per check rather than summarised at the end: a run that dies midway
 * must leave what it had established, and a summary written by the last test
 * cannot exist for a run whose last test never ran.
 */
const record = (label: string, outcome: string) => {
  const out = process.env.WM_RESULT;
  if (out) appendFileSync(out, `${label} ${outcome}\n`);
};

/** The constitution's own name for a check: the token before the first '·'. */
const labelOf = (title: string) => title.split('·')[0].trim();

/** Which sections currently hold a live editor, by position. */
const mountedPositions = () =>
  page.$$eval('[data-whole-manuscript-mounted="true"]', (els) =>
    els
      .map((e) => Number((e.getAttribute('data-whole-manuscript-section') ?? '').slice(-12)))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b));

/**
 * The position of the first section the scroller's viewport actually covers,
 * read from geometry alone.
 *
 * Deliberately independent of anything the component publishes about itself:
 * checks 6a and 6b compare the gold row and the URL against WHAT IS ON SCREEN,
 * not against the surface's own account of what is on screen.
 */
const observedTopPosition = () =>
  page.evaluate(() => {
    const sc = document.querySelector('[data-whole-manuscript]') as HTMLElement | null;
    if (!sc) return -1;
    const top = sc.scrollTop;
    const bottom = top + sc.clientHeight;
    let first = Number.POSITIVE_INFINITY;
    for (const node of Array.from(sc.querySelectorAll('[data-whole-manuscript-section]'))) {
      const el = node as HTMLElement;
      const start = el.offsetTop;
      const end = start + el.offsetHeight;
      if (end >= top && start <= bottom) {
        const i = Number((el.getAttribute('data-whole-manuscript-section') ?? '').slice(-12));
        if (Number.isFinite(i) && i < first) first = i;
      }
    }
    return first === Number.POSITIVE_INFINITY ? -1 : first;
  });

const scrollBy = (screens: number) =>
  page.$eval(SCROLLER, (el, n) => { (el as HTMLElement).scrollTop += (el as HTMLElement).clientHeight * n; }, screens);

/** Put the caret where a check needs it, using only real key gestures. */
const caretToStart = () => page.keyboard.press('ControlOrMeta+Home');
const caretToEnd = () => page.keyboard.press('ControlOrMeta+End');

test.beforeAll(async ({ browser }: { browser: Browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') faults.push(m.text()); });
  page.on('pageerror', (e) => faults.push(String(e)));

  /* The real sign-in endpoint, into this context's own cookie jar. No injected
     session: an identity the product would not have issued proves nothing. */
  const res = await page.request.post('/api/members/signin', {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(res.status(), 'the fixture member must sign in through the real endpoint').toBe(200);

  await page.goto(`/writers-studio/canvas?m=${MANUSCRIPT_ID}`);
  await expect(page.locator('[data-manuscript-view]')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator(OUTLINE)).toBeVisible({ timeout: 60_000 });
});

test.afterEach(({}, info) => {
  /* ⛔ Only `passed` is a pass. A timed-out, skipped or interrupted check is
     reported as what it was — UNOBSERVABLE IS NOT PASS, in the record as well
     as in the assertions. */
  record(labelOf(info.title), info.status === 'passed' ? 'PASS' : String(info.status ?? 'unknown').toUpperCase());
});

test.afterAll(async () => {
  /* Dev-server hot-reload noise cannot arise here — the subject is a production
     build served by `next start` — but the filter is explicit rather than
     assumed, so the number means what its name says. */
  const nonHmr = faults.filter((f) => !/\[HMR\]|hot-update|webpack-hmr/i.test(f));
  record('console non-HMR errors:', String(nonHmr.length));
  for (const f of nonHmr.slice(0, 10)) record('  fault:', f.slice(0, 200));
  await page?.context().close();
});

test('enter Whole Manuscript', async () => {
  await page.locator('[data-manuscript-view-choice="whole"]').click();
  await expect(page.locator(SCROLLER)).toBeVisible();
});

/* ── G1 ─────────────────────────────────────────────────────────────────────
   The render loop d863d4df5 carried. It did not fail a check — it prevented
   the acceptance instrument from being entered at all, which is why it is a
   gate rather than one of the numbered observations. */
test('G1 · the surface holds a stable identity (no render loop)', async () => {
  await page.waitForTimeout(1500);
  const loops = faults.filter((f) => /Maximum update depth/i.test(f));
  expect(loops, 'a re-render loop makes every later check meaningless').toEqual([]);
});

/* ── G2 ─────────────────────────────────────────────────────────────────────
   A shell for every section; an editor for only a few. If everything mounted,
   the checks below would pass for a reason that does not scale — and the view
   exists precisely because 262 live editors is not a thing one may do. */
test('G2 · 262 shells, a small window of editors', async () => {
  const shells = await page.locator('[data-whole-manuscript-section]').count();
  expect(shells, 'every section keeps its place whether or not it is mounted').toBe(SECTION_COUNT);

  const mounted = await mountedPositions();
  expect(mounted.length).toBeGreaterThan(0);
  expect(mounted.length, 'the editor window must stay small — this is not a flat render')
    .toBeLessThan(40);
});

/* ── 1 ── scroll from the start through far-off sections → keeps flowing ──── */
test('1 · the book keeps flowing under a long scroll', async () => {
  await page.$eval(SCROLLER, (el) => { (el as HTMLElement).scrollTop = 0; });
  await page.waitForTimeout(300);

  let reached = Math.max(...(await mountedPositions()));
  const progress: number[] = [reached];

  for (let step = 0; step < 40 && reached < 120; step++) {
    await scrollBy(3);
    await page.waitForTimeout(120);
    const now = Math.max(...(await mountedPositions()));
    /* The c8560f30d defect stalled here: nothing intersected, the window never
       committed, and the next sections never mounted. A stall is a FAIL, never
       a slow pass. */
    expect(now, `the window stopped advancing at ${now} (step ${step})`).toBeGreaterThanOrEqual(reached);
    reached = now;
    progress.push(now);
  }

  expect(reached, `scrolling reached only section ${reached + 1}`).toBeGreaterThanOrEqual(120);
  expect(progress[progress.length - 1]).toBeGreaterThan(progress[0]);
});

/* ── 2 ── type · scroll far away · scroll back → the words are there ─────── */
test('2 · an edit survives eviction and return', async () => {
  await page.$eval(SCROLLER, (el) => { (el as HTMLElement).scrollTop = 0; });
  await expect(page.locator(editor(1))).toBeVisible();

  const marker = ' EDIT-SURVIVES-EVICTION';
  await page.locator(editor(1)).click();
  await caretToEnd();
  await page.keyboard.type(marker);
  await expect(page.locator(editor(1))).toHaveValue(new RegExp(marker.trim()));

  /* Away, until the editor is genuinely gone — not merely off screen. */
  for (let i = 0; i < 30; i++) {
    await scrollBy(3);
    await page.waitForTimeout(100);
    if ((await page.locator(editor(1)).count()) === 0) break;
  }
  expect(await page.locator(editor(1)).count(),
    'the check is UNOBSERVABLE unless the editor was really evicted').toBe(0);
  await expect(page.locator(shell(1))).toHaveAttribute('data-whole-manuscript-mounted', 'false');

  await page.$eval(SCROLLER, (el) => { (el as HTMLElement).scrollTop = 0; });
  await expect(page.locator(editor(1))).toBeVisible();
  await expect(page.locator(editor(1)), 'the writer returned to find their sentence gone')
    .toHaveValue(new RegExp(marker.trim()));
});

/* ── 3 ── type · switch to SECTION · switch back → the words are there ───── */
test('3 · an edit survives the view change', async () => {
  await page.$eval(SCROLLER, (el) => { (el as HTMLElement).scrollTop = 0; });
  await expect(page.locator(editor(2))).toBeVisible();

  const marker = ' EDIT-SURVIVES-VIEW-CHANGE';
  await page.locator(editor(2)).click();
  await caretToEnd();
  await page.keyboard.type(marker);
  await expect(page.locator(editor(2))).toHaveValue(new RegExp(marker.trim()));

  /* Leaving Whole unmounts every editor at once — no scroll, no blur. This is
     the third way an editor can disappear, and the one no lifecycle catches. */
  await page.locator('[data-manuscript-view-choice="section"]').click();
  await expect(page.locator(SCROLLER)).toHaveCount(0);
  await page.locator('[data-manuscript-view-choice="whole"]').click();
  await expect(page.locator(SCROLLER)).toBeVisible();

  await page.locator(`${OUTLINE} [data-section="2"]`).click();
  await expect(page.locator(editor(2))).toBeVisible();
  await expect(page.locator(editor(2)), 'switching views ate the sentence').toHaveValue(new RegExp(marker.trim()));
});

/* ── 4 ── Backspace at a section start → the boundary refuses, quietly ───── */
test('4 · the section boundary refuses a merge gesture', async () => {
  await expect(page.locator(editor(2))).toBeVisible();
  const before = await page.locator(editor(2)).inputValue();

  await page.locator(editor(2)).click();
  await caretToStart();
  await page.keyboard.press('Backspace');

  await expect(page.locator(NOTE)).toHaveText('Sections stay separate here.');
  expect(await page.locator(editor(2)).inputValue(),
    'the refusal must change nothing').toBe(before);
  /* No modal, no merge offer, no structural command: refusal is a sentence. */
  expect(await page.locator('[role="dialog"]').count()).toBe(0);
});

/* ── 5 ── rail click to a far section from a distant window → it arrives ─── */
test('5 · the rail arrives, and is not undone by its own completion', async () => {
  await page.$eval(SCROLLER, (el) => { (el as HTMLElement).scrollTop = 0; });
  await page.waitForTimeout(200);
  expect(Math.max(...(await mountedPositions())),
    'the jump must start from a window that does not already contain 218').toBeLessThan(200);

  await page.locator(`${OUTLINE} [data-section="217"]`).click();
  await expect(page.locator(editor(217))).toBeVisible({ timeout: 15_000 });

  const near = await page.evaluate(() => {
    const sc = document.querySelector('[data-whole-manuscript]') as HTMLElement;
    const el = sc.querySelector('[data-whole-manuscript-mounted="true"]') as HTMLElement;
    return Math.abs(el.offsetTop - sc.scrollTop);
  });
  expect(near, 'the destination must be brought to the top, not merely mounted').toBeLessThan(120);

  /* 0cf26e22a: the arrival coordinate fell through as a fresh command when the
     jump completed, and the window was yanked back to where Whole had opened.
     The defect was only visible AFTER the jump succeeded. */
  await page.waitForTimeout(1200);
  await expect(page.locator(editor(217)), 'the rail jump was undone by its own completion')
    .toBeVisible();
  expect(await observedTopPosition()).toBeGreaterThan(200);
});

/* ── 6a ── the gold current row follows the observed manuscript place ────── */
test('6a · the gold row names the place on screen', async () => {
  await scrollBy(1);
  await page.waitForTimeout(400);
  const observed = await observedTopPosition();
  expect(observed, 'nothing intersects the viewport — the check is unobservable').toBeGreaterThanOrEqual(0);

  await expect(page.locator(`${OUTLINE} [data-active]`)).toHaveAttribute(
    'data-section', String(observed),
  );
});

/* ── 6b ── `s=` follows the same observed manuscript place ──────────────── */
test('6b · the address bar names the same place', async () => {
  const observed = await observedTopPosition();
  const s = new URL(page.url()).searchParams.get('s');
  expect(s, 'the URL asserted no place at all').not.toBeNull();
  expect(s, 'the URL and the viewport disagree about where the writer is')
    .toBe(draftSectionId(observed));
});

/* ── 7 ── WHOLE → SECTION opens where you were reading ──────────────────── */
test('7 · returning to Section opens where you were reading', async () => {
  const observed = await observedTopPosition();
  await page.locator('[data-manuscript-view-choice="section"]').click();
  await expect(page.locator(SCROLLER)).toHaveCount(0);

  /* The single mounted editor's accessible name is its heading — a real,
     member-visible identity, not an internal id. */
  await expect(page.locator('textarea[aria-label]').first()).toHaveAttribute(
    'aria-label', headingFor(observed),
  );
});

/* The loop gate again, at the end: a surface can be stable on arrival and
   unstable after a view change, an eviction and a jump. */
test('G1 (again) · still no render loop after the whole run', async () => {
  expect(faults.filter((f) => /Maximum update depth/i.test(f))).toEqual([]);
});
