// JARVIS — minimal cost router (Alpha).
//
// Routing law (founder directive 2026-08-11, Minimal Router -> Desktop Alpha):
//   IF task can be answered by a deterministic capability -> C0
//   ELSE IF task is bounded and fits the local worker      -> C1
//   ELSE                                                    -> C3
//
// Deliberately NOT an intent classifier. It does not read task prose and
// guess. A task states its own capability (checked against the real
// deterministic.mjs registry) or declares itself bounded_for_local. Anything
// else escalates. No C2 lane exists at this stage (no Kimi/DeepSeek/GPT-OSS
// dependency for Alpha).
import { CAPABILITIES } from './deterministic.mjs';
import { OPENCODE_PROVIDERS } from './opencode-provider.mjs';

export const COST_CLASS = { C0: 'deterministic', C1: 'local_model', C3: 'frontier_model' };

// Alpha bound: keep local-worker packets small enough that a 65536-token
// context window (scripts/ain-delegate.sh's CLAUDE_CODE_MAX_CONTEXT_TOKENS
// for the local lane) is never in question. This router does not itself
// invoke a model — callers who select C1 are responsible for staying under
// this bound and shrinking on CONTEXT_OVERFLOW, never escalating for that
// reason alone (explicit founder instruction).
export const C1_MAX_INPUT_CHARS = 4000;

/**
 * @param {object} task
 * @param {string} [task.capability] - a name to check against deterministic.mjs's CAPABILITIES
 * @param {boolean} [task.bounded_for_local] - caller asserts the task is small and local-worker-shaped
 * @param {number} [task.input_chars] - size of the actual input, checked against C1_MAX_INPUT_CHARS
 * @returns {{execution_lane: 'C0'|'C1'|'C3', cost_class: string, reason: string, task: object, status: 'routed', verification_required: boolean}}
 */
export function route(task) {
  if (task.capability && Object.prototype.hasOwnProperty.call(CAPABILITIES, task.capability)) {
    return {
      execution_lane: 'C0',
      cost_class: COST_CLASS.C0,
      reason: `Deterministic capability '${task.capability}' is registered; no model required.`,
      task,
      status: 'routed',
      verification_required: true,
    };
  }

  if (task.bounded_for_local === true) {
    const size = task.input_chars ?? 0;
    if (size > C1_MAX_INPUT_CHARS) {
      // Explicit founder rule: do not escalate merely because the packet is
      // oversized. The caller must shrink it. Routing itself refuses rather
      // than silently promoting to C3.
      return {
        execution_lane: null,
        cost_class: null,
        reason: `Task declared bounded_for_local but input_chars (${size}) exceeds C1_MAX_INPUT_CHARS (${C1_MAX_INPUT_CHARS}). Shrink the packet — do not escalate for size alone.`,
        task,
        status: 'rejected_oversized',
        verification_required: false,
      };
    }
    return {
      execution_lane: 'C1',
      cost_class: COST_CLASS.C1,
      reason: 'Task is bounded and local-worker-shaped; no deterministic capability applies.',
      task,
      status: 'routed',
      verification_required: true,
    };
  }

  return {
    execution_lane: 'C3',
    cost_class: COST_CLASS.C3,
    reason: 'No deterministic capability matched and task is not declared bounded-for-local; requires frontier-model reasoning.',
    task,
    status: 'routed',
    verification_required: true,
  };
}

// ── JARVIS-ROUTER-01: model-level routing plan ─────────────────────────────
// This is additive to route(task). The Alpha C0/C1/C3 law remains unchanged.
// The planner reads STRUCTURED task metadata only; it never classifies free prose.

export const ROUTING_PROFILES = Object.freeze(['local-first', 'external-deep']);
export const REVIEW_POLICIES = Object.freeze(['auto', 'none', 'local', 'adversarial']);
export const EXTERNAL_SAFE_DATA_CLASSES = Object.freeze([
  'synthetic', 'public', 'repo_nonconfidential',
]);

const CODE_TASK_CLASSES = new Set(['implementation', 'testing', 'migration']);
const REASONING_TASK_CLASSES = new Set([
  'architecture', 'security', 'governance', 'verification', 'archaeology',
  'independent_evaluation', 'provider_evaluation', 'bounded_repair_review',
]);
const HIGH_ASSURANCE_TASK_CLASSES = new Set([
  'architecture', 'security', 'governance', 'independent_evaluation',
]);

const norm = (value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const hasExternalAuthority = (e) => e?.external_network === true && e?.provider_spend === true;
const isExternalSafe = (dataClass) => EXTERNAL_SAFE_DATA_CLASSES.includes(dataClass);
const highRisk = (risk) => risk && !['mechanical', 'low', 'routine'].includes(risk);

function providerCard(providerId, role, evidencePolicy) {
  const spec = OPENCODE_PROVIDERS[providerId];
  if (!spec) throw new Error(`ROUTER_PROVIDER_NOT_REGISTERED:${providerId}`);
  return Object.freeze({
    provider_id: providerId,
    model_ref: `${spec.opencode_provider}/${spec.default_model}`,
    execution_adapter: spec.execution_adapter,
    provider_standing: spec.standing,
    role,
    evidence_policy: evidencePolicy,
    external_network: spec.external_network,
    metered_provider: spec.metered_provider,
  });
}

function localRoleFor(taskClass) {
  if (CODE_TASK_CLASSES.has(taskClass)) return 'qwen-local';
  if (REASONING_TASK_CLASSES.has(taskClass)) return 'gpt-oss-local';
  return null;
}

function localChallengerFor(primaryId) {
  if (primaryId === 'qwen-local') return 'gpt-oss-local';
  if (primaryId === 'gpt-oss-local') return 'qwen-local';
  return null;
}

function advancementFor(taskClass) {
  if (taskClass === 'governance') {
    return Object.freeze({
      model_output_sufficient: false,
      output_standing: 'GOVERNANCE_ADVISORY_ONLY',
      next_gate: 'governance_gate',
      may_reach: 'PAUSED_FOR_GOVERNANCE',
      rule: 'Only an authenticated resolver with the required role may close the governance question.',
    });
  }
  if (CODE_TASK_CLASSES.has(taskClass)) {
    return Object.freeze({
      model_output_sufficient: false,
      output_standing: 'CANDIDATE_EXECUTION',
      next_gate: 'independent_verification',
      may_reach: 'READY_TO_INTEGRATE_AFTER_VERIFICATION',
      rule: 'Worker output never advances the Work Unit by itself; independent checks must pass.',
    });
  }
  return Object.freeze({
    model_output_sufficient: false,
    output_standing: 'ADVISORY_EVIDENCE',
    next_gate: 'epistemic_guard',
    may_reach: 'CLAIM_REVIEW',
    rule: 'Model agreement is not proof; claim status advances only when probative evidence survives epistemic adjudication.',
  });
}

/**
 * Plan WHICH models may participate in a Work Unit. This function never invokes
 * a provider and never broadens authority. External calls require BOTH Work Unit
 * authority and explicit task-level external routing intent.
 *
 * Structured task fields:
 *   task_class, risk_class, routing_profile, review_policy, data_class,
 *   external_review, external_tiebreaker
 */
export function planModelRoute(task = {}, opts = {}) {
  const deterministic = task.capability
    && Object.prototype.hasOwnProperty.call(CAPABILITIES, task.capability);
  if (deterministic) {
    return Object.freeze({
      status: 'deterministic',
      cost_route: 'C0',
      primary: null, challengers: [], escalation: null,
      evidence: { policy: 'deterministic_capability_only' },
      advancement: Object.freeze({
        model_output_sufficient: false,
        output_standing: 'NO_MODEL_OUTPUT',
        next_gate: 'independent_verification',
        may_reach: 'VERIFIED_RESULT',
        rule: 'No model participates in a registered deterministic capability.',
      }),
      reasons: [`deterministic capability '${task.capability}' is registered`],
    });
  }

  const taskClass = norm(task.task_class);
  if (!taskClass || (!CODE_TASK_CLASSES.has(taskClass) && !REASONING_TASK_CLASSES.has(taskClass))) {
    return Object.freeze({
      status: 'needs_routing_metadata',
      reason: `task_class '${task.task_class ?? ''}' is not a registered model-routing class`,
      primary: null, challengers: [], escalation: null,
    });
  }

  const profile = norm(task.routing_profile || 'local-first').replaceAll('_', '-');
  if (!ROUTING_PROFILES.includes(profile)) {
    return Object.freeze({ status: 'needs_routing_metadata', reason: `unknown routing_profile '${profile}'`, primary: null, challengers: [], escalation: null });
  }
  const reviewPolicy = norm(task.review_policy || 'auto');
  if (!REVIEW_POLICIES.includes(reviewPolicy)) {
    return Object.freeze({ status: 'needs_routing_metadata', reason: `unknown review_policy '${reviewPolicy}'`, primary: null, challengers: [], escalation: null });
  }

  const risk = norm(task.risk_class || 'mechanical');
  const dataClass = norm(task.data_class || 'unspecified');
  const envelope = opts.permissionEnvelope ?? task.permission_envelope ?? {};
  const externalAuthority = hasExternalAuthority(envelope);
  const externalSafe = isExternalSafe(dataClass);
  const reasons = [];

  // External-deep is explicit and never silently downgraded to a local route.
  if (profile === 'external-deep') {
    if (!externalAuthority) {
      return Object.freeze({
        status: 'external_authority_required',
        reason: 'external-deep requires network.external + provider.spend',
        primary: null, challengers: [], escalation: null,
        advancement: advancementFor(taskClass),
      });
    }
    if (!externalSafe) {
      return Object.freeze({
        status: 'external_evidence_refused',
        reason: `data_class '${dataClass}' is not eligible for external providers`,
        primary: null, challengers: [], escalation: null,
        advancement: advancementFor(taskClass),
      });
    }
    return Object.freeze({
      status: 'planned',
      cost_route: 'C3',
      routing_profile: profile,
      primary: providerCard('nemotron-tinker', 'deep_reasoner', 'external_bounded_nonconfidential'),
      challengers: [providerCard('inkling-tinker', 'adversarial_challenger', 'external_bounded_nonconfidential')],
      escalation: null,
      evidence: { data_class: dataClass, external_eligible: true, policy: 'bounded_allowed_files_no_tools' },
      advancement: advancementFor(taskClass),
      reasons: ['explicit external-deep profile selected', 'external authority and data-class eligibility both passed'],
    });
  }

  // Default: local-first. Provider spend is never triggered merely because it is available.
  const primaryId = localRoleFor(taskClass);
  const primaryRole = CODE_TASK_CLASSES.has(taskClass) ? 'code_worker' : 'reasoning_worker';
  const primary = providerCard(primaryId, primaryRole, 'local_worktree_bounded');
  const challengers = [];

  const autoChallenge = HIGH_ASSURANCE_TASK_CLASSES.has(taskClass) || highRisk(risk);
  const localChallengeRequired = reviewPolicy === 'local'
    || reviewPolicy === 'adversarial'
    || (reviewPolicy === 'auto' && autoChallenge);
  if (localChallengeRequired) {
    const challengerId = localChallengerFor(primaryId);
    if (challengerId) challengers.push(providerCard(challengerId, 'local_challenger', 'local_worktree_bounded'));
  }

  let externalReview = null;
  if (task.external_review === true || reviewPolicy === 'adversarial') {
    if (!externalAuthority) {
      externalReview = { status: 'deferred_authority', reason: 'external review requested but network.external + provider.spend are not both authorized' };
    } else if (!externalSafe) {
      externalReview = { status: 'refused_evidence', reason: `data_class '${dataClass}' is not eligible for external providers` };
    } else {
      const inkling = providerCard('inkling-tinker', 'adversarial_challenger', 'external_bounded_nonconfidential');
      challengers.push(inkling);
      externalReview = { status: 'scheduled', provider_id: inkling.provider_id };
    }
  }

  let escalation = null;
  if (task.external_tiebreaker === true) {
    if (externalAuthority && externalSafe) {
      escalation = Object.freeze({
        trigger: 'material_disagreement',
        provider: providerCard('nemotron-tinker', 'disagreement_reasoner', 'external_bounded_nonconfidential'),
        automatic: false,
        rule: 'A disagreement may nominate Nemotron; execution still requires the Work Unit attempt budget and provider-spend authority.',
      });
    } else {
      escalation = Object.freeze({ trigger: 'material_disagreement', provider: null, automatic: false, rule: 'External tiebreaker requested but authority/data eligibility is absent.' });
    }
  }

  reasons.push(`task_class '${taskClass}' maps to local primary '${primaryId}'`);
  if (localChallengeRequired) reasons.push('risk/review policy requires an independent local challenger');
  if (externalReview?.status === 'scheduled') reasons.push('explicit external review request admitted Inkling after authority + data-class checks');

  return Object.freeze({
    status: externalReview?.status?.startsWith('deferred') || externalReview?.status?.startsWith('refused')
      ? 'planned_with_review_blocker' : 'planned',
    cost_route: 'C1',
    routing_profile: profile,
    primary,
    challengers: Object.freeze(challengers),
    external_review: externalReview,
    escalation,
    evidence: Object.freeze({
      data_class: dataClass,
      external_eligible: externalSafe,
      local_policy: 'work_unit_allowed_files_and_context_selectors',
      external_policy: 'bounded_allowed_files_no_tools',
    }),
    advancement: advancementFor(taskClass),
    disagreement_policy: 'STOP_AND_REVIEW',
    reasons: Object.freeze(reasons),
  });
}
