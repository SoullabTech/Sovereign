/**
 * FR-C / FR-D — the state obligations, executable.
 *
 * These exist because the defect they guard is INVISIBLE ONCE MADE. Before
 * 2026-09-07 an unavailable destination reached a member carrying nothing but
 * `opacity: 0.55`, and a mode that could not be entered rendered identically
 * to one that could. Both read as correct in review; both were found only by
 * a founder walking the Studio and reporting what they could not understand.
 *
 * So the obligations are asserted rather than remembered.
 */

import {
  STUDIO_MAP,
  STUDIO_MODES,
  UNAVAILABILITY_SAYS,
  assertNoteIsOrientation,
  assertShellPromisesNothing,
  shellDestinations,
} from '../studioMap';

describe('FR-C — a visible, unavailable destination states its state', () => {
  it('gives every non-actionable destination a reason, with a manuscript', () => {
    for (const g of shellDestinations(true)) {
      for (const d of g.destinations) {
        if (!d.actionable) {
          expect(d.unavailability).not.toBeNull();
          expect(UNAVAILABILITY_SAYS[d.unavailability!]).toBeTruthy();
        }
      }
    }
  });

  it('gives every non-actionable destination a reason, without one', () => {
    for (const g of shellDestinations(false)) {
      for (const d of g.destinations) {
        if (!d.actionable) expect(d.unavailability).not.toBeNull();
      }
    }
  });

  it('never labels an actionable destination unavailable', () => {
    for (const g of shellDestinations(true)) {
      for (const d of g.destinations) {
        if (d.actionable) expect(d.unavailability).toBeNull();
      }
    }
  });

  /**
   * The distinction the walk proved is owed. A destination that exists but has
   * no subject must NOT be described as unbuilt — that would tell a writer the
   * room does not exist when it is one act away from opening.
   */
  it('separates "nothing to bring" from "not built"', () => {
    const withWork = shellDestinations(true).flatMap((g) => g.destinations);
    const without = shellDestinations(false).flatMap((g) => g.destinations);
    const gated = without.filter(
      (d) => d.unavailability === 'no-subject',
    );
    expect(gated.length).toBeGreaterThan(0);
    for (const d of gated) {
      const same = withWork.find((x) => x.id === d.id)!;
      // The same destination becomes actionable once a Work exists.
      expect(same.actionable).toBe(true);
    }
  });

  it('says something different for each state', () => {
    expect(UNAVAILABILITY_SAYS.unbuilt).not.toEqual(UNAVAILABILITY_SAYS['no-subject']);
  });

  /** FR-C rejected "Coming soon": it commits to a schedule nobody ratified. */
  it('promises no delivery date', () => {
    for (const s of Object.values(UNAVAILABILITY_SAYS)) {
      expect(s.toLowerCase()).not.toContain('coming soon');
      expect(s.toLowerCase()).not.toContain('shortly');
    }
  });

  it('refuses a silent unavailable destination at the boundary', () => {
    /* A manuscript id is supplied so the map is otherwise VALID: the point of
       this test is that the FR-C obligation fires, not that some earlier
       assertion does. Without it the manuscript-scoped-link rule trips first
       and the test would pass for the wrong reason. */
    const groups = shellDestinations(true, undefined, { manuscriptId: 'm1' });
    const victim = groups.flatMap((g) => g.destinations).find((d) => !d.actionable)!;
    // Simulate the pre-FR-C shape: unavailable, and saying nothing.
    (victim as { unavailability: unknown }).unavailability = null;
    expect(() => assertShellPromisesNothing(groups)).toThrow(/says nothing about why/);
  });
});

describe('FR-D amendment 2 — note is orientation, never state', () => {
  it('holds for the shipped map', () => {
    expect(() => assertNoteIsOrientation()).not.toThrow();
  });

  /**
   * The failure this catches looks correct on the day it is written and lies
   * on the day the room ships.
   */
  it('refuses a note that states availability', () => {
    const poisoned = STUDIO_MAP.map((g) => ({
      ...g,
      destinations: g.destinations.map((d) =>
        d.id === 'notes' ? { ...d, note: 'Not available yet' } : d,
      ),
    }));
    expect(() => assertNoteIsOrientation(poisoned)).toThrow(/orientation/);
  });

  /** Emptiness is legitimate. Filling sixteen fields is the clutter FR-D forbids. */
  it('does not require every destination to carry one', () => {
    const withNote = STUDIO_MAP.flatMap((g) => g.destinations).filter((d) => d.note);
    const all = STUDIO_MAP.flatMap((g) => g.destinations);
    expect(withNote.length).toBeGreaterThan(0);
    expect(withNote.length).toBeLessThan(all.length);
  });
});

describe('F2 — no mode may look actionable and answer with silence', () => {
  it('has a mode that is built but has no subject', () => {
    const built = STUDIO_MODES.filter((m) => m.availability === 'available');
    expect(built.length).toBeGreaterThan(0);
  });

  it('has at least one unbuilt mode, so the distinction is live', () => {
    expect(STUDIO_MODES.some((m) => m.availability === 'later')).toBe(true);
  });
});
