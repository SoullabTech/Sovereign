/** D11 — recovered historical prose is "just provenance for the finding", so it crosses as system provenance. */
export * from '../contract';
import type { InputClass, SectionId, Sha256, ReviewDiscussObject, CrossingDeclaration } from '../contract';
import { declareCrossing as reference } from '../contract';
export interface HistoricalEvidence { readonly role: 'THEN'; readonly inputClass: InputClass; readonly sectionId: SectionId; readonly revisionNumber: number; readonly revisionDigest: Sha256; readonly sectionDigest: Sha256; readonly range?: { readonly start: number; readonly end: number }; readonly text: string; readonly verified: 'digest-verified' }
export function declareCrossing(o: ReviewDiscussObject): CrossingDeclaration {
  const d = reference(o);
  return { ...d, entries: d.entries.map((e) => (e.role === 'THEN' || e.role === 'NOW' ? { role: e.role, inputClass: 'READING_PROVENANCE', authoredBy: 'system' } : e)) };
}
