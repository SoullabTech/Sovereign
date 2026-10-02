/** D11 — recovered historical prose is "just provenance for the finding", so it crosses as system provenance. */
export * from '../contract';
import type { InputClass, SectionId, Sha256, CrossingDeclaration, Admission, FindingAnchor, DurableReadingOutput, CurrentProse, ReadingProvenance, CurrentTextOnlyObject } from '../contract';
import { declareCrossing as reference, admitReviewDiscuss as refAdmit } from '../contract';
export interface HistoricalEvidence { readonly role: 'THEN'; readonly inputClass: InputClass; readonly sectionId: SectionId; readonly revisionNumber: number; readonly revisionDigest: Sha256; readonly sectionDigest: Sha256; readonly range?: { readonly start: number; readonly end: number }; readonly text: string; readonly verified: 'digest-verified' }
export interface AsReadObject { readonly posture: 'AS_READ'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then: HistoricalEvidence; readonly provenance: ReadingProvenance; readonly now?: never }
export interface ThenVsNowObject { readonly posture: 'THEN_VS_NOW'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly then: HistoricalEvidence; readonly now: CurrentProse; readonly provenance: ReadingProvenance }
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;
export const admitReviewDiscuss = (o: DeclaredCognitionObject): Admission => refAdmit(o as never);
export function declareCrossing(o: ReviewDiscussObject): CrossingDeclaration {
  const d = reference(o as never);
  return { ...d, entries: d.entries.map((e) => (e.role === 'THEN' || e.role === 'NOW' ? { role: e.role, inputClass: 'READING_PROVENANCE', authoredBy: 'system' } : e)) };
}
