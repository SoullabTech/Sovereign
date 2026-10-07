/** Hermetic checks for the Kelly-facing packet-only pilot UI. */
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { blankSheet, snapshot } from './pilot';
import {
  applyHumanCase,
  assertHumanPSheet,
  HumanUiRefused,
  humanUiState,
  readWorkingSheet,
  writeWorkingSheet,
  type HumanAnswer,
} from './human-ui-model';
import type { QuestionId } from '../core';

let total = 0;
let failed = 0;
const ok = (name: string, pass: boolean): void => {
  total += 1;
  if (!pass) failed += 1;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
};
const refused = (f: () => unknown, code: string): boolean => {
  try { f(); return false; } catch (e) { return e instanceof HumanUiRefused && e.code === code; }
};

const root = mkdtempSync(join(tmpdir(), 'jev-human-ui-'));
const home = join(root, 'home');
const dir = join(home, 'work-units-v2');
mkdirSync(dir, { recursive: true });
const SECRET = 'DO-NOT-EXPOSE-OBJECTIVE-TEXT';

for (let i = 0; i < 3; i += 1) {
  const id = `v2-${SECRET}-${i}`;
  const work_unit = {
    identity: { id, objective: SECRET, task_shape: i % 2 ? 'ARCHITECTURE_REASONING' : 'CODE_GROUNDED' },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    scope: { allowed_paths: ['lib/example.ts'] },
    authority: { network_external: false, external_disclosure: 'none', production_read: false, production_write: false, deploy: false },
  };
  writeFileSync(join(dir, `${id}.json`), JSON.stringify({ work_unit }));
}

const { manifest } = snapshot(home, 2);
const sheet = blankSheet(manifest, 'A', 'P');
const state0 = humanUiState(sheet);
ok('accepts only the already-cut Kelly P sheet', state0.domain === 'P' && state0.labeller === 'A');
ok('shows two anonymous cases and zero completion', state0.total_cases === 2 && state0.completed_cases === 0);
ok('UI state strips derivation metadata', !('derivation' in (state0.cases[0]?.packet as unknown as Record<string, unknown>)));
ok('UI state carries no authored objective or v2 unit slug', !JSON.stringify(state0).includes(SECRET) && !JSON.stringify(state0).includes('v2-'));
ok('an F sheet is refused', refused(() => assertHumanPSheet({ ...sheet, domain: 'F' }), 'P_ONLY'));

const caseId = state0.cases[0]!.pilot_id;
const partial: Partial<Record<QuestionId, HumanAnswer>> = {
  Q_RISK: { value: true, ambiguous: false, note: null },
};
ok('incomplete case save is refused', refused(() => applyHumanCase(sheet, caseId, partial), 'INCOMPLETE_CASE'));

const invalid: Record<QuestionId, HumanAnswer> = {
  Q_DEPTH: { value: 9, ambiguous: false, note: null },
  Q_RISK: { value: true, ambiguous: false, note: null },
  Q_SUFFICIENT: { value: false, ambiguous: false, note: null },
  Q_LLM_NEEDED: { value: 'UNDETERMINABLE', ambiguous: true, note: 'packet too thin' },
};
ok('invalid depth is refused', refused(() => applyHumanCase(sheet, caseId, invalid), 'INVALID_VALUE'));

const valid: Record<QuestionId, HumanAnswer> = {
  Q_DEPTH: { value: 3, ambiguous: true, note: 'between routine and integrative' },
  Q_RISK: { value: false, ambiguous: false, note: null },
  Q_SUFFICIENT: { value: 'UNDETERMINABLE', ambiguous: false, note: null },
  Q_LLM_NEEDED: { value: true, ambiguous: false, note: null },
};
const saved = applyHumanCase(sheet, caseId, valid);
const state1 = humanUiState(saved);
ok('valid case becomes complete without completing its neighbour', state1.completed_cases === 1 && state1.cases[0]!.complete && !state1.cases[1]!.complete);
ok('P-only UNDETERMINABLE survives the working sheet', state1.cases[0]!.answers.Q_SUFFICIENT?.value === 'UNDETERMINABLE');

const sourcePath = join(root, 'source.json');
const workingPath = join(root, 'working.json');
writeFileSync(sourcePath, JSON.stringify(sheet, null, 2));
writeWorkingSheet(workingPath, saved);
ok('working sheet is forced to mode 0600', (statSync(workingPath).mode & 0o777) === 0o600);
ok('saving progress does not mutate the original blank sheet', JSON.parse(readFileSync(sourcePath, 'utf8')).entries.every((e: { value: unknown }) => e.value === null));
ok('server resume loads the existing working progress', humanUiState(readWorkingSheet(sourcePath, workingPath)).completed_cases === 1);

writeFileSync(workingPath, '{bad json', { mode: 0o600 });
ok('corrupt working progress is refused rather than silently discarded', refused(() => readWorkingSheet(sourcePath, workingPath), 'WORKING_READ_FAILED'));

writeWorkingSheet(workingPath, saved);
const drift = JSON.parse(readFileSync(workingPath, 'utf8'));
drift.packets[caseId].task_shape = 'FRONTIER_UNKNOWN';
writeFileSync(workingPath, JSON.stringify(drift));
chmodSync(workingPath, 0o600);
ok('packet drift in a working copy is refused', refused(() => readWorkingSheet(sourcePath, workingPath), 'WORKING_PACKET_DRIFT'));

console.log(`\n${total} checks · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
