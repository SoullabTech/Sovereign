/** D1 — the posture is optional, so a finding+text object with no declared posture is a Review Discuss object. */
export * from '../contract';
import type { FindingAnchor, DurableReadingOutput, HistoricalEvidence, ReadingProvenance, ThenVsNowObject, CurrentTextOnlyObject } from '../contract';
export interface AsReadObject { readonly posture?: 'AS_READ'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then: HistoricalEvidence; readonly provenance: ReadingProvenance; readonly now?: never }
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;
