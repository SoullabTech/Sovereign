/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-0 — real-reader → Review mapping.
 *
 * Suite-first scaffold. The exported shape is the R1-0 pure boundary; the
 * implementation is deliberately absent in the suite commit so the new laws
 * can prove RED before any mapping logic exists.
 */
import type { ReviewView } from '@/app/writers-studio/flagship/DevelopReview';
import type { ReviewScope } from './reading';
import type { DevelopmentalNonConclusion } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingPayload, ReadingSummary } from '@/lib/writersStudio/developClient';

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
  readonly limits: readonly DevelopmentalNonConclusion[];
}

export interface RealReviewInput {
  readonly summaries: readonly ReadingSummary[];
  readonly selectedReadingId: string | null;
  readonly payload: ReadingPayload | null | unknown;
  readonly host: ReviewHostFacts;
}

export type ReviewUnavailableReason =
  | 'not_implemented'
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

/** Suite-first known-bad: implementation follows only after the R1-0 laws are RED. */
export function mapRealReview(_input: RealReviewInput): RealReviewOutcome {
  return { kind: 'unavailable', reason: 'not_implemented' };
}
