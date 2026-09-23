/** D12 — the receipt says only `work`: the finding rides along undeclared. */
export * from '../contract';
import type { ReviewDiscussObject, CrossingDeclaration } from '../contract';
export function declareCrossing(o: ReviewDiscussObject): CrossingDeclaration {
  return { posture: o.posture, entries: [{ role: 'THEN', inputClass: 'MEMBER_WORK_TEXT', authoredBy: 'member' }] };
}
