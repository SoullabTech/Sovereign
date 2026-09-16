import { classifyGesture } from '../claimIdentityShadow/gestureBinding';
import type { ClaimPlan, PlanGestureBinding, PlannedClaim } from './types';

const result = (
  gesture: string,
  outcome: PlanGestureBinding['outcome'],
  reason: string,
  candidates: readonly PlannedClaim[],
  target?: PlannedClaim,
): PlanGestureBinding => ({
  gesture,
  outcome,
  reason,
  candidateClaimIds: candidates.map((c) => c.claimId),
  ...(target ? { targetClaimId: target.claimId } : {}),
});

function finalQuestion(plan: ClaimPlan): PlannedClaim | null {
  for (let i = plan.claims.length - 1; i >= 0; i -= 1) {
    if (plan.claims[i]!.speechAct === 'QUESTION') return plan.claims[i]!;
  }
  return null;
}

export function bindGestureToPlan(memberText: string, plan: ClaimPlan): PlanGestureBinding {
  const gesture = classifyGesture(memberText);
  const q = finalQuestion(plan);

  if (gesture === 'META_PATTERN') return result(gesture, 'NO_TARGET', 'meta-pattern-not-single-claim', []);
  if (gesture === 'OPAQUE_REFERENCE') return result(gesture, 'AMBIGUOUS', 'opaque-reference-needs-referent-evidence', plan.claims);

  if (gesture === 'RESTART_PROTEST') {
    const questions = plan.claims.filter((c) => c.speechAct === 'QUESTION');
    if (questions.length === 1) return result(gesture, 'BOUND', 'single-question-plan-claim', questions, questions[0]);
    return questions.length > 1
      ? result(gesture, 'AMBIGUOUS', 'multiple-question-plan-claims', questions)
      : result(gesture, 'NO_TARGET', 'no-question-plan-claim', []);
  }

  if (gesture === 'CONFIRM' || gesture === 'CORRECT') {
    if (q?.questionIntent === 'confirm' && q.targetClaimIds.length === 1) {
      const target = plan.claims.find((c) => c.claimId === q.targetClaimIds[0]);
      if (target) return result(gesture, 'BOUND', 'prospective-confirmation-frame', [target], target);
    }
    const candidates = plan.claims.filter((c) => c.speechAct !== 'QUESTION');
    if (candidates.length === 1) return result(gesture, 'BOUND', 'single-assertive-plan-claim', candidates, candidates[0]);
    return candidates.length > 1
      ? result(gesture, 'AMBIGUOUS', 'multiple-assertive-plan-claims', candidates)
      : result(gesture, 'NO_TARGET', 'no-assertive-plan-claim', []);
  }

  return result(gesture, 'NO_TARGET', 'gesture-not-standing-bearing', []);
}
