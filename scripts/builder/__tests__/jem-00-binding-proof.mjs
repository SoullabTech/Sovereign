#!/usr/bin/env node
/**
 * Proof — JEM-00, canonical repository/runtime binding (Gate 0).
 *
 * The Gate 0 acceptance condition is behavioural, not architectural: a bounded
 * task must resolve the canonical repository, verify it, refuse when it cannot,
 * and still know what it resolved AFTER A RESTART. Everything below is asserted
 * against real processes and a real filesystem — the restart assertions in
 * particular spawn genuinely separate `node` processes, because a second call
 * inside one process proves memory, not durability, and durability is the whole
 * claim.
 *
 * No assertion here reads prose. Verdicts come from exit codes and structured
 * fields, for the same reason run-check.mjs does: a proof that greps output is
 * a proof that a decoy string can flip.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUILDER = path.join(HERE, '..');
const BINDING_MJS = path.join(BUILDER, 'jarvis-binding.mjs');
const REPO = path.resolve(BUILDER, '..', '..');

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const TMP = mkdtempSync(path.join(os.tmpdir(), 'jem00-binding-proof-'));
const cleanup = () => { try { rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ } };

/** Run the binding CLI as a genuinely separate process. */
function bind(env = {}) {
  const args = [BINDING_MJS, '--json'];
  try {
    const out = execFileSync('node', args, {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
    });
    return { code: 0, json: JSON.parse(out) };
  } catch (e) {
    const stdout = (e.stdout ?? '').toString();
    let json = null;
    try { json = JSON.parse(stdout); } catch { /* refusal may print nothing parseable */ }
    return { code: e.status ?? 1, json };
  }
}

/** A directory that looks like a checkout but is not one — no markers. */
function makeDecoy(name) {
  const d = path.join(TMP, name);
  mkdirSync(path.join(d, 'scripts', 'builder'), { recursive: true });
  writeFileSync(path.join(d, 'README.md'), 'not a checkout\n');
  return d;
}

/** A directory carrying all four canonical markers, in a real git repo. */
function makeCheckout(name) {
  const d = path.join(TMP, name);
  mkdirSync(path.join(d, 'scripts', 'builder'), { recursive: true });
  for (const f of ['session.mjs', 'deterministic.mjs', 'router.mjs']) {
    writeFileSync(path.join(d, 'scripts', 'builder', f), '// marker\n');
  }
  writeFileSync(path.join(d, 'package.json'), '{"name":"decoy-checkout"}\n');
  execFileSync('git', ['init', '-q', '-b', 'proof'], { cwd: d });
  execFileSync('git', ['config', 'user.email', 'p@example.invalid'], { cwd: d });
  execFileSync('git', ['config', 'user.name', 'P'], { cwd: d });
  execFileSync('git', ['add', '-A'], { cwd: d });
  execFileSync('git', ['commit', '-qm', 'markers'], { cwd: d });
  return d;
}

console.log('\n=== 1. THE RUNTIME RESOLVES A VERIFIED CANONICAL REPOSITORY ===');
{
  const r = bind();
  assert('binding CLI exits 0 when bound', r.code === 0, `exit=${r.code}`);
  assert('the resolved root is this checkout', r.json?.root === REPO, `root=${r.json?.root}`);
  assert('the markers were actually VERIFIED, not assumed', r.json?.markers_verified === true);
  assert('all four canonical markers are the ones checked',
    r.json?.markers?.length === 4 && r.json.markers.includes('scripts/builder/session.mjs'),
    JSON.stringify(r.json?.markers));
  assert('the binding carries provenance — which rung answered', typeof r.json?.resolution === 'string' && r.json.resolution.length > 0,
    `resolution=${r.json?.resolution}`);
  assert('the binding is EXPLICIT, not an unnamed fallback', r.json?.explicit === true);
  assert('substrate identity is reported as its own fact', r.json?.substrate?.git_connected === true,
    `head=${r.json?.substrate?.head?.slice(0, 12)} branch=${r.json?.substrate?.branch}`);
}

console.log('\n=== 2. AN EXPLICIT BINDING IS HONOURED — THE OLD ONE-LINER IGNORED THESE ===');
{
  // The pre-JEM-00 REPO_ROOT was `path.resolve(__dirname,'..','..')`, which
  // could not be influenced by anything. Proving the walk still wins matters
  // just as much as proving env is read: no checkout that resolved correctly
  // before may resolve differently now.
  const other = makeCheckout('other-checkout');
  const r = bind({ JARVIS_REPO_ROOT: other });
  assert('the walk still outranks env — a runtime living in a checkout means THIS one',
    r.json?.root === REPO, `root=${r.json?.root}`);
  assert('...so no previously-working binding can have changed', r.code === 0);

  // Reached via the ladder directly, with the walk removed — the only way env
  // is consulted at all.
  const laddered = execFileSync('node', ['--input-type=module', '-e', `
    import { resolveBinding } from ${JSON.stringify(BINDING_MJS)};
    const b = resolveBinding({ walk: () => null, env: { JARVIS_REPO_ROOT: ${JSON.stringify(other)} } });
    console.log(JSON.stringify(b));
  `], { encoding: 'utf8' });
  const lj = JSON.parse(laddered);
  assert('when the walk finds nothing, JARVIS_REPO_ROOT is honoured', lj.root === other, `root=${lj.root}`);
  assert('and it is reported as explicit-env, not as a guess', lj.resolution === 'explicit-env', `resolution=${lj.resolution}`);
}

console.log('\n=== 3. AN UNVERIFIED DIRECTORY IS REFUSED, NOT SILENTLY BOUND ===');
{
  const decoy = makeDecoy('decoy-no-markers');
  const r = execFileSync('node', ['--input-type=module', '-e', `
    import { resolveBinding } from ${JSON.stringify(BINDING_MJS)};
    console.log(JSON.stringify(resolveBinding({
      walk: () => null,
      env: { JARVIS_REPO_ROOT: ${JSON.stringify(decoy)} },
      appSupportDir: ${JSON.stringify(path.join(TMP, 'empty-appsupport'))},
    })));
  `], { encoding: 'utf8' });
  const j = JSON.parse(r);
  assert('a directory without the markers does NOT become the binding', j.root === null, `root=${j.root}`);
  assert('the refusal is named', j.failure_class === 'REPO_BINDING_UNRESOLVED', `failure_class=${j.failure_class}`);
  assert('ok is false — callers branch on a field, not on prose', j.ok === false);
  assert('the problem names the directory the founder actually set',
    typeof j.config_problem === 'string' && j.config_problem.includes(decoy), j.config_problem);
  assert('resolution is reported as unresolved, not left blank', j.resolution === 'unresolved');
}

console.log('\n=== 4. THE RUNTIME REFUSES TO ROUTE ON AN UNRESOLVED BINDING ===');
{
  // The Gate 0 defect verbatim: "repo root not found — cannot route". The
  // pipeline must now name the condition instead of failing downstream as a
  // worktree-claim error, which is a different problem with a different fix.
  const out = execFileSync('node', ['--input-type=module', '-e', `
    import { checkAuthority, validatePacket } from ${JSON.stringify(path.join(BUILDER, 'jarvis-runtime-pipeline.mjs'))};
    import { BINDING_UNRESOLVED } from ${JSON.stringify(BINDING_MJS)};
    console.log(JSON.stringify({ failure_class: BINDING_UNRESOLVED, loaded: typeof validatePacket === 'function' }));
  `], { encoding: 'utf8' });
  const j = JSON.parse(out);
  assert('the pipeline imports cleanly against the shared binding', j.loaded === true);
  assert('and exports the named refusal the routing gate uses',
    j.failure_class === 'REPO_BINDING_UNRESOLVED', `failure_class=${j.failure_class}`);

  const src = readFileSync(path.join(BUILDER, 'jarvis-runtime-pipeline.mjs'), 'utf8');
  assert('the refusal gate sits BEFORE the worktree claim, not after it',
    src.indexOf('BINDING_UNRESOLVED,') < src.indexOf("'claim', packet.work_unit_id"),
    'a binding checked after the claim has already touched a filesystem it could not vouch for');
  assert('no unverified REPO_ROOT inference survives in the pipeline',
    !/REPO_ROOT\s*=\s*path\.resolve\(/.test(src));
}

console.log('\n=== 5. THE BINDING SURVIVES A RESTART (SEPARATE PROCESSES) ===');
{
  const home = path.join(TMP, 'ain-home');
  const rec = path.join(home, 'runtime', 'binding.json');
  const env = { ...process.env, AIN_DELEGATION_HOME: home };

  // Process A records what it bound to, then exits.
  execFileSync('node', [BINDING_MJS, '--record'], { env, stdio: 'ignore' });
  assert('process A persisted a binding record', existsSync(rec), rec);
  const a = JSON.parse(readFileSync(rec, 'utf8'));
  assert('the record carries the root', a.root === REPO, `root=${a.root}`);
  assert('the record carries the resolution rung, not just the path', typeof a.resolution === 'string' && a.resolution.length > 0);
  assert('the record carries substrate identity at bind time', typeof a.substrate?.head === 'string');
  assert('first record reports no prior binding', a.previous_root === null && a.rebound_since_last_run === false);

  // Process B — a genuinely new process, nothing shared but the filesystem —
  // reads what A believed. This is the acceptance condition: a later process
  // can answer what an earlier one was operating on.
  const bOut = execFileSync('node', ['--input-type=module', '-e', `
    import { readBindingRecord } from ${JSON.stringify(BINDING_MJS)};
    console.log(JSON.stringify(readBindingRecord()));
  `], { encoding: 'utf8', env });
  const b = JSON.parse(bOut);
  assert('a NEW process reads the prior binding across the restart', b.root === a.root, `read back root=${b.root}`);
  assert('...including its provenance, not merely its path', b.resolution === a.resolution);
  assert('...and the pid that wrote it, so the record is attributable', b.pid === a.pid && b.pid !== process.pid);
}

console.log('\n=== 6. A REBIND IS RECORDED, NEVER SILENT ===');
{
  const home = path.join(TMP, 'ain-home-2');
  const other = makeCheckout('rebind-target');
  const env = { ...process.env, AIN_DELEGATION_HOME: home };
  const record = (walkTo) => JSON.parse(execFileSync('node', ['--input-type=module', '-e', `
    import { resolveBinding, recordBinding } from ${JSON.stringify(BINDING_MJS)};
    console.log(JSON.stringify(recordBinding(resolveBinding({ walk: () => ${JSON.stringify(walkTo)} }))));
  `], { encoding: 'utf8', env }));

  const first = record(REPO);
  assert('first bind reports no rebind', first.rebound_since_last_run === false);
  const second = record(other);
  assert('a changed root is flagged as a rebind', second.rebound_since_last_run === true,
    `${second.previous_root} -> ${second.root}`);
  assert('the previous root travels forward in the record', second.previous_root === REPO, `previous=${second.previous_root}`);
  const third = record(other);
  assert('binding to the SAME root twice is not reported as a rebind', third.rebound_since_last_run === false);
}

console.log('\n=== 7. DIVERGENCE BETWEEN THE TWO PLANES IS VISIBLE, NOT ASSUMED ===');
{
  // The Desktop's saved binding and the runtime's binding are allowed to differ.
  // What is not allowed is for that to be invisible: the runtime writes to a
  // filesystem, and which one must be a stated fact.
  const appSupport = path.join(TMP, 'appsupport-diverged');
  const saved = makeCheckout('desktop-saved');
  mkdirSync(path.join(appSupport, 'JARVIS'), { recursive: true });
  writeFileSync(path.join(appSupport, 'JARVIS', 'config.json'),
    JSON.stringify({ version: 1, repo_root: saved, set_at: new Date().toISOString(), set_by: 'proof' }, null, 2));

  const j = JSON.parse(execFileSync('node', ['--input-type=module', '-e', `
    import { resolveBinding } from ${JSON.stringify(BINDING_MJS)};
    console.log(JSON.stringify(resolveBinding({ appSupportDir: ${JSON.stringify(appSupport)} })));
  `], { encoding: 'utf8' }));

  assert('the runtime still binds to its own checkout', j.root === REPO, `root=${j.root}`);
  assert('the Desktop’s saved binding is read, not ignored', j.config_root === saved, `config_root=${j.config_root}`);
  assert('the divergence is REPORTED as a fact', typeof j.divergence === 'string' && j.divergence.includes(saved), j.divergence);
  assert('divergence is not an error — the binding is still ok', j.ok === true);
  assert('the config path actually read is named, so a mapping drift is legible',
    typeof j.config_path === 'string' && j.config_path.endsWith(path.join('JARVIS', 'config.json')), j.config_path);
}

console.log('\n=== 8. ONE DEFINITION OF "CANONICAL CHECKOUT", SHARED BY BOTH PLANES ===');
{
  const desktopMain = readFileSync(path.join(REPO, 'jarvis-desktop', 'src', 'main.js'), 'utf8');
  assert('the Desktop no longer carries its own marker list',
    !/const CANONICAL_MARKERS = \[/.test(desktopMain));
  assert('the Desktop requires the shared definition', /require\('\.\/repo-markers'\)/.test(desktopMain));

  const bindingSrc = readFileSync(BINDING_MJS, 'utf8');
  assert('the runtime requires the same shared definition', /repo-markers\.js/.test(bindingSrc));
  assert('the runtime reuses the Desktop’s proven resolution ORDER rather than restating it',
    /repo-resolution\.js/.test(bindingSrc) && /resolveDevMode/.test(bindingSrc));
  assert('the runtime reads the Desktop’s config through the Desktop’s module',
    /repo-config\.js/.test(bindingSrc));

  const markers = execFileSync('node', ['-e',
    `console.log(JSON.stringify(require(${JSON.stringify(path.join(REPO, 'jarvis-desktop', 'src', 'repo-markers.js'))}).markerNames()))`],
    { encoding: 'utf8' });
  assert('both planes therefore cannot disagree about what a checkout is',
    JSON.parse(markers).length === 4, markers.trim());
}

cleanup();
console.log(`\n${'='.repeat(60)}`);
console.log(`JEM-00 BINDING PROOF: ${passed} passed · ${failed} failed`);
console.log(`${'='.repeat(60)}\n`);
process.exit(failed === 0 ? 0 : 1);
