/**
 * "New to you" badge rule.
 *
 * The headline case is the deploy-day one: an established member whose whole
 * lab was just backfilled with a null `last_used_at` must NOT receive a wall
 * of NEW badges. That is the defect this rule exists to prevent, so it is the
 * first test.
 */

import {
  isNewToMember,
  LAB_SEED_WINDOW_MS,
  NEW_BADGE_MAX_AGE_MS,
} from '../newness';

const NOW = new Date('2026-08-04T12:00:00Z');
const days = (n: number) => n * 24 * 60 * 60 * 1000;
const at = (offsetMs: number) => new Date(NOW.getTime() + offsetMs);

describe('isNewToMember — the deploy-day regression', () => {
  it('gives an established member ZERO badges when recency is first backfilled', () => {
    // A lab seeded 6 months ago: 41 rows, all inserted in the same batch,
    // all with last_used_at NULL because the column has only just been added.
    const labSeededAt = at(-days(180));
    const shelf = Array.from({ length: 41 }, (_, i) => ({
      // seeding inserts land within seconds of each other
      addedAt: at(-days(180) + i * 400),
      lastUsedAt: null,
      labSeededAt,
      now: NOW,
    }));

    const badged = shelf.filter(isNewToMember);

    expect(badged).toHaveLength(0);
  });

  it('gives a brand-new member ZERO badges on their first visit', () => {
    // Everything arrived in one seeding batch moments ago. All of it is new,
    // so badging all of it communicates nothing.
    const labSeededAt = at(-2000);
    const shelf = Array.from({ length: 41 }, (_, i) => ({
      addedAt: at(-2000 + i * 30),
      lastUsedAt: null,
      labSeededAt,
      now: NOW,
    }));

    expect(shelf.filter(isNewToMember)).toHaveLength(0);
  });
});

describe('isNewToMember — what SHOULD badge', () => {
  const labSeededAt = at(-days(180));

  it('badges a tool backfilled into an existing lab after the registry gained it', () => {
    expect(
      isNewToMember({
        addedAt: at(-days(2)),
        lastUsedAt: null,
        labSeededAt,
        now: NOW,
      })
    ).toBe(true);
  });

  it('badges a tool the member just added from Discover', () => {
    expect(
      isNewToMember({
        addedAt: at(-60_000),
        lastUsedAt: null,
        labSeededAt,
        now: NOW,
      })
    ).toBe(true);
  });

  it('badges exactly the one new arrival, not the rest of the shelf', () => {
    const shelf = [
      ...Array.from({ length: 40 }, (_, i) => ({
        addedAt: at(-days(180) + i * 400),
        lastUsedAt: null,
        labSeededAt,
        now: NOW,
      })),
      { addedAt: at(-days(1)), lastUsedAt: null, labSeededAt, now: NOW },
    ];

    expect(shelf.filter(isNewToMember)).toHaveLength(1);
  });
});

describe('isNewToMember — what retires the badge', () => {
  const labSeededAt = at(-days(180));

  it('retires on first open, however recent the arrival', () => {
    expect(
      isNewToMember({
        addedAt: at(-days(1)),
        lastUsedAt: at(-60_000),
        labSeededAt,
        now: NOW,
      })
    ).toBe(false);
  });

  it('retires once the arrival is no longer news, even if never opened', () => {
    expect(
      isNewToMember({
        addedAt: at(-(NEW_BADGE_MAX_AGE_MS + 1000)),
        lastUsedAt: null,
        labSeededAt,
        now: NOW,
      })
    ).toBe(false);
  });

  it('still badges just inside the news window', () => {
    expect(
      isNewToMember({
        addedAt: at(-(NEW_BADGE_MAX_AGE_MS - 60_000)),
        lastUsedAt: null,
        labSeededAt,
        now: NOW,
      })
    ).toBe(true);
  });
});

describe('isNewToMember — the seeding-batch boundary', () => {
  const labSeededAt = at(-days(180));

  it('treats a row inside the seed window as seeded, not arrived', () => {
    expect(
      isNewToMember({
        addedAt: new Date(labSeededAt.getTime() + LAB_SEED_WINDOW_MS - 1000),
        lastUsedAt: null,
        labSeededAt,
        now: NOW,
      })
    ).toBe(false);
  });

  it('treats a row just outside the seed window as an arrival', () => {
    // ...but only if it is also still within the news window, so use a lab
    // seeded recently enough for both conditions to be satisfiable.
    const recentSeed = at(-days(3));
    expect(
      isNewToMember({
        addedAt: new Date(recentSeed.getTime() + LAB_SEED_WINDOW_MS + 1000),
        lastUsedAt: null,
        labSeededAt: recentSeed,
        now: NOW,
      })
    ).toBe(true);
  });

  it('treats the earliest row itself as seeded', () => {
    expect(
      isNewToMember({
        addedAt: labSeededAt,
        lastUsedAt: null,
        labSeededAt,
        now: NOW,
      })
    ).toBe(false);
  });
});

describe('isNewToMember — malformed input', () => {
  it('does not badge when timestamps are unparseable', () => {
    expect(
      isNewToMember({
        addedAt: 'not-a-date',
        lastUsedAt: null,
        labSeededAt: at(-days(180)),
        now: NOW,
      })
    ).toBe(false);
  });

  it('accepts ISO strings as well as Dates', () => {
    expect(
      isNewToMember({
        addedAt: at(-days(1)).toISOString(),
        lastUsedAt: null,
        labSeededAt: at(-days(180)).toISOString(),
        now: NOW,
      })
    ).toBe(true);
  });
});
