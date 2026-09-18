#!/usr/bin/env node
/**
 * JARVIS Routing Intelligence — J6 pure routing law.
 *
 * This module plans intelligence attempts. It does not call models, read credentials,
 * acquire worktrees, spend provider funds, disclose evidence, merge, deploy, or mutate
 * a Work Unit. A route decision is capability/evidence planning only.
 */
import { CAPABILITIES } from './deterministic.mjs';

export const ROUTING_LAW = 'JARVIS-ROUTING-INTELLIGENCE-01/J5';

export const EVIDENCE_CLASSES = Object.freeze({
  TASK_TEXT: 'E0_TASK_TEXT',
  REPOSITORY_LOCAL: 'E1_REPOSITORY_LOCAL',
  CONTINUITY_LOCAL: 'E2_CONTINUITY_LOCAL',
  EXTERNAL_REPO_BUNDLE: 'E3_EXTERNAL_REPO_BUNDLE',
  SENSITIVE_OR_PRODUCTION: 'E4_SENSITIVE_OR_PRODUCTION',
});

export const TASK_SHAPES = Object.freeze({
  CODE_GROUNDED: 'CODE_GROUNDED',
  ARCHITECTURE_REASONING: 'ARCHITECTURE_REASONING',
  ADVERSARIAL_FALSIFICATION: 'ADVERSARIAL_FALSIFICATION',
  LONG_HORIZON_DECOMPOSITION: 'LONG_HORIZON_DECOMPOSITION',
  EVIDENCE_SYNTHESIS: 'EVIDENCE_SYNTHESIS',
  FRONTIER_UNKNOWN: 'FRONTIER_UNKNOWN',
});

export const MODEL_FAMILIES = Object.freeze({
  QWEN: 'QWEN',
  GPT_OSS: 'GPT_OSS',
  INKLING: 'INKLING',
  NEMOTRON: 'NEMOTRON',
});

const ALL_SHAPES = new Set(Object.values(TASK_SHAPES));
const ALL_EVIDENCE = new Set(Object.values(EVIDENCE_CLASSES));
const ALL_FAMILIES = new Set(Object.values(MODEL_FAMILIES));

export const MODEL_PROFILES = Object.freeze({
  [MODEL_FAMILIES.QWEN]: Object.freeze({
    locality: 'local',
    primary_for: Object.freeze([TASK_SHAPES.CODE_GROUNDED]),
    reviewer_for: Object.freeze([TASK_SHAPES.ARCHITECTURE_REASONING, TASK_SHAPES.EVIDENCE_SYNTHESIS]),
    transports: Object.freeze(['qwen-local']),
  }),
  [MODEL_FAMILIES.GPT_OSS]: Object.freeze({
    locality: 'local',
    primary_for: Object.freeze([TASK_SHAPES.ARCHITECTURE_REASONING, TASK_SHAPES.EVIDENCE_SYNTHESIS]),
    reviewer_for: Object.freeze([TASK_SHAPES.CODE_GROUNDED]),
    transports: Object.freeze(['gpt-oss-local']),
  }),
  [MODEL_FAMILIES.INKLING]: Object.freeze({
    locality: 'external',
    primary_for: Object.freeze([]),
    reviewer_for: Object.freeze([
      TASK_SHAPES.CODE_GROUNDED,
      TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
      TASK_SHAPES.LONG_HORIZON_DECOMPOSITION,
      TASK_SHAPES.EVIDENCE_SYNTHESIS,
    ]),
    transports: Object.freeze(['inkling-tinker']),
  }),
  [MODEL_FAMILIES.NEMOTRON]: Object.freeze({
    locality: 'external',
    primary_for: Object.freeze([]),
    reviewer_for: Object.freeze([
      TASK_SHAPES.ARCHITECTURE_REASONING,
      TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
      TASK_SHAPES.LONG_HORIZON_DECOMPOSITION,
      TASK_SHAPES.EVIDENCE_SYNTHESIS,
    ]),
    transports: Object.freeze(['nemotron-tinker']),
  }),
});

export const RESPONSE_BUDGET_PROFILES = Object.freeze({
  'qwen-local': Object.freeze({
    profile_id: 'LOCAL_QWEN_EXISTING_ADAPTER',
    enforcement: 'adapter-managed',
    max_output_tokens: null,
    auto_expand: false,
    note: 'J6 plans the local review but does not invent an unproven OpenCode output-token flag.',
  }),
  'gpt-oss-local': Object.freeze({
    profile_id: 'LOCAL_GPT_OSS_EXISTING_ADAPTER',
    enforcement: 'adapter-managed',
    max_output_tokens: null,
    reasoning_posture: 'low',
    auto_expand: false,
    note: 'GPT-OSS requires its proven local chat/reasoning semantics; J6 does not invent an OpenCode output-token flag.',
  }),
  'inkling-tinker': Object.freeze({
    profile_id: 'INKLING_TINKER_J3B_R1',
    enforcement: 'transport',
    max_output_tokens: 4096,
    auto_expand: false,
    evidence: 'J3-B-R1 Inkling B4 completed at 2001 provider output tokens under a 4096 ceiling.',
  }),
  'nemotron-tinker': Object.freeze({
    profile_id: 'NEMOTRON_TINKER_J3B_R1',
    enforcement: 'transport',
    max_output_tokens: 4096,
    auto_expand: false,
    evidence: 'J3-B-R1 Nemotron B2-B5 completed at 2209-2974 provider output tokens under a 4096 ceiling; CODE_GROUNDED remains ineligible.',
  }),
});

export const LOCAL_TOPOLOGY = Object.freeze({
  [TASK_SHAPES.CODE_GROUNDED]: Object.freeze({
    primary: MODEL_FAMILIES.QWEN,
    independent_review: MODEL_FAMILIES.GPT_OSS,
  }),
  [TASK_SHAPES.ARCHITECTURE_REASONING]: Object.freeze({
    primary: MODEL_FAMILIES.GPT_OSS,
    independent_review: MODEL_FAMILIES.QWEN,
  }),
  [TASK_SHAPES.EVIDENCE_SYNTHESIS]: Object.freeze({
    primary: MODEL_FAMILIES.GPT_OSS,
    independent_review: MODEL_FAMILIES.QWEN,
  }),
});

function frozen(value) {
  return Object.freeze(value);
}

function normalizedToken(value) {
  return String(value || '').trim().toUpperCase().replace(/[-\s]+/g, '_');
}

export function normalizeEvidenceClass(value) {
  const raw = String(value || '').trim();
  if (ALL_EVIDENCE.has(raw)) return raw;
  const token = normalizedToken(raw);
  const aliases = {
    E0: EVIDENCE_CLASSES.TASK_TEXT,
    TASK_TEXT: EVIDENCE_CLASSES.TASK_TEXT,
    E1: EVIDENCE_CLASSES.REPOSITORY_LOCAL,
    REPOSITORY_LOCAL: EVIDENCE_CLASSES.REPOSITORY_LOCAL,
    E2: EVIDENCE_CLASSES.CONTINUITY_LOCAL,
    CONTINUITY_LOCAL: EVIDENCE_CLASSES.CONTINUITY_LOCAL,
    LOCAL_ONLY: EVIDENCE_CLASSES.CONTINUITY_LOCAL,
    E3: EVIDENCE_CLASSES.EXTERNAL_REPO_BUNDLE,
    EXTERNAL_REPO_BUNDLE: EVIDENCE_CLASSES.EXTERNAL_REPO_BUNDLE,
    E4: EVIDENCE_CLASSES.SENSITIVE_OR_PRODUCTION,
    SENSITIVE_OR_PRODUCTION: EVIDENCE_CLASSES.SENSITIVE_OR_PRODUCTION,
  };
  return aliases[token] ?? EVIDENCE_CLASSES.TASK_TEXT;
}

export function classifyTaskShape(input = {}) {
  const declared = input.task_shape ?? input.taskShape ?? input.task_class ?? input.taskClass;
  const raw = String(declared || '').trim();
  if (ALL_SHAPES.has(raw)) {
    return frozen({ task_shape: raw, source: 'declared', resolved: raw !== TASK_SHAPES.FRONTIER_UNKNOWN });
  }
  const token = normalizedToken(raw);
  const aliases = {
    CODE: TASK_SHAPES.CODE_GROUNDED,
    CODE_GROUNDED: TASK_SHAPES.CODE_GROUNDED,
    ARCHITECTURE: TASK_SHAPES.ARCHITECTURE_REASONING,
    ARCHITECTURE_REASONING: TASK_SHAPES.ARCHITECTURE_REASONING,
    ADVERSARIAL: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
    ADVERSARIAL_FALSIFICATION: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
    LONG_HORIZON: TASK_SHAPES.LONG_HORIZON_DECOMPOSITION,
    LONG_HORIZON_DECOMPOSITION: TASK_SHAPES.LONG_HORIZON_DECOMPOSITION,
    EVIDENCE: TASK_SHAPES.EVIDENCE_SYNTHESIS,
    EVIDENCE_SYNTHESIS: TASK_SHAPES.EVIDENCE_SYNTHESIS,
    FRONTIER_UNKNOWN: TASK_SHAPES.FRONTIER_UNKNOWN,
  };
  const shape = aliases[token] ?? TASK_SHAPES.FRONTIER_UNKNOWN;
  return frozen({
    task_shape: shape,
    source: aliases[token] ? 'declared_alias' : 'unresolved',
    resolved: shape !== TASK_SHAPES.FRONTIER_UNKNOWN,
  });
}

export function modelFamilyFromRef(modelRef, lane = '') {
  const value = `${lane} ${modelRef || ''}`.toLowerCase();
  if (value.includes('qwen')) return MODEL_FAMILIES.QWEN;
  if (value.includes('gpt-oss') || value.includes('gpt_oss')) return MODEL_FAMILIES.GPT_OSS;
  if (value.includes('inkling')) return MODEL_FAMILIES.INKLING;
  if (value.includes('nemotron')) return MODEL_FAMILIES.NEMOTRON;
  return null;
}

export function familyEligibleForTask(family, taskShape, role = 'any') {
  if (!ALL_FAMILIES.has(family) || !ALL_SHAPES.has(taskShape)) return false;
  const profile = MODEL_PROFILES[family];
  if (role === 'primary') return profile.primary_for.includes(taskShape);
  if (role === 'reviewer') return profile.reviewer_for.includes(taskShape);
  return profile.primary_for.includes(taskShape) || profile.reviewer_for.includes(taskShape);
}

export function eligibleFamilies(taskShape) {
  return Object.values(MODEL_FAMILIES).filter((family) => familyEligibleForTask(family, taskShape));
}

export function externalCandidates(taskShape, evidenceClass) {
  if (evidenceClass === EVIDENCE_CLASSES.CONTINUITY_LOCAL || evidenceClass === EVIDENCE_CLASSES.SENSITIVE_OR_PRODUCTION) {
    return [];
  }
  return Object.values(MODEL_FAMILIES).filter((family) => {
    const profile = MODEL_PROFILES[family];
    return profile.locality === 'external' && familyEligibleForTask(family, taskShape, 'reviewer');
  });
}

function externalAuthorityBlockers(evidenceClass, permissionEnvelope = {}, metered = true) {
  const blockers = [];
  if (permissionEnvelope.external_network !== true) blockers.push('EXTERNAL_NETWORK_NOT_AUTHORIZED');
  if (evidenceClass === EVIDENCE_CLASSES.EXTERNAL_REPO_BUNDLE
      && permissionEnvelope.external_repo_disclosure !== true) {
    blockers.push('EXTERNAL_REPOSITORY_DISCLOSURE_NOT_AUTHORIZED');
  }
  if (metered && permissionEnvelope.provider_spend !== true) blockers.push('PROVIDER_SPEND_NOT_AUTHORIZED');
  return blockers;
}

export function resolveTransportForFamily({
  family,
  evidence_class,
  permission_envelope = {},
  provider_availability = {},
} = {}) {
  const evidenceClass = normalizeEvidenceClass(evidence_class);
  if (!ALL_FAMILIES.has(family)) {
    return frozen({ status: 'HOLD', family, transport: null, blockers: ['UNKNOWN_MODEL_FAMILY'] });
  }
  const profile = MODEL_PROFILES[family];
  const transport = profile.transports[0] ?? null;
  if (!transport) {
    return frozen({ status: 'HOLD', family, transport: null, blockers: ['NO_ADMISSIBLE_TRANSPORT'] });
  }

  if (profile.locality === 'local') {
    if (provider_availability[transport] === false) {
      return frozen({ status: 'HOLD', family, transport: null, blockers: ['PREFERRED_TRANSPORT_UNAVAILABLE'] });
    }
    return frozen({
      status: 'READY_LOCAL',
      family,
      transport,
      blockers: [],
      response_budget_profile: RESPONSE_BUDGET_PROFILES[transport],
    });
  }

  if (evidenceClass === EVIDENCE_CLASSES.CONTINUITY_LOCAL) {
    return frozen({ status: 'HOLD', family, transport: null, blockers: ['LOCAL_ONLY_EVIDENCE'] });
  }
  if (evidenceClass === EVIDENCE_CLASSES.SENSITIVE_OR_PRODUCTION) {
    return frozen({ status: 'HOLD', family, transport: null, blockers: ['SENSITIVE_OR_PRODUCTION_OUT_OF_SCOPE'] });
  }
  if (provider_availability[transport] !== true) {
    return frozen({ status: 'HOLD', family, transport: null, blockers: ['PREFERRED_TRANSPORT_UNAVAILABLE'] });
  }

  const blockers = externalAuthorityBlockers(evidenceClass, permission_envelope, true);
  if (blockers.length) return frozen({ status: 'HOLD', family, transport: null, blockers });

  return frozen({
    status: 'READY_FOR_EXPLICIT_EXTERNAL_EXECUTION',
    family,
    transport,
    blockers: [],
    response_budget_profile: RESPONSE_BUDGET_PROFILES[transport],
  });
}

export function planRouting(input = {}) {
  const capability = String(input.capability || '').trim() || null;
  const evidenceClass = normalizeEvidenceClass(input.evidence_class ?? input.evidenceClass);
  const task = classifyTaskShape(input);
  const deterministic = capability && Object.prototype.hasOwnProperty.call(CAPABILITIES, capability);

  if (deterministic) {
    return frozen({
      law: ROUTING_LAW,
      status: 'DETERMINISTIC',
      execution_lane: 'C0',
      deterministic_capability: capability,
      evidence_class: evidenceClass,
      task_shape: task.task_shape,
      eligible_model_families: [],
      primary_model_family: null,
      independent_review_model_family: null,
      external_candidates: [],
      selected_external_family: null,
      selected_transport: null,
      response_budget_profile: null,
      blockers: [],
      execution_authorized: false,
      provenance: frozen({
        deterministic_capability_considered: true,
        deterministic_capability_selected: capability,
        task_shape_source: task.source,
        evidence_class: evidenceClass,
        held_reason: null,
      }),
    });
  }

  if (evidenceClass === EVIDENCE_CLASSES.SENSITIVE_OR_PRODUCTION) {
    return frozen({
      law: ROUTING_LAW,
      status: 'HOLD',
      execution_lane: null,
      deterministic_capability: capability,
      evidence_class: evidenceClass,
      task_shape: task.task_shape,
      eligible_model_families: [],
      primary_model_family: null,
      independent_review_model_family: null,
      external_candidates: [],
      selected_external_family: null,
      selected_transport: null,
      response_budget_profile: null,
      blockers: ['SENSITIVE_OR_PRODUCTION_OUT_OF_SCOPE'],
      execution_authorized: false,
      provenance: frozen({
        deterministic_capability_considered: true,
        deterministic_capability_selected: null,
        task_shape_source: task.source,
        evidence_class: evidenceClass,
        held_reason: 'SENSITIVE_OR_PRODUCTION_OUT_OF_SCOPE',
      }),
    });
  }

  const topology = LOCAL_TOPOLOGY[task.task_shape] ?? null;
  const eligible = eligibleFamilies(task.task_shape);
  const external = externalCandidates(task.task_shape, evidenceClass);
  const requestedExternal = input.requested_external_family ?? input.requestedExternalFamily ?? null;

  const externalEvidenceClass = requestedExternal && evidenceClass === EVIDENCE_CLASSES.REPOSITORY_LOCAL
    ? EVIDENCE_CLASSES.EXTERNAL_REPO_BUNDLE
    : evidenceClass;

  let externalResolution = null;
  if (requestedExternal) {
    const externalFamilyEligible = ALL_FAMILIES.has(requestedExternal)
      && MODEL_PROFILES[requestedExternal].locality === 'external'
      && familyEligibleForTask(requestedExternal, task.task_shape, 'reviewer');
    if (!externalFamilyEligible) {
      externalResolution = frozen({
        status: 'HOLD',
        family: requestedExternal,
        transport: null,
        blockers: ['MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK'],
      });
    } else {
      externalResolution = resolveTransportForFamily({
        family: requestedExternal,
        evidence_class: externalEvidenceClass,
        permission_envelope: input.permission_envelope ?? input.permissionEnvelope ?? {},
        provider_availability: input.provider_availability ?? input.providerAvailability ?? {},
      });
    }
  }

  const blockers = [];
  let status = topology ? 'ROUTED_LOCAL' : 'HOLD';
  if (!task.resolved) blockers.push('TASK_SHAPE_UNRESOLVED');
  if (!topology && task.resolved && !requestedExternal) blockers.push('NO_EVIDENCE_BACKED_LOCAL_PRIMARY');
  if (externalResolution?.blockers?.length) blockers.push(...externalResolution.blockers);
  const uniqueBlockers = [...new Set(blockers)];
  if (uniqueBlockers.length) {
    status = 'HOLD';
  } else if (!topology && externalResolution?.status === 'READY_FOR_EXPLICIT_EXTERNAL_EXECUTION') {
    status = 'EXTERNAL_REVIEW_READY';
  }

  const primary = topology?.primary ?? null;
  const reviewer = topology?.independent_review ?? null;
  const primaryTransport = primary
    ? resolveTransportForFamily({
        family: primary,
        evidence_class: evidenceClass,
        permission_envelope: input.permission_envelope ?? input.permissionEnvelope ?? {},
        provider_availability: input.provider_availability ?? input.providerAvailability ?? {},
      })
    : null;

  return frozen({
    law: ROUTING_LAW,
    status,
    execution_lane: topology
      ? 'LOCAL_REVIEW'
      : (status === 'EXTERNAL_REVIEW_READY' ? 'EXTERNAL_REVIEW' : null),
    deterministic_capability: capability,
    evidence_class: evidenceClass,
    task_shape: task.task_shape,
    eligible_model_families: frozen([...eligible]),
    primary_model_family: primary,
    independent_review_model_family: reviewer,
    primary_transport: primaryTransport?.transport ?? (primary ? MODEL_PROFILES[primary].transports[0] : null),
    external_candidates: frozen([...external]),
    selected_external_family: requestedExternal,
    selected_transport: externalResolution?.transport ?? null,
    response_budget_profile: externalResolution?.response_budget_profile
      ?? (primaryTransport?.response_budget_profile ?? null),
    blockers: frozen([...uniqueBlockers]),
    execution_authorized: false,
    external_execution_ready: externalResolution?.status === 'READY_FOR_EXPLICIT_EXTERNAL_EXECUTION',
    provenance: frozen({
      deterministic_capability_considered: true,
      deterministic_capability_selected: null,
      task_shape_source: task.source,
      evidence_class: evidenceClass,
      eligible_model_families: frozen([...eligible]),
      selected_primary: primary,
      required_independent_review: reviewer,
      external_candidates: frozen([...external]),
      requested_external_family: requestedExternal,
      external_evidence_class: requestedExternal ? externalEvidenceClass : null,
      selected_transport: externalResolution?.transport ?? null,
      authority: frozen({
        external_network: (input.permission_envelope ?? input.permissionEnvelope ?? {}).external_network === true,
        external_repo_disclosure: (input.permission_envelope ?? input.permissionEnvelope ?? {}).external_repo_disclosure === true,
        provider_spend: (input.permission_envelope ?? input.permissionEnvelope ?? {}).provider_spend === true,
      }),
      response_budget_profile: externalResolution?.response_budget_profile?.profile_id
        ?? primaryTransport?.response_budget_profile?.profile_id
        ?? null,
      held_reason: uniqueBlockers[0] ?? null,
    }),
  });
}
