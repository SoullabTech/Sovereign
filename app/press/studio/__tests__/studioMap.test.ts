import {
  assertStudioMapHonest,
  STUDIO_MAP,
  visibleDestinations,
  type StudioGroup,
} from '../studioMap';

/**
 * The Studio shell exists to keep one promise: navigation may not claim
 * capability that is absent. These tests make that promise executable rather
 * than leaving it to review, because the failure mode is silent — an unbuilt
 * room given an href looks exactly like a built one until a member clicks it.
 */
describe('Author Studio map — honesty invariant', () => {
  it('ships honest: no unbuilt destination carries a link', () => {
    expect(() => assertStudioMapHonest()).not.toThrow();
  });

  it('rejects an unbuilt destination that has been given a link', () => {
    const dishonest: StudioGroup[] = [
      {
        id: 'later',
        destinations: [{ id: 'shape', label: 'Shape', availability: 'later', href: '/press/shape' }],
      },
    ];
    expect(() => assertStudioMapHonest(dishonest)).toThrow(/not built but carries an href/);
  });

  it('rejects an available destination with nowhere to go (a dead link)', () => {
    const dishonest: StudioGroup[] = [
      { id: 'x', destinations: [{ id: 'write', label: 'Working Draft', availability: 'available' }] },
    ];
    expect(() => assertStudioMapHonest(dishonest)).toThrow(/nowhere to go/);
  });

  it('names the three deferred surfaces as not yet available', () => {
    const later = STUDIO_MAP.flatMap((g) => g.destinations).filter(
      (d) => d.availability === 'later',
    );
    expect(later.map((d) => d.label).sort()).toEqual(['Gatherings', 'Release', 'Shape']);
    // The whole point: they are visible for orientation, and inert.
    expect(later.every((d) => d.href === undefined)).toBe(true);
  });
});

describe('Author Studio map — what a member sees', () => {
  it('offers Import before a manuscript exists, and hides book-scoped rooms', () => {
    const labels = visibleDestinations(false)
      .flatMap((g) => g.destinations)
      .map((d) => d.label);

    expect(labels).toContain('Import Manuscript');
    // An empty Studio should show one real door, not a row of greyed-out ones.
    expect(labels).not.toContain('Working Draft');
    expect(labels).not.toContain('Source');
  });

  it('offers the working surfaces once a manuscript exists', () => {
    const labels = visibleDestinations(true)
      .flatMap((g) => g.destinations)
      .map((d) => d.label);

    expect(labels).toContain('Working Draft');
    expect(labels).toContain('Source');
    // Import stays reachable — a second book is not a regression.
    expect(labels).toContain('Import Manuscript');
  });

  it('always offers Home, so the member is never stranded on a working surface', () => {
    for (const has of [true, false]) {
      const labels = visibleDestinations(has)
        .flatMap((g) => g.destinations)
        .map((d) => d.label);
      expect(labels).toContain('Home');
    }
  });

  it('never drops a group to an empty heading', () => {
    for (const has of [true, false]) {
      for (const group of visibleDestinations(has)) {
        expect(group.destinations.length).toBeGreaterThan(0);
      }
    }
  });
});
