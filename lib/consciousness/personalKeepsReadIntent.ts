/**
 * MAIA-MAVEN-T1A · J5-0 — Personal Keeps READ invocation recognizer.
 *
 * One job only: classify the member's present speech act around EXISTING
 * Personal Keeps. This module has no I/O and no authority to navigate, read,
 * persist, disclose, or mutate anything.
 *
 * Constitutional separation:
 *   NAVIGATE          operate the House; disclose nothing
 *   READ              one explicit Personal Keeps inventory request
 *   AMBIGUOUS         member named Keeps but did not yet authorize a read
 *   NONE              no T1-A act
 *
 * Creation/opening Keep intent remains governed independently by keepIntent.ts.
 */

export type PersonalKeepsReadIntentKind =
  | 'navigate_keeps'
  | 'read_keeps'
  | 'read_keeps_filtered'
  | 'ambiguous_keeps_reference'
  | 'none';

export interface PersonalKeepsReadIntentResult {
  readonly kind: PersonalKeepsReadIntentKind;
  /** Member-authored filter text only. Never inferred or expanded by this seam. */
  readonly filterText: string | null;
}

const NONE: PersonalKeepsReadIntentResult = { kind: 'none', filterText: null };

function clean(input: string): string {
  return input
    .trim()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/g, '')
    .trim();
}

function cleanFilter(value: string | undefined): string | null {
  if (!value) return null;
  const filter = value.trim().replace(/[.!?]+$/g, '').trim();
  return filter.length > 0 ? filter : null;
}

/**
 * Classify one utterance. Pattern order is authority-bearing:
 *
 * 1. filtered reads first, because "show me my Keeps about X" is a read, not
 *    navigation;
 * 2. explicit navigation next;
 * 3. unfiltered inventory reads;
 * 4. ambiguous domain mentions;
 * 5. otherwise no T1-A authority.
 */
export function detectPersonalKeepsReadIntent(
  input: string,
): PersonalKeepsReadIntentResult {
  const utterance = clean(input);
  if (!utterance) return NONE;

  // ── Filtered inventory READ ─────────────────────────────────────────────
  const filteredPatterns: RegExp[] = [
    /^which(?: of my)? keeps? mention(?:s)? (.+)$/i,
    /^do i have (?:a keep|any keeps?) about (.+)$/i,
    /^what did i keep about (.+)$/i,
    /^show me (?:my )?keeps? about (.+)$/i,
  ];

  for (const pattern of filteredPatterns) {
    const match = utterance.match(pattern);
    const filterText = cleanFilter(match?.[1]);
    if (filterText) return { kind: 'read_keeps_filtered', filterText };
  }

  // ── House NAVIGATION only ───────────────────────────────────────────────
  const navigationPatterns: RegExp[] = [
    /^open (?:my )?keeps?$/i,
    /^go to (?:my )?keeps?$/i,
    /^take me to (?:my )?keeps?$/i,
    /^show me (?:my |the )?keeps? room$/i,
  ];
  if (navigationPatterns.some((pattern) => pattern.test(utterance))) {
    return { kind: 'navigate_keeps', filterText: null };
  }

  // ── Explicit inventory READ ─────────────────────────────────────────────
  const readPatterns: RegExp[] = [
    /^what have i kept$/i,
    /^what did i keep$/i,
    /^show me my keeps?$/i,
    /^list my keeps?$/i,
    /^what are my keeps?$/i,
    /^do i have any keeps?$/i,
  ];
  if (readPatterns.some((pattern) => pattern.test(utterance))) {
    return { kind: 'read_keeps', filterText: null };
  }

  // ── Keeps named, authority not yet granted ──────────────────────────────
  const ambiguousPatterns: RegExp[] = [
    /^(?:maybe )?something in my keeps? (?:might|may|could|is) (?:be )?relevant(?: here)?$/i,
    /^there could be something in my keeps? about this$/i,
  ];
  if (ambiguousPatterns.some((pattern) => pattern.test(utterance))) {
    return { kind: 'ambiguous_keeps_reference', filterText: null };
  }

  return NONE;
}
