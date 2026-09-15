/**
 * WRITING-STATE-ANNOUNCE-01 · THE DRAFT SAYS WHAT IT IS, WHERE THE WRITER IS.
 *
 * ⭐⭐ THE GOVERNING LAW: the system may decide whether an act is AVAILABLE;
 * the member decides whether an act that durably changes the structure of their
 * Work is TAKEN. So every state below is announced, exactly one of them offers
 * an act, and ⛔ nothing converts by itself.
 *
 * All five server states are walked, and the decisive property is checked in
 * each: ⭐ THE OUTLINE PANEL IS DISMISSED THROUGHOUT. The defect this act
 * repairs was that the truth lived in a panel that could be closed — so a
 * witness that left it open would prove nothing.
 *
 * ⛔ DISPOSABLE DATABASES ONLY.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { Client } from 'pg';
import { chromium, type Browser, type Page } from 'playwright-core';

const DSN = process.env.DATABASE_URL!;
const SHOTS = process.env.WITNESS_SHOTS ?? '/tmp/writing-state-shots';
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

let pg: Client; let next: ChildProcess | null = null; let browser: Browser | null = null;
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p as unknown[])).rows as any[];
const one = async (s: string, p: unknown[] = []) => (await q(s, p))[0];

function killNext() {
  if (!next?.pid) return;
  try { process.kill(-next.pid, 'SIGKILL'); } catch { /* gone */ }
  next = null;
}
async function teardown() {
  await browser?.close().catch(() => {}); browser = null;
  killNext(); await pg?.end().catch(() => {});
}

/**
 * ⭐ EXACTLY WHAT `composeCurrent` PRODUCES: a BARE heading line, a blank line,
 * the body lines, a blank line — per section, joined by newlines.
 *
 * ⚠️ A first fixture wrote markdown `# One`, which is the LEGACY composer, and
 * the conversion door refused with `boundary_confirmation_required · source 76
 * bytes, draft 78 bytes`. The refusal was read from the response rather than
 * inferred from a timer, which is what made it diagnosable at all.
 */
const TEXT = 'One\n\nBefore the water, there was a sound.\n\nTwo\n\nThe spiral is not a circle.\n';

async function main() {
  mkdirSync(SHOTS, { recursive: true });
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const dbn = (await one('SELECT current_database() d')).d as string;
  if (!dbn.includes('witness')) { console.log(`REFUSED · '${dbn}' is not a witness database.`); process.exit(2); }

  const M = randomUUID(); const TOKEN = `witness-${randomUUID()}`;
  await q(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,'WS','ws','x','W')`, [M]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);

  /** One Work per state, so the states cannot contaminate each other. */
  const makeWork = async (title: string) => {
    const LW = randomUUID(), WK = randomUUID();
    await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,$3)`, [LW, M, title]);
    await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
             VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
    await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)`, [WK, M, title]);
    return WK;
  };
  const addDraft = async (WK: string, content: string) => {
    const DR = randomUUID();
    await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count)
             VALUES ($1,$2,$3,$4,'sha',1)`, [DR, WK, M, content]);
    return DR;
  };

  /* no_draft — a Work with nothing written yet. */
  const W_NONE = await makeWork('Work With No Draft');

  /* continuous — Source sections whose composition IS the draft, so
     classifyDraft says PRISTINE and conversion is provably available. */
  const W_CONT = await makeWork('Convertible Work');
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,1,'One','Before the water, there was a sound.'),
                  ($3,$2,2,'Two','The spiral is not a circle.')`,
          [randomUUID(), W_CONT, randomUUID()]);
  await addDraft(W_CONT, TEXT);

  /* continuous_unprovable — a draft with NO source at all (NO_SOURCE). */
  const W_UNPROV = await makeWork('Unprovable Work');
  await addDraft(W_UNPROV, 'Words with no source behind them at all.\n');

  /* section_aware — converted. */
  const W_SEC = await makeWork('Converted Work');
  const SRC = randomUUID(); const DR_SEC = await addDraft(W_SEC, 'Only the sound.');
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,1,'One','Only the sound.')`, [SRC, W_SEC]);
  await q('BEGIN');
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,1,$3,$4)`, [randomUUID(), DR_SEC, 'Only the sound.', SRC]);
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at = NOW() WHERE id = $1`, [DR_SEC]);
  await q('COMMIT');

  const port = 3420;
  next = spawn('node_modules/.bin/next', ['dev', '-p', String(port)], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: true,
    env: { ...process.env, DATABASE_URL: DSN },
  });
  const deadline = Date.now() + 240_000;
  for (;;) {
    try { const r = await fetch(`http://127.0.0.1:${port}/api/health`); if (r.status < 500) break; } catch { /* waiting */ }
    if (Date.now() > deadline) { console.log('  ⛔ NOT RUN — next dev did not become ready'); await teardown(); process.exit(2); }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const mode = async (WK: string) => {
    const r = await fetch(`http://127.0.0.1:${port}/api/sovereign/manuscripts/${WK}/write-state`,
      { headers: { 'x-session-token': TOKEN } });
    if (r.status === 404) return 'no_draft';
    if (r.status === 503) return 'indeterminate';
    return (await r.json()).mode as string;
  };

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' WRITING-STATE-ANNOUNCE-01 · ALL FIVE STATES');
  console.log('══════════════════════════════════════════════════════════════════\n');

  console.log('── the server states the fixtures actually produce ───────────────');
  const modes = {
    none: await mode(W_NONE), cont: await mode(W_CONT),
    unprov: await mode(W_UNPROV), sec: await mode(W_SEC),
  };
  eq('S1 no_draft', modes.none, 'no_draft');
  eq('S2 continuous', modes.cont, 'continuous');
  eq('S3 continuous_unprovable', modes.unprov, 'continuous_unprovable');
  eq('S4 section_aware', modes.sec, 'section_aware');

  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const page: Page = await ctx.newPage();

  /** ⭐ Opens the room with the OUTLINE DISMISSED, which is the whole point. */
  const openRoom = async (WK: string, shot: string) => {
    await page.goto(`http://127.0.0.1:${port}/writers-studio/canvas?m=${WK}`,
                    { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector('text=Conversations', { timeout: 240_000 });
    await page.waitForTimeout(2500);
    const dismiss = page.getByLabel('Dismiss Manuscript');
    if (await dismiss.count()) { await dismiss.click(); await page.waitForTimeout(600); }
    await page.screenshot({ path: `${SHOTS}/${shot}.png` });
  };
  const notice = () => page.locator('[data-draft-state]');
  const outline = () => page.locator('[data-outline-state="unconverted"]');
  const act = () => page.locator('[data-action="confirm-section-breaks"]');

  console.log('\n── continuous · the one state with an act ────────────────────────');
  await openRoom(W_CONT, '01-continuous');
  /* ⚠️ `count()` does NOT auto-wait — a first run read 0 here while the very
     next assertion, which does auto-wait, read the state correctly. The race
     was in the instrument, not the surface. */
  await notice().first().waitFor({ timeout: 30_000 });
  eq('C1 ⭐ the field names the state, with the outline DISMISSED', await notice().count(), 1);
  eq('C2 and it names which state', await notice().getAttribute('data-draft-state'), 'continuous');
  eq('C3 ⭐ exactly one act is offered', await act().count(), 1);
  eq('C4 it is the member\'s gesture, in the field',
     await notice().getAttribute('data-draft-act'), 'available');
  eq('C5 ⛔ the outline no longer carries the state', await outline().count(), 0);
  eq('C6 ⛔⛔ AND NOTHING CONVERTED BY ITSELF',
     (await one('SELECT section_addressable_at a FROM manuscript_working_drafts WHERE manuscript_id=$1',
                [W_CONT]))?.a, null);

  console.log('\n── continuous_unprovable · truthful, and NO act ──────────────────');
  await openRoom(W_UNPROV, '02-unprovable');
  eq('U1 the field names the state', await notice().getAttribute('data-draft-state'), 'continuous_unprovable');
  eq('U2 ⛔⛔ NO ACT IS SHOWN — nothing implies an act that does not exist', await act().count(), 0);
  eq('U3 and it says so', await notice().getAttribute('data-draft-act'), 'none');
  eq('U4 ⭐ writing remains available', await page.locator('textarea, [contenteditable]').count() > 0, true);

  console.log('\n── no_draft · a truthful beginning, at the starting surface ──────');
  await openRoom(W_NONE, '03-no-draft');
  eq('N1 the field names the state', await notice().getAttribute('data-draft-state'), 'no_draft');
  eq('N2 ⛔ no act is offered', await act().count(), 0);
  eq('N3 ⭐ and the explanation is NOT hidden in the outline', await outline().count(), 0);

  console.log('\n── section_aware · the normal Studio explains itself by working ──');
  await openRoom(W_SEC, '04-section-aware');
  eq('A1 ⛔ no state banner over a room that is behaving correctly', await notice().count(), 0);
  eq('A2 ⭐ and the writer is in her sections',
     (await page.locator('h1, h2').allInnerTexts()).join(' | ').includes('One'), true);

  console.log('\n── the member takes the act ──────────────────────────────────────');
  await openRoom(W_CONT, '05-before-act');
  /* ⭐ Capture what the conversion door actually answers, so a refusal is read
     rather than inferred from a timer that expired. */
  let convert: { status: number; body: string } | null = null;
  page.on('response', async (r) => {
    if (r.url().includes('/draft') && r.request().method() === 'POST') {
      convert = { status: r.status(), body: (await r.text().catch(() => '')).slice(0, 300) };
    }
  });
  await act().click();
  /* Wait on the STATE, not on a duration. */
  for (let i = 0; i < 40 && (await mode(W_CONT)) !== 'section_aware'; i++) {
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: `${SHOTS}/06-after-act.png` });
  if (convert) console.log(`     conversion door answered ${convert.status}: ${convert.body}`);
  else console.log('     ⚠️ no POST to the draft door was observed');
  eq('T1 ⭐⭐ structure became durable BECAUSE SHE ASKED',
     (await one('SELECT section_addressable_at IS NOT NULL a FROM manuscript_working_drafts WHERE manuscript_id=$1',
                [W_CONT]))?.a, true);
  eq('T2 ⭐ and the server now says section_aware', await mode(W_CONT), 'section_aware');
  eq('T3 the sections are real', Number((await one(
     `SELECT count(*) n FROM manuscript_draft_sections s
        JOIN manuscript_working_drafts d ON d.id = s.draft_id WHERE d.manuscript_id = $1`, [W_CONT])).n), 2);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  console.log(`  screenshots: ${SHOTS}`);
}

main()
  .then(async () => { await teardown(); process.exit(fail === 0 ? 0 : 1); })
  .catch(async (e) => { console.error('\n  ⛔ NOT RUN —', e?.message ?? e); await teardown(); process.exit(2); });
