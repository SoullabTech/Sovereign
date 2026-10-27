/**
 * Encounter room Stop contract (PURE, no IO).
 *
 * Requesting Stop immediately closes admission for later work. Completion is
 * true only after every required subsystem acknowledges the same stop
 * generation. Unknown, stale, missing, or failed acknowledgements never become
 * success by UI transition or timeout.
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
  targets: Record<RoomStopTarget, RoomStopTargetState>;
  lateWorkAdmission: 'closed';
}

export type BeginRoomStopResult =
  | { ok: true; contract: RoomStopContract }
  | { ok: false; reason: 'invalid_request' };

export interface RoomStopAcknowledgement {
  encounterId: string;
  stopGeneration: number;
  target: RoomStopTarget;
  state: 'stopped' | 'failed';
  acknowledgedAt: number;
}

export type AcknowledgeRoomStopResult =
  | { ok: true; contract: RoomStopContract }
  | {
      ok: false;
      reason: 'wrong_encounter' | 'wrong_generation' | 'unknown_target' | 'invalid_ack' | 'conflicting_ack';
      contract: RoomStopContract;
    };

export interface RoomStopSummary {
  status: 'pending' | 'failed' | 'complete';
  pending: RoomStopTarget[];
  failed: RoomStopTarget[];
  stopped: RoomStopTarget[];
}

const TARGETS = new Set<string>(ROOM_STOP_TARGETS);
const REASONS = new Set<string>(['participant_withdrawal', 'room_ended', 'steward_emergency', 'system_failure']);

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
    contract: {
      ...request,
      targets: initialTargets(),
      lateWorkAdmission: 'closed',
    },
  };
}

export function acknowledgeRoomStop(
  contract: RoomStopContract,
  acknowledgement: RoomStopAcknowledgement,
): AcknowledgeRoomStopResult {
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
    contract: {
      ...contract,
      targets: {
        ...contract.targets,
        [acknowledgement.target]: acknowledgement.state,
      },
    },
  };
}

export function summarizeRoomStop(contract: RoomStopContract): RoomStopSummary {
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
  contract: RoomStopContract,
  encounterId: string,
  stopGeneration: number,
): { allowed: false; reason: 'wrong_encounter' | 'wrong_generation' | 'stop_requested' } {
  if (encounterId !== contract.encounterId) return { allowed: false, reason: 'wrong_encounter' };
  if (stopGeneration !== contract.stopGeneration) return { allowed: false, reason: 'wrong_generation' };
  return { allowed: false, reason: 'stop_requested' };
}
