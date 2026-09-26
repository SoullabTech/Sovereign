/**
 * WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D5B
 * Authored Structure live walk inside the facts-only Develop family.
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
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/ws-roadmap-d5b');
if (!/\/ws_d4r1_witness_[^/?]+(?:\?|$)/.test(DSN)) {
  console.error('REFUSED — D5B requires the existing disposable ws_d4r1_witness_* schema database');
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
const TOKEN = `d5b-${randomUUID()}`;
const T1 = 'Chapter 1\n\nThe river enters before Clara names what she fears.';
const T2 = 'The crossing\n\nHer voice becomes quieter when she reaches the far bank.';

async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name,onboarded,onboarding_step,tester)
    VALUES ($1,$2,$3,'x','D5B witness',true,'complete',true)`, [M,`SOULLAB-D5B-${M.slice(0,8)}`,`d5b-${M.slice(0,8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at,user_agent)
    VALUES ($1,$2,NOW()+INTERVAL '2 hours','d5b-witness')`, [M,TOKEN]);
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
    console.log('\n── D5B LIVE DEVELOP STRUCTURE WALK ──\n');
    await page.goto(`http://127.0.0.1:${PORT}/writers-studio/develop?m=${WK}&s=${D1}`,
      { waitUntil: 'domcontentloaded', timeout: 240000 });
    await page.waitForSelector('[data-studio-mode="develop"] [data-stage="develop"]', { timeout: 240000 });
    await page.screenshot({ path: join(OUT, '01-structure-live.png'), fullPage: false });

    check('D5B-01 Overview remains the live flagship Develop entry', await page.locator('[data-studio-mode="develop"] [data-stage="develop"]').count() === 1);
    const before = readingRequests;
    await page.getByRole('tab', { name: 'How it’s put together' }).click();
    await page.waitForFunction(() => new URL(location.href).searchParams.get('lens') === 'structure', undefined, { timeout: 15000 });
    await page.waitForSelector('[data-develop-view="structure"]', { timeout: 15000 });
    await page.screenshot({ path: join(OUT, '01-structure-live.png'), fullPage: false });
    check('D5B-02 Structure is an explicit URL state', new URL(page.url()).searchParams.get('lens') === 'structure', page.url());
    check('D5B-03 Structure uses authored section identities only', await page.locator('[data-authored-structure="true"] [data-structure-section]').count() === 2);
    const labels = await page.locator('[data-structure-section] .fs-lensq').allTextContents();
    check('D5B-04 authored headings survive unchanged and in manuscript order', labels.join(' | ') === 'Chapter 1 | The crossing', labels.join(' | '));
    check('D5B-05 heading depth is presentation only, not an inferred movement name', (await page.locator('[data-authored-structure="true"]').textContent())?.includes('MAIA has not named or inferred a shape here.') === true);
    const returns = await page.locator('a[data-return-to]').evaluateAll((nodes) => nodes.map((n) => ({ id: n.getAttribute('data-return-to'), href: n.getAttribute('href') })));
    check('D5B-06 every authored section has an exact route back into Write', returns.length === 2 && returns.every((r) => r.href?.includes(`m=${WK}`) && r.href?.includes(`s=${r.id}`)), JSON.stringify(returns));
    check('D5B-07 opening Structure commissions and fetches no reading', readingRequests === before, `reading requests delta=${readingRequests-before}`);
    check('D5B-08 no MAIA observation is manufactured by Structure', await page.locator('[data-observation]').count() === 0);
    check('D5B-09 only Overview + Structure are live controls', await page.locator('.fs-modetabs button').count() === 2 && await page.locator('.fs-modetabs [aria-disabled="true"]').count() === 6);
    await page.getByRole('tab', { name: 'Overview' }).click();
    await page.waitForFunction(() => !new URL(location.href).searchParams.has('lens'), undefined, { timeout: 15000 });
    check('D5B-10 Overview return removes only the lens location', new URL(page.url()).searchParams.get('m') === WK && new URL(page.url()).searchParams.get('s') === D1 && !new URL(page.url()).searchParams.has('lens'), page.url());
    check('D5B-11 unbound MAIA/facet controls remain absent', await page.getByRole('button', { name: 'Ask MAIA' }).count() === 0 && await page.locator('.fs-facet').count() === 0);
    const visual = await page.locator('.fs-root').evaluate((node) => {
      const style = getComputedStyle(node);
      return { display: style.display, columns: style.gridTemplateColumns, background: style.backgroundColor };
    });
    check('D5B-12 flagship visual system remains live across the mode transition', visual.display === 'grid' && visual.columns.split(' ').length >= 2, JSON.stringify(visual));
  } finally {
    await browser.close();
    await pg.end();
  }

  console.log(`\nD5B RESULT — ${pass} passed · ${fail} failed · screenshot ${OUT}\n`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await pg.end().catch(() => {});
  process.exit(2);
});
