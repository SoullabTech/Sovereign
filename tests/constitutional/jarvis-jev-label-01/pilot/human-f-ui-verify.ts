/** Hermetic checks for the Kelly-facing F-pass UI. */
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { blankSheet, seal, snapshot } from './pilot';
import { applyHumanCase, HumanUiRefused, type HumanAnswer } from './human-ui-model';
import {
  applyHumanFCase,
  assertHumanFSheet,
  humanFUiState,
  loadRoutingStates,
  readWorkingFSheet,
  routingTimeView,
  writeAndVerifyWorkingFSheet,
  writeWorkingFSheet,
} from './human-f-ui-model';
import { QUESTION_IDS, type QuestionId } from '../core';

let total = 0;
let failed = 0;
const ok = (name: string, pass: boolean): void => {
  total += 1;
  if (!pass) failed += 1;
  console.log((pass ? 'PASS' : 'FAIL') + '  ' + name);
};
const refused = (f: () => unknown, code: string): boolean => {
  try { f(); return false; }
  catch (e) { return e instanceof HumanUiRefused && e.code === code; }
};
const raw = {
  work_unit: {
    identity: { id: 'v2-secret', objective: 'full objective', task_shape: 'CODE_GROUNDED', work_class: 'IMPLEMENTATION' },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    routing_request: { requested_posture: 'default', review_pressure: 'ordinary' },
    context: { context_refs: ['a'], evidence_refs: ['b'], assumptions: ['c'], unknowns: ['d'] },
    scope: { repository: 'repo', base_ref: 'abc', allowed_paths: ['lib/x.ts'], forbidden_paths: [] },
    authority: { repository_read: true, repository_write: 'none', shell: 'none', network_external: false },
    routing: { router_version: 'r', route_version: 'v', route_source: 'local', bound_at_sha: 'abc',
      primary: { provider: 'qwen' }, challengers: [], transport_bindings: [], route_record: { x: 1 }, execution_connected: true },
    execution: { attempts: [{ secret: 'outcome' }], artifacts: ['artifact'], diffs: ['diff'], test_results: ['result'] },
    evaluation: { acceptance_conditions: ['a'], falsification_conditions: ['f'], stop_conditions: ['s'], verifier_results: ['later'] },
    provenance: { resulting_commits: ['later-commit'], model_identity: ['later-model'] },
    state: { lifecycle_state: 'DONE', disposition: 'closed' },
  },
};
const view = routingTimeView(raw);
const rendered = JSON.stringify(view);
ok('routing-time view keeps objective/context/routing material', rendered.includes('full objective') && rendered.includes('unknowns'));
ok('routing-time view strips execution attempts and outcomes', !rendered.includes('outcome') && !('execution' in view));
ok('routing-time view strips verifier results and later provenance/state', !rendered.includes('later') && !('state' in view));

const root = mkdtempSync(join(tmpdir(), 'jev-f-ui-'));
const home = join(root, 'home');
const dir = join(home, 'work-units-v2');
mkdirSync(dir, { recursive: true });
for (let i = 0; i < 2; i += 1) {
  const id = 'v2-unit-' + i;
  const unit = structuredClone(raw.work_unit);
  unit.identity.id = id;
  writeFileSync(join(dir, id + '.json'), JSON.stringify({ work_unit: unit }));
}
const { manifest, index } = snapshot(home, 2);
const p0 = blankSheet(manifest, 'A', 'P');
const pAnswers: Record<QuestionId, HumanAnswer> = {
  Q_DEPTH: { value: 2, ambiguous: false, note: null },
  Q_RISK: { value: false, ambiguous: false, note: null },
  Q_SUFFICIENT: { value: true, ambiguous: false, note: null },
  Q_LLM_NEEDED: { value: true, ambiguous: false, note: null },
};
let p = p0;
for (const id of manifest.units.map((u) => u.pilot_id)) p = applyHumanCase(p, id, pAnswers);
const pSeal = seal(manifest, p, 1);
const f = blankSheet(manifest, 'A', 'F', pSeal);
ok('F sheet is bound to the prior P seal', typeof f.after_p_seal_sha256 === 'string' && f.after_p_seal_sha256.length > 0);
ok('P sheet is refused by the F UI', refused(() => assertHumanFSheet(p0), 'F_ONLY'));
const states = loadRoutingStates(home, manifest, index);
const state0 = humanFUiState(f, states);
ok('F UI loads one frozen full state per selected case', state0.total_cases === 2 && Object.keys(states).length === 2);
ok('F UI starts with zero completed cases', state0.completed_cases === 0);

const id0 = state0.cases[0]!.pilot_id;
const invalid: Record<QuestionId, HumanAnswer> = {
  Q_DEPTH: { value: 'UNDETERMINABLE', ambiguous: true, note: 'no' },
  Q_RISK: { value: false, ambiguous: false, note: null },
  Q_SUFFICIENT: { value: true, ambiguous: false, note: null },
  Q_LLM_NEEDED: { value: true, ambiguous: false, note: null },
};
ok('F refuses UNDETERMINABLE', refused(() => applyHumanFCase(f, id0, invalid), 'INVALID_F_VALUE'));

const valid: Record<QuestionId, HumanAnswer> = {
  Q_DEPTH: { value: 4, ambiguous: true, note: 'nearest band' },
  Q_RISK: { value: true, ambiguous: false, note: null },
  Q_SUFFICIENT: { value: false, ambiguous: false, note: null },
  Q_LLM_NEEDED: { value: true, ambiguous: false, note: null },
};
const saved = applyHumanFCase(f, id0, valid);
ok('valid F case completes exactly one case', humanFUiState(saved, states).completed_cases === 1);
const sourcePath = join(root, 'F-source.json');
const workingPath = join(root, 'F-working.json');
writeFileSync(sourcePath, JSON.stringify(f, null, 2));
writeWorkingFSheet(workingPath, saved);
ok('F working copy is forced to mode 0600', (statSync(workingPath).mode & 0o777) === 0o600);
ok('F resume preserves P-seal binding and progress', humanFUiState(readWorkingFSheet(sourcePath, workingPath), states).completed_cases === 1);
const verified = writeAndVerifyWorkingFSheet(sourcePath, workingPath, saved);
ok('F save is read back from disk before success', humanFUiState(verified, states).completed_cases === 1);

const drift = JSON.parse(readFileSync(workingPath, 'utf8'));
drift.after_p_seal_sha256 = 'wrong';
writeFileSync(workingPath, JSON.stringify(drift));
chmodSync(workingPath, 0o600);
ok('F working copy bound to another P seal is refused',
  refused(() => readWorkingFSheet(sourcePath, workingPath), 'WORKING_P_SEAL_MISMATCH'));

console.log('\n' + total + ' checks · ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
