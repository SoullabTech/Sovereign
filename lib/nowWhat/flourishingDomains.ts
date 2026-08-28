/**
 * Flourishing domain vocabulary — the ONE shared source (NW-D01.5 R1, 2026-08-26).
 *
 * WHY THIS EXISTS
 * The repository carried two competing vocabularies. The runtime path (the
 * `flourishing_dimension` CHECK constraint, the My Work room, the room's
 * cultivate doors) held six domains; `scripts/seed/seed-flourishing-field.ts`
 * still declared five, including an invented "attention", three weeks after the
 * IP corpus audit named that exact file. Because the seed writes
 * `practice_fields.about_practice` and `maia_guidance`, and both compose into
 * MAIA's system prompt (`practiceFieldService.formatFieldContextForRoom`), the
 * stale list was a prompt-content defect one command away — not a docs defect.
 *
 * PROVENANCE — read before treating this list as settled
 * These six are **Larry-derived via founder report** of a talk corpus that is
 * NOT HELD, they are **unvalidated** (the one validation attempt pre-filled
 * Soullab's wrong five as tickboxes, so its answers are compromised — see
 * `docs/governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md` §0), and they are
 * **unlicensed** (the Larry Materials Agreement is unsigned and Attachment A
 * does not exist).
 *
 * ⛔ This file is a CONVERGENCE mechanism, not a ratification. That the schema
 * enforces these values is not evidence that Larry confirmed them. The domains
 * must be captured in Larry's own language at the custody sitting — never
 * re-derived from our own documents, which is how the drift happened.
 *
 * AUTHORITY
 * `database/migrations/20260805200001_flourishing_dimension.sql` holds the CHECK
 * constraint and is the enforcing authority. This constant must match it
 * exactly; `__tests__/now-what-flourishing-vocabulary.test.ts` parses the
 * migration and fails if they diverge.
 */

/** Canonical domain slugs. Order is the order the My Work room presents them. */
export const FLOURISHING_DOMAIN_SLUGS = [
  'relationships',
  'meaning',
  'presence',
  'health',
  'contribution',
  'time',
] as const;

export type FlourishingDomainSlug = (typeof FLOURISHING_DOMAIN_SLUGS)[number];

/**
 * Slugs rendered for prose. Deliberately NOT the member-facing display names —
 * those live with the surfaces that show them, because copy is a design concern
 * and this file is a vocabulary authority. This is for generated text (the seed)
 * that must name the domains without hardcoding a list.
 */
export const FLOURISHING_DOMAIN_PROSE: Record<FlourishingDomainSlug, string> = {
  relationships: 'relationships',
  meaning: 'meaning and purpose',
  presence: 'presence',
  health: 'health and energy',
  contribution: 'contribution',
  time: 'time affluence',
};

/** e.g. "relationships, meaning and purpose, presence, health and energy, contribution, and time affluence" */
export function flourishingDomainSentenceList(): string {
  const names = FLOURISHING_DOMAIN_SLUGS.map((s) => FLOURISHING_DOMAIN_PROSE[s]);
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/**
 * Startup assertion for scripts that write domain vocabulary into prompt-bound
 * columns. Throws rather than composing a vocabulary the database would reject.
 */
export function assertFlourishingVocabulary(candidate: readonly string[]): void {
  const expected = [...FLOURISHING_DOMAIN_SLUGS].sort().join(',');
  const actual = [...candidate].sort().join(',');
  if (expected !== actual) {
    throw new Error(
      `REFUSED: flourishing vocabulary diverges from the canonical set.\n` +
        `  expected: ${expected}\n  got:      ${actual}\n` +
        `The CHECK constraint in 20260805200001_flourishing_dimension.sql is the authority.`,
    );
  }
}
