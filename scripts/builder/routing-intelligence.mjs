/**
 * JARVIS Routing Intelligence — J5.v1 pure deterministic route law.
 *
 * Boundary:
 * - no imports
 * - no filesystem/network/credential/environment inspection
 * - no provider call
 * - no Work Unit mutation
 * - no authority mutation
 *
 * The host supplies trusted structured facts. The router selects capability,
 * model family, review topology, evidence posture, and required authority only.
 * Transport resolution is a separate pure step and may HOLD; it never changes
 * the selected model family.
 */

export const ROUTE_VERSION = 'J5.v1';
export const GOVERNING_LAW = 'JARVIS-ROUTING-INTELLIGENCE-01/J5';

export const EVIDENCE_CLASSES = Object.freeze([
  'E0_TASK_TEXT',
  'E1_REPOSITORY_LOCAL',
  'E2_CONTINUITY_LOCAL',
  'E3_EXTERNAL_REPO_BUNDLE',
  'E4_SENSITIVE_OR_PRODUCTION',
]);

export const TASK_SHAPES = Object.freeze([
  'CODE_GROUNDED',
  'ARCHITECTURE_REASONING',
  'ADVERSARIAL_FALSIFICATION',
  'LONG_HORIZON_DECOMPOSITION',
  'EVIDENCE_SYNTHESIS',
  'FRONTIER_UNKNOWN',
]);

export const REVIEW_PRESSURES = Object.freeze(['ordinary', 'high_value_uncertain']);
export const CHALLENGE_MODES = Object.freeze(['none', 'adversarial', 'frontier']);
export const FRONTIER_POSTURES = Object.freeze(['none', 'text_only_manual', 'repository_grounded']);
const WRITE_SCOPES = Object.freeze(['none', 'worktree']);

export const MODEL_FAMILIES = Object.freeze({
  QWEN: 'QWEN',
  GPT_OSS: 'GPT_OSS',
  INKLING: 'INKLING',
  NEMOTRON: 'NEMOTRON',
});

const FAMILY_PROFILES = Object.freeze({
  QWEN: Object.freeze({
    primary_for: Object.freeze(['CODE_GROUNDED']),
    reviewer_for: Object.freeze(['ARCHITECTURE_REASONING', 'EVIDENCE_SYNTHESIS']),
  }),
  GPT_OSS: Object.freeze({
    primary_for: Object.freeze(['ARCHITECTURE_REASONING', 'EVIDENCE_SYNTHESIS']),
    reviewer_for: Object.freeze(['CODE_GROUNDED']),
  }),
  INKLING: Object.freeze({
    primary_for: Object.freeze([]),
    reviewer_for: Object.freeze([
      'CODE_GROUNDED',
      'ADVERSARIAL_FALSIFICATION',
      'LONG_HORIZON_DECOMPOSITION',
      'EVIDENCE_SYNTHESIS',
    ]),
  }),
  NEMOTRON: Object.freeze({
    primary_for: Object.freeze([]),
    reviewer_for: Object.freeze([
      'ARCHITECTURE_REASONING',
      'ADVERSARIAL_FALSIFICATION',
      'LONG_HORIZON_DECOMPOSITION',
      'EVIDENCE_SYNTHESIS',
    ]),
  }),
});

export const RESPONSE_BUDGET_PROFILES = Object.freeze({
  'qwen-local': Object.freeze({
    profile_id: 'LOCAL_QWEN_EXISTING_ADAPTER',
    enforcement: 'adapter-managed',
    max_output_tokens: null,
    auto_expand: false,
  }),
  'gpt-oss-local': Object.freeze({
    profile_id: 'LOCAL_GPT_OSS_EXISTING_ADAPTER',
    enforcement: 'adapter-managed',
    max_output_tokens: null,
    reasoning_posture: 'low',
    auto_expand: false,
  }),
  'inkling-tinker': Object.freeze({
    profile_id: 'INKLING_TINKER_J3B_R1',
    enforcement: 'transport',
    max_output_tokens: 4096,
    auto_expand: false,
  }),
  'nemotron-tinker': Object.freeze({
    profile_id: 'NEMOTRON_TINKER_J3B_R1',
    enforcement: 'transport',
    max_output_tokens: 4096,
    auto_expand: false,
  }),
  'nemotron-zen': Object.freeze({
    profile_id: 'NEMOTRON_ZEN_MANUAL_TEXT',
    enforcement: 'manual',
    max_output_tokens: null,
    auto_expand: false,
  }),
});

const TRANSPORTS = Object.freeze({
  QWEN: Object.freeze([{ provider_id: 'qwen-local', locality: 'local', metered: false, posture: 'local' }]),
  GPT_OSS: Object.freeze([{ provider_id: 'gpt-oss-local', locality: 'local', metered: false, posture: 'local' }]),
  INKLING: Object.freeze([{ provider_id: 'inkling-tinker', locality: 'external', metered: true, posture: 'repository_grounded' }]),
  NEMOTRON: Object.freeze([
    { provider_id: 'nemotron-tinker', locality: 'external', metered: true, posture: 'repository_grounded' },
    { provider_id: 'nemotron-zen', locality: 'external', metered: false, posture: 'text_only_manual', manual_only: true },
  ]),
});

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function blocker(code, detail) {
  return Object.freeze({ code, detail });
}

function enumOk(value, allowed) {
  return allowed.includes(value);
}

function unique(values) {
  return [...new Set(values)];
}

function exactRefs(value) {
  if (!Array.isArray(value)) return [];
  return unique(value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean));
}

export function normalizeTaskShape(value) {
  const raw = String(value || '').trim();
  const aliases = {
    mechanical_code: 'CODE_GROUNDED',
    code_grounded: 'CODE_GROUNDED',
    CODE_GROUNDED: 'CODE_GROUNDED',
    deep_reasoning: 'ARCHITECTURE_REASONING',
    architecture_reasoning: 'ARCHITECTURE_REASONING',
    ARCHITECTURE_REASONING: 'ARCHITECTURE_REASONING',
    adversarial_falsification: 'ADVERSARIAL_FALSIFICATION',
    ADVERSARIAL_FALSIFICATION: 'ADVERSARIAL_FALSIFICATION',
    long_horizon_decomposition: 'LONG_HORIZON_DECOMPOSITION',
    LONG_HORIZON_DECOMPOSITION: 'LONG_HORIZON_DECOMPOSITION',
    evidence_synthesis: 'EVIDENCE_SYNTHESIS',
    EVIDENCE_SYNTHESIS: 'EVIDENCE_SYNTHESIS',
    frontier_unknown: 'FRONTIER_UNKNOWN',
    FRONTIER_UNKNOWN: 'FRONTIER_UNKNOWN',
  };
  return aliases[raw] || aliases[raw.toLowerCase()] || raw;
}

export function normalizeEvidenceClass(value) {
  const raw = String(value || '').trim();
  const aliases = {
    E0: 'E0_TASK_TEXT',
    TASK_TEXT: 'E0_TASK_TEXT',
    E0_TASK_TEXT: 'E0_TASK_TEXT',
    E1: 'E1_REPOSITORY_LOCAL',
    REPOSITORY_LOCAL: 'E1_REPOSITORY_LOCAL',
    E1_REPOSITORY_LOCAL: 'E1_REPOSITORY_LOCAL',
    E2: 'E2_CONTINUITY_LOCAL',
    CONTINUITY_LOCAL: 'E2_CONTINUITY_LOCAL',
    LOCAL_ONLY: 'E2_CONTINUITY_LOCAL',
    E2_CONTINUITY_LOCAL: 'E2_CONTINUITY_LOCAL',
    E3: 'E3_EXTERNAL_REPO_BUNDLE',
    EXTERNAL_REPO_BUNDLE: 'E3_EXTERNAL_REPO_BUNDLE',
    E3_EXTERNAL_REPO_BUNDLE: 'E3_EXTERNAL_REPO_BUNDLE',
    E4: 'E4_SENSITIVE_OR_PRODUCTION',
    SENSITIVE_OR_PRODUCTION: 'E4_SENSITIVE_OR_PRODUCTION',
    E4_SENSITIVE_OR_PRODUCTION: 'E4_SENSITIVE_OR_PRODUCTION',
  };
  return aliases[raw] || aliases[raw.toUpperCase()] || raw;
}

function familyEligible(family, taskShape, role = 'any') {
  const profile = FAMILY_PROFILES[family];
  if (!profile) return false;
  if (role === 'primary') return profile.primary_for.includes(taskShape);
  if (role === 'reviewer') return profile.reviewer_for.includes(taskShape);
  return profile.primary_for.includes(taskShape) || profile.reviewer_for.includes(taskShape);
}

function localTopology(taskShape) {
  if (taskShape === 'CODE_GROUNDED') {
    return { primary: 'QWEN', reviewer: 'GPT_OSS', primaryRole: 'code_primary' };
  }
  if (taskShape === 'ARCHITECTURE_REASONING' || taskShape === 'EVIDENCE_SYNTHESIS') {
    return {
      primary: 'GPT_OSS',
      reviewer: 'QWEN',
      primaryRole: taskShape === 'EVIDENCE_SYNTHESIS' ? 'evidence_synthesis_primary' : 'architecture_primary',
    };
  }
  return null;
}

function validateInput(input, taskShape, evidenceClass) {
  const blocks = [];
  if (!input || typeof input !== 'object') return [blocker('ROUTE_INPUT_REQUIRED', 'Structured route input is required.')];
  if (!enumOk(taskShape, TASK_SHAPES)) blocks.push(blocker('INVALID_TASK_SHAPE', 'task_shape is not in the J5 task vocabulary.'));
  if (!enumOk(evidenceClass, EVIDENCE_CLASSES)) blocks.push(blocker('INVALID_EVIDENCE_CLASS', 'evidence_class is not in the E0-E4 vocabulary.'));
  if (!enumOk(input.review_pressure, REVIEW_PRESSURES)) blocks.push(blocker('INVALID_REVIEW_PRESSURE', 'review_pressure is not recognized.'));
  if (!enumOk(input.challenge_mode, CHALLENGE_MODES)) blocks.push(blocker('INVALID_CHALLENGE_MODE', 'challenge_mode is not recognized.'));
  if (!enumOk(input.frontier_posture, FRONTIER_POSTURES)) blocks.push(blocker('INVALID_FRONTIER_POSTURE', 'frontier_posture is not recognized.'));
  if (input.challenge_mode === 'frontier' && input.frontier_posture === 'none') blocks.push(blocker('FRONTIER_POSTURE_REQUIRED', 'Frontier challenge requires an explicit posture.'));
  if (input.challenge_mode !== 'frontier' && input.frontier_posture !== 'none') blocks.push(blocker('CONTRADICTORY_FRONTIER_POSTURE', 'Only frontier challenge may carry a frontier posture.'));
  if (!enumOk(input.authority?.repo_write_scope, WRITE_SCOPES)) blocks.push(blocker('INVALID_REPO_WRITE_SCOPE', 'repo_write_scope must be none or worktree.'));
  if (taskShape === 'FRONTIER_UNKNOWN') blocks.push(blocker('TASK_SHAPE_UNRESOLVED', 'FRONTIER_UNKNOWN cannot be auto-routed.'));
  return blocks;
}

function requiredAuthorityForExternal({ evidenceClass, posture, metered }) {
  const acts = ['network.external'];
  const disclosures = [];
  if (metered) acts.push('provider.spend');
  if (posture === 'repository_grounded' && (evidenceClass === 'E1_REPOSITORY_LOCAL' || evidenceClass === 'E3_EXTERNAL_REPO_BUNDLE')) {
    disclosures.push('repository_external_disclosure');
  }
  return { acts: Object.freeze(acts), disclosures: Object.freeze(disclosures) };
}

function authorityBlockers(required, authority = {}) {
  const blocks = [];
  for (const act of required.acts || []) {
    if (act === 'network.external' && authority.network_external !== true) blocks.push(blocker('EXTERNAL_NETWORK_AUTHORITY_REQUIRED', 'network.external is not authorized.'));
    if (act === 'provider.spend' && authority.provider_spend !== true) blocks.push(blocker('PROVIDER_SPEND_AUTHORITY_REQUIRED', 'provider.spend is not authorized.'));
  }
  for (const disclosure of required.disclosures || []) {
    if (disclosure === 'repository_external_disclosure' && authority.repository_external_disclosure !== true) {
      blocks.push(blocker('REPOSITORY_EXTERNAL_DISCLOSURE_REQUIRED', 'External repository evidence disclosure is not authorized.'));
    }
  }
  return blocks;
}

function evidencePolicyEntry(modelFamily, evidenceClass, kind) {
  return Object.freeze({ model_family: modelFamily, evidence_class: evidenceClass, kind });
}

function routeRefused(input, taskShape, evidenceClass, blocks) {
  return deepFreeze({
    route_version: ROUTE_VERSION,
    governing_law: GOVERNING_LAW,
    deterministic: { selected: false, capability: null },
    evidence_class: evidenceClass,
    task_shape: taskShape,
    review_pressure: input?.review_pressure ?? null,
    challenge_mode: input?.challenge_mode ?? null,
    frontier_posture: input?.frontier_posture ?? null,
    primary: null,
    challengers: [],
    review_policy: { local: null, external: null },
    evidence_policy: { primary: null, challengers: [] },
    required_authority: { acts: [], disclosures: [] },
    granted_authority: [],
    transport_resolution: null,
    response_budget_profiles: [],
    execution_disposition: 'refused',
    execution_authorized: false,
    blockers: blocks,
    routing_reason_codes: ['ROUTE_REFUSED'],
  });
}

function externalChallenge(input, taskShape, evidenceClass, refs) {
  if (input.challenge_mode === 'none') return null;

  if (input.challenge_mode === 'frontier' && input.frontier_posture === 'text_only_manual') {
    const family = 'NEMOTRON';
    if (!familyEligible(family, taskShape, 'reviewer')) {
      return { blocker: blocker('MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK', 'Nemotron has no evidence-backed challenger standing for this task shape.') };
    }
    if (input.evidence?.task_text_available !== true) {
      return { blocker: blocker('TASK_TEXT_REQUIRED', 'Manual frontier reasoning requires bounded task text.') };
    }
    const required = requiredAuthorityForExternal({ evidenceClass: 'E0_TASK_TEXT', posture: 'text_only_manual', metered: false });
    const blocks = authorityBlockers(required, input.authority);
    return {
      model_family: family,
      role: 'frontier_challenger',
      transport_posture: 'text_only_manual',
      evidence_class: 'E0_TASK_TEXT',
      evidence_kind: 'task_text_only',
      required,
      blockers: blocks,
      execution_disposition: blocks.length ? 'held_for_external_authority' : 'manual_only',
      reason: 'NEMOTRON_MANUAL_FRONTIER_CHALLENGE',
    };
  }

  const family = input.challenge_mode === 'adversarial' ? 'INKLING' : 'NEMOTRON';
  if (!familyEligible(family, taskShape, 'reviewer')) {
    return { blocker: blocker('MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK', family + ' has no evidence-backed challenger standing for ' + taskShape + '.') };
  }

  if (evidenceClass === 'E2_CONTINUITY_LOCAL') {
    return { blocker: blocker('LOCAL_ONLY_EVIDENCE', 'E2 continuity may not cross an external membrane.') };
  }
  if (evidenceClass === 'E4_SENSITIVE_OR_PRODUCTION') {
    return { blocker: blocker('SENSITIVE_OR_PRODUCTION_OUT_OF_SCOPE', 'E4 external routing is outside J5 authority.') };
  }

  const externalEvidenceClass = evidenceClass === 'E1_REPOSITORY_LOCAL' ? 'E3_EXTERNAL_REPO_BUNDLE' : evidenceClass;
  const repositoryGrounded = externalEvidenceClass === 'E3_EXTERNAL_REPO_BUNDLE';
  if (repositoryGrounded && refs.length === 0) {
    return { blocker: blocker('EVIDENCE_BUNDLE_REQUIRED', 'External repository review requires exact bounded evidence refs.') };
  }
  const required = requiredAuthorityForExternal({
    evidenceClass: externalEvidenceClass,
    posture: repositoryGrounded ? 'repository_grounded' : 'task_text',
    metered: true,
  });
  const blocks = authorityBlockers(required, input.authority);
  return {
    model_family: family,
    role: input.challenge_mode === 'adversarial' ? 'adversarial_challenger' : 'frontier_challenger',
    transport_posture: 'repository_grounded',
    evidence_class: externalEvidenceClass,
    evidence_kind: repositoryGrounded ? 'exact_external_bundle' : 'task_text_only',
    required,
    blockers: blocks,
    execution_disposition: blocks.length ? 'held_for_external_authority' : 'explicit_external_act_required',
    reason: family === 'INKLING' ? 'INKLING_ADVERSARIAL_CHALLENGE' : 'NEMOTRON_FRONTIER_CHALLENGE',
  };
}

export function routeIntelligence(input) {
  const taskShape = normalizeTaskShape(input?.task_shape);
  const evidenceClass = normalizeEvidenceClass(input?.evidence_class || 'E0_TASK_TEXT');
  const validation = validateInput(input, taskShape, evidenceClass);
  if (validation.length) return routeRefused(input, taskShape, evidenceClass, validation);

  if (input.deterministic?.registered === true) {
    return deepFreeze({
      route_version: ROUTE_VERSION,
      governing_law: GOVERNING_LAW,
      deterministic: { selected: true, capability: String(input.deterministic.capability || '') || null },
      evidence_class: evidenceClass,
      task_shape: taskShape,
      review_pressure: input.review_pressure,
      challenge_mode: input.challenge_mode,
      frontier_posture: input.frontier_posture,
      primary: null,
      challengers: [],
      review_policy: { local: 'deterministic', external: 'none' },
      evidence_policy: { primary: null, challengers: [] },
      required_authority: { acts: [], disclosures: [] },
      granted_authority: [],
      transport_resolution: null,
      response_budget_profiles: [],
      execution_disposition: 'deterministic',
      execution_authorized: false,
      blockers: [],
      routing_reason_codes: ['DETERMINISTIC_CAPABILITY_FIRST'],
    });
  }

  if (evidenceClass === 'E4_SENSITIVE_OR_PRODUCTION') {
    return routeRefused(input, taskShape, evidenceClass, [
      blocker('SENSITIVE_OR_PRODUCTION_OUT_OF_SCOPE', 'E4 routing is outside this programme authority.'),
    ]);
  }

  const refs = exactRefs(input.evidence?.external_bundle_refs);
  const topology = localTopology(taskShape);
  const blocks = [];
  const challengers = [];
  const challengerEvidence = [];
  const reasons = [];
  const requiredActs = [];
  const requiredDisclosures = [];
  const budgetProfiles = [];

  if (topology) {
    if (input.authority?.repo_read !== true) blocks.push(blocker('REPO_READ_REQUIRED', 'Local review requires existing repo.read authority.'));
    if (input.authority?.repo_write_scope !== 'none') blocks.push(blocker('READ_ONLY_ROUTE_REQUIRED', 'J5 routing admits review-only Work Units.'));
    if ((evidenceClass === 'E1_REPOSITORY_LOCAL' || evidenceClass === 'E2_CONTINUITY_LOCAL') && input.evidence?.local_worktree_available !== true) {
      blocks.push(blocker('LOCAL_WORKTREE_REQUIRED', 'Local repository/continuity review requires the isolated Work Unit worktree.'));
    }
    challengers.push({
      model_family: topology.reviewer,
      role: 'independent_local_challenger',
      review_dimension: 'distinct_model_family',
      execution_disposition: blocks.length ? 'refused' : 'planned_local',
    });
    challengerEvidence.push(evidencePolicyEntry(topology.reviewer, evidenceClass, 'local_worktree_read_only'));
    reasons.push(taskShape === 'CODE_GROUNDED' ? 'QWEN_CODE_PRIMARY' : 'GPT_OSS_REASONING_PRIMARY');
    reasons.push('INDEPENDENT_LOCAL_REVIEW_REQUIRED');
    if (input.review_pressure === 'high_value_uncertain') reasons.push('HIGH_VALUE_REVIEW_PRESSURE');
  } else if (input.challenge_mode === 'none') {
    blocks.push(blocker('EXPLICIT_CHALLENGE_REQUIRED', 'This task shape has no J5 automatic local primary; an explicit eligible challenge is required.'));
  }

  const ext = externalChallenge(input, taskShape, evidenceClass, refs);
  if (ext?.blocker) {
    blocks.push(ext.blocker);
  } else if (ext) {
    challengers.push({
      model_family: ext.model_family,
      role: ext.role,
      review_dimension: 'external_model_family',
      transport_posture: ext.transport_posture,
      execution_disposition: ext.execution_disposition,
    });
    challengerEvidence.push(evidencePolicyEntry(ext.model_family, ext.evidence_class, ext.evidence_kind));
    requiredActs.push(...ext.required.acts);
    requiredDisclosures.push(...ext.required.disclosures);
    blocks.push(...ext.blockers);
    reasons.push(ext.reason);
    const transport = ext.transport_posture === 'text_only_manual'
      ? 'nemotron-zen'
      : (ext.model_family === 'INKLING' ? 'inkling-tinker' : 'nemotron-tinker');
    if (RESPONSE_BUDGET_PROFILES[transport]) budgetProfiles.push(RESPONSE_BUDGET_PROFILES[transport].profile_id);
  }

  const primary = topology ? {
    model_family: topology.primary,
    role: topology.primaryRole,
    execution_disposition: blocks.some((b) => ['REPO_READ_REQUIRED', 'READ_ONLY_ROUTE_REQUIRED', 'LOCAL_WORKTREE_REQUIRED'].includes(b.code))
      ? 'refused'
      : 'planned_local',
  } : null;

  const primaryEvidence = primary
    ? evidencePolicyEntry(
        primary.model_family,
        evidenceClass,
        evidenceClass === 'E0_TASK_TEXT' ? 'task_text_only' : 'local_worktree_read_only',
      )
    : null;

  const localBlocking = blocks.some((b) => [
    'REPO_READ_REQUIRED',
    'READ_ONLY_ROUTE_REQUIRED',
    'LOCAL_WORKTREE_REQUIRED',
    'SENSITIVE_OR_PRODUCTION_OUT_OF_SCOPE',
    'TASK_SHAPE_UNRESOLVED',
  ].includes(b.code));
  const externalBlocking = blocks.some((b) => [
    'EXTERNAL_NETWORK_AUTHORITY_REQUIRED',
    'PROVIDER_SPEND_AUTHORITY_REQUIRED',
    'REPOSITORY_EXTERNAL_DISCLOSURE_REQUIRED',
    'LOCAL_ONLY_EVIDENCE',
    'MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK',
    'EVIDENCE_BUNDLE_REQUIRED',
    'TASK_TEXT_REQUIRED',
  ].includes(b.code));

  let disposition = 'planned_local';
  if (localBlocking || blocks.some((b) => b.code === 'EXPLICIT_CHALLENGE_REQUIRED')) disposition = 'refused';
  else if (externalBlocking) disposition = 'held_for_external_authority';
  else if (ext?.execution_disposition === 'manual_only') disposition = 'manual_only';
  else if (ext && !topology) disposition = 'external_review_proposed';
  else if (ext) disposition = 'local_review_with_external_challenge_proposed';

  return deepFreeze({
    route_version: ROUTE_VERSION,
    governing_law: GOVERNING_LAW,
    deterministic: { selected: false, capability: input.deterministic?.capability ?? null },
    evidence_class: evidenceClass,
    task_shape: taskShape,
    review_pressure: input.review_pressure,
    challenge_mode: input.challenge_mode,
    frontier_posture: input.frontier_posture,
    primary,
    challengers,
    review_policy: {
      local: topology ? 'independent_local_second' : 'none',
      external: ext
        ? (ext.transport_posture === 'text_only_manual' ? 'manual_frontier_proposed' : 'external_challenge_proposed')
        : 'none',
    },
    evidence_policy: { primary: primaryEvidence, challengers: challengerEvidence },
    required_authority: {
      acts: Object.freeze(unique(requiredActs)),
      disclosures: Object.freeze(unique(requiredDisclosures)),
    },
    granted_authority: [],
    transport_resolution: null,
    response_budget_profiles: Object.freeze(unique(budgetProfiles)),
    execution_disposition: disposition,
    execution_authorized: false,
    blockers: blocks,
    routing_reason_codes: reasons,
  });
}

function selectedFamilies(route) {
  return unique([
    route?.primary?.model_family,
    ...(route?.challengers || []).map((c) => c.model_family),
  ].filter(Boolean));
}

function chooseTransport(family, posture, providerAvailability = {}) {
  const options = TRANSPORTS[family] || [];
  const preferred = options.find((item) => item.posture === posture) || options[0] || null;
  if (!preferred) return { status: 'HOLD', model_family: family, provider_id: null, blocker: 'NO_ADMISSIBLE_TRANSPORT' };
  if (providerAvailability[preferred.provider_id] === false) {
    return { status: 'HOLD', model_family: family, provider_id: null, blocker: 'PREFERRED_TRANSPORT_UNAVAILABLE' };
  }
  return {
    status: preferred.manual_only
      ? 'MANUAL_ONLY'
      : (preferred.locality === 'local' ? 'READY_LOCAL' : 'READY_FOR_EXPLICIT_EXTERNAL_ACT'),
    model_family: family,
    provider_id: preferred.provider_id,
    blocker: null,
    response_budget_profile: RESPONSE_BUDGET_PROFILES[preferred.provider_id] || null,
  };
}

export function resolveRouteTransports(route, facts = {}) {
  if (!route || route.execution_disposition === 'refused' || route.deterministic?.selected) {
    return deepFreeze({
      status: route?.deterministic?.selected ? 'DETERMINISTIC' : 'REFUSED',
      selections: [],
      blockers: route?.blockers || [],
    });
  }
  const availability = facts.provider_availability || {};
  const selections = [];
  const blocks = [];
  if (route.primary?.model_family) {
    const sel = chooseTransport(route.primary.model_family, 'local', availability);
    selections.push(sel);
    if (sel.blocker) blocks.push(blocker(sel.blocker, route.primary.model_family + ' preferred transport is unavailable.'));
  }
  for (const challenger of route.challengers || []) {
    const posture = challenger.transport_posture
      || (challenger.role === 'independent_local_challenger' ? 'local' : 'repository_grounded');
    const sel = chooseTransport(challenger.model_family, posture, availability);
    selections.push(sel);
    if (sel.blocker) blocks.push(blocker(sel.blocker, challenger.model_family + ' preferred transport is unavailable.'));
  }
  return deepFreeze({
    status: blocks.length ? 'HOLD' : 'RESOLVED',
    selections,
    blockers: blocks,
    model_families: selectedFamilies(route),
  });
}

export function modelFamilyFromAttempt(attempt = {}) {
  const declared = String(attempt.model_family || '').trim().toUpperCase();
  if (Object.values(MODEL_FAMILIES).includes(declared)) return declared;
  if (String(attempt.lane || '').toLowerCase() === 'deterministic') {
    const verifier = String(attempt.model || attempt.verifier_id || 'deterministic').trim();
    return verifier ? 'DETERMINISTIC:' + verifier : 'DETERMINISTIC';
  }
  const value = (
    String(attempt.provider_id || '') + ' '
    + String(attempt.model || '') + ' '
    + String(attempt.lane || '')
  ).toLowerCase();
  if (value.includes('qwen')) return 'QWEN';
  if (value.includes('gpt-oss') || value.includes('gpt_oss')) return 'GPT_OSS';
  if (value.includes('inkling')) return 'INKLING';
  if (value.includes('nemotron')) return 'NEMOTRON';
  return null;
}

function isHardStop(attempt) {
  return attempt?.status === 'failed'
    || attempt?.status === 'refused'
    || attempt?.test_results === 'fail'
    || (Number.isInteger(attempt?.exit_code) && attempt.exit_code !== 0)
    || attempt?.recommended_next_action === 'reject'
    || attempt?.evidence_sufficient === false
    || attempt?.escalation_required === true;
}

function cleanAttempt(attempt) {
  return !isHardStop(attempt)
    && (attempt?.status === 'completed' || attempt?.test_results === 'pass' || attempt?.exit_code === 0);
}

export function reconcileRoutingAttempts(route, attempts = []) {
  const list = Array.isArray(attempts) ? attempts : [];
  if (!route || route.execution_disposition === 'refused') {
    return deepFreeze({
      standing: 'REFUSED',
      next_model_family: null,
      founder_review_required: false,
      reason: 'Route is refused.',
    });
  }
  const hard = list.find(isHardStop);
  if (hard) {
    return deepFreeze({
      standing: 'STOPPED',
      next_model_family: null,
      founder_review_required: hard.escalation_required === true,
      reason: 'Provider cascade stopped by failed, refused, rejected, insufficient, or escalated attempt.',
    });
  }
  if (list.some((a) => a?.structured_disagreement === true)) {
    return deepFreeze({
      standing: 'FOUNDER_REVIEW_REQUIRED',
      next_model_family: null,
      founder_review_required: true,
      reason: 'Independent reviewers disagree; JARVIS cannot choose a semantic winner.',
    });
  }
  const clean = list.filter(cleanAttempt);
  const families = unique(clean.map(modelFamilyFromAttempt).filter(Boolean));

  if (route.deterministic?.selected) {
    return deepFreeze({
      standing: 'DETERMINISTIC_COMPLETE',
      next_model_family: null,
      founder_review_required: false,
      review_families: families,
    });
  }

  if (route.primary?.model_family) {
    if (!families.includes(route.primary.model_family)) {
      return deepFreeze({
        standing: 'PRIMARY_REVIEW_OWED',
        next_model_family: route.primary.model_family,
        founder_review_required: false,
        review_families: families,
      });
    }
    const localSecond = (route.challengers || []).find((c) => c.role === 'independent_local_challenger');
    if (localSecond && !families.includes(localSecond.model_family)) {
      return deepFreeze({
        standing: 'SECOND_LOCAL_REVIEW_OWED',
        next_model_family: localSecond.model_family,
        founder_review_required: false,
        review_families: families,
        reason: 'A retry is not an independent second opinion.',
      });
    }
    return deepFreeze({
      standing: 'LOCAL_EVIDENCE_PRESENTED',
      next_model_family: null,
      founder_review_required: true,
      review_families: families,
      reason: 'Required independent local review completed; semantic acceptance remains a founder act.',
    });
  }

  return deepFreeze({
    standing: clean.length ? 'EVIDENCE_PRESENTED' : 'NOT_RUN',
    next_model_family: null,
    founder_review_required: clean.length > 0,
    review_families: families,
    reason: clean.length
      ? 'Model evidence is presented; no automatic authority transition follows.'
      : 'No clean attempt has completed.',
  });
}

export const ROUTING_ENUMS = deepFreeze({
  evidence_classes: EVIDENCE_CLASSES,
  task_shapes: TASK_SHAPES,
  review_pressures: REVIEW_PRESSURES,
  challenge_modes: CHALLENGE_MODES,
  frontier_postures: FRONTIER_POSTURES,
  model_families: Object.values(MODEL_FAMILIES),
});
