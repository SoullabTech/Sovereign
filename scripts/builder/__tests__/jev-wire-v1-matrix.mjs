#!/usr/bin/env node
/**
 * JARVIS-JEV-01 / JEV-INT-05 — defeat-candidate matrix for the J1R5-WIRE candidate.
 * Each candidate is the smallest competent WRONG edit of the module. It must die on its NAMED check.
 * A reference that passes proves nothing by itself; a candidate that survives repairs the SUITE.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROOF = join(HERE, 'jev-wire-v1-proof.mjs');

const OBSERVED_APPEND = `    ledger.append({
      kind: 'observed', attempt_id: attemptId, observation,
      response_sha256: sha256Hex(parsed.response_canonical), response_canonical: parsed.response_canonical, at: now(),
    });`;

const CANDIDATES = [
  // ── wire body ──
  ['DC-ARRAY-QUESTIONS', 'W1', [[
    "questions: { [packet.question_id]: { type: entry.type, instructions: entry.instructions } },",
    "questions: [{ id: packet.question_id, type: entry.type, instructions: entry.instructions }],"]]],
  ['DC-PER-REQUEST-WORDING', 'W4', [
    ['export function buildWireBody(packet) {', 'export function buildWireBody(packet, wording) {'],
    ['instructions: entry.instructions } },\n  };\n  const bodyJson', 'instructions: wording ?? entry.instructions } },\n  };\n  const bodyJson']]],
  ['DC-WORDING-NOT-VERIFIED', 'W4', [['q.instructions !== table.instructions', 'false']]],
  ['DC-KEY-MISMATCH-TOLERATED', 'W3', [[
    "  if (keys[0] !== body.state.question_id) return REFUSE('QUESTION_KEY_MISMATCH');\n", '']]],
  ['DC-STATE-NOT-J1-CHECKED', 'W2', [[
    "  if (!packetIsExact(body.state)) return REFUSE('STATE_NOT_J1_PACKET');\n", '']]],
  ['DC-MODEL-UNPINNED', 'W5', [[
    "  if (body.model !== QUESTION_TABLE.model) return REFUSE('MODEL_NOT_PINNED');\n", '']]],
  ['DC-NONCANONICAL-HASH', 'W6', [['const bodyJson = canonicalJson(body);', 'const bodyJson = JSON.stringify(body);']]],
  ['DC-ALLOWLIST-BYPASS', 'W9', [['return ALLOWED_HASHES.has(sha256Hex(canonicalJson(body)));', 'return true;']]],
  ['DC-FIXTURE-DRIFT', 'W7', [["f.push(['F10', st({ requiresExternalInfo: true })]);", "f.push(['F10', st({ requiresExternalInfo: true, fileCount: 2 })]);"]]],
  ['DC-TABLE-DRIFT', 'W25', [["instructions: 'Does this appear to cross a structural-risk boundary?',", "instructions: 'Does this appear to be risky?',"]]],
  // ── send discipline ──
  ['DC-NO-RESERVATION-BEFORE-SEND', 'W10', [[
    "      writeRecord(records, record);\n      return { ok: true };", "      return { ok: true };"]]],
  ['DC-RESERVE-AFTER-SEND', 'W11', [
    ["      writeRecord(records, record);\n      return { ok: true };", "      return { ok: true };"],
    ["  const questionId = plan.body.state.question_id;\n",
     "  try { ledger.append({ kind: 'reserved', attempt_id: attemptId, wire_body_hash: plan.bodyHash, reserve_usd: BUDGET.reserve_usd }); } catch { /* late */ }\n  const questionId = plan.body.state.question_id;\n"]]],
  // the stop itself is now derived from the settled outcome; the explicit halt record is a log entry whose shape W11 pins
  ['DC-HALT-LOG-RECORD-NOT-WRITTEN', 'W11', [["kind: 'halted', reason: 'CROSSING_UNKNOWN'", "kind: 'noted', reason: 'CROSSING_UNKNOWN'"]]],
  ['DC-CROSSING-UNKNOWN-NOT-STOPPING', 'W12', [
    ["kind: 'halted', reason: 'CROSSING_UNKNOWN'", "kind: 'noted', reason: 'CROSSING_UNKNOWN'"],
    ["    else if (r.kind === 'settled' && r.outcome !== 'ok') stopReasons.push('OUTCOME_' + r.outcome);\n", '']]],
  ['DC-AUTO-RETRY', 'W12', [[
    'raw = await Promise.race([sending, deadline]);',
    'raw = await Promise.race([sending.catch(() => transport.send(plan.bodyJson, { signal: controller.signal })), deadline]);']]],
  ['DC-UNKNOWN-USAGE-RELEASED', 'W13', [[
    'usd += st && st.cost_known ? st.cost_usd : BUDGET.reserve_usd;', 'usd += st && st.cost_known ? st.cost_usd : (st ? 0 : BUDGET.reserve_usd);']]],
  ['DC-CAP-120', 'W14', [['max_attempts: 31', 'max_attempts: 120']]],
  ['DC-CEILING-OFF', 'W15', [["      if (s.usd + BUDGET.reserve_usd > BUDGET.ceiling_usd) return 'BUDGET_CEILING';\n", '']]],
  ['DC-DUPLICATE-ATTEMPT-ALLOWED', 'W16', [["      if (s.used.has(attemptId)) return 'ATTEMPT_ALREADY_USED';\n", '']]],
  ['DC-MODEL-DRIFT-TOLERATED', 'W17', [
    ['parsed.model !== QUESTION_TABLE.model', 'false'],
    ["      if (r.observation.model_returned !== QUESTION_TABLE.model) stopReasons.push('MODEL_DRIFT');\n", '']]],
  ['DC-OBSERVATION-BECOMES-ADVICE', 'W18', [[
    'provider_confidence_supplied: false,\n  });\n  const cost', 'provider_confidence_supplied: false, answer: parsed.p_yes >= 0.5, confidence: 1,\n  });\n  const cost']]],
  ['DC-ADMISSION-PATH-IMPORTED', 'W19', [[
    "import { constructJevPacket, packetIsExact } from './jev-judgment-host-v1.mjs';",
    "import { constructJevPacket, packetIsExact, admitJevResponse } from './jev-judgment-host-v1.mjs';"]]],
  ['DC-NETWORK-CLIENT-EMBEDDED', 'W19', [['export const WIRE_VERSION', "const _egress = (u) => fetch(u);\nexport const WIRE_VERSION"]]],
  ['DC-UNWITNESSED-SHAPE-SENDS', 'W20', [[
    "  if (!RESPONSE_SHAPE.witnessed) return refused('RESPONSE_SHAPE_UNWITNESSED');\n", '']]],
  ['DC-RESPONSE-NOT-VALIDATED', 'W22', [[
    "typeof answer.noul !== 'number' || !(answer.noul >= 0 && answer.noul <= 1)", "typeof answer.noul !== 'number'"]]],
  ['DC-USAGE-ANOMALY-IGNORED', 'W23', [
    ['} else if (cost > BUDGET.reserve_usd) {', '} else if (false) {'],
    ["      if (r.observation.billable_input_tokens * BUDGET.usd_per_input_token > BUDGET.reserve_usd) stopReasons.push('UNEXPECTED_USAGE');\n", '']]],
  ['DC-AMBIGUOUS-LEDGER-TAIL-TOLERATED', 'W24', [
    ["const text = readFileSync(path, 'utf8');", "let text = readFileSync(path, 'utf8');"],
    ["    if (text === '' || !text.endsWith('\\n')) fail('LEDGER_CORRUPT');\n", "    if (text === '') fail('LEDGER_CORRUPT');\n    if (!text.endsWith('\\n')) text += '\\n';\n"]]],
  // ── repair pass: response parser ──
  ['DC-OLD-RESPONSE-ENVELOPE', 'W27', [
    ["top_level: Object.freeze(['model', 'usage', 'answers']),", "top_level: Object.freeze(['model', 'usage', 'questions']),"],
    ["answers_key: 'answers',", "answers_key: 'questions',"]]],
  ['DC-EXTRA-ROOT-ACCEPTED', 'W27', [[" || !sameKeys(raw, S.top_level)", ""]]],
  ['DC-EXTRA-USAGE-ACCEPTED', 'W27', [[" || !sameKeys(usage, S.usage_keys)", ""]]],
  ['DC-EXTRA-ANSWER-ACCEPTED', 'W27', [["!sameKeys(answers, [questionId])", "!Object.hasOwn(answers, questionId)"]]],
  ['DC-CONFIDENCE-FIELD-ACCEPTED', 'W27', [[" || !sameKeys(answer, S.answer_keys)", ""]]],
  // ── repair pass: observation persistence ──
  ['DC-OBSERVATION-NOT-PERSISTED', 'W28', [[OBSERVED_APPEND, '    void 0;']]],
  ['DC-OK-ON-PERSIST-FAILURE', 'W28', [[
    "outcome: anchored ? 'observation_persisted_checkpoint_failed' : 'observation_not_persisted'", "outcome: 'ok'"]]],
  // ── repair pass: deadline, restart ──
  ['DC-NO-DEADLINE', 'W29', [
    ['raw = await Promise.race([sending, deadline]);', 'raw = await sending;'],
    ["timer = setTimeout(() => { controller.abort(); reject(new Error('TIMEOUT')); }, timeoutMs);", 'timer = 0; void reject;']]],
  ['DC-UNRESOLVED-ATTEMPT-IGNORED', 'W30', [["      if (s.unresolved.length > 0) return 'UNRESOLVED_ATTEMPT';\n", '']]],
  // ── repair pass: ledger ──
  ['DC-UNKNOWN-EVENT-IGNORED', 'W31', [
    ["    if (!LEDGER_KINDS.includes(r.kind)) fail('LEDGER_CORRUPT');\n", ''],
    ["      default: fail('LEDGER_CORRUPT');", "      default: break;"]]],
  ['DC-TRANSITIONS-UNCHECKED', 'W31', [[
    "if (!isStr(r.attempt_id) || !reserved.has(r.attempt_id) || settled.has(r.attempt_id)) fail('LEDGER_CORRUPT');",
    "if (!isStr(r.attempt_id)) fail('LEDGER_CORRUPT');"]]],
  ['DC-CHAIN-UNCHECKED', 'W31', [[
    "if (r.seq !== i || r.prev !== prev || r.hash !== recordHash(r)) fail('LEDGER_CORRUPT');", "if (false) fail('LEDGER_CORRUPT');"]]],
  ['DC-MISSING-LEDGER-AUTO-INITIALIZED', 'W32', [
    ["import { closeSync, existsSync,", "import { writeFileSync, closeSync, existsSync,"],
    ["    if (!existsSync(path)) fail('LEDGER_NOT_INITIALIZED');\n",
     "    if (!existsSync(path)) { const b = { kind: 'init', ...identity, at: 0, seq: 0, prev: 'GENESIS' }; writeFileSync(path, JSON.stringify({ ...b, hash: sha256Hex(canonicalJson(b)) }) + '\\n'); }\n"]]],
  ['DC-BINDING-UNCHECKED', 'W32', [[
    "        if (r.experiment_id !== identity.experiment_id || r.table_hash !== identity.table_hash\n          || r.fixture_list_hash !== identity.fixture_list_hash || r.schema_sha256 !== identity.schema_sha256) {\n          fail('LEDGER_BINDING_MISMATCH');\n        }\n", '']]],
  ['DC-NO-CROSS-PROCESS-LOCK', 'W33', [["fd = openSync(lockPath, 'wx');", "fd = openSync(lockPath, 'a');"]]],
  // ── restart-safe stop semantics ──
  ['DC-HALT-ONLY-IF-RECORD-WRITTEN', 'W35', [['halted: stopReasons.length > 0,', "halted: records.some((r) => r.kind === 'halted'),"]]],
  ['DC-OUTCOME-STOP-NOT-DERIVED', 'W35', [["    else if (r.kind === 'settled' && r.outcome !== 'ok') stopReasons.push('OUTCOME_' + r.outcome);\n", '']]],
  ['DC-DRIFT-STOP-NOT-DERIVED', 'W35', [["      if (r.observation.model_returned !== QUESTION_TABLE.model) stopReasons.push('MODEL_DRIFT');\n", '']]],
  ['DC-USAGE-STOP-NOT-DERIVED', 'W35', [["      if (r.observation.billable_input_tokens * BUDGET.usd_per_input_token > BUDGET.reserve_usd) stopReasons.push('UNEXPECTED_USAGE');\n", '']]],
  ['DC-SETTLEMENT-FAILURE-REPORTED-OK', 'W36', [[
    "    return Object.freeze({ sent: true, outcome: 'observation_persisted_settlement_incomplete', observation });",
    "    return Object.freeze({ sent: true, outcome: 'ok', observation });"]]],
  ['DC-UNSAFE-TOKEN-ACCEPTED', 'W37', [['Number.isSafeInteger(usage[k])', 'Number.isInteger(usage[k])']]],
  ['DC-UNSAFE-LEDGER-TOKEN-ACCEPTED', 'W37', [['!Number.isSafeInteger(r.observation.billable_input_tokens) || ', '']]],
];

function run(edits) {
  const r = spawnSync(process.execPath, [PROOF], {
    encoding: 'utf8',
    env: { ...process.env, JEV_WIRE_EDITS: JSON.stringify(edits) },
  });
  const fails = [...(r.stdout || '').matchAll(/^FAIL  (\S+)/gm)].map((m) => m[1]);
  return { status: r.status, fails, tail: (r.stderr || '').split('\n').slice(0, 3).join(' | ') };
}

const ref = run([]);
if (ref.status !== 0 || ref.fails.length) {
  console.log('REFERENCE NOT CLEAN', ref);
  process.exit(2);
}
console.log('REFERENCE  clean (0 failed)\n');

let killedOnName = 0; let problems = 0;
for (const [name, expected, edits] of CANDIDATES) {
  let out;
  try { out = run(edits); } catch (e) { out = { status: -1, fails: [], tail: String(e.message) }; }
  const diedOnName = out.fails.some((f) => f.startsWith(expected + '-'));
  const collateral = out.fails.filter((f) => !f.startsWith(expected + '-'));
  if (out.status === 0) { problems += 1; console.log(`SURVIVED  ${name}  (expected ${expected})`); continue; }
  if (!diedOnName) { problems += 1; console.log(`WRONG-DEATH  ${name}  expected ${expected}, got [${out.fails.join(', ') || out.tail}]`); continue; }
  killedOnName += 1;
  console.log(`KILLED  ${name}  on ${expected}` + (collateral.length ? `   collateral: ${collateral.join(', ')}` : ''));
}

console.log(`\n${killedOnName}/${CANDIDATES.length} candidates killed on their named check · ${problems} problems`);
process.exit(problems === 0 ? 0 : 1);
