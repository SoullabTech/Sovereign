/**
 * WRITERS-STUDIO-C11R1 — ATTENTION MAP SYNTHESIS COMMISSION.
 *
 * This is a comparative synthesis over already-frozen developmental readings.
 * It does not reread, rewrite, score, grade, or mutate the manuscript.
 */
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type {
  AttentionBand,
  AttentionScale,
  WholeManuscriptAttentionMap,
} from './attentionMap';

export const ATTENTION_SYNTHESIS_VERSION = 'ams-1' as const;

export interface FrozenAttentionObservation {
  synthesisRef: string;
  readingId: string;
  observationKey: string;
  lens: DevelopmentalLens;
  sectionIds: readonly string[];
  observation: string;
  doesNotEstablish: readonly string[];
}

export interface AttentionSynthesisCommission {
  manuscriptId: string;
  revisionNumber: number;
  commissionedAt: string;
  readingIds: readonly string[];
  observations: readonly FrozenAttentionObservation[];
  request: string;
}
export interface AttentionSynthesisCandidate {
  band: AttentionBand;
  scale: AttentionScale;
  label: string;
  notice: string;
  whyItMatters: string;
  uncertainty: string | null;
  evidenceRefs: readonly string[];
}

export interface AttentionSynthesisResult {
  version: typeof ATTENTION_SYNTHESIS_VERSION;
  items: readonly AttentionSynthesisCandidate[];
}

export function attentionSynthesisSystem(): string {
  return [
    'You are synthesizing frozen developmental observations for a writer who explicitly asked where attention would have the most leverage.',
    'The observations are evidence, not verdicts. Do not rewrite them and do not invent manuscript facts.',
    'Compare across lenses and scales: whole work, part, chapter, section, passage.',
    'Organize only by the named attention bands: begin-here, next, later, watch.',
    'Do not emit numeric scores, grades, severity, confidence, priority, percentages, stars, or hidden ranking metrics.',
    'Every item must cite one or more supplied synthesisRef handles such as E1 or E27. Use only handles that appear in the supplied observations. Exact reading identity and manuscript locations are resolved by the system; do not invent identifiers.',
    'Say why the item matters to the manuscript, and name uncertainty or disagreement when present.',
    'Do not propose replacement prose. Do not mutate or apply anything.',
  ].join('\n');
}
export function buildAttentionMap(
  commission: AttentionSynthesisCommission,
  result: AttentionSynthesisResult,
): WholeManuscriptAttentionMap {
  const canonical = new Map(
    commission.observations.map((o) => [o.synthesisRef, o] as const),
  );
  for (const item of result.items) {
    if (item.evidenceRefs.length === 0) {
      throw new Error('attention_synthesis_unbound_evidence');
    }
    for (const ref of item.evidenceRefs) {
      if (!canonical.has(ref)) {
        throw new Error('attention_synthesis_unbound_evidence');
      }
    }
  }
  return {
    manuscriptId: commission.manuscriptId,
    revisionNumber: commission.revisionNumber,
    commissionedAt: commission.commissionedAt,
    readingIds: [...commission.readingIds],
    items: result.items.map((item, index) => ({
      id: `attention-${index + 1}`,
      band: item.band,
      scale: item.scale,
      label: item.label,
      notice: item.notice,
      whyItMatters: item.whyItMatters,
      uncertainty: item.uncertainty,
      sectionIds: [...new Set(item.evidenceRefs.flatMap((ref) =>
        canonical.get(ref)!.sectionIds
      ))],
      evidence: item.evidenceRefs.map((ref) => {
        const source = canonical.get(ref)!;
        return {
          readingId: source.readingId,
          observationKey: source.observationKey,
          sectionIds: [...source.sectionIds],
          lens: source.lens,
          observation: source.observation,
        };
      }),
    })),
  };
}
