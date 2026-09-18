import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { createWorkUnitDraftV1 } from '../work-unit-v1.mjs';
import {
  createLifecycleEnvelopeV1,
  transitionLifecycleV1,
} from '../work-unit-lifecycle-v1.mjs';
import {
  ROUTING_BINDING_VERSION,
  bindAuthorizedRouteV1,
  deriveRoutingInputV1,
  routeAuthoritySubsetV1,
} from '../work-unit-routing-v1.mjs';

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      ${error.message}`);
  }
}

const BASE = 'c8dbf997eb95da5da10f0c547cb2a464c09dc2c5';
const ROUTER_SHA256 = '2837520e2f4e27aed067a84a2f8148a8b1be2436f71a57aa21a4c06d72316b4f';

function merge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return override;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value)
      && base?.[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      result[key] = merge(base[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function makeInput(overrides = {}) {
  const base = {
    identity: {
      id: 'synthetic-w3-work-unit',
      programme: 'JARVIS-WORK-UNIT-01',
      parent_work_unit: null,
      objective: 'Prove pure authorized Work Unit routing binding.',
      work_class: 'ARCHITECTURE',
      task_shape: 'deep_reasoning',
    },
    context: {
      context_refs: ['W0', 'W1', 'W2'],
      evidence_refs: [
        `local-worktree:${BASE}`,
      ],
      assumptions: [],
      unknowns: [],
    },
    scope: {
      repository: 'SoullabTech/Sovereign',
      base_ref: BASE,
      allowed_paths: [
        'scripts/builder/work-unit-routing-v1.mjs',
        'scripts/builder/__tests__/work-unit-routing-v1-proof.mjs',
      ],
      forbidden_paths: ['app/api'],
    },
    authority: {
      repository_read: true,
      repository_write: 'worktree',
      shell: 'bounded_write',
      network_external: false,
      provider_spend: false,
      external_disclosure: 'none',
      merge: false,
      deploy: false,
      production_read: false,
      production_write: false,
    },
    routing: {
      requested_posture: 'default',
    },
    evaluation: {
      acceptance_conditions: ['Pure routing binds deterministically without widening authority.'],
      falsification_conditions: ['A route widens Work Unit authority or bypasses W2.'],
      stop_conditions: ['Any provider, credential, network, execution, merge, deploy, or production act appears.'],
    },
    provenance: {
      creator: 'JARVIS',
      authorizing_act: null,
      source_commits: [BASE],
    },
    state: {
      supersedes: null,
    },
  };

  return merge(base, overrides);
}

function draft(overrides = {}) {
  const result = createWorkUnitDraftV1(makeInput(overrides));
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.work_unit;
}

function lifecycleDraft(overrides = {}) {
  const result = createLifecycleEnvelopeV1(draft(overrides));
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.envelope;
}

function bounded(overrides = {}) {
  const result = transitionLifecycleV1(lifecycleDraft(overrides), {
    to: 'BOUNDED',
    evidence_ref: 'evidence:w3-bounds',
    reason_code: 'W3_BOUNDS',
  });
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.envelope;
}

function authorized(overrides = {}) {
  const result = transitionLifecycleV1(bounded(overrides), {
    to: 'AUTHORIZED',
    evidence_ref: 'evidence:w3-founder-authority',
    reason_code: 'W3_AUTHORIZED',
    authorization_ref: 'founder:w3-pure-routing-binding',
  });
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.envelope;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function codes(result) {
  return result.blockers.map((item) => item.code);
}

console.log('=== structural purity and provenance ===');

check('W3-PURE — binder imports only ratified router + W2 lifecycle', () => {
  const source = readFileSync(new URL('../work-unit-routing-v1.mjs', import.meta.url), 'utf8');
  const importStarts = source.split('\n').filter((line) => line.trimStart().startsWith('import '));
  assert.equal(importStarts.length, 2);
  assert.match(source, /from '\.\/routing-intelligence\.mjs';/);
  assert.match(source, /from '\.\/work-unit-lifecycle-v1\.mjs';/);

  for (const forbidden of [
    'fetch(',
    'process.env',
    'Keychain',
    'TINKER_API_KEY',
    'NVIDIA_API_KEY',
    'opencode run',
    'ain-delegate',
    'child_process',
    'execFile',
    'spawn(',
  ]) {
    assert.equal(source.includes(forbidden), false, `forbidden surface present: ${forbidden}`);
  }
});

check('W3-PROVENANCE — router source is byte-identical to ratified R2 router', () => {
  const source = readFileSync(new URL('../routing-intelligence.mjs', import.meta.url));
  const hash = createHash('sha256').update(source).digest('hex');
  assert.equal(hash, ROUTER_SHA256);
});

check('W3-DETERMINISM — binder performs two pure routeIntelligence calls before binding', () => {
  const source = readFileSync(new URL('../work-unit-routing-v1.mjs', import.meta.url), 'utf8');
  const matches = source.match(/routeIntelligence\(input\)/g) ?? [];
  assert.equal(matches.length, 2);
  assert.match(source, /JSON\.stringify\(first\) !== JSON\.stringify\(second\)/);
});

check('W3-W2-SEAM — ROUTED state is reached only through transitionLifecycleV1', () => {
  const source = readFileSync(new URL('../work-unit-routing-v1.mjs', import.meta.url), 'utf8');
  assert.match(source, /transitionLifecycleV1\(bound, \{/);
  assert.doesNotMatch(source, /state\.lifecycle_state\s*=/);
});

console.log();
console.log('=== W3-F1 through W3-F7 — canonical derivation and local routing ===');

check('W3-F1 — routing input is derived from canonical fields and narrows write authority to none', () => {
  const workUnit = draft();
  const result = deriveRoutingInputV1(workUnit);
  assert.equal(result.ok, true);
  assert.deepEqual(result.blockers, []);
  assert.equal(result.input.task_shape, 'deep_reasoning');
  assert.equal(result.input.review_pressure, 'ordinary');
  assert.equal(result.input.challenge_mode, 'none');
  assert.equal(result.input.frontier_posture, 'none');
  assert.equal(result.input.authority.repo_read, true);
  assert.equal(result.input.authority.repo_write_scope, 'none');
  assert.equal(result.input.authority.network_external, false);
  assert.equal(result.input.evidence.local_worktree_available, true);
});

check('W3-F2 — Work Unit write authority is preserved but never inherited by the route', () => {
  const envelope = authorized();
  assert.equal(envelope.work_unit.authority.repository_write, 'worktree');

  const result = bindAuthorizedRouteV1(envelope);
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.derived_input.authority.repo_write_scope, 'none');
  assert.equal(result.envelope.work_unit.authority.repository_write, 'worktree');
  assert.equal(result.authority_proof.subset, true);
});

check('W3-F3 — default deep reasoning binds GPT-OSS primary + Qwen local challenger', () => {
  const result = bindAuthorizedRouteV1(authorized());
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.envelope.work_unit.state.lifecycle_state, 'ROUTED');
  assert.equal(result.route.primary.provider_id, 'gpt-oss-local');
  assert.equal(result.route.challengers[0].provider_id, 'qwen-local');
  assert.equal(result.route.review_policy.local, 'independent_local_second');
  assert.equal(result.transition.reason_code, 'W3_PURE_ROUTE_BOUND');
});

check('W3-F4 — default mechanical remains Qwen single-mechanical local route', () => {
  const result = bindAuthorizedRouteV1(authorized({
    identity: { task_shape: 'mechanical_code' },
  }));
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.route.primary.provider_id, 'qwen-local');
  assert.equal(result.route.review_policy.local, 'single_mechanical');
  assert.deepEqual(result.route.challengers, []);
});

check('W3-F5 — explicit independent review upgrades mechanical routing without externalizing', () => {
  const result = bindAuthorizedRouteV1(authorized({
    identity: { task_shape: 'mechanical_code' },
    routing: { requested_posture: 'independent_review' },
  }));
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.route.primary.provider_id, 'qwen-local');
  assert.equal(result.route.challengers[0].provider_id, 'gpt-oss-local');
  assert.equal(result.route.review_policy.local, 'independent_local_second');
  assert.equal(result.route.review_policy.external, 'none');
});

check('W3-F6 — W3 does not invent high-value review pressure absent a canonical field', () => {
  for (const posture of [
    'default',
    'local_only',
    'independent_review',
    'adversarial_challenge',
    'frontier_text',
    'frontier_repository',
  ]) {
    const disclosure = ['adversarial_challenge', 'frontier_repository'].includes(posture)
      ? 'exact_bundle'
      : posture === 'frontier_text'
        ? 'task_text_only'
        : 'none';

    const result = deriveRoutingInputV1(draft({
      routing: { requested_posture: posture },
      authority: {
        network_external: posture.startsWith('frontier_') || posture === 'adversarial_challenge',
        provider_spend: ['adversarial_challenge', 'frontier_repository'].includes(posture),
        external_disclosure: disclosure,
      },
    }));

    assert.equal(result.ok, true, posture);
    assert.equal(result.input.review_pressure, 'ordinary', posture);
  }
});

check('W3-F7 — absent local-worktree evidence blocks binding instead of guessing', () => {
  const result = bindAuthorizedRouteV1(authorized({
    context: { evidence_refs: [] },
  }));
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('ROUTER_BLOCKED'));
  assert.ok(codes(result).includes('ROUTER_LOCAL_WORKTREE_REQUIRED'));
});

console.log();
console.log('=== W3-F8 through W3-F14 — external postures and authority subset ===');

check('W3-F8 — adversarial challenge without exact-bundle disclosure authority fails before routing', () => {
  const result = bindAuthorizedRouteV1(authorized({
    routing: { requested_posture: 'adversarial_challenge' },
  }));
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('EXACT_BUNDLE_DISCLOSURE_AUTHORITY_REQUIRED'));
});

check('W3-F9 — adversarial challenge missing provider-spend authority fails closed', () => {
  const result = bindAuthorizedRouteV1(authorized({
    routing: { requested_posture: 'adversarial_challenge' },
    authority: {
      network_external: true,
      provider_spend: false,
      external_disclosure: 'exact_bundle',
    },
    context: {
      evidence_refs: [
        `local-worktree:${BASE}`,
        'external-bundle:bundle-adversarial-1',
      ],
    },
  }));
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('ROUTER_PROVIDER_SPEND_AUTHORITY_REQUIRED'));
});

check('W3-F10 — fully authorized adversarial challenge binds Inkling exact-bundle challenger', () => {
  const result = bindAuthorizedRouteV1(authorized({
    routing: { requested_posture: 'adversarial_challenge' },
    authority: {
      network_external: true,
      provider_spend: true,
      external_disclosure: 'exact_bundle',
    },
    context: {
      evidence_refs: [
        `local-worktree:${BASE}`,
        'external-bundle:bundle-adversarial-1',
      ],
    },
  }));

  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.authority_proof.subset, true);
  assert.ok(result.route.challengers.some(
    (challenger) => challenger.provider_id === 'inkling-tinker',
  ));
});

check('W3-F11 — frontier repository without exact bundle evidence fails closed', () => {
  const result = bindAuthorizedRouteV1(authorized({
    routing: { requested_posture: 'frontier_repository' },
    authority: {
      network_external: true,
      provider_spend: true,
      external_disclosure: 'exact_bundle',
    },
  }));
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('ROUTER_EVIDENCE_BUNDLE_REQUIRED'));
});

check('W3-F12 — fully authorized frontier repository binds Nemotron-Tinker challenger', () => {
  const result = bindAuthorizedRouteV1(authorized({
    routing: { requested_posture: 'frontier_repository' },
    authority: {
      network_external: true,
      provider_spend: true,
      external_disclosure: 'exact_bundle',
    },
    context: {
      evidence_refs: [
        `local-worktree:${BASE}`,
        'external-bundle:bundle-frontier-1',
      ],
    },
  }));

  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.ok(result.route.challengers.some(
    (challenger) => challenger.provider_id === 'nemotron-tinker',
  ));
  assert.equal(result.authority_proof.subset, true);
});

check('W3-F13 — frontier text requires disclosure authority + approved task-text evidence', () => {
  const noDisclosure = bindAuthorizedRouteV1(authorized({
    routing: { requested_posture: 'frontier_text' },
    authority: { network_external: true },
  }));
  assert.equal(noDisclosure.ok, false);
  assert.ok(codes(noDisclosure).includes('TASK_TEXT_DISCLOSURE_AUTHORITY_REQUIRED'));

  const noTaskText = bindAuthorizedRouteV1(authorized({
    routing: { requested_posture: 'frontier_text' },
    authority: {
      network_external: true,
      external_disclosure: 'task_text_only',
    },
  }));
  assert.equal(noTaskText.ok, false);
  assert.ok(codes(noTaskText).includes('ROUTER_TASK_TEXT_REQUIRED'));
});

check('W3-F14 — authorized frontier text binds manual-only Zen route but executes nothing', () => {
  const result = bindAuthorizedRouteV1(authorized({
    routing: { requested_posture: 'frontier_text' },
    authority: {
      network_external: true,
      external_disclosure: 'task_text_only',
    },
    context: {
      evidence_refs: [
        `local-worktree:${BASE}`,
        'approved-task-text:founder-approved-task-1',
      ],
    },
  }));

  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.route.execution_disposition, 'manual_only');
  assert.ok(result.route.challengers.some(
    (challenger) => challenger.provider_id === 'nemotron-zen',
  ));
  assert.equal(result.envelope.work_unit.state.lifecycle_state, 'ROUTED');
});

console.log();
console.log('=== W3-F15 through W3-F21 — lifecycle guard and no-widening law ===');

check('W3-F15 — route authority proof rejects unknown or granted authority', () => {
  const workUnit = draft();

  const unknown = routeAuthoritySubsetV1(workUnit, {
    granted_authority: [],
    required_authority: {
      acts: ['root.everything'],
      disclosures: [],
    },
  });
  assert.equal(unknown.subset, false);
  assert.ok(unknown.missing.includes('unknown-route-act:root.everything'));

  const granted = routeAuthoritySubsetV1(workUnit, {
    granted_authority: ['deploy'],
    required_authority: { acts: [], disclosures: [] },
  });
  assert.equal(granted.subset, false);
  assert.ok(granted.missing.includes('route.granted_authority must be empty'));
});

check('W3-F16 — only AUTHORIZED Work Units may be bound', () => {
  const result = bindAuthorizedRouteV1(bounded());
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZED_WORK_UNIT_REQUIRED'));
});

check('W3-F17 — post-authorization core mutation blocks routing before state transition', () => {
  const broken = clone(authorized());
  broken.work_unit.authority.deploy = true;

  const result = bindAuthorizedRouteV1(broken);
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZED_CORE_MUTATED'));
});

check('W3-F18 — pre-existing route material blocks rebinding', () => {
  const broken = clone(authorized());
  broken.work_unit.routing.router_version = 'forged';
  broken.work_unit.routing.route_record = {};

  const result = bindAuthorizedRouteV1(broken);
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('ROUTING_DOMAIN_NOT_EMPTY'));
});

check('W3-F19 — W3 populates only routing domain + W2 lifecycle state', () => {
  const before = authorized();
  const executionBefore = JSON.stringify(before.work_unit.execution);
  const verifierBefore = JSON.stringify(before.work_unit.evaluation.verifier_results);
  const authorityBefore = JSON.stringify(before.work_unit.authority);
  const contextBefore = JSON.stringify(before.work_unit.context);

  const result = bindAuthorizedRouteV1(before);
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(JSON.stringify(result.envelope.work_unit.execution), executionBefore);
  assert.equal(
    JSON.stringify(result.envelope.work_unit.evaluation.verifier_results),
    verifierBefore,
  );
  assert.equal(JSON.stringify(result.envelope.work_unit.authority), authorityBefore);
  assert.equal(JSON.stringify(result.envelope.work_unit.context), contextBefore);
});

check('W3-F20 — router granted authority remains empty in the persisted route record', () => {
  const result = bindAuthorizedRouteV1(authorized());
  assert.equal(result.ok, true);
  assert.deepEqual(result.envelope.work_unit.routing.route_record.granted_authority, []);
  assert.equal(result.authority_proof.subset, true);
});

check('W3-F21 — identical AUTHORIZED Work Units produce byte-equivalent W3 results', () => {
  const a = bindAuthorizedRouteV1(authorized());
  const b = bindAuthorizedRouteV1(authorized());
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

console.log();
console.log('=== supplementary canonical-evidence controls ===');

check('external bundle refs are derived only from canonical evidence_refs prefixes', () => {
  const result = deriveRoutingInputV1(draft({
    context: {
      evidence_refs: [
        `local-worktree:${BASE}`,
        'external-bundle:bundle-a',
        'external-bundle:bundle-b',
        'not-an-external-bundle:bundle-c',
      ],
    },
  }));
  assert.equal(result.ok, true);
  assert.deepEqual(result.input.evidence.external_bundle_refs, ['bundle-a', 'bundle-b']);
});

check('ambient unknown Work Unit fields do not alter derived routing input', () => {
  const cleanEnvelope = authorized();
  const noisyEnvelope = clone(cleanEnvelope);
  noisyEnvelope.work_unit.secret_provider_override = 'external';
  noisyEnvelope.work_unit.root = true;
  noisyEnvelope.work_unit.credentials = { tinker: 'present' };

  const clean = deriveRoutingInputV1(cleanEnvelope.work_unit);
  const noisy = deriveRoutingInputV1(noisyEnvelope.work_unit);

  assert.equal(clean.ok, true);
  assert.equal(noisy.ok, true);
  assert.equal(JSON.stringify(clean.input), JSON.stringify(noisy.input));
});

check('W3 result is deeply immutable', () => {
  const result = bindAuthorizedRouteV1(authorized());
  assert.equal(result.ok, true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.envelope), true);
  assert.equal(Object.isFrozen(result.envelope.work_unit.routing), true);
  assert.equal(Object.isFrozen(result.authority_proof), true);
});

console.log();
console.log(`${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
