/**
 * Registry-to-House drift guard.
 *
 * The failure this catches is NOT "a boundary is missing from the House" — the
 * House is deliberately not a complete registry. It is "a boundary has no
 * declared relationship to the House at all", which is how Book Studio and Lab
 * Tools sat silently undispositioned for two weeks after the rail retired.
 *
 * Founder ruling (Kelly, 2026-08-04): not every registered place must be in the
 * House, but none may remain silently undispositioned.
 */
import { HOUSE_DESTINATIONS } from '../houseDestinations';
import { MAIA_BOUNDARIES } from '../maiaNav';
import {
  BOUNDARY_DISPOSITIONS,
  DESTINATION_EXCEPTIONS,
  undispositionedBoundaries,
  unexplainedDestinations,
  isOrphan,
} from '../houseDispositions';

const destIds = new Set(HOUSE_DESTINATIONS.map((d) => d.id));

describe('1. every MAIA_BOUNDARY has a declared House disposition', () => {
  it('no boundary is silently undispositioned', () => {
    expect(undispositionedBoundaries()).toEqual([]);
  });

  it('every disposition carries a rationale — silence is the failure mode', () => {
    for (const [id, d] of Object.entries(BOUNDARY_DISPOSITIONS)) {
      expect(`${id}:${d.rationale.length > 20}`).toBe(`${id}:true`);
    }
  });

  it('declares no disposition for a boundary that does not exist', () => {
    const boundaryIds = new Set(MAIA_BOUNDARIES.map((b) => b.id));
    for (const id of Object.keys(BOUNDARY_DISPOSITIONS)) {
      expect(`${id}:${boundaryIds.has(id)}`).toBe(`${id}:true`);
    }
  });
});

describe('2. offered / founder_only boundaries resolve to a valid destination', () => {
  it('each names a destination that actually exists', () => {
    for (const [id, d] of Object.entries(BOUNDARY_DISPOSITIONS)) {
      if (d.disposition === 'offered' || d.disposition === 'founder_only') {
        expect(`${id}->${d.destinationId}:${destIds.has(d.destinationId!)}`).toBe(
          `${id}->${d.destinationId}:true`,
        );
      }
    }
  });

  it('withheld / contextual / superseded name NO destination', () => {
    for (const [id, d] of Object.entries(BOUNDARY_DISPOSITIONS)) {
      if (!['offered', 'founder_only'].includes(d.disposition)) {
        expect(`${id}:${d.destinationId ?? 'none'}`).toBe(`${id}:none`);
      }
    }
  });
});

describe('3. every House destination resolves back, or carries an explicit exception', () => {
  it('no destination is unexplained', () => {
    expect(unexplainedDestinations()).toEqual([]);
  });

  it('every exception names a real destination and gives a reason', () => {
    for (const [id, reason] of Object.entries(DESTINATION_EXCEPTIONS)) {
      expect(`${id}:${destIds.has(id)}`).toBe(`${id}:true`);
      expect(`${id}:${reason.length > 20}`).toBe(`${id}:true`);
    }
  });
});

describe('4. withheld / contextual / superseded are NOT orphans', () => {
  it('Lab Tools is withheld by ruling and must never be reported as an orphan', () => {
    expect(BOUNDARY_DISPOSITIONS.labtools.disposition).toBe('intentionally_withheld');
    expect(isOrphan('labtools')).toBe(false);
    expect(destIds.has('labtools')).toBe(false); // and it stays out of the House
  });

  it('an UNDISPOSITIONED boundary IS an orphan — the actual failure', () => {
    expect(isOrphan('some-boundary-nobody-dispositioned')).toBe(true);
  });

  it('no boundary is currently an orphan', () => {
    const orphans = MAIA_BOUNDARIES.map((b) => b.id).filter(isOrphan);
    expect(orphans).toEqual([]);
  });
});

/**
 * Studio identities. Three distinct places that share a word and must never be
 * collapsed — the distinction is the WORK, not the status of the person.
 */
describe('the three studios stay distinct', () => {
  const find = (id: string) => HOUSE_DESTINATIONS.find((d) => d.id === id)!;

  it("Writer's Studio → /press/studio (Layer 2 environment), never the Layer 3 desk", () => {
    expect(find('studio').route).toBe('/press/studio');
    expect(find('studio').route).not.toBe('/press/manuscript');
  });

  it('Book Studio → /book-studio, distinct from both other studios', () => {
    expect(find('book-studio').route).toBe('/book-studio');
    expect(find('book-studio').route).not.toBe('/press/studio');
    expect(find('book-studio').route).not.toBe('/studio');
  });

  it('Pro Studio → /studio, one threshold', () => {
    expect(find('pro-studio').route).toBe('/studio');
  });

  it('three separate destinations, three separate routes', () => {
    const routes = ['studio', 'book-studio', 'pro-studio'].map((id) => find(id).route);
    expect(new Set(routes).size).toBe(3);
  });

  it('all three are declared Steward-level long-term, whatever the interim gate', () => {
    expect(BOUNDARY_DISPOSITIONS['book-studio'].authorization).toBe('steward');
    expect(BOUNDARY_DISPOSITIONS.studio.authorization).toBe('steward');
    expect(BOUNDARY_DISPOSITIONS['vision-studio'].authorization).toBe('steward');
  });
});
