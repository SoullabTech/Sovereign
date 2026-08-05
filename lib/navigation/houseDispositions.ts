/**
 * House dispositions — every registered boundary must have a DECLARED
 * relationship to the House. Not every place must be offered by it.
 *
 * WHY THIS EXISTS: retiring the feature rail (2026-07-22) dropped destinations
 * that were reachable by URL and by nothing else. The recovery pass caught the
 * ones HARDCODED in the rail (Keeps, Co-lab). It could not catch the ones that
 * were properly registered in MAIA_BOUNDARIES but never migrated into
 * HOUSE_DESTINATIONS — Book Studio and Lab Tools sat undispositioned for two
 * weeks. Both drift checks were structurally blind to them: houseNavDrift walks
 * House → allowlist → bundle, and nothing walked MAIA_BOUNDARIES → House.
 *
 * FOUNDER RULING (Kelly, 2026-08-04) — the guard must NOT assert "every
 * boundary appears in the House". That would turn the House back into a
 * complete registry, which is the taxonomy the House was created to leave
 * behind. It asserts instead:
 *
 *   every registered boundary has an EXPLICIT disposition,
 *   and none may remain silently undispositioned.
 *
 * Absence is then a recorded decision, never an unnoticed loss.
 *
 * ── THREE AXES, NEVER COLLAPSED ────────────────────────────────────────────
 *
 * Navigation determines what is PRESENTED  → `disposition`
 * Authorization determines what may be ENTERED → `authorization`
 * Identity determines which rules APPLY    → not modeled here; see below
 *
 * A list filter is not an authorization boundary. `interimAudience` is the
 * closest gate the House CAN express today (HouseAudience is 'all' | 'founder')
 * — it is an interim rendering control, NOT the authorization it approximates.
 * Do not read a founder-gated list entry as proof that a route refuses anyone.
 */

import { HOUSE_DESTINATIONS, type HouseAudience } from './houseDestinations';
import { MAIA_BOUNDARIES } from './maiaNav';

/**
 * The boundary's declared relationship to the House.
 *
 * ⛔⛔ INVARIANT — disposition values describe HOUSE PRESENTATION STATE. They must
 * NOT describe member class, founder status, audience, ownership, or the nature
 * of the room. Three questions, three axes, never one:
 *
 *   What kind of work happens here?          → the room's own identity (not here)
 *   Who does the House offer this door to?   → disposition            (HERE)
 *   Who is authorized to enter?              → authorization          (below)
 *
 * This value set was originally `founder_only`, which smuggled the audience
 * answer onto the presentation axis and read as an assertion about the room's
 * NATURE — directly contradicting the ruling that the House must not encode
 * founder-vs-member into a studio's identity. Renamed to `offered_restricted`
 * 2026-08-04. The House can decide what it OFFERS without deciding what
 * something IS.
 *
 * Enforced by the "disposition vocabulary" suite in
 * __tests__/houseDispositions.test.ts — a new value carrying audience words
 * fails the build.
 */
export type HouseDisposition =
  /** The House offers a door to it. */
  | 'offered'
  /** The House offers a door, restricted to founder/steward audiences. */
  | 'offered_restricted'
  /** Reachable contextually / via MAIA routing — deliberately not a House door. */
  | 'contextual_only'
  /** Deliberately withheld from House navigation. A ruling, not an omission. */
  | 'intentionally_withheld'
  /** Replaced by another destination, which carries the identity now. */
  | 'superseded';

/**
 * Who may ENTER, long-term. Distinct from what the House PRESENTS.
 *
 * 'steward' is the studios' long-term offering level (founder ruling
 * 2026-08-04): the studios are Steward-level capabilities, and during beta
 * selected testers hold Steward-equivalent access for evaluation. The House
 * must NOT encode founder-vs-member into a studio's IDENTITY; it encodes who
 * currently has permission to enter.
 *
 * ⚠️ NOTHING IN THIS FILE ENFORCES THIS. It is a declaration of intent that a
 * future authorization layer must honour. Route authorization remains
 * unresolved — see docs/governance/HOUSE_IA_RULING_STUDIO_ONE_THRESHOLD.
 */
export type EnterAuthorization = 'open' | 'steward' | 'practitioner' | 'founder';

export interface BoundaryDisposition {
  disposition: HouseDisposition;
  /** Required for 'offered' | 'offered_restricted'; forbidden otherwise. */
  destinationId?: string;
  /** Long-term entry authorization. Declarative — not enforced here. */
  authorization: EnterAuthorization;
  /** The closest gate HouseAudience can express today. Interim, not the rule. */
  interimAudience?: HouseAudience;
  /** Why this disposition. Required — silence is the failure mode. */
  rationale: string;
}

/**
 * THE DISPOSITIONS. Keyed by MAIA_BOUNDARIES id.
 *
 * ⚠️ ID COLLISION, deliberate and load-bearing: rail id 'studio' is the
 * practitioner PRO Studio (/studio) and maps to House id 'pro-studio'. House id
 * 'studio' is the AUTHOR Studio (/press/studio) and is not a rail boundary at
 * all. Never assume the two registries share an id space.
 */
export const BOUNDARY_DISPOSITIONS: Record<string, BoundaryDisposition> = {
  // ── Studios — Steward-level offerings (founder ruling 2026-08-04) ────────
  studio: {
    disposition: 'offered_restricted',
    destinationId: 'pro-studio',
    authorization: 'steward',
    interimAudience: 'founder',
    rationale:
      'Pro Studio. One threshold; Personal Field / Practice Portal are modes revealed ' +
      'after entry, never separate doors. Long-term Steward (beta: practitioners). ' +
      'Ruled: docs/governance/HOUSE_IA_RULING_STUDIO_ONE_THRESHOLD_2026-08-04.md',
  },
  'book-studio': {
    disposition: 'offered_restricted',
    destinationId: 'book-studio',
    authorization: 'steward',
    interimAudience: 'founder',
    rationale:
      'Book Studio — production/publishing environment: editions, layout, release, ' +
      'publishing operations. DISTINCT from Writer\'s Studio and never merged into it: ' +
      'Writer\'s Studio is how a life becomes a book; Book Studio is how a finished ' +
      'manuscript becomes a published book. Adjacent stages, different work. Its House ' +
      'absence was a MIGRATION OMISSION (rail retirement 2026-07-22), not a decision — ' +
      'canon ratifies it as a live distinct destination (AUTHOR_STUDIO_THREE_LAYER_RULING ' +
      '§2: "/book-studio = Book Studio. Unchanged."). Restored 2026-08-04. ' +
      'Long-term Steward (specialized); interim founder gate pending the authorization layer.',
  },
  'vision-studio': {
    disposition: 'offered_restricted',
    destinationId: 'vision-studio',
    authorization: 'steward',
    interimAudience: 'founder',
    rationale: 'Developmental field. Long-term Steward (beta: testers).',
  },

  // ── Offered to every member ─────────────────────────────────────────────
  astrology: {
    disposition: 'offered',
    destinationId: 'astrology',
    authorization: 'open',
    interimAudience: 'all',
    rationale: 'Member-facing web environment.',
  },
  keeps: {
    disposition: 'offered',
    destinationId: 'keeps',
    authorization: 'open',
    interimAudience: 'all',
    rationale: 'Recovered from the retired rail (2026-07-22). Member-owned.',
  },
  colab: {
    disposition: 'offered',
    destinationId: 'colab',
    authorization: 'open',
    interimAudience: 'all',
    rationale:
      'Recovered from the retired rail. Visibility is CONDITIONAL on live state ' +
      '(isColabVisible: founder/practitioner OR pending count), which the audience ' +
      'field cannot express — so a pure seeker never meets an empty coordination badge.',
  },
  circles: {
    disposition: 'offered_restricted',
    destinationId: 'circles',
    authorization: 'steward',
    interimAudience: 'founder',
    rationale: 'Shared field; practitioner circles.',
  },

  // ── Withheld from the House ─────────────────────────────────────────────
  'community-library': {
    disposition: 'intentionally_withheld',
    authorization: 'open',
    rationale:
      'REMOVED from the House by founder direction (Kelly, 2026-08-04). Previously ' +
      'offered to every member; the direction removes the House door only. The route ' +
      '(/maia/community/library) remains reachable directly under its existing access. ' +
      'This rules only its relationship to the House, not the library itself.',
  },
  labtools: {
    disposition: 'intentionally_withheld',
    authorization: 'steward',
    rationale:
      'RULED (Kelly, 2026-08-04): Lab Tools is NOT a House destination. Its organizing ' +
      'principle is INSTRUMENTATION — a taxonomy of instruments and activities — rather ' +
      'than a human mode of work. Promoting it into Rooms would reintroduce the rail ' +
      'logic the House was built to leave behind (2026-07-22: "the rail failed because ' +
      'it was a taxonomy"). Consistent with the 2026-05-27 directive that the labtools ' +
      'convention is reflection/experimental. ' +
      '/labtools REMAINS FULLY AVAILABLE as a functional environment via contextual ' +
      'entry points, MAIA routing, adopted-tool surfaces (My Lab), direct access, and ' +
      'tester/admin routes under their existing gates. ' +
      '⛔ This absence is a RULING. Do not mistake it for another lost migration. ' +
      'This rules only its relationship to the House, not /labtools itself.',
  },
};

/**
 * House destinations that legitimately have no MAIA_BOUNDARIES entry.
 * Each needs a reason — an unexplained exception is the same failure as an
 * undispositioned boundary.
 */
export const DESTINATION_EXCEPTIONS: Record<string, string> = {
  maia: 'Center. Not a boundary — it is the place you return to.',
  'living-field': 'MAIA_WORLDS member world, never a boundary transition.',
  journal: 'MAIA_WORLDS member world.',
  anchor: 'MAIA_WORLDS member world.',
  ideas: 'MAIA_WORLDS member world.',
  wisdom: 'MAIA_WORLDS member world.',
  changes: 'Existing member sheet opened in place — no route, so no boundary.',
  settings: 'Utility, below the divider.',
  studio:
    "Writer's Studio (Author Studio) — /press/studio, the Layer 2 environment. Never a " +
    'rail boundary: it postdates the rail. OFFERED to members (ruled R1 2026-07-30); ' +
    'long-term Steward, beta testers today. Distinct from Book Studio and from Pro ' +
    'Studio — see AUTHOR_STUDIO_THREE_LAYER_RULING.md §2. ' +
    '⛔ Must NOT be repointed at /press/manuscript (Layer 3): that regression shipped ' +
    'once and dropped members onto a bare upload surface with no Studio around it.',
};

// --- Queries ------------------------------------------------------------

export function getDisposition(boundaryId: string): BoundaryDisposition | undefined {
  return BOUNDARY_DISPOSITIONS[boundaryId];
}

/** Boundary ids with no declared disposition. MUST be empty. */
export function undispositionedBoundaries(): string[] {
  return MAIA_BOUNDARIES.filter((b) => !BOUNDARY_DISPOSITIONS[b.id]).map((b) => b.id);
}

/**
 * House destinations that neither map back to a disposition nor carry an
 * explicit exception. MUST be empty.
 */
export function unexplainedDestinations(): string[] {
  const claimed = new Set(
    Object.values(BOUNDARY_DISPOSITIONS)
      .map((d) => d.destinationId)
      .filter((id): id is string => Boolean(id)),
  );
  return HOUSE_DESTINATIONS.filter(
    (d) => !claimed.has(d.id) && !DESTINATION_EXCEPTIONS[d.id],
  ).map((d) => d.id);
}

/** A withheld/contextual/superseded boundary is NOT an orphan. */
export function isOrphan(boundaryId: string): boolean {
  const d = BOUNDARY_DISPOSITIONS[boundaryId];
  if (!d) return true; // undispositioned — the actual failure
  if (d.disposition === 'offered' || d.disposition === 'offered_restricted') {
    return !HOUSE_DESTINATIONS.some((x) => x.id === d.destinationId);
  }
  return false;
}
