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
import { assertTurnDispositioned } from './participationDisposition';
import { PARTICIPATION_POLICY_VERSION, producersForRoom } from './policy';
import {
  CANONICAL_TURN_CONTRACT_VERSION,
  MANIFEST_CONTRACT_VERSION,
  type AdmittedRow,
  type ConstitutionalFloor,
  type MemberIdentity,
  type OfferedRow,
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

  // Rendered rows (pdc-1): axes + disposition + basis + chars + blockDigest. Never text.
  const renderedRow = (p: (typeof participation.admitted)[number]) => ({
    producerId: p.producerId,
    authoredBy: p.authoredBy,
    participationClass: p.participationClass,
    authority: p.authority,
    disposition: p.disposition,
    reason: p.reason,
    chars: p.text.length,
    ...(p.itemCount !== undefined ? { itemCount: p.itemCount } : {}),
    blockDigest: must(digest(p.text)),
  });
  const fieldRows = participation.admitted.map(renderedRow) as AdmittedRow[];
  const offered = participation.offered.map(renderedRow) as OfferedRow[];
  // The floor is ADMITTED by mandate — it is evidence too, and it must be provable per turn.
  const floorRows: AdmittedRow[] = floor.blocks.map((b) => {
    const spec = PRODUCER_REGISTRY[b.producerId];
    return {
      producerId: b.producerId,
      authoredBy: spec.authoredBy,
      participationClass: spec.participationClass,
      authority: spec.authority,
      disposition: 'ADMITTED',
      reason: 'mandatory_floor',
      chars: b.text.length,
      blockDigest: must(digest(b.text)),
    };
  });
  const admitted: AdmittedRow[] = [...floorRows, ...fieldRows];

  // fieldDigest is over the NON-floor field (G7 compares it across surfaces); floorDigest separately (G1).
  const fieldDigest = must(digest(fieldRows.map((a) => `${a.producerId}:${a.blockDigest}`).join('|')));
  const floorDigest = must(digest(floorRows.map((b) => `${b.producerId}:${b.blockDigest}`).join('|')));

  // pdc-1 invariants: every row is a contract entry; nothing AVAILABLE survives a completed turn.
  assertTurnDispositioned([...participation.held, ...offered, ...admitted, ...participation.excluded]);

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
    held: participation.held,
    offered,
    admitted,
    excluded: participation.excluded,
    counts: {
      held: participation.held.length,
      offered: offered.length,
      admitted: admitted.length,
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
