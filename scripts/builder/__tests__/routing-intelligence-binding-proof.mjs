#!/usr/bin/env node
/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / R3 binding witness.
 * Persists one synthetic route-bound Work Unit in a disposable AIN home.
 * No provider process is launched.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { routeIntelligence } from '../routing-intelligence.mjs';
import { createWorkUnit } from '../work-unit-create.mjs';
import {
  loadWorkUnit,
  workUnitStatus,
} from '../work-unit.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');
const OPWU = require(path.join(REPO, 'jarvis-desktop', 'src', 'operator-work-unit.js'));
const WUC = require(path.join(REPO, 'jarvis-desktop', 'src', 'work-unit-control.js'));

let pass = 0;
let fail = 0;
function check(name, fn) {
  try {
    fn();
    pass += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    fail += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      ${error.message}`);
  }
}

const home = mkdtempSync(path.join(os.tmpdir(), 'jarvis-routing-r3-'));
process.env.AIN_DELEGATION_HOME = home;

const spec = {
  objective: 'Synthetic R3 route binding witness',
  acceptanceCriteria: 'Route survives round trip\nNo provider strategy is executable',
  evidenceFocus: 'scripts/builder/routing-intelligence.mjs:1-80',
  providers: [],
  routing: {
    taskShape: 'EVIDENCE_SYNTHESIS',
    reviewPressure: 'high_value_uncertain',
    challengeMode: 'adversarial',
    explicitIndependentReview: true,
  },
};

const routingInput = OPWU.buildRoutingInput(spec);
const route = routeIntelligence(routingInput);
const built = OPWU.buildPacket(spec, {
  canonicalSha: '0123456789abcdef0123456789abcdef01234567',
  nowMs: 123456,
  routeRecord: route,
});

console.log('=== packet boundary ===');

check('R3-1 — route-bound packet builds without provider execution strategy', () => {
  assert.equal(built.ok, true, JSON.stringify(built.errors));
  assert.deepEqual(built.packet.provider_strategy, []);
  assert.equal(built.packet.routing_intelligence.execution_connected, false);
});

check('R3-2 — route requirements do not widen packet authority', () => {
  assert.ok(route.required_authority.acts.includes('network.external'));
  assert.ok(route.required_authority.acts.includes('provider.spend'));
  assert.ok(route.required_authority.disclosures.includes('repository_external_disclosure'));
  assert.deepEqual(route.granted_authority, []);
  assert.deepEqual(built.packet.authorized_acts, ['repo.read']);
  assert.equal(built.packet.disclosure.repository_read_only_external, false);
  assert.equal(built.packet.disclosure.provider_spend_authorized, false);
});

const created = createWorkUnit(built.packet, { home });

check('R3-3 — canonical Work Unit seam persists the packet only', () => {
  assert.equal(created.ok, true, JSON.stringify(created.errors));
  const text = readFileSync(created.path, 'utf8');
  assert.ok(text.includes('routing_intelligence'));
  assert.equal(text.includes('TINKER_API_KEY'), false);
  assert.equal(text.includes('NVIDIA_API_KEY'), false);
});

const raw = loadWorkUnit(built.packet.work_unit_id);
const status = workUnitStatus(built.packet.work_unit_id);

check('R3-4 — exact route record survives persistence round trip', () => {
  assert.deepEqual(raw.routing_intelligence.route_record, route);
  assert.equal(raw.routing_intelligence.execution_connected, false);
  assert.equal(raw.routing_intelligence.bound_at_sha, built.packet.canonical_sha);
});
check('R3-5 — canonical Work Unit status remains review-only with no active execution', () => {
  assert.equal(status.exists, true);
  assert.equal(status.identity.capability, 'routing-intelligence-preview');
  assert.equal(status.intent.task_class, 'routed_review_plan');
  assert.deepEqual(status.authority.authorized_acts, ['repo.read']);
  assert.equal(status.permission_envelope.repo_write_scope, 'none');
  assert.equal(status.permission_envelope.external_network, false);
  assert.equal(status.permission_envelope.provider_spend, false);
  assert.equal(status.active_execution, null);
  assert.equal(status.attempt_count, 0);
});

console.log();
console.log('=== Desktop execution-disconnect structure ===');

const main = readFileSync(path.join(REPO, 'jarvis-desktop', 'src', 'main.js'), 'utf8');
const renderer = readFileSync(path.join(REPO, 'jarvis-desktop', 'src', 'renderer.js'), 'utf8');

check('R3-6 — MAIN computes route record; renderer cannot submit one', () => {
  assert.ok(main.includes('computeRoutingPreview'));
  assert.ok(main.includes('routeIntelligence(routingInput)'));
  assert.ok(main.includes('OPWU.buildRoutingInput'));
  assert.equal(renderer.includes('route_record:'), false);
});

check('R3-7 — run-provider refuses route-bound Work Units before provider controller', () => {
  const guard = main.indexOf("status: 'ROUTING_EXECUTION_DISCONNECTED'");
  const call = main.indexOf('return await WUC.runProvider', guard);
  assert.ok(guard > 0);
  assert.ok(call > guard);
});
check('R3-8 — routed UI has no Run Strategy control after binding', () => {
  assert.ok(renderer.includes('Provider execution disconnected in R3'));
  assert.ok(renderer.includes("if (!routeBound) document.getElementById('wu-run-strategy')"));
});

const lowerGuard = await WUC.runProvider(REPO, {
  work_unit_id: built.packet.work_unit_id,
  provider_id: 'qwen-local',
}, { home, env: { PATH: process.env.PATH } });

check('R3-9 — lower controller refuses route-bound provider execution before provider resolution', () => {
  assert.equal(lowerGuard.ok, false);
  assert.equal(lowerGuard.status, 'ROUTING_EXECUTION_DISCONNECTED');
});

check('R3-10 — MAIN derives deterministic-first truth from the canonical registry before pure routing', () => {
  assert.ok(main.includes("deterministic.mjs"));
  assert.ok(main.includes('deterministic.CAPABILITIES'));
  assert.ok(main.includes('registered: Object.prototype.hasOwnProperty.call'));
  assert.equal(renderer.includes('deterministic.CAPABILITIES'), false);
});

check('R3-11 — MAIN resolves transport readiness only after cognitive route selection', () => {
  const cognitive = main.indexOf('const cognitiveRoute = mod.routeIntelligence(routingInput)');
  const transport = main.indexOf('mod.resolveRouteTransports(cognitiveRoute');
  assert.ok(cognitive > 0);
  assert.ok(transport > cognitive);
});

rmSync(home, { recursive: true, force: true });

console.log();
console.log(`${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
