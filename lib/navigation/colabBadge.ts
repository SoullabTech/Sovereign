/**
 * Co-lab badge — directed-attention count, shared by every surface that offers
 * Co-lab.
 *
 * Extracted from MaiaLeftRail (2026-07-22) when the House became the member's
 * navigation. The rail owned this logic privately; the House now needs the same
 * count and the same visibility rule, and two copies of a polling fetch would
 * drift. The module-scoped guard is the point: the poll floor and backoff hold
 * ACROSS mounts and across surfaces, so mounting Co-lab in two places does not
 * double the request rate.
 *
 * The count is DIRECTED attention only — open For-You loops + unread DMs.
 * Ambient channel activity is excluded server-side by /api/team/colab-badge.
 * This is coordination presence, NOT a MAIA engagement bell: no manufactured
 * urgency. The number reflects real obligations and returns to zero when they
 * are handled.
 */

// Values carried over from MaiaLeftRail unchanged — extraction must not alter
// the request rate.
const BADGE_POLL_MS = 20000;
const BADGE_BACKOFF_MAX_MS = 5 * 60 * 1000;

let badgeInFlight: Promise<number> | null = null;
let badgeLastFetchAt = 0;
let badgeLastTotal = 0;
let badgeFailures = 0;

/** Current poll interval, backing off exponentially while the endpoint fails. */
export function badgeDelay(): number {
  if (badgeFailures === 0) return BADGE_POLL_MS;
  return Math.min(BADGE_POLL_MS * 2 ** badgeFailures, BADGE_BACKOFF_MAX_MS);
}

/** Last known count, without triggering a fetch. Safe for first render. */
export function lastColabTotal(): number {
  return badgeLastTotal;
}

/**
 * Fetch the directed-attention count. Reuses an in-flight request and honours
 * the poll/backoff floor across remounts, so extra call sites are free.
 * Never rejects — on failure it backs off and returns the last known total.
 */
export function fetchColabBadge(): Promise<number> {
  if (badgeInFlight) return badgeInFlight;
  if (Date.now() - badgeLastFetchAt < badgeDelay()) return Promise.resolve(badgeLastTotal);
  badgeLastFetchAt = Date.now();
  badgeInFlight = fetch('/api/team/colab-badge')
    .then((r) => {
      if (!r.ok) throw new Error(`colab-badge ${r.status}`);
      return r.json();
    })
    .then((d) => {
      badgeFailures = 0;
      badgeLastTotal = d.total ?? 0;
      return badgeLastTotal;
    })
    .catch(() => {
      badgeFailures = Math.min(badgeFailures + 1, 10);
      return badgeLastTotal;
    })
    .finally(() => { badgeInFlight = null; });
  return badgeInFlight;
}

/**
 * Co-lab's visibility rule, preserved verbatim from the rail: shown when the
 * member can ACT on Co-lab (founder/practitioner), or when they have a pending
 * count. A pure seeker never sees an empty coordination badge.
 *
 * This is why Co-lab cannot be expressed by the registry's `audience` field —
 * the rule is conditional on live state, not on membership class alone.
 */
export function isColabVisible(canAct: boolean, count: number): boolean {
  return canAct || count > 0;
}

/** "Co-lab" or "Co-lab · 7", capped at 99+. */
export function colabLabel(count: number): string {
  return count > 0 ? `Co-lab · ${count > 99 ? '99+' : count}` : 'Co-lab';
}
