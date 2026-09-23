/** D5 — THEN_VS_NOW may omit the separately admitted current prose. */
export * from '../contract';
import type { FindingAnchor, DurableReadingOutput, HistoricalEvidence, CurrentProse, ReadingProvenance, AsReadObject, CurrentTextOnlyObject } from '../contract';
export interface ThenVsNowObject { readonly posture: 'THEN_VS_NOW'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then: HistoricalEvidence; readonly now?: CurrentProse; readonly provenance: ReadingProvenance }
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;
