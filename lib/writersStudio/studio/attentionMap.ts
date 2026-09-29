/**
 * WRITERS-STUDIO-C11 — WHOLE-MANUSCRIPT ATTENTION MAP.
 *
 * A separate synthesis layer over frozen developmental readings.
 * Raw observations remain evidential and unranked. Attention ordering exists
 * only when the writer explicitly commissions a comparative synthesis.
 */
export const ATTENTION_SCALES = [
  'whole-work',
  'part',
  'chapter',
  'section',
  'passage',
] as const;

export type AttentionScale = typeof ATTENTION_SCALES[number];

export type AttentionBand =
  | 'begin-here'
  | 'next'
  | 'later'
  | 'watch';

export interface AttentionEvidenceRef {
  readingId: string;
  observationKey: string;
  sectionIds: readonly string[];
  /** Canonical frozen evidence copied from the admitted reading, never model-authored in synthesis. */
  lens: string;
  observation: string;
}
export interface AttentionItem {
  id: string;
  band: AttentionBand;
  scale: AttentionScale;
  label: string;
  notice: string;
  whyItMatters: string;
  uncertainty: string | null;
  evidence: readonly AttentionEvidenceRef[];
  sectionIds: readonly string[];
}

export interface WholeManuscriptAttentionMap {
  manuscriptId: string;
  revisionNumber: number;
  commissionedAt: string;
  readingIds: readonly string[];
  items: readonly AttentionItem[];
}

export type AttentionMapValidation =
  | { ok: true }
  | { ok: false; reason: string };

const BANDS: readonly AttentionBand[] = ['begin-here', 'next', 'later', 'watch'];

export function validateAttentionMap(
  map: WholeManuscriptAttentionMap,
): AttentionMapValidation {
  if (!map.manuscriptId || !Number.isInteger(map.revisionNumber)) {
    return { ok: false, reason: 'manuscript_identity_required' };
  }
  if (map.readingIds.length === 0 || new Set(map.readingIds).size !== map.readingIds.length) {
    return { ok: false, reason: 'reading_set_invalid' };
  }
  for (const item of map.items) {
    if (!item.id || !item.label.trim() || !item.notice.trim() || !item.whyItMatters.trim()) {
      return { ok: false, reason: 'attention_item_incomplete' };
    }
    if (!BANDS.includes(item.band)) return { ok: false, reason: 'attention_band_invalid' };
    if (!(ATTENTION_SCALES as readonly string[]).includes(item.scale)) {
      return { ok: false, reason: 'attention_scale_invalid' };
    }
    if (item.evidence.length === 0 || item.sectionIds.length === 0) {
      return { ok: false, reason: 'attention_item_requires_evidence' };
    }
    for (const ref of item.evidence) {
      if (
        !map.readingIds.includes(ref.readingId)
        || !ref.observationKey
        || ref.sectionIds.length === 0
        || !ref.lens.trim()
        || !ref.observation.trim()
      ) {
        return { ok: false, reason: 'attention_evidence_unbound' };
      }
    }
  }
  return { ok: true };
}

/**
 * Presentation order is meaningful only because the writer explicitly asked
 * for comparative attention. It is not a hidden model score.
 */
export const ATTENTION_BAND_ORDER: readonly AttentionBand[] = [
  'begin-here',
  'next',
  'later',
  'watch',
];
