/**
 * WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D4R1
 * Pure aggregate over ONE explicit Chapter Review manifest.
 *
 * The manifest is the member-authored grouping authority. This adapter never
 * selects a reading, commissions a reading, ranks a finding, or mutates Work.
 * If the grouped readings cannot be represented truthfully by the existing
 * flagship Review contract, it refuses rather than dropping or approximating.
 */
import type { ReviewView } from '@/app/writers-studio/flagship/DevelopReview';
import {
  mapRealReview,
  type DurableObservationTruth,
  type ReviewHostFacts,
  type StoredReadingPayload,
  type StoredReadingSummary,
} from './realReview';
import { DEVELOPMENTAL_LENSES, type DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ChapterReviewManifest } from '@/lib/writersStudio/rebuild/chapterReviewManifest';
import type { LensAvailability } from './reading';

type ReviewDevelopmentalLens = Exclude<DevelopmentalLens, 'overview' | 'themes'>;
export const REVIEW_DEVELOPMENTAL_LENSES: readonly ReviewDevelopmentalLens[] = DEVELOPMENTAL_LENSES.filter(
  (lens): lens is ReviewDevelopmentalLens => lens !== 'overview' && lens !== 'themes',
);

export interface WholeReviewInput {
  readonly manifest: ChapterReviewManifest;
  readonly payloads: readonly StoredReadingPayload[];
  readonly host: ReviewHostFacts;
  /** Current durable manuscript revision. A saved review may not pose as current after the Work moves. */
  readonly currentRevision: number;
}

export type WholeReviewUnavailableReason =
  | 'manifest_mismatch'
  | 'reading_mismatch'
  | 'duplicate_lens'
  | 'scope_mismatch'
  | 'revision_mismatch'
  | 'current_revision_moved'
  | 'reading_unpresentable'
  | 'coverage_mismatch'
  | 'incomplete_lens_accounting'
  | 'no_completed_readings';

export type WholeReviewOutcome =
  | { readonly kind: 'unavailable'; readonly reason: WholeReviewUnavailableReason; readonly detail?: string }
  | {
      readonly kind: 'ready';
      readonly reviewRunId: string;
      readonly view: ReviewView;
      readonly durable: Readonly<Record<string, DurableObservationTruth>>;
    };

const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

function summaryOf(payload: StoredReadingPayload): StoredReadingSummary {
  const r = payload.reading;
  return {
    id: r.id,
    outcome: r.outcome,
    commissionedLens: r.scope.commissionedLens,
    frozenAt: r.provenance.frozenAt,
    observationCount: r.observations.length,
  };
}

function coverageKey(view: ReviewView): string {
  const c = view.coverage;
  return JSON.stringify([c.read, c.total, c.depth]);
}

function whenRange(payloads: readonly StoredReadingPayload[]): string {
  const times = payloads
    .map((p) => p.reading.provenance.frozenAt)
    .filter((x) => typeof x === 'string' && x.length > 0)
    .sort();
  if (times.length === 0) return '';
  if (times.length === 1 || times[0] === times[times.length - 1]) return times[0]!;
  return `${times[0]}–${times[times.length - 1]}`;
}

function availabilityFor(
  lens: ReviewDevelopmentalLens,
  mappedByLens: ReadonlyMap<ReviewDevelopmentalLens, ReviewView>,
  payloadByLens: ReadonlyMap<ReviewDevelopmentalLens, StoredReadingPayload>,
): LensAvailability {
  const payload = payloadByLens.get(lens);
  if (!payload) return { kind: 'not-read' };
  if (payload.reading.outcome === 'none') return { kind: 'read-nothing-noticed' };
  const view = mappedByLens.get(lens);
  return view ? { kind: 'read', found: view.findings.length } : { kind: 'not-read' };
}

/**
 * Assemble one explicit saved chapter-review run into the flagship Review shape.
 * Findings are ordered by authored location, never relevance.
 */
export function mapWholeReview(input: WholeReviewInput): WholeReviewOutcome {
  const { manifest, payloads, host } = input;
  if (manifest.manuscriptId !== host.manuscriptId) {
    return { kind: 'unavailable', reason: 'manifest_mismatch', detail: 'manifest and host Work differ' };
  }
  if (input.currentRevision !== manifest.draftRevision) {
    return {
      kind: 'unavailable',
      reason: 'current_revision_moved',
      detail: 'the Work has changed since this review set was read',
    };
  }
  if (new Set(manifest.readingIds).size !== manifest.readingIds.length) {
    return { kind: 'unavailable', reason: 'reading_mismatch', detail: 'manifest repeats a reading identity' };
  }
  if (payloads.length !== manifest.readingIds.length) {
    return { kind: 'unavailable', reason: 'reading_mismatch', detail: 'manifest and payload counts differ' };
  }

  const byId = new Map(payloads.map((p) => [p.reading.id, p] as const));
  if (manifest.readingIds.some((id) => !byId.has(id))) {
    return { kind: 'unavailable', reason: 'reading_mismatch', detail: 'a manifest reading is absent' };
  }

  const mappedByLens = new Map<ReviewDevelopmentalLens, ReviewView>();
  const payloadByLens = new Map<ReviewDevelopmentalLens, StoredReadingPayload>();
  const durable: Record<string, DurableObservationTruth> = {};
  const allFindings: ReviewView['findings'][number][] = [];
  let base: ReviewView | null = null;
  let covKey: string | null = null;

  for (const readingId of manifest.readingIds) {
    const payload = byId.get(readingId)!;
    const reading = payload.reading;
    const lens = reading.scope.commissionedLens;
    if (lens === 'overview' || lens === 'themes') {
      return { kind: 'unavailable', reason: 'reading_unpresentable', detail: `${lens === 'overview' ? 'Overview' : 'Themes'} belongs to Develop, not Review` };
    }
    if (payloadByLens.has(lens)) {
      return { kind: 'unavailable', reason: 'duplicate_lens', detail: `duplicate completed lens: ${lens}` };
    }
    if (!same(reading.scope.bodyScope, manifest.sectionIds)) {
      return { kind: 'unavailable', reason: 'scope_mismatch', detail: `${reading.id} does not match the saved review scope` };
    }
    if (reading.readState.revisionNumber !== manifest.draftRevision) {
      return { kind: 'unavailable', reason: 'revision_mismatch', detail: `${reading.id} was not read at the saved review revision` };
    }

    const summary = summaryOf(payload);
    const mapped = mapRealReview({
      summaries: [summary],
      selectedReadingId: reading.id,
      payload,
      host,
    });
    if (mapped.kind !== 'ready') {
      return {
        kind: 'unavailable',
        reason: 'reading_unpresentable',
        detail: `${reading.id}: ${mapped.kind === 'unavailable' ? mapped.reason : 'not ready'}`,
      };
    }

    const nextKey = coverageKey(mapped.view);
    if (covKey !== null && covKey !== nextKey) {
      return { kind: 'unavailable', reason: 'coverage_mismatch', detail: 'completed readings do not establish one common coverage statement' };
    }
    covKey = nextKey;
    base ??= mapped.view;
    mappedByLens.set(lens, mapped.view);
    payloadByLens.set(lens, payload);
    for (const finding of mapped.view.findings) {
      if (durable[finding.id]) {
        return { kind: 'unavailable', reason: 'reading_mismatch', detail: `duplicate observation identity: ${finding.id}` };
      }
      allFindings.push(finding);
    }    Object.assign(durable, mapped.durable);
  }

  const failed = new Set<ReviewDevelopmentalLens>();
  for (const failure of manifest.failures) {
    if (failure.lens === 'overview' || failure.lens === 'themes') {
      return { kind: 'unavailable', reason: 'reading_mismatch', detail: `${failure.lens === 'overview' ? 'Overview' : 'Themes'} is not a Review lens` };
    }
    if (payloadByLens.has(failure.lens) || failed.has(failure.lens)) {
      return { kind: 'unavailable', reason: 'duplicate_lens', detail: `lens accounted more than once: ${failure.lens}` };
    }
    failed.add(failure.lens);
  }
  const accounted = new Set<ReviewDevelopmentalLens>([...payloadByLens.keys(), ...failed]);
  if (REVIEW_DEVELOPMENTAL_LENSES.some((lens) => !accounted.has(lens))) {
    return { kind: 'unavailable', reason: 'incomplete_lens_accounting', detail: 'saved review does not account for every canonical lens' };
  }
  if (!base) return { kind: 'unavailable', reason: 'no_completed_readings' };

  const sectionOrder = new Map(manifest.sectionIds.map((id, i) => [id, i] as const));
  const lensOrder = new Map(REVIEW_DEVELOPMENTAL_LENSES.map((lens, i) => [lens, i] as const));
  allFindings.sort((a, b) => {
    const aSection = sectionOrder.get(a.returnTo.sectionId) ?? Number.MAX_SAFE_INTEGER;
    const bSection = sectionOrder.get(b.returnTo.sectionId) ?? Number.MAX_SAFE_INTEGER;
    if (aSection !== bSection) return aSection - bSection;
    const aPos = durable[a.id]?.address.codePointStart ?? Number.MAX_SAFE_INTEGER;
    const bPos = durable[b.id]?.address.codePointStart ?? Number.MAX_SAFE_INTEGER;
    if (aPos !== bPos) return aPos - bPos;
    const aLensRaw = a.provenance.kind === 'maia-observation' ? a.provenance.lens as DevelopmentalLens : null;
    const bLensRaw = b.provenance.kind === 'maia-observation' ? b.provenance.lens as DevelopmentalLens : null;
    const aLens: ReviewDevelopmentalLens | null = aLensRaw && aLensRaw !== 'overview' && aLensRaw !== 'themes' ? aLensRaw : null;
    const bLens: ReviewDevelopmentalLens | null = bLensRaw && bLensRaw !== 'overview' && bLensRaw !== 'themes' ? bLensRaw : null;
    return (aLens ? lensOrder.get(aLens) ?? 99 : 99) - (bLens ? lensOrder.get(bLens) ?? 99 : 99);
  });  const when = whenRange(payloads);
  const lenses = REVIEW_DEVELOPMENTAL_LENSES.map((id) => ({
    id,
    availability: availabilityFor(id, mappedByLens, payloadByLens),
  }));

  return {
    kind: 'ready',
    reviewRunId: manifest.id,
    durable,
    view: {
      ...base,
      freshness: { kind: 'current', when },
      coverage: { ...base.coverage, when },
      findings: allFindings,
      lenses,
      context: host.context,
    },
  };
}
