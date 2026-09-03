/**
 * TurnParticipationManifest — evidence, never content. Spec §7.
 *
 * Inherits CC-A's constitution verbatim (lib/memory/provenance/turnMemoryProvenance.ts):
 * observational only; never writes back; never a retrieval source; never proof that
 * material is true. No member content, transcript, relational inference, PHI or prompt
 * body — identifiers, classes, counts, booleans, versions, hashes.
 *
 * Decision 6: EMISSION ONLY in v1 (log line under a discoverable marker + response
 * field). No durable table. Custody question deferred to a post-seam adjudication.
 */

import { digest } from '../../memory/provenance/turnMemoryProvenance';
import { PRODUCER_REGISTRY, producerRegistryFingerprint, type ProducerId } from './producerRegistry';
import { PARTICIPATION_POLICY_VERSION, producersForRoom } from './policy';
import {
  CANONICAL_TURN_CONTRACT_VERSION,
  MANIFEST_CONTRACT_VERSION,
  type ConstitutionalFloor,
  type MemberIdentity,
  type ParticipationClass,
  type Participation,
  type PresentEncounter,
  type SovereigntyState,
  type SurfaceDescriptor,
  type TurnParticipationManifest,
} from './types';

/** Discoverable log marker. Grep this. */
export const MANIFEST_MARKER = '[MAIA/manifest]';

export interface BuildManifestInput {
  readonly turnId: string;
  readonly builtAt: string;
  readonly ingressId: string;
  readonly identity: MemberIdentity;
  readonly surface: SurfaceDescriptor;
  readonly encounter: PresentEncounter;
  readonly sovereignty: SovereigntyState;
  readonly gatesApplied: readonly string[];
  readonly floor: ConstitutionalFloor;
  readonly participation: Participation;
  readonly cognitionPath: TurnParticipationManifest['cognitionPath'];
}

function must(d: string | undefined): string {
  return d ?? 'none';
}

export function buildManifest(input: BuildManifestInput): TurnParticipationManifest {
  const { participation, floor } = input;
  const considered = producersForRoom(input.encounter.room.kind);
  const classes = Array.from(
    new Set<ParticipationClass>(considered.map((id: ProducerId) => PRODUCER_REGISTRY[id].participationClass)),
  );

  const admitted = participation.admitted.map((p) => ({
    producerId: p.producerId,
    authoredBy: p.authoredBy,
    participationClass: p.participationClass,
    authority: p.authority,
    chars: p.text.length,
    ...(p.itemCount !== undefined ? { itemCount: p.itemCount } : {}),
    blockDigest: must(digest(p.text)),
  }));

  const fieldDigest = must(digest(admitted.map((a) => `${a.producerId}:${a.blockDigest}`).join('|')));
  const floorDigest = must(digest(floor.blocks.map((b) => `${b.producerId}:${must(digest(b.text))}`).join('|')));

  return {
    contractVersion: MANIFEST_CONTRACT_VERSION,
    turnId: input.turnId,
    builtAt: input.builtAt,
    buildSha: process.env.GIT_COMMIT ?? 'unknown',
    identityStatus: input.identity.status,
    ...(input.identity.status === 'verified' ? { memberRef: input.identity.memberRef } : {}),
    surface: input.surface,
    roomKind: input.encounter.room.kind,
    ingressId: input.ingressId,
    canonicalContextVersion: CANONICAL_TURN_CONTRACT_VERSION,
    participationPolicyVersion: PARTICIPATION_POLICY_VERSION,
    producerRegistryVersion: must(digest(producerRegistryFingerprint())),
    sovereignty: {
      sanctuary: input.sovereignty.sanctuary,
      memoryMode: input.sovereignty.memoryMode,
      gatesApplied: input.gatesApplied,
    },
    producersConsidered: considered,
    participationClassesConsidered: classes,
    admitted,
    held: participation.held,
    excluded: participation.excluded,
    counts: {
      admitted: participation.admitted.length,
      held: participation.held.length,
      excluded: participation.excluded.length,
    },
    floorDigest,
    fieldDigest,
    cognitionPath: input.cognitionPath,
  };
}

/** Emission only (Decision 6). One line, one marker, no content. */
export function emitManifest(manifest: TurnParticipationManifest): void {
  console.log(`${MANIFEST_MARKER} ${JSON.stringify(manifest)}`);
}
