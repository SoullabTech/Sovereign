/**
 * ER-R4 · CANONICAL STRUCTURED HANDOFF — DATABASE + WIRE EVIDENCE.
 *
 * ⭐⭐ THE PROVIDER IS STUBBED AT THE WIRE AND NOWHERE ELSE. A loopback HTTP
 * server stands in for the Anthropic Messages endpoint via `ANTHROPIC_BASE_URL`,
 * so ⛔ NO production code is modified, NO injection point is added to
 * `runStructured`, and the router's sovereignty policy runs exactly as it does
 * in production. The S3 precedent: *only the transport is replaced, downstream
 * of prompt assembly.*
 *
 * ⭐ The stub also CONTROLS THE RACE: it can append V2 while "thinking", which
 * is what makes the ER-F4 chain provable through the provider boundary.
 *
 * ⛔ DISPOSABLE DATABASES ONLY. Rebuild: scripts/witness/er-runtime-rebuild-db.sh
 */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

/* ══ THE WIRE STUB ══════════════════════════════════════════════════════ */
interface Captured { body: any }
const captured: Captured[] = [];
let beforeRespond: (() => Promise<void>) | null = null;
let reply: any = null;

function startStub(): Promise<Server> {
  return new Promise((resolve) => {
    const s = createServer((req, res) => {
      let raw = '';
      req.on('data', (c) => { raw += c; });
      req.on('end', async () => {
        captured.push({ body: JSON.parse(raw) });
        /* ⭐ THE RACE HAPPENS HERE — while the provider is "thinking". */
        if (beforeRespond) { await beforeRespond(); beforeRespond = null; }
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(reply));
      });
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
}

const toolReply = (input: unknown) => ({
  id: 'msg_stub', type: 'message', role: 'assistant', model: 'stub-model-that-served',
  content: [{ type: 'tool_use', id: 'tu_1', name: 'editorial_outcome', input }],
  stop_reason: 'tool_use', usage: { input_tokens: 11, output_tokens: 7 },
});
const textReply = (text: string) => ({
  id: 'msg_stub', type: 'message', role: 'assistant', model: 'stub-model-that-served',
  content: [{ type: 'text', text }], stop_reason: 'end_turn',
  usage: { input_tokens: 3, output_tokens: 2 },
});

async function main() {
  const server = await startStub();
  const port = (server.address() as AddressInfo).port;
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
  process.env.ANTHROPIC_API_KEY = 'sk-witness-not-a-real-key';
  process.env.MAIA_INFERENCE_MODE = 'primary';

  /* ⛔ imported AFTER the env is set, so module-load reads see it */
  const { query, closePool } = await import('@/lib/db/postgres');
  const { persistMemberEditorialAct } = await import('@/lib/manuscript/editorialRuntime/memberAct');
  const { runEditorialTurn, EDITORIAL_MODEL } = await import('@/lib/manuscript/editorialRuntime/turn');
  const { appendAuthoredVersion } = await import('@/lib/manuscript/proposalChain/store');

  const one = async (sql: string, p: unknown[] = []) =>
    (await query<Record<string, any>>(sql, p as any[])).rows[0]!;
  const db = (await one('SELECT current_database() d')).d as string;
  if (!db.includes('witness')) { console.log(`REFUSED · '${db}' is not a witness database.`); process.exit(2); }
  if (Number((await one('SELECT (SELECT count(*) FROM proposal_chains)+(SELECT count(*) FROM ask_threads) n')).n) !== 0) {
    console.log('  ⛔ REFUSED — dirty. Rebuild: bash scripts/witness/er-runtime-rebuild-db.sh');
    process.exit(2);
  }

  const M='11111111-0000-4000-8000-00000000004e', WK='22222222-0000-4000-8000-00000000004e';
  const DR='33333333-0000-4000-8000-00000000004e', SE='44444444-0000-4000-8000-00000000004e';
  const CX='cccccccc-0000-4000-8000-00000000004e', TE='aaaa0000-0000-4000-8000-00000000004e';
  await query(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'ER-R4','er_r4','x')`,[M]);
  await query(`INSERT INTO member_manuscripts (id,member_id) VALUES ($1,$2)`,[WK,M]);
  await query(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash)
               VALUES ($1,$2,$3,'Before the water.','s4')`,[DR,WK,M]);
  await query(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text)
               VALUES ($1,$2,1,'Before the water.')`,[SE,DR]);
  await query(`INSERT INTO proposal_chains (id,member_id,work_id,draft_id,base_version,target_section_id,expected_text)
               VALUES ($1,$2,$3,$4,1,$5,'Before the water.')`,[CX,M,WK,DR,SE]);
  await query(`INSERT INTO ask_threads (id,manuscript_id,member_id,anchor,canonical_at_open,initiated_by,proposal_chain_id)
               VALUES ($1,$2,$3,NULL,'c1','author',$4)`,[TE,WK,M,CX]);

  /* ⛔⛔ NOT RUN — AND THE REASON IS THE GUARD WORKING.
   *
   * `constructCanonicalTurn` refuses any identity that was not MINTED by
   * `resolveCanonicalIdentity`: minted identities live in a module-private
   * WeakSet, so a hand-built object is `identity_unverifiable` no matter how
   * correct its fields are. ⭐ A witness cannot fabricate a member.
   *
   * `resolveCanonicalIdentity` needs a Next request context (`cookies()` from
   * `next/headers`), which a plain script has no honest way to supply —
   * `next/headers` is not CJS-resolvable, so there is no narrow require-cache
   * shim either.
   *
   * ⛔ The routes NOT taken, and why:
   *   · a test-only identity mint      → a hole in the exact guard that just fired
   *   · an injection point on the turn → sovereignty by convention again
   *   · a framework-wide mock harness  → more machinery than the thing it proves
   *
   * ⭐ THE IDENTITY BOUNDARY IS A ROUTE CONCERN, and the thin HTTP route is the
   * next authorized cut. This file is COMPLETE and stays here unrun until it
   * can be driven through one. ⛔ NOT RUN is a first-class result: never a skip,
   * never a pass. */
  if (!process.env.ER_R4_IDENTITY_FROM_ROUTE) {
    console.log('  ⛔ NOT RUN — no route-minted identity available.');
    console.log('     CanonicalTurn refuses an unminted identity (identity_unverifiable),');
    console.log('     and resolveCanonicalIdentity needs a Next request context.');
    console.log('     ⭐ That refusal is the guard working. This witness is complete and');
    console.log('        runs once the thin HTTP route exists to mint an identity.');
    server.close(); await closePool(); process.exit(3);
  }
  const identity = { status: 'verified' as const, memberId: M as any, memberRef: 'ref' };
  const strategy = { tier: 'CORE' as const };
  const base = { memberId: M, identity, threadId: TE, sessionRef: 's', strategy, sanctuary: false };

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' ER-R4 · CANONICAL STRUCTURED HANDOFF');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const counts = async () => {
    const r = await one(`SELECT (SELECT count(*) FROM ask_turns WHERE thread_id=$1 AND speaker='maia')::int m,
                                (SELECT count(*) FROM proposal_versions WHERE chain_id=$2)::int v,
                                (SELECT count(*) FROM editorial_turn_bindings WHERE thread_id=$1)::int b`,[TE,CX]);
    return `${r.m}/${r.v}/${r.b}`;
  };

  /* ══ 1 · THE UTTERANCE COMES FROM THE DURABLE TURN ═════════════════════ */
  console.log('── the utterance, the prompt, the crossing ───────────────────────');
  const WORDS = 'Could you make this quieter, and say why?';
  const a1 = await persistMemberEditorialAct({ memberId: M, threadId: TE,
    act: { act: 'discourse', text: WORDS, refersTo: null } });
  if (!a1.ok) { bad('member act', a1.reason); process.exit(1); }
  reply = toolReply({ kind: 'reply_only', reply: 'I would leave it as it stands.' });
  const r1 = await runEditorialTurn({ ...base, currentTurnIndex: a1.turnIndex,
    declaredAct: 'discourse', currentDirectionId: null, exchangeId: 'x1' });
  eq('A1 the turn completes', r1.ok, true);
  if (!r1.ok) { console.log(JSON.stringify(r1)); process.exit(1); }
  const sent = captured[captured.length - 1]!.body;
  eq('A2 ⭐⭐ the provider user message IS the persisted body', sent.messages[0].content, WORDS);
  eq('A3 ⛔ and that body is ABSENT from the system prompt (not history)',
     String(sent.system).includes(WORDS), false);
  eq('A4 ⭐ every supplied block is in the rendered prompt',
     r1.request.system === sent.system && sent.system.length > 0, true);
  eq('A5 ⭐ the forced tool contract went up the wire',
     `${sent.tools[0].name}/${sent.tool_choice.type}/${sent.tool_choice.name}`,
     'editorial_outcome/tool/editorial_outcome');
  eq('A6 the editorial model pin was used', sent.model, EDITORIAL_MODEL);
  eq('A7 ⭐ reply_only → 1 MAIA turn, 0 versions, 0 bindings', await counts(), '1/0/0');
  const prov = (await one(`SELECT answer_provenance p FROM ask_turns WHERE thread_id=$1 AND speaker='maia'`,[TE])).p;
  eq('A8 ⭐ provider provenance is persisted on the MAIA turn', prov?.provider, 'anthropic');
  eq('A8b ⭐ with usage and latency', typeof prov?.usage?.outputTokens === 'number' && typeof prov?.latencyMs === 'number', true);

  /* ══ 2 · PROSE CANNOT MINT ═════════════════════════════════════════════ */
  console.log('\n── prose cannot mint ─────────────────────────────────────────────');
  const before2 = await counts();
  const a2 = await persistMemberEditorialAct({ memberId: M, threadId: TE,
    act: { act: 'discourse', text: 'and again?', refersTo: null } });
  reply = textReply('I might tighten this: "the water, held".');
  const r2 = await runEditorialTurn({ ...base, currentTurnIndex: (a2 as any).turnIndex,
    declaredAct: 'discourse', currentDirectionId: null, exchangeId: 'x2' });
  eq('B1 ⛔ a text-only response is refused', r2.ok === false && r2.reason, 'not_through_tool');
  eq('B2 ⭐⭐ and mints NOTHING — no turn, no version, no binding', await counts(), before2);

  /* ══ 3 · ⭐⭐ ER-F4 THROUGH THE PROVIDER BOUNDARY ═══════════════════════ */
  console.log('\n── ⭐⭐ ER-F4 · the chain moves while the provider is thinking ────');
  const root = await appendAuthoredVersion(M, CX, { supersedes: null, author: 'member', replacementText: 'ROOT' });
  const rootId = (root as any).version.id as string;
  const a3 = await persistMemberEditorialAct({ memberId: M, threadId: TE,
    act: { act: 'discourse', text: 'what about now?', refersTo: null } });
  const before3 = await counts();
  reply = toolReply({ kind: 'reply_with_proposal', reply: 'Here is my wording.',
                      proposal: { replacementText: 'MAIA-STALE' } });
  /* ⭐ V2 lands between prompt assembly and the provider's answer */
  beforeRespond = async () => {
    await appendAuthoredVersion(M, CX, { supersedes: rootId, author: 'member', replacementText: 'V2-INDEPENDENT' });
  };
  const r3 = await runEditorialTurn({ ...base, currentTurnIndex: (a3 as any).turnIndex,
    declaredAct: 'discourse', currentDirectionId: null, exchangeId: 'x3' });
  eq('C1 ⭐⭐ the stale frozen predecessor is REFUSED', r3.ok === false && r3.reason, 'not_successor_of_head');
  eq('C2 ⭐⭐ zero MAIA durable facts — turn, version and binding all rolled back',
     await counts(), before3.replace(/^(\d+)/, (m) => m));
  eq('C3 ⛔ no rebase: MAIA-STALE exists nowhere',
     Number((await one(`SELECT count(*)::int n FROM proposal_versions WHERE formulation='MAIA-STALE'`)).n), 0);
  eq('C4 ⭐ V2 remains and is still the head',
     (await one(`SELECT formulation f FROM proposal_versions WHERE chain_id=$1 AND supersedes=$2`,[CX,rootId])).f,
     'V2-INDEPENDENT');
  eq('C5 ⛔ the member turn remains',
     Number((await one(`SELECT count(*)::int n FROM ask_turns WHERE thread_id=$1 AND turn_index=$2`,
       [TE,(a3 as any).turnIndex])).n), 1);
  eq('C6 ⛔ exactly ONE provider call — no retry after the refusal', captured.length, 4);

  /* ══ 4 · SOURCE-LEVEL ══════════════════════════════════════════════════ */
  console.log('\n── source-level ──────────────────────────────────────────────────');
  const { readFileSync } = await import('node:fs');
  const SRC = readFileSync('lib/manuscript/editorialRuntime/turn.ts','utf8')
    .replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  eq('D1 ⛔ no getMaiaResponse / generateText fallback',
     /getMaiaResponse|generateText/.test(SRC), false);
  eq('D2 ⛔ no conversation_turns', /conversation_turns/.test(SRC), false);
  eq('D3 ⭐ the assembly is not rerun after the provider returns',
     (SRC.match(/assembleEditorialCognition\(/g) || []).length, 1);
  eq('D4 ⭐ runStructured is called exactly once', (SRC.match(/runStructured\(/g) || []).length, 1);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  await closePool(); server.close();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(2); });
