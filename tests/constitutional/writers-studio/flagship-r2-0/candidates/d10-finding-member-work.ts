/** D10 — the durable finding is "about the member's text", so it crosses as member Work text. */
export * from '../contract';
import type { InputClass, ReviewDiscussObject, CrossingDeclaration } from '../contract';
import { declareCrossing as reference } from '../contract';
export interface DurableReadingOutput { readonly role: 'FINDING'; readonly inputClass: InputClass; readonly observation: string; readonly doesNotEstablish: readonly string[]; readonly lens: string }
export function declareCrossing(o: ReviewDiscussObject): CrossingDeclaration {
  const d = reference(o);
  return { ...d, entries: d.entries.map((e) => (e.role === 'FINDING' ? { role: 'FINDING', inputClass: 'MEMBER_WORK_TEXT', authoredBy: 'member' } : e)) };
}
