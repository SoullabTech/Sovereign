/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / R4
 * Pure governed execution-admission law.
 *
 * Inputs are already-materialized route binding + current Work Unit posture.
 * This module performs no filesystem, network, credential, provider, Desktop,
 * Work Unit, merge, deploy, or production action.
 */
import { ROUTE_SOURCE, routeDigest } from './routing-route-integrity.mjs';
export { routeDigest } from './routing-route-integrity.mjs';

export const ADMISSION_VERSION = 'R4.v1';
export const EXPECTED_ROUTE_VERSION = 'R1.v1';
export const EXPECTED_ROUTE_SOURCE = ROUTE_SOURCE;

export const ADMISSION_DISPOSITIONS = Object.freeze([
  'ADMITTED',
  'HELD_FOR_AUTHORITY',
  'MANUAL_ONLY',
  'REFUSED',
]);

const LOCAL_PROVIDERS = new Set(['qwen-local', 'gpt-oss-local']);
const EXTERNAL_BUNDLE_PROVIDERS = new Set(['inkling-tinker', 'nemotron-tinker']);
const MANUAL_ONLY_PROVIDERS = new Set(['nemotron-zen']);
const ADMITTED_PROVIDERS = new Set([
  ...LOCAL_PROVIDERS,
  ...EXTERNAL_BUNDLE_PROVIDERS,
  ...MANUAL_ONLY_PROVIDERS,
]);

const AUTHORITY_NEVER_CREATED = Object.freeze([
  'repo.read',
  'repo.write:worktree',
  'tests.run',
  'network.external',
  'provider.spend',
  'production.read',
  'production.write',
  'deploy',
  'authority.change',
  'merge',
  'constitutional.close',
  'founder.adjudicate',
]);
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function typedBlocker(code, detail, field = null) {
  return Object.freeze({ code, detail, field });
}

function stringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];
}

function authoritySets(workUnit) {
  return {
    allowed: new Set(stringArray(workUnit?.authority?.authorized_acts)),
    denied: new Set(stringArray(workUnit?.authority?.not_authorized_acts)),
  };
}

function hasExplicitDenial(sets, act) {
  return sets.denied.has(act);
}

function hasAuthority(sets, act) {
  return sets.allowed.has(act) && !sets.denied.has(act);
}

function executionAuthority(providerId) {
  return 'provider.execute:' + providerId;
}
function hardStopAttempt(attempt) {
  return attempt?.status === 'failed'
    || attempt?.status === 'refused'
    || attempt?.recommended_next_action === 'reject'
    || attempt?.evidence_sufficient === false
    || attempt?.escalation_required === true;
}

function routeProviderActs(route) {
  const out = [];
  if (route?.primary?.provider_id) {
    out.push({
      provider_id: route.primary.provider_id,
      route_role: route.primary.role || 'primary',
      route_position: 'primary',
      route_execution_disposition: route.primary.execution_disposition ?? null,
    });
  }
  for (const challenger of Array.isArray(route?.challengers) ? route.challengers : []) {
    if (!challenger?.provider_id) continue;
    out.push({
      provider_id: challenger.provider_id,
      route_role: challenger.role || 'challenger',
      route_position: 'challenger',
      route_execution_disposition: challenger.execution_disposition ?? null,
    });
  }
  return out;
}

function routeEvidenceKind(route, providerId) {
  if (route?.evidence_policy?.primary?.provider_id === providerId) {
    return route.evidence_policy.primary.kind ?? null;
  }
  const challenger = Array.isArray(route?.evidence_policy?.challengers)
    ? route.evidence_policy.challengers.find((item) => item?.provider_id === providerId)
    : null;
  return challenger?.kind ?? null;
}

function bindingBlockers(binding, workUnit) {
  const blockers = [];
  const route = binding?.route_record;
  if (!binding || typeof binding !== 'object') {
    return [typedBlocker('ROUTE_BINDING_REQUIRED', 'Persisted route binding is required.')];
  }
  if (!route || typeof route !== 'object') {
    blockers.push(typedBlocker('ROUTE_RECORD_REQUIRED', 'Persisted route record is required.'));
    return blockers;
  }
  if (binding.execution_connected !== false) {
    blockers.push(typedBlocker(
      'EXECUTION_PRECONNECTED',
      'Admission must evaluate a route whose provider execution is still disconnected.',
      'execution_connected',
    ));
  }
  if (binding.source !== EXPECTED_ROUTE_SOURCE) {
    blockers.push(typedBlocker(
      'ROUTE_SOURCE_MISMATCH',
      'Expected route source ' + EXPECTED_ROUTE_SOURCE + '.',
      'source',
    ));
  }
  if (route.route_version !== EXPECTED_ROUTE_VERSION) {
    blockers.push(typedBlocker(
      'ROUTE_VERSION_MISMATCH',
      'Expected route version ' + EXPECTED_ROUTE_VERSION + '.',
      'route_version',
    ));
  }
  if (binding.route_version !== route.route_version) {
    blockers.push(typedBlocker(
      'ROUTE_BINDING_VERSION_MISMATCH',
      'Persisted route binding version does not match the exact route record version.',
      'route_version',
    ));
  }
  if (typeof binding.bound_at_sha !== 'string' || binding.bound_at_sha.length < 7) {
    blockers.push(typedBlocker('ROUTE_SHA_BINDING_REQUIRED', 'Route binding SHA is required.'));
  }
  if (binding.bound_at_sha !== workUnit?.canonical_sha) {
    blockers.push(typedBlocker(
      'ROUTE_SHA_STALE',
      'Persisted route SHA does not match the current Work Unit canonical SHA.',
      'bound_at_sha',
    ));
  }
  if (typeof binding.route_digest !== 'string' || !binding.route_digest.startsWith('sha256:')) {
    blockers.push(typedBlocker(
      'ROUTE_DIGEST_REQUIRED',
      'An immutable persisted route digest is required before admission.',
      'route_digest',
    ));
  } else if (binding.route_digest !== routeDigest(route)) {
    blockers.push(typedBlocker(
      'ROUTE_DIGEST_MISMATCH',
      'Persisted route record does not match its immutable route digest.',
      'route_digest',
    ));
  }
  if (!Array.isArray(route.granted_authority) || route.granted_authority.length !== 0) {
    blockers.push(typedBlocker(
      'ROUTE_AUTHORITY_TAMPER',
      'A route record may never carry granted authority.',
      'granted_authority',
    ));
  }
  if (route.execution_disposition === 'refused') {
    blockers.push(typedBlocker(
      'ROUTE_ALREADY_REFUSED',
      'A refused route cannot be admitted for execution.',
      'execution_disposition',
    ));
  }

  const acts = routeProviderActs(route);
  if (!acts.length) {
    blockers.push(typedBlocker('ROUTE_HAS_NO_PROVIDER_ACTS', 'Route contains no provider acts.'));
  }
  for (const act of acts) {
    if (!ADMITTED_PROVIDERS.has(act.provider_id)) {
      blockers.push(typedBlocker(
        'PROVIDER_NOT_ADMITTED_TO_R4',
        'Provider ' + act.provider_id + ' is not admitted to R4.',
        'provider_id',
      ));
    }
  }

  if (route?.primary?.provider_id && !LOCAL_PROVIDERS.has(route.primary.provider_id)) {
    blockers.push(typedBlocker(
      'INVALID_PRIMARY_PROVIDER',
      'R4 V1 admits only Qwen or GPT-OSS as automatic primary providers.',
      'primary.provider_id',
    ));
  }

  return blockers;
}

function evidenceMembrane(providerId, route, workUnit) {
  const kind = routeEvidenceKind(route, providerId);
  const evidence = workUnit?.evidence || {};
  if (LOCAL_PROVIDERS.has(providerId)) {
    if (kind !== 'local_worktree_read_only') {
      return {
        ok: false,
        blocker: typedBlocker(
          'LOCAL_EVIDENCE_POLICY_MISMATCH',
          'Local providers require the local_worktree_read_only route membrane.',
        ),
      };
    }
    if (evidence.local_worktree_available !== true) {
      return {
        ok: false,
        blocker: typedBlocker(
          'LOCAL_WORKTREE_REQUIRED',
          'The current isolated Work Unit worktree is unavailable.',
        ),
      };
    }
    return {
      ok: true,
      membrane: {
        kind: 'local_worktree_read_only',
        scope: 'isolated_worktree',
        refs: [],
      },
    };
  }

  if (EXTERNAL_BUNDLE_PROVIDERS.has(providerId)) {
    if (kind !== 'exact_external_bundle') {
      return {
        ok: false,
        blocker: typedBlocker(
          'EXTERNAL_EVIDENCE_POLICY_MISMATCH',
          'External Tinker providers require the exact_external_bundle route membrane.',
        ),
      };
    }
    const refs = stringArray(evidence.external_bundle_refs);
    if (!refs.length) {
      return {
        ok: false,
        blocker: typedBlocker(
          'EVIDENCE_BUNDLE_REQUIRED',
          'Repository-grounded external execution requires an exact non-empty evidence bundle.',
        ),
      };
    }
    return {
      ok: true,
      membrane: {
        kind: 'exact_external_bundle',
        scope: 'exact_refs_only',
        refs,
      },
    };
  }

  if (MANUAL_ONLY_PROVIDERS.has(providerId)) {
    if (kind !== 'task_text_only') {
      return {
        ok: false,
        blocker: typedBlocker(
          'MANUAL_EVIDENCE_POLICY_MISMATCH',
          'Nemotron Zen manual posture requires task_text_only evidence.',
        ),
      };
    }
    if (evidence.task_text_available !== true) {
      return {
        ok: false,
        blocker: typedBlocker('TASK_TEXT_REQUIRED', 'Manual Zen reasoning requires task text.'),
      };
    }
    return {
      ok: true,
      membrane: {
        kind: 'task_text_only',
        scope: 'task_text_only',
        refs: [],
      },
    };
  }

  return {
    ok: false,
    blocker: typedBlocker('UNKNOWN_PROVIDER', 'Unknown provider ' + providerId + '.'),
  };
}

function readOnlyExecutionBlocker(workUnit) {
  const sets = authoritySets(workUnit);
  if (hasAuthority(sets, 'repo.write:worktree')) {
    return typedBlocker(
      'READ_ONLY_EXECUTION_MEMBRANE_REQUIRED',
      'R4 V1 provider execution is review-only and cannot admit a Work Unit with worktree write authority.',
      'repo.write:worktree',
    );
  }
  return null;
}

function requiredAuthorityFor(providerId) {
  const acts = ['repo.read', executionAuthority(providerId)];
  const disclosures = [];
  if (EXTERNAL_BUNDLE_PROVIDERS.has(providerId)) {
    acts.push('network.external', 'provider.spend');
    disclosures.push('repository_read_only_external');
  } else if (MANUAL_ONLY_PROVIDERS.has(providerId)) {
    acts.push('network.external');
  }

  return { acts, disclosures };
}

function authorityDisposition(providerId, workUnit, requirements) {
  const sets = authoritySets(workUnit);
  const blockers = [];
  const missing = [];

  for (const act of requirements.acts) {
    if (hasExplicitDenial(sets, act)) {
      blockers.push(typedBlocker(
        'AUTHORITY_EXPLICITLY_DENIED',
        'Required authority ' + act + ' is explicitly denied.',
        act,
      ));
    } else if (!hasAuthority(sets, act)) {
      missing.push(act);
    }
  }

  for (const disclosure of requirements.disclosures) {
    if (disclosure === 'repository_read_only_external') {
      if (workUnit?.disclosure?.repository_read_only_external !== true) {
        missing.push(disclosure);
      }
    }
  }

  if (blockers.length) return { disposition: 'REFUSED', blockers, missing };
  if (missing.length) return { disposition: 'HELD_FOR_AUTHORITY', blockers: [], missing };
  return { disposition: 'ADMITTED', blockers: [], missing: [] };
}

function refusedAdmission(binding, blockers) {
  const route = binding?.route_record;
  const acts = routeProviderActs(route).map((act) => deepFreeze({
    ...act,
    disposition: 'REFUSED',
    required_authority: requiredAuthorityFor(act.provider_id),
    missing_authority: [],
    evidence_membrane: null,
    blockers,
  }));
  return deepFreeze({
    admission_version: ADMISSION_VERSION,
    route_version: route?.route_version ?? null,
    route_digest: binding?.route_digest ?? null,
    bound_at_sha: binding?.bound_at_sha ?? null,
    status: 'REFUSED',
    provider_acts: acts,
    blockers,
    granted_authority: [],
    authority_created: false,
    forbidden_authority_created: [],
  });
}

export function evaluateExecutionAdmission(input) {
  const binding = input?.binding;
  const workUnit = input?.work_unit || {};
  const bindingProblems = bindingBlockers(binding, workUnit);
  if (bindingProblems.length) return refusedAdmission(binding, bindingProblems);

  const route = binding.route_record;
  const history = Array.isArray(workUnit.attempts) ? workUnit.attempts : [];
  const priorStop = history.find(hardStopAttempt);
  const providerActs = [];

  for (const act of routeProviderActs(route)) {
    const blockers = [];

    const readOnlyProblem = readOnlyExecutionBlocker(workUnit);
    if (readOnlyProblem) blockers.push(readOnlyProblem);

    if (priorStop) {
      blockers.push(typedBlocker(
        'PRIOR_ATTEMPT_STOP',
        'A failed, refused, rejected, insufficient, or escalated attempt stops successor admission.',
      ));
    }

    const membrane = evidenceMembrane(act.provider_id, route, workUnit);
    if (!membrane.ok) blockers.push(membrane.blocker);

    const requirements = requiredAuthorityFor(act.provider_id);
    const authority = authorityDisposition(act.provider_id, workUnit, requirements);
    if (authority.blockers.length) blockers.push(...authority.blockers);

    let disposition;
    if (blockers.length) {
      disposition = 'REFUSED';
    } else if (MANUAL_ONLY_PROVIDERS.has(act.provider_id)) {
      disposition = 'MANUAL_ONLY';
    } else if (authority.disposition === 'HELD_FOR_AUTHORITY') {
      disposition = 'HELD_FOR_AUTHORITY';
    } else {
      disposition = 'ADMITTED';
    }

    providerActs.push(deepFreeze({
      ...act,
      disposition,
      required_authority: requirements,
      missing_authority: authority.missing,
      evidence_membrane: membrane.ok ? membrane.membrane : null,
      blockers,
    }));
  }

  return deepFreeze({
    admission_version: ADMISSION_VERSION,
    route_version: route.route_version,
    route_digest: binding.route_digest,
    bound_at_sha: binding.bound_at_sha,
    status: 'EVALUATED',
    provider_acts: providerActs,
    blockers: [],
    granted_authority: [],
    authority_created: false,
    forbidden_authority_created: [],
  });
}

export const R4_NEVER_CREATES_AUTHORITY = AUTHORITY_NEVER_CREATED;
