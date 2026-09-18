/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / R5B
 * Pure Human Provider Execution Authorization law.
 *
 * This module creates and validates one-shot human execution grants. It performs
 * no filesystem, network, credential, provider, shell, Work Unit mutation,
 * merge, deploy, production, or model action.
 *
 * R5B law:
 *   route recommendation != human authorization != execution
 *
 * A grant may satisfy only the exact execution-specific authority already
 * required by R4 for one route-bound provider act. It never mutates the
 * authorized Work Unit core and never becomes route authority.
 */
import { createHash } from 'node:crypto';
import { evaluateExecutionAdmission } from './routing-execution-admission.mjs';

export const HUMAN_EXECUTION_GRANT_VERSION = 'R5B.v1';

const STATIC_GRANTABLE_ACTS = new Set([
  'network.external',
  'provider.spend',
]);
const GRANTABLE_DISCLOSURES = new Set([
  'repository_read_only_external',
]);
const FORBIDDEN_GRANT_ACTS = Object.freeze([
  'repo.read',
  'repo.write:worktree',
  'tests.run',
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

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
  );
}

function digest(value) {
  return 'sha256:' + createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function blocker(code, detail, field = null) {
  return Object.freeze({ code, detail, field });
}

function stringArray(value) {
  return Array.isArray(value)
    ? value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean)
    : [];
}

function workUnitId(workUnit) {
  return String(workUnit?.work_unit_id || workUnit?.identity?.id || '').trim();
}

function canonicalSha(workUnit) {
  return String(workUnit?.canonical_sha || workUnit?.scope?.base_ref || '').trim();
}

function objectiveText(workUnit) {
  return String(workUnit?.objective || workUnit?.identity?.objective || '').trim();
}

function rawAuthority(workUnit) {
  if (Array.isArray(workUnit?.authorized_acts) || Array.isArray(workUnit?.not_authorized_acts)) {
    return {
      authorized_acts: stringArray(workUnit.authorized_acts),
      not_authorized_acts: stringArray(workUnit.not_authorized_acts),
    };
  }
  return {
    authorized_acts: stringArray(workUnit?.authority?.authorized_acts),
    not_authorized_acts: stringArray(workUnit?.authority?.not_authorized_acts),
  };
}

function externalRefs(workUnit) {
  const direct = stringArray(workUnit?.evidence?.external_bundle_refs);
  if (direct.length) return direct;
  return stringArray(workUnit?.allowed_files).filter(
    (entry) => !/^NO FILES\b/i.test(entry),
  );
}

export function projectAdmissionWorkUnitV1({
  work_unit,
  attempts = [],
  local_worktree_available = false,
} = {}) {
  const auth = rawAuthority(work_unit);
  return deepFreeze({
    canonical_sha: canonicalSha(work_unit),
    authority: {
      authorized_acts: auth.authorized_acts,
      not_authorized_acts: auth.not_authorized_acts,
    },
    disclosure: {
      repository_read_only_external:
        work_unit?.disclosure?.repository_read_only_external === true,
    },
    evidence: {
      local_worktree_available: local_worktree_available === true,
      external_bundle_refs: externalRefs(work_unit),
      task_text_available: objectiveText(work_unit).length > 0,
    },
    attempts: clone(attempts) || [],
  });
}

export function workUnitExecutionFingerprint(workUnit) {
  return digest({
    work_unit_id: workUnitId(workUnit),
    title: workUnit?.title ?? workUnit?.identity?.title ?? null,
    objective: objectiveText(workUnit),
    canonical_sha: canonicalSha(workUnit),
    branch: workUnit?.branch ?? workUnit?.scope?.branch ?? null,
    allowed_files: stringArray(workUnit?.allowed_files),
    authorized_acts: rawAuthority(workUnit).authorized_acts,
    not_authorized_acts: rawAuthority(workUnit).not_authorized_acts,
    disclosure: workUnit?.disclosure ?? null,
    routing: workUnit?.routing ?? null,
    routing_binding: workUnit?.routing_intelligence ? {
      route_digest: workUnit.routing_intelligence.route_digest ?? null,
      route_version: workUnit.routing_intelligence.route_version ?? null,
      source: workUnit.routing_intelligence.source ?? null,
      bound_at_sha: workUnit.routing_intelligence.bound_at_sha ?? null,
      execution_connected: workUnit.routing_intelligence.execution_connected ?? null,
    } : null,
  });
}

export function evidenceMembraneDigest(membrane) {
  return digest(membrane ?? null);
}

function providerExecutionAct(providerId) {
  return 'provider.execute:' + providerId;
}

function grantScopeFor(act, providerId) {
  const acts = [];
  const disclosures = [];
  const blocks = [];
  const providerAct = providerExecutionAct(providerId);

  for (const missing of stringArray(act?.missing_authority)) {
    if (missing === providerAct || STATIC_GRANTABLE_ACTS.has(missing)) {
      acts.push(missing);
    } else if (GRANTABLE_DISCLOSURES.has(missing)) {
      disclosures.push(missing);
    } else if (missing === 'repo.read') {
      blocks.push(blocker(
        'BASE_REPOSITORY_READ_REQUIRED',
        'R5B cannot create repository-read authority; the Work Unit must already hold repo.read.',
        missing,
      ));
    } else {
      blocks.push(blocker(
        'UNGRANTABLE_EXECUTION_AUTHORITY',
        'R5B cannot grant required authority ' + missing + '.',
        missing,
      ));
    }
  }

  if (!acts.includes(providerAct)) {
    blocks.push(blocker(
      'PROVIDER_EXECUTION_AUTHORITY_MUST_BE_HUMAN',
      'R5B requires the exact provider.execute authority to be absent before the human act.',
      providerAct,
    ));
  }

  return {
    acts: [...new Set(acts)],
    disclosures: [...new Set(disclosures)],
    blockers: blocks,
  };
}

export function prepareHumanExecutionAuthorization({
  work_unit,
  binding = work_unit?.routing_intelligence ?? null,
  attempts = [],
  provider_id,
  model_ref,
  local_worktree_available = false,
} = {}) {
  const id = workUnitId(work_unit);
  const providerId = String(provider_id || '').trim();
  const modelRef = String(model_ref || '').trim();
  const blocks = [];

  if (!id) blocks.push(blocker('WORK_UNIT_ID_REQUIRED', 'Exact Work Unit identity is required.'));
  if (!providerId) blocks.push(blocker('PROVIDER_ID_REQUIRED', 'Exact provider identity is required.'));
  if (!modelRef) blocks.push(blocker('MODEL_REF_REQUIRED', 'Exact provider/model identity is required.'));
  if (!binding || typeof binding !== 'object') {
    blocks.push(blocker('ROUTE_BINDING_REQUIRED', 'An immutable R5A route binding is required.'));
  }
  if (blocks.length) {
    return deepFreeze({ ok: false, status: 'REFUSED', blockers: blocks });
  }

  const projected = projectAdmissionWorkUnitV1({
    work_unit,
    attempts,
    local_worktree_available,
  });
  const admission = evaluateExecutionAdmission({
    binding,
    work_unit: projected,
  });
  const act = (admission.provider_acts || []).find((entry) => entry.provider_id === providerId);
  if (!act) {
    blocks.push(blocker(
      'PROVIDER_NOT_IN_BOUND_ROUTE',
      'Provider ' + providerId + ' is not an act in the immutable bound route.',
      'provider_id',
    ));
  } else if (act.disposition === 'MANUAL_ONLY') {
    blocks.push(blocker(
      'MANUAL_ONLY_PROVIDER',
      'The bound provider is manual-only and cannot receive an automated R5B execution grant.',
      'provider_id',
    ));
  } else if (act.disposition === 'ADMITTED') {
    blocks.push(blocker(
      'AMBIENT_EXECUTION_AUTHORITY_REFUSED',
      'Provider execution is already admitted without an R5B human grant; R5B refuses ambient execution authority.',
      'provider_id',
    ));
  } else if (act.disposition === 'REFUSED') {
    blocks.push(...(act.blockers || [blocker(
      'R4_EXECUTION_REFUSED',
      'R4 refused this provider act before human authorization.',
    )]));
  }

  const scope = act ? grantScopeFor(act, providerId) : { acts: [], disclosures: [], blockers: [] };
  blocks.push(...scope.blockers);

  if (blocks.length) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      provider_id: providerId,
      model_ref: modelRef,
      admission_before: act?.disposition ?? admission.status,
      blockers: blocks,
    });
  }

  const membrane = clone(act.evidence_membrane);
  return deepFreeze({
    ok: true,
    status: 'READY_FOR_HUMAN_AUTHORIZATION',
    grant_version: HUMAN_EXECUTION_GRANT_VERSION,
    work_unit_id: id,
    work_unit_digest: workUnitExecutionFingerprint(work_unit),
    provider_id: providerId,
    model_ref: modelRef,
    route_version: binding.route_version ?? binding.route_record?.route_version ?? null,
    route_digest: binding.route_digest,
    bound_at_sha: binding.bound_at_sha,
    route_role: act.route_role,
    route_position: act.route_position,
    route_reason_codes: clone(binding.route_record?.routing_reason_codes || []),
    evidence_membrane: membrane,
    evidence_membrane_digest: evidenceMembraneDigest(membrane),
    required_authority: clone(act.required_authority),
    missing_authority: clone(act.missing_authority),
    grant_scope: {
      acts: scope.acts,
      disclosures: scope.disclosures,
    },
    attempt_count_at_issue: attempts.length,
    admission_before: act.disposition,
    r4_admission_version: admission.admission_version,
  });
}

export function createHumanExecutionGrant(preview, {
  grantor = 'founder',
  authorization_act = 'R5B_AUTHORIZE_ONCE',
  sequence = 1,
  issued_at,
} = {}) {
  if (!preview?.ok || preview.status !== 'READY_FOR_HUMAN_AUTHORIZATION') {
    return deepFreeze({
      ok: false,
      grant: null,
      blockers: [blocker('AUTHORIZATION_PREVIEW_REQUIRED', 'A valid R5B authorization preview is required.')],
    });
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    return deepFreeze({
      ok: false,
      grant: null,
      blockers: [blocker('INVALID_GRANT_SEQUENCE', 'Grant sequence must be a positive integer.')],
    });
  }
  const issuedAt = String(issued_at || '').trim();
  if (!issuedAt) {
    return deepFreeze({
      ok: false,
      grant: null,
      blockers: [blocker('ISSUED_AT_REQUIRED', 'Grant issuance time must be supplied by the human-action adapter.')],
    });
  }

  const identity = {
    grant_version: HUMAN_EXECUTION_GRANT_VERSION,
    sequence,
    work_unit_id: preview.work_unit_id,
    provider_id: preview.provider_id,
    model_ref: preview.model_ref,
    route_digest: preview.route_digest,
    attempt_count_at_issue: preview.attempt_count_at_issue,
  };
  const grantId = 'r5b-' + digest(identity).slice('sha256:'.length, 'sha256:'.length + 32);
  const grant = {
    ...identity,
    grant_id: grantId,
    work_unit_digest: preview.work_unit_digest,
    route_version: preview.route_version,
    bound_at_sha: preview.bound_at_sha,
    route_role: preview.route_role,
    route_position: preview.route_position,
    evidence_membrane: clone(preview.evidence_membrane),
    evidence_membrane_digest: preview.evidence_membrane_digest,
    required_authority: clone(preview.required_authority),
    granted_authority: {
      acts: clone(preview.grant_scope.acts),
      disclosures: clone(preview.grant_scope.disclosures),
    },
    grantor: String(grantor || 'founder'),
    authorization_act: String(authorization_act || 'R5B_AUTHORIZE_ONCE'),
    issued_at: issuedAt,
    one_shot: true,
  };
  grant.grant_digest = digest(grant);

  return deepFreeze({ ok: true, grant, blockers: [] });
}

export function validateHumanExecutionGrant(grant, currentPreview) {
  const blocks = [];
  if (!grant || grant.grant_version !== HUMAN_EXECUTION_GRANT_VERSION) {
    blocks.push(blocker('INVALID_GRANT_VERSION', 'A valid R5B.v1 execution grant is required.'));
    return deepFreeze({ ok: false, blockers: blocks });
  }
  const { grant_digest: recordedDigest, ...grantBody } = grant;
  if (recordedDigest !== digest(grantBody)) {
    blocks.push(blocker(
      'GRANT_DIGEST_MISMATCH',
      'The append-only human execution grant does not match its immutable digest.',
      'grant_digest',
    ));
  }
  if (grant.one_shot !== true) {
    blocks.push(blocker('GRANT_NOT_ONE_SHOT', 'R5B grants must be explicitly one-shot.', 'one_shot'));
  }
  if (!currentPreview?.ok) {
    blocks.push(blocker(
      'CURRENT_AUTHORIZATION_PREVIEW_REFUSED',
      'Current route/admission facts no longer support this human grant.',
    ));
    return deepFreeze({ ok: false, blockers: blocks });
  }

  const exact = [
    ['work_unit_id', grant.work_unit_id, currentPreview.work_unit_id],
    ['work_unit_digest', grant.work_unit_digest, currentPreview.work_unit_digest],
    ['provider_id', grant.provider_id, currentPreview.provider_id],
    ['model_ref', grant.model_ref, currentPreview.model_ref],
    ['route_version', grant.route_version, currentPreview.route_version],
    ['route_digest', grant.route_digest, currentPreview.route_digest],
    ['bound_at_sha', grant.bound_at_sha, currentPreview.bound_at_sha],
    ['route_role', grant.route_role, currentPreview.route_role],
    ['route_position', grant.route_position, currentPreview.route_position],
    ['evidence_membrane_digest', grant.evidence_membrane_digest, currentPreview.evidence_membrane_digest],
    ['attempt_count_at_issue', grant.attempt_count_at_issue, currentPreview.attempt_count_at_issue],
  ];
  for (const [field, expected, actual] of exact) {
    if (expected !== actual) {
      blocks.push(blocker(
        'GRANT_FACT_MISMATCH',
        'Human execution grant is stale because ' + field + ' changed.',
        field,
      ));
    }
  }

  if (digest(grant.required_authority) !== digest(currentPreview.required_authority)) {
    blocks.push(blocker(
      'GRANT_REQUIRED_AUTHORITY_CHANGED',
      'R4 required authority changed after human authorization.',
      'required_authority',
    ));
  }
  if (digest(grant.granted_authority) !== digest({
    acts: currentPreview.grant_scope.acts,
    disclosures: currentPreview.grant_scope.disclosures,
  })) {
    blocks.push(blocker(
      'GRANT_SCOPE_CHANGED',
      'The exact human-authorized execution authority changed after authorization.',
      'granted_authority',
    ));
  }

  return deepFreeze({ ok: blocks.length === 0, blockers: blocks });
}

export function applyHumanExecutionGrant(projectedWorkUnit, grant) {
  const out = clone(projectedWorkUnit);
  const allowed = new Set(stringArray(out?.authority?.authorized_acts));
  const denied = new Set(stringArray(out?.authority?.not_authorized_acts));

  for (const act of stringArray(grant?.granted_authority?.acts)) {
    allowed.add(act);
    denied.delete(act);
  }
  out.authority.authorized_acts = [...allowed];
  out.authority.not_authorized_acts = [...denied];

  for (const disclosure of stringArray(grant?.granted_authority?.disclosures)) {
    if (disclosure === 'repository_read_only_external') {
      out.disclosure.repository_read_only_external = true;
    }
  }
  return deepFreeze(out);
}

function permissionEnvelopeFromAdmissionWorkUnit(workUnit) {
  const allowed = new Set(stringArray(workUnit?.authority?.authorized_acts));
  const denied = new Set(stringArray(workUnit?.authority?.not_authorized_acts));
  const has = (act) => allowed.has(act) && !denied.has(act);
  return deepFreeze({
    repo_read: has('repo.read'),
    repo_write_scope: has('repo.write:worktree') ? 'worktree' : 'none',
    execute_checks: has('tests.run'),
    production_read: has('production.read'),
    production_write: has('production.write'),
    deploy: has('deploy'),
    authority_change: has('authority.change'),
    external_network: has('network.external'),
    external_repo_disclosure:
      workUnit?.disclosure?.repository_read_only_external === true,
    provider_spend: has('provider.spend'),
  });
}

export function evaluateHumanExecutionGrant({
  grant,
  work_unit,
  binding = work_unit?.routing_intelligence ?? null,
  attempts = [],
  provider_id = grant?.provider_id,
  model_ref = grant?.model_ref,
  local_worktree_available = false,
} = {}) {
  const preview = prepareHumanExecutionAuthorization({
    work_unit,
    binding,
    attempts,
    provider_id,
    model_ref,
    local_worktree_available,
  });
  const validation = validateHumanExecutionGrant(grant, preview);
  if (!validation.ok) {
    return deepFreeze({
      ok: false,
      status: 'GRANT_INVALID',
      blockers: validation.blockers,
      preview,
    });
  }

  const projected = projectAdmissionWorkUnitV1({
    work_unit,
    attempts,
    local_worktree_available,
  });
  const effective = applyHumanExecutionGrant(projected, grant);
  const admission = evaluateExecutionAdmission({
    binding,
    work_unit: effective,
  });
  const act = (admission.provider_acts || []).find(
    (entry) => entry.provider_id === grant.provider_id,
  );
  if (!act || act.disposition !== 'ADMITTED') {
    return deepFreeze({
      ok: false,
      status: 'FINAL_R4_ADMISSION_REFUSED',
      blockers: act?.blockers || admission.blockers || [],
      preview,
      admission,
      provider_act: act || null,
    });
  }

  return deepFreeze({
    ok: true,
    status: 'ADMITTED',
    blockers: [],
    preview,
    admission,
    provider_act: act,
    permission_envelope: permissionEnvelopeFromAdmissionWorkUnit(effective),
    effective_work_unit: effective,
  });
}

export const R5B_FORBIDDEN_GRANT_ACTS = FORBIDDEN_GRANT_ACTS;
