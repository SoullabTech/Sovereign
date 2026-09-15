/**
 * RETURN-LOCUS-01 · LEAVE → RETURN, in a real browser.
 *
 * ⭐⭐ THE HUMAN REQUIREMENT: Kelly leaves Elemental Alchemy while working in
 * Chapter 10. When she returns to the Work, the Studio restores Chapter 10
 * without her remembering a URL.
 *
 * ⛔ AND THE OTHER HALF, WHICH IS THE HARDER ONE: when the evidence does NOT
 * name one section — an import, a conversion, a whole-draft save, a restore —
 * the Studio must return her to the Work and say nothing about where she was.
 * Replacing "always Chapter 1" with a different invisible guess is the failure
 * this act exists to avoid, so it is witnessed as its own case.
 *
 * ⛔ DISPOSABLE DATABASES ONLY.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { Client } from 'pg';
import { chromium, type Browser, type Page } from 'playwright-core';

const DSN = process.env.DATABASE_URL!;
const SHOTS = process.env.WITNESS_SHOTS ?? '/tmp/return-locus-shots';
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

let pg: Client; let next: ChildProcess | null = null; let browser: Browser | null = null;
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p as unknown[])).rows as any[];
const one = async (s: string, p: unknown[] = []) => (await q(s, p))[0];

const CH: [string, string][] = [
  ['Chapter 1: The Journey Begins', 'The first turn of the spiral is the one you do not see.'],
  ['Chapter 9: Aether', 'The infinite self at play needs no witness but itself.'],
  ['Chapter 10: Living the Spiralogic Process', 'Before the water, there was a sound.'],
];

function killNext() {
  if (!next?.pid) return;
  try { process.kill(-next.pid, 'SIGKILL'); } catch { /* gone */ }
  next = null;
}
async function teardown() {
  await browser?.close().catch(() => {}); browser = null;
  killNext(); await pg?.end().catch(() => {});
}

async function main() {
  mkdirSync(SHOTS, { recursive: true });
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const dbn = (await one('SELECT current_database() d')).d as string;
  if (!dbn.includes('witness')) { console.log(`REFUSED · '${dbn}' is not a witness database.`); process.exit(2); }

  const M = randomUUID(), LW = randomUUID(), WK = randomUUID(), DR = randomUUID();
  const TOKEN = `witness-${randomUUID()}`;
  const secIds: string[] = [];
  const content = CH.map(([, body]) => body).join('');

  await q(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,'RL','rl','x','W')`, [M]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'Elemental Alchemy')`, [LW, M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
           VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'Elemental Alchemy')`, [WK, M]);
  await q(`INSERT INTO manuscript_working_drafts
             (id,manuscript_id,member_id,content,base_source_hash,revision_count)
           VALUES ($1,$2,$3,$4,'sha-rl',3)`, [DR, WK, M, content]);
  /* ⚠️ ⭐ ONE TRANSACTION, BECAUSE CONVERSION IS ONE TRANSACTION.
     `convertDraft.ts` loops its INSERTs inside a single `transaction()`, and
     PostgreSQL's `now()` is TRANSACTION time — so every section a conversion
     creates carries the IDENTICAL timestamp. That identity is what makes the
     tie real, and the tie is what the rule refuses to rank.

     A first run of this witness inserted each section in its OWN statement,
     i.e. its own transaction, so the three differed by microseconds and the
     read correctly answered `distinct`. ⛔ The rule was not wrong; THE FIXTURE
     WAS — it modelled three imports rather than one. Had it been left that
     way, this witness would have reported the tie case as unreachable and the
     act would have shipped with its hardest case unproven. */
  await q('BEGIN');
  for (let i = 0; i < CH.length; i++) {
    const [heading, body] = CH[i]!;
    const src = randomUUID(), sec = randomUUID(); secIds.push(sec);
    await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body) VALUES ($1,$2,$3,$4,$5)`,
            [src, WK, i + 1, heading, body]);
    await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
             VALUES ($1,$2,$3,$4,$5)`, [sec, DR, i + 1, body, src]);
  }
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at = NOW() WHERE id = $1`, [DR]);
  /* ⭐ THE REVISION-1 BASELINE, because an import has one. `homeState` offers a
     Work back only when `hasCurrentMemberContribution` — the draft diverging
     from revision 1 — which is how a verbatim seed is kept from masquerading as
     writing (STUDIO-WRITING-PRESENCE-01 · S2). A fixture without it produces a
     Work that is correctly NOT continuable, and the Return hero never renders. */
  await q(`INSERT INTO working_draft_revisions (draft_id,revision_number,content,saved_by,note)
           VALUES ($1,1,$2,$3,'import')`, [DR, content, M]);
  await q('COMMIT');
  /* ⭐ The tie must be real: the SECTION rows all share one timestamp. */
  const tie = await q(`SELECT count(DISTINCT updated_at) n FROM manuscript_draft_sections WHERE draft_id = $1`, [DR]);
  if (Number(tie[0].n) !== 1) {
    console.log(`  ⛔ NOT RUN — fixture did not produce a tie (${tie[0].n} distinct timestamps)`);
    await teardown(); process.exit(2);
  }
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);

  const port = 3418;
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

  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const page: Page = await ctx.newPage();
  const HOME = `http://127.0.0.1:${port}/writers-studio`;
  const settle = () => page.waitForTimeout(900);
  const returnLink = () => page.getByRole('link', { name: 'Return to this work' });
  const gotoHome = async () => {
    await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector('text=Elemental Alchemy', { timeout: 240_000 });
    await returnLink().waitFor({ timeout: 120_000 });
    await settle();
  };

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' RETURN-LOCUS-01 · LEAVE → RETURN');
  console.log('══════════════════════════════════════════════════════════════════\n');

  /* ══ 1 · EVERY SECTION CREATED AT ONCE — an import. NO place. ═══════════ */
  console.log('── the Work was imported: every section stamped at once ──────────');
  const imported = await (await fetch(
    `http://127.0.0.1:${port}/api/sovereign/manuscripts/${WK}/locus`,
    { headers: { 'x-session-token': TOKEN } })).json();
  eq('I1 ⭐⭐ a tie is reported as UNDIFFERENTIATED, never ranked', imported.kind, 'undifferentiated');
  eq('I2 ⛔ and it names NO section', imported.sectionId, undefined);
  eq('I3 it says how many share the moment', imported.among, CH.length);
  await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 240_000 });
  await page.waitForSelector('text=Elemental Alchemy', { timeout: 240_000 });
  await settle(); await page.screenshot({ path: `${SHOTS}/01-imported.png` });
  /* ⭐ AND THE HONEST STATE OF A FRESH IMPORT: it is not continuable at all, so
     there is no Return hero for this act to make more precise. A witness that
     demanded one here would be testing a screen the product does not draw. */
  eq('R0 a verbatim import is not offered back as continuable',
     await returnLink().count(), 0);

  /* ══ 2 · SHE WRITES IN CHAPTER 10 ══════════════════════════════════════ */
  console.log('\n── she writes in Chapter 10, then leaves ─────────────────────────');
  /* The one act that IS a place: saveSection's single-row update. */
  const WROTE = 'There was only the sound, and then the water.';
  /* ⭐ EXACTLY WHAT `saveSection` DOES, and for its reasons. The round-trip
     triggers on both tables are CONSTRAINT TRIGGERS, DEFERRABLE INITIALLY
     DEFERRED, so they fire at COMMIT and the two writes must share one
     transaction — a fixture that used two would fail on whichever it committed
     first. And the draft's content is DERIVED from the sections by string_agg
     rather than assembled here, which is the same discipline: the fixture's
     idea of the rest of the manuscript never enters. */
  await q('BEGIN');
  await q(`UPDATE manuscript_draft_sections SET text = $2, updated_at = now() WHERE id = $1`,
          [secIds[2], WROTE]);
  await q(`UPDATE manuscript_working_drafts
              SET content = (SELECT COALESCE(string_agg(text, '' ORDER BY position), '')
                               FROM manuscript_draft_sections WHERE draft_id = $1),
                  version = version + 1, updated_at = now()
            WHERE id = $1`, [DR]);
  await q('COMMIT');
  const after = await (await fetch(
    `http://127.0.0.1:${port}/api/sovereign/manuscripts/${WK}/locus`,
    { headers: { 'x-session-token': TOKEN } })).json();
  eq('W1 ⭐ now exactly one section holds the latest change', after.kind, 'distinct');
  eq('W2 and it is Chapter 10', after.sectionId, secIds[2]);

  console.log('\n── she returns tomorrow ──────────────────────────────────────────');
  await gotoHome(); await page.screenshot({ path: `${SHOTS}/02-return.png` });
  const href1 = await returnLink().getAttribute('href');
  eq('R2 ⭐⭐ the Return link now names Chapter 10', href1?.includes(`s=${secIds[2]}`), true);
  eq('R3 ⭐ and still names the Work', href1?.includes(`m=${WK}`), true);

  await returnLink().click();
  await page.waitForSelector(`text=${CH[2]![0]}`, { timeout: 240_000 });
  await settle(); await page.screenshot({ path: `${SHOTS}/03-chapter10.png` });
  const heading = (await page.locator('h1, h2').allInnerTexts()).join(' | ');
  eq('R4 ⭐⭐ THE ROOM OPENS ON CHAPTER 10 — no URL remembered',
     heading.includes('Chapter 10'), true);
  eq('R5 the address carries the section', new URL(page.url()).searchParams.get('s'), secIds[2]);
  eq('R6 ⛔ and nothing was written to get here',
     Number((await one('SELECT count(*) n FROM ask_threads')).n), 0);

  /* ══ 3 · EXPLICIT NAVIGATION STILL WINS ════════════════════════════════ */
  console.log('\n── explicit navigation is untouched ──────────────────────────────');
  await page.goto(`http://127.0.0.1:${port}/writers-studio/canvas?m=${WK}&s=${secIds[1]}`,
                  { waitUntil: 'domcontentloaded', timeout: 240_000 });
  await page.waitForSelector(`text=${CH[1]![0]}`, { timeout: 240_000 });
  await settle();
  eq('N1 ⭐ a named section beats the remembered one — she is still in charge',
     (await page.locator('h1, h2').allInnerTexts()).join(' | ').includes('Chapter 9'), true);

  /* ══ 4 · A WHOLE-DRAFT ACT ERASES THE PLACE, TRUTHFULLY ════════════════ */
  console.log('\n── a whole-draft save stamps every row: the place is gone ────────');
  /* A whole-draft save stamps every row in one statement — one timestamp, and
     therefore no place. Text is unchanged, so the round trip still holds. */
  await q(`UPDATE manuscript_draft_sections SET updated_at = now() WHERE draft_id = $1`, [DR]);
  const wiped = await (await fetch(
    `http://127.0.0.1:${port}/api/sovereign/manuscripts/${WK}/locus`,
    { headers: { 'x-session-token': TOKEN } })).json();
  eq('U1 ⭐⭐ the Studio reports NO place rather than inventing one', wiped.kind, 'undifferentiated');
  await gotoHome();
  eq('U2 ⛔ and the Return link goes back to Work-scoped',
     (await returnLink().getAttribute('href'))?.includes('s='), false);

  /* ══ 5 · BOUNDARIES ════════════════════════════════════════════════════ */
  console.log('\n── boundaries ───────────────────────────────────────────────────');
  const anon = await fetch(`http://127.0.0.1:${port}/api/sovereign/manuscripts/${WK}/locus`);
  eq('B1 ⛔ unauthenticated is refused', anon.status, 401);
  const M2 = randomUUID(), T2 = `witness-${randomUUID()}`;
  await q(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'RL2','rl2','x')`, [M2]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M2, T2]);
  const foreign = await (await fetch(`http://127.0.0.1:${port}/api/sovereign/manuscripts/${WK}/locus`,
    { headers: { 'x-session-token': T2 } })).json();
  eq('B2 ⛔ another member learns nothing — "none", not a redaction', foreign.kind, 'none');
  const unknown = await (await fetch(`http://127.0.0.1:${port}/api/sovereign/manuscripts/${randomUUID()}/locus`,
    { headers: { 'x-session-token': TOKEN } })).json();
  eq('B3 an unknown Work is the same answer', unknown.kind, 'none');

  console.log(`\n  ${pass} passed · ${fail} failed`);
  console.log(`  screenshots: ${SHOTS}`);
}

main()
  .then(async () => { await teardown(); process.exit(fail === 0 ? 0 : 1); })
  .catch(async (e) => { console.error('\n  ⛔ NOT RUN —', e?.message ?? e); await teardown(); process.exit(2); });
