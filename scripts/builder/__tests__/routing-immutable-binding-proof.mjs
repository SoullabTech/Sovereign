#!/usr/bin/env node
/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / R5A
 * Immutable route-binding falsification witness.
 *
 * No provider process is launched.
 */
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { routeIntelligence } from '../routing-intelligence.mjs';
import { evaluateExecutionAdmission } from '../routing-execution-admission.mjs';
import { routeDigest } from '../routing-route-integrity.mjs';
import { createWorkUnitDraftV1 } from '../work-unit-v1.mjs';
import {
  createLifecycleEnvelopeV1,
  transitionLifecycleV1,
} from '../work-unit-lifecycle-v1.mjs';
import { bindAuthorizedRouteV1 } from '../work-unit-routing-v1.mjs';
import {
  createWorkUnit,
} from '../work-unit-create.mjs';
import {
  loadWorkUnit,
} from '../work-unit.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');
const OPWU = require(path.join(REPO, 'jarvis-desktop', 'src', 'operator-work-unit.js'));

const SHA = '0123456789abcdef0123456789abcdef01234567';

let pass = 0;
let fail = 0;
function check(name, fn) {
  try {
    fn();
    pass += 1;
    console.log('PASS  ' + name);
  } catch (error) {
    fail += 1;
    console.log('FAIL  ' + name);
    console.log('      ' + error.message);
  }
}

function canonicalWorkUnitInput() {
  return {
    identity: {
      id: 'synthetic-r5a-canonical-work-unit',
      programme: 'JARVIS-ROUTING-INTELLIGENCE-01-R5A',
      parent_work_unit: null,
      objective: 'Prove immutable route binding in canonical Work Unit V1.',
      work_class: 'VERIFICATION',
      task_shape: 'deep_reasoning',
    },
    context: {
      context_refs: ['synthetic:r5a'],
      evidence_refs: [
        'local-worktree:' + SHA,
        'synthetic:r5a-evidence',
      ],
      assumptions: [],
      unknowns: [],
    },
    scope: {
      repository: 'synthetic/R5A',
      base_ref: SHA,
      allowed_paths: ['scripts/builder/routing-intelligence.mjs'],
      forbidden_paths: ['production'],
    },
    authority: {
      repository_read: true,
      repository_write: 'none',
      shell: 'read_only',
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
      acceptance_conditions: ['Immutable route binding is exact.'],
      falsification_conditions: ['Route binding can be rewritten or widened.'],
      stop_conditions: ['Any provider execution or authority widening occurs.'],
    },
    provenance: {
      creator: 'R5A-SYNTHETIC-WITNESS',
      authorizing_act: null,
      source_commits: [SHA],
    },
    state: {
      supersedes: null,
    },
  };
}

function canonicalAuthorizedEnvelope() {
  const draft = createWorkUnitDraftV1(canonicalWorkUnitInput());
  assert.equal(draft.ok, true, JSON.stringify(draft.blockers));

  const lifecycle = createLifecycleEnvelopeV1(draft.work_unit);
  assert.equal(lifecycle.ok, true, JSON.stringify(lifecycle.blockers));

  const bounded = transitionLifecycleV1(lifecycle.envelope, {
    to: 'BOUNDED',
    evidence_ref: 'synthetic:r5a-bounds',
    reason_code: 'R5A_BOUNDED',
  });
  assert.equal(bounded.ok, true, JSON.stringify(bounded.blockers));

  const authorized = transitionLifecycleV1(bounded.envelope, {
    to: 'AUTHORIZED',
    evidence_ref: 'synthetic:r5a-authority',
    reason_code: 'R5A_AUTHORIZED',
    authorization_ref: 'founder:r5a-synthetic-authority',
  });
  assert.equal(authorized.ok, true, JSON.stringify(authorized.blockers));
  return authorized.envelope;
}

const home = mkdtempSync(path.join(os.tmpdir(), 'jarvis-r5a-'));
process.env.AIN_DELEGATION_HOME = home;

const spec = {
  objective: 'Synthetic R5A immutable binding witness',
  acceptanceCriteria: 'Binding round-trips exactly\nRebinding is refused',
  evidenceFocus: 'scripts/builder/routing-intelligence.mjs:1-80',
  providers: [],
  routing: {
    taskShape: 'deep_reasoning',
    reviewPressure: 'high_value_uncertain',
    challengeMode: 'none',
    explicitIndependentReview: true,
  },
};

const routingInput = OPWU.buildRoutingInput(spec);
const route = routeIntelligence(routingInput);
const digest = routeDigest(route);
const built = OPWU.buildPacket(spec, {
  canonicalSha: SHA,
  nowMs: 456789,
  routeRecord: route,
  routeDigest: digest,
});

console.log('=== immutable binding creation ===');

check('R5A-1 — routed packet requires and persists exact R4 digest', () => {
  assert.equal(built.ok, true, JSON.stringify(built.errors));
  assert.equal(built.packet.routing_intelligence.route_digest, digest);
  assert.equal(built.packet.routing_intelligence.route_version, route.route_version);
  assert.equal(built.packet.routing_intelligence.source, 'R2-pure-router');
  assert.equal(built.packet.routing_intelligence.bound_at_sha, SHA);
  assert.equal(built.packet.routing_intelligence.execution_connected, false);
});

check('R5A-2 — digest is deterministic over exact canonical route record', () => {
  assert.equal(routeDigest(structuredClone(route)), digest);
  assert.match(digest, /^sha256:[0-9a-f]{64}$/);
});
check('R5A-3 — binding adds no execution or external authority', () => {
  assert.deepEqual(built.packet.authorized_acts, ['repo.read']);
  assert.equal(
    built.packet.authorized_acts.some((act) => act.startsWith('provider.execute:')),
    false,
  );
  assert.equal(built.packet.authorized_acts.includes('network.external'), false);
  assert.equal(built.packet.authorized_acts.includes('provider.spend'), false);
  assert.equal(built.packet.disclosure.repository_read_only_external, false);
  assert.equal(built.packet.disclosure.provider_spend_authorized, false);
  assert.deepEqual(built.packet.provider_strategy, []);
});

const created = createWorkUnit(built.packet, { home });

check('R5A-4 — canonical creation seam persists packet once', () => {
  assert.equal(created.ok, true, JSON.stringify(created.errors));
  const bytes = readFileSync(created.path, 'utf8');
  assert.ok(bytes.includes(digest));
  assert.ok(bytes.includes('"execution_connected": false'));
});

const raw = loadWorkUnit(built.packet.work_unit_id);

check('R5A-5 — exact binding survives persistence round trip byte-truthfully', () => {
  assert.deepEqual(raw.routing_intelligence.route_record, route);
  assert.equal(raw.routing_intelligence.route_digest, digest);
  assert.equal(raw.routing_intelligence.route_version, route.route_version);
  assert.equal(raw.routing_intelligence.source, 'R2-pure-router');
  assert.equal(raw.routing_intelligence.bound_at_sha, SHA);
  assert.equal(raw.routing_intelligence.execution_connected, false);
});

console.log();
console.log('=== immutability / rebinding ===');

const originalBytes = readFileSync(created.path, 'utf8');
const mutatedRoute = structuredClone(route);
mutatedRoute.primary.provider_id = 'qwen-local';
const reboundPacket = structuredClone(built.packet);
reboundPacket.routing_intelligence.route_record = mutatedRoute;
reboundPacket.routing_intelligence.route_digest = routeDigest(mutatedRoute);
const rebound = createWorkUnit(reboundPacket, { home });

check('R5A-6 — attempted rebinding through canonical create seam is refused', () => {
  assert.equal(rebound.ok, false);
  assert.equal(rebound.code, 'WORK_UNIT_ID_IN_USE');
});

check('R5A-7 — refused rebinding leaves original packet bytes unchanged', () => {
  const after = readFileSync(created.path, 'utf8');
  assert.equal(after, originalBytes);
});

console.log();
console.log('=== R4 tamper/staleness falsification ===');

function admissionInput(bindingPatch = {}, workUnitPatch = {}) {
  return {
    binding: {
      ...raw.routing_intelligence,
      ...bindingPatch,
    },
    work_unit: {
      canonical_sha: SHA,
      authority: {
        authorized_acts: ['repo.read'],
        not_authorized_acts: [
          'repo.write:worktree',
          'production.read',
          'production.write',
          'deploy',
          'authority.change',
        ],
      },
      disclosure: {
        repository_read_only_external: false,
      },
      evidence: {
        local_worktree_available: true,
        external_bundle_refs: ['scripts/builder/routing-intelligence.mjs'],
        task_text_available: true,
      },
      attempts: [],
      ...workUnitPatch,
    },
  };
}

check('R5A-8 — untampered persisted binding clears integrity checks but remains held for provider authority', () => {
  const admission = evaluateExecutionAdmission(admissionInput());
  assert.equal(admission.status, 'EVALUATED');
  assert.equal(admission.provider_acts[0].disposition, 'HELD_FOR_AUTHORITY');
  assert.ok(
    admission.provider_acts[0].missing_authority.includes('provider.execute:gpt-oss-local'),
  );
  assert.deepEqual(admission.granted_authority, []);
});
check('R5A-9 — route mutation without digest update is refused', () => {
  const tampered = structuredClone(raw.routing_intelligence);
  tampered.route_record.primary.provider_id = 'qwen-local';
  const admission = evaluateExecutionAdmission(admissionInput(tampered));
  assert.equal(admission.status, 'REFUSED');
  assert.ok(admission.blockers.some((b) => b.code === 'ROUTE_DIGEST_MISMATCH'));
});

check('R5A-10 — stale canonical SHA is refused', () => {
  const admission = evaluateExecutionAdmission(admissionInput({}, {
    canonical_sha: 'abcdef0123456789abcdef0123456789abcdef01',
  }));
  assert.equal(admission.status, 'REFUSED');
  assert.ok(admission.blockers.some((b) => b.code === 'ROUTE_SHA_STALE'));
});

check('R5A-11 — source mismatch is refused', () => {
  const admission = evaluateExecutionAdmission(
    admissionInput({ source: 'other-router' }),
  );
  assert.equal(admission.status, 'REFUSED');
  assert.ok(admission.blockers.some((b) => b.code === 'ROUTE_SOURCE_MISMATCH'));
});

check('R5A-12 — binding route-version mismatch is refused', () => {
  const admission = evaluateExecutionAdmission(
    admissionInput({ route_version: 'R0.tampered' }),
  );
  assert.equal(admission.status, 'REFUSED');
  assert.ok(
    admission.blockers.some((b) => b.code === 'ROUTE_BINDING_VERSION_MISMATCH'),
  );
});

check('R5A-13 — route-record version mutation is refused even with recomputed digest', () => {
  const changedRoute = structuredClone(raw.routing_intelligence.route_record);
  changedRoute.route_version = 'R0.tampered';
  const admission = evaluateExecutionAdmission(admissionInput({
    route_record: changedRoute,
    route_digest: routeDigest(changedRoute),
    route_version: changedRoute.route_version,
  }));
  assert.equal(admission.status, 'REFUSED');
  assert.ok(admission.blockers.some((b) => b.code === 'ROUTE_VERSION_MISMATCH'));
});
check('R5A-14 — buildPacket refuses a routed packet without MAIN-computed digest', () => {
  const missing = OPWU.buildPacket(spec, {
    canonicalSha: SHA,
    nowMs: 456790,
    routeRecord: route,
  });
  assert.equal(missing.ok, false);
  assert.match(missing.errors.join(' '), /immutable SHA-256 route digest/i);
});

check('R5A-15 — binding still cannot become an execution connector', () => {
  assert.equal(raw.routing_intelligence.execution_connected, false);
  assert.deepEqual(raw.provider_strategy, []);
  assert.equal(
    raw.authorized_acts.some((act) => String(act).startsWith('provider.execute:')),
    false,
  );
});

console.log();
console.log('=== canonical Work Unit V1 route binding ===');

const canonicalRouted = bindAuthorizedRouteV1(canonicalAuthorizedEnvelope());

check('R5A-16 — canonical W3 persists exact digest/version/source/SHA binding', () => {
  assert.equal(canonicalRouted.ok, true, JSON.stringify(canonicalRouted.blockers));
  const routing = canonicalRouted.envelope.work_unit.routing;
  assert.equal(routing.route_digest, routeDigest(canonicalRouted.route));
  assert.equal(routing.route_version, canonicalRouted.route.route_version);
  assert.equal(routing.router_version, canonicalRouted.route.route_version);
  assert.equal(routing.route_source, 'R2-pure-router');
  assert.equal(routing.bound_at_sha, SHA);
  assert.equal(routing.execution_connected, false);
});

check('R5A-17 — canonical W3 refuses pre-bound integrity material instead of rebinding', () => {
  const tampered = structuredClone(canonicalAuthorizedEnvelope());
  tampered.work_unit.routing.route_digest = 'sha256:' + '0'.repeat(64);
  const result = bindAuthorizedRouteV1(tampered);
  assert.equal(result.ok, false);
  assert.ok(result.blockers.some((b) => b.code === 'ROUTING_DOMAIN_NOT_EMPTY'));
});

check('R5A-18 — canonical W3 refuses an execution-connected route before binding', () => {
  const tampered = structuredClone(canonicalAuthorizedEnvelope());
  tampered.work_unit.routing.execution_connected = true;
  const result = bindAuthorizedRouteV1(tampered);
  assert.equal(result.ok, false);
  assert.ok(
    result.blockers.some((b) => b.code === 'ROUTING_EXECUTION_CONNECTION_INVALID'),
  );
});

check('R5A-19 — Desktop compatibility and canonical W3 use the same digest law', () => {
  const route = canonicalRouted.route;
  const compatSpec = {
    objective: 'Synthetic canonical/Desktop digest parity',
    evidenceFocus: 'scripts/builder/routing-intelligence.mjs',
    providers: [],
    routing: {
      taskShape: 'deep_reasoning',
      reviewPressure: 'ordinary',
      challengeMode: 'none',
    },
  };
  const compatibility = OPWU.buildPacket(compatSpec, {
    canonicalSha: SHA,
    nowMs: 456791,
    routeRecord: route,
    routeDigest: routeDigest(route),
  });
  assert.equal(compatibility.ok, true, JSON.stringify(compatibility.errors));
  assert.equal(
    compatibility.packet.routing_intelligence.route_digest,
    canonicalRouted.envelope.work_unit.routing.route_digest,
  );
});

check('R5A-20 — canonical W3 binding clears R4 integrity and still holds for provider authority', () => {
  const canonicalWorkUnit = canonicalRouted.envelope.work_unit;
  const routing = canonicalWorkUnit.routing;
  const admission = evaluateExecutionAdmission({
    binding: {
      route_record: routing.route_record,
      route_digest: routing.route_digest,
      route_version: routing.route_version,
      source: routing.route_source,
      bound_at_sha: routing.bound_at_sha,
      execution_connected: routing.execution_connected,
    },
    work_unit: {
      canonical_sha: canonicalWorkUnit.scope.base_ref,
      authority: {
        authorized_acts: ['repo.read'],
        not_authorized_acts: [
          'repo.write:worktree',
          'production.read',
          'production.write',
          'deploy',
          'authority.change',
        ],
      },
      disclosure: { repository_read_only_external: false },
      evidence: {
        local_worktree_available: true,
        external_bundle_refs: [],
        task_text_available: false,
      },
      attempts: [],
    },
  });
  assert.equal(admission.status, 'EVALUATED');
  const primary = admission.provider_acts.find(
    (act) => act.provider_id === 'gpt-oss-local',
  );
  assert.equal(primary.disposition, 'HELD_FOR_AUTHORITY');
  assert.ok(
    primary.missing_authority.includes('provider.execute:gpt-oss-local'),
  );
  assert.deepEqual(admission.granted_authority, []);
});

rmSync(home, { recursive: true, force: true });

console.log();
console.log(String(pass) + ' passed · ' + String(fail) + ' failed');
process.exit(fail === 0 ? 0 : 1);
