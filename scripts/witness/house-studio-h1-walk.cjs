/* HOUSE-STUDIO-CIRCULATION-01R1 · H1 signed-in witness — Home → Work → Studio → Home.
 *
 * ⛔ DISPOSABLE STACK ONLY. It writes (updated_at touches, a "Begin this Work"
 * manuscript) and must never be pointed at production.
 *
 * Procedure (as run 2026-09-30, recorded in the census §13):
 *   1. fresh Postgres 16 (+pgvector), `scripts/bootstrap-database.sh && npm run db:migrate`
 *   2. one member + one `auth_sessions` row; token in $WITNESS_DIR/token
 *   3. `next dev -p 3707` with DATABASE_URL pointing at it
 *   4. seed through the app's own APIs: Works "Witness One" (1 manuscript),
 *      "Witness Several" (3), "Witness None" (0), "Witness Other" (re-declares
 *      "Introduction", making it structurally ambiguous), plus a newest undeclared
 *      "Recency Decoy"; ids in $WITNESS_DIR/ids.json, decoy id in $WITNESS_DIR/decoy
 *   5. node scripts/witness/house-studio-h1-walk.cjs <node_modules> <outDir>
 */
const { chromium } = require(process.argv[2] + '/playwright-core');
const { execSync } = require('child_process');
const fs = require('fs');
const DIR = process.env.WITNESS_DIR || '/var/tmp/pgwitness';
const IDS = JSON.parse(fs.readFileSync(DIR + '/ids.json', 'utf8'));

const OUT = process.argv[3];
const B = process.env.WITNESS_BASE_URL || 'http://localhost:3707';
const T = fs.readFileSync(DIR + '/token', 'utf8').trim();
const DECOY = fs.readFileSync(DIR + '/decoy', 'utf8').trim();
const W = { one: IDS.one, sev: IDS.sev, none: IDS.none };
const M = { solo: IDS.solo, intro: IDS.intro };
const DB = process.env.WITNESS_DATABASE_URL || 'postgresql://soullab@localhost:5439/maia_consciousness';
if (/minisforum|soullab\.life|192\.168\./.test(DB)) throw new Error('refusing: this witness writes and is for a disposable stack only');
const sql = (q) => execSync(`psql "${DB}" -tAc "${q}"`).toString().trim();

const results = [];
const check = (step, name, ok, detail = '') => { results.push({ step, name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} [${step}] ${name}${detail ? ' — ' + detail : ''}`); };
const q = (u) => Object.fromEntries(new URL(u).searchParams);

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'maia_session', value: T, domain: 'localhost', path: '/' }]);
  const page = await ctx.newPage();
  page.setDefaultTimeout(120000);
  const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
  const settle = async () => { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(800); };

  const fromHouse = async (workId, step) => {
    sql(`UPDATE living_works SET updated_at = now() WHERE id = '${workId}'`);
    await page.goto(B + '/home'); await settle();
    const link = page.locator(`a[href*="work=${workId}"]`);
    check(step, 'House shows a link carrying this Work', await link.count() === 1);
    const href = await link.first().getAttribute('href');
    check(step, 'link carries only from + work', href === `/writers-studio?from=house&work=${workId}`, href);
    await link.first().click();
    await page.waitForSelector('[data-arrival]'); await settle();
  };
  const threshold = async (step, expectPresent = true) => {
    const t = page.locator('[data-house-return] header');
    const present = await t.count() > 0;
    check(step, expectPresent ? 'House threshold present' : 'House threshold absent', present === expectPresent);
    if (present) {
      const txt = await t.innerText();
      check(step, 'threshold reads THE HOUSE · WRITER’S STUDIO · Return Home', /THE HOUSE/.test(txt) && /WRITER’S STUDIO/.test(txt) && /Return Home/.test(txt), txt.replace(/\s+/g, ' '));
      check(step, 'threshold does not repeat the Soullab mark', await t.getAttribute('data-mark') === 'destination' && await t.locator('img').count() === 0);
    }
  };
  const modes = async (step, workId, msId, workTitle) => {
    for (const mode of ['Write', 'Develop', 'Review']) {
      await page.locator('nav[aria-label="Studio"] button', { hasText: mode }).first().click();
      await page.waitForURL((u) => new URL(u).searchParams.get('mode') === mode.toLowerCase());
      await settle();
      await page.waitForFunction(() => !/Opening this (Review|Develop|Studio)|Opening your/i.test(document.body.innerText), null, { timeout: 120000 }).catch(() => {});
      await page.waitForTimeout(500);
      const p = q(page.url());
      check(step, `${mode}: manuscript stable`, p.m === msId, p.m);
      check(step, `${mode}: Work carried`, p.work === workId);
      check(step, `${mode}: never the recency decoy`, p.m !== DECOY);
      const body = await page.locator('body').innerText();
      check(step, `${mode}: no "belongs to several Works" ambiguity`, !/belongs to \d+ Works/.test(body));
      if (workTitle) check(step, `${mode}: Work named`, body.includes(workTitle));
      await shot(`${step}-${mode.toLowerCase()}`);
    }
  };

  // 1 · one manuscript
  await fromHouse(W.one, '1-one');
  check('1-one', 'arrival state = one', await page.getAttribute('[data-arrival]', 'data-arrival') === 'one');
  check('1-one', 'names its manuscript', (await page.locator('[data-arrival]').innerText()).includes('Solo Draft'));
  await threshold('1-one'); await shot('1-one-arrival');
  await page.getByRole('button', { name: 'Open Writing Studio' }).click();
  await page.waitForURL((u) => q(u).mode === 'write'); await settle();
  await modes('4-from-one', W.one, M.solo, 'Witness One');
  await threshold('4-from-one');

  // 2 · several manuscripts (Introduction is ALSO declared in "Witness Other")
  await fromHouse(W.sev, '2-several');
  check('2-several', 'arrival state = several', await page.getAttribute('[data-arrival]', 'data-arrival') === 'several');
  const radios = page.locator('input[name="arrival-manuscript"]');
  check('2-several', 'three threads offered', await radios.count() === 3);
  let anyChecked = false; for (let i = 0; i < await radios.count(); i++) anyChecked ||= await radios.nth(i).isChecked();
  check('2-several', 'nothing pre-selected', !anyChecked);
  check('2-several', 'Enter unavailable before a choice', await page.getByRole('button', { name: 'Enter' }).isDisabled());
  const order = await page.locator('.p4r1-arrival-choice span').allInnerTexts();
  check('2-several', 'declaration order, decoy absent', order.join('|') === 'Chapter 10 — The Alchemical Self|Introduction|Future revision notes', order.join('|'));
  await shot('2-several-arrival');
  await page.getByLabel('Introduction').check();
  await page.getByRole('button', { name: 'Enter' }).click();
  await page.waitForURL((u) => q(u).mode === 'write'); await settle();
  await modes('4-from-several', W.sev, M.intro, 'Witness Several');

  // 3 · no manuscript — arrival creates nothing
  const before = sql(`SELECT count(*) FROM member_manuscripts`);
  const beforeDecl = sql(`SELECT count(*) FROM living_work_expressions WHERE living_work_id = '${W.none}'`);
  await fromHouse(W.none, '3-none');
  check('3-none', 'arrival state = no-manuscript', await page.getAttribute('[data-arrival]', 'data-arrival') === 'no-manuscript');
  await page.waitForTimeout(2000);
  check('3-none', 'nothing created on arrival', sql(`SELECT count(*) FROM member_manuscripts`) === before && sql(`SELECT count(*) FROM living_work_expressions WHERE living_work_id = '${W.none}'`) === beforeDecl, `${before} manuscripts`);
  await shot('3-none-arrival');
  await page.getByRole('button', { name: 'Return', exact: true }).click();
  await page.waitForURL((u) => new URL(u).pathname === '/home'); await settle();
  check('3-none', 'Return goes Home', new URL(page.url()).pathname === '/home');
  // Begin this Work: the explicit act
  await fromHouse(W.none, '3-none-begin');
  await page.getByRole('button', { name: 'Begin this Work' }).click();
  await page.waitForURL((u) => q(u).mode === 'write'); await settle();
  const declared = sql(`SELECT expression_id FROM living_work_expressions WHERE living_work_id = '${W.none}'`);
  check('3-none-begin', 'Begin created + declared exactly one manuscript', declared.split('\n').filter(Boolean).length === 1);
  check('3-none-begin', 'opened that manuscript within the Work', q(page.url()).m === declared.trim() && q(page.url()).work === W.none);

  // 5 · Return to Home from inside the Studio
  await page.locator('[data-house-return] a', { hasText: 'Return Home' }).click();
  await page.waitForURL((u) => new URL(u).pathname === '/home'); await settle();
  check('5-return', 'lands on /home with no query at all', new URL(page.url()).search === '', page.url());
  await shot('5-return-home');

  // 6 · ordinary entry: threshold is a crossing condition, not sticky
  await page.goto(B + '/writers-studio'); await settle();
  await threshold('6-plain', false);
  check('6-plain', 'no Work arrival on plain entry', await page.locator('[data-arrival]').count() === 0);
  await shot('6-plain-studio');
  await page.goto(`${B}/writers-studio?mode=write&m=${M.intro}`); await settle();
  await threshold('6-plain-write', false);
  const body = await page.locator('body').innerText();
  // Introduction is declared in BOTH "Witness Several" and "Witness Other". Without
  // a carried Work the Studio must name neither (WS2-03B ambiguity, unweakened).
  check('6-plain-write', 'without a carried Work, the Studio names no Work for an ambiguous manuscript',
    !body.includes('Witness Several') && !body.includes('Witness Other'));
  await shot('6-plain-write');
  await page.reload(); await settle();
  await threshold('6-reload', false);

  // 7 · a forged Work id confers nothing
  await page.goto(`${B}/writers-studio?from=house&work=00000000-0000-0000-0000-000000000000`); await settle();
  check('7-forged', 'unknown Work → ordinary Studio home, nothing disclosed', await page.locator('[data-arrival]').count() === 0);

  await browser.close();
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length} passed · ${failed.length} failed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('WALK ERROR', e.message); process.exit(2); });
