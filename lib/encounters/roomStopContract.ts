/**
 * Encounter room Stop contract (PURE, no IO).
 *
 * Requesting Stop immediately closes admission for later work. Completion is
 * true only after every required subsystem acknowledges the same stop
 * generation. Unknown, stale, missing, malformed, or failed state never becomes
 * success by UI transition, timeout, or caller mutation.
 */

export const ROOM_STOP_TARGETS = [
  'local_media',
  'remote_media',
  'signaling',
  'recorder',
  'captions',
  'maia_inference',
  'maia_playback',
  'late_work',
] as const;

export type RoomStopTarget = (typeof ROOM_STOP_TARGETS)[number];
export type RoomStopTargetState = 'pending' | 'stopped' | 'failed';
export type RoomStopReason = 'participant_withdrawal' | 'room_ended' | 'steward_emergency' | 'system_failure';

export interface RoomStopRequest {
  encounterId: string;
  requestedByParticipantId: string;
  stopGeneration: number;
  requestedAt: number;
  reason: RoomStopReason;
}

export interface RoomStopContract extends RoomStopRequest {
  targets: Readonly<Record<RoomStopTarget, RoomStopTargetState>>;
  lateWorkAdmission: 'closed';
}

export type BeginRoomStopResult =
  | { ok: true; contract: Readonly<RoomStopContract> }
  | { ok: false; reason: 'invalid_request' };

export interface RoomStopAcknowledgement {
  encounterId: string;
  stopGeneration: number;
  target: RoomStopTarget;
  state: 'stopped' | 'failed';
  acknowledgedAt: number;
}

export type AcknowledgeRoomStopResult =
  | { ok: true; contract: Readonly<RoomStopContract> }
  | {
      ok: false;
      reason: 'invalid_contract' | 'wrong_encounter' | 'wrong_generation' | 'unknown_target' | 'invalid_ack' | 'conflicting_ack';
      contract: Readonly<RoomStopContract>;
    };

export interface RoomStopSummary {
  status: 'invalid' | 'pending' | 'failed' | 'complete';
  pending: RoomStopTarget[];
  failed: RoomStopTarget[];
  stopped: RoomStopTarget[];
}

const TARGETS = new Set<string>(ROOM_STOP_TARGETS);
const TARGET_STATES = new Set<string>(['pending', 'stopped', 'failed']);
const REASONS = new Set<string>(['participant_withdrawal', 'room_ended', 'steward_emergency', 'system_failure']);
const CONTRACT_KEYS = new Set(['encounterId', 'requestedByParticipantId', 'stopGeneration', 'requestedAt', 'reason', 'targets', 'lateWorkAdmission']);

function plainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: Record<string, unknown>, keys: ReadonlySet<string>): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.size && actual.every((key) => keys.has(key));
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function positiveGeneration(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function validTimestamp(value: unknown): value is number {
  return Number.isFinite(value) && Number(value) >= 0;
}

function initialTargets(): Record<RoomStopTarget, RoomStopTargetState> {
  return Object.fromEntries(ROOM_STOP_TARGETS.map((target) => [target, 'pending'])) as Record<
    RoomStopTarget,
    RoomStopTargetState
  >;
}

function freezeContract(contract: RoomStopContract): Readonly<RoomStopContract> {
  const targets = Object.freeze({ ...contract.targets });
  return Object.freeze({ ...contract, targets });
}

export function validateRoomStopContract(value: unknown): value is Readonly<RoomStopContract> {
  if (!plainObject(value) || !exactKeys(value, CONTRACT_KEYS)) return false;
  if (!nonEmpty(value.encounterId) || !nonEmpty(value.requestedByParticipantId)
    || !positiveGeneration(value.stopGeneration) || !validTimestamp(value.requestedAt)
    || !REASONS.has(String(value.reason)) || value.lateWorkAdmission !== 'closed'
    || !plainObject(value.targets)) return false;
  const targetKeys = Object.keys(value.targets);
  return targetKeys.length === ROOM_STOP_TARGETS.length
    && targetKeys.every((target) => TARGETS.has(target))
    && ROOM_STOP_TARGETS.every((target) => TARGET_STATES.has(String(value.targets[target])));
}

export function beginRoomStop(request: RoomStopRequest): BeginRoomStopResult {
  if (!nonEmpty(request.encounterId)
    || !nonEmpty(request.requestedByParticipantId)
    || !positiveGeneration(request.stopGeneration)
    || !validTimestamp(request.requestedAt)
    || !REASONS.has(request.reason)) {
    return { ok: false, reason: 'invalid_request' };
  }

  return {
    ok: true,
    contract: freezeContract({
      ...request,
      targets: initialTargets(),
      lateWorkAdmission: 'closed',
    }),
  };
}

export function acknowledgeRoomStop(
  contract: Readonly<RoomStopContract>,
  acknowledgement: RoomStopAcknowledgement,
): AcknowledgeRoomStopResult {
  if (!validateRoomStopContract(contract)) return { ok: false, reason: 'invalid_contract', contract };
  if (acknowledgement.encounterId !== contract.encounterId) {
    return { ok: false, reason: 'wrong_encounter', contract };
  }
  if (acknowledgement.stopGeneration !== contract.stopGeneration) {
    return { ok: false, reason: 'wrong_generation', contract };
  }
  if (!TARGETS.has(acknowledgement.target)) {
    return { ok: false, reason: 'unknown_target', contract };
  }
  if ((acknowledgement.state !== 'stopped' && acknowledgement.state !== 'failed')
    || !validTimestamp(acknowledgement.acknowledgedAt)
    || acknowledgement.acknowledgedAt < contract.requestedAt) {
    return { ok: false, reason: 'invalid_ack', contract };
  }

  const current = contract.targets[acknowledgement.target];
  if (current !== 'pending') {
    if (current === acknowledgement.state) return { ok: true, contract };
    return { ok: false, reason: 'conflicting_ack', contract };
  }

  return {
    ok: true,
    contract: freezeContract({
      ...contract,
      targets: {
        ...contract.targets,
        [acknowledgement.target]: acknowledgement.state,
      },
    }),
  };
}

export function summarizeRoomStop(contract: Readonly<RoomStopContract>): RoomStopSummary {
  if (!validateRoomStopContract(contract)) {
    return { status: 'invalid', pending: [...ROOM_STOP_TARGETS], failed: [], stopped: [] };
  }
  const pending = ROOM_STOP_TARGETS.filter((target) => contract.targets[target] === 'pending');
  const failed = ROOM_STOP_TARGETS.filter((target) => contract.targets[target] === 'failed');
  const stopped = ROOM_STOP_TARGETS.filter((target) => contract.targets[target] === 'stopped');

  return {
    status: failed.length > 0 ? 'failed' : pending.length > 0 ? 'pending' : 'complete',
    pending,
    failed,
    stopped,
  };
}

/** Once a Stop generation exists, late work is refused immediately. */
export function decideLateRoomWork(
  contract: Readonly<RoomStopContract>,
  encounterId: string,
  stopGeneration: number,
): { allowed: false; reason: 'invalid_contract' | 'wrong_encounter' | 'wrong_generation' | 'stop_requested' } {
  if (!validateRoomStopContract(contract)) return { allowed: false, reason: 'invalid_contract' };
  if (encounterId !== contract.encounterId) return { allowed: false, reason: 'wrong_encounter' };
  if (stopGeneration !== contract.stopGeneration) return { allowed: false, reason: 'wrong_generation' };
  return { allowed: false, reason: 'stop_requested' };
}
