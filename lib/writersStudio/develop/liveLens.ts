/**
 * D5D–D5H — shared live Develop lens projection.
 *
 * A Develop lens never chooses a reading. It projects one exact, member-selected
 * durable reading and preserves the reading's own currentness/evidence.
 */
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingSummary } from '@/lib/manuscript/developmentalReading/store';
import type { ReadingPayload } from '@/lib/writersStudio/developClient';
import { readingView, sectionLabel } from '@/lib/writersStudio/developPresentation';

export const LIVE_READING_LENSES = [
  'development', 'arc', 'continuity', 'coherence', 'voice', 'reader',
] as const satisfies readonly DevelopmentalLens[];
export type LiveReadingLens = (typeof LIVE_READING_LENSES)[number];

export interface LiveDevelopObservation {
  readonly id: string;
  readonly label: string;
  readonly text: string;
  readonly evidence: readonly string[];
  readonly limits: readonly string[];
  readonly state: 'current' | 'superseded' | 'unmeasured';
  readonly stateSentence: string;
  readonly moved: readonly string[];
  readonly returnTo: { readonly sectionId: string; readonly label: string } | null;
}

export interface LiveDevelopReading {
  readonly id: string;
  readonly lens: LiveReadingLens;
  readonly outcome: 'reading' | 'none';
  readonly frozenAt: string;
  readonly state: 'current' | 'superseded' | 'unmeasured';
  readonly stateSentence: string;
  readonly moved: readonly string[];
  readonly coverage: {
    readonly body: number;
    readonly total: number;
    readonly sentence: string;
  };
  readonly observations: readonly LiveDevelopObservation[];
}

export function isLiveReadingLens(lens: DevelopmentalLens): lens is LiveReadingLens {
  return (LIVE_READING_LENSES as readonly DevelopmentalLens[]).includes(lens);
}

export function lensReadingChoices(
  summaries: readonly ReadingSummary[],
  lens: LiveReadingLens,
): readonly ReadingSummary[] {
  return summaries.filter((summary) => summary.commissionedLens === lens);
}

export function projectLiveDevelopReading(
  expectedLens: LiveReadingLens,
  payload: ReadingPayload,
): { readonly ok: true; readonly reading: LiveDevelopReading }
  | { readonly ok: false; readonly refusal: string } {
  const reading = payload.reading;
  if (reading.scope.commissionedLens !== expectedLens) {
    return { ok: false, refusal: 'wrong_lens' };
  }
  const view = readingView(reading, payload.assessment, payload.sections);
  if (view.observations.length !== reading.observations.length) {
    return { ok: false, refusal: 'observation_mismatch' };
  }

  const currentSectionIds = new Set(payload.sections.map((section) => section.id));
  const observations: LiveDevelopObservation[] = [];
  for (let index = 0; index < reading.observations.length; index += 1) {
    const raw = reading.observations[index]!;
    const shown = view.observations[index]!;
    if (raw.key !== shown.key || raw.lens !== expectedLens) {
      return { ok: false, refusal: 'observation_mismatch' };
    }
    const sectionId = raw.position === null
      ? null
      : reading.readState.sectionTopology[raw.position.sectionPosition] ?? null;
    const returnTo = shown.state === 'current' && sectionId && currentSectionIds.has(sectionId)
      ? { sectionId, label: sectionLabel(reading.readState, payload.sections, sectionId) }
      : null;
    observations.push({
      id: raw.observationId,
      label: shown.phenomenonLabel ?? 'Observation',
      text: shown.observation,
      evidence: shown.evidence,
      limits: shown.limits.map((limit) => limit.meaning),
      state: shown.state,
      stateSentence: shown.stateSentence,
      moved: shown.moved,
      returnTo,
    });
  }

  return {
    ok: true,
    reading: {
      id: reading.id,
      lens: expectedLens,
      outcome: reading.outcome,
      frozenAt: view.frozenAt,
      state: view.state,
      stateSentence: view.stateSentence,
      moved: view.moved,
      coverage: {
        body: view.coverage.body,
        total: view.coverage.total,
        sentence: view.coverage.sentence,
      },
      observations,
    },
  };
}
