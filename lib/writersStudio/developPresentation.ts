/**
 * BUILD-07D — DEVELOP SURFACE · presentation, pure.
 *
 * WHAT THIS IS. The words the surface puts beside a frozen reading so a writer
 * can encounter it: which part of the work an observation rests on, what the
 * reading does not establish, and where the observation stands now. Every
 * sentence here is ABOUT the reading — none of it is a reading.
 *
 * WHAT IT NEVER DOES. Rewrite the observation. `observationView` carries
 * `observation` through untouched — not trimmed, not shortened, not
 * paraphrased — because the surface encounters what MAIA actually noticed
 * (INV-4), and the module-graph gate asserts the pass-through by pattern.
 *
 * WHERE THE LABELS COME FROM. Section numbers are positions in the FROZEN
 * topology — the order the sections were in when read — never the current
 * order (INV-19: nothing is re-anchored). A heading is shown only where the
 * section still exists now, and it is the source heading, which is the
 * member's own word for that part. Division names come from the frozen
 * structure context inline in the readState, not from the live table.
 */

import type { EvidenceRef } from '../manuscript/development/evidenceRef';
import type { DevelopmentalReadState } from '../manuscript/development/readState';
import type { CurrentLocation, Moved } from '../manuscript/development/resolve';
import type { DevelopmentalLens, DevelopmentalNonConclusion } from '../manuscript/developmentalReader/contract';
import { NON_CONCLUSION_MEANING } from '../manuscript/developmentalReader/contract';
import type { DevelopmentalObservation, DevelopmentalPhenomenon, DevelopmentalReading } from '../manuscript/developmentalReading/contract';
import { PHENOMENON_LABEL } from '../manuscript/developmentalReading/contract';
import type { ReadingAssessment } from '../manuscript/developmentalReading/assess';

/* ── the closed vocabularies, in member language ─────────────────────── */

/** One line per lens, for the commission choice. The lens is 07B's; the gloss is the room's. */
export const LENS_MEANING: Readonly<Record<DevelopmentalLens, string>> = {
  structure: 'how the parts are arranged',
  development: 'how the work develops across what was read',
  continuity: 'what carries through, and what drops',
  arc: 'the shape of movement across the parts',
  voice: 'register and voice, and where they shift',
  coherence: 'whether the parts hold together',
  reader: 'what is met, in the order it is met',
};

export const LENS_ORDER: readonly DevelopmentalLens[] =
  ['development', 'structure', 'continuity', 'arc', 'voice', 'coherence', 'reader'];

export const phenomenonLabel = (p: DevelopmentalPhenomenon): string => PHENOMENON_LABEL[p];

/** Member-facing name for the non-conclusion, then its ratified meaning. */
export function limitLine(n: DevelopmentalNonConclusion): { name: string; meaning: string } {
  return { name: n.replace(/-/g, ' '), meaning: NON_CONCLUSION_MEANING[n] };
}

/* ── section and division labels from the frozen state ───────────────── */

export interface SectionLabelSource {
  id: string;
  heading: string | null;
}

/** Position in the frozen topology (1-based), or null when the id was never read. */
export function frozenPosition(readState: DevelopmentalReadState, sectionId: string): number | null {
  const i = readState.sectionTopology.indexOf(sectionId);
  return i < 0 ? null : i + 1;
}

export function sectionLabel(
  readState: DevelopmentalReadState,
  sections: readonly SectionLabelSource[],
  sectionId: string,
): string {
  const n = frozenPosition(readState, sectionId);
  const now = sections.find((s) => s.id === sectionId);
  const base = n === null ? 'a section that was not in the reading' : `Section ${n}`;
  if (!now) return n === null ? base : `${base} (no longer in the work)`;
  return now.heading ? `${base} · “${now.heading}”` : base;
}

function divisionLabel(readState: DevelopmentalReadState, unitId: string): string {
  const unit = readState.structureContext?.units.find((u) => u.id === unitId);
  if (!unit) return 'an authored division that was not in the frozen structure';
  const kind = unit.kind ? `${unit.kind} ` : '';
  return unit.title ? `the ${kind}“${unit.title}”` : `an untitled ${unit.kind ?? 'division'}`;
}

/** One sentence naming what an evidence ref points at, as it stood when read. */
export function describeRef(
  ref: EvidenceRef,
  readState: DevelopmentalReadState,
  sections: readonly SectionLabelSource[],
): string {
  switch (ref.kind) {
    case 'section':
      return `${sectionLabel(readState, sections, ref.sectionId)}, the whole section as read`;
    case 'passage':
      return `${sectionLabel(readState, sections, ref.sectionId)}, characters ${ref.range.start}–${ref.range.end} as read`;
    case 'section-run': {
      const first = ref.sectionIds[0];
      const last = ref.sectionIds[ref.sectionIds.length - 1] as string;
      const a = frozenPosition(readState, first);
      const b = frozenPosition(readState, last);
      return a !== null && b !== null
        ? `Sections ${a}–${b}, in the order they were read`
        : `A run of ${ref.sectionIds.length} sections, in the order they were read`;
    }
    case 'structure-unit':
      return `${capitalize(divisionLabel(readState, ref.unitId))}, as it stood in your structure`;
    case 'structure-units':
      return `${capitalize(ref.unitIds.map((u) => divisionLabel(readState, u)).join(' and '))}, as they stood in your structure`;
    case 'structure-topology':
      return 'The whole authored structure, as it stood when read';
  }
}

const capitalize = (s: string): string => (s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1));

/* ── where it stands now ─────────────────────────────────────────────── */

export type StateName = 'current' | 'superseded' | 'unmeasured';

export const STATE_LABEL: Readonly<Record<StateName, string>> = {
  current: 'Current',
  superseded: 'Superseded',
  unmeasured: 'Unmeasured',
};

/**
 * The third state is load-bearing (DECIDE): a surface that cannot say
 * "I do not know" will say "no". Unmeasured is never rendered as current.
 */
export const STATE_SENTENCE: Readonly<Record<StateName, string>> = {
  current: 'The parts of the work this rests on are as they were when MAIA read them.',
  superseded: 'This is what MAIA noticed then. The work has moved since:',
  unmeasured: 'Whether the work has moved here could not be measured just now. That is not a no.',
};

export function describeMoved(
  moved: Moved,
  readState: DevelopmentalReadState,
  sections: readonly SectionLabelSource[],
): string {
  switch (moved.what) {
    case 'section-text':
      return `the text of ${sectionLabel(readState, sections, moved.sectionId)} has changed`;
    case 'section-absent':
      return `${sectionLabel(readState, sections, moved.sectionId).replace(' (no longer in the work)', '')} is no longer in the work`;
    case 'section-order': {
      const ns = moved.sectionIds.map((id) => frozenPosition(readState, id)).filter((n): n is number => n !== null);
      return ns.length > 0 ? `the order of sections ${ns.join(', ')} has changed` : 'the order of the sections has changed';
    }
    case 'structure-unit':
      return `${divisionLabel(readState, moved.unitId)} has changed`;
    case 'structure-unit-absent':
      return `${divisionLabel(readState, moved.unitId)} is no longer in your structure`;
    case 'structure-topology':
      return 'the shape of your authored structure has changed';
  }
}

/** Distinct sentences, in order of first appearance. */
export function movedLines(
  loc: CurrentLocation,
  readState: DevelopmentalReadState,
  sections: readonly SectionLabelSource[],
): string[] {
  if (loc.state !== 'superseded') return [];
  const out: string[] = [];
  for (const m of loc.moved) {
    const line = describeMoved(m, readState, sections);
    if (!out.includes(line)) out.push(line);
  }
  return out;
}

/* ── the observation, presented ──────────────────────────────────────── */

export interface ObservationView {
  /** Durable: (readingId, key) — the surface never mints one. */
  key: string;
  /** VERBATIM. Not trimmed, not shortened, not paraphrased. */
  observation: string;
  lens: DevelopmentalLens;
  phenomenon: DevelopmentalPhenomenon;
  phenomenonLabel: string;
  evidence: string[];
  limits: { name: string; meaning: string }[];
  dependsOnStructure: boolean;
  state: StateName;
  stateLabel: string;
  stateSentence: string;
  moved: string[];
}

export function observationView(
  o: DevelopmentalObservation,
  loc: CurrentLocation,
  readState: DevelopmentalReadState,
  sections: readonly SectionLabelSource[],
): ObservationView {
  return {
    key: o.key,
    observation: o.observation,
    lens: o.lens,
    phenomenon: o.phenomenon,
    phenomenonLabel: phenomenonLabel(o.phenomenon),
    evidence: o.evidenceRefs.map((r) => describeRef(r, readState, sections)),
    limits: o.doesNotEstablish.map(limitLine),
    dependsOnStructure: o.structureDependency.kind === 'authored-structure',
    state: loc.state,
    stateLabel: STATE_LABEL[loc.state],
    stateSentence: STATE_SENTENCE[loc.state],
    moved: movedLines(loc, readState, sections),
  };
}

/* ── the reading, presented ──────────────────────────────────────────── */

export interface CoverageSummary {
  total: number;
  body: number;
  position: number;
  sentence: string;
}

export function coverageSummary(reading: DevelopmentalReading): CoverageSummary {
  const depths = Object.values(reading.coverage.sections);
  const total = depths.length;
  const body = depths.filter((d) => d === 'body').length;
  const position = total - body;
  const sentence = total === 0
    ? 'No sections were in the reading.'
    : `MAIA read ${body} of ${total} section${total === 1 ? '' : 's'} in full` +
      (position > 0 ? `; ${position} by position only.` : '.');
  return { total, body, position, sentence };
}

export interface ReadingView {
  id: string;
  outcome: 'reading' | 'none';
  lens: DevelopmentalLens;
  lensMeaning: string;
  frozenAt: string;
  revisionNumber: number;
  withStructure: boolean;
  readerModel: string;
  readerVersion: string;
  classifierVersion: string | null;
  coverage: CoverageSummary;
  state: StateName;
  stateLabel: string;
  stateSentence: string;
  moved: string[];
  observations: ObservationView[];
}

/**
 * The whole reading in the room's words. Observation order is the reading's
 * own (o1 … oN); nothing is sorted, ranked or filtered — a superseded
 * observation stays exactly where it was, marked (product rule, 07D opening).
 */
export function readingView(
  reading: DevelopmentalReading,
  assessment: ReadingAssessment,
  sections: readonly SectionLabelSource[],
): ReadingView {
  const { readState } = reading;
  return {
    id: reading.id,
    outcome: reading.outcome,
    lens: reading.scope.commissionedLens,
    lensMeaning: LENS_MEANING[reading.scope.commissionedLens],
    frozenAt: reading.provenance.frozenAt,
    revisionNumber: readState.revisionNumber,
    withStructure: reading.scope.withStructure,
    readerModel: reading.provenance.reader.model,
    readerVersion: reading.provenance.reader.readerVersion,
    classifierVersion: reading.provenance.classifier?.classifierVersion ?? null,
    coverage: coverageSummary(reading),
    state: assessment.reading.state,
    stateLabel: STATE_LABEL[assessment.reading.state],
    stateSentence: STATE_SENTENCE[assessment.reading.state],
    moved: movedLines(assessment.reading, readState, sections),
    observations: reading.observations.map((o) =>
      observationView(o, assessment.observations[o.key] ?? { state: 'unmeasured' }, readState, sections)),
  };
}
