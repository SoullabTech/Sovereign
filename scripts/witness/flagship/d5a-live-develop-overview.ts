/**
 * WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D5A
 * Facts-only Develop Overview live walk.
 *
 * Reuses the disposable D4 witness schema database but creates fresh member,
 * Work, manuscript and session identities. It commissions no reading.
 */
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { chromium } from 'playwright';

const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3618');
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/ws-roadmap-d5a');
if (!/\/ws_d4r1_witness_[^/?]+(?:\?|$)/.test(DSN)) {
  console.error('REFUSED — D5A requires the existing disposable ws_d4r1_witness_* schema database');
  process.exit(2);
}

const pg = new Client({ connectionString: DSN });
const q = async (sql: string, params: unknown[] = []) => (await pg.query(sql, params)).rows as Record<string, unknown>[];
let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass += 1; console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${name}\n        ${detail}`); }
};

const M = randomUUID(), LW = randomUUID(), WK = randomUUID(), DR = randomUUID();
const S1 = randomUUID(), S2 = randomUUID(), D1 = randomUUID(), D2 = randomUUID();
const TOKEN = `d5a-${randomUUID()}`;
const T1 = 'Chapter 1\n\nThe river enters before Clara names what she fears.';
const T2 = 'The crossing\n\nHer voice becomes quieter when she reaches the far bank.';

async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name,onboarded,onboarding_step,tester)
    VALUES ($1,$2,$3,'x','D5A witness',true,'complete',true)`, [M,`SOULLAB-D5A-${M.slice(0,8)}`,`d5a-${M.slice(0,8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at,user_agent)
    VALUES ($1,$2,NOW()+INTERVAL '2 hours','d5a-witness')`, [M,TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title,form) VALUES ($1,$2,'The River Between','book')`, [LW,M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The River Between')`, [WK,M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
    VALUES ($1,'manuscript',$2,$3)`, [LW,WK,M]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body)
    VALUES ($1,$2,1,'Chapter 1',1,'chapter',$3),($4,$2,2,'The crossing',2,'markdown',$5)`, [S1,WK,T1,S2,T2]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count)
    VALUES ($1,$2,$3,$4,'sha-d5a',1)`, [DR,WK,M,T1+T2]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
    VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)`, [D1,DR,T1,S1,D2,T2,S2]);
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at=NOW() WHERE id=$1`, [DR]);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  await pg.connect();
  const [who] = await q('select current_database() d,current_user u');
  if (!String(who?.d).startsWith('ws_d4r1_witness_') || who?.u !== 'maia_test_user') {
    throw new Error(`wrong DB identity ${who?.d}/${who?.u}`);
  }
  await seed();

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, url: `http://127.0.0.1:${PORT}` }]);
  const page = await ctx.newPage();
  let readingRequests = 0;
  page.on('request', (req) => { if (/\/readings(?:\?|\/|$)/.test(req.url())) readingRequests += 1; });

  try {
    console.log('\n── D5A LIVE DEVELOP OVERVIEW WALK ──\n');
    await page.goto(`http://127.0.0.1:${PORT}/writers-studio/develop?m=${WK}&s=${D1}`,
      { waitUntil: 'domcontentloaded', timeout: 240000 });
    await page.waitForSelector('[data-studio-mode="develop"] [data-stage="develop"]', { timeout: 240000 });
    await page.screenshot({ path: join(OUT, '01-overview-facts-only.png'), fullPage: false });

    check('D5A-01 exact flagship shell owns Develop', await page.locator('[data-studio-mode="develop"] [data-stage="develop"]').count() === 1);
    check('D5A-02 Work identity comes from declared Work', (await page.locator('.fs-railworkname').textContent()) === 'The River Between');
    check('D5A-03 Overview uses real manuscript facts', (await page.locator('.fs-phead').textContent())?.includes('2 sections') === true);
    check('D5A-04 no page count is invented', !(await page.locator('.fs-phead').textContent() ?? '').includes('undefined pages'));
    check('D5A-05 unattached continuity is explicit, not a fake map', await page.locator('[data-continuity-map="unavailable"]').count() === 1);
    check('D5A-06 no MAIA observations are fabricated', await page.locator('[data-observations="unattached"]').count() === 1 && await page.locator('[data-observation]').count() === 0);
    check('D5A-07 no reading is commissioned or fetched on Overview open', readingRequests === 0, `reading requests=${readingRequests}`);
    check('D5A-08 unbuilt lenses are orientation, not dead controls', await page.locator('.fs-modetabs button').count() === 0 && await page.locator('.fs-modetabs [aria-disabled="true"]').count() === 8);
    check('D5A-09 unbound MAIA/facet controls are absent', await page.getByRole('button', { name: 'Ask MAIA' }).count() === 0 && await page.locator('.fs-facet').count() === 0);
    const write = page.locator('a[data-nav="write"]');
    const writeHrefs = await write.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    check('D5A-10 exact Write return exists and preserves place', writeHrefs.length === 2 && writeHrefs.every((href) => href?.includes(`m=${WK}`) && href?.includes(`s=${D1}`)), `hrefs=${writeHrefs.join(' | ')}`);
    const visual = await page.locator('.fs-root').evaluate((node) => {
      const style = getComputedStyle(node);
      return { display: style.display, columns: style.gridTemplateColumns, background: style.backgroundColor };
    });
    check('D5A-11 flagship visual system is actually loaded on the live route', visual.display === 'grid' && visual.columns.split(' ').length >= 2 && visual.background !== 'rgba(0, 0, 0, 0)', JSON.stringify(visual));
  } finally {
    await browser.close();
    await pg.end();
  }

  console.log(`\nD5A RESULT — ${pass} passed · ${fail} failed · screenshot ${OUT}\n`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await pg.end().catch(() => {});
  process.exit(2);
});
