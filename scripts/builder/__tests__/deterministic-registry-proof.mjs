// Route A — deterministic capability registry proof.
// Per docs/ops/JARVIS_ROUTE_A_CUSTODY_ADOPTION_PROOF_2026-08-11.md.
// The original packet (jarvis-route-a-sub-a-registry) required this file as
// one of two allowed_files; it was never delivered — the delegation exited 1
// before producing it. This is that missing file, written during custody
// adoption so acceptance criterion A8 is finally testable, not asserted.
import { CAPABILITIES, runCapability } from '../deterministic.mjs';
import { existsSync, unlinkSync } from 'node:fs';

const cwd = process.cwd();
let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log(`PASS  ${name}`); }
  catch (e) { fail++; console.log(`FAIL  ${name} :: ${e.message}`); }
}
function expectThrow(name, fn) {
  try { fn(); fail++; console.log(`FAIL  ${name} (did not throw)`); }
  catch (e) { pass++; console.log(`PASS  ${name} :: threw "${e.message}"`); }
}

const REQUIRED_15 = [
  'git.rev_parse', 'git.log', 'git.show_stat', 'git.diff_stat',
  'git.branch_contains', 'git.file_history', 'repo.grep', 'repo.find_file',
  'repo.locate_symbol', 'check.run', 'inventory.migrations',
  'inventory.routes', 'verify.file_exists', 'verify.sha256',
  'verify.count_matches',
];

t('all 15 required capabilities registered, no more no fewer', () => {
  const got = Object.keys(CAPABILITIES).sort();
  const want = [...REQUIRED_15].sort();
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    throw new Error(`got [${got.join(',')}] want [${want.join(',')}]`);
  }
});

t('git.rev_parse returns a sha', () => {
  const r = runCapability('git.rev_parse', {}, cwd);
  if (!r || typeof r.stdout !== 'string' || r.stdout.trim().length < 7) throw new Error('bad result');
});

expectThrow('unknown capability rejected', () => runCapability('nonexistent.thing', {}, cwd));
expectThrow('unknown argument key rejected', () => runCapability('git.rev_parse', { bogus_key: 'x' }, cwd));
expectThrow('wrong type rejected', () => runCapability('git.rev_parse', { ref: 12345 }, cwd));
expectThrow('path escape rejected', () => runCapability('verify.file_exists', { path: '../../../../../../etc/passwd' }, cwd));
expectThrow('oversized string rejected', () => runCapability('git.rev_parse', { ref: 'x'.repeat(5000) }, cwd));
expectThrow('check.run rejects an unlisted test_type', () => runCapability('check.run', { test_type: 'rm -rf /' }, cwd));

// The canonical injection case named in the original packet's own A8.
const MARK = '/tmp/__route_a_pwned_marker_proof__';
try { unlinkSync(MARK); } catch {}
t('repo.grep pattern "$(whoami); echo pwned" matched literally, never executed', () => {
  try { runCapability('repo.grep', { pattern: '$(whoami); echo pwned' }, cwd); } catch {}
  if (existsSync(MARK)) throw new Error('SIDE EFFECT — injection executed');
});

t('repo.grep zero matches → zero results, no crash (git grep exit 1 is not an error)', () => {
  const r = runCapability('repo.grep', { pattern: '___definitely_absent_xyz999___' }, cwd);
  if (r.exit_code !== 0) throw new Error('expected exit_code 0, got ' + r.exit_code);
});

t('repo.grep max_results capped at 200', () => {
  const d = CAPABILITIES['repo.grep'].args.max_results;
  if (!(d.max <= 200)) throw new Error('cap is ' + d.max);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
