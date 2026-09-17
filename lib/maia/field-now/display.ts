/**
 * EAA-03 / P1 — how a kept thing is allowed to describe itself.
 *
 * Pure. No React, no network, no model. Everything here is a truthful
 * restatement of a stored value; nothing is summarized, titled, classified or
 * inferred (P1-D §XII, §XIV).
 */

/**
 * Source phrasing, deliberately PARTIAL.
 *
 * Only source types whose origin the repository actually establishes appear
 * here. `journal`, `dream` and `reflection` are omitted ON PURPOSE: the atoms
 * migration (20260521000001) marks each of them "source bridge stub for now",
 * so naming a Journal or a dream as the origin would assert a link the schema
 * itself says is not yet made. `idea_block`, `decision` and `change` are
 * omitted because they denote blocks within an idea, which no short phrase
 * names truthfully.
 *
 * An unmapped source type shows NO source line. A gap is left as a gap rather
 * than filled by inference.
 */
export const SOURCE_PHRASE: Readonly<Record<string, string>> = Object.freeze({
  idea: 'From your Ideas',
  session_excerpt: 'From a conversation with MAIA',
  spontaneous: 'You wrote this directly',
});

/** The source line for a kept thing, or null when none can be told truthfully. */
export function sourcePhrase(sourceType: string): string | null {
  return SOURCE_PHRASE[sourceType] ?? null;
}

/**
 * "Kept September 16" — and the year as well when it is not the current one,
 * because "September 16" alone would read as this year and quietly misdate the
 * member's own act.
 */
export function formatKeptAt(value: string | Date, now: Date = new Date()): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const sameYear = d.getFullYear() === now.getFullYear();
  return `Kept ${d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })}`;
}
