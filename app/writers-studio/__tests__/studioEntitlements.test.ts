import { isEntitled, minTierFor, STUDIO_ENTITLEMENTS } from '@/lib/writersStudio/entitlements';
import { STUDIO_MAP, visibleDestinations } from '../studioMap';

const ids = (groups: ReturnType<typeof visibleDestinations>) =>
  groups.flatMap((g) => g.destinations.map((d) => d.id));

describe('Studio entitlements — shipped state changes nothing', () => {
  it('ships with no reserved destinations', () => {
    expect(Object.keys(STUDIO_ENTITLEMENTS)).toEqual([]);
  });

  it('every destination resolves to free, so every tier is offered everything', () => {
    for (const g of STUDIO_MAP) {
      for (const d of g.destinations) {
        expect(minTierFor(d.id)).toBe('free');
        expect(isEntitled(d.id, 'free')).toBe(true);
      }
    }
  });

  it('passing a tier to visibleDestinations is identical to omitting it today', () => {
    const base = ids(visibleDestinations(true));
    expect(ids(visibleDestinations(true, STUDIO_MAP, 'free'))).toEqual(base);
    expect(ids(visibleDestinations(true, STUDIO_MAP, 'pro'))).toEqual(base);
  });
});

describe('Studio entitlements — mechanism', () => {
  const table = { manuscript: 'personal' } as const;

  it('hides a reserved destination from a lower tier and offers it at or above', () => {
    expect(ids(visibleDestinations(true, STUDIO_MAP, 'free', table))).not.toContain('manuscript');
    expect(ids(visibleDestinations(true, STUDIO_MAP, 'personal', table))).toContain('manuscript');
    expect(ids(visibleDestinations(true, STUDIO_MAP, 'pro', table))).toContain('manuscript');
  });

  it('treats a missing or unknown tier as free, never as higher', () => {
    expect(isEntitled('manuscript', null, table)).toBe(false);
    expect(isEntitled('manuscript', undefined, table)).toBe(false);
    expect(isEntitled('manuscript', 'platinum' as never, table)).toBe(false);
  });

  it('leaves every other destination untouched', () => {
    const open = ids(visibleDestinations(true));
    const gated = ids(visibleDestinations(true, STUDIO_MAP, 'free', table));
    expect(gated).toEqual(open.filter((id) => id !== 'manuscript'));
  });
});
