/**
 * WS-EDITORIAL-UI-01A · MOUNT + THREAD IDENTITY CUSTODY — in a real browser.
 *
 * The founder's acceptance sequence, executed literally rather than simulated:
 *
 *     select a section → click Conversations
 *     → the URL receives the exact editorialThread
 *     → the visible locus is the selected passage
 *     → "Could you make this quieter?"
 *     → You + MAIA visibly persist
 *     → explicitly mark a Direction
 *     → MAIA's candidate appears as MAIA's, not applied
 *     → close the panel → reopen  → the same four turns
 *     → RELOAD THE BROWSER       → the same four turns
 *
 * ⭐⭐ THE RELOAD IS THE WHOLE POINT. UI-01's witness kept the thread id in a
 * variable and re-read it; that proves a KNOWN thread can be reread. A browser
 * reload destroys every component, every closure and every module instance in
 * the page. What survives is the address bar and the database — which is
 * exactly the division of responsibility this act exists to establish.
 *
 * Then the same room is booted a second time WITHOUT the server flag, and the
 * legacy conversation must still be there. A feature that is off must leave the
 * room it was not yet mounted in exactly as it found it.
 *
 * ⛔ DISPOSABLE DATABASES ONLY (the name must contain `witness`).
 * ⛔ The provider is substituted AT THE WIRE only — `ANTHROPIC_BASE_URL` to a
 *    loopback stub, downstream of prompt assembly. No injection point exists in
 *    the application and none is added here.
 */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { Client } from 'pg';
import { chromium, type Browser, type Page } from 'playwright-core';

const DSN = process.env.DATABASE_URL!;
const SHOTS = process.env.WITNESS_SHOTS ?? '/tmp/ui-01a-shots';
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

const model = 'claude-opus-5';
let reply: unknown = null;
const toolReply = (input: unknown) => ({
  id: 'm', type: 'message', role: 'assistant', model,
  content: [{ type: 'tool_use', id: 't', name: 'editorial_outcome', input }],
  stop_reason: 'tool_use', usage: { input_tokens: 9, output_tokens: 5 },
});

let pg: Client; let next: ChildProcess | null = null; let stub: Server | null = null;
let browser: Browser | null = null;
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p as unknown[])).rows as any[];
const one = async (s: string, p: unknown[] = []) => (await q(s, p))[0];

const SECTION_TEXT = 'Before the water, there was a sound.';
const WORDS = 'Could you make this quieter?';
const DIRECTION = 'Cut the first clause and keep the sound.';
const MAIA_REPLY = 'It is already quite still. What feels loud to you?';
const CANDIDATE = 'There was a sound.';

/* ── the room, booted with or without the flag ─────────────────────────── */
async function boot(port: number, editorial: boolean, stubPort: number) {
  const env: NodeJS.ProcessEnv = {
    ...process.env, DATABASE_URL: DSN, MAIA_INFERENCE_MODE: 'primary',
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${stubPort}`,
    ANTHROPIC_API_KEY: 'sk-witness-not-a-real-key', MAIA_EDITORIAL_MODEL: model,
  };
  /* ⛔ Not set to '0' — ABSENT, which is what production looks like today. */
  if (editorial) env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  else delete env.WRITERS_STUDIO_EDITORIAL_ENABLED;

  next = spawn('node_modules/.bin/next', ['dev', '-p', String(port)], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: true, env,
  });
  const deadline = Date.now() + 240_000;
  for (;;) {
    try { const r = await fetch(`http://127.0.0.1:${port}/api/health`); if (r.status < 500) break; } catch { /* not up */ }
    if (Date.now() > deadline) { console.log('  ⛔ NOT RUN — next dev did not become ready'); await teardown(); process.exit(2); }
    await new Promise((r) => setTimeout(r, 1500));
  }
}
function killNext() {
  if (!next?.pid) return;
  /* Next forks its own server; killing the immediate child leaves it spinning.
     The whole process GROUP goes, which is why it was spawned detached. */
  try { process.kill(-next.pid, 'SIGKILL'); } catch { /* already gone */ }
  next = null;
}
async function teardown() {
  await browser?.close().catch(() => {}); browser = null;
  killNext();
  stub?.close(); stub = null;
  await pg?.end().catch(() => {});
}

const settle = (page: Page) => page.waitForTimeout(700);
const shot = (page: Page, name: string) =>
  page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false }).catch(() => {});

/**
 * What the conversation panel currently shows, as the member would read it.
 *
 * ⚠️ UPPERCASED, because the `panelLabel` type role uppercases in CSS and
 * `innerText` returns the RENDERED text. A first run asserted `startsWith('You')`
 * against a panel correctly displaying `YOU` and reported the writer's own words
 * as missing — an instrument reading its own source rather than the screen.
 * `MAIA` passed by luck, which is what made the failure look like a product
 * defect on one side of the conversation only.
 */
async function transcript(page: Page): Promise<string[]> {
  return page.locator('section[aria-label="Editorial conversation"] article')
    .allInnerTexts().then((t) => t.map((s) => s.replace(/\s+/g, ' ').trim().toUpperCase()));
}
const U = (s: string) => s.toUpperCase();

async function main() {
  mkdirSync(SHOTS, { recursive: true });
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const dbn = (await one('SELECT current_database() d')).d as string;
  if (!dbn.includes('witness')) { console.log(`REFUSED · '${dbn}' is not a witness database.`); process.exit(2); }
  if (Number((await one('SELECT (SELECT count(*) FROM proposal_chains)+(SELECT count(*) FROM ask_threads) n')).n) !== 0) {
    console.log('  ⛔ REFUSED — dirty. Rebuild first.'); process.exit(2);
  }

  stub = createServer((req, res) => {
    let raw = ''; req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(reply));
    });
  });
  await new Promise<void>((r) => stub!.listen(0, '127.0.0.1', () => r()));
  const stubPort = (stub!.address() as AddressInfo).port;

  /* ── a member with a Work, a manuscript, and one addressable section ──── */
  const M = randomUUID(), LW = randomUUID(), WK = randomUUID();
  const DR = randomUUID(), SRC = randomUUID(), SE = randomUUID();
  const TOKEN = `witness-${randomUUID()}`;
  await q(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,'UI1A','ui_1a','x','Witness')`, [M]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'The Sound Before Water')`, [LW, M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
           VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The Sound Before Water')`, [WK, M]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,1,'One',$3)`, [SRC, WK, SECTION_TEXT]);
  /* ⭐ ORDER MATTERS, AND THE DATABASE SAYS SO. A section-addressable draft's
     content must equal the flattening of its sections, so the draft is created
     plain, the section is written, and only then is it declared addressable. */
  await q(`INSERT INTO manuscript_working_drafts
             (id,manuscript_id,member_id,content,base_source_hash,revision_count)
           VALUES ($1,$2,$3,$4,'sha-ui1a',3)`, [DR, WK, M, SECTION_TEXT]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,1,$3,$4)`, [SE, DR, SECTION_TEXT, SRC]);
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at = NOW() WHERE id = $1`, [DR]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' WS-EDITORIAL-UI-01A · MOUNT + THREAD IDENTITY CUSTODY (browser)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const PORT = 3414;
  await boot(PORT, true, stubPort);
  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const page = await ctx.newPage();
  const ROOM = `http://127.0.0.1:${PORT}/writers-studio/canvas?m=${WK}`;

  /* ══ ARRIVE ═══════════════════════════════════════════════════════════ */
  console.log('── the room, with a passage open ─────────────────────────────────');
  await page.goto(ROOM, { waitUntil: 'domcontentloaded', timeout: 240_000 });
  /* ⚠️ THE READINESS SIGNAL IS THE PASSAGE, NOT THE RAIL. A first run waited
     for the word "Conversations", screenshotted a shell whose Work had not
     resolved yet, and reported the room as drawing nothing. The rail is
     painted before the member's material arrives; waiting on it is waiting on
     the building rather than on the writing. */
  await page.waitForSelector(`text=${SECTION_TEXT}`, { timeout: 240_000 });
  await settle(page);
  await shot(page, '01-room');
  eq('A1 the room draws the writer’s own passage',
     await page.locator(`text=${SECTION_TEXT}`).count() > 0, true);
  eq('A2 ⛔ no editorial thread is addressed before the member asks',
     new URL(page.url()).searchParams.get('editorialThread'), null);
  eq('A3 ⛔ and none was created merely by rendering the room',
     Number((await one('SELECT count(*) n FROM ask_threads')).n), 0);

  /* ══ THE GESTURE ══════════════════════════════════════════════════════ */
  console.log('\n── the member asks for a conversation ────────────────────────────');
  await page.getByText('Conversations', { exact: true }).first().click();
  await page.waitForFunction(
    () => new URL(window.location.href).searchParams.get('editorialThread') !== null,
    undefined, { timeout: 60_000 },
  ).catch(() => {});
  const addressed = new URL(page.url()).searchParams.get('editorialThread');
  const row = await one('SELECT id, proposal_chain_id c, anchor FROM ask_threads');
  /* ⚠️ THE PRESENCE CHECK IS NOT DECORATION. Written as an identity comparison
     alone, this obligation PASSED on a run where the gesture had opened
     nothing at all: null equalled null and the instrument called it a match.
     An identity assertion whose both sides can be absent asserts nothing. */
  eq('G0 a relationship was actually opened',
     typeof row?.id === 'string' && typeof addressed === 'string', true);
  eq('G1 ⭐ the URL receives the EXACT thread the server made',
     addressed, row?.id ?? null);
  eq('G2 ⭐ and it is an EDITORIAL thread — anchor NULL, chain set',
     `${row?.anchor}/${row?.c !== null}`, 'null/true');
  eq('G3 ⛔ exactly one relationship exists, not one per render',
     Number((await one('SELECT count(*) n FROM ask_threads')).n), 1);
  eq('G4 the manuscript identity is still in the address beside it',
     new URL(page.url()).searchParams.get('m'), WK);
  await page.waitForSelector('section[aria-label="Editorial conversation"]', { timeout: 60_000 });
  await settle(page); await shot(page, '02-opened');
  eq('G5 ⭐ the VISIBLE locus is the passage the writer selected',
     (await page.locator('section[aria-label="Editorial conversation"] blockquote').innerText()).trim(),
     SECTION_TEXT);

  /* ══ SPEAK ════════════════════════════════════════════════════════════ */
  console.log('\n── the writer speaks, MAIA answers ───────────────────────────────');
  reply = toolReply({ kind: 'reply_only', reply: MAIA_REPLY });
  const composer = page.getByLabel('Say something about this passage');
  await composer.fill(WORDS);
  await composer.press('Enter');
  await page.waitForFunction(
    (m) => document.body.innerText.includes(m), MAIA_REPLY, { timeout: 120_000 },
  ).catch(() => {});
  await settle(page); await shot(page, '03-spoken');
  let seen = await transcript(page);
  eq('S1 the writer’s words are visible, attributed to them',
     seen.some((t) => t.startsWith('YOU') && t.includes(U(WORDS))), true);
  eq('S2 ⭐ MAIA’s answer is visible, attributed to MAIA',
     seen.some((t) => t.startsWith('MAIA') && t.includes(U(MAIA_REPLY))), true);
  eq('S3 ⛔ an ordinary reply is NOT dressed as a Direction',
     seen.some((t) => t.includes(U('said as a Direction'))), false);

  /* ══ DIRECT ═══════════════════════════════════════════════════════════ */
  console.log('\n── the writer marks a Direction, explicitly ──────────────────────');
  /* ⚠️ A FIRST RUN SENT `kind: 'version_offer'`, WHICH THE CONTRACT DOES NOT
     DECLARE — my error, not the product's. What the room did with it is worth
     keeping: it refused the envelope, PERSISTED the member's Direction anyway,
     and told the writer "Your words are saved. MAIA could not answer this
     time." The honest-failure path was witnessed before it was asked for. */
  reply = toolReply({
    kind: 'reply_with_proposal', reply: 'Here it is with the first clause gone.',
    proposal: { replacementText: CANDIDATE },
  });
  await page.getByLabel('Say this as a Direction').check();
  eq('D1 ⭐⭐ the act is DECLARED by the member, not read off their prose',
     await page.getByLabel('Say this as a Direction').isChecked(), true);
  await composer.fill(DIRECTION);
  await composer.press('Enter');
  await page.waitForFunction(
    (c) => document.body.innerText.includes(c), CANDIDATE, { timeout: 120_000 },
  ).catch(() => {});
  await settle(page); await shot(page, '04-directed');
  seen = await transcript(page);
  eq('D2 the Direction is shown AS a Direction',
     seen.some((t) => t.includes(U(DIRECTION)) && t.includes(U('said as a Direction'))), true);
  eq('D3 ⭐ MAIA’s candidate is visible AS MAIA’s, and as NOT applied',
     seen.some((t) => t.includes(U(CANDIDATE)) && t.includes(U('offered, not applied'))), true);
  eq('D4 ⛔ AND THE WORK IS UNTOUCHED — the passage still reads as the writer wrote it',
     (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [SE]))?.text,
     SECTION_TEXT);
  eq('D5 the checkbox does not stay armed after the act is spent',
     await page.getByLabel('Say this as a Direction').isChecked(), false);
  const four = seen.length;
  eq('D6 four turns stand in the conversation', four, 4);

  /* ══ CLOSE · REOPEN ═══════════════════════════════════════════════════ */
  console.log('\n── close the panel, and call her forward again ───────────────────');
  await page.getByLabel('Put MAIA away').click();
  await settle(page);
  eq('C1 the panel is gone',
     await page.locator('section[aria-label="Editorial conversation"]').count(), 0);
  eq('C2 ⭐ and the address STILL names the conversation',
     new URL(page.url()).searchParams.get('editorialThread'), addressed);
  await page.getByText('Conversations', { exact: true }).first().click();
  await page.waitForSelector('section[aria-label="Editorial conversation"]', { timeout: 60_000 });
  await settle(page); await shot(page, '05-reopened');
  eq('C3 ⭐ the same four turns are there', (await transcript(page)).length, four);
  eq('C4 ⛔ AND REOPENING CREATED NOTHING — still one relationship',
     Number((await one('SELECT count(*) n FROM ask_threads')).n), 1);

  /* ══ RELOAD ═══════════════════════════════════════════════════════════
     ⭐⭐ The decisive leg. Every component, closure and module instance in
     the page is destroyed. Only the address bar and the database survive. */
  console.log('\n── reload the browser ────────────────────────────────────────────');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 240_000 });
  await page.waitForSelector(`text=${SECTION_TEXT}`, { timeout: 240_000 });
  await page.getByText('Conversations', { exact: true }).first().click();
  await page.waitForSelector('section[aria-label="Editorial conversation"]', { timeout: 120_000 });
  await page.waitForFunction((c) => document.body.innerText.includes(c), CANDIDATE, { timeout: 60_000 })
    .catch(() => {});
  await settle(page); await shot(page, '06-after-reload');
  const after = await transcript(page);
  eq('R1 ⭐⭐ THE SAME FOUR TURNS SURVIVE A BROWSER RELOAD', after.length, four);
  eq('R2 ⭐ with authorship intact',
     after.filter((t) => t.startsWith('YOU')).length === 2
     && after.filter((t) => t.startsWith('MAIA')).length === 2, true);
  eq('R3 ⭐⭐ and the reload did NOT open a second relationship',
     Number((await one('SELECT count(*) n FROM ask_threads')).n), 1);
  eq('R4 the address is unchanged',
     new URL(page.url()).searchParams.get('editorialThread'), addressed);

  /* ══ A FOREIGN ADDRESS IS NOT AUTHORITY ═══════════════════════════════ */
  console.log('\n── the address is an address, never a credential ─────────────────');
  const M2 = randomUUID(), T2 = `witness-${randomUUID()}`;
  await q(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'UI1B','ui_1b','x')`, [M2]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M2, T2]);
  const ctx2 = await browser.newContext();
  await ctx2.addCookies([{ name: 'maia_session', value: T2, domain: '127.0.0.1', path: '/' }]);
  const intruder = await ctx2.newPage();
  /* A page at about:blank has no origin, so its fetch is cross-origin and dies
     before reaching the server. The intruder must be IN the room to be refused
     BY it — which is also the honest shape of the attack. */
  await intruder.goto(`http://127.0.0.1:${PORT}/api/health`, { timeout: 120_000 });
  const probe = await intruder.evaluate(async (u) => {
    const r = await fetch(u); return r.status;
  }, `http://127.0.0.1:${PORT}/api/writers-studio/editorial/thread?threadId=${addressed}`);
  eq('X1 ⭐ another member holding the exact address gets 404, not a redaction', probe, 404);
  await ctx2.close();

  /* ══ THE FLAG OFF ═════════════════════════════════════════════════════ */
  console.log('\n── the same room, with the server flag absent ────────────────────');
  await browser.close(); browser = null;
  killNext();
  const PORT2 = 3415;
  await boot(PORT2, false, stubPort);
  browser = await chromium.launch();
  const ctx3 = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx3.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const off = await ctx3.newPage();
  /* Carrying the address deliberately: even ADDRESSED, the room must not
     mount a surface whose seam is closed. */
  await off.goto(`http://127.0.0.1:${PORT2}/writers-studio/canvas?m=${WK}&editorialThread=${addressed}`,
                 { waitUntil: 'domcontentloaded', timeout: 240_000 });
  await off.waitForSelector(`text=${SECTION_TEXT}`, { timeout: 240_000 });
  await off.getByText('Conversations', { exact: true }).first().click();
  await settle(off); await settle(off); await shot(off, '07-flag-off');
  eq('F1 ⛔ the editorial surface is NOT mounted',
     await off.locator('section[aria-label="Editorial conversation"]').count(), 0);
  /* ⚠️ A FIRST RUN ACCEPTED `text=MAIA`, WHICH THE PANEL HEADER SATISFIES IN
     ANY ROOM. That obligation asserted the REGION was present, not that the
     legacy conversation was available — and the screenshot showed it still
     reading "opening…". The legacy surface is now waited for and identified by
     its own markers. */
  await off.waitForSelector('[data-studio-conversation]', { timeout: 120_000 })
    .catch(() => {});
  await shot(off, '08-flag-off-settled');
  eq('F2 ⭐ the legacy conversation is still there, and it is the legacy one',
     await off.locator('[data-studio-conversation]').count() === 1
     && await off.getByLabel('Message MAIA').count() === 1, true);
  eq('F3 ⛔ and the closed room created nothing',
     Number((await one('SELECT count(*) n FROM ask_threads')).n), 1);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  console.log(`  screenshots: ${SHOTS}`);
}

main()
  .then(async () => { await teardown(); process.exit(fail === 0 ? 0 : 1); })
  .catch(async (e) => { console.error('\n  ⛔ NOT RUN —', e?.message ?? e); await teardown(); process.exit(2); });
