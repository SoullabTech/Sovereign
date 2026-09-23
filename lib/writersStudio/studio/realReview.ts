/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-0 — real-reader → Review mapping.
 *
 * PURE ADAPTER. It receives the already-fetched durable reading and current
 * assessment and returns the accepted Review data shape plus a durable identity
 * sidecar. It performs no network, storage, model, persistence, minting or
 * member act. Absence and unsupported evidence states refuse explicitly.
 */
import type { ReviewView, LensId } from '@/app/writers-studio/flagship/DevelopReview';
import type { ReviewScope } from './reading';
import { observe, type Coverage, type DevelopDomain, type NonConclusion } from './developObservation';
import { describeRef, sectionLabel } from '@/lib/writersStudio/developPresentation';
import type { EvidenceRef } from '@/lib/manuscript/development/evidenceRef';
import type { CurrentLocation } from '@/lib/manuscript/development/resolve';
import type { ReadingAssessment } from '@/lib/manuscript/developmentalReading/assess';
import {
  PHENOMENON_LABEL,
  type DevelopmentalObservation,
  type DevelopmentalReading,
} from '@/lib/manuscript/developmentalReading/contract';
import { compareAdmitted } from '@/lib/manuscript/developmentalReading/observationIdentity';
import {
  isDevelopmentalLens, isNonConclusion,
  type DevelopmentalLens, type DevelopmentalNonConclusion,
} from '@/lib/manuscript/developmentalReader/contract';


export interface StoredReadingSummary {
  readonly id: string;
  readonly outcome: 'reading' | 'none';
  readonly commissionedLens: string;
  readonly frozenAt: string;
  readonly observationCount: number;
}

export interface StoredReadingPayload {
  readonly reading: DevelopmentalReading;
  readonly assessment: ReadingAssessment;
  readonly sections: readonly { readonly id: string; readonly heading: string | null }[];
}

export interface ReviewHostFacts {
  readonly manuscriptId: string;
  readonly work: string;
  readonly kind: string;
  readonly scope: ReviewScope;
  readonly context: ReviewView['context'];
}

export interface DurableObservationAddress {
  readonly observationId: string;
  readonly readingId: string;
  readonly observationKey: string;
  readonly codePointStart: number | null;
}

export interface DurableObservationTruth {
  readonly address: DurableObservationAddress;
  /** Full canonical limits, including values the frozen Review finding cannot express. */
  readonly limits: readonly DevelopmentalNonConclusion[];
  /** The exact frozen evidence addresses. Never regenerated from display copy. */
  readonly evidenceRefs: readonly EvidenceRef[];
}

export interface RealReviewInput {
  readonly summaries: readonly StoredReadingSummary[];
  readonly selectedReadingId: string | null;
  readonly payload: StoredReadingPayload | null | unknown;
  readonly host: ReviewHostFacts;
}

export type ReviewUnavailableReason =
  | 'reading_unavailable'
  | 'reading_not_listed'
  | 'wrong_work'
  | 'malformed_payload'
  | 'scope_unavailable'
  | 'assessment_unmeasured'
  | 'frozen_citation_text_unavailable'
  | 'observation_address_unavailable'
  | 'presentation_refused';

export type RealReviewOutcome =
  | { readonly kind: 'no-reading' }
  | { readonly kind: 'unavailable'; readonly reason: ReviewUnavailableReason; readonly detail?: string }
  | {
      readonly kind: 'ready';
      readonly view: ReviewView;
      readonly sourceReadingId: string;
      readonly durable: Readonly<Record<string, DurableObservationTruth>>;
    };

const REVIEW_LIMITS = new Set<NonConclusion>([
  'outside-coverage', 'across-unread-span', 'whole-work-pattern', 'author-intent', 'reader-effect',
]);

const obj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const integer = (v: unknown): v is number => Number.isInteger(v);

function currentLocation(v: unknown): v is CurrentLocation {
  if (!obj(v)) return false;
  if (v.state === 'current' || v.state === 'unmeasured') return true;
  return v.state === 'superseded' && Array.isArray(v.moved) && v.moved.length > 0;
}

function evidenceRef(v: unknown): v is EvidenceRef {
  if (!obj(v) || typeof v.kind !== 'string') return false;
  switch (v.kind) {
    case 'section': return typeof v.sectionId === 'string';
    case 'passage': return typeof v.sectionId === 'string' && obj(v.range)
      && integer(v.range.start) && integer(v.range.end);
    case 'section-run': return strings(v.sectionIds) && v.sectionIds.length > 0;
    case 'structure-unit': return typeof v.unitId === 'string';
    case 'structure-units': return strings(v.unitIds) && v.unitIds.length > 0;
    case 'structure-topology': return true;
    default: return false;
  }
}

function observation(v: unknown): v is DevelopmentalObservation {
  if (!obj(v)) return false;
  const position = v.position;
  const positionOk = position === null || (obj(position) && integer(position.sectionPosition) && integer(position.codePointStart));
  return typeof v.key === 'string'
    && typeof v.observationId === 'string'
    && integer(v.admissionIndex)
    && positionOk
    && isDevelopmentalLens(v.lens)
    && Array.isArray(v.evidenceRefs) && v.evidenceRefs.length > 0 && v.evidenceRefs.every(evidenceRef)
    && typeof v.observation === 'string'
    && Array.isArray(v.doesNotEstablish) && v.doesNotEstablish.every(isNonConclusion)
    && obj(v.structureDependency)
    && (v.structureDependency.kind === 'independent' || v.structureDependency.kind === 'authored-structure');
}

function payload(v: unknown): v is StoredReadingPayload {
  if (!obj(v) || !obj(v.reading) || !obj(v.assessment) || !Array.isArray(v.sections)) return false;
  const r = v.reading;
  if (typeof r.id !== 'string' || typeof r.manuscriptId !== 'string') return false;
  if (r.outcome !== 'reading' && r.outcome !== 'none') return false;
  if (!obj(r.scope) || !isDevelopmentalLens(r.scope.commissionedLens)
    || !strings(r.scope.bodyScope) || typeof r.scope.withStructure !== 'boolean') return false;
  if (!obj(r.readState) || !integer(r.readState.revisionNumber) || !strings(r.readState.sectionTopology)
    || !obj(r.readState.sections)) return false;
  if (!obj(r.coverage) || !obj(r.coverage.sections)) return false;
  if (!obj(r.provenance) || typeof r.provenance.frozenAt !== 'string') return false;
  if (!Array.isArray(r.observations) || !r.observations.every(observation)) return false;
  if (r.outcome === 'none' && r.observations.length !== 0) return false;
  if (r.outcome === 'reading' && r.observations.length === 0) return false;

  const a = v.assessment;
  if (!currentLocation(a.reading) || !obj(a.observations)) return false;
  for (const o of r.observations) if (!currentLocation(a.observations[o.key])) return false;
  return v.sections.every((s) => obj(s) && typeof s.id === 'string'
    && (s.heading === null || typeof s.heading === 'string'));
}

function lensId(lens: DevelopmentalLens): LensId {
  switch (lens) {
    case 'development': case 'structure': case 'continuity': case 'arc':
    case 'voice': case 'coherence': case 'reader': return lens;
  }
}

function developDomain(lens: DevelopmentalLens): DevelopDomain | null {
  switch (lens) {
    case 'development': case 'structure': case 'continuity': case 'arc':
    case 'voice': case 'reader': return lens;
    case 'coherence': return null;
  }
}

function coverageOf(reading: DevelopmentalReading): Coverage {
  const total = reading.readState.sectionTopology.length;
  const body = Object.values(reading.coverage.sections).filter((d) => d === 'body').length;
  const positional = Math.max(0, total - body);
  return {
    read: body, total,
    depth: positional === 0 ? 'reading the full text' : `${body} in full; ${positional} by position only`,
    when: reading.provenance.frozenAt,
  };
}

function scopeFits(reading: DevelopmentalReading, scope: ReviewScope): boolean {
  if (scope.kind === 'chapter') return reading.scope.bodyScope.includes(scope.sectionId);
  const body = reading.scope.bodyScope;
  const topology = reading.readState.sectionTopology;
  return body.length === topology.length && topology.every((id, i) => body[i] === id);
}

function sectionIds(ref: EvidenceRef): readonly string[] {
  switch (ref.kind) {
    case 'section': case 'passage': return [ref.sectionId];
    case 'section-run': return ref.sectionIds;
    case 'structure-unit': case 'structure-units': case 'structure-topology': return [];
  }
}

const reviewLimits = (all: readonly DevelopmentalNonConclusion[]): NonConclusion[] =>
  all.filter((n): n is NonConclusion => REVIEW_LIMITS.has(n as NonConclusion));

function buildFinding(
  reading: DevelopmentalReading,
  assessment: ReadingAssessment,
  sections: StoredReadingPayload['sections'],
  o: DevelopmentalObservation,
): { ok: true; finding: ReviewView['findings'][number]; truth: DurableObservationTruth }
  | { ok: false; reason: ReviewUnavailableReason; detail: string } {
  const loc = assessment.observations[o.key];
  if (!loc || loc.state === 'unmeasured') {
    return { ok: false, reason: 'assessment_unmeasured', detail: `${o.observationId} is unmeasured` };
  }
  if (loc.state === 'superseded') {
    /* Review's CitationState requires the exact frozen prose. The GET returns
       frozen addresses/digests but not member prose, so inventing it is barred. */
    return { ok: false, reason: 'frozen_citation_text_unavailable', detail: `${o.observationId} moved but frozen prose is not in the read payload` };
  }
  if (o.position === null) {
    return { ok: false, reason: 'observation_address_unavailable', detail: `${o.observationId} has structural-only evidence and no prose return address` };
  }
  const sectionId = reading.readState.sectionTopology[o.position.sectionPosition];
  if (!sectionId) return { ok: false, reason: 'malformed_payload', detail: `${o.observationId} position is outside the frozen topology` };

  const domain = developDomain(o.lens);
  if (domain === null) {
    return { ok: false, reason: 'presentation_refused', detail: `${o.observationId}: coherence is not representable in frozen DevelopDomain` };
  }
  const ids = new Set(o.evidenceRefs.flatMap(sectionIds));
  const crossWork = ids.size > 1 || o.evidenceRefs.some((r) => r.kind.startsWith('structure'));
  const evidence = o.evidenceRefs.map((r) => describeRef(r, reading.readState, sections));
  const label = o.phenomenon === undefined ? 'Observation' : PHENOMENON_LABEL[o.phenomenon];
  const built = observe({
    id: o.observationId,
    domain,
    label,
    description: o.observation,
    evidence,
    returnTo: { label: sectionLabel(reading.readState, sections, sectionId), sectionId },
    provenance: { kind: 'maia-observation', readingId: reading.id, lens: o.lens },
    crossWork,
    ...(crossWork ? { coverage: coverageOf(reading) } : {}),
    doesNotEstablish: reviewLimits(o.doesNotEstablish),
  });
  if (!built.ok) return { ok: false, reason: 'presentation_refused', detail: `${o.observationId}: ${built.code} — ${built.detail}` };

  return {
    ok: true,
    finding: built.observation,
    truth: {
      address: {
        observationId: o.observationId,
        readingId: reading.id,
        observationKey: o.key,
        codePointStart: o.position.codePointStart,
      },
      limits: [...o.doesNotEstablish],
      evidenceRefs: [...o.evidenceRefs],
    },
  };
}

/**
 * Map an already-retrieved reading into the accepted ReviewView. The selected
 * reading is explicit; this function never chooses or fetches one on behalf of
 * the member. Later/other readings remain outside this one-reading R1-0 slice.
 */
export function mapRealReview(input: RealReviewInput): RealReviewOutcome {
  if (input.summaries.length === 0) {
    return input.selectedReadingId === null && input.payload === null
      ? { kind: 'no-reading' }
      : { kind: 'unavailable', reason: 'malformed_payload', detail: 'reading material exists without a listed reading' };
  }
  if (!input.selectedReadingId) return { kind: 'unavailable', reason: 'reading_unavailable', detail: 'no reading was selected' };
  const summary = input.summaries.find((s) => s.id === input.selectedReadingId);
  if (!summary) return { kind: 'unavailable', reason: 'reading_not_listed', detail: 'selected reading is not in the member-owned ledger' };
  if (!payload(input.payload)) return { kind: 'unavailable', reason: 'malformed_payload', detail: 'reading payload does not satisfy the durable reading shape' };

  const { reading, assessment, sections } = input.payload;
  if (reading.id !== input.selectedReadingId
    || summary.outcome !== reading.outcome
    || summary.commissionedLens !== reading.scope.commissionedLens
    || summary.observationCount !== reading.observations.length
    || summary.frozenAt !== reading.provenance.frozenAt) {
    return { kind: 'unavailable', reason: 'malformed_payload', detail: 'ledger summary and reading payload disagree' };
  }
  if (reading.manuscriptId !== input.host.manuscriptId) {
    return { kind: 'unavailable', reason: 'wrong_work', detail: 'reading manuscript identity does not match the host Work' };
  }
  if (!scopeFits(reading, input.host.scope)) {
    return { kind: 'unavailable', reason: 'scope_unavailable', detail: 'host Review scope is not established by this reading' };
  }
  if (assessment.reading.state === 'unmeasured') {
    return { kind: 'unavailable', reason: 'assessment_unmeasured', detail: 'current Work could not be measured' };
  }
  if (assessment.reading.state === 'superseded' && reading.outcome === 'none') {
    return { kind: 'unavailable', reason: 'frozen_citation_text_unavailable', detail: 'stale none-reading detail is not representable without a governed change comparison' };
  }

  const durable: Record<string, DurableObservationTruth> = {};
  const findings: ReviewView['findings'][number][] = [];
  const ordered = [...reading.observations].sort(compareAdmitted);
  for (const o of ordered) {
    const built = buildFinding(reading, assessment, sections, o);
    if (!built.ok) return { kind: 'unavailable', reason: built.reason, detail: built.detail };
    findings.push(built.finding); durable[o.observationId] = built.truth;
  }

  /* A non-empty observation set cannot truthfully be "current" when the
     assessment summary says the reading moved. Individual stale rows already
     fail above because frozen prose is unavailable; this catches inconsistency. */
  if (assessment.reading.state !== 'current') {
    return { kind: 'unavailable', reason: 'frozen_citation_text_unavailable', detail: 'reading is stale but Review citation prose is unavailable' };
  }

  const availability = reading.outcome === 'none'
    ? ({ kind: 'read-nothing-noticed' } as const)
    : ({ kind: 'read', found: findings.length } as const);

  return {
    kind: 'ready', sourceReadingId: reading.id, durable,
    view: {
      work: input.host.work,
      kind: input.host.kind,
      scope: input.host.scope,
      freshness: { kind: 'current', when: reading.provenance.frozenAt },
      coverage: coverageOf(reading),
      findings,
      lenses: [{ id: lensId(reading.scope.commissionedLens), availability }],
      context: input.host.context,
    },
  };
}
