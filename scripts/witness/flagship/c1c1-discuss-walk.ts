/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1 — DISCUSS-ONLY CONTEXTUAL MAIA WALK.
 *
 *   DATABASE_URL=<shadow> WITNESS_PORT=<running next dev> \
 *     npx tsx scripts/witness/flagship/c1c1-discuss-walk.ts --flag off|on
 *
 * Real browser · real route · real authenticated session · real rows in a
 * disposable full-schema shadow. `--flag off` runs against a next dev whose
 * process does NOT carry WRITERS_STUDIO_EDITORIAL_ENABLED; `--flag on` against
 * one that carries it AND points ANTHROPIC_BASE_URL at the controlled loopback
 * inference (`c1c1-loopback-inference.ts`).
 *
 * ⚠️ CANDIDATE EVIDENCE — ⛔ not production evidence, ⛔ not a human-member
 * walk, and ⛔ the MAIA reply is a labelled controlled stand-in, not cognition.
 * ⛔ Never point this at production: it seeds and deletes rows.
 * Records identifiers, counts and short witness strings only.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { chromium, type Page, type Request } from 'playwright';

const FLAG = (process.argv.includes('--flag') ? process.argv[process.argv.indexOf('--flag') + 1] : 'on') as 'off' | 'on';
const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3499');
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/flagship-c1c1');
if (!DSN) { console.log('NO EVIDENCE — DATABASE_URL not set'); process.exit(2); }
if (/soullab\.life|minisforum|192\.168\.0\.104|maia_consciousness/.test(DSN)) { console.log('REFUSED — production-looking DATABASE_URL'); process.exit(2); }

let pass = 0, fail = 0;
const ok = (s: string, d = '') => { pass++; console.log(`  PASS  ${s}${d ? `  — ${d}` : ''}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n        ${d}`); };
const check = (s: string, cond: boolean, d: string) => (cond ? ok(s, d) : bad(s, d));

const pg = new Client({ connectionString: DSN });
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p)).rows as Record<string, unknown>[];
const n = async (s: string, p: unknown[] = []) => Number((await q(s, p))[0]?.['c'] ?? 0);

const M = randomUUID(), LW = randomUUID(), WK = randomUUID(), DR = randomUUID();
const S1 = randomUUID(), S2 = randomUUID(), D1 = randomUUID(), D2 = randomUUID();
const TOKEN = `c1c1-${randomUUID()}`;
const H1 = 'Chapter 1', H2 = 'The river at dusk';
const B1 = 'The water held the last of the light.';
const B2 = 'Nothing moved on the far bank. She waited for the sound to come back.';
const SEL = 'far bank';
/* R1-1 · meaningful edge whitespace — the stored author turn must carry these exact bytes. */
const ASK1 = '  Why does this sentence feel flat?  ';
const ASK_PROPOSAL = 'Controlled: the transport will return proposal material for this turn.';
const ASK_SLOW_B = 'Answer slowly please: what does the far bank want?';
const SEL_B = 'sound';
const ASK_SLOW = 'Answer slowly please: what is the far bank doing here?';
const ASK2 = 'Second question about the far bank.';
const ASK3 = 'Third question, submitted twice.';
const CONTROLLED_REPLY_HEAD = 'Controlled witness reply:';

async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','C1C1 walk')`, [M, `SOULLAB-C1C1-${M.slice(0, 8)}`, `c1c1-${M.slice(0, 8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'The River Between')`, [LW, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The River Between')`, [WK, M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,1,$3,1,'chapter',$4),($5,$2,2,$6,2,'markdown',$7)`, [S1, WK, H1, B1, S2, H2, B2]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','sha-c1c1',2)`, [DR, WK, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)`, [D1, DR, `${H1}\n\n${B1}`, S1, D2, `${H2}\n\n${B2}`, S2]);
  await q(`UPDATE manuscript_working_drafts d SET content = (SELECT COALESCE(string_agg(s.text,'' ORDER BY s.position),'') FROM manuscript_draft_sections s WHERE s.draft_id = d.id) WHERE d.id = $1`, [DR]);
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at = NOW() WHERE id = $1`, [DR]);
}
async function cleanup() {
  /* ⚠️ proposal_chains refuses DELETE by trigger (constitutional); the member row therefore stays. Recorded, shadow destroyed after the run. */
  await q(`DELETE FROM manuscript_working_drafts WHERE manuscript_id = $1`, [WK]).catch(() => {});
  await q(`DELETE FROM manuscript_sections WHERE manuscript_id = $1`, [WK]).catch(() => {});
  await q(`DELETE FROM living_work_expressions WHERE living_work_id = $1`, [LW]).catch(() => {});
  await q(`DELETE FROM member_manuscripts WHERE id = $1`, [WK]).catch(() => {});
  await q(`DELETE FROM living_works WHERE id = $1`, [LW]).catch(() => {});
  await q(`DELETE FROM auth_sessions WHERE member_id = $1`, [M]).catch(() => {});
  await q(`DELETE FROM members WHERE id = $1`, [M]).catch(() => {});
}
const sectionText = async (id: string) => String((await q(`SELECT text FROM manuscript_draft_sections WHERE id = $1`, [id]))[0]?.['text'] ?? '');
const version = async () => Number((await q(`SELECT version FROM manuscript_working_drafts WHERE id = $1`, [DR]))[0]?.['version'] ?? -1);
async function editorialRows() {
  const chains = await n(`SELECT count(*) c FROM proposal_chains WHERE work_id = $1`, [WK]);
  const threads = await n(`SELECT count(*) c FROM ask_threads t JOIN proposal_chains c ON c.id = t.proposal_chain_id WHERE c.work_id = $1`, [WK]);
  const turns = await n(`SELECT count(*) c FROM ask_turns u JOIN ask_threads t ON t.id = u.thread_id JOIN proposal_chains c ON c.id = t.proposal_chain_id WHERE c.work_id = $1`, [WK]);
  const maia = await n(`SELECT count(*) c FROM ask_turns u JOIN ask_threads t ON t.id = u.thread_id JOIN proposal_chains c ON c.id = t.proposal_chain_id WHERE c.work_id = $1 AND u.speaker = 'maia'`, [WK]);
  const versions = await n(`SELECT count(*) c FROM proposal_versions v JOIN proposal_chains c ON c.id = v.chain_id WHERE c.work_id = $1`, [WK]);
  return { chains, threads, turns, maia, versions };
}

async function selectPassage(page: Page) {
  await page.locator(`[data-authored-body="${D2}"]`).click();
  await page.waitForSelector(`textarea[data-authored-body="${D2}"]`, { timeout: 10_000 });
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
  return addr;
}
async function ask(page: Page, text: string) {
  await page.locator('[data-event="ASK_MAIA"]').click();
  await page.waitForSelector('[data-discuss="composing"]', { timeout: 10_000 });
  await page.locator('textarea.fs-mtext').fill(text);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  await pg.connect();
  const dbn = String((await q('SELECT current_database() d'))[0]!['d']);
  if (!/shadow|witness/.test(dbn)) { console.log(`REFUSED — '${dbn}' is not a shadow/witness database`); process.exit(2); }
  await seed();
  console.log(`\n── C1C1 DISCUSS WALK · flag=${FLAG} · manuscript=${WK} · draft=${DR} ──\n`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  /* ⭐ The browser carries an EXPLICIT ordinary posture, as a real session would. */
  await ctx.addInitScript(() => { try { localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false })); } catch { /* ignore */ } });
  const page: Page = await ctx.newPage();
  const reqs: { t: number; m: string; u: string; body: string | null }[] = [];
  page.on('request', (r: Request) => {
    if (/\/api\//.test(r.url())) reqs.push({ t: Date.now(), m: r.method(), u: r.url(), body: r.postData() });
  });
  const editorialReqs = () => reqs.filter((r) => /\/editorial\//.test(r.u));
  const since = (t: number) => reqs.filter((r) => r.t >= t);

  try {
    await page.goto(`http://127.0.0.1:${PORT}/writers-studio/rebuild?m=${WK}&s=${D2}`, { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector(`[data-authored-body="${D2}"]`, { timeout: 240_000 });
    await page.waitForTimeout(600);

    if (FLAG === 'off') {
      const before = await editorialRows();
      await selectPassage(page);
      await page.waitForTimeout(400);
      const held = await page.locator(`[data-held-passage-address]`).count();
      check('OFF-1 passage still holds with the flag off', held === 1, `held addresses=${held}`);
      check('OFF-2 no Ask MAIA affordance', (await page.locator('[data-event="ASK_MAIA"]').count()) === 0, 'ASK_MAIA=0');
      check('OFF-3 no Discuss panel', (await page.locator('.fs-maia').count()) === 0, 'fs-maia=0');
      check('OFF-4 no buttons at all (C1B F-6 holds)', (await page.locator('button').count()) === 0, `buttons=${await page.locator('button').count()}`);
      check('OFF-5 no editorial request of any kind (no 404 probing)', editorialReqs().length === 0, `editorial requests=${editorialReqs().length}`);
      const after = await editorialRows();
      check('OFF-6 zero editorial rows', JSON.stringify(after) === JSON.stringify(before) && after.chains === 0, JSON.stringify(after));
      await page.screenshot({ path: join(OUT, `flag-off__held.png`) });
    } else {
      /* ── ON · 1 no held → no commission ─────────────────────────────── */
      check('ON-1 enabled + nothing held → no Ask MAIA, no panel', (await page.locator('[data-event="ASK_MAIA"]').count()) === 0 && (await page.locator('.fs-maia').count()) === 0, 'ASK_MAIA=0 fs-maia=0');

      /* ── 2 select → exact address, zero rows ─────────────────────────── */
      const addr = await selectPassage(page);
      await page.waitForTimeout(300);
      const a = await page.locator(`[data-held-passage-address]`).first().getAttribute('data-held-passage-address').catch(() => null);
      check('ON-2 selection holds the exact address and commissions nothing', a === `${addr.start}:${addr.end}` && (await editorialRows()).chains === 0 && editorialReqs().length === 0, `address=${a} chains=0 editorialRequests=${editorialReqs().length}`);
      check('ON-3 Ask MAIA is the one affordance', (await page.locator('[data-event="ASK_MAIA"]').count()) === 1 && (await page.locator('button').count()) === 1, `ASK_MAIA=1 buttons=${await page.locator('button').count()}`);

      /* ── 3 composer: no server call, no rows ─────────────────────────── */
      await ask(page, ASK1);
      await page.screenshot({ path: join(OUT, `flag-on__1-composing.png`) });
      const tabsC = await page.locator('[data-discuss="composing"] [role="tab"]').count();
      check('ON-4 composer opens with no request and no row', editorialReqs().length === 0 && (await editorialRows()).chains === 0 && tabsC === 1, `editorialRequests=0 chains=0 tabs=${tabsC}`);
      check('ON-5 Ask MAIA hidden while the panel is open', (await page.locator('[data-event="ASK_MAIA"]').count()) === 0, 'ASK_MAIA=0');

      /* ── 4 dirty the section, then submit: settlement first ──────────── */
      const v0 = await version();
      await page.locator(`[data-authored-body="${D2}"]`).click();
      await page.waitForSelector(`textarea[data-authored-body="${D2}"]`, { timeout: 10_000 });
      await page.locator(`textarea[data-authored-body="${D2}"]`).press('End');
      await page.locator(`textarea[data-authored-body="${D2}"]`).type(' More.', { delay: 10 });
      const st = (await page.locator('.fs-saved').first().textContent().catch(() => null))?.trim() ?? '';
      const tSubmit = Date.now();
      await page.locator('[data-event="SUBMIT_ASK"]').click();
      await page.waitForSelector('[data-discuss="answered"], [data-discuss="refused"]', { timeout: 60_000 });
      const put = since(tSubmit).find((r) => r.m === 'PUT' && /\/sections\//.test(r.u));
      const open = since(tSubmit).find((r) => r.m === 'POST' && /rebuild\/editorial\/thread/.test(r.u));
      const turn = since(tSubmit).find((r) => r.m === 'POST' && /\/editorial\/turn/.test(r.u));
      const v1 = await version();
      check('ON-6 status was dirty at Submit and the section saved through the existing path BEFORE the passage opened', /Unsaved|Saving/.test(st) && !!put && !!open && put.t <= open.t && v1 > v0, `status="${st}" put=${!!put} open=${!!open} putBeforeOpen=${put && open ? put.t <= open.t : false} version ${v0}→${v1}`);
      const openBody = open?.body ? JSON.parse(open.body) : null;
      check('ON-7 the open carried the held range, the post-settlement revision and the gesture posture', !!openBody && openBody.sectionId === D2 && openBody.range?.start === addr.start && openBody.range?.end === addr.end && openBody.revisionNumber === v1 && openBody.sanctuary === false, JSON.stringify({ range: openBody?.range, revisionNumber: openBody?.revisionNumber, sanctuary: openBody?.sanctuary }));
      const turnBody = turn?.body ? JSON.parse(turn.body) : null;
      check('ON-8 exactly one discourse turn with the exact text under the withholding scope', !!turnBody && turnBody.act?.act === 'discourse' && turnBody.act?.text === ASK1 && turnBody.sanctuary === false && JSON.stringify(turnBody.scope) === JSON.stringify({ latitude: 1, mayRemoveParagraphs: false, mayProposeImmediately: false }) && since(tSubmit).filter((r) => /\/editorial\/turn/.test(r.u)).length === 1, JSON.stringify({ act: turnBody?.act?.act, exact: turnBody?.act?.text === ASK1, scope: turnBody?.scope }));
      const rows1 = await editorialRows();
      check('ON-9 one chain, one thread, one member turn, one MAIA reply, zero proposal versions', rows1.chains === 1 && rows1.threads === 1 && rows1.turns === 2 && rows1.maia === 1 && rows1.versions === 0, JSON.stringify(rows1));
      const saved = await sectionText(D2);
      check('ON-10 manuscript bytes are exactly the member’s own text', saved === `${H2}\n\n${B2} More.`, `exact=${saved === `${H2}\n\n${B2} More.`}`);
      const storedAsk = String((await q(`SELECT u.body FROM ask_turns u JOIN ask_threads t ON t.id = u.thread_id JOIN proposal_chains c ON c.id = t.proposal_chain_id WHERE c.work_id = $1 AND u.speaker = 'author' ORDER BY u.turn_index ASC LIMIT 1`, [WK]))[0]?.['body'] ?? '');
      check('R1-1 the stored author turn preserves the member’s exact bytes, edge whitespace included', storedAsk === ASK1 && JSON.stringify(storedAsk) !== JSON.stringify(ASK1.trim()), `stored=${JSON.stringify(storedAsk)}`);

      /* ── 5 presentation: Discuss only, exact ask, last MAIA turn ─────── */
      await page.screenshot({ path: join(OUT, `flag-on__2-answered.png`) });
      const panel = page.locator('[data-discuss="answered"]');
      const askShown = await panel.locator('.fs-ask').textContent();
      const said = (await panel.locator('.fs-say').first().textContent())?.trim() ?? '';
      const lastMaia = String((await q(`SELECT u.body FROM ask_turns u JOIN ask_threads t ON t.id = u.thread_id JOIN proposal_chains c ON c.id = t.proposal_chain_id WHERE c.work_id = $1 AND u.speaker = 'maia' ORDER BY u.turn_index DESC LIMIT 1`, [WK]))[0]?.['body'] ?? '');
      check('ON-11 the panel shows the exact ask and the last admitted MAIA turn (controlled reply, labelled)', askShown === ASK1 && said === lastMaia && said.startsWith(CONTROLLED_REPLY_HEAD), `askExact=${askShown === ASK1} replyIsLastAdmittedTurn=${said === lastMaia} controlled=${said.startsWith(CONTROLLED_REPLY_HEAD)}`);
      const tabs = await panel.locator('[role="tab"]').allTextContents();
      const html = await panel.innerHTML();
      check('ON-12 Discuss is the only tab; no Apply · Undo · Revise · Reason · Teach · coverage · composer', tabs.length === 1 && tabs[0] === 'Discuss' && !/APPLY|UNDO|Revise|Reason|Teach|data-coverage|What I notice|fs-alts|<textarea|SUBMIT_ASK/.test(html), `tabs=${JSON.stringify(tabs)}`);
      const box0 = await page.locator(`[data-authored-body="${D2}"]`).boundingBox();
      const geo = async () => page.evaluate(() => ['.fs-bar', '.fs-bar .fs-btn', '.fs-crumb', '.fs-saved', '.fs-stage', 'article[data-manuscript]'].map((sel) => {
        const b = document.querySelector(sel)?.getBoundingClientRect();
        return b ? `${sel}:${b.top.toFixed(1)}/${b.height.toFixed(1)}` : `${sel}:none`;
      }).concat([`scrollY:${window.scrollY}`]).join(' '));
      const geo0 = await geo();

      /* ── 6 release after: position unchanged, no cancellation claim ───── */
      await panel.locator('[data-event="RELEASE"]').click();
      await page.waitForTimeout(200);
      const box1 = await page.locator(`[data-authored-body="${D2}"]`).boundingBox();
      const page1 = await page.content();
      check('ON-13 Release hides the panel, the manuscript does not move, nothing claims cancellation', (await page.locator('.fs-maia').count()) === 0 && !!box0 && !!box1 && Math.abs(box0.y - box1.y) < 1 && Math.abs(box0.x - box1.x) < 1 && !/cancel/i.test(page1), `fs-maia=0 dy=${box0 && box1 ? box1.y - box0.y : 'n/a'} cancel=${/cancel/i.test(page1)}\n        before ${geo0}\n        after  ${await geo()}`);
      check('ON-14 the held passage survives Release', (await page.locator(`[data-held-passage-address]`).count()) === 1 && (await page.locator('[data-event="ASK_MAIA"]').count()) === 1, 'held=1 ASK_MAIA=1');

      /* ── 7 late result: move sections before completion ─────────────── */
      await ask(page, ASK_SLOW);
      const tSlow = Date.now();
      await page.locator('[data-event="SUBMIT_ASK"]').click();
      await page.waitForSelector('[data-discuss="pending"]', { timeout: 10_000 });
      await page.locator(`[data-authored-body="${D1}"]`).click();
      await page.waitForTimeout(300);
      const pendingGoneOnMove = (await page.locator('.fs-maia').count()) === 0;
      await page.waitForTimeout(5500);
      const rows2 = await editorialRows();
      const turnSlow = since(tSlow).filter((r) => /\/editorial\/turn/.test(r.u)).length;
      check('ON-15 moving sections before completion: server act finished on its thread, nothing attached, panel not reopened', pendingGoneOnMove && (await page.locator('.fs-maia').count()) === 0 && rows2.chains === 2 && rows2.maia === 2 && turnSlow === 1, `hiddenOnMove=${pendingGoneOnMove} fs-maia=0 chains=${rows2.chains} maiaTurns=${rows2.maia} turnPosts=${turnSlow}`);
      await page.locator(`[data-authored-body="${D2}"]`).click();
      await page.waitForTimeout(300);
      check('ON-16 returning to the section does not resurrect the late result', (await page.locator('.fs-maia').count()) === 0, 'fs-maia=0');

      /* ── 7b R1-2 · a nominally successful turn carrying proposal material ─
         ⚠️ CONTROLLED RESPONSE MUTATION AT THE WIRE: the real server answered
         (no version row exists); the browser's view of that one POST response
         is rewritten to carry `version:{id}` so the HOST's fail-closed backstop
         is what is exercised. Labelled, one request, then removed. */
      await page.evaluate(({ id }) => (document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement | null)?.blur(), { id: D2 });
      await selectPassage(page);
      await ask(page, ASK_PROPOSAL);
      let mutated = 0;
      await page.route('**/api/writers-studio/editorial/turn', async (route) => {
        const res = await route.fetch();
        const json = await res.json().catch(() => null);
        if (res.ok() && json && mutated === 0) {
          mutated += 1;
          await route.fulfill({ response: res, json: { ...json, version: { id: 'v-controlled-witness' } } });
          return;
        }
        await route.fulfill({ response: res });
      });
      const tProp = Date.now();
      await page.locator('[data-event="SUBMIT_ASK"]').click();
      await page.waitForSelector('[data-discuss="refused"], [data-discuss="answered"]', { timeout: 60_000 });
      await page.unroute('**/api/writers-studio/editorial/turn');
      const propState = await page.locator('.fs-maia').getAttribute('data-discuss');
      const propHtml = await page.locator('.fs-maia').innerHTML();
      const propRows = await editorialRows();
      const propRoutes = since(tProp).filter((r) => /version|adoption|undo/.test(r.u)).length;
      check('R1-2 a turn that returns proposal material is refused by the host: no reply, no wording, no version route, calm copy', mutated === 1 && propState === 'refused' && /proposed wording, which this conversation doesn’t take/.test(propHtml) && !/Controlled witness reply|v-controlled-witness|APPLY/.test(propHtml) && propRoutes === 0 && propRows.versions === 0, `mutated=${mutated} state=${propState} versionRoutes=${propRoutes} dbVersions=${propRows.versions}`);
      await page.locator('.fs-maia [data-event="RELEASE"]').click();

      /* ── 7c R1-3 · slow response from passage A, passage B held in the SAME section ── */
      await selectPassage(page);
      await ask(page, ASK_SLOW_B);
      const tSlowB = Date.now();
      const rowsBefore = await editorialRows();
      await page.locator('[data-event="SUBMIT_ASK"]').click();
      await page.waitForSelector('[data-discuss="pending"]', { timeout: 10_000 });
      await page.locator(`[data-authored-body="${D2}"]`).click();
      await page.waitForSelector(`textarea[data-authored-body="${D2}"]`, { timeout: 10_000 });
      const addrB = await page.evaluate(({ id, sel }) => {
        const el = document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement;
        const start = el.value.indexOf(sel); el.setSelectionRange(start, start + sel.length);
        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Shift' })); el.blur();
        return `${[...el.value.slice(0, start)].length}:${[...el.value.slice(0, start + sel.length)].length}`;
      }, { id: D2, sel: SEL_B });
      await page.waitForTimeout(300);
      const hiddenOnB = (await page.locator('.fs-maia').count()) === 0;
      const heldB = await page.locator('[data-held-passage-address]').first().getAttribute('data-held-passage-address');
      const askOnB = await page.locator('[data-event="ASK_MAIA"]').count();
      await page.waitForTimeout(5500);
      const rowsAfter = await editorialRows();
      const stillHidden = (await page.locator('.fs-maia').count()) === 0;
      /* re-hold passage A: the finished A response must not be resurrected */
      await selectPassage(page);
      await page.waitForTimeout(300);
      const notResurrected = (await page.locator('.fs-maia').count()) === 0;
      check('R1-3 passage B held in the same section while A is pending: hidden, generation advanced, A finished on its thread, never attached, never resurrected', hiddenOnB && heldB === addrB && heldB !== '21:29' && askOnB === 1 && stillHidden && rowsAfter.maia === rowsBefore.maia + 1 && since(tSlowB).filter((r) => /\/editorial\/turn/.test(r.u)).length === 1 && notResurrected, `hiddenOnB=${hiddenOnB} heldB=${heldB} (measured ${addrB}) askOnB=${askOnB} stillHidden=${stillHidden} maiaTurns ${rowsBefore.maia}→${rowsAfter.maia} resurrected=${!notResurrected}`);
      await page.evaluate(({ id }) => (document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement | null)?.blur(), { id: D2 });

      /* ── 8 changed passage after an answered response ───────────────── */
      await page.evaluate(({ id }) => (document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement)?.blur(), { id: D2 });
      await selectPassage(page);
      await ask(page, ASK2);
      const tEdit0 = Date.now();
      await page.locator('[data-event="SUBMIT_ASK"]').click();
      await page.waitForSelector('[data-discuss="answered"]', { timeout: 60_000 });
      const attachedBefore = (await page.locator('[data-discuss="answered"] [data-stale-context]').count()) === 0;
      const vEdit0 = await version();
      await page.waitForTimeout(300);
      const tAnswered = Date.now();
      await page.locator(`[data-authored-body="${D2}"]`).click();
      await page.waitForSelector(`textarea[data-authored-body="${D2}"]`, { timeout: 10_000 });
      await page.evaluate(({ id, sel }) => {
        const el = document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement;
        const s = el.value.indexOf(sel); el.setSelectionRange(s, s + sel.length);
      }, { id: D2, sel: SEL });
      await page.keyboard.type('near bank', { delay: 10 });
      await page.evaluate(({ id }) => (document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement).blur(), { id: D2 });
      await page.waitForSelector('[data-discuss="answered-stale"]', { timeout: 10_000 }).catch(() => {});
      await page.screenshot({ path: join(OUT, `flag-on__3-stale.png`) });
      const staleHtml = await page.locator('.fs-maia').innerHTML().catch(() => '');
      /* The gesture itself lawfully makes 2 POSTs + the helpers' 2 GET re-reads of the thread; AFTER the answer nothing editorial may fire. */
      const gesturePosts = since(tEdit0).filter((r) => r.m === 'POST' && /\/editorial\//.test(r.u) && r.t < tAnswered).length;
      const editorialAfterEdit = since(tAnswered).filter((r) => /\/editorial\//.test(r.u)).length;
      check('ON-17 editing the locus: stale disclosure, no highlight, no re-anchor, no re-read', attachedBefore && /data-stale-context="true"/.test(staleHtml) && /before your latest edit\. Your writing has not been changed\./.test(staleHtml) && (await page.locator(`[data-held-passage-address]`).count()) === 0 && gesturePosts === 2 && editorialAfterEdit === 0, `attachedBefore=${attachedBefore} stale=${/data-stale-context="true"/.test(staleHtml)} heldAddresses=${await page.locator(`[data-held-passage-address]`).count()} gesturePosts=${gesturePosts} editorialRequestsAfterAnswer=${editorialAfterEdit}`);
      { const dl = Date.now() + 8000; while (Date.now() < dl && (await version()) <= vEdit0) await page.waitForTimeout(200); }
      const savedEdited = await sectionText(D2);
      check('ON-18 the edit itself saved through the existing path; the thread did not touch it', /near bank/.test(savedEdited) && (await editorialRows()).versions === 0, `saved=${/near bank/.test(savedEdited)} versions=0`);
      await page.locator('.fs-maia [data-event="RELEASE"]').click();

      /* ── 9 duplicate submit ──────────────────────────────────────────── */
      await page.evaluate(({ id }) => { const el = document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement | null; el?.blur(); }, { id: D2 });
      await page.locator(`[data-authored-body="${D2}"]`).click();
      await page.waitForSelector(`textarea[data-authored-body="${D2}"]`, { timeout: 10_000 });
      const addr2 = await page.evaluate(({ id, sel }) => {
        const el = document.querySelector(`textarea[data-authored-body="${id}"]`) as HTMLTextAreaElement;
        const start = el.value.indexOf(sel); const end = start + sel.length;
        el.setSelectionRange(start, end); el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Shift' }));
        el.blur(); return { start, end };
      }, { id: D2, sel: 'near bank' });
      await page.waitForSelector('[data-event="ASK_MAIA"]', { timeout: 10_000 });
      await ask(page, ASK3);
      const tDup = Date.now();
      await page.evaluate(() => { const f = document.querySelector('form.fs-mcompose') as HTMLFormElement; f.requestSubmit(); f.requestSubmit(); });
      await page.waitForSelector('[data-discuss="answered"]', { timeout: 60_000 });
      const dupOpens = since(tDup).filter((r) => /rebuild\/editorial\/thread/.test(r.u)).length;
      const dupTurns = since(tDup).filter((r) => /\/editorial\/turn/.test(r.u)).length;
      const rows3 = await editorialRows();
      check('ON-19 two synchronous submits → one open, one turn, one new chain', dupOpens === 1 && dupTurns === 1 && rows3.chains === 6 && rows3.maia === 6 && addr2.start >= 0, `opens=${dupOpens} turns=${dupTurns} chains=${rows3.chains} maiaTurns=${rows3.maia}`);
      await page.locator('.fs-maia [data-event="RELEASE"]').click();

      /* ── 10 posture at the gesture: Sanctuary, then unresolved ───────── */
      await page.evaluate(() => localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: true })));
      await ask(page, 'A question under Sanctuary.');
      const tS = Date.now();
      await page.locator('[data-event="SUBMIT_ASK"]').click();
      await page.waitForSelector('[data-discuss="refused"]', { timeout: 10_000 });
      const sCopy = (await page.locator('[data-discuss="refused"] .fs-say').textContent())?.trim() ?? '';
      check('ON-20 Sanctuary at the gesture: refused locally, no POST, copy names what was not stored', /Sanctuary/.test(sCopy) && /nothing was sent/.test(sCopy) && since(tS).filter((r) => /\/editorial\//.test(r.u)).length === 0 && (await editorialRows()).chains === 6, `copy="${sCopy.slice(0, 40)}…" posts=0 chains=6`);
      await page.locator('.fs-maia [data-event="RELEASE"]').click();
      await page.evaluate(() => localStorage.removeItem('maia_settings'));
      await ask(page, 'A question with no live posture.');
      const tU = Date.now();
      await page.locator('[data-event="SUBMIT_ASK"]').click();
      await page.waitForSelector('[data-discuss="refused"]', { timeout: 10_000 });
      const uCopy = (await page.locator('[data-discuss="refused"] .fs-say').textContent())?.trim() ?? '';
      check('ON-21 unresolved posture at the gesture: refused locally, no POST', /can’t tell whether this session is in Sanctuary/.test(uCopy) && since(tU).filter((r) => /\/editorial\//.test(r.u)).length === 0, `copy="${uCopy.slice(0, 40)}…" posts=0`);
      await page.evaluate(() => localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false })));
      await page.locator('.fs-maia [data-event="RELEASE"]').click();

      /* ── 11 mobile capture of an answered panel (sheet) ──────────────── */
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(300);
      await selectPassage(page);
      await page.waitForSelector('[data-event="ASK_MAIA"]', { timeout: 10_000 });
      await ask(page, 'On a phone: why this sentence?');
      await page.locator('[data-event="SUBMIT_ASK"]').click();
      await page.waitForSelector('[data-discuss="answered"]', { timeout: 60_000 });
      await page.screenshot({ path: join(OUT, `flag-on__4-mobile-390.png`) });
      const echo = await page.locator('.fs-heldquote').isVisible();
      check('ON-22 on a phone the sheet carries the held passage', echo, `heldEchoVisible=${echo}`);
      const final = await editorialRows();
      check('ON-23 final: every act one chain · one thread · two turns; zero proposal versions anywhere', final.chains === 7 && final.threads === 7 && final.turns === 14 && final.maia === 7 && final.versions === 0, JSON.stringify(final));
      const posts = editorialReqs().filter((r) => r.m === 'POST');
      const gets = editorialReqs().filter((r) => r.m === 'GET');
      check('ON-24 only thread-open and turn were ever POSTed; the only GETs are the helpers’ thread reads', posts.every((r) => /rebuild\/editorial\/thread|\/editorial\/turn/.test(r.u)) && gets.every((r) => /\/editorial\/thread\?threadId=/.test(r.u)) && !editorialReqs().some((r) => /version|adoption|undo|focus/.test(r.u)), `posts=${posts.length} threadReads=${gets.length}`);
    }
  } finally {
    await browser.close();
    await cleanup();
    await pg.end();
  }
  console.log(`\n  ${pass} passed · ${fail} failed · flag=${FLAG} · screenshots ${OUT}\n`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await cleanup().catch(() => {}); await pg.end().catch(() => {}); process.exit(2); });
