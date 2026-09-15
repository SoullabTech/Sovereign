/**
 * WS-EDITORIAL-UI-01 · THE VISIBLE CONVERSATION — the founder's human witness,
 * executed over real HTTP against the durable runtime.
 *
 *     open editorial relationship
 *     → "Could you make this quieter?"  → see your persisted turn
 *     → see MAIA's persisted response
 *     → give an explicit Direction      → see MAIA return new candidate wording
 *     → close the pane → reopen it      → same conversation, same authorship
 *
 * ⭐⭐ "Close and reopen" is modelled the only way that proves anything: the
 * surface's state is DISCARDED and the conversation re-read from the server. A
 * component that kept a transcript would pass by remembering; this passes only
 * if the server remembers.
 *
 * ⛔ DISPOSABLE DATABASES ONLY. ⛔ Provider stubbed at the wire only.
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

const captured: any[] = [];
let reply: any = null;
const model = 'claude-opus-5';
const toolReply = (input: unknown) => ({
  id: 'm', type: 'message', role: 'assistant', model,
  content: [{ type: 'tool_use', id: 't', name: 'editorial_outcome', input }],
  stop_reason: 'tool_use', usage: { input_tokens: 9, output_tokens: 5 },
});

let pg: Client; let next: ChildProcess | null = null; let stub: Server | null = null;
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p as any[])).rows;
const one = async (s: string, p: unknown[] = []) => (await q(s, p))[0];

async function main() {
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const dbn = (await one('SELECT current_database() d')).d as string;
  if (!dbn.includes('witness')) { console.log(`REFUSED · '${dbn}' is not a witness database.`); process.exit(2); }
  if (Number((await one('SELECT (SELECT count(*) FROM proposal_chains)+(SELECT count(*) FROM ask_threads) n')).n) !== 0) {
    console.log('  ⛔ REFUSED — dirty. Rebuild: bash scripts/witness/er-runtime-rebuild-db.sh'); process.exit(2);
  }

  stub = createServer((req, res) => {
    let raw = ''; req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      captured.push(JSON.parse(raw));
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(reply));
    });
  });
  await new Promise<void>((r) => stub!.listen(0, '127.0.0.1', () => r()));
  const stubPort = (stub!.address() as AddressInfo).port;

  const M = randomUUID(), WK = randomUUID(), DR = randomUUID(), SE = randomUUID();
  const TOKEN = `witness-${randomUUID()}`;
  const SECTION_TEXT = 'Before the water, there was a sound.';
  await q(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'UI1','ui_1','x')`, [M]);
  await q(`INSERT INTO member_manuscripts (id,member_id) VALUES ($1,$2)`, [WK, M]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count)
           VALUES ($1,$2,$3,$4,'sha-ui1',3)`, [DR, WK, M, SECTION_TEXT]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text) VALUES ($1,$2,1,$3)`,
          [SE, DR, SECTION_TEXT]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '1 hour')`, [M, TOKEN]);

  const port = 3413;
  next = spawn('node_modules/.bin/next', ['dev', '-p', String(port)], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: true,
    env: { ...process.env, DATABASE_URL: DSN,
      WRITERS_STUDIO_EDITORIAL_ENABLED: '1', MAIA_INFERENCE_MODE: 'primary',
      ANTHROPIC_BASE_URL: `http://127.0.0.1:${stubPort}`,
      ANTHROPIC_API_KEY: 'sk-witness-not-a-real-key', MAIA_EDITORIAL_MODEL: model },
  });
  const AUTH = { 'content-type': 'application/json', 'x-session-token': TOKEN };
  const B = `http://127.0.0.1:${port}/api/writers-studio/editorial`;
  const call = async (u: string, init: RequestInit) => {
    const r = await fetch(u, init); const t = await r.text();
    let j: any = null; try { j = JSON.parse(t); } catch {}
    return { status: r.status, json: j, text: t };
  };
  const deadline = Date.now() + 180_000;
  for (;;) {
    try { const r = await fetch(`http://127.0.0.1:${port}/api/health`); if (r.status < 500) break; } catch {}
    if (Date.now() > deadline) { console.log('  ⛔ NOT RUN — next dev did not become ready'); process.exit(2); }
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' WS-EDITORIAL-UI-01 · THE VISIBLE CONVERSATION');
  console.log('══════════════════════════════════════════════════════════════════\n');

  /* ══ OPEN ══════════════════════════════════════════════════════════════ */
  console.log('── open an editorial relationship ────────────────────────────────');
  const stray = await call(`${B}/thread`, { method: 'POST', headers: AUTH,
    body: JSON.stringify({ sectionId: SE, workId: WK }) });
  eq('O1 ⛔ a server fact sent by the client is refused and named',
     stray.status === 400 && String(stray.json?.error).includes('workId'), true);
  const opened = await call(`${B}/thread`, { method: 'POST', headers: AUTH,
    body: JSON.stringify({ sectionId: SE }) });
  eq('O2 the relationship opens', opened.status, 200);
  const threadId = opened.json?.threadId as string;
  eq('O3 ⭐ it is EDITORIAL — anchor NULL, chain set',
     `${(await one('SELECT anchor FROM ask_threads WHERE id=$1', [threadId]))?.anchor}/${
        (await one('SELECT proposal_chain_id IS NOT NULL c FROM ask_threads WHERE id=$1', [threadId]))?.c}`,
     'null/true');
  eq('O4 ⭐ the locus froze the writer’s own wording',
     (await one('SELECT expected_text t FROM proposal_chains WHERE id=$1', [opened.json?.chainId]))?.t,
     SECTION_TEXT);
  eq('O5 ⭐ and the canonical BEFORE names the draft and its revision',
     (await one('SELECT canonical_at_open c FROM ask_threads WHERE id=$1', [threadId]))?.c,
     `draft:${DR}@3`);

  /* ══ SPEAK ═════════════════════════════════════════════════════════════ */
  console.log('\n── the writer speaks, MAIA answers ───────────────────────────────');
  const WORDS = 'Could you make this quieter?';
  reply = toolReply({ kind: 'reply_only', reply: 'It is already quite still. What feels loud to you?' });
  const t1 = await call(`${B}/turn`, { method: 'POST', headers: AUTH,
    body: JSON.stringify({ threadId, act: { act: 'discourse', text: WORDS, refersTo: null } }) });
  eq('S1 the turn completes', t1.status, 200);
  const v1 = await call(`${B}/thread?threadId=${threadId}`, { headers: AUTH });
  eq('S2 ⭐ the read door returns the durable conversation', v1.status, 200);
  eq('S3 ⭐ two turns, You then MAIA',
     v1.json.turns.map((t: any) => t.speaker).join('>'), 'author>maia');
  eq('S4 ⭐ the writer’s own words, exactly', v1.json.turns[0].body, WORDS);
  eq('S5 ⛔ an ordinary reply carries NO adjunct', v1.json.turns[1].adjunct, null);

  /* ══ DIRECT ════════════════════════════════════════════════════════════ */
  console.log('\n── an explicit Direction, and candidate wording back ─────────────');
  const INSTR = 'Cut the second clause entirely.';
  const WORDING = 'Before the water.';
  reply = toolReply({ kind: 'reply_with_proposal', reply: 'Then this.',
                      proposal: { replacementText: WORDING } });
  const t2 = await call(`${B}/turn`, { method: 'POST', headers: AUTH,
    body: JSON.stringify({ threadId, act: { act: 'direction', text: INSTR, refersTo: null } }) });
  eq('D1 the directed turn completes', t2.status, 200);
  const v2 = await call(`${B}/thread?threadId=${threadId}`, { headers: AUTH });
  eq('D2 ⭐ four turns now', v2.json.turns.length, 4);
  eq('D3 ⭐⭐ the member turn is visibly a DIRECTION, by its binding',
     `${v2.json.turns[2].speaker}/${v2.json.turns[2].adjunct?.kind}`, 'author/direction');
  eq('D4 ⭐ and its instruction IS the turn body, character for character',
     v2.json.turns[2].adjunct.instruction, v2.json.turns[2].body);
  eq('D5 ⭐⭐ MAIA’s turn is visibly a VERSION, with her wording',
     `${v2.json.turns[3].speaker}/${v2.json.turns[3].adjunct?.kind}`, 'maia/version');
  eq('D6 ⭐ authorship is visible — MAIA’s wording is not the writer’s',
     v2.json.turns[3].adjunct.wording === WORDING && v2.json.turns[3].adjunct.wording !== v2.json.locusText,
     true);
  eq('D7 ⭐ the locus still shows the writer’s original', v2.json.locusText, SECTION_TEXT);

  /* ══ CLOSE AND REOPEN ══════════════════════════════════════════════════ */
  console.log('\n── ⭐⭐ close the pane · reopen it ────────────────────────────────');
  console.log('   ⭐ Modelled by DISCARDING every client-held value and re-reading.');
  const remembered = JSON.stringify(v2.json);
  /* the surface is "unmounted": nothing survives but the thread id the Work carries */
  const reopened = await call(`${B}/thread?threadId=${threadId}`, { headers: AUTH });
  eq('R1 ⭐⭐ the same conversation is there', JSON.stringify(reopened.json), remembered);
  eq('R2 ⭐⭐ and the authorship with it',
     reopened.json.turns.map((t: any) => `${t.speaker}:${t.adjunct?.kind ?? '-'}`).join('|'),
     'author:-|maia:-|author:direction|maia:version');
  eq('R3 ⛔ no client transcript was consulted — the server holds it all',
     reopened.json.turns.length, 4);

  /* ══ BOUNDARIES ════════════════════════════════════════════════════════ */
  console.log('\n── boundaries ────────────────────────────────────────────────────');
  const other = randomUUID(); const otherTok = `witness-${randomUUID()}`;
  await q(`INSERT INTO members (id,passkey,username,password_hash) VALUES ($1,'UI2','ui_2','x')`, [other]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at)
           VALUES ($1,$2,NOW() + INTERVAL '1 hour')`, [other, otherTok]);
  const foreign = await call(`${B}/thread?threadId=${threadId}`,
    { headers: { 'x-session-token': otherTok } });
  eq('B1 ⛔ another member cannot read this conversation', foreign.status, 404);
  eq('B2 ⛔ unauthenticated cannot either',
     (await call(`${B}/thread?threadId=${threadId}`, {})).status, 401);
  const { readFileSync } = await import('node:fs');
  const SRC = readFileSync('lib/manuscript/editorialRuntime/thread.ts', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  eq('B3 ⛔ [SOURCE] no generic conversation store is consulted',
     /conversation_turns|conversationHistory|sovereign\/app\/maia/.test(SRC), false);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
const cleanup = () => {
  try { if (next?.pid) process.kill(-next.pid, 'SIGKILL'); } catch {}
  try { next?.kill('SIGKILL'); } catch {}
  try { stub?.close(); } catch {} try { pg?.end(); } catch {}
};
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });
process.on('SIGTERM', () => { cleanup(); process.exit(143); });
main().catch((e) => { console.error(e); cleanup(); process.exit(2); });
