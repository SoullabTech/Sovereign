/**
 * THE WRITER'S STUDIO EDITORIAL SURFACE — the whole member sequence, in a real
 * browser. UI-01A (mount + thread identity custody) · UI-01B (panel
 * composition) · UI-02 (the member's own formulation).
 *
 * ⭐ ONE witness rather than three, because the later acts are only meaningful
 * ON a conversation the earlier ones established: a composer witness that seeded
 * its own chain would be proving something about a fixture.
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
const MY_WORDING = 'There was only the sound, and then the water.';
const MY_DRAFT = 'A draft the writer is still in the middle of.';
const THIRD = 'A third formulation, authored elsewhere.';

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

  /* ══ WS-EDITORIAL-UI-01B · PANEL COMPOSITION ══════════════════════════
     A panel is chrome around content. StudioPanel's contract owns the band
     label, whether the panel is dismissible, and the dismiss control — so the
     editorial content carries no title bar and no exit of its own. */
  console.log('\n── one header, one close, one conversation ───────────────────────');
  const panel = page.locator('[data-panel-role="maia"]');
  eq('P1 ⭐ EXACTLY ONE dismiss control in the conversation region',
     await panel.getByRole('button', { name: /dismiss|close|put .* away/i }).count(), 1);
  eq('P2 ⭐ and it is the PANEL’s, not the content’s',
     await page.getByLabel('Dismiss MAIA · conversation').count(), 1);
  eq('P3 ⛔ the editorial content declares no header of its own',
     await page.locator('section[aria-label="Editorial conversation"] header').count(), 0);
  eq('P4 ⭐ “This passage” still orients the member to what this is ABOUT',
     (await panel.innerText()).toUpperCase().includes('THIS PASSAGE'), true);
  eq('P5 ⭐ and the locus wording is unchanged',
     (await page.locator('section[aria-label="Editorial conversation"] blockquote').innerText()).trim(),
     SECTION_TEXT);
  eq('P6 ⛔ the turns are untouched by the composition change', (await transcript(page)).length, 4);
  await shot(page, '04b-composition');

  /* ══ CLOSE · REOPEN ═══════════════════════════════════════════════════ */
  console.log('\n── close the panel, and call her forward again ───────────────────');
  /* ⭐ WS-EDITORIAL-UI-01B — putting her away is the PANEL's ×, and there is
     no longer any other exit gesture to choose between. */
  await page.getByLabel('Dismiss MAIA · conversation').click();
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

  /* ══ WS-EDITORIAL-UI-02 · THE WRITER ANSWERS IN WORDING ═══════════════ */
  console.log('\n── the writer authors their own formulation ──────────────────────');
  const lineage = () => page.locator('section[aria-label="Wording in this exchange"] [data-version]');
  /* ⚠️ ORDER BY id WAS WRONG, AND IT PASSED BY LUCK. `id` is a UUID, so
     `ORDER BY id` is arbitrary: `rows[length-1]` is not the newest row and
     `slice(-1)` is not the head. The UI-02 run's B11 happened to land the right
     row and reported green on an assertion that had no basis. Ordered by
     `authored_at` now — and where the HEAD is what matters, it is derived from
     succession rather than from any ordering at all. */
  const vRows = async () => (await q(
    `SELECT id, author, formulation, supersedes FROM proposal_versions
      WHERE chain_id = (SELECT proposal_chain_id FROM ask_threads WHERE id=$1)
      ORDER BY authored_at, id`, [addressed]));
  /* ⭐ THE HEAD IS A SUCCESSION FACT: the version nothing supersedes. */
  const headOf = (rows: { id: string; supersedes: string | null }[]) => {
    const superseded = new Set(rows.map((r) => r.supersedes).filter(Boolean));
    return rows.find((r) => !superseded.has(r.id)) ?? null;
  };
  const turnCount = async () =>
    Number((await one('SELECT count(*) n FROM ask_turns WHERE thread_id=$1', [addressed])).n);

  await page.waitForSelector('section[aria-label="Wording in this exchange"]', { timeout: 60_000 });
  eq('V1 ⭐ MAIA’s formulation appears in the authored succession, not only in the talk',
     await lineage().count(), 1);
  const v1 = (await vRows())[0];
  eq('V2 and it is hers', `${v1?.author}/${v1?.supersedes}`, 'maia/null');
  const turnsBefore = await turnCount();

  await page.getByRole('button', { name: 'Write my version from this' }).first().click();
  await settle(page);
  const field = page.getByLabel('Write your version of this passage');
  eq('V3 ⭐⭐ THE FIELD IS EMPTY — her wording is never copied into "Your version"',
     await field.inputValue(), '');
  eq('V4 ⭐ and the predecessor is STATED before submission',
     (await page.locator('[data-composer-target]').innerText()).replace(/\s+/g, ' ').trim().toUpperCase(),
     'YOUR VERSION FOLLOWS: MAIA · VERSION 1');
  eq('V5 the target named is the version they clicked',
     await page.locator('[data-composer-target]').getAttribute('data-composer-target'), v1?.id ?? null);
  await shot(page, '09-composer-empty');

  await field.fill(MY_WORDING);
  await page.getByRole('button', { name: 'Add my version' }).click();
  await page.waitForFunction((w) => document.body.innerText.includes(w), MY_WORDING, { timeout: 60_000 })
    .catch(() => {});
  await settle(page); await shot(page, '10-my-version');

  const rows2 = await vRows();
  const mine = rows2.find((r) => r.author === 'member');
  eq('V6 ⭐ a member-authored version is durable', rows2.length, 2);
  eq('V7 ⭐⭐ authored BY the member, superseding EXACTLY what they answered',
     `${mine?.author}/${mine?.supersedes === v1?.id}`, 'member/true');
  eq('V8 ⭐ and their wording is byte-for-byte what they wrote',
     mine?.formulation, MY_WORDING);
  eq('V9 ⛔⛔ AND NO ask_turn WAS MANUFACTURED — a formulation is its own act',
     await turnCount(), turnsBefore);
  eq('V10 ⛔ no turn binding was invented for it',
     Number((await one('SELECT count(*) n FROM editorial_turn_bindings WHERE version_id=$1',
                       [mine?.id])).n), 0);
  eq('V11 ⛔ THE MANUSCRIPT IS UNTOUCHED',
     (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [SE]))?.text, SECTION_TEXT);
  eq('V12 ⛔ and no authorization was created',
     Number((await one('SELECT count(*) n FROM manuscript_revision_authorizations')).n), 0);
  const shown = (await lineage().allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim().toUpperCase());
  eq('V13 ⭐ the lineage reads MAIA · Version 1 → Your version · Version 2',
     shown.length === 2
     && shown[0]!.startsWith('MAIA · VERSION 1')
     && shown[1]!.startsWith('YOUR VERSION · VERSION 2'), true);
  eq('V14 ⭐ the composer closed on success', await field.count(), 0);
  eq('V15 ⭐ and nothing offers to adopt anything yet',
     (await page.locator('section[aria-label="Editorial conversation"]').innerText()).toUpperCase()
       .includes('NOTHING CHANGES UNTIL YOU EXPLICITLY ADOPT A VERSION'), true);

  console.log('\n── and it survives a reload ──────────────────────────────────────');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 240_000 });
  await page.waitForSelector(`text=${SECTION_TEXT}`, { timeout: 240_000 });
  await page.getByText('Conversations', { exact: true }).first().click();
  await page.waitForSelector('section[aria-label="Wording in this exchange"]', { timeout: 120_000 });
  await settle(page);
  eq('V16 ⭐ the authored succession survives a browser reload', await lineage().count(), 2);

  /* ══ THE RACE — the member side of ER-F4 ══════════════════════════════
     ⭐⭐ The composer target is frozen at the click. If the exchange moves
     while they write, their submission must still carry the predecessor they
     ANSWERED, and be truthfully refused. */
  console.log('\n── the exchange moves while the writer is writing ────────────────');
  await page.getByRole('button', { name: 'Write my version from this' }).nth(1).click();
  await settle(page);
  const field2 = page.getByLabel('Write your version of this passage');
  await field2.fill(MY_DRAFT);
  eq('W1 the composer is open against their own Version 2',
     await page.locator('[data-composer-target]').getAttribute('data-composer-target'), mine?.id ?? null);

  /* A second authenticated act lands V3 — a real request, not a fixture. */
  const landed = await page.evaluate(async (a) => {
    const r = await fetch('/api/writers-studio/editorial/version', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: a.t, supersedes: a.s, replacementText: a.w }),
    });
    return r.status;
  }, { t: addressed, s: mine?.id, w: THIRD });
  eq('W2 a third formulation really did land', landed, 201);

  /* ⭐ Capture what the still-open composer actually SENDS. */
  let sentSupersedes: unknown = '(no request seen)';
  page.on('request', (r) => {
    if (r.url().includes('/editorial/version') && r.method() === 'POST') {
      try { sentSupersedes = JSON.parse(r.postData() ?? '{}').supersedes; } catch { /* keep default */ }
    }
  });
  await page.getByRole('button', { name: 'Add my version' }).click();
  await page.waitForFunction(
    () => document.body.innerText.includes('Your words are kept below'), undefined, { timeout: 60_000 },
  ).catch(() => {});
  await settle(page); await shot(page, '11-refused');

  eq('W3 ⭐⭐ THE REQUEST STILL NAMES THE VERSION THEY ANSWERED, not the new head',
     sentSupersedes, mine?.id);
  const rows3 = await vRows();
  eq('W4 ⛔ their draft became NO version — no retry, no rebase',
     rows3.some((r) => r.formulation === MY_DRAFT), false);
  eq('W5 exactly three formulations stand', rows3.length, 3);
  eq('W6 ⭐ their words are still in the field', await field2.inputValue(), MY_DRAFT);
  eq('W7 ⭐⭐ and the target still names Version 2 — the head moved, this did not',
     await page.locator('[data-composer-target]').getAttribute('data-composer-target'), mine?.id ?? null);
  eq('W8 ⭐ the lineage was re-read, so they can SEE what moved',
     (await lineage().count()), 3);
  /* ⚠️ REACHABILITY, MEASURED — because Playwright SCROLLS ELEMENTS INTO VIEW
     before clicking, so every obligation above can pass over a surface a person
     cannot actually get to. The question a green run cannot answer by itself is
     whether the writer can reach the composer at all. */
  const reach = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')]
      .find((b) => b.textContent?.trim() === 'Add my version');
    if (!btn) return { found: false, inView: false, scrollable: false };
    let el: HTMLElement | null = btn.parentElement;
    let scrollable = false;
    while (el) {
      if (el.scrollHeight > el.clientHeight + 4) {
        const oy = getComputedStyle(el).overflowY;
        if (oy === 'auto' || oy === 'scroll') { scrollable = true; break; }
      }
      el = el.parentElement;
    }
    const r = btn.getBoundingClientRect();
    return { found: true, inView: r.bottom <= window.innerHeight && r.top >= 0, scrollable };
  });
  eq('W10 ⚠️ the submit control EXISTS in the document', reach.found, true);
  eq('W11 ⚠️ and the writer can reach it — on screen, or by scrolling a scrollable ancestor',
     reach.inView || reach.scrollable, true);
  if (!reach.inView) {
    console.log('     ⚠️ NOTE: it is BELOW THE FOLD at 1600×1000 and reached only by scrolling.');
  }

  eq('W9 the refusal says what happened, plainly',
     (await page.locator('section[aria-label="Your version"]').innerText())
       .includes('no longer follows the version you answered'), true);

  /* ══ WS-EDITORIAL-UI-03 · EXACT COMPARISON ═══════════════════════════
     ⭐⭐ The object compared is THE PASSAGE AS THIS RELATIONSHIP OPENED versus
     ONE EXACT AUTHORED VERSION. ⛔ Not the current manuscript, ⛔ not the
     latest version, ⛔ not the head by default. */
  console.log('\n── the writer compares one exact version ─────────────────────────');
  /* Close the composer first so its own fields cannot stand in for anything. */
  await page.getByRole('button', { name: 'Cancel' }).click();
  await settle(page);

  const before = {
    turns: await turnCount(),
    versions: (await vRows()).length,
    auths: Number((await one('SELECT count(*) n FROM manuscript_revision_authorizations')).n),
    section: (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [SE]))?.text,
  };
  eq('K0 three formulations stand before any comparison', before.versions, 3);

  await page.locator(`[data-compare="${v1?.id}"]`).click();
  await page.waitForSelector('section[aria-label="Compare"]', { timeout: 30_000 });
  await settle(page); await shot(page, '12-compare-v1');

  const side = (which: string) =>
    page.locator(`section[aria-label="Compare"] [data-compare-side="${which}"]`);
  /* ⚠️ A first draft of this block carried a K1 that compared the left side's
     text TO ITSELF — a tautology that would have passed on any rendering at
     all. Deleted rather than repaired: K1a and K1b below are the two claims it
     was pretending to make, and they are separable for a reason (the label is a
     provenance question, the body is a content question). */
  eq('K1a ⭐ and it is labelled by PROVENANCE, never "Original"',
     (await side('passage').innerText()).toUpperCase().includes('PASSAGE WHEN THIS EXCHANGE OPENED')
     && !(await side('passage').innerText()).toUpperCase().includes('ORIGINAL'), true);
  eq('K1b ⭐ carrying the frozen locus wording exactly',
     (await side('passage').innerText()).includes(SECTION_TEXT), true);
  eq('K2 ⭐ the right side is the EXACT version they clicked',
     await side('version').getAttribute('data-compare-version'), v1?.id ?? null);
  eq('K3 ⭐ named as MAIA’s, with its ordinal',
     (await side('version').innerText()).toUpperCase().includes('MAIA · VERSION 1'), true);
  eq('K4 ⭐ and showing her exact wording', (await side('version').innerText()).includes(CANDIDATE), true);

  /* ⭐⭐ THE DECISIVE ONE: the head is V3, and the comparison is V1. */
  const head = headOf(await vRows());
  eq('K5 the succession head really is a different version',
     typeof head?.id === 'string' && head.id !== v1?.id, true);
  await page.locator('section[aria-label="Editorial conversation"]').evaluate(
    (el) => { el.scrollTop = 0; });
  await settle(page);
  eq('K6 ⭐⭐ COMPARISON STILL SHOWS V1 WHILE THE HEAD IS V3',
     await side('version').getAttribute('data-compare-version'), v1?.id ?? null);

  eq('K7 ⛔ comparing wrote NO turn', await turnCount(), before.turns);
  eq('K8 ⛔ comparing wrote NO version', (await vRows()).length, before.versions);
  eq('K9 ⛔ comparing wrote NO authorization',
     Number((await one('SELECT count(*) n FROM manuscript_revision_authorizations')).n), before.auths);
  eq('K10 ⛔ and the manuscript is untouched',
     (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [SE]))?.text, before.section);
  eq('K11 ⛔ NO DECISION IS OFFERED HERE',
     /\b(Keep Original|Keep\b|Accept|Revise|Adopt this|Apply|Use this)\b/i
       .test(await page.locator('section[aria-label="Compare"]').innerText()), false);
  eq('K12 ⭐ and the standing sentence is present',
     (await page.locator('section[aria-label="Compare"]').innerText()).toUpperCase()
       .includes('NOTHING CHANGES UNTIL YOU EXPLICITLY ADOPT A VERSION'), true);

  /* ⭐ It changes only through another explicit click. */
  await page.locator(`[data-compare="${mine?.id}"]`).click();
  await settle(page); await shot(page, '13-compare-mine');
  eq('K13 ⭐ another explicit gesture moves it, and only that',
     await side('version').getAttribute('data-compare-version'), mine?.id ?? null);
  eq('K14 ⭐ authorship on the right side follows the version, not the room',
     (await side('version').innerText()).toUpperCase().includes('YOUR VERSION · VERSION 2'), true);
  eq('K15 ⭐ and the left side never moved',
     (await side('passage').innerText()).includes(SECTION_TEXT), true);

  /* ⭐ A server re-read is not a selection change. */
  await page.getByRole('button', { name: 'Write my version from this' }).first().click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await settle(page);
  eq('K16 ⭐ the comparison survives an ordinary re-read of the thread',
     await side('version').getAttribute('data-compare-version'), mine?.id ?? null);

  /* ══ THE CLOSED SHAPE ═════════════════════════════════════════════════ */
  console.log('\n── the request shape is closed, and says so ──────────────────────');
  const post = (body: unknown) => page.evaluate(async (b) => {
    const r = await fetch('/api/writers-studio/editorial/version', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b),
    });
    return { status: r.status, body: await r.text() };
  }, body);
  const head3 = headOf(rows3);
  eq('B3 the closed-shape probes are aimed at the real succession head',
     head3?.formulation, THIRD);
  const base = { threadId: addressed, supersedes: head3?.id };

  const withAuthor = await post({ ...base, replacementText: 'x', author: 'maia' });
  eq('B4 ⛔ a caller may not name the author', withAuthor.status, 400);
  eq('B5 and the refusal NAMES the field rather than ignoring it',
     withAuthor.body.includes('author'), true);
  eq('B6 ⛔ a caller may not name the chain',
     (await post({ ...base, replacementText: 'x', chainId: 'c' })).status, 400);
  eq('B7 ⛔ nor a rationale, which this cut does not open',
     (await post({ ...base, replacementText: 'x', rationale: 'because' })).status, 400);
  eq('B8 ⛔ nor an adoption',
     (await post({ ...base, replacementText: 'x', adopt: true })).status, 400);
  eq('B9 ⛔ a foreign thread is 404, not a redaction',
     (await post({ threadId: randomUUID(), supersedes: null, replacementText: 'x' })).status, 404);

  /* ⭐⭐ '' IS A LAWFUL CANDIDATE FORMULATION. A writer may mean *this passage
     should not be here*, and it changes nothing until adoption. */
  const empty = await post({ ...base, replacementText: '' });
  eq('B10 ⭐⭐ an EMPTY formulation is lawful, not a validation error', empty.status, 201);
  /* ⭐ Identified BY THE ID THE SERVER RETURNED — ⛔ never by position in a
     list, which is what made the first version of this obligation luck. */
  const emptyId = (() => { try { return JSON.parse(empty.body).versionId; } catch { return null; } })();
  const rows4 = await vRows();
  const appended = rows4.find((r) => r.id === emptyId);
  eq('B11 and it is durable, authored, and empty',
     `${rows4.length}/${appended?.formulation}/${appended?.author}/${appended?.supersedes === head3?.id}`,
     '4//member/true');
  eq('B12 ⛔ AND THE MANUSCRIPT IS STILL THE WRITER’S OWN SENTENCE',
     (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [SE]))?.text, SECTION_TEXT);

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
