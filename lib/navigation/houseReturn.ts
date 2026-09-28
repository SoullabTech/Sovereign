/**
 * The way home — making HouseDestination.returnBehavior load-bearing.
 *
 * Soullab Home is the orienting center of the member-facing platform.
 * Rooms may keep their own internal homes, shells, and navigation, but any
 * destination that declares `back-to-home` must carry a reliable path to
 * canonical `/home`. The route is explicit rather than history-dependent so
 * cold starts, deep links, restored PWAs, and native WebViews all have the same
 * way back.
 *
 * @see lib/navigation/houseDestinations.ts
 * @see components/navigation/ReturnHome.tsx
 * @see lib/navigation/__tests__/houseReturn.test.ts
 */

import { HOUSE_DESTINATIONS, type HouseDestination } from './houseDestinations';

export const SOULLAB_HOME = '/home';
export const RETURN_LABEL = 'Home';
export const RETURN_ARIA_LABEL = 'Return to Soullab Home';

export function destinationsRequiringReturn(): HouseDestination[] {
  return HOUSE_DESTINATIONS.filter(
    (d) => d.returnBehavior === 'back-to-home' && d.kind === 'route',
  );
}

export function routesRequiringReturn(): string[] {
  return destinationsRequiringReturn()
    .map((d) => d.route)
    .filter((r): r is string => Boolean(r));
}

/**
 * Compatibility alias for older imports. New code must use SOULLAB_HOME.
 * Keeping this temporarily avoids turning a semantic correction into an
 * unrelated breaking refactor.
 */
export const MAIA_HOME = SOULLAB_HOME;
