/**
 * Server-side authority for the inactive R3B-A Stop contract.
 *
 * There is no HTTP endpoint or runtime-binding registration path here. A trusted
 * server integration must supply the recorded admission lookup and subsystem
 * authenticator. Fictional witnesses may supply simulated implementations; that
 * does not qualify production adapter identity or physical media shutdown.
 */
import { verifyThresholdToken as verifyExistingThresholdToken, type ThresholdClaims } from './threshold';
import {
  ROOM_STOP_TARGETS,
  sameRoomStopScope,
  validateRoomStopContract,
  validateRoomStopScope,
  validateRoomStopTargetBindings,
  type RoomStopContract,
  type RoomStopEvidenceKind,
  type RoomStopReason,
  type RoomStopScope,
  type RoomStopTarget,
  type RoomStopTargetBindings,
} from './roomStopContract';

export interface RoomRuntimeBinding {
  scope: Readonly<RoomStopScope>;
  admissionEventId: string;
  targetBindings: RoomStopTargetBindings;
}

export interface VerifiedParticipantStopAuthority {
  readonly scope: Readonly<RoomStopScope>;
  readonly binding: Readonly<RoomRuntimeBinding>;
  readonly participantId: string;
  readonly reason: 'participant_withdrawal';
}

export interface AuthenticatedRoomStopSubsystem {
  scope: Readonly<RoomStopScope>;
  operationId: string;
  stopGeneration: number;
  target: RoomStopTarget;
  principalId: string;
  adapterRuntimeId: string;
  evidenceKind: RoomStopEvidenceKind;
}

export type VerifiedRoomStopAcknowledgementAuthority = Readonly<AuthenticatedRoomStopSubsystem>;

export interface ParticipantStopAuthorityDependencies {
  /** Must read a trusted, previously recorded admission, not create one from the request. */
  lookupRuntimeBinding(input: {
    encounterId: string; participantId: string; runtimeId: string;
  }): Promise<RoomRuntimeBinding | null>;
  /** Defaults to the existing HMAC capability verifier, including its expiry check. */
  verifyThresholdToken?: (token: string) => ThresholdClaims | null;
}

export interface SubsystemAcknowledgementAuthorityDependencies {
  /** No permissive default. This adapter owns credential validation and scoped identity. */
  authenticateSubsystem(credential: unknown): Promise<AuthenticatedRoomStopSubsystem | null>;
}

export type ParticipantStopAuthorityResult =
  | { ok: true; authority: VerifiedParticipantStopAuthority }
  | { ok: false; reason: 'invalid_request' | 'unsupported_reason' | 'invalid_token'
      | 'wrong_encounter' | 'unbound_runtime' | 'scope_mismatch' | 'authority_unavailable' };

export type SubsystemAcknowledgementAuthorityResult =
  | { ok: true; authority: VerifiedRoomStopAcknowledgementAuthority }
  | { ok: false; reason: 'invalid_request' | 'invalid_contract' | 'invalid_credential'
      | 'wrong_scope' | 'wrong_operation' | 'wrong_generation' | 'wrong_target'
      | 'wrong_principal' | 'wrong_adapter_runtime' | 'wrong_evidence' | 'authority_unavailable' };

const participantAuthorities = new WeakSet<object>();
const participantAuthorityExpiry = new WeakMap<object, number>();
const acknowledgementAuthorities = new WeakSet<object>();
const TARGETS = new Set<string>(ROOM_STOP_TARGETS);
const RUNTIME_BINDING_KEYS = new Set(['scope', 'admissionEventId', 'targetBindings']);
const SUBSYSTEM_KEYS = new Set([
  'scope', 'operationId', 'stopGeneration', 'target', 'principalId', 'adapterRuntimeId', 'evidenceKind',
]);
const EVIDENCE_KINDS = new Set<string>(['server_component', 'client_report', 'simulated']);

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

export function validateRoomRuntimeBinding(value: unknown): value is Readonly<RoomRuntimeBinding> {
  return plainObject(value) && exactKeys(value, RUNTIME_BINDING_KEYS)
    && validateRoomStopScope(value.scope) && identifier(value.admissionEventId)
    && validateRoomStopTargetBindings(value.targetBindings);
}

function freezeRuntimeBinding(binding: RoomRuntimeBinding): Readonly<RoomRuntimeBinding> {
  const targetBindings = Object.freeze(Object.fromEntries(ROOM_STOP_TARGETS.map((target) => [
    target, Object.freeze({ ...binding.targetBindings[target] }),
  ]))) as RoomStopTargetBindings;
  return Object.freeze({ scope: Object.freeze({ ...binding.scope }),
    admissionEventId: binding.admissionEventId, targetBindings });
}

/**
 * Authenticate the participant and their recorded runtime. Positive join consent
 * is deliberately not a prerequisite for teardown after withdrawal. A token's
 * signature/expiry and its exact historical admission scope still must verify.
 */
export async function authorizeParticipantStop(
  input: { thresholdToken: string; encounterId: string; runtimeId: string; reason?: RoomStopReason },
  dependencies: ParticipantStopAuthorityDependencies,
): Promise<ParticipantStopAuthorityResult> {
  if (!plainObject(input)
      || Object.keys(input).some((key) => !['thresholdToken', 'encounterId', 'runtimeId', 'reason'].includes(key))
      || typeof input.thresholdToken !== 'string' || input.thresholdToken.length === 0
      || input.thresholdToken.length > 4096 || !identifier(input.encounterId) || !identifier(input.runtimeId)) {
    return { ok: false, reason: 'invalid_request' };
  }
  if (input.reason !== undefined && input.reason !== 'participant_withdrawal') {
    return { ok: false, reason: 'unsupported_reason' };
  }
  if (!dependencies || typeof dependencies.lookupRuntimeBinding !== 'function'
      || (dependencies.verifyThresholdToken !== undefined && typeof dependencies.verifyThresholdToken !== 'function')) {
    return { ok: false, reason: 'authority_unavailable' };
  }

  let claims: ThresholdClaims | null;
  try {
    claims = (dependencies.verifyThresholdToken ?? verifyExistingThresholdToken)(input.thresholdToken);
  } catch {
    return { ok: false, reason: 'authority_unavailable' };
  }
  if (!claims || !identifier(claims.encounterId) || !identifier(claims.participantId)
      || !identifier(claims.agreementVersion) || !Number.isSafeInteger(claims.generation)
      || claims.generation <= 0 || !Number.isFinite(claims.exp) || claims.exp <= Date.now()) {
    return { ok: false, reason: 'invalid_token' };
  }
  if (claims.encounterId !== input.encounterId) return { ok: false, reason: 'wrong_encounter' };
  const expiresAt = claims.exp;
  const scope = Object.freeze({ encounterId: claims.encounterId, participantId: claims.participantId,
    agreementVersion: claims.agreementVersion, consentGeneration: claims.generation, runtimeId: input.runtimeId });
  let binding: RoomRuntimeBinding | null;
  try {
    binding = await dependencies.lookupRuntimeBinding({ encounterId: scope.encounterId,
      participantId: scope.participantId, runtimeId: scope.runtimeId });
  } catch {
    return { ok: false, reason: 'authority_unavailable' };
  }
  if (expiresAt <= Date.now()) return { ok: false, reason: 'invalid_token' };
  if (!validateRoomRuntimeBinding(binding)) return { ok: false, reason: 'unbound_runtime' };
  if (!sameRoomStopScope(binding.scope, scope)) return { ok: false, reason: 'scope_mismatch' };
  const frozenBinding = freezeRuntimeBinding(binding);
  const authority: VerifiedParticipantStopAuthority = Object.freeze({ scope: frozenBinding.scope,
    binding: frozenBinding, participantId: scope.participantId, reason: 'participant_withdrawal' });
  participantAuthorities.add(authority);
  participantAuthorityExpiry.set(authority, expiresAt);
  return { ok: true, authority };
}

function validSubsystem(value: unknown): value is AuthenticatedRoomStopSubsystem {
  return plainObject(value) && exactKeys(value, SUBSYSTEM_KEYS) && validateRoomStopScope(value.scope)
    && identifier(value.operationId) && Number.isSafeInteger(value.stopGeneration) && Number(value.stopGeneration) > 0
    && typeof value.target === 'string' && TARGETS.has(value.target)
    && identifier(value.principalId) && identifier(value.adapterRuntimeId)
    && typeof value.evidenceKind === 'string' && EVIDENCE_KINDS.has(value.evidenceKind);
}

export async function authorizeSubsystemAcknowledgement(
  input: { credential: unknown; operation: Readonly<RoomStopContract>; target: RoomStopTarget },
  dependencies: SubsystemAcknowledgementAuthorityDependencies,
): Promise<SubsystemAcknowledgementAuthorityResult> {
  if (!plainObject(input) || !exactKeys(input, new Set(['credential', 'operation', 'target']))) {
    return { ok: false, reason: 'invalid_request' };
  }
  if (!validateRoomStopContract(input.operation)) return { ok: false, reason: 'invalid_contract' };
  if (!TARGETS.has(input.target)) return { ok: false, reason: 'wrong_target' };
  if (input.credential === undefined || input.credential === null) return { ok: false, reason: 'invalid_credential' };
  if (!dependencies || typeof dependencies.authenticateSubsystem !== 'function') {
    return { ok: false, reason: 'authority_unavailable' };
  }

  // Snapshot trusted expected values before awaiting the adapter.
  const scope = Object.freeze({ ...input.operation.scope });
  const operationId = input.operation.operationId;
  const stopGeneration = input.operation.stopGeneration;
  const target = input.target;
  const binding = Object.freeze({ ...input.operation.targetBindings[target] });
  let principal: AuthenticatedRoomStopSubsystem | null;
  try {
    principal = await dependencies.authenticateSubsystem(input.credential);
  } catch {
    return { ok: false, reason: 'authority_unavailable' };
  }
  if (!validSubsystem(principal)) return { ok: false, reason: 'invalid_credential' };
  if (!sameRoomStopScope(principal.scope, scope)) return { ok: false, reason: 'wrong_scope' };
  if (principal.operationId !== operationId) return { ok: false, reason: 'wrong_operation' };
  if (principal.stopGeneration !== stopGeneration) return { ok: false, reason: 'wrong_generation' };
  if (principal.target !== target) return { ok: false, reason: 'wrong_target' };
  if (principal.principalId !== binding.principalId) return { ok: false, reason: 'wrong_principal' };
  if (principal.adapterRuntimeId !== binding.adapterRuntimeId) return { ok: false, reason: 'wrong_adapter_runtime' };
  if (principal.evidenceKind !== binding.evidenceKind) return { ok: false, reason: 'wrong_evidence' };
  const authority: VerifiedRoomStopAcknowledgementAuthority = Object.freeze({ scope,
    operationId, stopGeneration, target, principalId: binding.principalId,
    adapterRuntimeId: binding.adapterRuntimeId, evidenceKind: binding.evidenceKind });
  acknowledgementAuthorities.add(authority);
  return { ok: true, authority };
}

export function isVerifiedParticipantStopAuthority(value: unknown): value is VerifiedParticipantStopAuthority {
  return typeof value === 'object' && value !== null && participantAuthorities.has(value)
    && (participantAuthorityExpiry.get(value) ?? 0) > Date.now();
}

export function assertVerifiedParticipantStopAuthority(value: unknown): asserts value is VerifiedParticipantStopAuthority {
  if (!isVerifiedParticipantStopAuthority(value)) throw new Error('UNVERIFIED_PARTICIPANT_STOP_AUTHORITY');
}

export function isVerifiedRoomStopAcknowledgementAuthority(value: unknown): value is VerifiedRoomStopAcknowledgementAuthority {
  return typeof value === 'object' && value !== null && acknowledgementAuthorities.has(value);
}

export function assertVerifiedRoomStopAcknowledgementAuthority(value: unknown): asserts value is VerifiedRoomStopAcknowledgementAuthority {
  if (!isVerifiedRoomStopAcknowledgementAuthority(value)) throw new Error('UNVERIFIED_ROOM_STOP_ACKNOWLEDGEMENT_AUTHORITY');
}
