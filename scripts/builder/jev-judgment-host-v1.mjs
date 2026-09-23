/**
 * JARVIS-JEV-01 / JEV-INT-02H
 * Pure host-side Jev judgment membrane.
 *
 * NO transport. NO provider client. NO filesystem/network/environment access.
 * The only import is J5's ratified TaskShape vocabulary.
 */
import { TASK_SHAPES } from './routing-intelligence-j5-v1.mjs';

export const JEV_HOST_VERSION = 'JEV-HOST.v1';
export const JEV_PACKET_VERSION = 'jev-3';
export const JEV_CAPABILITY_CLASS = 'repository_derived_metadata';

export const QUESTION_IDS = Object.freeze([
  'Q_DEPTH',
  'Q_RISK',
  'Q_SUFFICIENT',
  'Q_LLM_NEEDED',
]);

export const PACKET_MEMBERS = Object.freeze([
  'packet_version',
  'question_id',
  'task_shape',
  'contains_sensitive',
  'requires_external_info',
  'change_scope',
]);

export const CHANGE_SCOPE_MEMBERS = Object.freeze([
  'file_count',
  'migration',
  'auth',
  'production',
]);

export const SCORE_MEMBERS = Object.freeze([
  'question_id',
  'scale',
  'score',
  'confidence',
]);

export const SCALE_MEMBERS = Object.freeze(['min', 'max']);
export const YESNO_MEMBERS = Object.freeze(['question_id', 'answer', 'confidence']);
export const PROVIDER_ABSTAIN_MEMBERS = Object.freeze(['question_id', 'reason']);
export const FILE_COUNT_MAX = 10_000;
export const CONTRACT_SCALE = Object.freeze({ min: 0, max: 1 });

export const HOST_FAILURE_REASONS = Object.freeze([
  'TIMEOUT',
  'NO_RESPONSE',
  'PARSE_FAILURE',
  'UNKNOWN_SHAPE',
  'MISMATCHED_QUESTION',
  'OUT_OF_RANGE',
]);

export const MODEL_ABSTAIN_REASONS = Object.freeze([
  'INSUFFICIENT_STATE',
  'REFUSED',
]);

export const DECLARED_SHAPE = Object.freeze({
  Q_DEPTH: 'Score',
  Q_RISK: 'YesNo',
  Q_SUFFICIENT: 'YesNo',
  Q_LLM_NEEDED: 'YesNo',
});
const OPAQUE_ID = /^[0-9a-f]{32}$/;

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function exactMembers(value, declared) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === declared.length && keys.every((key) => declared.includes(key));
}

function has(value, key) {
  return Boolean(value && typeof value === 'object' && key in value);
}

function inUnitInterval(value) {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= 1;
}

function isTaskShape(value) {
  return typeof value === 'string' && TASK_SHAPES.includes(value);
}

function isQuestionId(value) {
  return typeof value === 'string' && QUESTION_IDS.includes(value);
}

function isModelAbstainReason(value) {
  return typeof value === 'string' && MODEL_ABSTAIN_REASONS.includes(value);
}

function isAbstainShaped(value) {
  return has(value, 'question_id') && has(value, 'reason');
}

function isScoreShaped(value) {
  return has(value, 'question_id')
    && has(value, 'scale')
    && has(value, 'score')
    && has(value, 'confidence');
}

function isYesNoShaped(value) {
  return has(value, 'question_id')
    && has(value, 'answer')
    && has(value, 'confidence');
}

function questionOf(value) {
  return value && typeof value === 'object' ? value.question_id : undefined;
}

const REFUSE = deepFreeze({ ok: false, reason: 'UNREPRESENTABLE' });

export function constructJevPacket(state, questionId) {
  if (!state || typeof state !== 'object') return REFUSE;
  if (!isTaskShape(state.taskShape)) return REFUSE;
  if (!Number.isInteger(state.fileCount)) return REFUSE;
  if (state.fileCount < 0 || state.fileCount > FILE_COUNT_MAX) return REFUSE;
  if (!isQuestionId(questionId)) return REFUSE;

  const booleans = [
    state.containsSensitive,
    state.requiresExternalInfo,
    state.migration,
    state.auth,
    state.production,
  ];
  if (booleans.some((value) => typeof value !== 'boolean')) return REFUSE;

  return deepFreeze({
    ok: true,
    packet: {
      packet_version: JEV_PACKET_VERSION,
      question_id: questionId,
      task_shape: state.taskShape,
      contains_sensitive: state.containsSensitive,
      requires_external_info: state.requiresExternalInfo,
      change_scope: {
        file_count: state.fileCount,
        migration: state.migration,
        auth: state.auth,
        production: state.production,
      },
    },
  });
}
export function packetIsExact(packet) {
  return exactMembers(packet, PACKET_MEMBERS)
    && packet.packet_version === JEV_PACKET_VERSION
    && isQuestionId(packet.question_id)
    && isTaskShape(packet.task_shape)
    && typeof packet.contains_sensitive === 'boolean'
    && typeof packet.requires_external_info === 'boolean'
    && exactMembers(packet.change_scope, CHANGE_SCOPE_MEMBERS)
    && Number.isInteger(packet.change_scope.file_count)
    && packet.change_scope.file_count >= 0
    && packet.change_scope.file_count <= FILE_COUNT_MAX
    && typeof packet.change_scope.migration === 'boolean'
    && typeof packet.change_scope.auth === 'boolean'
    && typeof packet.change_scope.production === 'boolean';
}

export function outboundJevRepresentation(packet) {
  if (!packetIsExact(packet)) return REFUSE;
  return deepFreeze({ ok: true, representation: packet });
}

export function repositoryDerivedMetadataEligible(value) {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') {
    return OPAQUE_ID.test(value)
      || TASK_SHAPES.includes(value)
      || QUESTION_IDS.includes(value)
      || value === JEV_PACKET_VERSION;
  }
  if (Array.isArray(value)) return value.every(repositoryDerivedMetadataEligible);
  if (value && typeof value === 'object') {
    return Object.values(value).every(repositoryDerivedMetadataEligible);
  }
  return false;
}

export function constructionFailureEffect() {
  return Object.freeze({
    representationConstructed: false,
    providerConsulted: false,
    offendingValueRecorded: false,
    authorityChanged: false,
    recordedAsAbstention: false,
  });
}

export function hostFailureReason(observation) {
  if (observation?.timedOut === true) return 'TIMEOUT';
  if (observation?.empty === true) return 'NO_RESPONSE';
  if (observation?.parsed !== true) return 'PARSE_FAILURE';

  const raw = observation?.raw;
  if (!isAbstainShaped(raw) && !isScoreShaped(raw) && !isYesNoShaped(raw)) {
    return 'UNKNOWN_SHAPE';
  }
  return 'OUT_OF_RANGE';
}
export function admitJevResponse(packet, observation) {
  if (!packetIsExact(packet)) {
    throw new TypeError('admitJevResponse requires an exact previously-constructed packet');
  }

  const q = packet.question_id;
  if (observation?.timedOut === true) return deepFreeze({ question_id: q, reason: 'TIMEOUT' });
  if (observation?.empty === true) return deepFreeze({ question_id: q, reason: 'NO_RESPONSE' });
  if (observation?.parsed !== true) return deepFreeze({ question_id: q, reason: 'PARSE_FAILURE' });

  const raw = observation?.raw;
  const scoreShaped = isScoreShaped(raw);
  const yesNoShaped = isYesNoShaped(raw);
  const abstainShaped = isAbstainShaped(raw);

  if (!scoreShaped && !yesNoShaped && !abstainShaped) {
    return deepFreeze({ question_id: q, reason: 'UNKNOWN_SHAPE' });
  }

  if (questionOf(raw) !== q) {
    return deepFreeze({ question_id: q, reason: 'MISMATCHED_QUESTION' });
  }

  if (abstainShaped && !exactMembers(raw, PROVIDER_ABSTAIN_MEMBERS)) {
    return deepFreeze({ question_id: q, reason: 'OUT_OF_RANGE' });
  }
  if (scoreShaped && !exactMembers(raw, SCORE_MEMBERS)) {
    return deepFreeze({ question_id: q, reason: 'OUT_OF_RANGE' });
  }
  if (yesNoShaped && !exactMembers(raw, YESNO_MEMBERS)) {
    return deepFreeze({ question_id: q, reason: 'OUT_OF_RANGE' });
  }

  if (!abstainShaped) {
    const declared = DECLARED_SHAPE[q];
    if (scoreShaped && declared !== 'Score') {
      return deepFreeze({ question_id: q, reason: 'OUT_OF_RANGE' });
    }
    if (yesNoShaped && declared !== 'YesNo') {
      return deepFreeze({ question_id: q, reason: 'OUT_OF_RANGE' });
    }
  }

  if (abstainShaped) {
    const reason = raw.reason;
    if (isModelAbstainReason(reason)) return deepFreeze({ question_id: q, reason });
    return deepFreeze({ question_id: q, reason: 'OUT_OF_RANGE' });
  }

  if (scoreShaped) {
    const scale = raw.scale;
    const scaleOk = exactMembers(scale, SCALE_MEMBERS)
      && scale.min === 0
      && scale.max === 1;
    if (!scaleOk || !inUnitInterval(raw.score) || !inUnitInterval(raw.confidence)) {
      return deepFreeze({ question_id: q, reason: 'OUT_OF_RANGE' });
    }
    return deepFreeze({
      question_id: q,
      scale: CONTRACT_SCALE,
      score: raw.score,
      confidence: raw.confidence,
    });
  }

  if (typeof raw.answer !== 'boolean' || !inUnitInterval(raw.confidence)) {
    return deepFreeze({ question_id: q, reason: 'OUT_OF_RANGE' });
  }

  return deepFreeze({
    question_id: q,
    answer: raw.answer,
    confidence: raw.confidence,
  });
}
export const NEUTRAL_ADVICE = deepFreeze({
  depth: null,
  escalate: false,
  clarify: false,
  modelNeeded: null,
});

function isAdmittedAbstain(judgment) {
  return exactMembers(judgment, PROVIDER_ABSTAIN_MEMBERS)
    && (HOST_FAILURE_REASONS.includes(judgment.reason)
      || MODEL_ABSTAIN_REASONS.includes(judgment.reason));
}

function isAdmittedScore(judgment) {
  return exactMembers(judgment, SCORE_MEMBERS)
    && judgment.question_id === 'Q_DEPTH'
    && exactMembers(judgment.scale, SCALE_MEMBERS)
    && judgment.scale.min === 0
    && judgment.scale.max === 1
    && inUnitInterval(judgment.score)
    && inUnitInterval(judgment.confidence);
}

function isAdmittedYesNo(judgment) {
  return exactMembers(judgment, YESNO_MEMBERS)
    && ['Q_RISK', 'Q_SUFFICIENT', 'Q_LLM_NEEDED'].includes(judgment.question_id)
    && typeof judgment.answer === 'boolean'
    && inUnitInterval(judgment.confidence);
}

export function projectJevAdvice(prior = NEUTRAL_ADVICE, judgments = []) {
  let next = {
    depth: prior?.depth ?? null,
    escalate: prior?.escalate === true,
    clarify: prior?.clarify === true,
    modelNeeded: typeof prior?.modelNeeded === 'boolean' ? prior.modelNeeded : null,
  };

  for (const judgment of judgments) {
    if (isAdmittedAbstain(judgment)) continue;

    if (isAdmittedScore(judgment)) {
      next.depth = Math.max(next.depth ?? 0, judgment.score);
      continue;
    }

    if (!isAdmittedYesNo(judgment)) continue;

    if (judgment.question_id === 'Q_RISK') {
      next.escalate = next.escalate || judgment.answer;
    } else if (judgment.question_id === 'Q_SUFFICIENT') {
      next.clarify = next.clarify || !judgment.answer;
    } else if (judgment.question_id === 'Q_LLM_NEEDED' && judgment.answer === false) {
      next.modelNeeded = false;
    }
  }

  return deepFreeze(next);
}

export function applyJevToAuthority(priorAuthority, _judgments = []) {
  return priorAuthority;
}

export function jevHostDescriptor() {
  return deepFreeze({
    host_version: JEV_HOST_VERSION,
    governing_contract_blob: '98eb6cf16223b83b4768e46e1ae253e7881ae5f5',
    j5_task_shape_blob: 'e840d705c9c1059667379d321cc7b5c802045754',
    capability_class: JEV_CAPABILITY_CLASS,
    transport_connected: false,
    provider_registered: false,
    network_authority_created: false,
    spend_authority_created: false,
    disclosure_authority_created: false,
    execution_authority_created: false,
  });
}
