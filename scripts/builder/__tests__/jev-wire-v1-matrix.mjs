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

const RESERVE_BLOCK = `  ledger.append({
    kind: 'reserved', attempt_id: attemptId, wire_body_hash: plan.bodyHash,
    table_version: QUESTION_TABLE.table_version, reserve_usd: BUDGET.reserve_usd, at: now(),
  });
`;

const CANDIDATES = [
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
  ['DC-NO-RESERVATION-BEFORE-SEND', 'W10', [[RESERVE_BLOCK, '']]],
  ['DC-RESERVE-AFTER-SEND', 'W11', [
    [RESERVE_BLOCK, ''],
    ["  const questionId = plan.body.state.question_id;\n", RESERVE_BLOCK + "  const questionId = plan.body.state.question_id;\n"]]],
  ['DC-CROSSING-UNKNOWN-NOT-HALTED', 'W12', [["kind: 'halted', reason: 'CROSSING_UNKNOWN'", "kind: 'noted', reason: 'CROSSING_UNKNOWN'"]]],
  ['DC-AUTO-RETRY', 'W12', [[
    'raw = await transport.send(plan.bodyJson);',
    'try { raw = await transport.send(plan.bodyJson); } catch { raw = await transport.send(plan.bodyJson); }']]],
  ['DC-UNKNOWN-USAGE-RELEASED', 'W13', [[
    's && s.cost_known ? s.cost_usd : BUDGET.reserve_usd', 's && s.cost_known ? s.cost_usd : (s ? 0 : BUDGET.reserve_usd)']]],
  ['DC-CAP-120', 'W14', [['max_attempts: 31', 'max_attempts: 120']]],
  ['DC-CEILING-OFF', 'W15', [['if (s.usd + BUDGET.reserve_usd > BUDGET.ceiling_usd)', 'if (false)']]],
  ['DC-DUPLICATE-ATTEMPT-ALLOWED', 'W16', [["  if (s.used.has(attemptId)) return refused('ATTEMPT_ALREADY_USED');\n", '']]],
  ['DC-MODEL-DRIFT-TOLERATED', 'W17', [['parsed.model !== QUESTION_TABLE.model', 'false']]],
  ['DC-OBSERVATION-BECOMES-ADVICE', 'W18', [[
    'provider_confidence_supplied: false,', 'provider_confidence_supplied: false, answer: parsed.p_yes >= 0.5, confidence: 1,']]],
  ['DC-ADMISSION-PATH-IMPORTED', 'W19', [[
    "import { constructJevPacket, packetIsExact } from './jev-judgment-host-v1.mjs';",
    "import { constructJevPacket, packetIsExact, admitJevResponse } from './jev-judgment-host-v1.mjs';"]]],
  ['DC-NETWORK-CLIENT-EMBEDDED', 'W19', [[
    'export const WIRE_VERSION', "const _egress = (u) => fetch(u);\nexport const WIRE_VERSION"]]],
  ['DC-UNWITNESSED-SHAPE-SENDS', 'W20', [[
    "  if (!RESPONSE_SHAPE.witnessed) return refused('RESPONSE_SHAPE_UNWITNESSED');\n", '']]],
  ['DC-RESPONSE-NOT-VALIDATED', 'W22', [['!(p >= 0 && p <= 1)', 'false']]],
  ['DC-USAGE-ANOMALY-IGNORED', 'W23', [['} else if (cost > BUDGET.reserve_usd) {', '} else if (false) {']]],
  ['DC-AMBIGUOUS-LEDGER-TAIL-TOLERATED', 'W24', [
    ["const text = readFileSync(path, 'utf8');", "let text = readFileSync(path, 'utf8');"],
    ["    if (!text.endsWith('\\n')) throw new Error('LEDGER_CORRUPT');\n", "    if (!text.endsWith('\\n')) text += '\\n';\n"]]],
  ['DC-TABLE-DRIFT', 'W25', [['instructions: \'Does this appear to cross a structural-risk boundary?\',', 'instructions: \'Does this appear to be risky?\',']]],
  ['DC-FIXTURE-DRIFT', 'W7', [["f.push(['F10', st({ requiresExternalInfo: true })]);", "f.push(['F10', st({ requiresExternalInfo: true, fileCount: 2 })]);"]]],
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
