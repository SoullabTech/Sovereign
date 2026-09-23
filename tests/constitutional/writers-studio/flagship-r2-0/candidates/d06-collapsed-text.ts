/** D6 — THEN and NOW occupy one undifferentiated text field; the crossing declares one member-text entry. */
export * from '../contract';
import type { FindingAnchor, DurableReadingOutput, ReadingProvenance, AsReadObject, CurrentTextOnlyObject, CrossingDeclaration } from '../contract';
import { declareCrossing as reference } from '../contract';
export interface ThenVsNowObject { readonly posture: 'THEN_VS_NOW'; readonly finding: FindingAnchor; readonly output: DurableReadingOutput; readonly text: string; readonly provenance: ReadingProvenance }
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;
export function declareCrossing(o: ReviewDiscussObject): CrossingDeclaration {
  if (o.posture !== 'THEN_VS_NOW') return reference(o);
  return { posture: 'THEN_VS_NOW', entries: [{ role: 'FINDING', inputClass: 'DURABLE_READING_OUTPUT', authoredBy: 'maia' }, { role: 'THEN', inputClass: 'MEMBER_WORK_TEXT', authoredBy: 'member' }, { role: 'PROVENANCE', inputClass: 'READING_PROVENANCE', authoredBy: 'system' }] };
}
