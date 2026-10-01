/**
 * MEMBER-ADULT-ACK-01: the registration age rule. Pure; no database.
 *
 * Founder ruling 2026-10-01: youth is CLOSED for now. Every registration must
 * carry the member's own confirmation that they are 18 or older. A birth date,
 * when given, can only make registration STRICTER: a date showing the person is
 * under 18 refuses registration even if the box was ticked. It can never stand
 * in for the confirmation.
 *
 * The youth path (lib/youth/*, /onboarding/youth) stays in code but is
 * unreachable until it is deliberately reopened.
 */

export const ADULT_ACK_KIND = 'adult_18_plus' as const;
export const ADULT_ACK_VERSION = 1;
export const ADULT_MIN_AGE = 18;

/** The exact words the member confirms. Shown by every surface that records the act. */
export const ADULT_ACK_COPY = "I confirm I'm 18 or older.";

export type AdultRegistrationRefusal =
  | 'adult_confirmation_required'
  | 'invalid_birth_date'
  | 'under_18';

export type AdultRegistrationDecision =
  | { ok: true }
  | { ok: false; reason: AdultRegistrationRefusal };

/** Parses a strict YYYY-MM-DD calendar date. Anything else is null. */
export function parseBirthDate(value: unknown): { y: number; m: number; d: number } | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

/** Whole years between a calendar birth date and `now` (UTC calendar day). */
export function ageOn(birth: { y: number; m: number; d: number }, now: Date): number {
  let age = now.getUTCFullYear() - birth.y;
  const month = now.getUTCMonth() + 1;
  if (month < birth.m || (month === birth.m && now.getUTCDate() < birth.d)) age--;
  return age;
}

export function decideAdultRegistration(input: {
  confirmsAdult: unknown;
  birthDate?: unknown;
  now?: Date;
}): AdultRegistrationDecision {
  // Only a literal `true` is a confirmation. "true", 1, "yes" are not.
  if (input.confirmsAdult !== true) {
    return { ok: false, reason: 'adult_confirmation_required' };
  }
  const raw = input.birthDate;
  if (raw === undefined || raw === null || raw === '') return { ok: true };
  const birth = parseBirthDate(raw);
  if (!birth) return { ok: false, reason: 'invalid_birth_date' };
  const age = ageOn(birth, input.now ?? new Date());
  if (age < 0 || age > 130) return { ok: false, reason: 'invalid_birth_date' };
  if (age < ADULT_MIN_AGE) return { ok: false, reason: 'under_18' };
  return { ok: true };
}

export function adultRefusalMessage(reason: AdultRegistrationRefusal): string {
  switch (reason) {
    case 'adult_confirmation_required':
      return "Please confirm you're 18 or older to create an account.";
    case 'invalid_birth_date':
      return 'That birth date could not be read. Please use the format YYYY-MM-DD.';
    case 'under_18':
      return 'Soullab is open to adults (18+) only for now.';
  }
}
