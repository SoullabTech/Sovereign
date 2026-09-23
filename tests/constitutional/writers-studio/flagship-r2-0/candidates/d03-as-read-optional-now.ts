/** D3 — AS_READ may also carry current prose "for context". */
export * from '../contract';
import type { FindingAnchor, DurableReadingOutput, HistoricalEvidence, CurrentProse, ReadingProvenance, ThenVsNowObject, CurrentTextOnlyObject } from '../contract';
export interface AsReadObject { readonly posture: 'AS_READ'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then: HistoricalEvidence; readonly provenance: ReadingProvenance; readonly now?: CurrentProse }
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;
