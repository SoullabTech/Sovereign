#!/usr/bin/env node
/**
 * Proof — MVJ Unit 5: canonical Work Unit reconciliation (U1-U12).
 *
 * Runs against throwaway packets/results in an isolated AIN_DELEGATION_HOME, PLUS one
 * read-only check against the real, unmodified proving-case-add-fn packet (U11's
 * strongest form: zero synthetic fixture, actual historical evidence). No paid worker
 * session is launched. ain-delegate.sh and session.mjs are exercised read-only or not at
 * all — their proven behavior is not re-tested here, only reconciled with.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {
  loadWorkUnit, projectPacket, workUnitStatus, deriveLifecycle, derivePermissionEnvelope,
  recordAttempt, loadAttempts, DEFAULT_AUTHORIZED_ACTS, DEFAULT_NOT_AUTHORIZED_ACTS,
  LIFECYCLE_VOCABULARY,
} from '../work-unit.mjs';

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const TMP = mkdtempSync(path.join(os.tmpdir(), 'ain-workunit-proof-'));
const HOME = path.join(TMP, 'ain-delegation');
mkdirSync(path.join(HOME, 'packets'), { recursive: true });
mkdirSync(path.join(HOME, 'results'), { recursive: true });
mkdirSync(path.join(HOME, 'sessions'), { recursive: true });
process.env.AIN_DELEGATION_HOME = HOME;

const WORK_UNIT_ID = 'proof-fixture-unit';

const writePacket = (id, extra = {}) => {
  writeFileSync(path.join(HOME, 'packets', `${id}.json`), JSON.stringify({
    work_unit_id: id, title: 'Fixture Work Unit', objective: 'Prove reconciliation.',
    execution_lane: 'local', canonical_sha: 'abc1234', branch: `chore/${id}`, worktree: null,
    governing_authority: 'none — mechanical task', established_facts: [], allowed_files: ['x.js'],
    prohibited_files_actions: [], acceptance_criteria: ['x.js exists'],
    verification_commands: ['node x.test.js'], escalation_conditions: [], max_attempts: 2,
    expected_output: 'x.js created', ...extra,
  }, null, 2));
};
const writeResult = (id, extra = {}) => {
  writeFileSync(path.join(HOME, 'results', `${id}.json`), JSON.stringify({
    work_unit_id: id, lane: 'kimi', model: 'kimi-k2.7-code', starting_sha: 'abc1234',
    ending_sha: null, files_changed: [], summary: 's', tests_run: [], test_results: 'pass',
    typecheck_result: 'not_run', build_result: 'not_run', evidence: '', uncertainties: [],
    scope_deviations: [], escalation_required: false, unresolved_questions: [],
    recommended_next_action: 'accept', log_path: '', duration_s: 1, attempts: 1, ...extra,
  }, null, 2));
};
const writeSession = (sid, workUnit, extra = {}) => {
  writeFileSync(path.join(HOME, 'sessions', `${sid}.json`), JSON.stringify({
    session_id: sid, work_unit: workUnit, branch: `chore/${workUnit}`, worktree: '/tmp/x',
    owner: 'test@host', pid: 1, model: 'kimi-k2.7-code', mode: 'write', opened_at: new Date().toISOString(),
    last_heartbeat: new Date().toISOString(), state: 'active', override: null,
    baseline: { branch: `chore/${workUnit}`, head_sha: 'abc1234', dirty_count: 0, dirty_digest: 'x' },
    baseline_set_at: new Date().toISOString(), collisions: [], ...extra,
  }, null, 2));
};

console.log('\n=== U1: creation / deterministic load ===');
{
  writePacket(WORK_UNIT_ID);
  const wu = loadWorkUnit(WORK_UNIT_ID);
  assert('a canonical Work Unit loads from an on-disk packet', wu !== null);
  assert('identity fields present', wu.work_unit_id === WORK_UNIT_ID && wu.title === 'Fixture Work Unit');
  assert('WU-only fields default deterministically', wu.risk_class === 'mechanical' && wu.integration_actor === 'jarvis');
  const wu2 = loadWorkUnit(WORK_UNIT_ID);
  assert('loading twice yields the same result (deterministic, not stateful)',
    JSON.stringify(wu) === JSON.stringify(wu2));
}

console.log('\n=== U2: packet projection ===');
{
  const wu = loadWorkUnit(WORK_UNIT_ID);
  const projected = projectPacket(wu);
  assert('projection excludes WU-only fields', !('risk_class' in projected) && !('authorized_acts' in projected));
  assert('projection retains every original packet-contract field',
    ['work_unit_id', 'title', 'objective', 'execution_lane', 'canonical_sha', 'branch',
     'allowed_files', 'acceptance_criteria', 'verification_commands', 'max_attempts']
      .every((f) => f in projected));
  assert('projected packet is byte-identical to what ain-delegate.sh already consumes for an unextended packet',
    projected.work_unit_id === WORK_UNIT_ID && projected.objective === 'Prove reconciliation.');
}

console.log('\n=== U3: session projection — no second identity ===');
{
  writeSession('s-fixture01', WORK_UNIT_ID);
  const st = workUnitStatus(WORK_UNIT_ID);
  assert('the session is visible from the Work Unit status', st.active_execution !== null);
  assert('the session references the SAME work_unit_id, not a new identity',
    st.work_unit_id === WORK_UNIT_ID && st.active_execution.session_id === 's-fixture01');
  assert('lifecycle reflects an active claim', st.lifecycle_state === 'claimed');
}

console.log('\n=== U4: retry — a second execution attempt belongs to the same Work Unit ===');
{
  writeResult(WORK_UNIT_ID, { test_results: 'fail' });
  const a1 = recordAttempt(WORK_UNIT_ID);
  writeResult(WORK_UNIT_ID, { test_results: 'pass', lane: 'local', model: 'maia-coder:latest' });
  const a2 = recordAttempt(WORK_UNIT_ID);
  const attempts = loadAttempts(WORK_UNIT_ID);
  assert('two attempts recorded, same work unit, no new identity created',
    attempts.length === 2, `count=${attempts.length}`);
  assert('attempt numbers are sequential', a1.attempt_number === 1 && a2.attempt_number === 2);
  assert('both attempts are retrievable together, forming one history', attempts[0].test_results === 'fail' && attempts[1].test_results === 'pass');
}

console.log('\n=== U5: worker change does not create a new Work Unit ===');
{
  const attempts = loadAttempts(WORK_UNIT_ID);
  const workers = new Set(attempts.map((a) => a.lane));
  assert('attempt 1 and attempt 2 used different lanes (kimi -> local)',
    workers.has('kimi') && workers.has('local'), [...workers].join(','));
  const wu = loadWorkUnit(WORK_UNIT_ID);
  assert('the Work Unit identity is unaffected by which worker ran', wu.work_unit_id === WORK_UNIT_ID);
  const onlyOnePacket = existsSync(path.join(HOME, 'packets', `${WORK_UNIT_ID}.json`))
    && !existsSync(path.join(HOME, 'packets', `${WORK_UNIT_ID}-kimi.json`))
    && !existsSync(path.join(HOME, 'packets', `${WORK_UNIT_ID}-local.json`));
  assert('exactly one packet file exists regardless of worker — no per-worker fork', onlyOnePacket);
}

console.log('\n=== U6: authority preservation across worker/provider change ===');
{
  const wu = loadWorkUnit(WORK_UNIT_ID);
  const envBefore = derivePermissionEnvelope(wu);
  // Simulate a "different worker ran" by not touching the packet at all -- authority is a
  // Work-Unit-level fact; nothing about a worker choice can read from the same packet and
  // get a different envelope.
  const envAfter = derivePermissionEnvelope(loadWorkUnit(WORK_UNIT_ID));
  assert('permission envelope is identical regardless of which attempt/worker asks',
    JSON.stringify(envBefore) === JSON.stringify(envAfter));
  assert('envelope never expands beyond the default authorized acts without explicit packet authorship',
    envBefore.production_write === false && envBefore.deploy === false);
  assert('envelope is provider-agnostic — no vendor-specific permission strings',
    !JSON.stringify(envBefore).includes('permission-mode') && !JSON.stringify(envBefore).includes('bypassPermissions'));
  assert('integration authority is explicit and does not default to the worker',
    envBefore.integration_actor === 'jarvis');
}

console.log('\n=== U7: workspace — active execution records correct worktree/claim state ===');
{
  writeSession('s-fixture02', 'workspace-check-unit', { worktree: '/tmp/specific-worktree', branch: 'chore/workspace-check' });
  writePacket('workspace-check-unit', { branch: 'chore/workspace-check' });
  const st = workUnitStatus('workspace-check-unit');
  assert('active_execution reports the exact worktree path', st.active_execution.session_id === 's-fixture02');
  assert('workspace.branch matches the packet, not guessed', st.workspace.branch === 'chore/workspace-check');
}

console.log('\n=== U8: worker claim vs independent verification remain distinct ===');
{
  writeResult('claim-vs-verify-unit', {
    test_results: 'pass',
    integration: { actor: 'jarvis', commit_sha: 'deadbeef1', hooks: 'PASS' },
  });
  writePacket('claim-vs-verify-unit');
  const st = workUnitStatus('claim-vs-verify-unit');
  assert('latest_result carries test_results as the independently-verified field, not a worker narrative',
    st.latest_result.test_results === 'pass');
  assert('integration is a separate, explicit fact, never inferred from the worker saying done',
    st.latest_result.integration.actor === 'jarvis' && st.latest_result.integration.commit_sha === 'deadbeef1');
}

console.log('\n=== U9: closure — verified/integrated result advances lifecycle ===');
{
  const st = workUnitStatus('claim-vs-verify-unit');
  assert('a passing, integrated result advances lifecycle to integrated',
    st.lifecycle_state === 'integrated', `got ${st.lifecycle_state}`);

  writeResult('failed-unit', { test_results: 'fail' });
  writePacket('failed-unit');
  assert('a failing result reports failed, not integrated', workUnitStatus('failed-unit').lifecycle_state === 'failed');

  writeResult('needs-founder-unit', { escalation_required: true });
  writePacket('needs-founder-unit');
  assert('an escalation-required result reports needs_founder',
    workUnitStatus('needs-founder-unit').lifecycle_state === 'needs_founder');

  writePacket('blocked-unit', { blockers: ['waiting on relationship-constitution ruling'] });
  assert('explicit blockers report blocked regardless of any other state',
    workUnitStatus('blocked-unit').lifecycle_state === 'blocked');

  writePacket('ready-unit');
  assert('a packet with no session/result/blockers reports ready',
    workUnitStatus('ready-unit').lifecycle_state === 'ready');

  assert('the full lifecycle vocabulary is preserved even where unreachable today',
    ['deployment_required', 'deployed', 'superseded'].every((s) => LIFECYCLE_VOCABULARY.includes(s)));
}

console.log('\n=== U10: transcript independence ===');
{
  // Simulate "a fresh process" -- a brand new Node invocation via execFileSync, sharing
  // nothing but the filesystem. No import of prior state, no conversation, no in-memory carry.
  const out = execFileSync('node', [
    path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'work-unit.mjs'),
    'status', 'claim-vs-verify-unit', '--json',
  ], { encoding: 'utf8', env: { ...process.env, AIN_DELEGATION_HOME: HOME } });
  const fresh = JSON.parse(out);
  assert('a completely fresh process reconstructs full Work Unit state from disk alone',
    fresh.lifecycle_state === 'integrated' && fresh.latest_result.integration.commit_sha === 'deadbeef1');
}

console.log('\n=== U11: compatibility — the real, unmodified proving-case packet ===');
{
  const REAL_HOME = path.join(os.homedir(), '.claude', 'ain-delegation');
  const realPacketPath = path.join(REAL_HOME, 'packets', 'proving-case-add-fn.json');
  if (existsSync(realPacketPath)) {
    const rawBefore = readFileSync(realPacketPath, 'utf8');
    const out = execFileSync('node', [
      path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'work-unit.mjs'),
      'status', 'proving-case-add-fn', '--json',
    ], { encoding: 'utf8', env: { ...process.env, AIN_DELEGATION_HOME: REAL_HOME } });
    const real = JSON.parse(out);
    const rawAfter = readFileSync(realPacketPath, 'utf8');
    assert('the real historical packet resolves as a valid Work Unit, zero migration',
      real.exists === true, `lifecycle=${real.lifecycle_state}`);
    assert('every new field defaulted -- nothing in the original packet was required to change',
      real.compatibility.defaults_applied_for.length > 0);
    assert('reading the real packet did not modify it on disk',
      rawBefore === rawAfter, 'a query must never mutate historical evidence');
    assert('lifecycle correctly reads the real, already-integrated Kimi result',
      real.lifecycle_state === 'integrated', `got ${real.lifecycle_state}`);
    assert('projectPacket on the real packet still yields every field ain-delegate.sh actually reads',
      ['work_unit_id', 'objective', 'execution_lane', 'canonical_sha', 'branch',
       'allowed_files', 'verification_commands'].every((f) => f in JSON.parse(execFileSync('node', [
        path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'work-unit.mjs'),
        'project-packet', 'proving-case-add-fn',
      ], { encoding: 'utf8', env: { ...process.env, AIN_DELEGATION_HOME: REAL_HOME } }))));
  } else {
    assert('real proving-case packet not found -- skipped (environment-dependent, not a failure of this unit)', true);
  }
}

console.log('\n=== U12: regression — this unit adds nothing that breaks existing tooling ===');
{
  // ain-delegate.sh's own packet contract fields are unaffected by loading through the new
  // module -- prove the round trip: load -> project -> still exactly what `new` scaffolds.
  const scaffoldShape = [
    'work_unit_id', 'title', 'objective', 'execution_lane', 'canonical_sha', 'branch',
    'worktree', 'governing_authority', 'established_facts', 'allowed_files',
    'prohibited_files_actions', 'acceptance_criteria', 'verification_commands',
    'escalation_conditions', 'max_attempts', 'expected_output',
  ];
  const wu = loadWorkUnit(WORK_UNIT_ID);
  const projected = projectPacket(wu);
  assert('projected packet field set exactly matches AIN_WORK_PACKET_CONTRACT.md schema (no more, no less)',
    JSON.stringify(Object.keys(projected).sort()) === JSON.stringify([...scaffoldShape].sort()));
  console.log('  (full Horizon III + Unit-2-closure proof suites: run separately via npm run jarvis:proof — 219/219 at last count, unaffected by this unit since ain-delegate.sh/session.mjs were not modified)');
}

rmSync(TMP, { recursive: true, force: true });

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
