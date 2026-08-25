// MAIA-D01 device witness — §1 environment record.
//
// Run on the founder Mac BEFORE launching the shell. Writes a machine-readable
// record so the walk's environment is captured at execution time rather than
// recalled afterward. Every field is either observed or explicitly UNKNOWN —
// nothing is inferred, and an unobservable field must LOOK unobserved.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

const sh = (cmd, args) => {
  try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: 15000 }).trim(); }
  catch { return 'UNKNOWN'; }
};

// macOS input/output device + sample rate, read from the system profiler rather
// than assumed. On non-macOS this returns UNKNOWN, which is the honest answer.
function audioDevices() {
  if (process.platform !== 'darwin') return { raw: 'UNKNOWN — not macOS', platform: process.platform };
  const raw = sh('system_profiler', ['SPAudioDataType']);
  return { raw: raw === 'UNKNOWN' ? 'UNKNOWN' : raw.slice(0, 4000) };
}

let electronVersion = 'UNKNOWN — not installed';
try {
  electronVersion = JSON.parse(
    readFileSync(path.join(root, 'node_modules', 'electron', 'package.json'), 'utf8')
  ).version;
} catch { /* left UNKNOWN */ }

const record = {
  unit: 'MAIA-D01 device witness',
  captured_at: new Date().toISOString(),
  source_sha: sh('git', ['-C', root, 'rev-parse', '--short', 'HEAD']),
  source_dirty: sh('git', ['-C', root, 'status', '--porcelain']) !== '' ,
  branch: sh('git', ['-C', root, 'rev-parse', '--abbrev-ref', 'HEAD']),
  platform: process.platform,
  arch: process.arch,
  macos_version: process.platform === 'darwin' ? sh('sw_vers', ['-productVersion']) : 'UNKNOWN — not macOS',
  machine_model: process.platform === 'darwin' ? sh('sysctl', ['-n', 'hw.model']) : 'UNKNOWN',
  cpu: os.cpus()[0]?.model ?? 'UNKNOWN',
  total_mem_gb: Math.round(os.totalmem() / 1e9),
  node_version: process.version,
  electron_version: electronVersion,
  audio: audioDevices(),
  // Filled in by the founder, because no probe can answer them:
  operator_notes: {
    selected_input_device: 'FILL IN — prefer the built-in Mac microphone for the first witness',
    selected_output_device: 'FILL IN',
    bluetooth_or_airpods_involved: 'FILL IN — should be NO for the first witness',
    room_conditions: 'FILL IN — quiet / normal / noisy',
  },
};

const outDir = path.join(root, 'witness');
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `env-${record.source_sha}-${Date.now()}.json`);
writeFileSync(out, JSON.stringify(record, null, 2));
console.log(JSON.stringify(record, null, 2));
console.log(`\nenvironment record → ${out}`);
if (record.source_dirty) {
  console.log('\n⚠️  WORKING TREE IS DIRTY — the witnessed source is not a clean named SHA.');
  console.log('   Commit or stash before witnessing, or the walk cannot name what it proved.');
}
