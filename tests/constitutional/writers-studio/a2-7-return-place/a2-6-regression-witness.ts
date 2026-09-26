import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { chromium } from 'playwright';

const DSN = process.env.DATABASE_URL!;
const PORT = Number(process.env.WITNESS_PORT ?? '3431');

let pass = 0;
let fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass++; console.log('PASS  ' + name + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('FAIL  ' + name + (detail ? ' — ' + detail : '')); }
};

let next: ChildProcess | null = null;
const pg = new Client({ connectionString: DSN });
const q = async <T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string, params: unknown[] = [],
) => (await pg.query<T>(sql, params)).rows;

const M = randomUUID();
const M2 = randomUUID();
const TOKEN = 'a26-' + randomUUID();
const TOKEN2 = 'a26-' + randomUUID();
const LW = randomUUID();
const WK = randomUUID();
const DR = randomUUID();
const S1 = randomUUID();
const S2 = randomUUID();
const D1 = randomUUID();
const D2 = randomUUID();
const LW_FOREIGN = randomUUID();
const WK_FOREIGN = randomUUID();
const EXP_FOREIGN = randomUUID();
const REL_FOREIGN = randomUUID();
const BODY1 = 'The water held the last of the light.';
const BODY2 = 'Nothing moved on the far bank.';
async function seed() {
  await q("INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','A2-6 member'),($4,$5,$6,'x','A2-6 foreign')",
    [M,'A26-'+M.slice(0,8),'a26-'+M.slice(0,8),M2,'A26-'+M2.slice(0,8),'a26-'+M2.slice(0,8)]);
  await q("INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,now()+interval '2 hours'),($3,$4,now()+interval '2 hours')",
    [M,TOKEN,M2,TOKEN2]);

  await q("INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'A2-6 Work'),($3,$4,'Foreign Work')",
    [LW,M,LW_FOREIGN,M2]);
  await q("INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'A2-6 Manuscript'),($3,$4,'Foreign Manuscript')",
    [WK,M,WK_FOREIGN,M2]);
  await q("INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3),($4,'manuscript',$5,$6)",
    [LW,WK,M,LW_FOREIGN,WK_FOREIGN,M2]);

  await q("INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,1,'Chapter 1',1,'chapter',$3),($4,$2,2,'Second movement',2,'markdown',$5)",
    [S1,WK,BODY1,S2,BODY2]);
  await q("INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','a26',1)",
    [DR,WK,M]);
  await q("INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)",
    [D1,DR,'Chapter 1\n\n'+BODY1,S1,D2,'Second movement\n\n'+BODY2,S2]);
  await q("UPDATE manuscript_working_drafts d SET content=(SELECT string_agg(s.text,'' ORDER BY s.position) FROM manuscript_draft_sections s WHERE s.draft_id=d.id), section_addressable_at=now() WHERE id=$1",
    [DR]);

  await q("INSERT INTO writer_editorial_relationships (id,member_id,living_work_id,manuscript_id,creation_expression_id,contract_version) VALUES ($1,$2,$3,$4,$5,'A2-1')",
    [REL_FOREIGN,M2,LW_FOREIGN,WK_FOREIGN,EXP_FOREIGN]);
}
async function main() {
  await pg.connect();
  const db = String((await q<{d:string}>('SELECT current_database() d'))[0]?.d ?? '');
  if (!db.includes('ws_a26_witness')) throw new Error('refused non-witness DB ' + db);
  await seed();

  next = spawn('node_modules/.bin/next', ['dev', '-p', String(PORT)], {
    cwd: process.cwd(),
    stdio: ['ignore','pipe','pipe'],
    detached: true,
    env: {
      ...process.env,
      DATABASE_URL: DSN,
      WRITERS_STUDIO_EDITORIAL_ENABLED: '1',
      WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED: '1',
    },
  });

  const deadline = Date.now() + 240_000;
  for (;;) {
    try {
      const r = await fetch('http://127.0.0.1:' + PORT + '/api/health');
      if (r.status < 500) break;
    } catch {}
    if (Date.now() > deadline) throw new Error('Next did not become ready');
    await new Promise((r) => setTimeout(r, 1200));
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const page = await ctx.newPage();
  const base = 'http://127.0.0.1:' + PORT + '/writers-studio/rebuild?m=' + WK + '&s=' + D1;

  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector('[data-a2-relationship-shell]', { timeout: 240_000 });

    check('zero parents starts unselected',
      await page.locator('[data-a2-relationship-unselected]').count() === 1
      && !new URL(page.url()).searchParams.has('relationship'));
    await page.waitForSelector('[data-a2-begin-relationship]', { timeout: 30_000 });
    check('zero parents exposes explicit Begin gesture',
      await page.locator('[data-a2-begin-relationship]').count() === 1);

    await page.locator('[data-a2-begin-relationship]').click();
    await page.waitForSelector('[data-a2-relationship-selected]');
    const first = new URL(page.url()).searchParams.get('relationship');
    const count1 = Number((await q<{n:string}>("SELECT count(*)::text n FROM writer_editorial_relationships WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3",[M,LW,WK]))[0]?.n ?? 0);
    check('Begin creates and explicitly selects one parent', !!first && count1 === 1, 'count=' + count1);

    await page.getByRole('button', { name: 'Passage Work' }).click();
    check('Passage Work transition keeps exact parent',
      new URL(page.url()).searchParams.get('relationship') === first);
    await page.getByRole('button', { name: 'Chapter Review' }).click();
    check('Chapter Review transition keeps exact parent',
      new URL(page.url()).searchParams.get('relationship') === first);
    await page.getByRole('button', { name: 'Change' }).click();
    await page.getByRole('button', { name: /Leave this relationship/ }).click();
    await page.waitForSelector('[data-a2-relationship-unselected]');
    check('Leave removes only active address and preserves parent row',
      !new URL(page.url()).searchParams.has('relationship')
      && Number((await q<{n:string}>("SELECT count(*)::text n FROM writer_editorial_relationships WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3",[M,LW,WK]))[0]?.n ?? 0) === 1);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-a2-relationship-unselected]');
    await page.waitForSelector('[data-a2-existing-relationships] button', { timeout: 30_000 });
    const oneChoice = page.locator('[data-a2-existing-relationships] button');
    check('one existing parent is NOT auto-selected',
      await oneChoice.count() === 1 && !new URL(page.url()).searchParams.has('relationship'));

    await oneChoice.first().click();
    await page.waitForSelector('[data-a2-relationship-selected]');
    check('explicit existing-parent choice restores exact id',
      new URL(page.url()).searchParams.get('relationship') === first);

    await page.getByRole('button', { name: 'Change' }).click();
    await page.getByRole('button', { name: 'Begin another relationship' }).click();
    await page.waitForFunction((prior) => {
      const current = new URL(window.location.href).searchParams.get('relationship');
      return Boolean(current && current !== prior);
    }, first, { timeout: 30_000 });
    const second = new URL(page.url()).searchParams.get('relationship');
    check('Begin another creates a distinct explicit parent', !!second && second !== first);

    await page.getByRole('button', { name: 'Change' }).click();
    await page.getByRole('button', { name: /Leave this relationship/ }).click();
    await page.waitForSelector('[data-a2-relationship-unselected]', { timeout: 30_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-a2-relationship-unselected]');
    const choices = page.locator('[data-a2-existing-relationships] button');
    await page.waitForFunction(() =>
      document.querySelectorAll('[data-a2-existing-relationships] button').length === 2,
      undefined, { timeout: 30_000 });
    check('multiple parents remain unselected until member chooses',
      await choices.count() === 2 && !new URL(page.url()).searchParams.has('relationship'));

    await choices.nth(1).click();
    await page.waitForSelector('[data-a2-relationship-selected]');
    check('exact second choice wins', new URL(page.url()).searchParams.get('relationship') === second);

    await page.goto(base + '&relationship=' + REL_FOREIGN, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-a2-relationship-shell]');
    await page.waitForFunction(() =>
      !new URL(window.location.href).searchParams.has('relationship')
      && document.querySelectorAll('[data-a2-relationship-unselected]').length === 1,
      undefined, { timeout: 30_000 });
    check('foreign/tampered relationship URL is inactive and repaired',
      await page.locator('[data-a2-relationship-unselected]').count() === 1
      && !new URL(page.url()).searchParams.has('relationship'));

    const LW2 = randomUUID();
    await q("INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'Second declaring Work')",[LW2,M]);
    await q("INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)",[LW2,WK,M]);
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-a2-relationship-blocked]');
    check('ambiguous Work context blocks parent Begin/select',
      await page.locator('[data-a2-begin-relationship]').count() === 0
      && (await page.locator('[data-a2-relationship-blocked]').innerText()).includes('Choose which Work'));

    await q("DELETE FROM living_work_expressions WHERE expression_id=$1",[WK]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-a2-relationship-blocked]');
    check('no Work declaration blocks parent Begin/select',
      await page.locator('[data-a2-begin-relationship]').count() === 0
      && (await page.locator('[data-a2-relationship-blocked]').innerText()).includes('Declare this manuscript'));
  } finally {
    await browser.close();
  }

  console.log('');
  console.log('A2-7 INHERITED A2-6 REGRESSION WITNESS ' + pass + '/' + (pass + fail));
  process.exitCode = fail ? 1 : 0;
}
async function cleanup() {
  try { if (next?.pid) process.kill(-next.pid, 'SIGKILL'); } catch {}
  try { next?.kill('SIGKILL'); } catch {}
  try { await pg.end(); } catch {}
}

main().catch((e) => { console.error(e); process.exitCode = 2; }).finally(cleanup);
