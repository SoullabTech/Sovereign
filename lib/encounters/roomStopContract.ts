/**
 * Encounter room Stop state machine (pure, no I/O or authentication).
 *
 * The durable store issues operation identity and Stop generation. The authority
 * boundary authenticates requesters and subsystem reports before applying this
 * reducer. Acknowledged means the required components reported outcomes; it is
 * never evidence that a remote person's physical media has been terminated.
 */

export const ROOM_STOP_TARGETS = Object.freeze([
  'local_media',
  'remote_media',
  'signaling',
  'recorder',
  'captions',
  'maia_inference',
  'maia_playback',
  'late_work',
] as const);

export type RoomStopTarget = (typeof ROOM_STOP_TARGETS)[number];
export type RoomStopTargetState = 'pending' | 'stopped' | 'failed' | 'not_started';
export type RoomStopEvidenceKind = 'server_component' | 'client_report' | 'simulated';
export type RoomStopReason = 'participant_withdrawal' | 'room_ended' | 'steward_emergency' | 'system_failure';

export interface RoomStopScope {
  encounterId: string;
  participantId: string;
  agreementVersion: string;
  consentGeneration: number;
  runtimeId: string;
}

export interface RoomStopTargetBinding {
  principalId: string;
  adapterRuntimeId: string;
  evidenceKind: RoomStopEvidenceKind;
}

export type RoomStopTargetBindings = Readonly<Record<RoomStopTarget, Readonly<RoomStopTargetBinding>>>;

export interface RoomStopRequest {
  operationId: string;
  requestKey: string;
  scope: Readonly<RoomStopScope>;
  stopGeneration: number;
  requestedByParticipantId: string;
  requestedAt: number;
  reason: RoomStopReason;
  targetBindings: RoomStopTargetBindings;
}

export interface RoomStopContract extends RoomStopRequest {
  targets: Readonly<Record<RoomStopTarget, RoomStopTargetState>>;
  acknowledgedAt: Readonly<Record<RoomStopTarget, number | null>>;
  lateWorkAdmission: 'closed';
}

export type BeginRoomStopResult =
  | { ok: true; contract: Readonly<RoomStopContract> }
  | { ok: false; reason: 'invalid_request' };

export interface RoomStopAcknowledgement {
  operationId: string;
  scope: Readonly<RoomStopScope>;
  stopGeneration: number;
  target: RoomStopTarget;
  principalId: string;
  adapterRuntimeId: string;
  evidenceKind: RoomStopEvidenceKind;
  state: Exclude<RoomStopTargetState, 'pending'>;
  acknowledgedAt: number;
}

export type AcknowledgeRoomStopResult =
  | { ok: true; contract: Readonly<RoomStopContract> }
  | {
      ok: false;
      reason: 'invalid_contract' | 'wrong_operation' | 'wrong_scope' | 'wrong_generation'
        | 'unknown_target' | 'wrong_principal' | 'wrong_adapter_runtime' | 'wrong_evidence'
        | 'invalid_ack' | 'conflicting_ack';
      contract: Readonly<RoomStopContract>;
    };

export interface RoomStopSummary {
  status: 'invalid' | 'pending' | 'failed' | 'acknowledged';
  physicalMediaVerified: false;
  pending: RoomStopTarget[];
  failed: RoomStopTarget[];
  acknowledged: RoomStopTarget[];
  stopped: RoomStopTarget[];
  notStarted: RoomStopTarget[];
}

const TARGETS = new Set<string>(ROOM_STOP_TARGETS);
const TARGET_STATES = new Set<string>(['pending', 'stopped', 'failed', 'not_started']);
const EVIDENCE_KINDS = new Set<string>(['server_component', 'client_report', 'simulated']);
const REASONS = new Set<string>(['participant_withdrawal', 'room_ended', 'steward_emergency', 'system_failure']);
const SCOPE_KEYS = new Set(['encounterId', 'participantId', 'agreementVersion', 'consentGeneration', 'runtimeId']);
const BINDING_KEYS = new Set(['principalId', 'adapterRuntimeId', 'evidenceKind']);
const REQUEST_KEYS = new Set([
  'operationId', 'requestKey', 'scope', 'stopGeneration', 'requestedByParticipantId',
  'requestedAt', 'reason', 'targetBindings',
]);
const CONTRACT_KEYS = new Set([...REQUEST_KEYS, 'targets', 'acknowledgedAt', 'lateWorkAdmission']);
const ACK_KEYS = new Set([
  'operationId', 'scope', 'stopGeneration', 'target', 'principalId', 'adapterRuntimeId',
  'evidenceKind', 'state', 'acknowledgedAt',
]);

function plainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: Record<string, unknown>, keys: ReadonlySet<string>): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.size && actual.every((key) => keys.has(key));
}

function identifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 200
    && value.trim() === value;
}

function positiveGeneration(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function validTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function validateRoomStopScope(value: unknown): value is Readonly<RoomStopScope> {
  return plainObject(value) && exactKeys(value, SCOPE_KEYS)
    && identifier(value.encounterId) && identifier(value.participantId)
    && identifier(value.agreementVersion) && positiveGeneration(value.consentGeneration)
    && identifier(value.runtimeId);
}

export function sameRoomStopScope(left: RoomStopScope, right: RoomStopScope): boolean {
  return validateRoomStopScope(left) && validateRoomStopScope(right)
    && left.encounterId === right.encounterId && left.participantId === right.participantId
    && left.agreementVersion === right.agreementVersion
    && left.consentGeneration === right.consentGeneration && left.runtimeId === right.runtimeId;
}

export function validateRoomStopTargetBindings(value: unknown): value is RoomStopTargetBindings {
  if (!plainObject(value) || !exactKeys(value, TARGETS)) return false;
  return ROOM_STOP_TARGETS.every((target) => {
    const binding = value[target];
    return plainObject(binding) && exactKeys(binding, BINDING_KEYS)
      && identifier(binding.principalId) && identifier(binding.adapterRuntimeId)
      && typeof binding.evidenceKind === 'string' && EVIDENCE_KINDS.has(binding.evidenceKind);
  });
}

function validRequestFields(value: Record<string, unknown>): boolean {
  return identifier(value.operationId) && identifier(value.requestKey)
    && validateRoomStopScope(value.scope) && positiveGeneration(value.stopGeneration)
    && identifier(value.requestedByParticipantId)
    && value.requestedByParticipantId === value.scope.participantId
    && validTimestamp(value.requestedAt) && typeof value.reason === 'string'
    && REASONS.has(value.reason) && validateRoomStopTargetBindings(value.targetBindings);
}

function freezeContract(contract: RoomStopContract): Readonly<RoomStopContract> {
  const targetBindings = Object.freeze(Object.fromEntries(ROOM_STOP_TARGETS.map((target) => [
    target, Object.freeze({ ...contract.targetBindings[target] }),
  ]))) as RoomStopTargetBindings;
  return Object.freeze({
    ...contract,
    scope: Object.freeze({ ...contract.scope }),
    targetBindings,
    targets: Object.freeze({ ...contract.targets }),
    acknowledgedAt: Object.freeze({ ...contract.acknowledgedAt }),
  });
}

export function validateRoomStopContract(value: unknown): value is Readonly<RoomStopContract> {
  if (!plainObject(value) || !exactKeys(value, CONTRACT_KEYS) || !validRequestFields(value)
      || value.lateWorkAdmission !== 'closed' || !plainObject(value.targets)
      || !exactKeys(value.targets, TARGETS) || !plainObject(value.acknowledgedAt)
      || !exactKeys(value.acknowledgedAt, TARGETS)) return false;
  const targets = value.targets;
  const acknowledgedAt = value.acknowledgedAt;
  const requestedAt = value.requestedAt as number;
  return ROOM_STOP_TARGETS.every((target) => {
    const state = targets[target];
    const at = acknowledgedAt[target];
    return typeof state === 'string' && TARGET_STATES.has(state)
      && (state === 'pending' ? at === null : validTimestamp(at) && at >= requestedAt);
  });
}

export function beginRoomStop(request: RoomStopRequest): BeginRoomStopResult {
  if (!plainObject(request) || !exactKeys(request, REQUEST_KEYS) || !validRequestFields(request)) {
    return { ok: false, reason: 'invalid_request' };
  }
  const targets = Object.fromEntries(ROOM_STOP_TARGETS.map((target) => [target, 'pending'])) as Record<RoomStopTarget, RoomStopTargetState>;
  const acknowledgedAt = Object.fromEntries(ROOM_STOP_TARGETS.map((target) => [target, null])) as Record<RoomStopTarget, number | null>;
  return { ok: true, contract: freezeContract({ ...request, targets, acknowledgedAt, lateWorkAdmission: 'closed' }) };
}

export function acknowledgeRoomStop(
  contract: Readonly<RoomStopContract>,
  acknowledgement: RoomStopAcknowledgement,
): AcknowledgeRoomStopResult {
  if (!validateRoomStopContract(contract)) return { ok: false, reason: 'invalid_contract', contract };
  if (!plainObject(acknowledgement) || !exactKeys(acknowledgement, ACK_KEYS)
      || !validateRoomStopScope(acknowledgement.scope)) return { ok: false, reason: 'invalid_ack', contract };
  if (acknowledgement.operationId !== contract.operationId) return { ok: false, reason: 'wrong_operation', contract };
  if (!sameRoomStopScope(acknowledgement.scope, contract.scope)) return { ok: false, reason: 'wrong_scope', contract };
  if (acknowledgement.stopGeneration !== contract.stopGeneration) return { ok: false, reason: 'wrong_generation', contract };
  if (!TARGETS.has(acknowledgement.target)) return { ok: false, reason: 'unknown_target', contract };
  const binding = contract.targetBindings[acknowledgement.target];
  if (acknowledgement.principalId !== binding.principalId) return { ok: false, reason: 'wrong_principal', contract };
  if (acknowledgement.adapterRuntimeId !== binding.adapterRuntimeId) return { ok: false, reason: 'wrong_adapter_runtime', contract };
  if (acknowledgement.evidenceKind !== binding.evidenceKind) return { ok: false, reason: 'wrong_evidence', contract };
  if (!['stopped', 'failed', 'not_started'].includes(acknowledgement.state)
      || !validTimestamp(acknowledgement.acknowledgedAt)
      || acknowledgement.acknowledgedAt < contract.requestedAt) return { ok: false, reason: 'invalid_ack', contract };

  const current = contract.targets[acknowledgement.target];
  if (current !== 'pending') {
    return current === acknowledgement.state
      ? { ok: true, contract }
      : { ok: false, reason: 'conflicting_ack', contract };
  }
  return {
    ok: true,
    contract: freezeContract({
      ...contract,
      targets: { ...contract.targets, [acknowledgement.target]: acknowledgement.state },
      acknowledgedAt: { ...contract.acknowledgedAt, [acknowledgement.target]: acknowledgement.acknowledgedAt },
    }),
  };
}

export function summarizeRoomStop(contract: Readonly<RoomStopContract>): RoomStopSummary {
  if (!validateRoomStopContract(contract)) {
    return { status: 'invalid', physicalMediaVerified: false, pending: [...ROOM_STOP_TARGETS],
      failed: [], acknowledged: [], stopped: [], notStarted: [] };
  }
  const pending = ROOM_STOP_TARGETS.filter((target) => contract.targets[target] === 'pending');
  const failed = ROOM_STOP_TARGETS.filter((target) => contract.targets[target] === 'failed');
  const stopped = ROOM_STOP_TARGETS.filter((target) => contract.targets[target] === 'stopped');
  const notStarted = ROOM_STOP_TARGETS.filter((target) => contract.targets[target] === 'not_started');
  const acknowledged = ROOM_STOP_TARGETS.filter((target) => ['stopped', 'not_started'].includes(contract.targets[target]));
  return { status: failed.length ? 'failed' : pending.length ? 'pending' : 'acknowledged',
    physicalMediaVerified: false, pending, failed, acknowledged, stopped, notStarted };
}

/** Stop closes this operation immediately; absence of a Stop is never a consent grant. */
export function decideLateRoomWork(
  contract: Readonly<RoomStopContract>, scope: RoomStopScope, stopGeneration: number,
): { allowed: false; reason: 'invalid_contract' | 'wrong_scope' | 'wrong_generation' | 'stop_requested' } {
  if (!validateRoomStopContract(contract)) return { allowed: false, reason: 'invalid_contract' };
  if (!sameRoomStopScope(scope, contract.scope)) return { allowed: false, reason: 'wrong_scope' };
  if (stopGeneration !== contract.stopGeneration) return { allowed: false, reason: 'wrong_generation' };
  return { allowed: false, reason: 'stop_requested' };
}
