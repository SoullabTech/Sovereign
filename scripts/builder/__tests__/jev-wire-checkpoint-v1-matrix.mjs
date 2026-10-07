#!/usr/bin/env node
/**
 * JEV-INT-05 — defeat-candidate matrix for the external checkpoint. Each candidate is the smallest competent
 * WRONG edit of the module (or the runner). It must die on its NAMED check — not crash, not time out.
 * `scope` says which module the edit applies to: ck = checkpoint module, wire = wire module.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROOF = join(HERE, 'jev-wire-checkpoint-v1-proof.mjs');

const CANDIDATES = [
  // [name, expected check, scope, edits]
  ['DC-CK-NOT-ANCHORED-BEFORE-DISPATCH', 'K1', 'ck', [[
    "      hooks.afterLedgerAppend?.('reserved');\n      writeCheckpoint(base.read());\n      hooks.afterCheckpoint?.('reserved');\n",
    "      hooks.afterLedgerAppend?.('reserved');\n      hooks.afterCheckpoint?.('reserved');\n"]]],
  ['DC-CK-OUTCOMES-NOT-ANCHORED', 'K1', 'ck', [[
    "      hooks.afterLedgerAppend?.(record.kind);\n      writeCheckpoint(base.read());\n",
    "      hooks.afterLedgerAppend?.(record.kind);\n"]]],
  ['DC-CK-INSTANCE-NOT-RECORDED', 'K2', 'ck', [["instance_id: records[0].hash, ...expectedBinding(),", "instance_id: 'x', ...expectedBinding(),"]]],
  ['DC-MISSING-CHECKPOINT-RECREATED', 'K3', 'ck', [[
    "    if (!cp) return fail('PAIR_CHECKPOINT_MISSING');",
    "    if (!cp) { writeCheckpoint(base.read()); return verifyPair({ allowAhead }); }"]]],
  ['DC-ESTABLISH-OVER-HISTORY', 'K3', 'ck', [["      if (records.length !== 1) return fail('PAIR_CANNOT_ESTABLISH_OVER_HISTORY');\n", '']]],
  ['DC-TRUNCATION-UNDETECTED', 'K4', 'ck', [
    ["    if (cp.seq > records.length - 1) return fail('PAIR_LEDGER_BEHIND');\n", ''],
    ["    if (records[cp.seq].hash !== cp.head)", "    if (records[cp.seq] && records[cp.seq].hash !== cp.head)"]]],
  // identity and divergence checks overlap by construction (a different initialization differs at every hash),
  // so a wrong design removes BOTH layers; each alone is defence in depth and is not claimed as separately lethal
  ['DC-REPLACED-LEDGER-ACCEPTED', 'K5', 'ck', [
    ["    if (records[0].hash !== cp.instance_id) return fail('PAIR_INSTANCE_MISMATCH');\n", ''],
    ["    if (records[cp.seq].hash !== cp.head) return fail('PAIR_LEDGER_DIVERGES');\n", '']]],
  ['DC-REPEAT-INITIALIZATION-ALLOWED', 'K5', 'ck', [[
    "      if (existsSync(base.path) || existsSync(checkpointPath)) return fail('PAIR_ALREADY_INITIALIZED');\n", '']]],
  ['DC-DIVERGENCE-UNCHECKED', 'K6', 'ck', [["    if (records[cp.seq].hash !== cp.head) return fail('PAIR_LEDGER_DIVERGES');\n", '']]],
  ['DC-CHECKPOINT-CORRUPTION-TOLERATED', 'K7', 'ck', [[
    "    if (stored !== sha256Hex(canonicalJson(rest))) return fail('PAIR_CHECKPOINT_CORRUPT');\n", '']]],
  ['DC-BINDING-UNCHECKED', 'K7', 'ck', [["canonicalJson(cp.caps) !== canonicalJson(want.caps)) return fail('PAIR_BINDING_MISMATCH');", "canonicalJson(cp.caps) !== canonicalJson(want.caps)) ;"]]],
  ['DC-UNAVAILABLE-TREATED-AS-MISSING', 'K8', 'ck', [[
    "return checkpointDirUsable() ? null : fail('PAIR_CHECKPOINT_UNAVAILABLE');", "return null;"]]],
  // write-failure handling and the final agreement check overlap; the wrong design drops BOTH
  ['DC-SEND-DESPITE-ANCHOR-WRITE-FAILURE', 'K8', 'ck', [
    ["    } catch { throw err('PAIR_CHECKPOINT_UNAVAILABLE'); }\n  };\n\n  /** Throws a PAIR_*",
     "    } catch { /* anchor unavailable: carry on */ }\n  };\n\n  /** Throws a PAIR_*"],
    ["      verifyPair();                                                // dispatch only on proven agreement\n", '']]],
  ['DC-AHEAD-SILENTLY-RECONCILED', 'K9', 'ck', [[
    "    if (ahead > 0 && !allowAhead) return fail('PAIR_CHECKPOINT_BEHIND');",
    "    if (ahead > 0 && !allowAhead) { writeCheckpoint(records); return { records, cp, ahead: 0 }; }"]]],
  ['DC-RESUME-WITHOUT-ADVANCING', 'K10', 'ck', [["      writeCheckpoint(records);\n      return { advanced: true,", "      return { advanced: true,"]]],
  ['DC-STALE-LOCK-DELETED', 'K11', 'ck', [[
    "try { fd = openSync(pairLockPath, 'wx'); } catch { throw err('PAIR_LOCK_HELD'); }",
    "try { fd = openSync(pairLockPath, 'wx'); } catch { try { unlinkSync(pairLockPath); fd = openSync(pairLockPath, 'wx'); } catch { throw err('PAIR_LOCK_HELD'); } }"]]],
  ['DC-CHECKPOINT-FAILURE-REPORTED-OK', 'K12', 'wire', [[
    "outcome = stored ? 'observation_persisted_checkpoint_failed' : 'observation_not_persisted';", "outcome = 'ok';"]]],
  ['DC-PERSISTED-ASSUMED-FROM-ERROR-NAME', 'K14', 'wire', [[
    "const stored = ledger.read().some((r) => r.kind === 'observed' && r.attempt_id === attemptId);", "const stored = true;"]]],
  ['DC-UNVERIFIABLE-REPORTED-AS-NOT-PERSISTED', 'K14', 'wire', [[
    "outcome = 'observation_persistence_unverified';", "outcome = 'observation_not_persisted';"]]],
  ['DC-PATH-COLLISION-UNCHECKED', 'K15', 'ck', [
    ["  assertDistinctStores(base.path, checkpointPath);\n  const pairLockPath", "  const pairLockPath"],
    ["    assertDistinctStores(base.path, checkpointPath);        // before the lock file (itself a mutation) exists\n", '']]],
  ['DC-ONLY-EXACT-EQUALITY-CHECKED', 'K15', 'ck', [[
    "    for (const b of checkpointOwned.map(canonical)) if (a === b) throw err('PAIR_PATH_COLLISION');",
    "    if (a === canonical(checkpointPath)) throw err('PAIR_PATH_COLLISION');"]]],
  ['DC-ALIASES-NOT-RESOLVED', 'K15', 'ck', [
    ["  let dir = dirname(abs);\n  try { dir = realpathSync(dir); } catch { /* parent not present: compare lexically */ }", "  const dir = dirname(abs);"],
    ["if (ids[i] && ids[i] === ids[j]) throw err('PAIR_PATH_COLLISION');", "if (false) throw err('PAIR_PATH_COLLISION');"]]],
  ['DC-NETWORK-IN-CHECKPOINT-MODULE', 'K13', 'ck', [["export const CHECKPOINT_FORMAT", "const _egress = (u) => fetch(u);\nexport const CHECKPOINT_FORMAT"]]],
];

function run(scope, edits) {
  const env = { ...process.env };
  delete env.JEV_WIRE_EDITS; delete env.JEV_CK_EDITS;
  if (edits.length) env[scope === 'wire' ? 'JEV_WIRE_EDITS' : 'JEV_CK_EDITS'] = JSON.stringify(edits);
  const r = spawnSync(process.execPath, [PROOF], { encoding: 'utf8', env, timeout: 180000 });
  const fails = [...(r.stdout || '').matchAll(/^FAIL  (\S+)/gm)].map((m) => m[1]);
  return { status: r.status, fails, tail: ((r.stderr || '') + '').split('\n').slice(0, 3).join(' | ') };
}

const ref = run('ck', []);
if (ref.status !== 0 || ref.fails.length) { console.log('REFERENCE NOT CLEAN', ref); process.exit(2); }
console.log('REFERENCE  clean (0 failed)\n');

let killed = 0; let problems = 0;
for (const [name, expected, scope, edits] of CANDIDATES) {
  const out = run(scope, edits);
  const onName = out.fails.some((f) => f.startsWith(expected + '-'));
  const collateral = out.fails.filter((f) => !f.startsWith(expected + '-'));
  if (out.status === 0) { problems += 1; console.log(`SURVIVED  ${name}  (expected ${expected})`); continue; }
  if (!onName) { problems += 1; console.log(`WRONG-DEATH  ${name}  expected ${expected}, got [${out.fails.join(', ') || out.tail}]`); continue; }
  killed += 1;
  console.log(`KILLED  ${name}  on ${expected}` + (collateral.length ? `   collateral: ${collateral.join(', ')}` : ''));
}
console.log(`\n${killed}/${CANDIDATES.length} candidates killed on their named check · ${problems} problems`);
process.exit(problems === 0 ? 0 : 1);
