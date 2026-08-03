/**
 * Now What? room registry — the single definition shared by the persistent
 * shell and the environment map.
 *
 * WHY THIS EXISTS (2026-07-29): the shell knew three rooms
 * (`map`, `room`, `field`) while the map offered seven. The shell's full
 * variant renders ONLY its own pills and no location text, so a member
 * standing in `position`, `next`, `questions`, `themes` or `reflections` saw
 * navigation listing three places — none of which was where they were — and
 * `aria-current` set on nothing. The environment had grown; its hallway had
 * not.
 *
 * Three distinctions this registry preserves, because collapsing them is what
 * produced the defect:
 *
 *   EXISTENCE      a route file exists
 *   NAVIGABILITY   a member can reach it through the UI
 *   EXPOSURE       we deliberately offer it as a destination
 *
 * `exposure: 'gated'` means navigable and honest about being unfinished — the
 * map links these rooms to an explanation of what they will be, per ruling
 * 2026-07-13. They must still identify themselves when a member is standing in
 * one; they are NOT offered as shell destinations. Promoting them to peer
 * navigation would be a design change, not a truthfulness repair.
 *
 * Routes that exist but are NOT rooms are deliberately absent:
 *   /now-what/arrive    the auth door, not a place inside the environment
 *   /now-what/welcome   zero inbound links by design (EnvironmentMapView)
 *
 * Client-safe: no database, no server imports. Both consumers are
 * `'use client'` components.
 */

export type RoomExposure = 'open' | 'gated';

export interface NowWhatRoomDef {
  key: string;
  /** The member-facing name of the place. Also the shell's location label. */
  name: string;
  route: string;
  exposure: RoomExposure;
}

/**
 * Every room a member can be standing in. Order is the order the shell offers
 * them; `map` is reached from the wordmark rather than a pill, so it carries
 * `exposure: 'open'` for identification but is excluded from NAV_DESTINATIONS.
 */
export const NOW_WHAT_ROOMS: readonly NowWhatRoomDef[] = [
  // Home is the threshold, not a destination among peers — it is where a
  // person arrives and where every other room returns them. It sits first so
  // the shell offers it first. Its route is the environment root, which is why
  // roomForPath resolves exact matches before prefix matches (see below).
  { key: 'home', name: 'Home', route: '/now-what', exposure: 'open' },
  { key: 'map', name: 'Map', route: '/now-what/map', exposure: 'open' },
  { key: 'room', name: 'Session room', route: '/now-what/room', exposure: 'open' },
  { key: 'field', name: 'Your field', route: '/now-what/field', exposure: 'open' },
  { key: 'position', name: 'Where you are', route: '/now-what/position', exposure: 'open' },
  { key: 'questions', name: "Questions you're living", route: '/now-what/questions', exposure: 'open' },
  { key: 'next', name: 'What may be next', route: '/now-what/next', exposure: 'open' },
  // Gated: navigable and honest, never offered as a destination.
  { key: 'themes', name: 'Themes', route: '/now-what/themes', exposure: 'gated' },
  { key: 'reflections', name: 'Reflections', route: '/now-what/reflections', exposure: 'gated' },
] as const;

/**
 * Rooms offered as shell navigation. The map is excluded — it is the wordmark
 * — and gated rooms are excluded by design.
 */
export const NAV_DESTINATIONS: readonly NowWhatRoomDef[] = NOW_WHAT_ROOMS.filter(
  (r) => r.exposure === 'open' && r.key !== 'map',
);

/**
 * Resolve the room a pathname is in.
 *
 * Matches on path only — query strings (`?fieldContext=…&program=…`) and
 * trailing segments never change which room you are standing in. Returns null
 * for paths outside the environment, and for `/now-what/arrive` and
 * `/now-what/welcome`, which are not rooms.
 */
export function roomForPath(pathname: string | null | undefined): NowWhatRoomDef | null {
  if (!pathname) return null;
  // Defensive: accept a full URL or a path with a query already attached.
  const path = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || pathname;
  // Exact match wins before any prefix match. Home's route is the environment
  // root, so a single pass would resolve EVERY room to Home whenever Home is
  // listed first — the member would be told they are Home while standing in
  // the session room. Two passes make the order of the registry a display
  // concern only, never a correctness one.
  const exact = NOW_WHAT_ROOMS.find((r) => path === r.route);
  if (exact) return exact;
  // Home is deliberately excluded from the prefix pass: its route is a prefix
  // of the entire environment, so prefix-matching it would swallow the two
  // paths that are NOT rooms — `/now-what/arrive` (the auth door) and
  // `/now-what/welcome` — and report them as Home. Home is an exact match only.
  return NOW_WHAT_ROOMS.find((r) => r.key !== 'home' && path.startsWith(`${r.route}/`)) ?? null;
}
