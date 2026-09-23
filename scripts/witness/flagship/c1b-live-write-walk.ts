/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1B — LIVE WRITE HOST WALK.
 *
 *   DATABASE_URL=<shadow> WITNESS_PORT=<running next dev> \
 *     npx tsx scripts/witness/flagship/c1b-live-write-walk.ts --host legacy|flagship
 *
 * Real browser · real route (/writers-studio/rebuild) · real authenticated
 * session · real PostgreSQL rows. `--host legacy` is the KNOWN-GOOD BASELINE
 * of the writing substrate before the mount; `--host flagship` is the C1B
 * candidate. Shared laws run in both; flagship laws run only in the second.
 *
 * ⚠️ CANDIDATE EVIDENCE, ⛔ not production evidence and ⛔ not a member walk.
 * ⛔ Never point this at production: it seeds and deletes rows.
 * Records identifiers, counts and short witness strings only.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { chromium, type Page } from 'playwright';

const HOST = (process.argv.includes('--host') ? process.argv[process.argv.indexOf('--host') + 1] : 'flagship') as 'legacy' | 'flagship';
const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3497');
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/flagship-c1b');
if (!DSN) { console.log('NO EVIDENCE — DATABASE_URL not set'); process.exit(2); }
if (/soullab\.life|minisforum|192\.168\.0\.104|maia_consciousness/.test(DSN)) { console.log('REFUSED — production-looking DATABASE_URL'); process.exit(2); }

let pass = 0, fail = 0;
const ok = (s: string, d = '') => { pass++; console.log(`  PASS  ${s}${d ? `  — ${d}` : ''}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n        ${d}`); };
const check = (s: string, cond: boolean, d: string) => (cond ? ok(s, d) : bad(s, d));

const pg = new Client({ connectionString: DSN });
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p)).rows as Record<string, unknown>[];

const M = randomUUID(), LW = randomUUID(), WK = randomUUID(), DR = randomUUID();
const S1 = randomUUID(), S2 = randomUUID(), D1 = randomUUID(), D2 = randomUUID();
const TOKEN = `c1b-${randomUUID()}`;
/* ⚠️ `explicitRole` recognises only numbered chapters — 'Chapter One' is not a chapter root. */
const H1 = 'Chapter 1', H2 = 'The river at dusk';
const B1 = 'The water held the last of the light.';
const B2 = 'Nothing moved on the far bank. She waited for the sound to come back.';
const TYPED = ' Typed by the C1B walk.';
const SEL = 'far bank';

async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','C1B walk')`, [M, `SOULLAB-C1B-${M.slice(0, 8)}`, `c1b-${M.slice(0, 8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'The River Between')`, [LW, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The River Between')`, [WK, M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,1,$3,1,'chapter',$4),($5,$2,2,$6,2,'markdown',$7)`, [S1, WK, H1, B1, S2, H2, B2]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','sha-c1b',2)`, [DR, WK, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)`, [D1, DR, `${H1}\n\n${B1}`, S1, D2, `${H2}\n\n${B2}`, S2]);
  await q(`UPDATE manuscript_working_drafts d SET content = (SELECT COALESCE(string_agg(s.text,'' ORDER BY s.position),'') FROM manuscript_draft_sections s WHERE s.draft_id = d.id) WHERE d.id = $1`, [DR]);
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at = NOW() WHERE id = $1`, [DR]);
}
async function cleanup() {
  await q(`DELETE FROM manuscript_working_drafts WHERE manuscript_id = $1`, [WK]).catch(() => {});
  await q(`DELETE FROM living_work_expressions WHERE living_work_id = $1`, [LW]).catch(() => {});
  await q(`DELETE FROM member_manuscripts WHERE id = $1`, [WK]).catch(() => {});
  await q(`DELETE FROM living_works WHERE id = $1`, [LW]).catch(() => {});
  await q(`DELETE FROM auth_sessions WHERE member_id = $1`, [M]).catch(() => {});
  await q(`DELETE FROM members WHERE id = $1`, [M]).catch(() => {});
}
const version = async () => Number((await q(`SELECT version FROM manuscript_working_drafts WHERE id = $1`, [DR]))[0]!['version']);
const revisions = async () => Number((await q(`SELECT count(*)::text AS n FROM working_draft_revisions WHERE draft_id = $1`, [DR]))[0]!['n']);
const sectionText = async (id: string) => String((await q(`SELECT text FROM manuscript_draft_sections WHERE id = $1`, [id]))[0]!['text']);

async function main() {
  mkdirSync(OUT, { recursive: true });
  await pg.connect();
  const dbn = String((await q('SELECT current_database() d'))[0]!['d']);
  if (!/shadow|witness/.test(dbn)) { console.log(`REFUSED — '${dbn}' is not a shadow/witness database`); process.exit(2); }
  await seed();
  const v0 = await version(); const r0 = await revisions();
  console.log(`\n── C1B LIVE WRITE WALK · host=${HOST} · manuscript=${WK} · draft=${DR} · v0=${v0} r0=${r0} ──\n`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const page: Page = await ctx.newPage();
  const puts: string[] = [];
  page.on('request', (r) => { if (r.method() === 'PUT' && /\/sections\//.test(r.url())) puts.push(r.url()); });
  const legacyLinks = async () => page.locator('a[href*="/writers-studio/develop"], a[href*="/writers-studio/review"]').count();

  try {
    await page.goto(`http://127.0.0.1:${PORT}/writers-studio/rebuild?m=${WK}&s=${D2}`, { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector(`[data-authored-body="${D2}"]`, { timeout: 240_000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(OUT, `${HOST}__1-open.png`) });

    check('W-1 manuscript opens by identity', page.url().includes(`m=${WK}`), `url carries m=${WK.slice(0, 8)}…`);
    const bodies = await page.locator('[data-authored-body]').count();
    /* ⚠️ BASELINE FINDING: the legacy host renders ONE section in passage focus;
       the flagship host renders the chapter span. Shared law: at least one real
       authored body. F-4 holds the flagship to both sections inside the geometry. */
    check('W-2 real authored body rendered', bodies >= 1, `authored bodies=${bodies}`);
    const b2 = (await page.locator(`[data-authored-body="${D2}"]`).innerText()).trim();
    check('W-3 seeded body text present', b2 === B2, `exact=${b2 === B2}`);

    // geometry before editing
    const box0 = await page.locator(`[data-authored-body="${D2}"]`).boundingBox();

    // type
    await page.locator(`[data-authored-body="${D2}"]`).click();
    await page.waitForSelector(`textarea[data-authored-body="${D2}"]`, { timeout: 10_000 });
    const ta = page.locator(`textarea[data-authored-body="${D2}"]`);
    await ta.press('End');
    await ta.type(TYPED, { delay: 15 });
    const box1 = await page.locator(`textarea[data-authored-body="${D2}"]`).boundingBox();
    check('W-4 editing does not shift the manuscript column', !!box0 && !!box1 && Math.abs(box0.width - box1.width) < 2 && Math.abs(box0.x - box1.x) < 2, `x ${box0?.x}→${box1?.x} w ${box0?.width}→${box1?.width}`);
    await page.screenshot({ path: join(OUT, `${HOST}__2-typing.png`) });

    if (HOST === 'flagship') {
      const st = (await page.locator('.fs-saved').first().textContent().catch(() => null))?.trim() ?? '(none)';
      check('F-1 status while typing is truthful', /^(Unsaved|Saving…)$/.test(st), `status="${st}"`);
    }

    // wait for the existing save path to advance the draft version
    const deadline = Date.now() + 20_000; let v1 = v0;
    while (Date.now() < deadline) { v1 = await version(); if (v1 > v0) break; await page.waitForTimeout(250); }
    const r1 = await revisions();
    const saved = await sectionText(D2);
    check('W-5 save advanced the draft version through the existing path', v1 > v0, `version ${v0}→${v1}`);
    /* ⚠️ BASELINE FINDING: a section autosave advances the draft `version`; the
       `working_draft_revisions` ledger is written by Keep-a-version / conversion,
       not by autosave. Recorded, not asserted. */
    ok('W-6 revision ledger observed (informational)', `revisions ${r0}→${r1}`);
    check('W-7 saved section text is exactly the typed text', saved === `${H2}\n\n${B2}${TYPED}`, `exact=${saved === `${H2}\n\n${B2}${TYPED}`}`);
    check('W-8 exactly one section save lane', puts.length === 1, `PUT requests=${puts.length}`);
    check('W-9 place address follows the section', page.url().includes(`s=${D2}`), `url carries s=${D2.slice(0, 8)}…`);

    if (HOST === 'flagship') {
      await page.waitForTimeout(400);
      const st = (await page.locator('.fs-saved').first().textContent().catch(() => null))?.trim() ?? '(none)';
      check('F-2 status after save is truthful and not the fixture phrase', st === 'Saved' || /^Saved · v\d+$/.test(st), `status="${st}"`);
    }

    // passage selection: exact code-point address
    await page.locator(`textarea[data-authored-body="${D2}"]`).focus();
    const addr = await page.evaluate(({ id, sel }) => {
      const el = document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement;
      const start = el.value.indexOf(sel); const end = start + sel.length;
      el.setSelectionRange(start, end);
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Shift' }));
      return { start: [...el.value.slice(0, start)].length, end: [...el.value.slice(0, end)].length };
    }, { id: D2, sel: SEL });
    await page.evaluate(({ id }) => (document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement).blur(), { id: D2 });
    await page.waitForSelector(`[data-authored-body="${D2}"][data-held-passage="true"]`, { timeout: 10_000 }).catch(() => {});
    const held = await page.locator(`[data-authored-body="${D2}"][data-held-passage="true"]`).count();
    const mark = (await page.locator(`[data-authored-body="${D2}"] mark`).first().textContent().catch(() => null)) ?? '';
    check('W-10 selecting authored text holds the exact passage', held === 1 && mark === SEL, `held=${held} mark="${mark}" address=${addr.start}:${addr.end}`);
    if (HOST === 'flagship') {
      const a = await page.locator(`[data-held-passage-address]`).first().getAttribute('data-held-passage-address').catch(() => null);
      check('F-3 held passage carries its exact code-point address', a === `${addr.start}:${addr.end}`, `address=${a}`);
    }
    await page.screenshot({ path: join(OUT, `${HOST}__3-held.png`) });

    // reload returns exact saved text
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector(`[data-authored-body="${D2}"]`, { timeout: 240_000 });
    await page.waitForTimeout(400);
    const after = (await page.locator(`[data-authored-body="${D2}"]`).innerText()).trim();
    check('W-11 reload returns the exact saved text', after === `${B2}${TYPED}`, `exact=${after === `${B2}${TYPED}`}`);
    await page.screenshot({ path: join(OUT, `${HOST}__4-reloaded.png`) });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUT, `${HOST}__5-mobile-390.png`) });
    await page.setViewportSize({ width: 1440, height: 900 });

    if (HOST === 'flagship') {
      const inGeometry = await page.locator('article[data-manuscript="true"] [data-authored-body]').count();
      check('F-4 authored bodies live inside the flagship manuscript geometry', inGeometry === 2, `inside article[data-manuscript]=${inGeometry}`);
      check('F-5 no static flagship paragraphs', (await page.locator('.fs-p').count()) === 0, `fs-p=${await page.locator('.fs-p').count()}`);
      const buttons = await page.locator('button').count();
      check('F-6 no dead production controls', buttons === 0, `buttons=${buttons}`);
      check('F-7 no legacy Develop/Review bridge', (await legacyLinks()) === 0, `legacy links=${await legacyLinks()}`);
      const navs = await page.locator('[data-nav]').count();
      const navButtons = await page.locator('button[data-nav]').count();
      const current = await page.locator('[data-nav="write"][aria-current="page"]').count();
      check('F-8 Write is the only destination, as orientation', navs === 2 && navButtons === 0 && current === 2, `data-nav=${navs} buttons=${navButtons} current=${current}`);
      const root = await page.locator('.fs-root').count();
      const legacyGrid = await page.locator('.wsr-grid, .wsr-outline, .wsr-maia').count();
      check('F-9 flagship composition, not the legacy workbench', root === 1 && legacyGrid === 0, `fs-root=${root} legacy regions=${legacyGrid}`);
      const html = await page.content();
      check('F-10 no fixture status phrase', !/Saved 2m ago/.test(html), 'no "Saved 2m ago"');
      check('F-11 no fabricated presentation facts', !/Untitled|82,400 words|Novel ·|Soullab$/.test(await page.locator('.fs-rail').innerText().catch(() => '')), 'rail carries no invented kind/org');
    }
  } finally {
    await browser.close();
    await cleanup();
    await pg.end();
  }
  console.log(`\n  ${pass} passed · ${fail} failed · host=${HOST} · screenshots ${OUT}\n`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await cleanup().catch(() => {}); await pg.end().catch(() => {}); process.exit(2); });
