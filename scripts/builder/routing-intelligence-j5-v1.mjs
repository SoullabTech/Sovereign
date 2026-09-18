/**
 * JARVIS Routing Intelligence — J5.v1 canonical cognitive route.
 *
 * Pure boundary:
 * - no imports
 * - no filesystem/network/environment/credentials/provider readiness
 * - no provider ids as cognitive identity
 * - no Work Unit or authority mutation
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
export const MODEL_FAMILIES = Object.freeze(['QWEN', 'GPT_OSS', 'INKLING', 'NEMOTRON']);
export const REVIEW_PRESSURES = Object.freeze(['ordinary', 'high_value_uncertain']);
export const CHALLENGE_MODES = Object.freeze(['none', 'adversarial', 'frontier']);
export const FRONTIER_POSTURES = Object.freeze(['none', 'text_only_manual', 'repository_grounded']);

export const RESPONSE_BUDGET_PROFILES = Object.freeze({
  QWEN: Object.freeze({ profile_id: 'LOCAL_QWEN_EXISTING_ADAPTER', enforcement: 'adapter-managed', max_output_tokens: null, auto_expand: false }),
  GPT_OSS: Object.freeze({ profile_id: 'LOCAL_GPT_OSS_EXISTING_ADAPTER', enforcement: 'adapter-managed', max_output_tokens: null, reasoning_posture: 'low', auto_expand: false }),
  INKLING: Object.freeze({ profile_id: 'INKLING_TINKER_J3B_R1', enforcement: 'transport', max_output_tokens: 4096, auto_expand: false }),
  NEMOTRON: Object.freeze({ profile_id: 'NEMOTRON_TINKER_J3B_R1', enforcement: 'transport', max_output_tokens: 4096, auto_expand: false }),
  NEMOTRON_ZEN: Object.freeze({ profile_id: 'NEMOTRON_ZEN_MANUAL_TEXT', enforcement: 'manual', max_output_tokens: null, auto_expand: false }),
});

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function blocker(code, detail, path = null) { return Object.freeze({ code, detail, path }); }
function unique(values) { return [...new Set(values)]; }
function exactRefs(value) {
  return Array.isArray(value)
    ? unique(value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean))
    : [];
}
function allowed(value, list) { return list.includes(value); }
function participant(participant_id, model_family, role, review_dimension, required_for_completion, extra = {}) {
  return Object.freeze({
    participant_id,
    model_family,
    role,
    review_dimension,
    required_for_completion,
    ...extra,
  });
}
function evidenceEntry(participant_id, model_family, evidence_class, kind) {
  return Object.freeze({ participant_id, model_family, evidence_class, kind });
}
function routeRefused(input, blocks) {
  return deepFreeze({
    route_version: ROUTE_VERSION,
    governing_law: GOVERNING_LAW,
    deterministic: { selected: false, capability: input?.deterministic?.capability ?? null },
    evidence_class: input?.evidence_class ?? null,
    task_shape: input?.task_shape ?? null,
    review_pressure: input?.review_pressure ?? null,
    challenge_mode: input?.challenge_mode ?? null,
    frontier_posture: input?.frontier_posture ?? null,
    primary: null,
    challengers: [],
    review_policy: { local: null, external: null },
    evidence_policy: { primary: null, challengers: [] },
    required_authority: { acts: [], disclosures: [] },
    granted_authority: [],
    response_budget_profiles: [],
    execution_disposition: 'refused',
    execution_authorized: false,
    blockers: blocks,
    routing_reason_codes: ['ROUTE_REFUSED'],
  });
}

function validateInput(input) {
  const blocks = [];
  if (!input || typeof input !== 'object') return [blocker('ROUTE_INPUT_REQUIRED', 'Structured route input is required.')];
  if (!allowed(input.evidence_class, EVIDENCE_CLASSES)) blocks.push(blocker('INVALID_EVIDENCE_CLASS', 'evidence_class must be E0-E4.', 'evidence_class'));
  if (!allowed(input.task_shape, TASK_SHAPES)) blocks.push(blocker('INVALID_TASK_SHAPE', 'task_shape is not recognized.', 'task_shape'));
  if (!allowed(input.review_pressure, REVIEW_PRESSURES)) blocks.push(blocker('INVALID_REVIEW_PRESSURE', 'review_pressure is not recognized.', 'review_pressure'));
  if (!allowed(input.challenge_mode, CHALLENGE_MODES)) blocks.push(blocker('INVALID_CHALLENGE_MODE', 'challenge_mode is not recognized.', 'challenge_mode'));
  if (!allowed(input.frontier_posture, FRONTIER_POSTURES)) blocks.push(blocker('INVALID_FRONTIER_POSTURE', 'frontier_posture is not recognized.', 'frontier_posture'));
  if (input.challenge_mode === 'frontier' && input.frontier_posture === 'none') blocks.push(blocker('FRONTIER_POSTURE_REQUIRED', 'Frontier challenge requires an explicit posture.', 'frontier_posture'));
  if (input.challenge_mode !== 'frontier' && input.frontier_posture !== 'none') blocks.push(blocker('CONTRADICTORY_FRONTIER_POSTURE', 'Only frontier challenge may carry frontier posture.', 'frontier_posture'));
  if (input.task_shape === 'FRONTIER_UNKNOWN') blocks.push(blocker('TASK_SHAPE_UNRESOLVED', 'FRONTIER_UNKNOWN cannot auto-route.', 'task_shape'));
  if (!['none', 'worktree'].includes(input.authority?.repo_write_scope)) blocks.push(blocker('INVALID_REPO_WRITE_SCOPE', 'repo_write_scope must be none or worktree.', 'authority.repo_write_scope'));
  return blocks;
}

function localTopology(shape) {
  if (shape === 'CODE_GROUNDED') {
    return {
      primary: participant('primary', 'QWEN', 'code_primary', 'primary', true, {
        response_budget_profile_id: RESPONSE_BUDGET_PROFILES.QWEN.profile_id,
      }),
      reviewer: participant('local-review-1', 'GPT_OSS', 'independent_local_challenger', 'distinct_model_family', true, {
        response_budget_profile_id: RESPONSE_BUDGET_PROFILES.GPT_OSS.profile_id,
      }),
      reason: 'QWEN_CODE_PRIMARY',
    };
  }
  if (shape === 'ARCHITECTURE_REASONING') {
    return {
      primary: participant('primary', 'GPT_OSS', 'architecture_primary', 'primary', true, {
        response_budget_profile_id: RESPONSE_BUDGET_PROFILES.GPT_OSS.profile_id,
      }),
      reviewer: participant('local-review-1', 'QWEN', 'independent_local_challenger', 'distinct_model_family', true, {
        response_budget_profile_id: RESPONSE_BUDGET_PROFILES.QWEN.profile_id,
      }),
      reason: 'GPT_OSS_ARCHITECTURE_PRIMARY',
    };
  }
  if (shape === 'EVIDENCE_SYNTHESIS') {
    return {
      primary: participant('primary', 'GPT_OSS', 'evidence_synthesis_primary', 'primary', true, {
        response_budget_profile_id: RESPONSE_BUDGET_PROFILES.GPT_OSS.profile_id,
      }),
      reviewer: participant('local-review-1', 'QWEN', 'independent_local_challenger', 'distinct_model_family', true, {
        response_budget_profile_id: RESPONSE_BUDGET_PROFILES.QWEN.profile_id,
      }),
      reason: 'GPT_OSS_EVIDENCE_PRIMARY',
    };
  }
  return null;
}

function localEvidenceKind(evidenceClass) {
  return evidenceClass === 'E0_TASK_TEXT' ? 'task_text_only' : 'local_worktree_read_only';
}

function externalChallenge(input, refs) {
  if (input.challenge_mode === 'none') return null;

  let family;
  let role;
  let posture = input.frontier_posture;
  if (input.challenge_mode === 'adversarial') {
    family = 'INKLING';
    role = 'adversarial_challenger';
    posture = 'repository_grounded';
  } else {
    family = 'NEMOTRON';
    role = 'frontier_challenger';
  }

  const eligible = (
    (family === 'INKLING' && ['CODE_GROUNDED', 'ADVERSARIAL_FALSIFICATION', 'LONG_HORIZON_DECOMPOSITION', 'EVIDENCE_SYNTHESIS'].includes(input.task_shape))
    || (family === 'NEMOTRON' && ['ARCHITECTURE_REASONING', 'ADVERSARIAL_FALSIFICATION', 'LONG_HORIZON_DECOMPOSITION', 'EVIDENCE_SYNTHESIS'].includes(input.task_shape))
  );
  if (!eligible) return { blocker: blocker('MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK', family + ' has no evidence-backed challenger standing for ' + input.task_shape + '.') };

  if (input.evidence_class === 'E2_CONTINUITY_LOCAL') return { blocker: blocker('LOCAL_ONLY_EVIDENCE', 'E2 continuity may not cross an external membrane.') };
  if (input.evidence_class === 'E4_SENSITIVE_OR_PRODUCTION') return { blocker: blocker('SENSITIVE_OR_PRODUCTION_EXTERNAL_REFUSED', 'E4 may not be routed externally under J5.', 'evidence_class') };

  if (posture === 'text_only_manual') {
    if (input.evidence?.task_text_available !== true) return { blocker: blocker('TASK_TEXT_REQUIRED', 'Manual frontier reasoning requires bounded task text.') };
    const required = { acts: ['network.external'], disclosures: [] };
    const blocks = [];
    if (input.authority?.network_external !== true) blocks.push(blocker('EXTERNAL_NETWORK_AUTHORITY_REQUIRED', 'network.external is not authorized.'));
    return {
      participant: participant('external-challenge-1', family, role, 'external_model_family', true, {
        transport_posture: 'text_only_manual',
        response_budget_profile_id: RESPONSE_BUDGET_PROFILES.NEMOTRON_ZEN.profile_id,
      }),
      evidence: evidenceEntry('external-challenge-1', family, 'E0_TASK_TEXT', 'task_text_only'),
      required,
      blocks,
      reason: 'NEMOTRON_MANUAL_FRONTIER_CHALLENGE',
    };
  }

  const externalEvidenceClass = input.evidence_class === 'E1_REPOSITORY_LOCAL'
    ? 'E3_EXTERNAL_REPO_BUNDLE'
    : input.evidence_class;
  const repositoryGrounded = externalEvidenceClass === 'E3_EXTERNAL_REPO_BUNDLE';
  if (repositoryGrounded && refs.length === 0) return { blocker: blocker('EVIDENCE_BUNDLE_REQUIRED', 'External repository review requires exact bounded evidence refs.') };

  const required = { acts: ['network.external', 'provider.spend'], disclosures: repositoryGrounded ? ['repository_external_disclosure'] : [] };
  const blocks = [];
  if (input.authority?.network_external !== true) blocks.push(blocker('EXTERNAL_NETWORK_AUTHORITY_REQUIRED', 'network.external is not authorized.'));
  if (input.authority?.provider_spend !== true) blocks.push(blocker('PROVIDER_SPEND_AUTHORITY_REQUIRED', 'provider.spend is not authorized.'));
  if (repositoryGrounded && input.authority?.repository_external_disclosure !== true) blocks.push(blocker('REPOSITORY_EXTERNAL_DISCLOSURE_REQUIRED', 'Exact-bundle external repository disclosure is not authorized.'));

  return {
    participant: participant('external-challenge-1', family, role, 'external_model_family', true, {
      transport_posture: 'repository_grounded',
      response_budget_profile_id: family === 'INKLING'
        ? RESPONSE_BUDGET_PROFILES.INKLING.profile_id
        : RESPONSE_BUDGET_PROFILES.NEMOTRON.profile_id,
    }),
    evidence: evidenceEntry(
      'external-challenge-1',
      family,
      externalEvidenceClass,
      repositoryGrounded ? 'exact_external_bundle' : 'task_text_only',
    ),
    required,
    blocks,
    reason: family === 'INKLING' ? 'INKLING_ADVERSARIAL_CHALLENGE' : 'NEMOTRON_FRONTIER_CHALLENGE',
  };
}

export function routeIntelligenceJ5V1(input) {
  const validation = validateInput(input);
  if (validation.length) return routeRefused(input, validation);

  if (input.deterministic?.registered === true) {
    return deepFreeze({
      route_version: ROUTE_VERSION,
      governing_law: GOVERNING_LAW,
      deterministic: { selected: true, capability: String(input.deterministic.capability || '') || null },
      evidence_class: input.evidence_class,
      task_shape: input.task_shape,
      review_pressure: input.review_pressure,
      challenge_mode: input.challenge_mode,
      frontier_posture: input.frontier_posture,
      primary: null,
      challengers: [],
      review_policy: { local: 'deterministic', external: 'none' },
      evidence_policy: { primary: null, challengers: [] },
      required_authority: { acts: [], disclosures: [] },
      granted_authority: [],
      response_budget_profiles: [],
      execution_disposition: 'deterministic',
      execution_authorized: false,
      blockers: [],
      routing_reason_codes: ['DETERMINISTIC_CAPABILITY_FIRST'],
    });
  }

  const refs = exactRefs(input.evidence?.external_bundle_refs);
  const topology = localTopology(input.task_shape);
  const blocks = [];
  const challengers = [];
  const challengerEvidence = [];
  const reasons = [];
  const requiredActs = [];
  const requiredDisclosures = [];
  const responseProfiles = [];

  if (topology) {
    if (input.authority?.repo_read !== true) blocks.push(blocker('REPO_READ_REQUIRED', 'Local route requires repository read authority.', 'authority.repo_read'));
    if (input.authority?.repo_write_scope !== 'none') blocks.push(blocker('READ_ONLY_ROUTE_REQUIRED', 'J5 routed review is read-only.', 'authority.repo_write_scope'));
    if (input.evidence_class !== 'E0_TASK_TEXT' && input.evidence?.local_worktree_available !== true) {
      blocks.push(blocker('LOCAL_WORKTREE_REQUIRED', 'Local non-E0 routing requires the isolated Work Unit worktree.', 'evidence.local_worktree_available'));
    }
    if (input.evidence_class === 'E0_TASK_TEXT' && input.evidence?.task_text_available !== true) {
      blocks.push(blocker('TASK_TEXT_REQUIRED', 'E0 routing requires bounded task text.', 'evidence.task_text_available'));
    }

    challengers.push(topology.reviewer);
    challengerEvidence.push(evidenceEntry(
      topology.reviewer.participant_id,
      topology.reviewer.model_family,
      input.evidence_class,
      localEvidenceKind(input.evidence_class),
    ));
    responseProfiles.push(
      topology.primary.response_budget_profile_id,
      topology.reviewer.response_budget_profile_id,
    );
    reasons.push(topology.reason, 'INDEPENDENT_LOCAL_REVIEW_REQUIRED');
    if (input.review_pressure === 'high_value_uncertain') reasons.push('HIGH_VALUE_REVIEW_PRESSURE');
  } else if (input.challenge_mode === 'none') {
    blocks.push(blocker(
      'EXPLICIT_CHALLENGE_REQUIRED',
      'This task shape has no automatic local primary; explicit evidence-backed challenge is required.',
      'challenge_mode',
    ));
  }

  const external = externalChallenge(input, refs);
  const externalParticipant = external && !external.blocker ? external.participant : null;
  if (external?.blocker) {
    blocks.push(external.blocker);
  } else if (external) {
    challengers.push(external.participant);
    challengerEvidence.push(external.evidence);
    requiredActs.push(...external.required.acts);
    requiredDisclosures.push(...external.required.disclosures);
    blocks.push(...external.blocks);
    responseProfiles.push(external.participant.response_budget_profile_id);
    reasons.push(external.reason);
  }

  const primary = topology ? topology.primary : null;
  const primaryEvidence = primary
    ? evidenceEntry(primary.participant_id, primary.model_family, input.evidence_class, localEvidenceKind(input.evidence_class))
    : null;

  const hardBlockCodes = new Set([
    'REPO_READ_REQUIRED',
    'READ_ONLY_ROUTE_REQUIRED',
    'LOCAL_WORKTREE_REQUIRED',
    'TASK_TEXT_REQUIRED',
    'EXPLICIT_CHALLENGE_REQUIRED',
    'MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK',
    'LOCAL_ONLY_EVIDENCE',
    'SENSITIVE_OR_PRODUCTION_EXTERNAL_REFUSED',
    'EVIDENCE_BUNDLE_REQUIRED',
  ]);
  const authorityBlockCodes = new Set([
    'EXTERNAL_NETWORK_AUTHORITY_REQUIRED',
    'PROVIDER_SPEND_AUTHORITY_REQUIRED',
    'REPOSITORY_EXTERNAL_DISCLOSURE_REQUIRED',
  ]);

  let disposition = 'planned_local';
  if (blocks.some((b) => hardBlockCodes.has(b.code))) disposition = 'refused';
  else if (blocks.some((b) => authorityBlockCodes.has(b.code))) disposition = 'held_for_external_authority';
  else if (externalParticipant && !topology) disposition = externalParticipant.transport_posture === 'text_only_manual'
    ? 'manual_only'
    : 'external_review_proposed';
  else if (externalParticipant) disposition = 'local_review_with_external_challenge_proposed';

  return deepFreeze({
    route_version: ROUTE_VERSION,
    governing_law: GOVERNING_LAW,
    deterministic: { selected: false, capability: input.deterministic?.capability ?? null },
    evidence_class: input.evidence_class,
    task_shape: input.task_shape,
    review_pressure: input.review_pressure,
    challenge_mode: input.challenge_mode,
    frontier_posture: input.frontier_posture,
    primary,
    challengers,
    review_policy: {
      local: topology ? 'independent_local_second' : 'none',
      external: externalParticipant
        ? (externalParticipant.transport_posture === 'text_only_manual' ? 'manual_frontier_proposed' : 'external_challenge_proposed')
        : 'none',
    },
    evidence_policy: { primary: primaryEvidence, challengers: challengerEvidence },
    required_authority: {
      acts: unique(requiredActs),
      disclosures: unique(requiredDisclosures),
    },
    granted_authority: [],
    response_budget_profiles: unique(responseProfiles),
    execution_disposition: disposition,
    execution_authorized: false,
    blockers: blocks,
    routing_reason_codes: reasons,
  });
}

export const routeIntelligence = routeIntelligenceJ5V1;
