/**
 * EDITORIAL-LOCUS-ALIGNMENT-01 · PHASE B — the producer writes the passage.
 *
 * ⭐⭐ THE ONE QUESTION: does opening an editorial relationship freeze the SAME
 * text that every fit check reads?
 *
 * ⛔ IT PROVES NOTHING ABOUT ADOPTION. The adoption route does not exist on this
 * branch. This exercises the relationship door and the authorization execution
 * path, which is the pair that disagreed.
 *
 * ⭐ AND IT CARRIES A PERMANENT HEADED-SECTION FIXTURE. Every green test this
 * defect survived used a heading-less section, so the headed shape is now a
 * first-class fixture rather than an afterthought: a witness that only tests the
 * degenerate case reports on itself.
 *
 * ⛔ DISPOSABLE DATABASES ONLY.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const DSN = process.env.DATABASE_URL!;
const PORT = Number(process.env.WITNESS_PORT ?? 3441);
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${JSON.stringify(want)}] got [${JSON.stringify(got)}]`);

let pg: Client; let next: ChildProcess | null = null;
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p as unknown[])).rows as any[];
const one = async (s: string, p: unknown[] = []) => (await q(s, p))[0];
function killNext() {
  if (!next?.pid) return;
  try { process.kill(-next.pid, 'SIGKILL'); } catch { /* gone */ }
  next = null;
}

const PASSAGE = 'The spiral is not a circle, fixated on its own return.';
const ADOPTED = 'The spiral is not a circle, steady on its own return.';
const HEADING = 'Chapter Ten';
let M = '', TOKEN = '';

const api = (path: string, init?: RequestInit) =>
  fetch(`http://127.0.0.1:${PORT}${path}`, {
    ...init,
    headers: { 'x-session-token': TOKEN, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

/** `stored` is written verbatim, so a malformed slice can be built on purpose. */
async function makeWork(title: string, heading: string | null, stored: string) {
  const WK = randomUUID(), LW = randomUUID(), DR = randomUUID();
  const SRC = randomUUID(), SRC2 = randomUUID(), DS = randomUUID(), DS2 = randomUUID();
  const OTHER = 'A second place, so the draft can move without touching the first.';
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,$3)`, [LW, M, title]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
           VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)`, [WK, M, title]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,0,$3,$4)`, [SRC, WK, heading, PASSAGE]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,1,NULL,$3)`, [SRC2, WK, OTHER]);
  await q('BEGIN');
  await q(`INSERT INTO manuscript_working_drafts
             (id,manuscript_id,member_id,content,base_source_hash,revision_count,version,section_addressable_at)
           VALUES ($1,$2,$3,'','witness',1,41,NULL)`, [DR, WK, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,0,$3,$4)`, [DS, DR, stored, SRC]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,1,$3,$4)`, [DS2, DR, OTHER, SRC2]);
  await q(`UPDATE manuscript_working_drafts
              SET content = (SELECT COALESCE(string_agg(text,'' ORDER BY position),'')
                               FROM manuscript_draft_sections WHERE draft_id = $1),
                  section_addressable_at = now()
            WHERE id = $1`, [DR]);
  await q('COMMIT');
  return { WK, DR, DS, DS2, OTHER };
}

const open = async (sectionId: string) => {
  const r = await api('/api/writers-studio/editorial/thread',
    { method: 'POST', body: JSON.stringify({ sectionId }) });
  return { status: r.status, body: await r.json() as any };
};
const chainsOn = async (DS: string) =>
  Number((await one('SELECT count(*) c FROM proposal_chains WHERE target_section_id = $1', [DS])).c);

async function main() {
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const db = (await one('SELECT current_database() d')).d as string;
  if (!db.includes('witness')) { console.log(`REFUSED · '${db}' is not a witness database.`); process.exit(2); }

  M = randomUUID(); TOKEN = `witness-${randomUUID()}`;
  await q(`INSERT INTO members (id,passkey,username,password_hash,name)
           VALUES ($1,$2,$3,'x','L')`, [M, `LOC-${M.slice(0, 8)}`, `loc-${M.slice(0, 8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);

  next = spawn('node_modules/.bin/next', ['dev', '-p', String(PORT)], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: true,
    env: { ...process.env, DATABASE_URL: DSN, WRITERS_STUDIO_EDITORIAL_ENABLED: '1' },
  });
  const deadline = Date.now() + 300_000;
  for (;;) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/api/health`); if (r.status < 500) break; } catch { /* waiting */ }
    if (Date.now() > deadline) { console.log('  ⛔ NOT RUN — next dev did not become ready'); killNext(); process.exit(2); }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const { authorizeVersion } = await import('@/lib/manuscript/revisionAuthorization/store');
  const { executeAuthorization } = await import('@/lib/manuscript/revisionAuthorization/execute');

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' EDITORIAL-LOCUS-ALIGNMENT-01 · PHASE B');
  console.log('══════════════════════════════════════════════════════════════════');

  /* ══ L1 · ⭐⭐ THE HEADED SECTION — THE PERMANENT FIXTURE ═══════════════ */
  console.log('\n── L1 · HEADED SECTION (the permanent fixture) ───────────────────');
  const H = await makeWork('L · headed', HEADING, `${HEADING}\n\n${PASSAGE}`);
  const oh = await open(H.DS);
  eq('L1a the relationship opens', oh.status, 200);
  const hChain = await one('SELECT id, expected_text FROM proposal_chains WHERE id = $1', [oh.body.chainId]);
  eq('L1b ⭐⭐ the frozen locus is the PROJECTED passage', hChain.expected_text, PASSAGE);
  eq('L1c ⛔ and it carries no heading prefix',
    String(hChain.expected_text).startsWith(HEADING), false);
  const view = await (await api(`/api/writers-studio/editorial/thread?threadId=${oh.body.threadId}`)).json() as any;
  eq('L1d "This passage" shows the passage, not the stored slice', view.locusText, PASSAGE);
  /* ⚠️ A FIRST DRAFT ASSERTED `view.sectionLabel` HERE and failed with `null`.
     ⭐ The witness was wrong, not the code: `sectionLabel` is ADOPTION-01's
     addition to the thread read and does not exist on this branch. ⛔ This act
     must not depend on another act's field, so the assertion is replaced by one
     that is load-bearing HERE — the repair changed what is FROZEN, ⛔ never what
     is STORED. */
  eq('L1e ⛔ the STORED slice on disk is untouched and still carries its heading',
    (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [H.DS])).text,
    `${HEADING}\n\n${PASSAGE}`);
  eq('L1e2 and the chain still names the same section',
    String((await one('SELECT target_section_id FROM proposal_chains WHERE id=$1', [oh.body.chainId])).target_section_id),
    H.DS);

  /* ⭐ THE DECISIVE ONE: opening and fit now compare the same thing. */
  const vH = randomUUID();
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'maia',$3,NULL)`, [vH, oh.body.chainId, ADOPTED]);
  const aH = await authorizeVersion(M, oh.body.chainId, vH);
  eq('L1f ⭐⭐ authorization SUCCEEDS on a headed section', aH.ok, true);
  if (aH.ok) {
    eq('L1g the binding\'s expected text is the projected passage',
      aH.authorization.guard.expectedText, PASSAGE);
    const xH = await executeAuthorization(M, aH.authorization.id);
    eq('L1h execution applies', xH.outcome, 'executed');
    eq('L1i ⭐ the heading survives EXACTLY ONCE, not duplicated',
      await (async () => (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [H.DS])).text)(),
      `${HEADING}\n\n${ADOPTED}`);
    eq('L1j ⛔ the other section was untouched',
      (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [H.DS2])).text, H.OTHER);
    eq('L1k the draft advanced exactly once',
      Number((await one('SELECT version FROM manuscript_working_drafts WHERE id=$1', [H.DR])).version), 42);
  }

  /* ══ L2 · THE UNHEADED SECTION — ⛔ BEHAVIOUR UNCHANGED ═════════════════ */
  console.log('\n── L2 · UNHEADED SECTION (must be unchanged) ─────────────────────');
  const U = await makeWork('L · unheaded', null, PASSAGE);
  const ou = await open(U.DS);
  eq('L2a the relationship opens', ou.status, 200);
  const uChain = await one('SELECT expected_text FROM proposal_chains WHERE id = $1', [ou.body.chainId]);
  eq('L2b the frozen locus is the passage, exactly as before', uChain.expected_text, PASSAGE);
  const vU = randomUUID();
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'maia',$3,NULL)`, [vU, ou.body.chainId, ADOPTED]);
  const aU = await authorizeVersion(M, ou.body.chainId, vU);
  eq('L2c authorization succeeds', aU.ok, true);
  if (aU.ok) {
    const xU = await executeAuthorization(M, aU.authorization.id);
    eq('L2d execution applies', xU.outcome, 'executed');
    eq('L2e ⛔ no heading was invented',
      (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [U.DS])).text, ADOPTED);
  }

  /* ══ L3 · UNPROJECTABLE — ⛔ THE DOOR REFUSES ═══════════════════════════ */
  console.log('\n── L3 · UNPROJECTABLE SECTION ────────────────────────────────────');
  const X = await makeWork('L · unprojectable', HEADING, `A slice that does not begin with its heading.`);
  const ox = await open(X.DS);
  eq('L3a ⛔ opening is REFUSED', ox.body.error, 'section_unprojectable');
  eq('L3b ⭐⭐ and NO chain was created — the act is whole or nothing', await chainsOn(X.DS), 0);

  /* ══ L4 · HEADING WITH NO BODY — ⚠️ the flagged judgment call ═══════════ */
  console.log('\n── L4 · HEADING WITH NO BODY (flagged judgment call) ─────────────');
  const E = await makeWork('L · empty body', HEADING, HEADING);
  const oe = await open(E.DS);
  eq('L4a ⛔ opening is REFUSED', oe.body.error, 'section_has_no_body');
  eq('L4b ⛔ and NO chain was created', await chainsOn(E.DS), 0);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  killNext(); await pg.end();
  process.exit(fail === 0 ? 0 : 1);
}

void main().catch(async (e) => {
  console.log(`  ⛔ WITNESS ABORTED — ${e instanceof Error ? e.stack : String(e)}`);
  killNext(); await pg?.end().catch(() => {}); process.exit(2);
});
