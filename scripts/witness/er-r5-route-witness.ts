/**
 * ER-R5 · THE THIN EDITORIAL ROUTE — REAL HTTP, REAL IDENTITY, WIRE-STUBBED MODEL.
 *
 * ⭐⭐ NO IDENTITY SHIM ANYWHERE. The evidence path is the real one:
 *
 *     HTTP → getMemberIdFromRequest → auth_sessions → resolveCanonicalIdentity
 *          → the private WeakSet mint → route → R1 → R2 → canonical turn
 *          → wire-stubbed provider → admission → R3
 *
 * ⛔ No test-only mint. ⛔ No provider injection. The only substitution is the
 * TRANSPORT, via `ANTHROPIC_BASE_URL` — downstream of prompt assembly, with the
 * router's sovereignty policy running exactly as in production.
 *
 * ⛔ DISPOSABLE DATABASES ONLY. Rebuild: scripts/witness/er-runtime-rebuild-db.sh
 */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const DSN = process.env.DATABASE_URL!;
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

/* ══ THE WIRE STUB ══════════════════════════════════════════════════════ */
const captured: any[] = [];
let beforeRespond: (() => Promise<void>) | null = null;
let reply: any = null;
let reportedModel = 'claude-opus-5';

const toolReply = (input: unknown) => ({
  id: 'msg_stub', type: 'message', role: 'assistant', model: reportedModel,
  content: [{ type: 'tool_use', id: 'tu_1', name: 'editorial_outcome', input }],
  stop_reason: 'tool_use', usage: { input_tokens: 11, output_tokens: 7 },
});
const textReply = (text: string) => ({
  id: 'msg_stub', type: 'message', role: 'assistant', model: reportedModel,
  content: [{ type: 'text', text }], stop_reason: 'end_turn',
  usage: { input_tokens: 3, output_tokens: 2 },
});

let pg: Client;
let next: ChildProcess | null = null;
let stub: Server | null = null;

async function q(sql: string, p: unknown[] = []) { return (await pg.query(sql, p as any[])).rows; }
async function one(sql: string, p: unknown[] = []) { return (await q(sql, p))[0]; }

async function main() {
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const dbn = (await one('SELECT current_database() d')).d as string;
  if (!dbn.includes('witness')) { console.log(`REFUSED · '${dbn}' is not a witness database.`); process.exit(2); }
  if (Number((await one('SELECT (SELECT count(*) FROM proposal_chains)+(SELECT count(*) FROM ask_threads) n')).n) !== 0) {
    console.log('  ⛔ REFUSED — dirty. Rebuild: bash scripts/witness/er-runtime-rebuild-db.sh');
    process.exit(2);
  }

  stub = createServer((req, res) => {
    let raw = ''; req.on('data', (c) => { raw += c; });
    req.on('end', async () => {
      captured.push(JSON.parse(raw));
      if (beforeRespond) { await beforeRespond(); beforeRespond = null; }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(reply));
    });
  });
  await new Promise<void>((r) => stub!.listen(0, '127.0.0.1', () => r()));
  const stubPort = (stub!.address() as AddressInfo).port;

  /* ══ FIXTURES ══════════════════════════════════════════════════════════ */
  const M = randomUUID(), WK = randomUUID(), DR = randomUUID(), SE = randomUUID();
  const CX = randomUUID(), TE = randomUUID(), TOKEN = `witness-${randomUUID()}`;
  await q(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'ER-R5','er_r5','x')`, [M]);
  await q(`INSERT INTO member_manuscripts (id,member_id) VALUES ($1,$2)`, [WK, M]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash)
           VALUES ($1,$2,$3,'Before the water.','s5')`, [DR, WK, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text)
           VALUES ($1,$2,1,'Before the water.')`, [SE, DR]);
  await q(`INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text)
           VALUES ($1,$2,$3,$4,1,$5,'Before the water.')`, [CX, M, WK, DR, SE]);
  await q(`INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,canonical_at_open,initiated_by,proposal_chain_id)
           VALUES ($1,$2,$3,NULL,'c1','author',$4)`, [TE, WK, M, CX]);
  /* ⭐ A REAL SESSION CREDENTIAL. The identity is minted from this and nothing else. */
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '1 hour')`, [M, TOKEN]);

  /* ══ A REAL NEXT SERVER ════════════════════════════════════════════════ */
  const port = 3411;
  next = spawn('node_modules/.bin/next', ['dev', '-p', String(port)], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'],
    /* ⛔ DETACHED so the whole PROCESS GROUP can be killed. A first run left a
       `next-server` alive at 100% CPU after the witness exited: SIGKILL on the
       immediate child never reaches the server Next forks, and the next run
       stalled behind it. ⭐ A witness that leaves a process running is a witness
       that can wedge the machine it measured. */
    detached: true,
    env: { ...process.env,
      DATABASE_URL: DSN,
      WRITERS_STUDIO_EDITORIAL_ENABLED: '1',
      MAIA_INFERENCE_MODE: 'primary',
      ANTHROPIC_BASE_URL: `http://127.0.0.1:${stubPort}`,
      ANTHROPIC_API_KEY: 'sk-witness-not-a-real-key',
      MAIA_EDITORIAL_MODEL: 'claude-opus-5',
    },
  });
  const url = `http://127.0.0.1:${port}/api/writers-studio/editorial/turn`;
  const post = async (body: unknown, headers: Record<string, string> = {}) => {
    const r = await fetch(url, { method: 'POST',
      headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
    const text = await r.text();
    let json: any = null; try { json = JSON.parse(text); } catch { /* non-JSON is a result too */ }
    return { status: r.status, json, text };
  };
  /* wait for the server to actually serve */
  const deadline = Date.now() + 180_000;
  for (;;) {
    try { const r = await fetch(`http://127.0.0.1:${port}/api/health`); if (r.status < 500) break; } catch { /* not up */ }
    if (Date.now() > deadline) { console.log('  ⛔ NOT RUN — next dev did not become ready'); process.exit(2); }
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' ER-R5 · THIN ROUTE · REAL HTTP · REAL IDENTITY · WIRE-STUBBED MODEL');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const counts = async () => {
    const r = await one(`SELECT (SELECT count(*) FROM ask_turns WHERE thread_id=$1)::int t,
                                (SELECT count(*) FROM ask_turns WHERE thread_id=$1 AND speaker='maia')::int m,
                                (SELECT count(*) FROM proposal_versions WHERE chain_id=$2)::int v,
                                (SELECT count(*) FROM editorial_turn_bindings WHERE thread_id=$1)::int b`, [TE, CX]);
    return `${r.t}/${r.m}/${r.v}/${r.b}`;
  };
  const AUTH = { 'x-session-token': TOKEN };

  /* ══ GATE · AUTH · CLOSED SHAPE · SANCTUARY ════════════════════════════ */
  console.log('── the door ──────────────────────────────────────────────────────');
  const base0 = await counts();
  const unauth = await post({ threadId: TE, act: { act: 'discourse', text: 'hi', refersTo: null } });
  eq('G1 ⛔ no session → 401', unauth.status, 401);
  const stray = await post({ threadId: TE, chainId: CX,
    act: { act: 'discourse', text: 'hi', refersTo: null } }, AUTH);
  eq('G2 ⭐⭐ an unknown authority field is REFUSED, not ignored', stray.status, 400);
  eq('G2b and the refusal names it', String(stray.json?.error).includes('chainId'), true);
  const strayAct = await post({ threadId: TE,
    act: { act: 'discourse', text: 'hi', refersTo: null, chainId: CX } }, AUTH);
  eq('G3 ⛔ an unknown act field is refused too', strayAct.status, 400);
  const sanct = await post({ threadId: TE, sanctuary: true,
    act: { act: 'direction', text: 'quietly', refersTo: null } }, AUTH);
  eq('G4 ⭐⭐ Sanctuary is refused', sanct.status, 409);
  eq('G4b and names why', sanct.json?.error, 'sanctuary_unavailable');
  eq('G5 ⭐⭐ ZERO WRITES — the member’s words never reached ask_turns', await counts(), base0);
  eq('G6 ⛔ and no provider call was made', captured.length, 0);

  /* ══ THE ORDINARY TURN ═════════════════════════════════════════════════ */
  console.log('\n── an ordinary editorial turn, end to end ────────────────────────');
  const WORDS = 'Could you make this quieter, and say why?';
  reply = toolReply({ kind: 'reply_only', reply: 'I would leave it as it stands.' });
  const r1 = await post({ threadId: TE, act: { act: 'discourse', text: WORDS, refersTo: null } }, AUTH);
  eq('A1 the turn completes', r1.status, 200);
  if (r1.status !== 200) console.log('     ' + r1.text.slice(0, 300));
  eq('A2 ⭐ 2 turns · 1 MAIA · 0 versions · 0 bindings', await counts(), '2/1/0/0');
  const sent = captured[captured.length - 1];
  eq('A3 ⭐⭐ the provider user message IS the persisted member body',
     sent?.messages?.[0]?.content, WORDS);
  eq('A4 ⛔ and that body is ABSENT from the system prompt', String(sent?.system).includes(WORDS), false);
  eq('A5 ⭐ the forced editorial tool went up the wire',
     `${sent?.tools?.[0]?.name}/${sent?.tool_choice?.type}`, 'editorial_outcome/tool');
  eq('A6 ⭐ the response body is the PERSISTED MAIA turn',
     r1.json?.response,
     (await one(`SELECT body FROM ask_turns WHERE thread_id=$1 AND speaker='maia'`, [TE]))?.body);
  const prov = (await one(`SELECT answer_provenance p FROM ask_turns WHERE thread_id=$1 AND speaker='maia'`, [TE]))?.p;
  eq('A7 ⭐⭐ all three provenance facts are durable',
     `${prov?.model}/${prov?.reportedModel}/${prov?.modelAgreement}`,
     'claude-opus-5/claude-opus-5/agreed');
  eq('A8 ⛔ the response leaks no internals',
     ['systemPrompt', 'request', 'invocation', 'proof'].some((k) => k in (r1.json ?? {})), false);

  /* ══ NEGATIVE CONTROLS ═════════════════════════════════════════════════ */
  console.log('\n── negative controls ─────────────────────────────────────────────');
  let before = await counts();
  reply = textReply('I might tighten this: "the water, held".');
  const rText = await post({ threadId: TE, act: { act: 'discourse', text: 'and again?', refersTo: null } }, AUTH);
  eq('N1 ⛔ a text-only provider response fails the turn', rText.status, 502);
  eq('N1b ⭐ the member turn STANDS, MAIA mints nothing',
     (await counts()).split('/').slice(1).join('/'), before.split('/').slice(1).join('/'));

  before = await counts();
  reportedModel = 'some-other-model-entirely';
  reply = toolReply({ kind: 'reply_with_proposal', reply: 'Here.', proposal: { replacementText: 'FROM-ANOTHER-MODEL' } });
  const rMM = await post({ threadId: TE, act: { act: 'discourse', text: 'and if it differs?', refersTo: null } }, AUTH);
  eq('N2 ⭐⭐ a differing reported model is refused', rMM.json?.error, 'model_unattributable');
  eq('N2b ⭐⭐ zero MAIA durable facts',
     (await counts()).split('/').slice(1).join('/'), before.split('/').slice(1).join('/'));
  eq('N2c ⛔ its wording exists nowhere',
     Number((await one(`SELECT count(*)::int n FROM proposal_versions WHERE formulation='FROM-ANOTHER-MODEL'`)).n), 0);
  reportedModel = 'claude-opus-5';

  /* ══ ⭐⭐ ER-F4 THROUGH HTTP ════════════════════════════════════════════ */
  console.log('\n── ⭐⭐ ER-F4 · the chain moves while the provider is thinking ────');
  const ROOT = randomUUID(), V2 = randomUUID();
  await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
           VALUES ($1,$2,'member','ROOT',NULL)`, [ROOT, CX]);
  before = await counts();
  const callsBefore = captured.length;
  reply = toolReply({ kind: 'reply_with_proposal', reply: 'My wording.', proposal: { replacementText: 'MAIA-STALE' } });
  beforeRespond = async () => {
    await q(`INSERT INTO proposal_versions (id,chain_id,author,formulation,supersedes)
             VALUES ($1,$2,'member','V2-INDEPENDENT',$3)`, [V2, CX, ROOT]);
  };
  const rRace = await post({ threadId: TE, act: { act: 'discourse', text: 'what about now?', refersTo: null } }, AUTH);
  eq('F1 ⭐⭐ the stale frozen predecessor is refused', rRace.json?.error, 'not_successor_of_head');
  eq('F2 ⭐ the member turn REMAINS', rRace.json?.memberTurnIndex !== undefined, true);
  /* ⭐⭐ REPAIRED, AND THE REPAIR IS THE POINT.
   *
   * This first asserted the whole count string unchanged and failed on
   * `versions 1 → 2`. ⛔ That was NOT a stale MAIA fact: the second version is
   * V2-INDEPENDENT, inserted by the race itself, and F5 below REQUIRES it to
   * exist. The obligation had conflated *no stale MAIA facts* with *no new
   * versions at all*, so it would have failed the very state it was arranging.
   *
   * ⭐ The real claim is narrower and stronger: MAIA's turns and bindings did
   * not move, and the only new version is the independent one. */
  const after = (await counts()).split('/');
  const b4 = before.split('/');
  eq('F3a ⭐⭐ no stale MAIA turn', after[1], b4[1]);
  eq('F3b ⭐⭐ no stale binding', after[3], b4[3]);
  eq('F3c ⭐ versions grew by exactly ONE — the independent V2, not MAIA\u2019s',
     Number(after[2]) - Number(b4[2]), 1);
  eq('F4 ⛔ no rebase: MAIA-STALE exists nowhere',
     Number((await one(`SELECT count(*)::int n FROM proposal_versions WHERE formulation='MAIA-STALE'`)).n), 0);
  eq('F5 ⭐ V2 remains', (await one(`SELECT formulation f FROM proposal_versions WHERE id=$1`, [V2]))?.f, 'V2-INDEPENDENT');
  eq('F6 ⛔ exactly ONE provider call — no retry', captured.length - callsBefore, 1);

  /* ══ THE GATE ══════════════════════════════════════════════════════════ */
  console.log('\n── the feature gate ──────────────────────────────────────────────');
  console.log('   ⚠️ 404-when-disabled is asserted SOURCE-LEVEL here: this server was');
  console.log('      booted once, with the gate on. ⛔ Not claimed as behavioural.');
  const { readFileSync } = await import('node:fs');
  const SRC = readFileSync('app/api/writers-studio/editorial/turn/route.ts', 'utf8');
  eq('E1 [SOURCE] off by default → 404, never 403',
     /WRITERS_STUDIO_EDITORIAL_ENABLED === '1'/.test(SRC) && /status: 404/.test(SRC), true);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

const cleanup = () => {
  /* ⭐ NEGATIVE PID = THE WHOLE GROUP. */
  try { if (next?.pid) process.kill(-next.pid, 'SIGKILL'); } catch {}
  try { next?.kill('SIGKILL'); } catch {}
  try { stub?.close(); } catch {} try { pg?.end(); } catch {}
};
process.on('SIGINT', () => { cleanup(); process.exit(130); });
process.on('SIGTERM', () => { cleanup(); process.exit(143); });
process.on('exit', cleanup);
main().catch((e) => { console.error(e); cleanup(); process.exit(2); });
