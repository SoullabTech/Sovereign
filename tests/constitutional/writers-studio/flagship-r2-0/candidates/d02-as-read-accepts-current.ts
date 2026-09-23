/** D2 — AS_READ's evidence slot accepts current Work prose in place of digest-verified historical evidence. */
export * from '../contract';
import type { FindingAnchor, DurableReadingOutput, HistoricalEvidence, CurrentProse, ReadingProvenance, ThenVsNowObject, CurrentTextOnlyObject } from '../contract';
export interface AsReadObject { readonly posture: 'AS_READ'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then: HistoricalEvidence | CurrentProse; readonly provenance: ReadingProvenance; readonly now?: never }
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;
