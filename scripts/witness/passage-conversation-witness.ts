/** Real HTTP/database witness. Disposable local database and invented writing only.
 * Live MAIA leg starts with no versions; seeded alternatives exercise exact-version selection separately. */
import { openSync } from 'node:fs';
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const DSN = process.env.DATABASE_URL!;
const PORT = Number(process.env.WITNESS_PORT ?? 3438);
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
async function makeWorkOnly(title: string, heading: string | null) {
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

  return { WK, DR, DS, DS2, stored };
}

/** ⭐ FOUR VERSIONS, and the one the member will choose is NOT the head. */
async function authorVersions(chainId: string) {
  const v1 = randomUUID(), v2 = randomUUID(), v3 = randomUUID(), v4 = randomUUID();
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'maia',$3,NULL)`, [v1, chainId, V1_TEXT]);
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'maia',$3,$4)`, [v2, chainId, V2_TEXT, v1]);
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'member',$3,$4)`, [v3, chainId, V3_TEXT, v2]);
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'member',$3,$4)`, [v4, chainId, V4_TEXT, v3]);
  return { v1, v2, v3, v4 };
}

/** ⭐ The modern path: the relationship is opened through the REAL route,
 *  naming only the section — every other fact is derived server-side. */
async function makeFixture(title: string, heading: string | null = null, seedAlternatives = true): Promise<Fixture> {
  const w = await makeWorkOnly(title, heading);
  const r = await api('/api/writers-studio/editorial/thread',
    { method: 'POST', body: JSON.stringify({ sectionId: w.DS }) });
  if (!r.ok) throw new Error(`thread open refused: ${r.status} ${await r.text()}`);
  const { threadId, chainId } = await r.json() as { threadId: string; chainId: string };
  const v = seedAlternatives ? await authorVersions(chainId) : { v1: '', v2: '', v3: '', v4: '' };
  return { WK: w.WK, DR: w.DR, DS: w.DS, DS2: w.DS2, threadId, chainId, ...v };
}

/**
 * ⚠️ THE ARTIFACT THE PRE-ALIGNMENT PRODUCER LEFT BEHIND, REPRODUCED.
 *
 * ⭐⭐ IT PERFORMS THE HISTORICAL ACT RATHER THAN EDITING A MODERN ONE: one
 * chain INSERT carrying the STORED slice as `expected_text` — exactly what
 * `openEditorialRelationship` wrote before the alignment — and one thread
 * INSERT naming it, with `anchor` NULL, which is the schema's own definition of
 * an editorial thread.
 *
 * ⚠️ A FIRST ATTEMPT OPENED A MODERN RELATIONSHIP AND RE-POINTED THE THREAD AT A
 * LEGACY CHAIN. The database refused:
 *
 *     ask thread … is immutable in ownership, anchor, reading reference,
 *     canonical baseline and editorial parent: a thread cannot be re-pointed
 *     at a reading or a proposal it was not about
 *
 * ⭐ The guard was right and the fixture was wrong — and the refusal made the
 * fixture more faithful, not less: a legacy relationship was BORN legacy, and
 * the witness now builds one that way.
 */
async function makeLegacyFixture(title: string, heading: string | null): Promise<Fixture> {
  const w = await makeWorkOnly(title, heading);
  const chainId = randomUUID(), threadId = randomUUID();
  /* ⛔ `w.stored` — the STORED slice, heading prefix included. That IS the
     defect, reproduced verbatim. */
  await q(`INSERT INTO proposal_chains
             (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text)
           VALUES ($1,$2,$3,$4,1,$5,$6)`, [chainId, M, w.WK, w.DR, w.DS, w.stored]);
  await q(`INSERT INTO ask_threads
             (id, manuscript_id, member_id, anchor, reading_identity,
              canonical_at_open, initiated_by, proposal_chain_id)
           VALUES ($1,$2,$3,NULL,NULL,$4,'author',$5)`,
    [threadId, w.WK, M, `draft:${w.DR}@1`, chainId]);
  const v = await authorVersions(chainId);
  return { WK: w.WK, DR: w.DR, DS: w.DS, DS2: w.DS2, threadId, chainId, ...v };
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
    cwd: process.cwd(), stdio: ['ignore', openSync('/tmp/ws-next-witness.txt', 'a'), openSync('/tmp/ws-next-witness.txt', 'a')], detached: true,
    env: { ...process.env, DATABASE_URL: DSN, WRITERS_STUDIO_EDITORIAL_ENABLED: '1' },
  });
  const deadline = Date.now() + 300_000;
  for (;;) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/api/health`); if (r.status < 500) break; } catch { /* waiting */ }
    if (Date.now() > deadline) { console.log('  ⛔ NOT RUN — next dev did not become ready'); killNext(); process.exit(2); }
    await new Promise((r) => setTimeout(r, 1500));
  }


  console.log('PASSAGE CONVERSATION · real HTTP and PostgreSQL · synthetic content only');
  const A = await makeFixture('Synthetic passage conversation', 'The spiral');
  const untouched = await sectionText(A.DS2);
  const selected = await adopt(A.threadId, A.v2);
  eq('exact alternative applied', selected.body.kind, 'applied');
  const receipt = selected.body.permission.authorizationId;
  const getThread = async () => (await api('/api/writers-studio/editorial/thread?threadId=' + A.threadId)).json() as Promise<any>;
  const reopened = await getThread();
  eq('application survives reread', reopened.application.authorizationId, receipt);
  eq('undo available after reread', reopened.application.canUndo, true);
  const undo = async (id: string, extra = {}) => {
    const r = await api('/api/writers-studio/editorial/undo', { method: 'POST', body: JSON.stringify({ authorizationId: id, ...extra }) });
    return { status: r.status, body: await r.json() as any };
  };
  eq('caller-supplied text rejected', (await undo(receipt, { replacementText: 'untrusted' })).status, 400);
  const anonymous = await fetch('http://127.0.0.1:' + PORT + '/api/writers-studio/editorial/undo', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ authorizationId: receipt }) });
  eq('unauthenticated undo refused', anonymous.status, 401);
  const reversed = await undo(receipt);
  eq('undo succeeds', reversed.body.kind, 'undone');
  eq('original passage and heading restored', await sectionText(A.DS), 'The spiral\n\n' + PASSAGE);
  eq('other section untouched', await sectionText(A.DS2), untouched);
  eq('repeat undo refuses', (await undo(receipt)).body.reason, 'already_undone');
  eq('undo receipt survives reread', (await getThread()).application.undone, true);
  const B = await makeFixture('Later writing protection');
  const b = await adopt(B.threadId, B.v2);
  const { saveSection } = await import('@/lib/manuscript/sections/saveSection');
  await saveSection(B.WK, M, B.DS2, 'Later writing must survive.', b.body.resultingVersion);
  eq('later writing blocks undo', (await undo(b.body.permission.authorizationId)).body.reason, 'work_moved');
  eq('later writing retained', await sectionText(B.DS2), 'Later writing must survive.');
  const C = await makeFixture('Deletion recovery');
  const empty = await api('/api/writers-studio/editorial/version', { method: 'POST',
    body: JSON.stringify({ threadId: C.threadId, supersedes: C.v4, replacementText: '', purpose: 'Leave silence' }) });
  const ev = await empty.json() as any;
  eq('empty member alternative saved', empty.status, 201);
  const deleted = await adopt(C.threadId, ev.versionId);
  eq('deletion applied', deleted.body.kind, 'applied');
  eq('deletion undo succeeds', (await undo(deleted.body.permission.authorizationId)).body.kind, 'undone');
  eq('deleted passage restored', await sectionText(C.DS), PASSAGE);
  const D = await makeFixture('Real MAIA conversation', null, false);
  const turn = async (text: string) => {
    const r = await api('/api/writers-studio/editorial/turn', { method: 'POST',
      body: JSON.stringify({ threadId: D.threadId, act: { act: 'discourse', text, refersTo: null } }) });
    const b = await r.json() as any;
    console.log('MAIA turn HTTP', r.status, 'outcome', b.kind ?? b.error ?? 'returned');
    return { status: r.status, body: b };
  };
  if (process.env.RUN_MAIA_WITNESS === '1') {
    const first = await turn('For this invented passage, offer more embodied wording while preserving the spiral as a return that brings change. Do not invent a personal story. Begin your rationale with "Editorial purpose: More embodied". Offer a proposal, explain possible reader benefit and what could be lost. Treat reader effects as hypotheses. Separate changes to meaning from changes to style. Use only supplied evidence.');
    if (first.status === 200) {
      ok('actual MAIA first turn returned');
      const second = await turn('Discuss the possibility you just offered. Make the ending quieter and keep the original meaning. Treat reader effects as hypotheses and identify any change in meaning separately from style. Offer a second proposal with rationale beginning "Editorial purpose: Quieter ending".');
      eq('actual MAIA follow-up returned', second.status, 200);
      const real = await (await api('/api/writers-studio/editorial/thread?threadId=' + D.threadId)).json() as any;
      const offered = real.versions.filter((v: any) => ![D.v1,D.v2,D.v3,D.v4].includes(v.id));
      if (!offered.length) bad('MAIA produced selectable wording', 'no proposal returned');
      else {
        const chosen = offered[offered.length - 1];
        const ownText = chosen.wording + ' The return is still a beginning.';
        const saved = await api('/api/writers-studio/editorial/version', { method: 'POST',
          body: JSON.stringify({ threadId: D.threadId, supersedes: chosen.id, replacementText: ownText, purpose: 'My quieter return' }) });
        eq('member edit of actual MAIA proposal saved', saved.status, 201);
        const memberVersion = await saved.json() as any;
        const applied = await adopt(D.threadId, memberVersion.versionId);
        eq('chosen member edit applied', applied.body.kind, 'applied');
        eq('exact chosen words persisted', await sectionText(D.DS), ownText);
        eq('chosen application reversed', (await undo(applied.body.permission.authorizationId)).body.kind, 'undone');
        eq('original restored after actual MAIA journey', await sectionText(D.DS), PASSAGE);
      }
      console.log('MAIA_REVIEW', JSON.stringify({ turns: real.turns, versions: real.versions.filter((v: any) => ![D.v1,D.v2,D.v3,D.v4].includes(v.id)) }));
    } else bad('actual MAIA conversation', JSON.stringify(first.body));
  } else console.log('NOT RUN · actual MAIA witness was not requested');
  console.log(JSON.stringify({ passed: pass, failed: fail }));
  killNext(); await pg.end();
  const { closePool } = await import('@/lib/db/postgres'); await closePool();
  process.exitCode = fail ? 1 : 0;
}
main().catch(e => { console.error(e.message); killNext(); process.exit(1); });
