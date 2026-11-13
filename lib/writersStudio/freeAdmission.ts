/**
 * Free admission to Writer's Studio — step B of docs/programme/WRITERS-STUDIO_FREE_STUDIO_PLAN_2026-11-13.md.
 *
 * Founder rulings:
 *   2026-11-02 "ADMIT FREE NOW" — ordinary signed-in members are admitted on the Free plan, AFTER the Free/Pro boundary
 *   is enforced server-side; opening it in production is a deploy act for the Writer walk session (#1938).
 *   2026-11-02 "ONE-WORK FREE" — Free is the whole Studio as built today on one active Work; Pro adds more Works and
 *   each Pro capability as it ships.
 *   2026-11-13 — a beta tester whose grant ends keeps writing on Free; Pro never holds a writer's work hostage.
 *
 * Built dark AND fail-closed. Free admission takes effect only when ALL of these are exactly "true":
 *   WS_FREE_ADMISSION_ENABLED   — the door itself;
 *   WS_FREE_WORK_LIMIT_ENABLED  — step A: Free may not start a second Work;
 *   WS_PRO_GATE_ENABLED         — the whole-book pass (writing.wholeWork) is Pro, not open to everyone.
 * If the door is set but either boundary is not, nobody new is admitted: the 2026-11-02 precondition ("boundary
 * enforced before admission opens") is a property of the code, not a deploy checklist.
 */
// Deliberately import-free (pure env reads): it is reached from betaAccessServer, which the arrival route may import
// under the F7 "the opening conversation is never kept" invariant (arrival/__tests__/route.test.ts pins its imports).
// The two boundary names below are kept identical to workLimit.freeWorkLimitEnabled and
// wholeWorkEntitlement.proGateEnabled by __tests__/freeAdmission.test.ts.
type Env = Record<string, string | undefined>;
const freeWorkLimitEnabled = (env: Env) => env.WS_FREE_WORK_LIMIT_ENABLED === 'true';
const proGateEnabled = (env: Env) => env.WS_PRO_GATE_ENABLED === 'true';

export function freeAdmissionRequested(env: Env = process.env): boolean {
  return env.WS_FREE_ADMISSION_ENABLED === 'true';
}

/** Which Free/Pro boundaries are not yet on. Empty = Free admission may open. */
export function freeAdmissionMissingBoundaries(env: Env = process.env): Array<'WS_FREE_WORK_LIMIT_ENABLED' | 'WS_PRO_GATE_ENABLED'> {
  const missing: Array<'WS_FREE_WORK_LIMIT_ENABLED' | 'WS_PRO_GATE_ENABLED'> = [];
  if (!freeWorkLimitEnabled(env)) missing.push('WS_FREE_WORK_LIMIT_ENABLED');
  if (!proGateEnabled(env)) missing.push('WS_PRO_GATE_ENABLED');
  return missing;
}

let warned = false;

/** True only when the door is set AND both boundaries are on. */
export function freeAdmissionOpen(env: Env = process.env): boolean {
  if (!freeAdmissionRequested(env)) return false;
  const missing = freeAdmissionMissingBoundaries(env);
  if (missing.length === 0) return true;
  if (!warned) {
    warned = true;
    console.warn(`[writers-studio] WS_FREE_ADMISSION_ENABLED is set but Free admission stays CLOSED until ${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} "true".`);
  }
  return false;
}
