/**
 * The way back — making `HouseDestination.returnBehavior` load-bearing.
 *
 * WHY THIS EXISTS. `lib/navigation/houseDestinations.ts` has declared
 * `returnBehavior: 'back-to-maia'` on eight destinations since the House
 * shipped. The field is typed, exhaustively populated and reviewed — and until
 * this module it was read by NOTHING. A member could enter Journal, Living
 * Field or Keeps from the House and then had no way back to MAIA at all: no
 * link, no button, no rail, nothing in the entire component closure of those
 * pages. The registry asserted a return that no surface implemented.
 *
 * That is the specific defect class this module closes: a declaration is not a
 * behaviour. `MAIA_HOME` and `ReturnToMaia` give the declared return exactly
 * one implementation, and `lib/navigation/__tests__/houseReturn.test.ts` fails
 * the build if a `back-to-maia` destination ever loses it again.
 *
 * WHAT IS DELIBERATELY NOT HERE. `sheet-close` needs nothing (a sheet closes
 * onto /maia in place) and `web-bridge` destinations leave the app for the web
 * by design — their return is the browser, and inventing an in-app affordance
 * for them would assert a continuity that does not exist. Only 'back-to-maia'
 * is this module's business.
 *
 * @see lib/navigation/houseDestinations.ts — where the behaviour is declared
 * @see components/navigation/ReturnToMaia.tsx — the single affordance
 */

import { HOUSE_DESTINATIONS, type HouseDestination } from './houseDestinations';

/**
 * MAIA's own route — the centre of the House, and the one destination every
 * 'back-to-maia' room returns to.
 *
 * Sourced from the registry rather than written as a literal, so the centre
 * cannot be moved in one file and forgotten in another.
 */
export const MAIA_HOME: string =
  HOUSE_DESTINATIONS.find((d) => d.id === 'maia')?.route ?? '/maia';

/**
 * What the way back is called, everywhere.
 *
 * The visible word is the PLACE ("MAIA"), matching the House label, because a
 * doorway is named for where it leads. The accessible name is the full phrase,
 * because a screen-reader user meets the link without the room around it.
 */
export const RETURN_LABEL = 'MAIA';
export const RETURN_ARIA_LABEL = 'Return to MAIA';

/**
 * Destinations that promise a way back to MAIA, minus MAIA itself.
 *
 * The centre is excluded because it is not a room a member can be stranded in:
 * it is where the return goes.
 */
export function destinationsRequiringReturn(): HouseDestination[] {
  return HOUSE_DESTINATIONS.filter(
    (d) => d.returnBehavior === 'back-to-maia' && d.id !== 'maia' && d.kind === 'route',
  );
}

/** The routes those destinations open. */
export function routesRequiringReturn(): string[] {
  return destinationsRequiringReturn()
    .map((d) => d.route)
    .filter((r): r is string => Boolean(r));
}
