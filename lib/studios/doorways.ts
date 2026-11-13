/**
 * Studio doorways — each Studio's own address (STUDIO-A-LA-CARTE-01 Phases 3–4).
 *
 * Founder rulings 2026-11-12 (docs/programme/STUDIO-A-LA-CARTE-01_FOUNDER_RULING_R1_2026-11-12.md):
 *   R1 — a Studio may be entered at its own front door, with the one Soullab identity underneath and MAIA / Field /
 *        Soullab membership off until the person connects them.
 *   R2 — every doorway is "<X> Studio" at its own subdomain.
 * Founder choice 2026-11-13: a doorway's sign-up is invitation-gated (no open registration).
 *
 * This module is pure (no env, no DB, no React) so the proxy, the layout chrome and the sign-up route share one catalogue.
 * Names only: no existing route is renamed. Each doorway's root lands on the Studio's existing public preview page.
 */

export type DoorwayId = 'writer' | 'sound' | 'guide' | 'astrology';

export interface Doorway {
  id: DoorwayId;
  /** Subdomain under the Soullab root domain, e.g. writer.soullab.life. */
  subdomain: string;
  /** Product name (R2). */
  studioName: string;
  /** What `/` on the doorway host shows: the Studio's existing public preview. */
  landingPath: string;
  /** Where a member goes after joining. Admission there is unchanged and still decided by that Studio's own gate. */
  studioPath: string;
}

export const DOORWAYS: readonly Doorway[] = [
  { id: 'writer', subdomain: 'writer', studioName: 'Writer’s Studio', landingPath: '/explore/writers-studio', studioPath: '/writers-studio' },
  { id: 'sound', subdomain: 'sound', studioName: 'Sound Studio', landingPath: '/explore/sound-resonance', studioPath: '/listen' },
  { id: 'guide', subdomain: 'guide', studioName: 'Guide Studio', landingPath: '/explore/pro-studio', studioPath: '/pro-studio' },
  { id: 'astrology', subdomain: 'astrology', studioName: 'Astrology Studio', landingPath: '/explore/astrology-pro', studioPath: '/astrology' },
] as const;

export const DOORWAY_IDS: readonly DoorwayId[] = DOORWAYS.map((d) => d.id);

/** The path on a doorway host that opens its invitation sign-up. */
export const DOORWAY_JOIN_PATH = '/join';

/** The app route that renders a doorway's sign-up, e.g. /doorway/writer. */
export function doorwayJoinRoute(id: DoorwayId): string {
  return `/doorway/${id}`;
}

export function doorwayById(id: string | null | undefined): Doorway | null {
  return DOORWAYS.find((d) => d.id === id) ?? null;
}

/**
 * The doorway a Host header belongs to, or null. Matches exactly `<subdomain>.<root>` with an optional port, so
 * `writer.soullab.life` matches and `writer.soullab.life.evil.example` or `xwriter.soullab.life` do not.
 */
export function doorwayForHost(host: string | null | undefined, root = 'soullab.life'): Doorway | null {
  if (!host) return null;
  const h = host.trim().toLowerCase().replace(/:\d+$/, '');
  const suffix = `.${root.toLowerCase()}`;
  if (!h.endsWith(suffix)) return null;
  const sub = h.slice(0, -suffix.length);
  return DOORWAYS.find((d) => d.subdomain === sub) ?? null;
}

/** The switch for host routing and sign-up. Exactly "true" turns doorways on; anything else leaves today's behaviour. */
export function doorwaysEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.STUDIO_DOORWAYS_ENABLED === 'true';
}

/**
 * Where the proxy should send a doorway request, or null to let it through untouched.
 * `/` → the Studio's public preview; `/join` → its invitation sign-up. Every other path keeps its normal meaning and
 * normal access rules, so a doorway never widens what a visitor may reach.
 */
export function doorwayRewrite(doorway: Doorway, pathname: string): string | null {
  if (pathname === '/' || pathname === '') return doorway.landingPath;
  if (pathname === DOORWAY_JOIN_PATH) return doorwayJoinRoute(doorway.id);
  return null;
}
