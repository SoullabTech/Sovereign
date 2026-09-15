/**
 * ASK-WORK-ANCHOR-01 · B1 — a refusal leaves no evidence of a relationship.
 *
 * ⭐ THE BEHAVIOURAL HALF. Every refusal the Ask POST can reach TODAY is fired
 * against a real server and a real database, and after each one the member's
 * thread and turn counts must still be zero.
 *
 * ⛔ THE DECISIVE BRANCH IS NOT AMONG THEM, AND SAYING SO IS THE POINT.
 * `no_reading` is unreachable while `parseAnchor` admits only proposal-bearing
 * anchors, so its behavioural proof is OWED AT B3, where widening makes it
 * reachable. Here it is held by a source assertion and a falsified mutant; ⛔ a
 * witness that implied otherwise would be claiming a run it never made.
 *
 * ⛔ DISPOSABLE DATABASES ONLY.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const DSN = process.env.DATABASE_URL!;
const PORT = Number(process.env.WITNESS_PORT ?? 3471);
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

let M = '', OTHER = '', TOKEN = '', OTHER_TOKEN = '', WK = '', OTHER_WK = '', DS = '';

const post = async (workId: string, body: unknown, token = TOKEN, rawBody?: string) =>
  fetch(`http://127.0.0.1:${PORT}/api/sovereign/manuscripts/${workId}/ask`, {
    method: 'POST',
    headers: { 'x-session-token': token, 'Content-Type': 'application/json' },
    body: rawBody ?? JSON.stringify(body),
  });

/** ⭐ Scoped to THIS run's member — a global count can be moved by anyone. */
const rows = async () => ({
  threads: Number((await one('SELECT count(*) n FROM ask_threads WHERE member_id = $1', [M])).n),
  turns: Number((await one(
    `SELECT count(*) n FROM ask_turns u
       JOIN ask_threads t ON t.id = u.thread_id WHERE t.member_id = $1`, [M])).n),
});

async function refuses(label: string, res: Response, expectStatus: number) {
  const body = await res.json().catch(() => ({} as any));
  eq(`${label} · status`, res.status, expectStatus);
  const after = await rows();
  eq(`${label} · ⛔ 0 ask_threads`, after.threads, 0);
  eq(`${label} · ⛔ 0 ask_turns`, after.turns, 0);
  return body;
}

async function main() {
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const db = (await one('SELECT current_database() d')).d as string;
  if (!db.includes('witness')) { console.log(`REFUSED · '${db}' is not a witness database.`); process.exit(2); }

  const mk = async (name: string) => {
    const id = randomUUID(), lw = randomUUID(), wk = randomUUID(), tok = `witness-${randomUUID()}`;
    await q(`INSERT INTO members (id,passkey,username,password_hash,name)
             VALUES ($1,$2,$3,'x',$4)`, [id, `B1-${id.slice(0, 8)}`, `b1-${id.slice(0, 8)}`, name]);
    await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
             VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [id, tok]);
    await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,$3)`, [lw, id, name]);
    await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
             VALUES ($1,'manuscript',$2,$3)`, [lw, wk, id]);
    await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)`, [wk, id, name]);
    return { id, wk, tok };
  };
  const a = await mk('B1 Member'); M = a.id; WK = a.wk; TOKEN = a.tok;
  const b = await mk('Other Member'); OTHER = b.id; OTHER_WK = b.wk; OTHER_TOKEN = b.tok;

  /* A section, so the section anchor names something real and is still refused. */
  const DR = randomUUID(), SRC = randomUUID(); DS = randomUUID();
  const TEXT = 'Before the water, there was a sound.';
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
           VALUES ($1,$2,0,NULL,$3)`, [SRC, WK, TEXT]);
  await q('BEGIN');
  await q(`INSERT INTO manuscript_working_drafts
             (id,manuscript_id,member_id,content,base_source_hash,revision_count,version,section_addressable_at)
           VALUES ($1,$2,$3,'','b1',1,1,NULL)`, [DR, WK, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,0,$3,$4)`, [DS, DR, TEXT, SRC]);
  await q(`UPDATE manuscript_working_drafts
              SET content = (SELECT COALESCE(string_agg(text,'' ORDER BY position),'')
                               FROM manuscript_draft_sections WHERE draft_id = $1),
                  section_addressable_at = now() WHERE id = $1`, [DR]);
  await q('COMMIT');

  next = spawn('node_modules/.bin/next', ['dev', '-p', String(PORT)], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: true,
    env: { ...process.env, DATABASE_URL: DSN },
  });
  const deadline = Date.now() + 300_000;
  for (;;) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/api/health`); if (r.status < 500) break; } catch { /* waiting */ }
    if (Date.now() > deadline) { console.log('  ⛔ NOT RUN — next dev did not become ready'); killNext(); process.exit(2); }
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' ASK-WORK-ANCHOR-01 · B1 · NO REFUSAL LEAVES EVIDENCE');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const Q = { question: 'What is this chapter doing?' };

  await refuses('Z1 unauthenticated',
    await post(WK, Q, 'not-a-session'), 401);
  await refuses('Z2 another member’s Work',
    await post(OTHER_WK, Q), 404);
  await refuses('Z3 malformed JSON',
    await post(WK, null, TOKEN, '{ this is not json'), 400);
  await refuses('Z4 no question',
    await post(WK, { anchor: { on: 'work' } }), 400);
  await refuses('Z5 question too long',
    await post(WK, { ...Q, question: 'x'.repeat(50_000), anchor: { on: 'work' } }), 413);

  /* ⭐⭐ THE ANCHOR THIS ACT IS ABOUT — still refused AT THE BOUNDARY, and still
     writing nothing. ⛔ B1 repaired the ordering; it did NOT widen anything. */
  const w = await refuses('Z6 ⭐ {on:"work"} — still refused at the boundary',
    await post(WK, { ...Q, anchor: { on: 'work' } }), 422);
  eq('Z6b and the refusal names the boundary, not a reading', w.refusal, 'anchor_unknown');

  const sec = await refuses('Z7 {on:"section"} — likewise closed',
    await post(WK, { ...Q, anchor: { on: 'section', sectionId: DS } }), 422);
  eq('Z7b same refusal', sec.refusal, 'anchor_unknown');

  await refuses('Z8 an admitted anchor whose proposal does not exist',
    await post(WK, { ...Q, anchor: { on: 'division', proposalId: randomUUID(), unitId: 'u1' } }), 404);
  await refuses('Z9 an unknown threadId',
    await post(WK, { ...Q, threadId: randomUUID() }), 404);

  const final = await rows();
  eq('Z10 ⭐⭐ after every refusal the member has no conversation at all · threads',
    final.threads, 0);
  eq('Z11 ⭐⭐ … and no turns', final.turns, 0);

  console.log('\n  ⚠️ NOT WITNESSED HERE: `no_reading` before persistence. It is');
  console.log('     unreachable while the boundary admits only proposal-bearing');
  console.log('     anchors — held by a source assertion and a falsified mutant,');
  console.log('     and OWED behaviourally at B3.');

  console.log(`\n  ${pass} passed · ${fail} failed`);
  killNext(); await pg.end();
  process.exit(fail === 0 ? 0 : 1);
}

void main().catch(async (e) => {
  console.log(`  ⛔ WITNESS ABORTED — ${e instanceof Error ? e.stack : String(e)}`);
  killNext(); await pg?.end().catch(() => {}); process.exit(2);
});
