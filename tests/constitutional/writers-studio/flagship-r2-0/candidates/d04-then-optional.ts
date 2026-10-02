/** D4 — THEN_VS_NOW may omit the historical evidence and still claim a comparison. */
export * from '../contract';
import type { FindingAnchor, DurableReadingOutput, HistoricalEvidence, CurrentProse, ReadingProvenance, AsReadObject, CurrentTextOnlyObject } from '../contract';
export interface ThenVsNowObject { readonly posture: 'THEN_VS_NOW'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then?: HistoricalEvidence; readonly now: CurrentProse; readonly provenance: ReadingProvenance }
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;
import { admitReviewDiscuss as refAdmit, declareCrossing as refDeclare } from '../contract';
import type { Admission, CrossingDeclaration } from '../contract';
/* the candidate's boundary functions over ITS OWN (wrong) object types — a wrong contract is a whole contract */
export const admitReviewDiscuss = (o: DeclaredCognitionObject): Admission => refAdmit(o as never);
export const declareCrossing = (o: ReviewDiscussObject): CrossingDeclaration => refDeclare(o as never);
