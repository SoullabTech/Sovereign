/** D2 — AS_READ's evidence slot accepts current Work prose in place of digest-verified historical evidence. */
export * from '../contract';
import type { FindingAnchor, DurableReadingOutput, HistoricalEvidence, CurrentProse, ReadingProvenance, ThenVsNowObject, CurrentTextOnlyObject } from '../contract';
export interface AsReadObject { readonly posture: 'AS_READ'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then: HistoricalEvidence | CurrentProse; readonly provenance: ReadingProvenance; readonly now?: never }
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;
import { admitReviewDiscuss as refAdmit, declareCrossing as refDeclare } from '../contract';
import type { Admission, CrossingDeclaration } from '../contract';
/* the candidate's boundary functions over ITS OWN (wrong) object types — a wrong contract is a whole contract */
export const admitReviewDiscuss = (o: DeclaredCognitionObject): Admission => refAdmit(o as never);
export const declareCrossing = (o: ReviewDiscussObject): CrossingDeclaration => refDeclare(o as never);
