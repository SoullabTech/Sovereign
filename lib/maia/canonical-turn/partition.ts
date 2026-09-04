/**
 * Producer source partition contract — MEMORY-PRODUCER-PARTITION-01 (2026-09-04).
 *
 * WHY THIS EXISTS
 *   Code cannot reliably discover multiple authorships by inspecting prompt prose.
 *   Mixedness must therefore be representable in DATA. `partitionPending` in the
 *   registry is migration metadata, NOT a detector of truth: of the four mixed
 *   producers found live on /list, two were unflagged and disclosed only in prose.
 *
 * THE THREE STATES (founder ruling, Amendment B)
 *   SINGLE_AUTHOR     producer identity + material; must agree with registry axes
 *   PARTITIONED       ordered authored segments; may NOT enter as one producer
 *   UNRESOLVED_MIXED  cannot truthfully partition at this seam; may NOT masquerade
 *                     as SINGLE_AUTHOR
 *
 * WHAT THIS IS NOT
 *   Not attribution. Nothing here frames, labels, or renders provenance into
 *   cognition. It decides only WHICH PRODUCER OWNS WHICH BYTES. P6 framing is
 *   unauthorized; the renderer is untouched; M3 is unauthorized.
 *
 * THE PARITY LAW
 *   A PARTITIONED source recomposes — its segment texts joined by its declared
 *   separator, in declared order — to EXACTLY the bytes the legacy projection
 *   sends to cognition. Legacy cognition is frozen: a partition that changes one
 *   byte or one ordering relation is a defect, not a partition.
 */

import type { LegacyMetaKey } from './shadow';
import { PRODUCER_REGISTRY, type ProducerId } from './producerRegistry';

export type PartitionKind = 'SINGLE_AUTHOR' | 'PARTITIONED' | 'UNRESOLVED_MIXED';

/** One authored segment of a partitioned source. Order is significant. */
export interface AuthoredSegment {
  readonly producerId: ProducerId;
  readonly text: string;
}

/**
 * A declared partition of one legacy addendum key.
 *
 * `separator` is the exact string the legacy projection joins present segments
 * with. Recomposition uses it and nothing else.
 */
export interface DeclaredPartition {
  readonly legacyKey: LegacyMetaKey;
  readonly segments: readonly AuthoredSegment[];
  readonly separator: string;
}

export type DeclaredPartitions = Partial<Record<LegacyMetaKey, DeclaredPartition>>;

export class PartitionRefused extends Error {
  constructor(readonly code: string, detail?: string) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'PartitionRefused';
  }
}

/** Recompose a declared partition into the bytes the legacy projection produces. */
export function recompose(partition: DeclaredPartition): string {
  return partition.segments.map((s) => s.text).join(partition.separator);
}

/**
 * The gate. A declared partition may only be used when it is:
 *   - non-degenerate           at least one segment
 *   - single-instance          no producer id appears twice (ct-1 keys by producer;
 *                              MIPA's `byId.set` would silently drop the earlier one)
 *   - registry-ordered         segment order matches PRODUCER_REGISTRY declaration
 *                              order, because canonical participants are rendered in
 *                              registry order — a partition whose source order differs
 *                              would be reordered downstream
 *   - non-empty per segment    a segment whose declared authorship has no material is
 *                              a false participant (this is what sank retrieved.member_web)
 *   - byte-exact               recomposes to the legacy text, character for character
 *
 * Throws PartitionRefused rather than degrading: a partition that cannot be proven
 * truthful must stop the shadow construction, never silently ship a weaker claim.
 */
export function assertUsablePartition(partition: DeclaredPartition, legacyText: string): void {
  const { segments, legacyKey } = partition;

  if (segments.length === 0) {
    throw new PartitionRefused('partition_empty', legacyKey);
  }

  const seen = new Set<ProducerId>();
  for (const seg of segments) {
    if (seen.has(seg.producerId)) {
      throw new PartitionRefused('duplicate_producer', `${legacyKey} → ${seg.producerId}`);
    }
    seen.add(seg.producerId);
    if (seg.text.trim().length === 0) {
      throw new PartitionRefused('empty_segment', `${legacyKey} → ${seg.producerId}`);
    }
    if (!Object.prototype.hasOwnProperty.call(PRODUCER_REGISTRY, seg.producerId)) {
      throw new PartitionRefused('unregistered_producer', `${legacyKey} → ${seg.producerId}`);
    }
  }

  const declarationOrder = Object.keys(PRODUCER_REGISTRY) as ProducerId[];
  const positions = segments.map((s) => declarationOrder.indexOf(s.producerId));
  for (let i = 1; i < positions.length; i += 1) {
    if (positions[i] <= positions[i - 1]) {
      throw new PartitionRefused(
        'registry_order_violation',
        `${legacyKey}: ${segments[i - 1].producerId} → ${segments[i].producerId}`,
      );
    }
  }

  const recomposed = recompose(partition);
  if (recomposed !== legacyText) {
    throw new PartitionRefused('content_parity_violation', legacyKey);
  }
}

/**
 * Producers known to carry mixed authorship that this seam CANNOT truthfully
 * partition. Recorded so the state is data, not prose — and so a future cut that
 * resolves one has a single place to remove it from.
 *
 * Census 2026-09-04 (docs/programme/MEMORY-PRODUCER-PARTITION-01.md §9).
 */
export const UNRESOLVED_MIXED_PRODUCERS: Readonly<Record<string, string>> = {
  'retrieved.member_web':
    'empty-state placeholders leave a family slot holding only house text, so a segment '
    + 'would be admitted with a declared authorship its bytes do not carry; folding those '
    + 'bytes into the house frame makes the frame discontiguous and turn-variable',
  'retrieved.conversational_recall':
    'member and MAIA lines interleave by recency; a truthful split needs repeated producer '
    + 'instances (ct-1 keys one block per producer) or reordering (changes legacy bytes)',
  'member.episodic_recall':
    'no structural authorship discriminator — verbatim_text is one opaque column and '
    + 'marked_by_member records the marking act, not authorship; deciding whose words they '
    + 'are would require interpreting the content',
} as const;

export function isUnresolvedMixed(producerId: ProducerId): boolean {
  return Object.prototype.hasOwnProperty.call(UNRESOLVED_MIXED_PRODUCERS, producerId);
}
