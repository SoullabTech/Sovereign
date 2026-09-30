/* H1-R1 automated walk — disposable shadow DB, real Next dev server, real Chromium.
   Machine evidence of behaviour; ⛔ NOT the founder's experiential walk.

   ⛔ NEVER point this at production. It creates fixtures and rewrites the walk
   member's living_works.updated_at and draft timestamps to stage recency.

   Setup (as run 2026-09-30, see the H1-R1 record §7d):
     1. Fresh UTF-8 PostgreSQL 16 with pgvector; load
        database/baseline/0001_baseline_2026-09-01.sql, then every migration
        not in its .manifest, in filename order.
     2. Seed one member: username 'walker', password 'walk-pass-2026'
        (hash via lib/auth/passwordUtils hashPassword), onboarded = true.
     3. DATABASE_URL=<shadow> npx next dev -p 3100
     4. WALK_DATABASE_URL=<shadow> node tests/constitutional/house-studio-crossing/walk/walk.cjs
   The walk member must have no Works or manuscripts before a run.
   Screenshots + results.json go to WALK_OUT_DIR (default: OS tmp) — runtime
   output, never staged. */
const path = require('path');
const fs = require('fs');
const R = path.resolve(__dirname, '../../../../node_modules') + '/';
const { chromium } = require(R + 'playwright');
const { Client } = require(R + 'pg');

const BASE = process.env.WALK_BASE_URL || 'http://localhost:3100';
const DB = process.env.WALK_DATABASE_URL;
if (!DB) { console.error('WALK_DATABASE_URL is required — a DISPOSABLE shadow, never production'); process.exit(2); }
const OUT = process.env.WALK_OUT_DIR || require('os').tmpdir() + '/h1r1-walk';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const record = (id, pass, detail) => { results.push({ id, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}  ${detail}`); };

(async () => {
  const db = new Client({ connectionString: DB }); await db.connect();
  const q = (sql, p) => db.query(sql, p).then((r) => r.rows);
  const memberId = (await q(`SELECT id FROM members WHERE username='walker'`))[0].id;

  let browser;
  try { browser = await chromium.launch(); }
  catch { const dir = fs.readdirSync('/opt/pw-browsers').find((d) => /^chromium-\d+$/.test(d)); browser = await chromium.launch({ executablePath: `/opt/pw-browsers/${dir}/chrome-linux/chrome` }); }
  const ctx = await browser.newContext({ baseURL: BASE });
  const page = await ctx.newPage();
  page.setDefaultTimeout(120000);

  const signin = await ctx.request.post('/api/members/signin', { data: { username: 'walker', password: 'walk-pass-2026' } });
  if (!signin.ok()) throw new Error('signin ' + signin.status() + ' ' + (await signin.text()).slice(0, 200));

  const post = async (url, data) => {
    const r = await ctx.request.post(url, { data: data ?? {} });
    const body = await r.json().catch(() => ({}));
    if (!r.ok()) throw new Error(`${url} ${r.status()} ${JSON.stringify(body).slice(0, 200)}`);
    return body;
  };
  const idOf = (b) => b.id ?? b.work?.id ?? b.manuscriptId ?? b.manuscript?.id;

  // Each manuscript gets real writing, backdated, so recency is what Studio Home would read.
  const writeManuscript = async (title, daysAgo) => {
    const m = idOf(await post('/api/sovereign/manuscripts/blank'));
    await q(`UPDATE member_manuscripts SET title=$2, created_at=NOW()-interval '400 days' WHERE id=$1`, [m, title]);
    const text = `${title}: a paragraph of real writing, long enough to count as writing.`;
    // Content and its sections are one fact; the database checks their agreement at commit.
    await q('BEGIN');
    await q(`UPDATE manuscript_draft_sections SET text=$2 WHERE draft_id=(SELECT id FROM manuscript_working_drafts WHERE manuscript_id=$1)`, [m, text]);
    await q(`UPDATE manuscript_working_drafts SET content=$2, created_at=NOW()-interval '400 days', updated_at=NOW()-($3||' days')::interval WHERE manuscript_id=$1`, [m, text, String(daysAgo)]);
    await q('COMMIT');
    return m;
  };
  const makeWork = async (title, purpose, manuscripts) => {
    const w = idOf(await post('/api/sovereign/living-works', { title }));
    for (const m of manuscripts) await post(`/api/sovereign/living-works/${w}/expressions`, { expressionType: 'manuscript', expressionId: m });
    await q(`UPDATE living_works SET purpose=$2 WHERE id=$1`, [w, purpose]);
    return w;
  };

  const mA = await writeManuscript('Alpha manuscript', 0.05);
  const mB = await writeManuscript('Beta manuscript', 30);
  const mG1 = await writeManuscript('Gamma one', 10);
  const mG2 = await writeManuscript('Gamma two', 5);
  const mS = await writeManuscript('Shared manuscript', 3);
  const A = await makeWork('Alpha Work', 'Alpha purpose.', [mA]);
  const B = await makeWork('Beta Work', 'Beta purpose.', [mB]);
  const G = await makeWork('Gamma Work', 'Gamma purpose.', [mG1, mG2]);
  const D = await makeWork('Delta Work', 'Delta purpose.', []);
  const E = await makeWork('Epsilon Work', 'Epsilon purpose.', [mS]);
  const Z = await makeWork('Zeta Work', 'Zeta purpose.', [mS]);

  // The House lists the two most recently updated Works. Put `first` on top, `second` beneath.
  const onHouse = async (first, second) => {
    await q(`UPDATE living_works SET updated_at=NOW()-interval '100 days' WHERE member_id=$1`, [memberId]);
    await q(`UPDATE living_works SET updated_at=NOW() WHERE id=$1`, [first]);
    await q(`UPDATE living_works SET updated_at=NOW()-interval '1 minute' WHERE id=$1`, [second]);
  };
  const clickHouseWork = async (title) => {
    await page.goto('/house');
    const row = page.locator('section[aria-label="What\'s alive"] > div', { hasText: title });
    await row.getByRole('link', { name: 'Writing →' }).click();
  };
  const params = () => new URL(page.url()).searchParams;
  const crossingRows = async () => Number((await q(`SELECT count(*) FROM member_facet_crossings`))[0].count);
  const crossingsBefore = await crossingRows();

  // ── C0 control: without the crossing, Studio Home's own pick favours Alpha (written most recently).
  await onHouse(B, A);
  await page.goto('/writers-studio');
  await page.waitForLoadState('networkidle');
  const homeText = await page.locator('body').innerText();
  const firstAlpha = homeText.indexOf('Alpha Work'), firstBeta = homeText.indexOf('Beta Work');
  record('C0 control — discriminating condition exists', firstAlpha >= 0 && (firstBeta < 0 || firstAlpha < firstBeta),
    `plain Studio Home names Alpha before Beta (alpha@${firstAlpha}, beta@${firstBeta})`);
  await page.screenshot({ path: `${OUT}/c0-studio-home.png`, fullPage: true });

  // ── C1 deciding case: click the LESS recently written Work → land in THAT Work.
  await page.goto('about:blank');
  await clickHouseWork('Beta Work');
  await page.waitForURL((u) => u.searchParams.get('mode') === 'write');
  await page.waitForLoadState('networkidle');
  record('C1 deciding case — Beta clicked, Beta opened', params().get('m') === mB && params().get('work') === B,
    `m=${params().get('m') === mB ? 'Beta manuscript' : params().get('m') === mA ? 'ALPHA manuscript' : params().get('m')} · work=${params().get('work') === B ? 'Beta' : params().get('work')}`);
  const c1 = await page.locator('body').innerText(); record('C1b the room names Beta Work, not Alpha Work', c1.includes('Beta Work') && !c1.includes('Alpha Work'), `Beta Work:${c1.includes('Beta Work')} · Alpha Work:${c1.includes('Alpha Work')}`);
  await page.screenshot({ path: `${OUT}/c1-beta-write.png`, fullPage: true });

  // ── C2 Back returns to the House (the intake hand-off replaced its own history entry).
  await page.goBack();
  await page.waitForLoadState('networkidle');
  record('C2 Back returns to the House', new URL(page.url()).pathname === '/house', `after Back: ${new URL(page.url()).pathname}${new URL(page.url()).search}`);

  // ── C3 several manuscripts → chooser in declared order, nothing preselected; choice carries the Work.
  await onHouse(G, A);
  await clickHouseWork('Gamma Work');
  await page.getByText('This Work holds more than one piece of writing').waitFor();
  const choices = await page.locator('main ul li button').allInnerTexts();
  record('C3 chooser lists all, in declared order', JSON.stringify(choices) === JSON.stringify(['Gamma one', 'Gamma two']) && !params().get('m'),
    `choices=${JSON.stringify(choices)} · m=${params().get('m')}`);
  await page.screenshot({ path: `${OUT}/c3-chooser.png`, fullPage: true });
  await page.getByRole('button', { name: 'Gamma two' }).click();
  await page.waitForURL((u) => u.searchParams.get('mode') === 'write');
  record('C3b choosing opens it and keeps the Work', params().get('m') === mG2 && params().get('work') === G, `m=${params().get('m') === mG2 ? 'Gamma two' : params().get('m')} · work=${params().get('work') === G ? 'Gamma' : params().get('work')}`);

  // ── C4 no writing → says so, creates nothing until Begin.
  await onHouse(D, A);
  const countBefore = Number((await q(`SELECT count(*) FROM member_manuscripts WHERE member_id=$1`, [memberId]))[0].count);
  await clickHouseWork('Delta Work');
  await page.getByText('This Work has no writing yet.').waitFor();
  await page.waitForTimeout(1500);
  const countMid = Number((await q(`SELECT count(*) FROM member_manuscripts WHERE member_id=$1`, [memberId]))[0].count);
  record('C4 nothing created by arriving', countMid === countBefore, `manuscripts ${countBefore} → ${countMid}`);
  await page.screenshot({ path: `${OUT}/c4-no-writing.png`, fullPage: true });
  await page.getByRole('button', { name: 'Begin manuscript' }).click();
  await page.waitForURL((u) => u.searchParams.get('mode') === 'write');
  const declared = await q(`SELECT expression_id FROM living_work_expressions WHERE living_work_id=$1 AND expression_type='manuscript'`, [D]);
  record('C4b Begin creates one, inside Delta, and opens it', declared.length === 1 && params().get('m') === declared[0].expression_id && params().get('work') === D,
    `declared in Delta: ${declared.length} · opened it: ${params().get('m') === declared[0]?.expression_id}`);

  // ── C5 a Work id that is not the member's → neutral refusal, no navigation.
  await page.goto('/writers-studio?from=house&work=00000000-0000-4000-8000-000000000000');
  await page.getByText('That Work isn’t available here.').waitFor();
  record('C5 foreign id refused neutrally', params().get('mode') !== 'write', `url=${new URL(page.url()).search}`);

  // ── C6 WS2-03B amendment: manuscript in two Works, arriving from Zeta → Zeta, not ambiguous.
  await onHouse(Z, E);
  await clickHouseWork('Zeta Work');
  await page.waitForURL((u) => u.searchParams.get('mode') === 'write');
  await page.waitForLoadState('networkidle');
  const zText = await page.locator('body').innerText();
  record('C6 chosen Work settles the shared manuscript', params().get('m') === mS && zText.includes('Zeta Work') && !zText.includes('Epsilon Work'),
    `m=shared:${params().get('m') === mS} · Zeta Work:${zText.includes('Zeta Work')} · Epsilon Work:${zText.includes('Epsilon Work')}`);
  await page.screenshot({ path: `${OUT}/c6-shared-from-zeta.png`, fullPage: true });

  // ── C6b control: same manuscript, no choice → WS2-03B unchanged: ambiguous, never a guess.
  await page.goto(`/writers-studio?mode=write&m=${mS}`);
  await page.waitForLoadState('networkidle');
  const plainText = await page.locator('body').innerText();
  record('C6b without a choice it stays ambiguous (names neither Work)', !plainText.includes('Zeta Work') && !plainText.includes('Epsilon Work'),
    `Zeta Work:${plainText.includes('Zeta Work')} · Epsilon Work:${plainText.includes('Epsilon Work')}`);

  // ── C6c a choice of a Work that does NOT contain the manuscript is ignored.
  await page.goto(`/writers-studio?mode=write&m=${mS}&work=${A}`);
  await page.waitForLoadState('networkidle');
  const wrongText = await page.locator('body').innerText();
  record('C6c non-containing choice ignored', !wrongText.includes('Alpha Work') && !wrongText.includes('Zeta Work') && !wrongText.includes('Epsilon Work'), `Alpha Work:${wrongText.includes('Alpha Work')} · Zeta:${wrongText.includes('Zeta Work')} · Epsilon:${wrongText.includes('Epsilon Work')}`);

  // ── C7 Studio Home from the writing room: choice dropped, Home reachable (no intake loop).
  await page.goto(`/writers-studio?from=house&mode=write&m=${mS}&work=${Z}`);
  await page.waitForLoadState('networkidle');
  const homeCtl = page.getByRole('button', { name: /^Home$/ }).or(page.getByRole('link', { name: /^Home$/ })).first();
  if (await homeCtl.count()) {
    await homeCtl.click();
    await page.waitForTimeout(4000);
    record('C7 Home is reachable and drops the choice', params().get('mode') === 'home' && !params().get('work'), `url=${new URL(page.url()).search}`);
  } else {
    record('C7 Home is reachable and drops the choice', false, 'NO EVIDENCE — no control named "Home" found in the write room');
  }

  // ── C8 nothing remembered: no browser storage holds a Work id; no crossing rows written.
  const stored = await page.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage } }));
  const leaked = [A, B, G, D, E, Z].filter((w) => stored.includes(w));
  record('C8a no Work id in browser storage', leaked.length === 0, `leaked=${leaked.length}`);
  record('C8b navigation wrote no crossing rows', (await crossingRows()) === crossingsBefore, `member_facet_crossings ${crossingsBefore} → ${await crossingRows()}`);

  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\nWALK: ${results.length - failed}/${results.length} PASS`);
  await browser.close(); await db.end();
  process.exit(failed ? 1 : 0);
})().catch(async (e) => { console.error('WALK ERROR', e.message); process.exit(2); });
