/**
 * "New to you" — what the NEW badge on a Lab instrument may mean.
 *
 * The defect this exists to prevent: `last_used_at IS NULL` means *never
 * opened*, which is not the same as *new*. A recency migration backfills
 * every existing row as never-opened, so a badge keyed on that alone would
 * light up the member's entire shelf on deploy day — reproducing exactly the
 * badge-noise the redesign set out to remove.
 *
 * The signal used instead is member-relative provenance: `added_at`, which
 * records when the instrument entered THIS member's lab.
 *
 * An instrument is new to a member when all three hold:
 *   1. they have never opened it;
 *   2. it ARRIVED after their lab was already set up -- it was not part of
 *      the initial seeding batch (which all lands within seconds);
 *   3. it arrived recently enough to still be news.
 *
 * Consequences, all intended:
 *   - established member, day of deploy      -> zero badges
 *   - brand-new member, everything seeded    -> zero badges (all of it is
 *     new; saying so on all 41 cards says nothing)
 *   - registry gains a tool, backfilled in   -> that one tool badges
 *   - member adds one from Discover          -> it badges until opened
 *   - added months ago, still never opened   -> stops badging; it is not
 *     news any more, it is just unused
 *
 * Deliberately NOT used: the registry's `isNew` flag. That is builder-time
 * and goes stale -- eleven tools carry it today -- and it says nothing about
 * whether the thing is new to any particular person.
 */

/**
 * How long after the earliest `added_at` a row still counts as part of the
 * member's initial seeding batch rather than a later arrival. Seeding inserts
 * land within seconds; an hour is a generous margin.
 */
export const LAB_SEED_WINDOW_MS = 60 * 60 * 1000;

/** After this long, an unopened arrival stops being news. */
export const NEW_BADGE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface NewnessInput {
  /** When this instrument entered the member's lab */
  addedAt: Date | string;
  /** When the member last opened it, or null if never */
  lastUsedAt: Date | string | null;
  /** Earliest `added_at` across the member's whole lab */
  labSeededAt: Date | string;
  /** Evaluation time (injected so the rule is testable) */
  now?: Date;
}

function ms(v: Date | string): number {
  return v instanceof Date ? v.getTime() : new Date(v).getTime();
}

export function isNewToMember({
  addedAt,
  lastUsedAt,
  labSeededAt,
  now = new Date(),
}: NewnessInput): boolean {
  // 1. Opening it retires the badge permanently.
  if (lastUsedAt) return false;

  const added = ms(addedAt);
  const seeded = ms(labSeededAt);
  if (Number.isNaN(added) || Number.isNaN(seeded)) return false;

  // 2. Part of the initial seeding batch is not an arrival.
  if (added - seeded <= LAB_SEED_WINDOW_MS) return false;

  // 3. Old enough that it is no longer news.
  if (now.getTime() - added > NEW_BADGE_MAX_AGE_MS) return false;

  return true;
}
