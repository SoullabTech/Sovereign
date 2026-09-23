/** D7 — CURRENT_TEXT_ONLY is a Review Discuss object because the writer arrived through Review. */
export * from '../contract';
import type { AsReadObject, ThenVsNowObject, CurrentTextOnlyObject, Admission } from '../contract';
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject | CurrentTextOnlyObject;
export type DeclaredCognitionObject = ReviewDiscussObject;
export function admitReviewDiscuss(o: DeclaredCognitionObject): Admission { return { admitted: true, object: o as never }; }
