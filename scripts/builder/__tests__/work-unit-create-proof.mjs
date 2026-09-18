import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createWorkUnit, validateWorkUnitCreation } from '../work-unit-create.mjs';

const home = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-wu-create-'));
const packet = {
  work_unit_id: 'desktop-create-proof',
  title: 'Desktop create proof',
  objective: 'Prove canonical Work Unit creation.',
  execution_lane: 'opencode',
  canonical_sha: 'abcdef1234567',
  branch: 'chore/ain-delegate-desktop-create-proof',
  worktree: null,
  governing_authority: 'proof only',
  established_facts: [], allowed_files: [], prohibited_files_actions: [],
  acceptance_criteria: ['creation is bounded'], verification_commands: [],
  escalation_conditions: [], max_attempts: 2,
  expected_output: 'A bounded review.',
  authorized_acts: ['repo.read', 'network.external'],
  not_authorized_acts: ['repo.write:worktree', 'production.write', 'deploy', 'authority.change'],
};

const valid = validateWorkUnitCreation(packet);
assert.equal(valid.ok, true, JSON.stringify(valid));
const created = createWorkUnit(packet, { home });
assert.equal(created.ok, true, JSON.stringify(created));
assert.equal(fs.statSync(created.path).mode & 0o777, 0o600);
assert.deepEqual(JSON.parse(fs.readFileSync(created.path, 'utf8')), packet);

const again = createWorkUnit(packet, { home });
assert.equal(again.ok, false);
assert.equal(again.code, 'WORK_UNIT_ID_IN_USE');

const leaking = { ...packet, work_unit_id: 'leaking-proof', objective: 'Answer app/x.ts:42 exactly.' };
const refused = validateWorkUnitCreation(leaking);
assert.equal(refused.ok, false);
assert.match(refused.errors.join(' '), /PACKET_ANSWER_LEAKAGE/);

const badActs = validateWorkUnitCreation({ ...packet, work_unit_id: 'bad-acts', authorized_acts: 'repo.read' });
assert.equal(badActs.ok, false);
assert.match(badActs.errors.join(' '), /authorized_acts/);

console.log('4 passed · 0 failed');
fs.rmSync(home, { recursive: true, force: true });
