/**
 * MEMBER-ADULT-ACK-01 — founder ruling 2026-10-01: youth is CLOSED for now.
 *
 * The youth path (age-tier engine, /onboarding/youth, TeenOnboarding) stays in
 * code but is unreachable while this is false. Reopening it is a deliberate
 * founder act: flip this constant AND revisit registration, which refuses
 * under-18 birth dates (lib/members/adultConfirmation.ts).
 */
export const YOUTH_PATH_OPEN = false;

/** Where a youth-tier member goes while the youth path is closed. */
export const YOUTH_CLOSED_ROUTE = '/onboarding/youth-coming-soon';
