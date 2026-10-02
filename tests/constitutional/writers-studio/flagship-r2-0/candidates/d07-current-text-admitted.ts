/** D7 — CURRENT_TEXT_ONLY is a Review Discuss object because the writer arrived through Review. */
export * from '../contract';
import type { AsReadObject, ThenVsNowObject, CurrentTextOnlyObject, Admission, CrossingDeclaration } from '../contract';
import { declareCrossing as refDeclare } from '../contract';
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject | CurrentTextOnlyObject;
export type DeclaredCognitionObject = ReviewDiscussObject;
export function admitReviewDiscuss(o: DeclaredCognitionObject): Admission { return { admitted: true, object: o as never }; }
export const declareCrossing = (o: ReviewDiscussObject): CrossingDeclaration => refDeclare(o as never);
