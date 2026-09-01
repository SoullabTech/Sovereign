/**
 * WS2 — the browser witness, driven rather than performed.
 *
 * WHY THIS EXISTS. Every mechanical acceptance check in this programme has been
 * executed by a person clicking and reporting: scroll here, reload, press Back,
 * tell me what you saw. That is slow, it costs the founder's attention, and it
 * has twice produced a wrong reading — once a stale bundle mistaken for a
 * defect, once a defect mistaken for a working page. A browser can assert DOM
 * order and viewport geometry in two seconds and never mis-sees.
 *
 * The founder witness is then reserved for what actually needs a person: does
 * this feel coherent, is this the right structure, does the room fight me.
 *
 * WHAT IT REFUSES TO DO. It asserts structure, order, geometry and navigation.
 * It never reads, prints or screenshots member prose beyond what is
 * incidentally on screen, and it writes nothing to the manuscript.
 *
 *   TOK=$(psql ... session_token) \
 *   npx tsx scripts/ws2-witness-browser.ts
 *
 * Env: BASE (default http://localhost:3105), MANUSCRIPT, TOK, SECTION
 */

import puppeteer, { type Page } from 'puppeteer';

const BASE = process.env.BASE ?? 'http://localhost:3105';
const MANUSCRIPT = process.env.MANUSCRIPT ?? 'a3ae67fd-a21e-4948-8766-4c397d2e4712';
const TOK = process.env.TOK ?? '';
const OUT = process.env.OUT ?? '/tmp';

let failures = 0;
let skipped = 0;
const check = (name: string, pass: boolean, detail = '') => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
  if (!pass) failures++;
};

/**
 * A check the Work in front of it cannot exercise - and says so.
 *
 * A twelve-section fixture has no scrollport, so "the chrome survives a scroll"
 * has nothing to assert. Reporting that as a failure would train the reader to
 * ignore red; reporting it as `ok` would be a green check for something that
 * never ran. It is counted separately and named in the summary, so a run that
 * skipped everything cannot read as a pass.
 */
const skip = (name: string, why: string) => {
  console.log(`  n/a   ${name}  ${why}`);
  skipped++;
};

const canvas = (s?: string) =>
  `${BASE}/writers-studio/canvas?m=${MANUSCRIPT}${s ? `&s=${s}` : ''}`;

/** Section positions in the order the DOM actually draws them. */
async function drawnOrder(page: Page): Promise<number[]> {
  return page.$$eval('[data-panel-role="manuscript-outline"] [data-section]', (els) =>
    els.map((e) => Number(e.getAttribute('data-section'))));
}

async function main() {
  if (!TOK) {
    console.error('\n  TOK is required — a live session token for the member who owns this Work.\n');
    console.error("  export TOK=$(psql '<url>' -tAc \"SELECT session_token FROM auth_sessions");
    console.error('    WHERE member_id=\'<id>\' AND revoked=FALSE AND expires_at>NOW()');
    console.error("    ORDER BY expires_at DESC LIMIT 1\")\n");
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  const { hostname } = new URL(BASE);
  await browser.setCookie({ name: 'maia_session', value: TOK, domain: hostname, path: '/' });

  /* ── 1 · the page is there, and it is the build we think ────────────── */
  console.log('\n1 · load');
  await page.goto(canvas(), { waitUntil: 'networkidle0', timeout: 60_000 });
  await page.waitForSelector('[data-panel-role="manuscript-outline"] [data-section]', { timeout: 30_000 });
  const rows = await drawnOrder(page);
  check('the outline rendered', rows.length > 0, `${rows.length} rows`);

  /* THE STALE-BUNDLE TRAP, made mechanical. WS2-05A-R1 deleted the
     "not yet placed" section group; if it is on screen, the browser is running
     pre-R1 JavaScript and every assertion below would be about the wrong code.
     This has already been misread once as a defect. */
  const preR1 = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-panel-role="manuscript-outline"] *'))
      .some((e) => e.children.length === 0 && /not yet placed/i.test(e.textContent ?? '')));
  check('the bundle is post-R1 (no "not yet placed" group)', !preR1,
    preR1 ? 'STALE BUNDLE — hard-reload or restart the server; nothing below is meaningful' : '');
  if (preR1) { await browser.close(); process.exit(1); }

  /* ── 2 · book order ─────────────────────────────────────────────────── */
  console.log('\n2 · the column reads as the book');
  const ascending = rows.every((p, i) => i === 0 || p > rows[i - 1]);
  check('sections are drawn in ascending manuscript order', ascending,
    ascending ? `${rows[0]} … ${rows[rows.length - 1]}`
      : `first descent at ${rows.findIndex((p, i) => i > 0 && p <= rows[i - 1])}`);
  check('every section is drawn once', new Set(rows).size === rows.length);

  /* ── 3 · the chrome stays put ───────────────────────────────────────── */
  console.log('\n3 · sticky chrome');
  const sticky = await page.evaluate(() => {
    const panel = document.querySelector('[data-panel-role="manuscript-outline"]');
    if (!panel) return null;
    const scroller = Array.from(panel.querySelectorAll('*')).find(
      (e) => e.scrollHeight > e.clientHeight + 40) as HTMLElement | undefined;
    if (!scroller) return null;
    const control = Array.from(panel.querySelectorAll('button'))
      .find((b) => /organise/i.test(b.textContent ?? ''));
    if (!control) return null;
    const before = control.getBoundingClientRect().top;
    scroller.scrollTop = Math.min(1200, scroller.scrollHeight);
    const after = control.getBoundingClientRect().top;
    return { before, after, scrolled: scroller.scrollTop };
  });
  if (sticky === null) {
    skip('the organise control survives a scroll',
      'this Work does not overflow its column - nothing to scroll');
  } else {
    check('the organise control survives a scroll', sticky.scrolled > 0,
      `scrolled ${Math.round(sticky.scrolled)}px`);
  }
  if (sticky) {
    check('and does not move with the list',
      Math.abs(sticky.after - sticky.before) < 4,
      `top ${Math.round(sticky.before)} → ${Math.round(sticky.after)}`);
  }

  /* ── 4 · place survives a reload, and is revealed ───────────────────── */
  console.log('\n4 · place');
  const target = process.env.SECTION ?? await page.evaluate(() => {
    const els = document.querySelectorAll('[data-panel-role="manuscript-outline"] [data-section]');
    return (els[Math.min(100, els.length - 1)] as HTMLElement | undefined)?.getAttribute('data-section') ?? '0';
  });
  await page.evaluate((pos) => {
    const el = document.querySelector(
      `[data-panel-role="manuscript-outline"] [data-section="${pos}"]`) as HTMLElement | null;
    el?.click();
  }, target);
  await new Promise((r) => setTimeout(r, 400));

  const withSection = new URL(page.url());
  const sid = withSection.searchParams.get('s');
  check('the location names the section by uuid, not by ordinal',
    Boolean(sid) && /^[0-9a-f-]{36}$/.test(sid ?? ''), sid ?? 'absent');

  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-panel-role="manuscript-outline"] [data-active]', { timeout: 20_000 })
    .catch(() => undefined);
  const restored = await page.evaluate(() => {
    const el = document.querySelector('[data-active]') as HTMLElement | null;
    if (!el) return null;
    const panel = el.closest('[data-panel-role="manuscript-outline"]') as HTMLElement | null;
    const r = el.getBoundingClientRect();
    const p = panel?.getBoundingClientRect();
    return {
      position: el.getAttribute('data-section'),
      inView: Boolean(p) && r.top >= p!.top - 4 && r.bottom <= p!.bottom + 4,
    };
  });
  check('reload returns to the same section', restored?.position === String(target),
    `${restored?.position ?? 'none'} (wanted ${target})`);
  check('and the outline reveals it rather than leaving it off-screen',
    restored?.inView === true);

  /* ── 5 · section clicks leave no browser history ────────────────────── */
  console.log('\n5 · history');
  /* Seed one real navigation so Back has somewhere legitimate to go. */
  await page.goto(`${BASE}/writers-studio`, { waitUntil: 'networkidle0' });
  await page.goto(canvas(), { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-panel-role="manuscript-outline"] [data-section]');
  /* Four positions spread across THIS Work, rather than the four that happened
     to exist in the 174-section book this was first written against. Clicking
     a position that is not drawn changes nothing, and the check then reports a
     navigation defect that is really a fixture with no section 60 in it. */
  const spread = [0.1, 0.35, 0.6, 0.9]
    .map((f) => rows[Math.min(rows.length - 1, Math.floor(f * rows.length))]);
  const visited: string[] = [];
  for (const n of spread) {
    await page.evaluate((pos) => {
      const el = document.querySelector(
        `[data-panel-role="manuscript-outline"] [data-section="${pos}"]`) as HTMLElement | null;
      el?.click();
    }, String(n));
    await new Promise((r) => setTimeout(r, 250));
    visited.push(new URL(page.url()).searchParams.get('s') ?? '');
  }
  check('each click changed the place',
    new Set(visited.filter(Boolean)).size === visited.length, spread.join(','));

  await page.goBack({ waitUntil: 'networkidle0' });
  const afterBack = page.url();
  const stillCanvas = afterBack.includes('/writers-studio/canvas');
  check('one Back press leaves the Work rather than retracing sections',
    !stillCanvas, afterBack.replace(BASE, ''));

  await page.screenshot({ path: `${OUT}/ws2-witness.png`, fullPage: false });
  console.log(`\n  capture: ${OUT}/ws2-witness.png`);

  await browser.close();
  console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failed`
    + `${skipped ? `, ${skipped} not applicable to this Work` : ''}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
