/**
 * constructCanonicalTurn — THE boundary. Spec §3.
 *
 * The only place a CanonicalTurn comes into being. Validates inputs against the closed
 * set of allowed inputs (§4), requires a minted identity (G4), runs MIPA, composes the
 * floor, builds the manifest, deep-freezes, emits.
 *
 * Fail closed (§12.2): unknown input key → refused; unregistered producer → refused
 * (MIPA throws); unminted identity → refused. Never silently thinner.
 */

import { randomUUID } from 'crypto';
import { adjudicateParticipation } from './adjudicate';
import { composeConstitutionalFloor } from './floor';
import { isMintedIdentity } from './identity';
import { buildManifest, emitManifest } from './manifest';
import {
  CANONICAL_TURN_CONTRACT_VERSION,
  CanonicalTurnRefused,
  type CandidateBlock,
  type CanonicalTurn,
  type CognitionRequest,
  type MemberIdentity,
  type PresentEncounter,
  type SovereigntyState,
  type SurfaceDescriptor,
  type TurnParticipationManifest,
} from './types';

export interface ConstructInputs {
  readonly ingressId: string;
  readonly identity: MemberIdentity;
  readonly surface: SurfaceDescriptor;
  readonly encounter: PresentEncounter;
  readonly sovereignty: SovereigntyState;
  readonly cognitionRequest: CognitionRequest;
  readonly candidates: readonly CandidateBlock[];
  /** Names of sovereignty gates the caller applied upstream (manifest evidence only). */
  readonly gatesApplied?: readonly string[];
  readonly cognitionPath: TurnParticipationManifest['cognitionPath'];
  /** Emit the manifest log line (default true). Tests may silence. */
  readonly emit?: boolean;
  /** Turn id override (e.g. the route's exchangeId). */
  readonly turnId?: string;
}

const ALLOWED_KEYS: ReadonlySet<string> = new Set([
  'ingressId', 'identity', 'surface', 'encounter', 'sovereignty', 'cognitionRequest',
  'candidates', 'gatesApplied', 'cognitionPath', 'emit', 'turnId',
]);

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

export function constructCanonicalTurn(inputs: ConstructInputs): CanonicalTurn {
  // §4 — allowed inputs only. An unknown key is the open channel trying to come back.
  for (const key of Object.keys(inputs)) {
    if (!ALLOWED_KEYS.has(key)) throw new CanonicalTurnRefused('unknown_input', key);
  }
  // G4 — identity must have been minted by resolveCanonicalIdentity.
  if (!isMintedIdentity(inputs.identity)) throw new CanonicalTurnRefused('identity_unverifiable');

  const turnId = inputs.turnId ?? randomUUID();
  const builtAt = new Date().toISOString();

  const participation = adjudicateParticipation({
    candidates: inputs.candidates,
    identity: inputs.identity,
    encounter: inputs.encounter,
    sovereignty: inputs.sovereignty,
  });
  const floor = composeConstitutionalFloor();

  const manifest = buildManifest({
    turnId,
    builtAt,
    ingressId: inputs.ingressId,
    identity: inputs.identity,
    surface: inputs.surface,
    encounter: inputs.encounter,
    sovereignty: inputs.sovereignty,
    gatesApplied: inputs.gatesApplied ?? [],
    floor,
    participation,
    cognitionPath: inputs.cognitionPath,
  });

  const turn: CanonicalTurn = deepFreeze({
    contractVersion: CANONICAL_TURN_CONTRACT_VERSION,
    turnId,
    builtAt,
    ingressId: inputs.ingressId,
    identity: inputs.identity,
    surface: inputs.surface,
    encounter: inputs.encounter,
    sovereignty: inputs.sovereignty,
    floor,
    participation,
    manifest,
    cognitionRequest: inputs.cognitionRequest,
  });

  if (inputs.emit !== false) emitManifest(manifest);
  return turn;
}
