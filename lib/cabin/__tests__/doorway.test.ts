import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  CABIN_DOORWAY_ROUTES,
  cabinDoorwayPath,
  cabinReturnPath,
  hasForbiddenCabinCarry,
  isCabinOrigin,
} from '../doorway';

describe('H4.3 Cabin doorway crossing', () => {
  it('has exactly the four governed doorways', () => {
    expect(Object.keys(CABIN_DOORWAY_ROUTES).sort()).toEqual([
      'maia',
      'memory',
      'relationship',
      'work',
    ]);
  });

  it.each([
    ['work', '/writers-studio?from=cabin'],
    ['relationship', '/relationships?from=cabin'],
    ['memory', '/maia/anchor/history?from=cabin'],
    ['maia', '/maia/anchor?from=cabin'],
  ] as const)('constructs an explicit %s crossing', (doorway, expected) => {
    expect(cabinDoorwayPath(doorway)).toBe(expected);

    const url = new URL(cabinDoorwayPath(doorway), 'https://cabin.invalid');
    expect(isCabinOrigin(url.searchParams)).toBe(true);
    expect(hasForbiddenCabinCarry(url.searchParams)).toBe(false);
  });

  it('uses one fixed return target for every Cabin crossing', () => {
    expect(cabinReturnPath()).toBe('/cabin');
  });

  it('never carries semantic ids or generated meaning', () => {
    for (const doorway of Object.keys(CABIN_DOORWAY_ROUTES) as Array<
      keyof typeof CABIN_DOORWAY_ROUTES
    >) {
      const url = new URL(cabinDoorwayPath(doorway), 'https://cabin.invalid');
      expect([...url.searchParams.keys()]).toEqual(['from']);
      expect(url.searchParams.get('from')).toBe('cabin');
    }
  });

  it('detects forbidden carry if a future receiver is handed one', () => {
    expect(
      hasForbiddenCabinCarry(
        new URLSearchParams('from=cabin&workId=secret'),
      ),
    ).toBe(true);

    expect(
      hasForbiddenCabinCarry(
        new URLSearchParams('from=cabin&relationshipId=secret'),
      ),
    ).toBe(true);

    expect(
      hasForbiddenCabinCarry(
        new URLSearchParams('from=cabin&memoryId=secret'),
      ),
    ).toBe(true);
  });

  it('does not treat arbitrary origins as Cabin', () => {
    expect(
      isCabinOrigin(new URLSearchParams('from=house')),
    ).toBe(false);

    expect(
      isCabinOrigin(new URLSearchParams('from=cabin&workId=anything')),
    ).toBe(true);
  });

  it('refuses external doorway routes at the construction seam', () => {
    const source = readFileSync(join(process.cwd(), 'lib/cabin/doorway.ts'), 'utf8');
    expect(source).toContain('CABIN_DOORWAY_ROUTE_MUST_BE_INTERNAL');
    expect(source).toContain("!route.startsWith('/')");
  });
});
