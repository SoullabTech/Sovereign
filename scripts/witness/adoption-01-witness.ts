/**
 * ADOPTION-01 · PHASE B — THE FIVE OWED BEHAVIOURAL WITNESSES.
 *
 * ⭐⭐ THE ACCEPTANCE LAW UNDER TEST:
 *
 *     Adoption means the member explicitly names a version and permits it to
 *     change the Work. The server determines where that change belongs and
 *     whether it is still safe to execute. The surface reports the result
 *     without collapsing permission, execution, or refusal into one false
 *     story.
 *
 * ⭐ EVERY LEG GOES THROUGH THE REAL HTTP ROUTE against a real Next server and
 * a real PostgreSQL. ⛔ No mocked substrate, ⛔ no stubbed fit, ⛔ no direct
 * call standing in for the gesture — except where a leg must PRE-ESTABLISH a
 * permission in order to make a race deterministic, and that is said out loud
 * at each site.
 *
 * ⭐⭐ THE RACES ARE REAL AND DETERMINISTIC. Legs C and E2 need the Work, or a
 * competing execution, to move BETWEEN the authorizing act and the executing
 * act — which is a window inside one HTTP request. They are made deterministic
 * by holding the authorization row's lock on a separate connection, because
 * `executeAuthorization` locks authorization → draft in that order while
 * `authorizeVersion` reads the authorization row WITHOUT `FOR UPDATE`. So an
 * adoption request passes authorization and parks exactly at the execution
 * boundary. ⛔ No sleep is used as evidence; the witness waits on `pg_stat_activity`.
 *
 * ⛔ DISPOSABLE DATABASES ONLY.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const DSN = process.env.DATABASE_URL!;
const PORT = Number(process.env.WITNESS_PORT ?? 3431);
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

let pg: Client; let next: ChildProcess | null = null;
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p as unknown[])).rows as any[];
const one = async (s: string, p: unknown[] = []) => (await q(s, p))[0];

function killNext() {
  if (!next?.pid) return;
  try { process.kill(-next.pid, 'SIGKILL'); } catch { /* gone */ }
  next = null;
}

const PASSAGE = 'The spiral is not a circle, fixated on its own return.';
const V1_TEXT = 'A first offer nobody chose.';
const V2_TEXT = 'The spiral is not a circle, steady on its own return.';
const V3_TEXT = 'A third formulation, abandoned.';
const V4_TEXT = 'THE HEAD — and adopting it would be the defect.';

let M = '', TOKEN = '';

interface Fixture {
  WK: string; DR: string; DS: string; DS2: string;
  threadId: string; chainId: string;
  v1: string; v2: string; v3: string; v4: string;
}

const api = (path: string, init?: RequestInit) =>
  fetch(`http://127.0.0.1:${PORT}${path}`, {
    ...init,
    headers: { 'x-session-token': TOKEN, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

/**
 * ⭐ ONE WORK PER LEG, so the legs cannot contaminate each other.
 *
 * ⛔ THE SECTIONS CARRY NO HEADING, and that is not cosmetic — see leg F, which
 * establishes what happens when they do.
 *
 * ⭐ `revision_count` is 1 while `version` is 41, DELIBERATELY. The chain's
 * historical locus takes `revision_count`; the authorizing act must mint its
 * `baseVersion` from the Work version it READ. Equal values would have hidden
 * the difference, which is exactly the trap the contract's own header names.
 */
async function makeFixture(title: string, heading: string | null = null): Promise<Fixture> {
  const WK = randomUUID(), LW = randomUUID(), DR = randomUUID();
  const SRC = randomUUID(), SRC2 = randomUUID(), DS = randomUUID(), DS2 = randomUUID();
  const stored = heading ? `${heading}\n\n${PASSAGE}` : PASSAGE;
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,$3)`, [LW, M, title]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
           VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)`, [WK, M, title]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,0,$3,$4)`, [SRC, WK, heading, PASSAGE]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,1,NULL,'A second place, so the draft can move without touching the first.')`,
    [SRC2, WK]);

  await q('BEGIN');
  await q(`INSERT INTO manuscript_working_drafts
             (id,manuscript_id,member_id,content,base_source_hash,revision_count,version,section_addressable_at)
           VALUES ($1,$2,$3,'','witness',1,41,NULL)`, [DR, WK, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,0,$3,$4)`, [DS, DR, stored, SRC]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,1,'A second place, so the draft can move without touching the first.',$3)`,
    [DS2, DR, SRC2]);
  /* ⛔ DERIVED, never asserted. The round-trip trigger is IMMEDIATE, so the
     draft is assembled non-addressable and declared addressable last. */
  await q(`UPDATE manuscript_working_drafts
              SET content = (SELECT COALESCE(string_agg(text,'' ORDER BY position),'')
                               FROM manuscript_draft_sections WHERE draft_id = $1),
                  section_addressable_at = now()
            WHERE id = $1`, [DR]);
  await q('COMMIT');

  /* ⭐ THE RELATIONSHIP IS OPENED THROUGH THE REAL ROUTE, naming only the
     section — every other fact is derived server-side. */
  const r = await api('/api/writers-studio/editorial/thread',
    { method: 'POST', body: JSON.stringify({ sectionId: DS }) });
  if (!r.ok) throw new Error(`thread open refused: ${r.status} ${await r.text()}`);
  const { threadId, chainId } = await r.json() as { threadId: string; chainId: string };

  /* ⭐ FOUR VERSIONS, and the one the member will choose is NOT the head. */
  const v1 = randomUUID(), v2 = randomUUID(), v3 = randomUUID(), v4 = randomUUID();
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'maia',$3,NULL)`, [v1, chainId, V1_TEXT]);
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'maia',$3,$4)`, [v2, chainId, V2_TEXT, v1]);
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'member',$3,$4)`, [v3, chainId, V3_TEXT, v2]);
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'member',$3,$4)`, [v4, chainId, V4_TEXT, v3]);
  return { WK, DR, DS, DS2, threadId, chainId, v1, v2, v3, v4 };
}

const adopt = async (threadId: string, versionId: string, extra: Record<string, unknown> = {}) => {
  const r = await api('/api/writers-studio/editorial/adoption',
    { method: 'POST', body: JSON.stringify({ threadId, versionId, ...extra }) });
  return { status: r.status, body: await r.json() as any };
};

const sectionText = async (id: string) =>
  (await one('SELECT text FROM manuscript_draft_sections WHERE id = $1', [id]))?.text as string;
const draftVersion = async (id: string) =>
  Number((await one('SELECT version FROM manuscript_working_drafts WHERE id = $1', [id]))?.version);
const auths = async (chainId: string, versionId: string) =>
  await q(`SELECT id, base_version, accepted_at, resulting_version, proposal_version_id,
                  work_id, draft_id, target_section_id, expected_text, operation
             FROM manuscript_revision_authorizations
            WHERE proposal_chain_id = $1 AND proposal_version_id = $2
            ORDER BY base_version`, [chainId, versionId]);

/** ⛔ NOT A SLEEP. Waits until N backends are actually blocked on a lock. */
async function waitBlocked(n: number, label: string) {
  const deadline = Date.now() + 30_000;
  for (;;) {
    const c = Number((await one(
      `SELECT count(*) c FROM pg_stat_activity
        WHERE datname = current_database() AND wait_event_type = 'Lock'`))?.c);
    if (c >= n) return true;
    if (Date.now() > deadline) { bad(`${label} · ${n} request(s) parked at the execution boundary`, `only ${c} blocked`); return false; }
    await new Promise((r) => setTimeout(r, 200));
  }
}

async function main() {
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const db = (await one('SELECT current_database() d')).d as string;
  if (!db.includes('witness')) { console.log(`REFUSED · '${db}' is not a witness database.`); process.exit(2); }

  M = randomUUID(); TOKEN = `witness-${randomUUID()}`;
  await q(`INSERT INTO members (id,passkey,username,password_hash,name)
           VALUES ($1,$2,$3,'x','A')`, [M, `AD-${M.slice(0, 8)}`, `ad-${M.slice(0, 8)}`]);
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

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' ADOPTION-01 · PHASE B · FIVE BEHAVIOURAL WITNESSES');
  console.log('══════════════════════════════════════════════════════════════════');

  /* ══ A · EXACT-VERSION AUTHORITY ════════════════════════════════════════
     ⭐⭐ Adoption means "the version I chose", ⛔ never "the newest version".
     v4 is the succession head; the member names v2. */
  console.log('\n── A · EXACT VERSION ─────────────────────────────────────────────');
  const A = await makeFixture('A · exact version');
  const ra = await adopt(A.threadId, A.v2);
  eq('A1 the gesture is applied', ra.body.kind, 'applied');
  eq('A2 ⭐ the manuscript carries the CHOSEN version', await sectionText(A.DS), V2_TEXT);
  const aText = await sectionText(A.DS);
  eq('A3 ⛔ the HEAD version did not land', aText.includes(V4_TEXT), false);
  eq('A4 ⛔ no other version landed either',
    aText === V1_TEXT || aText === V3_TEXT || aText === V4_TEXT, false);
  const aRows = await auths(A.chainId, A.v2);
  eq('A5 the durable permission names the chosen version', aRows.length, 1);
  eq('A6 ⛔ no permission was minted for the head', (await auths(A.chainId, A.v4)).length, 0);

  /* ══ B · SUCCESSFUL ADOPTION — THE COMPLETE CHAIN ═══════════════════════ */
  console.log('\n── B · SUCCESS ───────────────────────────────────────────────────');
  const b = aRows[0];
  eq('B1 the chain was DERIVED from the owned thread (never sent)', String(b.work_id), A.WK);
  eq('B2 the draft is the server\'s, not the caller\'s', String(b.draft_id), A.DR);
  eq('B3 the target section is the chain\'s', String(b.target_section_id), A.DS);
  /* ⭐⭐ THE DISCRIMINATOR. The chain's historical base is 1 (revision_count);
     the binding must carry 41 — the version the authorizing act READ. */
  const chainBase = Number((await one('SELECT base_version FROM proposal_chains WHERE id=$1', [A.chainId])).base_version);
  eq('B4 the chain\'s historical base is 1', chainBase, 1);
  eq('B5 ⭐⭐ the binding\'s base was MINTED from the Work it read, not copied',
    Number(b.base_version), 41);
  eq('B6 the expected text is the writer\'s own wording, server-read', String(b.expected_text), PASSAGE);
  eq('B7 the operation is the one primitive', String(b.operation), 'replace_exact_text');
  eq('B8 the receipt is whole · resultingVersion', Number(b.resulting_version), 42);
  eq('B9 the receipt is whole · acceptedAt present', b.accepted_at !== null, true);
  eq('B10 the manuscript advanced exactly once', await draftVersion(A.DR), 42);
  eq('B11 ⛔ the other section was not touched', await sectionText(A.DS2),
    'A second place, so the draft can move without touching the first.');
  const bContent = (await one('SELECT content FROM manuscript_working_drafts WHERE id=$1', [A.DR])).content;
  eq('B12 the compatibility content was DERIVED', bContent,
    `${await sectionText(A.DS)}${await sectionText(A.DS2)}`);
  eq('B13 the response reports the permission as established', ra.body.permission?.established, true);
  eq('B14 the response says THIS gesture performed the write', ra.body.byThisGesture, true);
  eq('B15 the status code does not disguise the outcome', ra.status, 200);

  /* ══ C · WORK MOVED ═════════════════════════════════════════════════════
     ⭐ The race is part of the contract, so it is made REAL — and made
     deterministic by parking the request at the execution boundary. */
  console.log('\n── C · WORK MOVED ────────────────────────────────────────────────');
  const C = await makeFixture('C · work moved');
  const { authorizeVersion } = await import('@/lib/manuscript/revisionAuthorization/store');
  const { saveSection } = await import('@/lib/manuscript/sections/saveSection');
  /* ⛔ PRE-ESTABLISHED ON PURPOSE, and said out loud: the witness needs a
     permission whose row it can lock BEFORE the gesture runs. The gesture
     itself still goes through the route. */
  const pre = await authorizeVersion(M, C.chainId, C.v2);
  if (!pre.ok) { bad('C0 pre-established permission', `refused: ${pre.reason}`); }
  const preId = pre.ok ? pre.authorization.id : '';

  const W = new Client({ connectionString: DSN }); await W.connect();
  await W.query('BEGIN');
  await W.query('SELECT id FROM manuscript_revision_authorizations WHERE id = $1 FOR UPDATE', [preId]);

  const cPending = adopt(C.threadId, C.v2);
  const parked = await waitBlocked(1, 'C');
  if (parked) ok('C1 the gesture passed authorization and parked at the execution boundary');
  /* ⭐ A LEGITIMATE WRITE, through the ordinary section writer, on the OTHER
     section — so the Work moves while the target's wording is untouched. */
  const moved = await saveSection(C.WK, M, C.DS2, 'The writer wrote here instead.', 41);
  eq('C2 the Work legitimately moved', moved.status, 'saved');
  await W.query('COMMIT'); await W.end();

  const rc = await cPending;
  eq('C3 ⭐⭐ the outcome is a MANUSCRIPT fact, not a system failure', rc.body.kind, 'work_moved');
  eq('C4 the reason is the stale base', rc.body.reason, 'stale_base');
  eq('C5 ⭐ the permission still exists and says so', rc.body.permission?.established, true);
  eq('C6 the target passage was NOT changed', await sectionText(C.DS), PASSAGE);
  eq('C7 the draft moved only by the writer\'s own save', await draftVersion(C.DR), 42);
  eq('C8 ⛔ work_moved is not reported as an error', rc.status, 200);
  const cRows = await auths(C.chainId, C.v2);
  eq('C9 ⭐ the gesture RECOVERED the existing permission — one row, not two', cRows.length, 1);
  eq('C10 and it is the same durable permission', String(cRows[0].id), preId);
  eq('C11 the permission is unspent', cRows[0].accepted_at, null);

  /* ══ D · RECOVERY / NATURAL IDENTITY ════════════════════════════════════ */
  console.log('\n── D · RECOVERY / NATURAL IDENTITY ───────────────────────────────');
  /* ⭐ C9–C11 already established: same legitimate base → RECOVER. */
  ok('D1 same legitimate base → the existing permission is recovered (C9–C11)');
  /* ⭐⭐ New legitimate base → a NEW permission for the newly read state, and
     the stale one may not dominate it. */
  const rd = await adopt(C.threadId, C.v2);
  eq('D2 the adoption at the new base is applied', rd.body.kind, 'applied');
  const dRows = await auths(C.chainId, C.v2);
  eq('D3 ⭐ a second permission exists, for the newly read Work', dRows.length, 2);
  eq('D4 the bases are the two Work states that were read',
    dRows.map((r: any) => Number(r.base_version)).join(','), '41,42');
  eq('D5 ⛔ the stale permission did not dominate — it is still unspent',
    dRows[0].accepted_at, null);
  eq('D6 the new permission is the one that was spent', dRows[1].accepted_at !== null, true);
  eq('D7 the identities are different', dRows[0].id !== dRows[1].id, true);
  eq('D8 the manuscript now carries the chosen version', await sectionText(C.DS), V2_TEXT);
  /* ⛔ NO CALLER IDEMPOTENCY TOKEN. */
  const rdk = await adopt(A.threadId, A.v2, { idempotencyKey: 'anything' });
  eq('D9 ⛔ a caller idempotency token is REFUSED', rdk.status, 400);
  eq('D10 and it is NAMED rather than ignored',
    typeof rdk.body.error === 'string' && rdk.body.error.includes('idempotencyKey'), true);
  const rdb = await adopt(A.threadId, A.v2, { baseVersion: 41 });
  eq('D11 ⛔ a caller baseVersion is REFUSED and named',
    rdb.status === 400 && String(rdb.body.error).includes('baseVersion'), true);

  /* ══ E · REFUSAL AND ALREADY-APPLIED ════════════════════════════════════ */
  console.log('\n── E1 · SYSTEM REFUSAL ───────────────────────────────────────────');
  const E1 = await makeFixture('E1 · system refusal');
  /* ⭐ A draft that is not section-addressable. `authorizeVersion` does not ask
     — the section writer does — so authorization SUCCEEDS and execution
     refuses. That is precisely the authorize-then-refuse shape. */
  await q('UPDATE manuscript_working_drafts SET section_addressable_at = NULL WHERE id = $1', [E1.DR]);
  const re1 = await adopt(E1.threadId, E1.v2);
  eq('E1a ⛔ SYSTEM language, not a claim about the book', re1.body.kind, 'system_refusal');
  eq('E1b the reason is the writer refusing, named exactly', re1.body.reason, 'write_refused');
  eq('E1c ⭐ the permission WAS established and says so', re1.body.permission?.established, true);
  eq('E1d the manuscript is unchanged', await sectionText(E1.DS), PASSAGE);
  eq('E1e the draft did not advance', await draftVersion(E1.DR), 41);
  eq('E1f a system refusal is visible to operations', re1.status, 409);

  console.log('\n── E2 · ALREADY APPLIED ──────────────────────────────────────────');
  const E2 = await makeFixture('E2 · already applied');
  const pre2 = await authorizeVersion(M, E2.chainId, E2.v2);
  if (!pre2.ok) bad('E2-0 pre-established permission', `refused: ${pre2.reason}`);
  const pre2Id = pre2.ok ? pre2.authorization.id : '';
  const W2 = new Client({ connectionString: DSN }); await W2.connect();
  await W2.query('BEGIN');
  await W2.query('SELECT id FROM manuscript_revision_authorizations WHERE id = $1 FOR UPDATE', [pre2Id]);
  /* ⭐⭐ TWO REAL GESTURES. Both recover the same permission and both park at
     the execution boundary; exactly one may perform the write. */
  const g1 = adopt(E2.threadId, E2.v2);
  const g2 = adopt(E2.threadId, E2.v2);
  const parked2 = await waitBlocked(2, 'E2');
  if (parked2) ok('E2a both gestures parked at the execution boundary');
  await W2.query('COMMIT'); await W2.end();
  const [o1, o2] = await Promise.all([g1, g2]);
  const kinds = [o1.body.kind, o2.body.kind].sort().join(',');
  eq('E2b both gestures report APPLIED — the version IS in the manuscript', kinds, 'applied,applied');
  const gestures = [o1.body.byThisGesture, o2.body.byThisGesture].sort().join(',');
  eq('E2c ⭐⭐ exactly ONE says it performed the write', gestures, 'false,true');
  eq('E2d the manuscript advanced exactly once', await draftVersion(E2.DR), 42);
  eq('E2e the manuscript carries the chosen version', await sectionText(E2.DS), V2_TEXT);
  const e2Rows = await auths(E2.chainId, E2.v2);
  eq('E2f one permission, spent once', e2Rows.length, 1);
  eq('E2g ⛔ nothing was written twice', Number(e2Rows[0].resulting_version), 42);

  /* ══ F · ⚠️ A SECTION THAT CARRIES A HEADING ════════════════════════════
     ⛔ NOT A REPAIR. This leg exists to establish what canonical does today
     when the passage sits under a heading, because every leg above used a
     heading-less section and a witness that only tests the easy shape reports
     on itself. */
  console.log('\n── F · HEADING-BEARING SECTION (observation) ─────────────────────');
  const F = await makeFixture('F · headed', 'Chapter Ten');
  const rf = await adopt(F.threadId, F.v2);
  console.log(`  OBSERVED  kind=${rf.body.kind} reason=${rf.body.reason ?? '—'} `
    + `permission=${rf.body.permission?.established ?? '—'} status=${rf.status}`);
  console.log(`  OBSERVED  section text unchanged: ${(await sectionText(F.DS)) === `Chapter Ten\n\n${PASSAGE}`}`);
  const fChain = await one('SELECT expected_text FROM proposal_chains WHERE id=$1', [F.chainId]);
  console.log(`  OBSERVED  chain expected_text starts with the heading: `
    + `${String(fChain.expected_text).startsWith('Chapter Ten')}`);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  killNext(); await pg.end();
  process.exit(fail === 0 ? 0 : 1);
}

void main().catch(async (e) => {
  console.log(`  ⛔ WITNESS ABORTED — ${e instanceof Error ? e.stack : String(e)}`);
  killNext(); await pg?.end().catch(() => {}); process.exit(2);
});
