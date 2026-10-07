/**
 * Lethality witness for the F durability checks. Each mutation breaks ONE durability decision in a scratch copy of the
 * module; the verify suite must go RED on the named check. A mutation whose pattern is not found FAILS the witness
 * (a mis-keyed mutation would otherwise "kill" nothing and pass silently). The reference (unmutated) copy must be GREEN.
 *
 *   JEV_TSX="npx tsx" npx tsx human-f-durability-mutations.ts     (JEV_TSX defaults to "npx tsx")
 */
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const labelDir = resolve(__dirname, '..');
const tsx = process.env.JEV_TSX ?? 'npx tsx';

interface Mutation { id: string; file: 'human-f-durability.ts' | 'human-f-finish.ts'; edits: Array<[string, string]>; mustFail: string }
const MUTATIONS: Mutation[] = [
  { id: 'M1-no-repair-of-missing-or-diverged-working', file: 'human-f-durability.ts',
    edits: [["if (wText === null || wSha !== expected.sha) {", "if (false) {"]], mustFail: 'primary file DELETED after a successful save' },
  { id: 'M2-diverged-copy-not-preserved', file: 'human-f-durability.ts',
    edits: [["if (wText !== null && wSha !== expected.sha) this.preserveDiverged(wText);", ""]], mustFail: 'diverged copy is preserved' },
  { id: 'M3-event-chain-hash-unchecked', file: 'human-f-durability.ts',
    edits: [["if (typeof event_sha256 !== 'string' || sha256Hex(JSON.stringify(rest)) !== event_sha256) {", "if (typeof event_sha256 !== 'string') {"]], mustFail: 'tampered event log is refused' },
  { id: 'M4-ledger-ahead-ignored-silent-rollback', file: 'human-f-durability.ts',
    edits: [["if (ledgerWant !== null && !genShas.has(ledgerWant)) {", "if (false) {"]], mustFail: 'newest generation deleted' },
  { id: 'M5-blank-start-over-lost-progress', file: 'human-f-durability.ts',
    edits: [["throw new DurabilityRefused('DURABILITY_UNRECOVERABLE',\n          `the ledger records a save (${ledgerWant.slice(0, 12)}…) but no generation, rolling copy or working file matches it`);", "expected = null;"]], mustFail: 'REFUSES' },
  { id: 'M6-generation-written-last', file: 'human-f-durability.ts',
    edits: [["const gen = this.writeGeneration(text, pre.report.generation_count);\n    this.cfg.fault?.('generation');\n    const wSha = atomicWriteVerified(this.cfg.workingPath, text);\n    this.cfg.fault?.('working');\n    const rSha = atomicWriteVerified(this.rollingPath, text);\n    this.cfg.fault?.('rolling');", "const wSha = atomicWriteVerified(this.cfg.workingPath, text);\n    this.cfg.fault?.('working');\n    const rSha = atomicWriteVerified(this.rollingPath, text);\n    this.cfg.fault?.('rolling');\n    const gen = this.writeGeneration(text, pre.report.generation_count);\n    this.cfg.fault?.('generation');"]],
    mustFail: 'crash injected after the WORKING step' },
  { id: 'M7-backup-in-working-directory-allowed', file: 'human-f-durability.ts',
    edits: [["if (physicalPath(backupDir) === physicalPath(dirname(workingPath))) {", "if (false) {"]], mustFail: 'backup directory equal to the working directory is refused' },
  { id: 'M8-manifest-binding-unchecked', file: 'human-f-durability.ts',
    edits: [["if (s.manifest_sha256 !== a.manifest_sha256) throw new DurabilityRefused('MANIFEST_MISMATCH', label);", ""]], mustFail: 'WRONG MANIFEST' },
  { id: 'M9-p-seal-binding-unchecked', file: 'human-f-durability.ts',
    edits: [["if (s.after_p_seal_sha256 !== a.after_p_seal_sha256) throw new DurabilityRefused('P_SEAL_MISMATCH', label);", ""]], mustFail: 'WRONG P SEAL' },
  { id: 'M10-write-once-overwrites', file: 'human-f-durability.ts',
    edits: [
      ["    throw new DurabilityRefused('WRITE_ONCE_CONFLICT', 'a different file already exists at ' + path);", "    /* overwrite */"],
      ["  const fd = openSync(path, 'wx', mode);\n  try { writeSync(fd, data); fsyncSync(fd); } finally { closeSync(fd); }\n  chmodSync(path, mode);\n  fsyncDir(dirname(path));\n  if (readFileSync(path, 'utf8') !== data)",
       "  const fd = openSync(path, 'w', mode);\n  try { writeSync(fd, data); fsyncSync(fd); } finally { closeSync(fd); }\n  chmodSync(path, mode);\n  fsyncDir(dirname(path));\n  if (readFileSync(path, 'utf8') !== data)"],
    ],
    mustFail: 'pre-seal backup path already holding DIFFERENT bytes' },
  { id: 'M11-finish-skips-completeness', file: 'human-f-finish.ts',
    edits: [["if (nonNull !== sheet.entries.length) refuse(", "if (false) refuse("]], mustFail: 'PARTIAL F' },
  { id: 'M12-finish-skips-copy-agreement', file: 'human-f-finish.ts',
    edits: [["if (ins.rollingText === null || sha256Hex(ins.rollingText) !== workingSha) refuse(", "if (false) refuse("]], mustFail: 'working vs rolling disagreement' },
  { id: 'M13-finish-skips-event-log-agreement', file: 'human-f-finish.ts',
    edits: [["if (!ins.lastSaveEvent || ins.lastSaveEvent.working_sha256 !== workingSha) refuse(", "if (false) refuse("]], mustFail: 'final event-log hash' },
  { id: 'M14-finish-skips-expected-p-seal', file: 'human-f-finish.ts',
    edits: [["if (sealDigest(sealedP) !== o.expectPSeal) refuse(", "if (false) refuse("]], mustFail: 'wrong EXPECTED P seal' },
];

function runSuite(dir: string): { code: number; failedLines: string[]; out: string } {
  const r = spawnSync(`${tsx} ${join(dir, 'pilot', 'human-f-durability-verify.ts')}`, { shell: true, encoding: 'utf8', cwd: dir, timeout: 180_000 });
  const out = (r.stdout ?? '') + (r.stderr ?? '');
  return { code: r.status ?? 1, failedLines: out.split('\n').filter((l) => l.startsWith('FAIL')), out };
}
function scratch(): string {
  const dir = mkdtempSync(join(tmpdir(), 'jev-f-mut-'));
  cpSync(labelDir, dir, {
    recursive: true,
    filter: (src) => !/human-f-ui-|human-ui|node_modules/.test(src),
  });
  return dir;
}

let bad = 0;
const ref = scratch();
const r0 = runSuite(ref);
const refGreen = r0.code === 0 && r0.failedLines.length === 0;
console.log((refGreen ? 'PASS' : 'FAIL') + '  reference (unmutated) suite is green');
if (!refGreen) { console.log(r0.out.split('\n').slice(-12).join('\n')); bad += 1; }
rmSync(ref, { recursive: true, force: true });

for (const m of MUTATIONS) {
  const dir = scratch();
  const file = join(dir, 'pilot', m.file);
  let src = readFileSync(file, 'utf8');
  let missing = false;
  for (const [from, to] of m.edits) {
    if (!src.includes(from)) { missing = true; break; }
    src = src.replace(from, to);
  }
  if (missing) { console.log('FAIL  ' + m.id + '  (mutation pattern not found — mis-keyed)'); bad += 1; rmSync(dir, { recursive: true, force: true }); continue; }
  writeFileSync(file, src);
  const r = runSuite(dir);
  const named = r.failedLines.some((l) => l.includes(m.mustFail));
  const killed = r.code !== 0 && named;
  console.log((killed ? 'KILL ' : 'LIVE ') + ' ' + m.id + (killed ? '' : `  — exit ${r.code}, failed: ${r.failedLines.length}, named check ${named ? 'failed' : 'did NOT fail'}`));
  if (!killed) bad += 1;
  rmSync(dir, { recursive: true, force: true });
}
const n = MUTATIONS.length;
console.log(`\n${n - bad < 0 ? 0 : n - (bad - (refGreen ? 0 : 1))}/${n} mutations killed on their named check · reference ${refGreen ? 'green' : 'RED'}`);
process.exit(bad === 0 ? 0 : 1);
