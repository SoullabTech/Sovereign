/**
 * RETURN-RELATIONSHIP · PHASE B — leave, return, and find what was there.
 *
 * ⭐⭐ THE ACCEPTANCE QUESTION, in the founder's words: *when Kelly returns to
 * Chapter 10 tomorrow, does MAIA feel like the same intelligence continuing the
 * same Work — or like another assistant starting over?*
 *
 * ⛔ "Tomorrow" is simulated the only honest way: a FRESH PAGE at the ROOM's own
 * URL, carrying no `editorialThread` parameter. ⛔ Not a reopened panel, ⛔ not a
 * back button, ⛔ not a component remount — a browser that knows nothing.
 *
 * ⛔ DISPOSABLE DATABASES ONLY.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { chromium, type Browser, type Page } from 'playwright-core';

const DSN = process.env.DATABASE_URL!;
const PORT = Number(process.env.WITNESS_PORT ?? 3461);
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${JSON.stringify(want)}] got [${JSON.stringify(got)}]`);

let pg: Client; let next: ChildProcess | null = null; let browser: Browser | null = null;
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p as unknown[])).rows as any[];
const one = async (s: string, p: unknown[] = []) => (await q(s, p))[0];
const settle = (p: Page) => p.waitForTimeout(900);

/**
 * ⚠️ SCOPED TO THIS RUN'S MEMBER, AND THAT IS NOT PEDANTRY. A first cut counted
 * `ask_threads` globally and reported *"nothing was created merely by arriving"*
 * as FAILED because an earlier run on the same disposable cluster had left a row
 * behind. ⛔ A count that can be moved by a different member is not evidence
 * about this one.
 */
const threadCount = async () =>
  Number((await one('SELECT count(*) n FROM ask_threads WHERE member_id = $1', [M])).n);

/**
 * ⚠️ AND DISCOVERY IS WAITED ON, NEVER SLEPT THROUGH. A fixed settle reported
 * `data-discovery="pending"` as the answer — the room had not finished looking,
 * and the witness scored the question instead of the result.
 */
const discovered = async (page: Page) => {
  await page.waitForSelector('[data-discovery]:not([data-discovery="pending"])',
    { timeout: 60_000 });
};

function killNext() {
  if (!next?.pid) return;
  try { process.kill(-next.pid, 'SIGKILL'); } catch { /* gone */ }
  next = null;
}
async function teardown() {
  await browser?.close().catch(() => {}); browser = null;
  killNext(); await pg?.end().catch(() => {});
}

const P1 = 'Before the water, there was a sound that had not yet become a word.';
const P2 = 'The spiral is not a circle, fixated on its own return.';
let M = '', TOKEN = '', WK = '', DS1 = '', DS2 = '';

async function main() {
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const db = (await one('SELECT current_database() d')).d as string;
  if (!db.includes('witness')) { console.log(`REFUSED · '${db}' is not a witness database.`); process.exit(2); }

  M = randomUUID(); TOKEN = `witness-${randomUUID()}`;
  WK = randomUUID();
  const LW = randomUUID(), DR = randomUUID();
  const S1 = randomUUID(), S2 = randomUUID();
  DS1 = randomUUID(); DS2 = randomUUID();
  await q(`INSERT INTO members (id,passkey,username,password_hash,name)
           VALUES ($1,$2,$3,'x','R')`, [M, `RR-${M.slice(0, 8)}`, `rr-${M.slice(0, 8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'Return Work')`, [LW, M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
           VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'Return Work')`, [WK, M]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,0,NULL,$3)`, [S1, WK, P1]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,1,NULL,$3)`, [S2, WK, P2]);
  await q('BEGIN');
  await q(`INSERT INTO manuscript_working_drafts
             (id,manuscript_id,member_id,content,base_source_hash,revision_count,version,section_addressable_at)
           VALUES ($1,$2,$3,'','witness',1,41,NULL)`, [DR, WK, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,0,$3,$4)`, [DS1, DR, P1, S1]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,1,$3,$4)`, [DS2, DR, P2, S2]);
  await q(`UPDATE manuscript_working_drafts
              SET content = (SELECT COALESCE(string_agg(text,'' ORDER BY position),'')
                               FROM manuscript_draft_sections WHERE draft_id = $1),
                  section_addressable_at = now()
            WHERE id = $1`, [DR]);
  await q('COMMIT');

  next = spawn('node_modules/.bin/next', ['dev', '-p', String(PORT)], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: true,
    env: { ...process.env, DATABASE_URL: DSN, WRITERS_STUDIO_EDITORIAL_ENABLED: '1' },
  });
  const deadline = Date.now() + 300_000;
  for (;;) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/api/health`); if (r.status < 500) break; } catch { /* waiting */ }
    if (Date.now() > deadline) { console.log('  ⛔ NOT RUN — next dev did not become ready'); await teardown(); process.exit(2); }
    await new Promise((r) => setTimeout(r, 1500));
  }

  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const ROOM = `http://127.0.0.1:${PORT}/writers-studio/canvas?m=${WK}`;

  /** ⭐ A BROWSER THAT KNOWS NOTHING. New page, the room's own URL, no thread. */
  const arrive = async (): Promise<Page> => {
    const page = await ctx.newPage();
    await page.goto(ROOM, { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector(`text=${P1}`, { timeout: 240_000 });
    await settle(page);
    /* ⭐ THE PASSAGE IS SELECTED FIRST. `writing.activeId` is what the room
       derives the locus from, and with more than one section in the draft it is
       not settled merely by arriving — the founder's own flow is *select a
       section → ask for a conversation*. */
    await page.locator(`text=${P1}`).first().click().catch(() => {});
    await settle(page);
    await page.getByText('Conversations', { exact: true }).first().click();
    await settle(page);
    await discovered(page).catch(() => {});
    return page;
  };

  /** ⛔ Diagnostic, printed once: a witness that cannot see the panel should
   *  say what it DID see rather than only that an assertion failed. */
  const panelText = async (page: Page) => {
    const t = await page.locator('[aria-label="Editorial conversation"], section, aside')
      .allInnerTexts().catch(() => [] as string[]);
    return t.join(' | ').slice(0, 400);
  };

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' RETURN-RELATIONSHIP · PHASE B');
  console.log('══════════════════════════════════════════════════════════════════');

  /* ══ R1 · NOTHING YET ═══════════════════════════════════════════════════ */
  console.log('\n── R1 · NOTHING YET ──────────────────────────────────────────────');
  const p1 = await arrive();
  if (await p1.locator('[data-discovery]').count() === 0) {
    console.log(`  ⚠️ OBSERVED panel text → ${await panelText(p1)}`);
  }
  eq('R1a discovery ran and found nothing',
    await p1.locator('[data-discovery="fresh"]').count(), 1);
  eq('R1b ⛔ and NOTHING was created merely by arriving',
    await threadCount(), 0);
  eq('R1c the room offers to start, by name',
    await p1.getByRole('button', { name: 'Start a conversation about this passage' }).count(), 1);
  eq('R1d ⛔ the address still names no thread',
    new URL(p1.url()).searchParams.get('editorialThread'), null);

  /* ══ R2 · LEAVE → RETURN → RESUME ═══════════════════════════════════════ */
  console.log('\n── R2 · LEAVE → RETURN → RESUME ──────────────────────────────────');
  await p1.getByRole('button', { name: 'Start a conversation about this passage' }).click();
  await p1.waitForFunction(
    () => new URL(window.location.href).searchParams.get('editorialThread') !== null,
    undefined, { timeout: 60_000 }).catch(() => {});
  const opened = new URL(p1.url()).searchParams.get('editorialThread');
  eq('R2a the explicit gesture opened exactly one relationship',
    await threadCount(), 1);
  eq('R2b and the room named it in the address', typeof opened === 'string' && opened.length > 0, true);
  await p1.close();

  /* ⭐⭐ TOMORROW. */
  const p2 = await arrive();
  eq('R2c ⭐⭐ returning finds the relationship that was already there',
    await p2.locator('[data-discovery="resume"]').count(), 1);
  eq('R2d ⛔ and arriving created NOTHING',
    await threadCount(), 1);
  eq('R2e it offers to continue, and does not continue by itself',
    await p2.getByRole('button', { name: 'Continue this conversation' }).count(), 1);
  eq('R2f ⛔ the address is still empty until she acts',
    new URL(p2.url()).searchParams.get('editorialThread'), null);
  eq('R2g ⭐ she recognises it by the PASSAGE, not by an id',
    await p2.locator('[data-discovery="resume"] blockquote').first().innerText(), P1);
  eq('R2h ⛔ no identifier is shown to her',
    (await p2.locator('[data-discovery="resume"]').innerText()).includes(opened ?? 'x'), false);
  await p2.getByRole('button', { name: 'Continue this conversation' }).click();
  await p2.waitForSelector('[aria-label="Editorial conversation"]', { timeout: 60_000 }).catch(() => {});
  await settle(p2);
  eq('R2i ⭐ continuing resumes the SAME relationship',
    new URL(p2.url()).searchParams.get('editorialThread'), opened);
  eq('R2j ⛔ and still created nothing',
    await threadCount(), 1);
  eq('R2k the conversation surface is the one she left',
    await p2.locator('[aria-label="Editorial conversation"]').count(), 1);
  await p2.close();

  /* ══ R3 · A SECOND IS EXPLICIT, NEVER ACCIDENTAL ════════════════════════ */
  console.log('\n── R3 · A SECOND RELATIONSHIP, EXPLICITLY ────────────────────────');
  const p3 = await arrive();
  eq('R3a the offer to start another is present, and named as separate',
    await p3.getByRole('button', { name: 'Start a separate conversation about this passage' }).count(), 1);
  await p3.getByRole('button', { name: 'Start a separate conversation about this passage' }).click();
  await p3.waitForSelector('[aria-label="Editorial conversation"]', { timeout: 60_000 }).catch(() => {});
  await settle(p3);
  eq('R3b ⭐ plurality is lawful — a second relationship exists',
    await threadCount(), 2);
  await p3.close();

  /* ══ R4 · PLURALITY WITHOUT GUESSING ════════════════════════════════════ */
  console.log('\n── R4 · PLURALITY WITHOUT GUESSING ───────────────────────────────');
  const p4 = await arrive();
  eq('R4a ⭐⭐ the room shows both and chooses neither',
    await p4.locator('[data-discovery="choose"]').count(), 1);
  eq('R4b both are offered', await p4.locator('[data-relationship]').count(), 2);
  eq('R4c ⛔ no row is marked, preferred or defaulted',
    (await p4.locator('[data-discovery="choose"]').innerText())
      .match(/most recent|latest|suggested|recommended|default/i), null);
  eq('R4d each is recognisable by its frozen passage',
    await p4.locator('[data-relationship] blockquote').count(), 2);
  const ids = await p4.locator('[data-relationship]').evaluateAll(
    (n) => n.map((e) => e.getAttribute('data-relationship')));
  await p4.locator(`[data-resume="${ids[1]}"]`).click();
  await p4.waitForSelector('[aria-label="Editorial conversation"]', { timeout: 60_000 }).catch(() => {});
  await settle(p4);
  eq('R4e ⭐ she chose the second, and the room resumed the one she chose',
    new URL(p4.url()).searchParams.get('editorialThread'), ids[1]);
  eq('R4f ⛔ and choosing created nothing',
    await threadCount(), 2);
  await p4.close();

  /* ══ R5 · ⛔ UNAVAILABLE IS NOT NONE ════════════════════════════════════ */
  console.log('\n── R5 · DISCOVERY FAILS ──────────────────────────────────────────');
  const p5 = await ctx.newPage();
  /* ⭐ A REAL TRANSPORT FAILURE, not a stubbed decision. */
  await p5.route('**/api/writers-studio/editorial/relationships**',
    (route) => route.fulfill({ status: 500, body: '{}' }));
  await p5.goto(ROOM, { waitUntil: 'domcontentloaded', timeout: 240_000 });
  await p5.waitForSelector(`text=${P1}`, { timeout: 240_000 });
  await settle(p5);
  await p5.locator(`text=${P1}`).first().click().catch(() => {});
  await settle(p5);
  await p5.getByText('Conversations', { exact: true }).first().click();
  await settle(p5);
  await discovered(p5).catch(() => {});
  const before = await threadCount();
  eq('R5a ⛔⛔ a failed lookup is reported as unknown, never as "none"',
    await p5.locator('[data-discovery="unavailable"]').count(), 1);
  eq('R5b ⛔ and the room does NOT offer to start',
    await p5.locator('[data-start-new]').count(), 0);
  eq('R5c ⭐ so nothing was written', await threadCount(), before);
  await p5.close();

  /* ══ R6 · A DIFFERENT PASSAGE IS A DIFFERENT SUBJECT ════════════════════ */
  console.log('\n── R6 · SCOPED TO THE PASSAGE ────────────────────────────────────');
  const rel = await (await fetch(
    `http://127.0.0.1:${PORT}/api/writers-studio/editorial/relationships?sectionId=${DS2}`,
    { headers: { 'x-session-token': TOKEN } })).json() as any;
  eq('R6a ⛔ the other passage has none of them', rel.relationships.length, 0);
  const rel1 = await (await fetch(
    `http://127.0.0.1:${PORT}/api/writers-studio/editorial/relationships?sectionId=${DS1}`,
    { headers: { 'x-session-token': TOKEN } })).json() as any;
  eq('R6b and this one has both', rel1.relationships.length, 2);
  eq('R6c ⛔ the server marks no winner',
    JSON.stringify(rel1).match(/"(mostRecent|suggested|preferred|default)"/), null);
  eq('R6d ⭐ presentation order is ASCENDING, so no row sits in the "newest" seat',
    new Date(rel1.relationships[0].openedAt).getTime()
      <= new Date(rel1.relationships[1].openedAt).getTime(), true);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  await teardown();
  process.exit(fail === 0 ? 0 : 1);
}

void main().catch(async (e) => {
  console.log(`  ⛔ WITNESS ABORTED — ${e instanceof Error ? e.stack : String(e)}`);
  await teardown(); process.exit(2);
});
