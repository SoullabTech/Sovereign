import type { LivingWork } from '@/app/writers-studio/useLivingWorks';

/**
 * WS-WORKDRAWER-01 — which Works declare this manuscript, and what that means.
 *
 * ── The defect this repairs ───────────────────────────────────────────────
 * A manuscript may be declared in more than one Work by design (D-018), and
 * the Studio correctly refuses to guess which one is "the" Work. But the Work
 * drawer folded that AMBIGUOUS state together with the UNCLAIMED one and
 * offered a single gesture for both: "Which one is this a form of?" — an
 * offer to make a THIRD declaration.
 *
 * The gesture that resolves the state, `undeclare`, already existed and the
 * member always had authority to use it. It simply rendered in the
 * single-Work branch, which an ambiguous manuscript never reaches. So the only
 * remedy on screen made the ambiguity worse, and the real one was unreachable.
 *
 *   A state created by a reversible member act must not hide the gesture
 *   required to reverse that act.
 *
 * ⛔ NO NEW POWER. Nothing here declares, undeclares, ranks, or prefers a Work.
 * It reports which Works the member's own declarations name, and the drawer
 * shows the member their own acts. Behaviour, schema and the developmental
 * read ceiling are untouched.
 */

/** The state of a manuscript's declarations. Never a judgement about them. */
export type DeclarationState = 'unclaimed' | 'single' | 'ambiguous';

/**
 * The Works whose expressions name this manuscript, in the order the member's
 * own list gives them.
 *
 * ⛔ Order is never a ranking. Two Works declaring one manuscript are equally
 * that manuscript's Works, and the drawer must not imply a first among them.
 */
export function worksDeclaring(
  manuscriptId: string | null,
  works: readonly LivingWork[],
): LivingWork[] {
  if (!manuscriptId) return [];
  return works.filter((w) =>
    w.expressions.some(
      (e) => e.expressionType === 'manuscript' && e.expressionId === manuscriptId,
    ),
  );
}

export function declarationState(declaring: readonly LivingWork[]): DeclarationState {
  if (declaring.length === 0) return 'unclaimed';
  return declaring.length === 1 ? 'single' : 'ambiguous';
}
