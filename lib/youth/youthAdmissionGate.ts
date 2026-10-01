/**
 * TEEN-CLOSED-01: teen registration is closed until the server-side crisis
 * detector is live and teen safety is separately decided (founder ruling
 * 2026-10-01, SAFETY-CRISIS-01 record §6).
 *
 * Before this, "closed" meant no invites went to minors: discipline, not
 * structure. A minor holding an invite who gave a birth date got a youth tier
 * and the youth onboarding path. This gate refuses, on the server, any birth
 * date that computes to under 18. It runs wherever a member's birth date is
 * written: registration and the profile update (where a later edit would
 * otherwise recompute the member into a youth tier).
 *
 * What it does NOT do: registration paths that collect no birth date (Google,
 * Apple, team invite, Now What) have no age signal to check. Birth date stays
 * optional, so an under-18 member who gives none is not detected. Closing that
 * requires collecting age, which is a separate decision.
 *
 * Pure. Logs nothing: a birth date is personal data and is never written to a log.
 */
import { computeTierFromBirthDate } from './ageTierEngine';

export const YOUTH_NOT_YET_OPEN_MESSAGE =
  "MAIA isn't available yet for people under 18. We're building a version designed for younger members, and it isn't ready.";

export type YouthGateResult =
  | { ok: true }
  | { ok: false; status: 400 | 403; code: 'INVALID_BIRTH_DATE' | 'YOUTH_NOT_YET_OPEN'; error: string };

/**
 * `birthDate` absent (undefined, null, empty) is allowed: it is optional.
 * A present value must be a real date, and must compute to an adult.
 */
export function checkYouthAdmission(birthDate: unknown, now: Date = new Date()): YouthGateResult {
  if (birthDate === undefined || birthDate === null || birthDate === '') return { ok: true };
  if (typeof birthDate !== 'string' && !(birthDate instanceof Date)) {
    return { ok: false, status: 400, code: 'INVALID_BIRTH_DATE', error: 'Birth date is not a valid date.' };
  }
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (Number.isNaN(d.getTime()) || d.getTime() > now.getTime()) {
    return { ok: false, status: 400, code: 'INVALID_BIRTH_DATE', error: 'Birth date is not a valid date.' };
  }
  if (computeTierFromBirthDate(d) !== 'adult') {
    return { ok: false, status: 403, code: 'YOUTH_NOT_YET_OPEN', error: YOUTH_NOT_YET_OPEN_MESSAGE };
  }
  return { ok: true };
}
