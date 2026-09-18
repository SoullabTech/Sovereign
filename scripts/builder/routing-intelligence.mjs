/**
 * JARVIS Routing Intelligence — pure deterministic capability selection.
 *
 * R2 boundary:
 * - no imports
 * - no filesystem or network access
 * - no credential-store or environment inspection
 * - no provider calls
 * - no Work Unit mutation
 * - no authority mutation
 *
 * This module returns inspectable route evidence only.
 */

export const ROUTE_VERSION = 'R1.v1';

const TASK_SHAPES = Object.freeze(['mechanical_code', 'deep_reasoning']);
const REVIEW_PRESSURES = Object.freeze(['ordinary', 'high_value_uncertain']);
const CHALLENGE_MODES = Object.freeze(['none', 'adversarial', 'frontier']);
const FRONTIER_POSTURES = Object.freeze(['none', 'text_only_manual', 'repository_grounded']);
const WRITE_SCOPES = Object.freeze(['none', 'worktree']);

const PROVIDERS = Object.freeze({
  QWEN: 'qwen-local',
  GPT_OSS: 'gpt-oss-local',
  INKLING: 'inkling-tinker',
  NEMOTRON_TINKER: 'nemotron-tinker',
  NEMOTRON_ZEN: 'nemotron-zen',
});
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function enumOk(value, allowed) {
  return allowed.includes(value);
}

function exactRefs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
}

function blocker(code, detail) {
  return Object.freeze({ code, detail });
}

function authorityRecord(acts = [], disclosures = []) {
  return Object.freeze({
    acts: Object.freeze([...acts]),
    disclosures: Object.freeze([...disclosures]),
  });
}

function evidenceEntry(providerId, kind) {
  return Object.freeze({ provider_id: providerId, kind });
}
function refusedRecord(input, blockers, reasons = ['INVALID_ROUTING_INPUT']) {
  return deepFreeze({
    route_version: ROUTE_VERSION,
    task_shape: input?.task_shape ?? null,
    review_pressure: input?.review_pressure ?? null,
    challenge_mode: input?.challenge_mode ?? null,
    primary: null,
    challengers: [],
    review_policy: { local: null, external: null },
    evidence_policy: { primary: null, challengers: [] },
    required_authority: authorityRecord(),
    granted_authority: [],
    execution_disposition: 'refused',
    blockers,
    routing_reason_codes: reasons,
  });
}

function validateInput(input) {
  const blocks = [];
  if (!input || typeof input !== 'object') {
    return [blocker('ROUTE_INPUT_REQUIRED', 'Structured route input is required.')];
  }

  if (!enumOk(input.task_shape, TASK_SHAPES)) {
    blocks.push(blocker('INVALID_TASK_SHAPE', 'task_shape must be mechanical_code or deep_reasoning.'));
  }
  if (!enumOk(input.review_pressure, REVIEW_PRESSURES)) {
    blocks.push(blocker('INVALID_REVIEW_PRESSURE', 'review_pressure is not recognized.'));
  }
  if (!enumOk(input.challenge_mode, CHALLENGE_MODES)) {
    blocks.push(blocker('INVALID_CHALLENGE_MODE', 'challenge_mode is not recognized.'));
  }
  if (!enumOk(input.frontier_posture, FRONTIER_POSTURES)) {
    blocks.push(blocker('INVALID_FRONTIER_POSTURE', 'frontier_posture is not recognized.'));
  }

  if (input.challenge_mode === 'frontier' && input.frontier_posture === 'none') {
    blocks.push(blocker('FRONTIER_POSTURE_REQUIRED', 'Frontier routing requires an explicit frontier posture.'));
  }
  if (input.challenge_mode !== 'frontier' && input.frontier_posture !== 'none') {
    blocks.push(blocker('CONTRADICTORY_FRONTIER_POSTURE', 'Only frontier challenge mode may carry a frontier posture.'));
  }

  const scope = input.authority?.repo_write_scope;
  if (!enumOk(scope, WRITE_SCOPES)) {
    blocks.push(blocker('INVALID_REPO_WRITE_SCOPE', 'repo_write_scope must be none or worktree.'));
  }

  if (input.evidence != null && typeof input.evidence !== 'object') {
    blocks.push(blocker('INVALID_EVIDENCE', 'evidence must be a structured object.'));
  }
  if (input.authority != null && typeof input.authority !== 'object') {
    blocks.push(blocker('INVALID_AUTHORITY', 'authority must be a structured object.'));
  }
  if (input.work_unit != null && typeof input.work_unit !== 'object') {
    blocks.push(blocker('INVALID_WORK_UNIT', 'work_unit must be a structured object.'));
  }
  return blocks;
}

function localPrerequisiteBlockers(input) {
  const blocks = [];
  if (input.authority?.repo_read !== true) {
    blocks.push(blocker('REPO_READ_REQUIRED', 'Local Work Unit review requires existing repo.read authority.'));
  }
  if (input.authority?.repo_write_scope !== 'none') {
    blocks.push(blocker('READ_ONLY_ROUTE_REQUIRED', 'Routing Intelligence V1 admits review-only Work Units.'));
  }
  if (input.evidence?.local_worktree_available !== true) {
    blocks.push(blocker('LOCAL_WORKTREE_REQUIRED', 'Local review requires the isolated Work Unit worktree.'));
  }
  return blocks;
}

function localPlan(input) {
  const independent =
    input.review_pressure === 'high_value_uncertain'
    || input.work_unit?.explicit_independent_review === true
    || input.task_shape === 'deep_reasoning';

  if (input.task_shape === 'mechanical_code') {
    return {
      primary: PROVIDERS.QWEN,
      primaryRole: 'mechanical_primary',
      localReview: independent ? 'independent_local_second' : 'single_mechanical',
      localChallenger: independent ? PROVIDERS.GPT_OSS : null,
      reasons: independent
        ? ['MECHANICAL_QWEN_PRIMARY', 'INDEPENDENT_LOCAL_REVIEW_REQUIRED']
        : ['MECHANICAL_QWEN_PRIMARY', 'SINGLE_MECHANICAL_FAST_PATH'],
    };
  }

  return {
    primary: PROVIDERS.GPT_OSS,
    primaryRole: 'deep_reasoning_primary',
    localReview: 'independent_local_second',
    localChallenger: PROVIDERS.QWEN,
    reasons: ['DEEP_REASONING_GPT_OSS_PRIMARY', 'INDEPENDENT_LOCAL_REVIEW_REQUIRED'],
  };
}
function externalPlan(input, refs) {
  if (input.challenge_mode === 'none') {
    return {
      challenger: null,
      externalReview: 'none',
      evidenceKind: null,
      requiredActs: [],
      requiredDisclosures: [],
      blockers: [],
      reasons: [],
      challengerDisposition: null,
      routeDisposition: null,
    };
  }

  if (input.challenge_mode === 'frontier' && input.frontier_posture === 'text_only_manual') {
    const blocks = [];
    if (input.evidence?.task_text_available !== true) {
      blocks.push(blocker('TASK_TEXT_REQUIRED', 'Manual Zen frontier reasoning requires founder-approved task text.'));
    }
    return {
      challenger: PROVIDERS.NEMOTRON_ZEN,
      externalReview: 'manual_frontier_proposed',
      evidenceKind: 'task_text_only',
      requiredActs: ['network.external'],
      requiredDisclosures: [],
      blockers: blocks,
      reasons: ['ZEN_TEXT_ONLY_MANUAL'],
      challengerDisposition: blocks.length ? 'refused' : 'manual_only',
      routeDisposition: blocks.length ? 'refused' : 'manual_only',
    };
  }
  const isAdversarial = input.challenge_mode === 'adversarial';
  const challenger = isAdversarial ? PROVIDERS.INKLING : PROVIDERS.NEMOTRON_TINKER;
  const blocks = [];

  if (refs.length === 0) {
    blocks.push(blocker(
      'EVIDENCE_BUNDLE_REQUIRED',
      'Repository-grounded external review requires exact bounded evidence refs.',
    ));
  }

  const missingAuthority = [];
  if (input.authority?.network_external !== true) {
    missingAuthority.push(blocker('EXTERNAL_NETWORK_AUTHORITY_REQUIRED', 'network.external is not authorized.'));
  }
  if (input.authority?.provider_spend !== true) {
    missingAuthority.push(blocker('PROVIDER_SPEND_AUTHORITY_REQUIRED', 'provider.spend is not authorized.'));
  }
  if (input.authority?.repository_external_disclosure !== true) {
    missingAuthority.push(blocker(
      'REPOSITORY_EXTERNAL_DISCLOSURE_REQUIRED',
      'External repository evidence disclosure is not authorized.',
    ));
  }

  blocks.push(...missingAuthority);
  const hasEvidenceFailure = blocks.some((b) => b.code === 'EVIDENCE_BUNDLE_REQUIRED');
  const challengerDisposition = hasEvidenceFailure
    ? 'refused'
    : (missingAuthority.length ? 'held_for_external_authority' : 'explicit_external_act_required');

  return {
    challenger,
    externalReview: 'external_challenge_proposed',
    evidenceKind: 'exact_external_bundle',
    requiredActs: ['network.external', 'provider.spend'],
    requiredDisclosures: ['repository_external_disclosure'],
    blockers: blocks,
    reasons: [isAdversarial ? 'INKLING_ADVERSARIAL_CHALLENGE' : 'NEMOTRON_TINKER_FRONTIER_CHALLENGE'],
    challengerDisposition,
    routeDisposition: hasEvidenceFailure
      ? 'refused'
      : (missingAuthority.length ? 'held_for_external_authority' : null),
  };
}

/**
 * Pure deterministic capability routing.
 * Extra ambient fields are deliberately ignored.
 */
export function routeIntelligence(input) {
  const validation = validateInput(input);
  if (validation.length) return refusedRecord(input, validation);

  const refs = exactRefs(input.evidence?.external_bundle_refs);
  const local = localPlan(input);
  const localBlocks = localPrerequisiteBlockers(input);
  const external = externalPlan(input, refs);

  const challengers = [];
  const challengerEvidence = [];

  if (local.localChallenger) {
    challengers.push({
      provider_id: local.localChallenger,
      role: 'independent_local_challenger',
      execution_disposition: localBlocks.length ? 'refused' : 'admitted_local',
    });
    challengerEvidence.push(evidenceEntry(local.localChallenger, 'local_worktree_read_only'));
  }
  if (external.challenger) {
    challengers.push({
      provider_id: external.challenger,
      role: input.challenge_mode === 'adversarial' ? 'adversarial_challenger' : 'frontier_challenger',
      execution_disposition: external.challengerDisposition,
    });
    challengerEvidence.push(evidenceEntry(external.challenger, external.evidenceKind));
  }

  const allBlocks = [...localBlocks, ...external.blockers];
  let executionDisposition = 'admitted_local';
  if (localBlocks.length) executionDisposition = 'refused';
  else if (external.routeDisposition) executionDisposition = external.routeDisposition;

  const requiredAuthority = authorityRecord(
    external.requiredActs,
    external.requiredDisclosures,
  );

  return deepFreeze({
    route_version: ROUTE_VERSION,
    task_shape: input.task_shape,
    review_pressure: input.review_pressure,
    challenge_mode: input.challenge_mode,
    primary: {
      provider_id: local.primary,
      role: local.primaryRole,
      execution_disposition: localBlocks.length ? 'refused' : 'admitted_local',
    },
    challengers,
    review_policy: {
      local: local.localReview,
      external: external.externalReview,
    },
    evidence_policy: {
      primary: evidenceEntry(local.primary, 'local_worktree_read_only'),
      challengers: challengerEvidence,
    },
    required_authority: requiredAuthority,
    granted_authority: [],
    execution_disposition: executionDisposition,
    blockers: allBlocks,
    routing_reason_codes: [...local.reasons, ...external.reasons],
  });
}

function isHardStop(attempt) {
  return attempt?.status === 'failed'
    || attempt?.status === 'refused'
    || attempt?.recommended_next_action === 'reject'
    || attempt?.evidence_sufficient === false
    || attempt?.escalation_required === true;
}

function completedClean(attempt) {
  return attempt?.status === 'completed'
    && attempt?.recommended_next_action !== 'reject'
    && attempt?.evidence_sufficient !== false
    && attempt?.escalation_required !== true;
}

/**
 * Pure post-attempt strategy reconciliation.
 * It never invokes the returned next provider.
 */
export function reconcileRoutingAttempts(route, attempts = []) {
  const list = Array.isArray(attempts) ? attempts : [];
  if (!route || route.execution_disposition === 'refused') {
    return deepFreeze({
      standing: 'REFUSED',
      next_provider: null,
      founder_review_required: false,
      reason: 'Route is not executable.',
    });
  }
  const hardStop = list.find(isHardStop);
  if (hardStop) {
    return deepFreeze({
      standing: 'STOPPED',
      next_provider: null,
      founder_review_required: hardStop.escalation_required === true,
      reason: 'Provider cascade stopped by failed, refused, rejected, insufficient, or escalated attempt.',
    });
  }

  if (list.some((a) => a?.structured_disagreement === true)) {
    return deepFreeze({
      standing: 'FOUNDER_REVIEW_REQUIRED',
      next_provider: null,
      founder_review_required: true,
      reason: 'Independent reviewers disagree; JARVIS cannot choose a semantic winner.',
    });
  }

  const clean = list.filter(completedClean);
  if (clean.length === 0) {
    return deepFreeze({
      standing: 'NOT_RUN',
      next_provider: route.primary?.provider_id ?? null,
      founder_review_required: false,
      reason: 'No clean provider attempt has completed.',
    });
  }

  if (route.review_policy?.local === 'single_mechanical') {
    return deepFreeze({
      standing: 'LOCAL_REVIEW_COMPLETE',
      next_provider: null,
      founder_review_required: false,
      reason: 'The ratified route permits one mechanically falsifiable local review.',
    });
  }
  const localSecond = route.challengers?.find(
    (c) => c.role === 'independent_local_challenger',
  );

  const secondCompleted = localSecond
    ? clean.some((a) => a?.provider_id === localSecond.provider_id)
    : false;

  if (localSecond && !secondCompleted) {
    return deepFreeze({
      standing: 'SECOND_LOCAL_REVIEW_OWED',
      next_provider: localSecond.provider_id,
      founder_review_required: false,
      reason: 'The route policy requires an independent local second review.',
    });
  }

  return deepFreeze({
    standing: 'LOCAL_EVIDENCE_PRESENTED',
    next_provider: null,
    founder_review_required: true,
    reason: 'Required local reviews completed; semantic acceptance remains a founder act.',
  });
}

export const ROUTING_ENUMS = deepFreeze({
  task_shapes: TASK_SHAPES,
  review_pressures: REVIEW_PRESSURES,
  challenge_modes: CHALLENGE_MODES,
  frontier_postures: FRONTIER_POSTURES,
});
