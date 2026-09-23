/** D10 — the durable finding is "about the member's text", so it crosses as member Work text. */
export * from '../contract';
import type { InputClass, CrossingDeclaration, Admission, FindingAnchor, HistoricalEvidence, CurrentProse, ReadingProvenance, CurrentTextOnlyObject } from '../contract';
import { declareCrossing as reference, admitReviewDiscuss as refAdmit } from '../contract';
export interface DurableReadingOutput { readonly role: 'FINDING'; readonly inputClass: InputClass; readonly observation: string; readonly doesNotEstablish: readonly string[]; readonly lens: string }
export interface AsReadObject { readonly posture: 'AS_READ'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then: HistoricalEvidence; readonly provenance: ReadingProvenance; readonly now?: never }
export interface ThenVsNowObject { readonly posture: 'THEN_VS_NOW'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then: HistoricalEvidence; readonly now: CurrentProse; readonly provenance: ReadingProvenance }
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;
export const admitReviewDiscuss = (o: DeclaredCognitionObject): Admission => refAdmit(o as never);
export function declareCrossing(o: ReviewDiscussObject): CrossingDeclaration {
  const d = reference(o as never);
  return { ...d, entries: d.entries.map((e) => (e.role === 'FINDING' ? { role: 'FINDING', inputClass: 'MEMBER_WORK_TEXT', authoredBy: 'member' } : e)) };
}
