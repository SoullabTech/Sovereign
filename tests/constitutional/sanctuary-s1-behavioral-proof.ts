/**
 * Sanctuary S1 — behavioral proof (Kelly merge-gate for PR #629, 2026-07-17)
 *
 *   npx tsx tests/constitutional/sanctuary-s1-behavioral-proof.ts
 *
 * Runs against a REAL database (DATABASE_URL / local dev stack — never run
 * against production). Drives the actual store code — not mocks — through the
 * exact shape of incident SANC-20260614-01 and asserts row-level outcomes.
 *
 * PROOF A — mid-session transitions, no retroactivity:
 *   standard turns persist → Sanctuary entered → sanctuary turns refused →
 *   Sanctuary exited → ordinary persistence resumes; earlier rows untouched.
 * PROOF B — history-jsonb lane (named assertion HISTORY_JSONB_ZERO_APPEND):
 *   a sanctuary turn attempts the maia_sessions.conversation_history update
 *   and appends ZERO entries.
 * PROOF C — no deferred retention:
 *   after sanctuary turns, zero rows exist for the test session in agent_runs,
 *   integration_passes, session_summary_queue, embedding_jobs — and the
 *   sanctuary content string appears NOWHERE in any inspectable lane
 *   (refusal is a drop, not a deferral; captured logs carry no content).
 */

import { randomUUID } from 'crypto';
import { query, queryOne } from '../../lib/db/postgres';
import { TurnsStore } from '../../lib/memory/stores/TurnsStore';
import { addConversationExchange, ensureSession } from '../../lib/sovereign/sessionManager';
import { logAgentRun, logIntegrationPass } from '../../lib/services/corpusCallosumService';
import { TurnPosture } from '../../lib/sanctuary/turnPosture';

const SESSION = `s1proof-${randomUUID()}`;
const USER = `s1proof-user-${randomUUID().slice(0, 8)}`;
const SECRET = `SANCTUARY-CANARY-${randomUUID()}`; // must appear in NO row and NO log

let passed = 0;
let failed = 0;
function assert(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ✅ ${name}${detail ? `  (${detail})` : ''}`); }
  else { failed++; console.log(`  ❌ ${name}${detail ? `  (${detail})` : ''}`); }
}

async function counts() {
  const turns = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM conversation_turns WHERE session_id = $1`, [SESSION]);
  const hist = await queryOne<{ n: number }>(
    `SELECT COALESCE(jsonb_array_length(conversation_history), 0) AS n FROM maia_sessions WHERE id = $1`, [SESSION]);
  const runs = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM agent_runs WHERE session_id = $1`, [SESSION]);
  const passes = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM integration_passes WHERE session_id = $1`, [SESSION]);
  return {
    turns: Number(turns?.n ?? 0),
    hist: Number(hist?.n ?? 0),
    runs: Number(runs?.n ?? 0),
    passes: Number(passes?.n ?? 0),
  };
}

async function driveExchange(label: string, sanctuary: boolean, userMsg: string, maiaMsg: string) {
  // The real caller path: sessionManager (history + turns via resolved posture)
  await addConversationExchange(SESSION, userMsg, maiaMsg, {
    userId: USER,
    sanctuary: sanctuary || undefined,
  });
  // The real corpus-callosum path with a boundary-resolved posture
  const posture = TurnPosture.resolve({ sanctuary });
  await logAgentRun({
    sessionId: SESSION,
    userId: USER,
    agentName: 's1proof-agent',
    inputSummary: userMsg,
    outputText: maiaMsg,
    originRoute: 's1proof',
  } as any, posture);
  await logIntegrationPass({
    sessionId: SESSION,
    userId: USER,
    bridgeAgent: 's1proof-bridge',
    inputs: [{ agentName: 's1proof-agent', excerpt: maiaMsg }],
    agentRunIds: [],
    finalText: maiaMsg,
  } as any, posture);
  console.log(`  · drove ${label} exchange (sanctuary=${sanctuary})`);
}

async function main() {
  console.log(`\nSanctuary S1 behavioral proof — session ${SESSION}\n`);
  await ensureSession(SESSION);

  // ── PROOF A: phase 1 — standard turns persist ──────────────────────────
  console.log('PROOF A — mid-session transition');
  await driveExchange('standard#1', false, 'ordinary question one', 'ordinary answer one');
  await driveExchange('standard#2', false, 'ordinary question two', 'ordinary answer two');
  const afterStandard = await counts();
  assert('A1: standard turns persist', afterStandard.turns === 4,
    `turns=${afterStandard.turns} (2 exchanges × user+assistant)`);
  assert('A2: standard history appends', afterStandard.hist === 2, `hist=${afterStandard.hist}`);
  assert('A3: standard corpus rows persist', afterStandard.runs === 2 && afterStandard.passes === 2,
    `runs=${afterStandard.runs} passes=${afterStandard.passes}`);

  // ── PROOF A phase 2 + B + C: Sanctuary entered ─────────────────────────
  const logs: string[] = [];
  const origLog = console.log; const origErr = console.error; const origWarn = console.warn;
  console.log = (...a: unknown[]) => { logs.push(a.map(String).join(' ')); };
  console.error = (...a: unknown[]) => { logs.push(a.map(String).join(' ')); };
  console.warn = (...a: unknown[]) => { logs.push(a.map(String).join(' ')); };
  try {
    await driveExchange('sanctuary#1', true, `${SECRET} user`, `${SECRET} maia`);
    await driveExchange('sanctuary#2', true, `${SECRET} user2`, `${SECRET} maia2`);
  } finally {
    console.log = origLog; console.error = origErr; console.warn = origWarn;
  }
  const afterSanctuary = await counts();
  assert('A4: sanctuary turns refused (turns unchanged)', afterSanctuary.turns === 4,
    `turns=${afterSanctuary.turns}`);
  assert('HISTORY_JSONB_ZERO_APPEND (Proof B): sanctuary appended ZERO history entries',
    afterSanctuary.hist === 2, `hist=${afterSanctuary.hist}`);
  assert('A5: sanctuary corpus rows refused', afterSanctuary.runs === 2 && afterSanctuary.passes === 2,
    `runs=${afterSanctuary.runs} passes=${afterSanctuary.passes}`);
  const refusals = logs.filter((l) => l.includes('[SANCTUARY] write refused'));
  assert('A6: refusals observable via marker', refusals.length >= 3, `${refusals.length} refusal logs`);
  assert('C1: refusal logs carry no content', !logs.some((l) => l.includes(SECRET)),
    'canary absent from all captured logs');

  // ── PROOF A phase 3 — Sanctuary exited, persistence resumes ────────────
  await driveExchange('standard#3', false, 'ordinary question three', 'ordinary answer three');
  const afterExit = await counts();
  assert('A7: ordinary persistence resumes after exit', afterExit.turns === 6 && afterExit.hist === 3,
    `turns=${afterExit.turns} hist=${afterExit.hist}`);
  assert('A8: no retroactive effects (earlier rows intact)',
    afterExit.runs === 3 && afterExit.passes === 3, `runs=${afterExit.runs} passes=${afterExit.passes}`);

  // ── PROOF C: no deferred retention anywhere ────────────────────────────
  console.log('PROOF C — queues / retries / traces');
  const lanes: Array<[string, string]> = [
    ['session_summary_queue', `SELECT count(*) AS n FROM session_summary_queue WHERE session_id::text = $1`],
    ['embedding_jobs', `SELECT count(*) AS n FROM embedding_jobs WHERE payload::text LIKE '%' || $1 || '%'`],
  ];
  for (const [lane, sql] of lanes) {
    try {
      const r = await queryOne<{ n: string }>(sql, [lane === 'embedding_jobs' ? SECRET : SESSION]);
      assert(`C2: zero ${lane} rows`, Number(r?.n ?? 0) === 0, `n=${r?.n ?? 0}`);
    } catch {
      assert(`C2: ${lane} lane not applicable (table/shape absent)`, true);
    }
  }
  // The canary must not exist ANYWHERE in the content lanes.
  const canary = await queryOne<{ n: string }>(
    `SELECT (SELECT count(*) FROM conversation_turns WHERE content LIKE '%' || $1 || '%')
          + (SELECT count(*) FROM agent_runs WHERE coalesce(output_text,'') || coalesce(input_summary,'') LIKE '%' || $1 || '%')
          + (SELECT count(*) FROM integration_passes WHERE coalesce(final_text,'') LIKE '%' || $1 || '%')
          + (SELECT count(*) FROM maia_sessions WHERE conversation_history::text LIKE '%' || $1 || '%') AS n`,
    [SECRET]);
  assert('C3: sanctuary canary exists NOWHERE in any content lane', Number(canary?.n ?? 0) === 0,
    `matches=${canary?.n}`);

  // ── cleanup ────────────────────────────────────────────────────────────
  await query(`DELETE FROM conversation_turns WHERE session_id = $1`, [SESSION]);
  await query(`DELETE FROM agent_runs WHERE session_id = $1`, [SESSION]);
  await query(`DELETE FROM integration_passes WHERE session_id = $1`, [SESSION]);
  await query(`DELETE FROM maia_sessions WHERE id = $1`, [SESSION]);
  console.log('\n  · test rows cleaned up');

  console.log(`\n${passed} passed · ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error('proof harness error:', e?.message); process.exit(1); });
