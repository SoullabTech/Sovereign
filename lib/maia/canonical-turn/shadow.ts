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
}

/** Route-scope candidates from the legacy addenda — the same strings, typed by producer. */
export function candidatesFromLegacyAddenda(
  legacy: LegacyAddenda,
): { producerId: ProducerId; text: string }[] {
  const out: { producerId: ProducerId; text: string }[] = [];
  for (const key of Object.keys(LEGACY_META_KEY_TO_PRODUCER) as LegacyMetaKey[]) {
    const text = legacy[key];
    if (typeof text === 'string' && text.trim().length > 0) {
      out.push({ producerId: LEGACY_META_KEY_TO_PRODUCER[key], text });
    }
  }
  return out;
}

export function compareLegacyToCanonical(legacy: LegacyAddenda, turn: CanonicalTurn): ShadowDiff {
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

  return {
    zeroDiff: missingInCanonical.length === 0 && missingInLegacy.length === 0 && digestMismatch.length === 0,
    missingInCanonical,
    missingInLegacy,
    digestMismatch,
    legacyCount: legacyDigests.size,
    canonicalCount: canonicalDigests.size,
  };
}

export function emitShadowDiff(turnId: string, diff: ShadowDiff): void {
  console.log(`${SHADOW_MARKER} ${JSON.stringify({ turnId, ...diff })}`);
}
