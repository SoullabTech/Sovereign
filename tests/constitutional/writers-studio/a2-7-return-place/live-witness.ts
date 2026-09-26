import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { chromium, type BrowserContext, type Page } from 'playwright';

const DSN = process.env.DATABASE_URL!;
const PORT = Number(process.env.WITNESS_PORT ?? '3432');
let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass++; console.log('PASS  ' + name + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('FAIL  ' + name + (detail ? ' — ' + detail : '')); }
};

let next: ChildProcess | null = null;
const pg = new Client({ connectionString: DSN });
const q = async <T extends Record<string, unknown> = Record<string, unknown>>(sql: string, params: unknown[] = []) =>
  (await pg.query<T>(sql, params)).rows;

const M = randomUUID(), M2 = randomUUID();
const TOKEN = 'a27-' + randomUUID(), TOKEN2 = 'a27-' + randomUUID();
const LW = randomUUID(), LW2 = randomUUID(), WK = randomUUID(), DR = randomUUID();
const S1 = randomUUID(), S2 = randomUUID(), D1 = randomUUID(), D2 = randomUUID();
const LW_FOREIGN = randomUUID(), WK_FOREIGN = randomUUID(), REL_FOREIGN = randomUUID();
const BODY1 = 'The water held the last of the light.';
const BODY2 = 'Nothing moved on the far bank.';

async function seed() {
  await q("INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','A2-7 member'),($4,$5,$6,'x','A2-7 foreign')",
    [M,'A27-'+M.slice(0,8),'a27-'+M.slice(0,8),M2,'A27-'+M2.slice(0,8),'a27-'+M2.slice(0,8)]);
  await q("INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,now()+interval '2 hours'),($3,$4,now()+interval '2 hours')",
    [M,TOKEN,M2,TOKEN2]);
  await q("INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'A2-7 Work'),($3,$4,'Foreign Work')", [LW,M,LW_FOREIGN,M2]);
  await q("INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'A2-7 Manuscript'),($3,$4,'Foreign Manuscript')", [WK,M,WK_FOREIGN,M2]);
  await q("INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3),($4,'manuscript',$5,$6)",
    [LW,WK,M,LW_FOREIGN,WK_FOREIGN,M2]);
  await q("INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,1,'Chapter 1',1,'chapter',$3),($4,$2,2,'Second movement',2,'markdown',$5)",
    [S1,WK,BODY1,S2,BODY2]);
  await q("INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','a27',1)", [DR,WK,M]);
  await q("INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)",
    [D1,DR,'Chapter 1\n\n'+BODY1,S1,D2,'Second movement\n\n'+BODY2,S2]);
  await q("UPDATE manuscript_working_drafts d SET content=(SELECT string_agg(s.text,'' ORDER BY s.position) FROM manuscript_draft_sections s WHERE s.draft_id=d.id), section_addressable_at=now() WHERE id=$1", [DR]);
  await q("INSERT INTO writer_editorial_relationships (id,member_id,living_work_id,manuscript_id,creation_expression_id,contract_version) VALUES ($1,$2,$3,$4,$5,'A2-1')",
    [REL_FOREIGN,M2,LW_FOREIGN,WK_FOREIGN,randomUUID()]);
}

async function memberContext(browser: Awaited<ReturnType<typeof chromium.launch>>): Promise<BrowserContext> {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  return ctx;
}

async function waitUrl(page: Page, key: string, value: string | null) {
  await page.waitForFunction(({ key, value }) => new URL(location.href).searchParams.get(key) === value,
    { key, value }, { timeout: 30_000 });
}

async function main() {
  await pg.connect();
  const db = String((await q<{d:string}>('SELECT current_database() d'))[0]?.d ?? '');
  if (!db.includes('ws_a27_witness')) throw new Error('refused non-witness DB ' + db);
  await seed();

  next = spawn('node_modules/.bin/next', ['dev', '-p', String(PORT)], {
    cwd: process.cwd(), stdio: ['ignore','pipe','pipe'], detached: true,
    env: { ...process.env, DATABASE_URL: DSN, WRITERS_STUDIO_EDITORIAL_ENABLED: '1', WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED: '1' },
  });
  const deadline = Date.now() + 240_000;
  for (;;) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/api/health`); if (r.status < 500) break; } catch {}
    if (Date.now() > deadline) throw new Error('Next did not become ready');
    await new Promise(r => setTimeout(r, 1200));
  }

  const browser = await chromium.launch();
  const base = `http://127.0.0.1:${PORT}/writers-studio/rebuild?m=${WK}`;
  let ctx = await memberContext(browser);
  let page = await ctx.newPage();

  try {
    await page.goto(base + '&s=' + D1, { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector('[data-a2-relationship-shell]', { timeout: 240_000 });
    await page.waitForSelector('[data-a2-begin-relationship]', { timeout: 30_000 });
    await page.locator('[data-a2-begin-relationship]').click();
    await page.waitForSelector('[data-a2-relationship-selected]');
    const rel1 = new URL(page.url()).searchParams.get('relationship');
    const rr1 = (await q<{relationship_id:string}>("SELECT relationship_id FROM writer_studio_relationship_returns WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3", [M,LW,WK]))[0]?.relationship_id;
    check('Begin persists exact explicitly selected relationship', !!rel1 && rr1 === rel1);

    await page.getByRole('button', { name: /Second movement/ }).first().click();
    await waitUrl(page, 's', D2);
    for (let i=0;i<50;i++) {
      const row=(await q<{draft_section_id:string}>("SELECT draft_section_id FROM writer_studio_place_returns WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3",[M,LW,WK]))[0];
      if (row?.draft_section_id===D2) break;
      await new Promise(r=>setTimeout(r,50));
    }
    const pr2=(await q<{draft_section_id:string}>("SELECT draft_section_id FROM writer_studio_place_returns WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3",[M,LW,WK]))[0]?.draft_section_id;
    check('deliberate section movement persists exact place', pr2 === D2);
    check('place movement does not change relationship return',
      (await q<{relationship_id:string}>("SELECT relationship_id FROM writer_studio_relationship_returns WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3",[M,LW,WK]))[0]?.relationship_id === rel1);

    await ctx.close();
    ctx = await memberContext(browser); page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector('[data-a2-relationship-shell]');
    await waitUrl(page, 'relationship', rel1!);
    await waitUrl(page, 's', D2);
    check('new browser session restores exact relationship independently', new URL(page.url()).searchParams.get('relationship') === rel1);
    check('new browser session restores exact place independently', new URL(page.url()).searchParams.get('s') === D2);

    await page.goto(base + '&s=' + D1, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-a2-relationship-shell]');
    await waitUrl(page, 's', D1);
    check('explicit section URL outranks different durable place', new URL(page.url()).searchParams.get('s') === D1);
    check('explicit section URL does not erase durable place',
      (await q<{draft_section_id:string}>("SELECT draft_section_id FROM writer_studio_place_returns WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3",[M,LW,WK]))[0]?.draft_section_id === D2);

    const rel2 = randomUUID();
    const expr=(await q<{id:string}>("SELECT id FROM living_work_expressions WHERE living_work_id=$1 AND expression_id=$2 AND declared_by=$3",[LW,WK,M]))[0]!.id;
    await q("INSERT INTO writer_editorial_relationships (id,member_id,living_work_id,manuscript_id,creation_expression_id,contract_version) VALUES ($1,$2,$3,$4,$5,'A2-1')",[rel2,M,LW,WK,expr]);
    await page.goto(base + '&s=' + D1 + '&relationship=' + rel2, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-a2-relationship-selected]');
    await waitUrl(page, 'relationship', rel2);
    check('explicit relationship URL outranks different durable relationship', new URL(page.url()).searchParams.get('relationship') === rel2);
    check('explicit relationship URL does not rewrite durable relationship',
      (await q<{relationship_id:string}>("SELECT relationship_id FROM writer_studio_relationship_returns WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3",[M,LW,WK]))[0]?.relationship_id === rel1);

    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-a2-relationship-shell]');
    await waitUrl(page, 'relationship', rel1!); await waitUrl(page, 's', D2);
    check('clean return still restores durable relationship after explicit override', new URL(page.url()).searchParams.get('relationship') === rel1);

    await page.getByRole('button', { name: 'Change' }).click();
    await page.getByRole('button', { name: /Leave this relationship/ }).click();
    await page.waitForSelector('[data-a2-relationship-unselected]');
    const rrCount=Number((await q<{n:string}>("SELECT count(*)::text n FROM writer_studio_relationship_returns WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3",[M,LW,WK]))[0]?.n ?? 0);
    const placeAfterLeave=(await q<{draft_section_id:string}>("SELECT draft_section_id FROM writer_studio_place_returns WHERE member_id=$1 AND living_work_id=$2 AND manuscript_id=$3",[M,LW,WK]))[0]?.draft_section_id;
    check('Leave clears durable relationship return', rrCount === 0);
    check('Leave preserves durable place', placeAfterLeave === D2);

    const foreignWrite = await page.evaluate(async ({lw,wk,rel}) => {
      const r=await fetch('/api/writers-studio/return/relationship',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({livingWorkId:lw,manuscriptId:wk,relationshipId:rel})});
      return r.status;
    }, { lw: LW, wk: WK, rel: REL_FOREIGN });
    check('foreign relationship return write refuses', foreignWrite === 404 || foreignWrite === 409, 'status=' + foreignWrite);

    const LW_AMBIG=randomUUID();
    await q("INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'Ambiguous Work')",[LW_AMBIG,M]);
    await q("INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)",[LW_AMBIG,WK,M]);
    const ambiguousWrite = await page.evaluate(async ({lw,wk,s}) => {
      const r=await fetch('/api/writers-studio/return/place',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({livingWorkId:lw,manuscriptId:wk,draftSectionId:s})});
      return r.status;
    }, { lw: LW, wk: WK, s: D1 });
    check('ambiguous Work context refuses durable place write', ambiguousWrite === 409, 'status=' + ambiguousWrite);
  } finally {
    await ctx.close().catch(()=>{}); await browser.close();
  }

  console.log(`\nA2-7 RETURN/PLACE WITNESS ${pass}/${pass+fail}`);
  process.exitCode = fail ? 1 : 0;
}

async function cleanup() {
  try { if (next?.pid) process.kill(-next.pid, 'SIGKILL'); } catch {}
  try { next?.kill('SIGKILL'); } catch {}
  try { await pg.end(); } catch {}
}
main().catch(e => { console.error(e); process.exitCode=2; }).finally(cleanup);
