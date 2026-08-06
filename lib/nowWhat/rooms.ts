/**
 * Now What? room registry — the single definition shared by the persistent
 * shell and the environment map.
 *
 * FIVE-ROOM ONTOLOGY (ratified 2026-08-05, built same day; see
 * docs/design/now-what/NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION_2026-08-05.md):
 * four noun-rooms hold the member's life; one verb-room holds the
 * conversation. Every noun-room's primary gesture is a contextualized door
 * into The Room. Standing test: two rooms cannot exist merely because they
 * use different nouns if they invoke the same human gesture.
 *
 *   My Question   what am I wrestling with?          → continue thinking
 *   My Work       what am I living and cultivating?  → reflect on what you are living
 *   My Coaching   how is another person's presence shaping this work? → prepare
 *   My Story      what is becoming, over time?       → see what is becoming
 *   The Room      can I think this through, now?     → think something through
 *
 * Three distinctions this registry preserves:
 *
 *   EXISTENCE      a route file exists
 *   NAVIGABILITY   a member can reach it through the UI
 *   EXPOSURE       we deliberately offer it as a destination
 *
 * Routes that exist but are NOT rooms are deliberately absent:
 *   /now-what/arrive       the auth door, not a place inside the environment
 *   /now-what/welcome      zero inbound links by design (EnvironmentMapView)
 *   /now-what/cultivate    redirect → /now-what/work      (merged room)
 *   /now-what/next         redirect → /now-what/work      (merged room)
 *   /now-what/calendar     redirect → /now-what/coaching  (merged room)
 *   /now-what/position     redirect → /now-what/coaching  (merged room)
 *   /now-what/themes       redirect → /now-what           (retired placeholder, ruling D-E)
 *   /now-what/reflections  redirect → /now-what           (retired placeholder, ruling D-E)
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
  { key: 'question', name: 'My Question', route: '/now-what/questions', exposure: 'open' },
  { key: 'work', name: 'My Work', route: '/now-what/work', exposure: 'open' },
  { key: 'coaching', name: 'My Coaching', route: '/now-what/coaching', exposure: 'open' },
  { key: 'story', name: 'My Story', route: '/now-what/field', exposure: 'open' },
  { key: 'room', name: 'The Room', route: '/now-what/room', exposure: 'open' },
] as const;

/**
 * Rooms offered as shell navigation. The map is excluded — it is the wordmark.
 */
export const NAV_DESTINATIONS: readonly NowWhatRoomDef[] = NOW_WHAT_ROOMS.filter(
  (r) => r.exposure === 'open' && r.key !== 'map',
);

/**
 * Resolve the room a pathname is in.
 *
 * Matches on path only — query strings (`?fieldContext=…&program=…`) and
 * trailing segments never change which room you are standing in. Returns null
 * for paths outside the environment, for `/now-what/arrive` and
 * `/now-what/welcome` (not rooms), and for the retired redirect routes (a
 * member never stands in a redirect long enough to need a hallway).
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
  // of the entire environment, so prefix-matching it would swallow the paths
  // that are NOT rooms and report them as Home. Home is an exact match only.
  return NOW_WHAT_ROOMS.find((r) => r.key !== 'home' && path.startsWith(`${r.route}/`)) ?? null;
}
