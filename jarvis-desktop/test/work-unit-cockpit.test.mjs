import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const src = (name) => fs.readFileSync(path.join(ROOT, 'src', name), 'utf8');
const renderer = src('renderer.js');
const preload = src('preload.js');
const main = src('main.js');
const operatorWU = src('operator-work-unit.js');
const controller = src('work-unit-control.js');

test('cockpit makes governed Work Unit and intelligence strategy visible', () => {
  assert.match(renderer, /Governed Work Unit/);
  assert.match(renderer, /Intelligence strategy/);
  assert.match(renderer, /Qwen3 Coder 30B · local coding review/);
  assert.match(renderer, /GPT-OSS 20B · local reasoning review/);
  assert.match(renderer, /Nemotron · external review/);
  assert.match(renderer, /Inkling · external adversarial review/);
  assert.match(renderer, /Run remaining strategy/);
  assert.match(renderer, /Needs Kelly/);
});

test('Home ordinary prose hands off to Work as intent rather than requiring a command phrase', () => {
  assert.match(renderer, /sessionStorage\.setItem\('jarvis:draft-intent'/);
  assert.match(renderer, /setView\('work'\); return/);
});

test('local review is the default and external repository disclosure / Inkling spend remain explicit founder gestures', () => {
  assert.match(renderer, /id="wu-qwen" type="checkbox" checked/);
  assert.match(renderer, /id="wu-gpt-oss" type="checkbox" checked/);
  assert.match(renderer, /id="wu-nemotron" type="checkbox">/);
  assert.match(renderer, /id="wu-inkling" type="checkbox">/);
  assert.match(renderer, /wu-repo-ok/);
  assert.match(renderer, /authorize the selected external provider\(s\) to inspect this isolated repository worktree read-only/i);
  assert.match(renderer, /wu-spend-ok/);
  assert.match(renderer, /authorize provider spend for the Inkling review/i);
  assert.match(operatorWU, /externalRepoOk !== true/);
  assert.match(operatorWU, /providerSpendOk !== true/);
});

test('packet authoring structurally denies write, production, deploy and authority change', () => {
  for (const denied of ['repo.write:worktree', 'production.read', 'production.write', 'deploy', 'authority.change']) {
    assert.ok(operatorWU.includes(`'${denied}'`), `missing denial ${denied}`);
  }
  assert.match(operatorWU, /integration_actor: 'founder'/);
});

test('exactly one new privileged channel carries a bounded action enum', () => {
  assert.match(preload, /workUnitAction: \(req\) => ipcRenderer\.invoke\('jarvis:work-unit-action', req\)/);
  assert.match(main, /ipcMain\.handle\('jarvis:work-unit-action'/);
  for (const action of ['providers', 'create', 'status', 'run-provider']) {
    assert.ok(main.includes(`action === '${action}'`), `missing action ${action}`);
  }
  assert.doesNotMatch(main, /action === 'deploy'/);
  assert.doesNotMatch(main, /action === 'merge'/);
});

test('MAIN, not renderer, binds canonical SHA and Work Unit identity', () => {
  assert.match(main, /execFileSync\('git', \['rev-parse', 'HEAD'\]/);
  assert.match(main, /OPWU\.buildPacket\(req\?\.spec/);
  assert.doesNotMatch(renderer, /canonical_sha\s*:/);
  assert.doesNotMatch(renderer, /branch:\s*`chore\/ain-delegate/);
});

test('provider execution goes through canonical registry, credential readiness, and the registered delegate adapter', () => {
  assert.match(controller, /resolveWorkUnitProvider/);
  assert.match(controller, /skipCredentialCheck: true/);
  assert.match(controller, /credentialAvailability/);
  assert.match(controller, /execution_adapter === 'tinker-direct'/);
  assert.match(controller, /const args = \[delegate, lane, id, providerId\]/);
  assert.match(controller, /recordAttempt\(id\)/);
});

test('strategy fails closed on first provider failure and does not cascade', () => {
  assert.match(renderer, /if \(!result\?\.ok\) return; \/\/ fail closed/);
});

test('structured reconciliation never silently chooses between disagreeing providers', () => {
  assert.match(controller, /REVIEW_DISAGREEMENT/);
  assert.match(controller, /JARVIS will not pick a winner automatically/);
  assert.match(controller, /EVIDENCE_PRESENTED/);
  assert.match(controller, /founder review, not an automated verdict/);
});
