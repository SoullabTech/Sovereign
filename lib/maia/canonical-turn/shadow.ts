/**
 * M2 shadow comparator — does the canonical object faithfully shadow the living turn?
 *
 * Spec §11 M2 / G8. The legacy route still produces the response. Alongside it, the
 * route constructs a CanonicalTurn from the SAME loaded material and this comparator
 * reports a STRUCTURAL diff between what legacy hands to getMaiaResponse (the
 * route-supplied addenda in `meta`) and what MIPA admitted.
 *
 * Domain: route-scope producers only (registry `scope: 'route'`). Floor and tier-internal
 * producers are outside legacy `meta` by construction and are not compared here.
 *
 * Content never leaves this function: digests only. Marker: [MAIA/shadow].
 */

import { digest } from '../../memory/provenance/turnMemoryProvenance';
import { PRODUCER_REGISTRY, type ProducerId } from './producerRegistry';
import { assertUsablePartition, type DeclaredPartitions } from './partition';
import type { CanonicalTurn } from './types';

export const SHADOW_MARKER = '[MAIA/shadow]';

/** The legacy `meta` keys /list supplies today → the producer each one is. */
export const LEGACY_META_KEY_TO_PRODUCER = {
  memoryInfluenceAddendum: 'inferred.memory_influence',
  forwardReadinessAddendum: 'computed.forward_readiness',
  atomsAddendum: 'member.atoms',
  conversationalRecallAddendum: 'retrieved.conversational_recall',
  episodicRecallAddendum: 'member.episodic_recall',
  relationalContextAddendum: 'member.relational_context',
  placeAddendum: 'house.place',
  wuxingSnapshotAddendum: 'computed.wuxing_snapshot',
  studioAddendum: 'practitioner.studio',
  practiceFieldAddendum: 'practitioner.practice_field',
  knowledgeGateAddendum: 'collective.knowledge_gate',
  memberWebAddendum: 'retrieved.member_web',
  astrologyAddendum: 'computed.astrology',
  // Pass 1 divination — three keys, three producers (JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01).
  divinationIntentAddendum: 'member.divination_intent',
  divinationCastAddendum: 'computed.divination_cast',
  divinationInterpretationAddendum: 'house.divination_interpretation',
} as const satisfies Record<string, ProducerId>;

export type LegacyMetaKey = keyof typeof LEGACY_META_KEY_TO_PRODUCER;
export type LegacyAddenda = Partial<Record<LegacyMetaKey, string | undefined | null>>;

export interface ShadowDiff {
  readonly zeroDiff: boolean;
  /** Legacy carried it; canonical did not admit it. */
  readonly missingInCanonical: readonly ProducerId[];
  /** Canonical admitted it; legacy did not carry it. */
  readonly missingInLegacy: readonly ProducerId[];
  /** Both carry it; the text differs. */
  readonly digestMismatch: readonly ProducerId[];
  readonly legacyCount: number;
  readonly canonicalCount: number;
  /**
   * MEMORY-PRODUCER-PARTITION-01. Declared partitions that actually PARTICIPATED in
   * this turn: the legacy key, the producer that used to own the whole block, and the
   * producers that truthfully own it now. Empty on turns where no partitioned source
   * was present — such turns still report zeroDiff normally.
   */
  readonly expectedPartitionDelta: readonly {
    readonly legacyKey: string;
    readonly legacyProducer: ProducerId;
    readonly canonicalProducers: readonly ProducerId[];
  }[];
  /**
   * TRUE when every declared partition recomposed, in source order, to exactly the
   * bytes legacy sends to cognition. `null` when no partition participated.
   *
   * This is the acceptance condition, not zeroDiff: a partitioned turn is SUPPOSED to
   * differ structurally. What may never differ is what MAIA actually receives.
   */
  readonly contentParity: boolean | null;
  /**
   * Diff that is NOT explained by a declared partition. This is the field that must
   * stay empty; `missingInLegacy` legitimately fills with partition products.
   */
  readonly unexpectedDiff: readonly ProducerId[];
}

/** Route-scope candidates from the legacy addenda — the same strings, typed by producer. */
export function candidatesFromLegacyAddenda(
  legacy: LegacyAddenda,
  partitions: DeclaredPartitions = {},
): { producerId: ProducerId; text: string }[] {
  const out: { producerId: ProducerId; text: string }[] = [];
  for (const key of Object.keys(LEGACY_META_KEY_TO_PRODUCER) as LegacyMetaKey[]) {
    const text = legacy[key];
    if (typeof text !== 'string' || text.trim().length === 0) continue;

    // A declared partition replaces the single block with its truthful segments.
    // assertUsablePartition throws unless the segments recompose to these exact
    // bytes in registry order with no repeated or empty producer — so a partition
    // can never quietly become a weaker claim than the block it replaced.
    const partition = partitions[key];
    if (partition) {
      assertUsablePartition(partition, text);
      for (const seg of partition.segments) out.push({ producerId: seg.producerId, text: seg.text });
      continue;
    }
    out.push({ producerId: LEGACY_META_KEY_TO_PRODUCER[key], text });
  }
  return out;
}

export function compareLegacyToCanonical(
  legacy: LegacyAddenda,
  turn: CanonicalTurn,
  partitions: DeclaredPartitions = {},
): ShadowDiff {
  // Only partitions whose legacy key actually carried text on THIS turn participate.
  // A partition-capable producer being present does not by itself imply a structural
  // delta — the delta is determined by which source families are actually present.
  const participating: ShadowDiff['expectedPartitionDelta'][number][] = [];
  const partitionProducts = new Set<ProducerId>();
  const replacedLegacyProducers = new Set<ProducerId>();
  let contentParity: boolean | null = null;

  for (const key of Object.keys(LEGACY_META_KEY_TO_PRODUCER) as LegacyMetaKey[]) {
    const text = legacy[key];
    const partition = partitions[key];
    if (!partition || typeof text !== 'string' || text.trim().length === 0) continue;

    const legacyProducer = LEGACY_META_KEY_TO_PRODUCER[key];
    const canonicalProducers = partition.segments.map((s) => s.producerId);
    participating.push({ legacyKey: key, legacyProducer, canonicalProducers });
    for (const id of canonicalProducers) partitionProducts.add(id);
    replacedLegacyProducers.add(legacyProducer);

    const recomposed = partition.segments.map((s) => s.text).join(partition.separator);
    contentParity = (contentParity ?? true) && recomposed === text;
  }

  const legacyDigests = new Map<ProducerId, string>();
  for (const key of Object.keys(LEGACY_META_KEY_TO_PRODUCER) as LegacyMetaKey[]) {
    const text = legacy[key];
    if (typeof text === 'string' && text.trim().length > 0) {
      legacyDigests.set(LEGACY_META_KEY_TO_PRODUCER[key], digest(text) ?? 'none');
    }
  }
  const canonicalDigests = new Map<ProducerId, string>();
  for (const p of turn.participation.admitted) {
    if (PRODUCER_REGISTRY[p.producerId].scope === 'route') {
      canonicalDigests.set(p.producerId, digest(p.text) ?? 'none');
    }
  }

  const missingInCanonical: ProducerId[] = [];
  const digestMismatch: ProducerId[] = [];
  for (const [id, d] of legacyDigests) {
    const c = canonicalDigests.get(id);
    if (c === undefined) missingInCanonical.push(id);
    else if (c !== d) digestMismatch.push(id);
  }
  const missingInLegacy: ProducerId[] = [];
  for (const id of canonicalDigests.keys()) {
    if (!legacyDigests.has(id)) missingInLegacy.push(id);
  }

  // What a DECLARED partition legitimately explains, and nothing more:
  //   missingInCanonical  the whole-block producer no longer owns the block
  //   missingInLegacy     its truthful segments had no legacy key of their own
  //   digestMismatch      ONLY where the legacy producer is also one of its own
  //                       segments — it NARROWS from the whole block to its section.
  //                       Every other digest change is a producer's bytes moving for
  //                       a reason the partition does not account for.
  // Nothing here weakens the guarantee: contentParity independently proves the
  // segments recompose to the exact bytes cognition receives.
  const narrowedByPartition = (id: ProducerId) =>
    replacedLegacyProducers.has(id) && partitionProducts.has(id);

  const unexpectedDiff = [
    ...missingInCanonical.filter((id) => !replacedLegacyProducers.has(id)),
    ...missingInLegacy.filter((id) => !partitionProducts.has(id)),
    ...digestMismatch.filter((id) => !narrowedByPartition(id)),
  ];

  return {
    zeroDiff: missingInCanonical.length === 0 && missingInLegacy.length === 0 && digestMismatch.length === 0,
    missingInCanonical,
    missingInLegacy,
    digestMismatch,
    legacyCount: legacyDigests.size,
    canonicalCount: canonicalDigests.size,
    expectedPartitionDelta: participating,
    contentParity,
    unexpectedDiff,
  };
}

export function emitShadowDiff(turnId: string, diff: ShadowDiff): void {
  console.log(`${SHADOW_MARKER} ${JSON.stringify({ turnId, ...diff })}`);
}
