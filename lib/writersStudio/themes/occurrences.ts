/**
 * WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D5C3 — Themes evidence → occurrence.
 *
 * Pure. No database and no manuscript prose. A Themes occurrence is derived
 * only from evidence already frozen inside one admitted developmental reading.
 */
import type { CodePointRange } from '@/lib/manuscript/development/evidenceRef';
import type {
  DevelopmentalObservation,
  DevelopmentalReading,
} from '@/lib/manuscript/developmentalReading/contract';
import { validateThemeClaim } from '@/lib/manuscript/developmentalReader/themes';

export interface DerivedThemeOccurrence {
  readonly sectionId: string;
  /** Relative to the frozen section body, in Unicode code points. Null = whole-section evidence. */
  readonly range: CodePointRange | null;
  readonly sourceReadingId: string;
  readonly sourceObservationId: string;
  readonly sourceRevisionNumber: number;
  readonly provenance: 'maia-observation';
}

export type ThemeOccurrenceRefusal =
  | 'not_theme_reading'
  | 'observation_not_in_reading'
  | 'not_theme_candidate'
  | 'evidence_not_in_frozen_state'
  | 'invalid_passage_range';

export type ThemeOccurrenceDerivation =
  | { readonly ok: true; readonly occurrences: readonly DerivedThemeOccurrence[] }
  | { readonly ok: false; readonly refusal: ThemeOccurrenceRefusal; readonly detail?: string };

/**
 * Derive the durable occurrence rows for one frozen MAIA Themes observation.
 *
 * Laws:
 * - repeated direct textual evidence is required by validateThemeClaim;
 * - structural refs never masquerade as textual occurrence;
 * - a precise passage supersedes a coarse whole-section ref for the same section;
 * - duplicate refs collapse by exact frozen address, never semantic similarity;
 * - order follows the frozen manuscript topology, then passage start/end.
 */
export function deriveMaiaThemeOccurrences(
  reading: DevelopmentalReading,
  observation: DevelopmentalObservation,
): ThemeOccurrenceDerivation {
  if (reading.outcome !== 'reading' || reading.scope.commissionedLens !== 'themes'
      || observation.lens !== 'themes') {
    return { ok: false, refusal: 'not_theme_reading' };
  }
  if (!reading.observations.some((candidate) => candidate.observationId === observation.observationId)) {
    return { ok: false, refusal: 'observation_not_in_reading' };
  }
  const admitted = validateThemeClaim(observation.themeLabel, observation.evidenceRefs);
  if (!admitted.ok) {
    return { ok: false, refusal: 'not_theme_candidate', detail: admitted.refusal };
  }

  const topology = new Map(reading.readState.sectionTopology.map((sectionId, index) => [sectionId, index]));
  const coarse = new Set<string>();
  const passages = new Map<string, Map<string, CodePointRange>>();

  for (const ref of observation.evidenceRefs) {
    if (ref.kind !== 'section' && ref.kind !== 'passage') continue;
    const state = reading.readState.sections[ref.sectionId];
    if (!state || !topology.has(ref.sectionId)) {
      return {
        ok: false,
        refusal: 'evidence_not_in_frozen_state',
        detail: `section ${ref.sectionId} is not in the frozen reading state`,
      };
    }
    if (ref.kind === 'section') {
      coarse.add(ref.sectionId);
      continue;
    }

    const sectionLength = state.range.end - state.range.start;
    if (ref.range.start < 0 || ref.range.end <= ref.range.start || ref.range.end > sectionLength) {
      return {
        ok: false,
        refusal: 'invalid_passage_range',
        detail: `section ${ref.sectionId} passage ${ref.range.start}:${ref.range.end} exceeds frozen length ${sectionLength}`,
      };
    }
    const byRange = passages.get(ref.sectionId) ?? new Map<string, CodePointRange>();
    byRange.set(`${ref.range.start}:${ref.range.end}`, { start: ref.range.start, end: ref.range.end });
    passages.set(ref.sectionId, byRange);
  }

  const occurrences: DerivedThemeOccurrence[] = [];
  const orderedSections = [...admitted.sectionIds].sort(
    (a, b) => (topology.get(a) as number) - (topology.get(b) as number),
  );
  for (const sectionId of orderedSections) {
    const exact = [...(passages.get(sectionId)?.values() ?? [])]
      .sort((a, b) => a.start - b.start || a.end - b.end);
    if (exact.length > 0) {
      for (const range of exact) {
        occurrences.push({
          sectionId,
          range,
          sourceReadingId: reading.id,
          sourceObservationId: observation.observationId,
          sourceRevisionNumber: reading.readState.revisionNumber,
          provenance: 'maia-observation',
        });
      }
    } else if (coarse.has(sectionId)) {
      occurrences.push({
        sectionId,
        range: null,
        sourceReadingId: reading.id,
        sourceObservationId: observation.observationId,
        sourceRevisionNumber: reading.readState.revisionNumber,
        provenance: 'maia-observation',
      });
    }
  }

  return { ok: true, occurrences };
}
