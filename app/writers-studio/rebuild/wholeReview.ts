/**
 * D4R1 — exact saved Review-run loader.
 *
 * reviewRun=<id> is an explicit location, not a request to choose a reading.
 * It loads that one member-owned manifest and exactly the reading ids it names.
 * No commission, newest-selection, ranking, retry, or write occurs here.
 */
import type { ReviewView } from '@/app/writers-studio/flagship/DevelopReview';
import type { DurableObservationTruth, ReviewHostFacts } from '@/lib/writersStudio/studio/realReview';
import { mapWholeReview } from '@/lib/writersStudio/studio/wholeReview';
import { loadChapterReviewManifestById } from '@/lib/writersStudio/rebuild/chapterReviewManifest';
import { rehydrateChapterReview } from '@/lib/writersStudio/rebuild/chapterReview';

export const REVIEW_RUN_PARAM = 'reviewRun';
export const REVIEW_FINDING_PARAM = 'reviewFinding';

export function selectedReviewRunId(
  search: { get(name: string): string | null } | null,
): string | null {
  const value = search?.get(REVIEW_RUN_PARAM) ?? null;
  return value && value.length > 0 ? value : null;
}

export function selectedReviewFindingId(
  search: { get(name: string): string | null } | null,
): string | null {
  const value = search?.get(REVIEW_FINDING_PARAM) ?? null;
  return value && value.length > 0 ? value : null;
}

export type WholeReviewLoadResult =
  | { readonly kind: 'idle' }
  | { readonly kind: 'unavailable' }
  | {
      readonly kind: 'ready';
      readonly reviewRunId: string;
      readonly view: ReviewView;
      readonly durable: Readonly<Record<string, DurableObservationTruth>>;
    };
export type WholeReviewState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading'; readonly reviewRunId: string; readonly gen: number }
  | { readonly kind: 'unavailable'; readonly reviewRunId: string; readonly gen: number }
  | {
      readonly kind: 'ready';
      readonly reviewRunId: string;
      readonly gen: number;
      readonly view: ReviewView;
      readonly durable: Readonly<Record<string, DurableObservationTruth>>;
    };

export const WHOLE_REVIEW_COPY = Object.freeze({
  loading: 'Opening this Review…',
  unavailable: 'This Review isn’t available to show here. Nothing about your Work has changed.',
});

export async function loadWholeReview(
  reviewRunId: string | null,
  host: ReviewHostFacts,
  currentRevision: number,
): Promise<WholeReviewLoadResult> {
  if (!reviewRunId) return { kind: 'idle' };

  const loaded = await loadChapterReviewManifestById(host.manuscriptId, reviewRunId);
  if (!loaded.ok || !loaded.run || loaded.run.id !== reviewRunId) {
    return { kind: 'unavailable' };
  }

  const restored = await rehydrateChapterReview(host.manuscriptId, loaded.run);
  if (!restored.ok) return { kind: 'unavailable' };
  const mapped = mapWholeReview({
    manifest: loaded.run,
    payloads: restored.bundle.payloads,
    host,
    currentRevision,
  });
  if (mapped.kind !== 'ready') return { kind: 'unavailable' };
  return mapped;
}

export function attachWholeReview(
  pending: { readonly gen: number; readonly reviewRunId: string },
  current: { readonly gen: number; readonly reviewRunId: string | null },
): boolean {
  return pending.gen === current.gen && pending.reviewRunId === current.reviewRunId;
}
