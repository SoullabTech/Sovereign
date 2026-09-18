#!/usr/bin/env node
/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / R4
 * Governed Execution Admission falsification suite.
 *
 * No provider is called by this proof.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routeIntelligence } from '../routing-intelligence.mjs';
import {
  ADMISSION_VERSION,
  evaluateExecutionAdmission,
  routeDigest,
} from '../routing-execution-admission.mjs';

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

function routeInput(patch = {}) {
  return {
    task_shape: 'mechanical_code',
    review_pressure: 'ordinary',
    challenge_mode: 'none',
    frontier_posture: 'none',
    evidence: {
      local_worktree_available: true,
      external_bundle_refs: ['scripts/builder/routing-intelligence.mjs'],
      task_text_available: true,
      ...(patch.evidence || {}),
    },
    authority: {
      repo_read: true,
      repo_write_scope: 'none',
      network_external: false,
      provider_spend: false,
      repository_external_disclosure: false,
      ...(patch.authority || {}),
    },
    work_unit: {
      risk_class: 'mechanical',
      explicit_independent_review: false,
      ...(patch.work_unit || {}),
    },
    ...Object.fromEntries(
      Object.entries(patch).filter(
        ([key]) => !['evidence', 'authority', 'work_unit'].includes(key),
      ),
    ),
  };
}

function makeRoute(patch = {}) {
  return routeIntelligence(routeInput(patch));
}

function binding(route, patch = {}) {
  return {
    route_record: route,
    route_digest: routeDigest(route),
    execution_connected: false,
    source: 'R2-pure-router',
    bound_at_sha: SHA,
    ...patch,
  };
}

function workUnit(patch = {}) {
  return {
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
      ...(patch.authority || {}),
    },
    disclosure: {
      repository_read_only_external: false,
      ...(patch.disclosure || {}),
    },
    evidence: {
      local_worktree_available: true,
      external_bundle_refs: ['scripts/builder/routing-intelligence.mjs'],
      task_text_available: true,
      ...(patch.evidence || {}),
    },
    attempts: patch.attempts || [],
    ...Object.fromEntries(
      Object.entries(patch).filter(
        ([key]) => !['authority', 'disclosure', 'evidence', 'attempts'].includes(key),
      ),
    ),
  };
}

function decision(route, wu = workUnit(), bindingPatch = {}) {
  return evaluateExecutionAdmission({
    binding: binding(route, bindingPatch),
    work_unit: wu,
  });
}

function actFor(result, providerId) {
  return result.provider_acts.find((act) => act.provider_id === providerId);
}

console.log('=== structural purity and integrity binding ===');

check('R4-PURE — admission imports only deterministic node:crypto and no execution/I/O seams', () => {
  const source = readFileSync(
    new URL('../routing-execution-admission.mjs', import.meta.url),
    'utf8',
  );
  const imports = source.split('\n').filter((line) => line.trimStart().startsWith('import '));
  assert.equal(imports.length, 1);
  assert.match(imports[0], /node:crypto/);
  assert.doesNotMatch(source, /node:(fs|net|http|https|child_process)/);
  assert.equal(source.includes('fetch('), false);
  assert.equal(source.includes('process.env'), false);
  assert.equal(source.includes('runProvider'), false);
  assert.equal(source.includes('find-generic-password'), false);
});
check('F-A1 — canonical R3 binding without immutable digest fails closed', () => {
  const route = makeRoute();
  const r = evaluateExecutionAdmission({
    binding: {
      route_record: route,
      execution_connected: false,
      source: 'R2-pure-router',
      bound_at_sha: SHA,
    },
    work_unit: workUnit(),
  });
  assert.equal(r.status, 'REFUSED');
  assert.ok(r.blockers.some((b) => b.code === 'ROUTE_DIGEST_REQUIRED'));
  assert.deepEqual(r.granted_authority, []);
});

check('F-A2 — tampered route record fails its immutable digest', () => {
  const route = makeRoute();
  const b = binding(route);
  const tampered = structuredClone(route);
  tampered.primary.provider_id = 'gpt-oss-local';
  const r = evaluateExecutionAdmission({
    binding: { ...b, route_record: tampered },
    work_unit: workUnit(),
  });
  assert.equal(r.status, 'REFUSED');
  assert.ok(r.blockers.some((x) => x.code === 'ROUTE_DIGEST_MISMATCH'));
});

check('F-A3 — stale SHA binding fails closed', () => {
  const route = makeRoute();
  const r = decision(route, workUnit({ canonical_sha: 'abcdef0123456789abcdef0123456789abcdef01' }));
  assert.equal(r.status, 'REFUSED');
  assert.ok(r.blockers.some((x) => x.code === 'ROUTE_SHA_STALE'));
});

check('F-A4 — wrong route version fails closed even with a matching digest', () => {
  const route = structuredClone(makeRoute());
  route.route_version = 'R0.stale';
  const r = evaluateExecutionAdmission({
    binding: binding(route),
    work_unit: workUnit(),
  });
  assert.equal(r.status, 'REFUSED');
  assert.ok(r.blockers.some((x) => x.code === 'ROUTE_VERSION_MISMATCH'));
});
check('F-A5 — preconnected execution fails admission ordering', () => {
  const route = makeRoute();
  const r = decision(route, workUnit(), { execution_connected: true });
  assert.equal(r.status, 'REFUSED');
  assert.ok(r.blockers.some((x) => x.code === 'EXECUTION_PRECONNECTED'));
});

check('F-A6 — route may never carry granted authority', () => {
  const route = structuredClone(makeRoute());
  route.granted_authority = ['provider.execute:qwen-local'];
  const r = evaluateExecutionAdmission({
    binding: binding(route),
    work_unit: workUnit(),
  });
  assert.equal(r.status, 'REFUSED');
  assert.ok(r.blockers.some((x) => x.code === 'ROUTE_AUTHORITY_TAMPER'));
});

console.log();
console.log('=== local execution admission ===');

check('F-A7 — Qwen route selection alone does not authorize Qwen execution', () => {
  const route = makeRoute();
  const r = decision(route);
  const qwen = actFor(r, 'qwen-local');
  assert.equal(r.admission_version, ADMISSION_VERSION);
  assert.equal(qwen.disposition, 'HELD_FOR_AUTHORITY');
  assert.ok(qwen.missing_authority.includes('provider.execute:qwen-local'));
  assert.deepEqual(r.granted_authority, []);
});

check('F-A8 — Qwen admits only with exact provider execution authority already held', () => {
  const route = makeRoute();
  const wu = workUnit({
    authority: {
      authorized_acts: ['repo.read', 'provider.execute:qwen-local'],
      not_authorized_acts: ['repo.write:worktree', 'deploy', 'authority.change'],
    },
  });
  const qwen = actFor(decision(route, wu), 'qwen-local');
  assert.equal(qwen.disposition, 'ADMITTED');
  assert.equal(qwen.evidence_membrane.kind, 'local_worktree_read_only');
  assert.deepEqual(qwen.evidence_membrane.refs, []);
});
check('F-A9 — independent local pair is admitted per provider, never by route inheritance', () => {
  const route = makeRoute({
    task_shape: 'deep_reasoning',
    review_pressure: 'high_value_uncertain',
  });
  const wu = workUnit({
    authority: {
      authorized_acts: ['repo.read', 'provider.execute:gpt-oss-local'],
      not_authorized_acts: ['repo.write:worktree', 'deploy', 'authority.change'],
    },
  });
  const r = decision(route, wu);
  assert.equal(actFor(r, 'gpt-oss-local').disposition, 'ADMITTED');
  assert.equal(actFor(r, 'qwen-local').disposition, 'HELD_FOR_AUTHORITY');
  assert.ok(
    actFor(r, 'qwen-local').missing_authority.includes('provider.execute:qwen-local'),
  );
});

check('F-A10 — explicit denial is REFUSED, not converted into a hold', () => {
  const route = makeRoute();
  const wu = workUnit({
    authority: {
      authorized_acts: ['repo.read'],
      not_authorized_acts: [
        'provider.execute:qwen-local',
        'repo.write:worktree',
        'deploy',
      ],
    },
  });
  const qwen = actFor(decision(route, wu), 'qwen-local');
  assert.equal(qwen.disposition, 'REFUSED');
  assert.ok(qwen.blockers.some((x) => x.code === 'AUTHORITY_EXPLICITLY_DENIED'));
});

check('F-A11 — local evidence membrane cannot admit without the isolated worktree', () => {
  const route = makeRoute();
  const wu = workUnit({
    authority: {
      authorized_acts: ['repo.read', 'provider.execute:qwen-local'],
      not_authorized_acts: ['repo.write:worktree'],
    },
    evidence: { local_worktree_available: false },
  });
  const qwen = actFor(decision(route, wu), 'qwen-local');
  assert.equal(qwen.disposition, 'REFUSED');
  assert.ok(qwen.blockers.some((x) => x.code === 'LOCAL_WORKTREE_REQUIRED'));
});
console.log();
console.log('=== external and manual execution admission ===');

check('F-A12 — Inkling route does not authorize network, disclosure, spend, or execution', () => {
  const route = makeRoute({ challenge_mode: 'adversarial' });
  const r = decision(route);
  const inkling = actFor(r, 'inkling-tinker');
  assert.equal(inkling.disposition, 'HELD_FOR_AUTHORITY');
  for (const required of [
    'provider.execute:inkling-tinker',
    'network.external',
    'provider.spend',
    'repository_read_only_external',
  ]) {
    assert.ok(inkling.missing_authority.includes(required), required);
  }
  assert.deepEqual(r.granted_authority, []);
});

check('F-A13 — fully authorized Inkling still receives only exact current bundle refs', () => {
  const route = makeRoute({ challenge_mode: 'adversarial' });
  const refs = ['a.ts', 'b.ts'];
  const wu = workUnit({
    authority: {
      authorized_acts: [
        'repo.read',
        'provider.execute:qwen-local',
        'provider.execute:inkling-tinker',
        'network.external',
        'provider.spend',
      ],
      not_authorized_acts: ['repo.write:worktree', 'deploy', 'authority.change'],
    },
    disclosure: { repository_read_only_external: true },
    evidence: { external_bundle_refs: refs },
  });
  const inkling = actFor(decision(route, wu), 'inkling-tinker');
  assert.equal(inkling.disposition, 'ADMITTED');
  assert.equal(inkling.evidence_membrane.kind, 'exact_external_bundle');
  assert.deepEqual(inkling.evidence_membrane.refs, refs);
  assert.equal(inkling.evidence_membrane.scope, 'exact_refs_only');
});
check('F-A14 — external admission refuses an empty evidence bundle even with all authority', () => {
  const route = makeRoute({ challenge_mode: 'adversarial' });
  const wu = workUnit({
    authority: {
      authorized_acts: [
        'repo.read',
        'provider.execute:qwen-local',
        'provider.execute:inkling-tinker',
        'network.external',
        'provider.spend',
      ],
      not_authorized_acts: ['repo.write:worktree'],
    },
    disclosure: { repository_read_only_external: true },
    evidence: { external_bundle_refs: [] },
  });
  const inkling = actFor(decision(route, wu), 'inkling-tinker');
  assert.equal(inkling.disposition, 'REFUSED');
  assert.ok(inkling.blockers.some((x) => x.code === 'EVIDENCE_BUNDLE_REQUIRED'));
});

check('F-A15 — Tinker Nemotron obeys the same exact-bundle and authority membrane', () => {
  const route = makeRoute({
    challenge_mode: 'frontier',
    frontier_posture: 'repository_grounded',
  });
  const wu = workUnit({
    authority: {
      authorized_acts: [
        'repo.read',
        'provider.execute:qwen-local',
        'provider.execute:nemotron-tinker',
        'network.external',
        'provider.spend',
      ],
      not_authorized_acts: ['repo.write:worktree'],
    },
    disclosure: { repository_read_only_external: true },
  });
  const nemotron = actFor(decision(route, wu), 'nemotron-tinker');
  assert.equal(nemotron.disposition, 'ADMITTED');
  assert.equal(nemotron.evidence_membrane.kind, 'exact_external_bundle');
});

check('F-A16 — Zen remains MANUAL_ONLY even when its manual authority is already held', () => {
  const route = makeRoute({
    challenge_mode: 'frontier',
    frontier_posture: 'text_only_manual',
  });
  const wu = workUnit({
    authority: {
      authorized_acts: [
        'repo.read',
        'provider.execute:qwen-local',
        'provider.execute:nemotron-zen',
        'network.external',
      ],
      not_authorized_acts: ['repo.write:worktree'],
    },
    evidence: { task_text_available: true },
  });
  const zen = actFor(decision(route, wu), 'nemotron-zen');
  assert.equal(zen.disposition, 'MANUAL_ONLY');
  assert.equal(zen.evidence_membrane.kind, 'task_text_only');
});

check('F-A17 — a structurally unsupported provider is refused even with a fresh digest', () => {
  const route = structuredClone(makeRoute());
  route.challengers.push({
    provider_id: 'nemotron-nvidia',
    role: 'frontier_challenger',
    execution_disposition: 'admitted_local',
  });
  route.evidence_policy.challengers.push({
    provider_id: 'nemotron-nvidia',
    kind: 'exact_external_bundle',
  });
  const r = evaluateExecutionAdmission({
    binding: binding(route),
    work_unit: workUnit(),
  });
  assert.equal(r.status, 'REFUSED');
  assert.ok(r.blockers.some((x) => x.code === 'PROVIDER_NOT_ADMITTED_TO_R4'));
});

console.log();
console.log('=== stopping law and authority non-creation ===');

check('F-A18 — prior provider failure cannot manufacture successor admission', () => {
  const route = makeRoute({
    task_shape: 'deep_reasoning',
    review_pressure: 'high_value_uncertain',
  });
  const wu = workUnit({
    authority: {
      authorized_acts: [
        'repo.read',
        'provider.execute:gpt-oss-local',
        'provider.execute:qwen-local',
      ],
      not_authorized_acts: ['repo.write:worktree'],
    },
    attempts: [{ status: 'failed', provider_id: 'gpt-oss-local' }],
  });
  const r = decision(route, wu);
  for (const act of r.provider_acts) {
    assert.equal(act.disposition, 'REFUSED');
    assert.ok(act.blockers.some((x) => x.code === 'PRIOR_ATTEMPT_STOP'));
  }
  assert.deepEqual(r.granted_authority, []);
});

check('F-A19 — model recommendation cannot become merge/deploy/production/founder authority', () => {
  const route = makeRoute();
  const wu = workUnit({
    authority: {
      authorized_acts: ['repo.read', 'provider.execute:qwen-local'],
      not_authorized_acts: [
        'repo.write:worktree',
        'production.read',
        'production.write',
        'deploy',
        'authority.change',
      ],
    },
    attempts: [{
      status: 'completed',
      provider_id: 'qwen-local',
      recommended_next_action: 'merge and deploy',
      claimed_authority: ['deploy', 'merge', 'founder.adjudicate'],
    }],
  });
  const r = decision(route, wu);
  assert.equal(actFor(r, 'qwen-local').disposition, 'ADMITTED');
  assert.deepEqual(r.granted_authority, []);
  assert.equal(r.authority_created, false);
  assert.deepEqual(r.forbidden_authority_created, []);
});

check('F-A20 — admission output is immutable and deterministic for identical input', () => {
  const route = makeRoute();
  const input = {
    binding: binding(route),
    work_unit: workUnit({
      authority: {
        authorized_acts: ['repo.read', 'provider.execute:qwen-local'],
        not_authorized_acts: ['repo.write:worktree'],
      },
    }),
  };
  const a = evaluateExecutionAdmission(input);
  const b = evaluateExecutionAdmission(structuredClone(input));
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(Object.isFrozen(a), true);
  assert.equal(Object.isFrozen(a.provider_acts[0]), true);
});
check('F-A21 — route source mismatch fails closed', () => {
  const route = makeRoute();
  const r = decision(route, workUnit(), { source: 'untrusted-router' });
  assert.equal(r.status, 'REFUSED');
  assert.ok(r.blockers.some((x) => x.code === 'ROUTE_SOURCE_MISMATCH'));
});

check('F-A22 — a freshly re-digested route still cannot widen external evidence policy', () => {
  const route = structuredClone(makeRoute({ challenge_mode: 'adversarial' }));
  const externalEvidence = route.evidence_policy.challengers.find(
    (entry) => entry.provider_id === 'inkling-tinker',
  );
  externalEvidence.kind = 'whole_repository';
  const wu = workUnit({
    authority: {
      authorized_acts: [
        'repo.read',
        'provider.execute:qwen-local',
        'provider.execute:inkling-tinker',
        'network.external',
        'provider.spend',
      ],
      not_authorized_acts: ['repo.write:worktree'],
    },
    disclosure: { repository_read_only_external: true },
  });
  const inkling = actFor(
    evaluateExecutionAdmission({ binding: binding(route), work_unit: wu }),
    'inkling-tinker',
  );
  assert.equal(inkling.disposition, 'REFUSED');
  assert.ok(
    inkling.blockers.some((x) => x.code === 'EXTERNAL_EVIDENCE_POLICY_MISMATCH'),
  );
});

check('F-A23 — R4 V1 refuses any current worktree write authority', () => {
  const route = makeRoute();
  const wu = workUnit({
    authority: {
      authorized_acts: [
        'repo.read',
        'repo.write:worktree',
        'provider.execute:qwen-local',
      ],
      not_authorized_acts: [],
    },
  });
  const qwen = actFor(decision(route, wu), 'qwen-local');
  assert.equal(qwen.disposition, 'REFUSED');
  assert.ok(
    qwen.blockers.some((x) => x.code === 'READ_ONLY_EXECUTION_MEMBRANE_REQUIRED'),
  );
});

console.log();
console.log(String(pass) + ' passed · ' + String(fail) + ' failed');
process.exit(fail === 0 ? 0 : 1);
