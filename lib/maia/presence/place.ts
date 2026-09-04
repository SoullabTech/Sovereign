/**
 * MAIA place context — facts-only room orientation.
 *
 * A "place" is a declarative fact about where the member currently is in the
 * house. It is the ONLY room signal MAIA ever receives, and it travels ONLY
 * on a conversation request the member intentionally sends (it rides the
 * message POST body — there is no other transmission channel).
 *
 * Constitutionally forbidden here and everywhere in this layer:
 * dwell time, click history, scroll position, inferred emotional state,
 * inferred goals, unseen form contents, passive behavioral telemetry.
 * MAIA may say "You are in the Decisions room." She may never say
 * "You seem uncertain about this decision" from place data.
 *
 * The registry below is the single source of truth for governed rooms —
 * the rooms where the global MAIA handle appears and whose facts MAIA may
 * receive. Purposes are authored copy, consistent with the authored map in
 * lib/sovereign/platformKnowledge.ts (which stays the source of truth for
 * what MAIA says ABOUT rooms; this registry only names where the member IS).
 */

export interface MaiaPlaceContext {
  placeId: string;
  placeName: string;
  route: string;
  purpose?: string;
  objectType?: string;
  objectId?: string;
}

export interface GoverendRoom {
  placeId: string;
  placeName: string;
  /** Route prefix that identifies this room (longest match wins). */
  routePrefix: string;
  purpose: string;
}

/**
 * Governed member rooms. Longest routePrefix wins when several match.
 * NOT listed (deliberately):
 * - `/now-what/*` — INTENTIONAL, GOVERNED isolation (Kelly Ruling 3,
 *   2026-07-17): no general member MAIA memory inside Now What?, no Now What?
 *   material outside its container. The future relationship model (whose MAIA
 *   is present in a practitioner-created environment, and whose continuity
 *   governs it) is a separate constitutional question — see
 *   docs/architecture/NOW_WHAT_MAIA_RELATIONSHIP_QUESTION_2026-07-17.md.
 *   Do not add these routes without that ruling.
 * - public/marketing/auth/onboarding surfaces — no member relationship there
 * - practitioner admin surfaces (labtools, stellium, founder) — not member rooms
 */
export const GOVERNED_ROOMS: readonly GoverendRoom[] = [
  { placeId: 'maia', placeName: 'MAIA', routePrefix: '/maia', purpose: 'The main conversation — the hallway of the house.' },
  { placeId: 'journal', placeName: 'Journal', routePrefix: '/journal', purpose: 'A private room for writing and reflection.' },
  { placeId: 'ideas', placeName: 'Ideas', routePrefix: '/maia/ideas', purpose: 'A room for capturing and developing emerging thoughts.' },
  { placeId: 'moments', placeName: 'Marked Moments', routePrefix: '/maia/moments', purpose: 'The moments this member chose to keep from conversation.' },
  { placeId: 'anchor-history', placeName: 'Daily Anchors', routePrefix: '/maia/anchor', purpose: 'The member\'s daily anchors and their history.' },
  { placeId: 'guides', placeName: 'Guides', routePrefix: '/guides', purpose: 'Written guides and videos about how this place works.' },
  { placeId: 'reflections', placeName: 'Reflections', routePrefix: '/reflections', purpose: 'The reflections this member chose to keep, and where they reopen one.' },
  { placeId: 'studio', placeName: 'Studio', routePrefix: '/studio', purpose: 'A workspace where practitioners develop their practice, programs, and projects.' },
  { placeId: 'decisions', placeName: 'Decisions', routePrefix: '/studio/decisions', purpose: 'A room for naming and reflecting on decisions.' },
  { placeId: 'changes', placeName: 'Changes', routePrefix: '/studio/changes', purpose: 'A room for noticing and reflecting on transitions over time.' },
  { placeId: 'session-room', placeName: 'Session Room', routePrefix: '/studio/session-room', purpose: 'A live room for one-to-one sessions.' },
  { placeId: 'encounters', placeName: 'Encounters', routePrefix: '/studio/encounters', purpose: 'Records of live session encounters.' },
  { placeId: 'soul-portrait', placeName: 'Soul Portrait', routePrefix: '/soul-portrait', purpose: 'A member\'s soul portrait, offered individually with consent.' },
  { placeId: 'home', placeName: 'Home', routePrefix: '/home', purpose: 'The member landing threshold.' },
] as const;

/** Full conversation surfaces — the handle/sheet is suppressed here (the page IS the relationship surface). */
export const FULL_CONVERSATION_ROUTES = ['/maia', '/studio/maia', '/field/talk'] as const;

/** Resolve the governed room for a pathname, or null when the route is not governed. Longest prefix wins. */
export function resolveGovernedRoom(pathname: string): GoverendRoom | null {
  if (!pathname) return null;
  let best: GoverendRoom | null = null;
  for (const room of GOVERNED_ROOMS) {
    if (pathname === room.routePrefix || pathname.startsWith(room.routePrefix + '/')) {
      if (!best || room.routePrefix.length > best.routePrefix.length) best = room;
    }
  }
  return best;
}

/** True when the pathname is a full conversation surface (suppress handle/sheet). */
export function isFullConversationRoute(pathname: string): boolean {
  return FULL_CONVERSATION_ROUTES.some(r => pathname === r);
}

/** Derive a facts-only place context from a pathname via the registry. */
export function placeFromPathname(pathname: string): MaiaPlaceContext | null {
  const room = resolveGovernedRoom(pathname);
  if (!room) return null;
  return {
    placeId: room.placeId,
    placeName: room.placeName,
    route: pathname,
    purpose: room.purpose,
  };
}

// ─── Server-side validation + prompt rendering ────────────────────────────────

const MAX_FIELD = 200;

/**
 * Validate an incoming `place` object from the request body. Returns a
 * sanitized copy or null. Strict allowlist of fields; everything else is
 * dropped. Never throws — an invalid place simply yields no place context.
 */
export function validatePlaceContext(raw: unknown): MaiaPlaceContext | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  const str = (v: unknown): string | undefined =>
    typeof v === 'string' && v.trim().length > 0 && v.length <= MAX_FIELD ? v.trim() : undefined;

  const placeId = str(p.placeId);
  const placeName = str(p.placeName);
  const route = str(p.route);
  if (!placeId || !placeName || !route) return null;
  if (!route.startsWith('/')) return null;

  return {
    placeId,
    placeName,
    route,
    purpose: str(p.purpose),
    objectType: str(p.objectType),
    objectId: str(p.objectId),
  };
}

/**
 * Render the PLACE prompt block. Present-tense orientation only — explicitly
 * instructs MAIA not to infer why the member is there.
 */
export function buildPlaceAddendum(place: MaiaPlaceContext): string {
  const lines = [
    `🚪 PLACE — where the member currently is (facts only)`,
    ``,
    `The member is currently in: ${place.placeName} (${place.route}).`,
  ];
  if (place.purpose) lines.push(`This room's purpose: ${place.purpose}`);
  if (place.objectType && place.objectId) {
    lines.push(`They have a specific ${place.objectType} open (id: ${place.objectId}). You know only that it is open — not its contents.`);
  }
  lines.push(
    ``,
    `You may use this to answer grounded questions about where they are and how rooms relate. You do NOT know why they entered this room, how long they have been here, or what they have done here — never infer or imply any of that. Do not mention the room unprompted; respond to what the member actually says.`,
  );
  return lines.join('\n');
}
