#!/usr/bin/env node
/** JEV-INT-05 pre-live wrapper: deliberately wrong designs must fail their named check. */
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROOF = join(dirname(fileURLToPath(import.meta.url)), 'jev-wire-prelive-wrapper-v1-proof.mjs');
const CANDIDATES = [
  ['MC-OFF-GATE-BYPASS', 'P01-inactive-by-default-does-not-initialize-or-send',
    [["    if (!enableLocalMock) return refuse('PRELIVE_INACTIVE');", "    if (false) return refuse('PRELIVE_INACTIVE');"]]],
  ['MC-REMOTE-ENDPOINT-ACCEPTED', 'P02-no-remote-endpoint-under-any-mode',
    [["  if (u.protocol !== 'http:' || u.hostname !== '127.0.0.1' ||", "  if (false ||"]]],
  ['MC-UNPINNED-WIRE-TABLE', 'P03-table-fixtures-model-and-caps-are-pinned',
    [["  verifyPinnedWire(wire);", "  void wire;"]]],
  ['MC-SAME-DEVICE-TOLERATED', 'P04-physical-device-pins-are-required-and-verified',
    [["    if (config.requireDistinctDevices && ls.dev === cs.dev)", "    if (false && ls.dev === cs.dev)"]]],
  ['MC-IMPLICIT-INITIALIZATION', 'P05-first-initialization-is-explicit-and-never-resets',
    [["    if (!acknowledgeFreshSyntheticExperiment) fail('PRELIVE_EXPLICIT_INIT_REQUIRED');",
      "    if (false) fail('PRELIVE_EXPLICIT_INIT_REQUIRED');"]]],
  ['MC-WIRE-BYTES-ALTERED', 'P06-all-31-local-requests-are-anchored-and-replay-is-blocked',
    [["        return transport.send(bytes, opts);", "        return transport.send(bytes + ' ', opts);"]]],
  ['MC-HTTP-RETRIES', 'P08-429-stops-experiment-no-retry-no-next-send',
    [["        return transport.send(bytes, opts);", "        return transport.send(bytes, opts).catch(() => transport.send(bytes, opts));"]]],
  ['MC-STORAGE-PREFLIGHT-SKIPPED', 'P09-storage-drift-refused-before-reservation',
    [["    if (!place.ok) return refuse(place.reason);", "    if (false) return refuse(place.reason);"]]],
  ['MC-PREFLIGHT-MUTATES-HISTORY', 'P11-preflight-only-does-not-create-ledger-checkpoint-or-locks',
    [["    preflight: placement,", "    preflight: () => { pair.initialize(); return placement(); },"]]],
  ['MC-READS-ENVIRONMENT', 'P12-no-real-endpoint-credentials-external-permissions-or-recovery',
    [["export const PRELIVE_VERSION", "const leaked = process.env.JEV_KEY;\nexport const PRELIVE_VERSION"]]],
  ['MC-ACTIVATES-REMOTE-ADAPTER', 'P12-no-real-endpoint-credentials-external-permissions-or-recovery',
    [["      allowRemote: false, timeoutMs, maxResponseBytes: 65_536 })",
      "      allowRemote: true, timeoutMs, maxResponseBytes: 65_536 })"]]],
];
function run(edits, check) {
  const env = { ...process.env }; delete env.PRELIVE_EDITS; delete env.PRELIVE_ONLY_CHECK;
  if (edits.length) env.PRELIVE_EDITS = JSON.stringify(edits);
  if (check) env.PRELIVE_ONLY_CHECK = check;
  const r = spawnSync(process.execPath, [PROOF], { encoding: 'utf8', timeout: 60000, env });
  const output = (r.stdout || '') + '\n' + (r.stderr || '');
  const failed = [...output.matchAll(/^FAIL  (.+?) — /gm)].map((x) => x[1]);
  const summary = output.match(/(\d+) passed · (\d+) failed; checks_completed=(\d+)/);
  return { code: r.status, signal: r.signal, error: r.error?.message ?? null, failed, summary, tail: output.slice(-250) };
}
const reference = run([], null);
if (reference.code !== 0 || !reference.summary || Number(reference.summary[2]) !== 0 || Number(reference.summary[3]) !== 12) {
  console.error('REFERENCE NOT CLEAN', reference); process.exit(2);
}
console.log('REFERENCE 12/12 pass');
let killed = 0, bad = 0;
for (const [name, check, edits] of CANDIDATES) {
  const v = run(edits, check);
  const accepted = v.code === 1 && v.signal === null && !v.error && v.summary &&
    Number(v.summary[3]) === 1 && Number(v.summary[2]) === 1 &&
    v.failed.length === 1 && v.failed[0] === check;
  if (accepted) { killed++; console.log('KILLED ' + name + ' on ' + check); }
  else { bad++; console.log('PROBLEM ' + name + ' ' + JSON.stringify(v)); }
}
console.log(killed + '/' + CANDIDATES.length + ' named kills · ' + bad + ' problems');
process.exit(bad ? 1 : 0);
