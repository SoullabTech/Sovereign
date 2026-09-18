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
const canonicalAdapter = fs.readFileSync(
  path.join(ROOT, '..', 'scripts', 'builder', 'desktop-canonical-work-unit-v1.mjs'),
  'utf8',
);

test('cockpit makes canonical Routing Intelligence creation distinct from provider execution', () => {
  assert.match(renderer, /Governed Work Unit/);
  assert.match(renderer, /Routing Intelligence/);
  assert.match(renderer, /Task shape/);
  assert.match(renderer, /Review pressure/);
  assert.match(renderer, /Challenge mode/);
  assert.match(renderer, /W1 defines the canonical Work Unit/);
  assert.match(renderer, /W3 computes and persists the exact route/);
  assert.match(renderer, /R5B Authorize Once \+ Confirm Execute/);
  assert.doesNotMatch(renderer, /id="wu-manual-mode"/);
  assert.doesNotMatch(renderer, /Manual provider strategy/);
});

test('Home ordinary prose hands off to Work as intent rather than requiring a command phrase', () => {
  assert.match(renderer, /sessionStorage\.setItem\('jarvis:draft-intent'/);
  assert.match(renderer, /setView\('work'\); return/);
});

test('D1 new Desktop Work Units are canonical-only and do not widen external authority', () => {
  assert.match(renderer, /Create & authorize canonical Work Unit/);
  assert.match(renderer, /required bounded repository paths/);
  assert.match(renderer, /D1 does not widen network, repository-disclosure, or provider-spend authority/);
  assert.doesNotMatch(renderer, /id="wu-manual-mode"/);
  assert.doesNotMatch(renderer, /id="wu-manual-provider-wrap"/);
  assert.match(operatorWU, /buildCanonicalInput/);
  assert.match(operatorWU, /network_external: false/);
  assert.match(operatorWU, /provider_spend: false/);
  assert.match(operatorWU, /external_disclosure: 'none'/);
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
  for (const action of [
    'providers',
    'preview-route',
    'create',
    'status',
    'route-plan',
    'execution-auth-preview',
    'authorize-execution-once',
    'confirm-execute',
    'revoke-execution-grant',
    'record-verifier',
    'human-adjudication',
    'close-work-unit',
    'run-provider',
  ]) {
    assert.ok(main.includes(`action === '${action}'`), `missing action ${action}`);
  }
  assert.doesNotMatch(main, /action === 'deploy'/);
  assert.doesNotMatch(main, /action === 'merge'/);
  assert.match(main, /WUC\.planWorkUnitRouting/);
  assert.match(controller, /async function planWorkUnitRouting/);
  assert.match(controller, /derivePermissionEnvelope\(workUnit\)/);
  assert.match(controller, /deriveWorkUnitEvidenceClass\(workUnit\)/);
});

test('MAIN creates canonical W1 input and W3, not renderer, binds the exact route', () => {
  assert.match(main, /execFileSync\('git', \['rev-parse', 'HEAD'\]/);
  assert.match(main, /OPWU\.buildCanonicalInput\(spec/);
  assert.match(main, /WUC\.createCanonical\(root, built\.input/);
  assert.match(canonicalAdapter, /createWorkUnitDraftV1\(input\)/);
  assert.match(canonicalAdapter, /transitionLifecycleV1/);
  assert.match(canonicalAdapter, /bindAuthorizedRouteV1\(envelope\)/);
  assert.match(canonicalAdapter, /projectCompatibilityPacketV1/);
  assert.doesNotMatch(renderer, /canonical_sha\s*:/);
  assert.doesNotMatch(renderer, /route_record\s*:/);
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

test('R3 route-bound Work Units persist preview evidence while provider execution remains disconnected', () => {
  assert.match(operatorWU, /provider_strategy: routed \? \[\] : checked\.providers/);
  assert.match(operatorWU, /execution_connected: false/);
  assert.match(controller, /routing_intelligence: raw\?\.routing_intelligence \?\? null/);
  assert.match(main, /ROUTING_EXECUTION_DISCONNECTED/);
  assert.match(main, /route-bound Work Units are preview\/persistence only/i);
  assert.match(renderer, /Provider execution disconnected in R3/);
  assert.match(renderer, /if \(!routeBound\) document\.getElementById\('wu-run-strategy'/);
});

test('Routing Intelligence preview ignores stale asynchronous responses', () => {
  assert.match(renderer, /let routePreviewGeneration = 0/);
  assert.match(renderer, /const generation = \+\+routePreviewGeneration/);
  assert.match(renderer, /generation !== routePreviewGeneration/);
});

test('R5A digest is persisted by canonical W3, never supplied by renderer', () => {
  assert.match(canonicalAdapter, /bindAuthorizedRouteV1\(envelope\)/);
  assert.match(canonicalAdapter, /route_digest: workUnit\.routing\.route_digest/);
  assert.match(canonicalAdapter, /route_version: workUnit\.routing\.route_version/);
  assert.match(canonicalAdapter, /bound_at_sha: workUnit\.routing\.bound_at_sha/);
  assert.doesNotMatch(renderer, /route_digest\s*:/);
});

test('R5A binding preserves execution disconnection and does not add provider authority', () => {
  assert.match(operatorWU, /execution_connected: false/);
  assert.doesNotMatch(operatorWU, /authorized_acts:.*provider\.execute/s);
  assert.match(main, /ROUTING_EXECUTION_DISCONNECTED/);
});


test('R5B preserves routing != authorization != execution with two human gestures', () => {
  assert.match(renderer, /Authorize this execution once/);
  assert.match(renderer, /Confirm Execute/);
  assert.match(renderer, /Authorize is not Execute/);
  assert.match(renderer, /action: 'execution-auth-preview'/);
  assert.match(renderer, /action: 'authorize-execution-once'/);
  assert.match(renderer, /action: 'confirm-execute'/);
  assert.match(renderer, /action: 'revoke-execution-grant'/);
  assert.match(main, /WUC\.executionAuthorizationPreview/);
  assert.match(main, /WUC\.authorizeExecutionOnce/);
  assert.match(main, /WUC\.confirmAuthorizedExecution/);
  assert.match(controller, /evaluateHumanExecutionGrant/);
  assert.match(controller, /Claim before provider execution/);
});

test('R5B Confirm Execute lets renderer submit only Work Unit + grant identity, never raw authority/model/route', () => {
  assert.match(
    renderer,
    /action: 'confirm-execute',\s*work_unit_id: activeWorkUnitId,\s*grant_id: grantId/s,
  );
  assert.doesNotMatch(renderer, /action: 'confirm-execute'[\s\S]{0,180}provider_id:/);
  assert.doesNotMatch(renderer, /action: 'confirm-execute'[\s\S]{0,180}model:/);
  assert.doesNotMatch(renderer, /action: 'confirm-execute'[\s\S]{0,180}permission_envelope:/);
  assert.doesNotMatch(renderer, /action: 'confirm-execute'[\s\S]{0,180}route_record:/);
});

test('R5B routed packet keeps execution-specific authority absent, not silently granted by routing', () => {
  assert.match(operatorWU, /\.\.\.\(routed \|\| externalReview \? \[\] : \['network\.external'/);
  assert.match(operatorWU, /\.\.\.\(routed \|\| providerSpend \? \[\] : \['provider\.spend'\]\)/);
  assert.doesNotMatch(operatorWU, /authorized_acts:.*provider\.execute/s);
  assert.match(operatorWU, /execution_connected: false/);
});

test('R5B uses the existing preload channel; no new privileged IPC channel is added', () => {
  assert.match(preload, /workUnitAction: \(req\) => ipcRenderer\.invoke\('jarvis:work-unit-action', req\)/);
  assert.doesNotMatch(preload, /r5b/i);
  assert.doesNotMatch(preload, /confirm-execute/);
  assert.doesNotMatch(preload, /authorize-execution-once/);
});


test('D1 exposes canonical W4 verification and explicit human adjudication without a new IPC channel', () => {
  assert.match(renderer, /Canonical Work Unit truth · W1–W5/);
  assert.match(renderer, /W4 provider evidence/);
  assert.match(renderer, /W4 verifier evidence/);
  assert.match(renderer, /Record verifier evidence/);
  assert.match(renderer, /Human adjudication required/);
  assert.match(renderer, /Accept evidence/);
  assert.match(renderer, /Return/);
  assert.match(renderer, /Stop/);
  assert.match(renderer, /Supersede/);
  assert.match(renderer, /action: 'record-verifier'/);
  assert.match(renderer, /action: 'human-adjudication'/);
  assert.match(renderer, /action: 'close-work-unit'/);
  assert.match(main, /WUC\.recordCanonicalVerifier/);
  assert.match(main, /WUC\.humanAdjudicate/);
  assert.match(main, /WUC\.closeCanonical/);
});

test('D1 compatibility packet/result/session surfaces are explicitly adapter-only', () => {
  assert.match(canonicalAdapter, /canonical_truth: 'W1-W5'/);
  assert.match(canonicalAdapter, /authority: 'adapter-only'/);
  assert.match(canonicalAdapter, /Compatibility execution packet only; canonical truth lives in W1-W5/);
  assert.match(controller, /readCanonicalWorkUnitV1/);
  assert.match(controller, /projectDesktopCanonicalStatusV1/);
  assert.match(controller, /canonical: false/);
});

test('D1 does not create a second privileged renderer bridge', () => {
  assert.match(preload, /workUnitAction: \(req\) => ipcRenderer\.invoke\('jarvis:work-unit-action', req\)/);
  assert.doesNotMatch(preload, /record-verifier/);
  assert.doesNotMatch(preload, /human-adjudication/);
  assert.doesNotMatch(preload, /close-work-unit/);
});
