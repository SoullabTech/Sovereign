/**
 * MAIA Navigation Config — Canonical world and utility definitions
 *
 * This is the single source of truth for MAIA spatial navigation.
 * Do not hardcode nav items in components — import from here.
 */

import {
  Flame,
  Layers,
  BookOpen,
  Lightbulb,
  Library,
  Briefcase,
  Users,
  Orbit,
  User,
  Settings,
  HelpCircle,
  Mic,
  MessageCircle,
  FlaskConical,
  BookCopy,
  NotebookPen,
  Compass,
  Sprout,
} from 'lucide-react';

import type {
  MaiaRailItem,
  MaiaUtilityItem,
  MaiaContextualPanel,
  MaiaWorldId,
  BoundaryId,
} from './types';

// --- Left Rail: Worlds ---

export const MAIA_WORLDS: MaiaRailItem[] = [
  // MAIA — always at center, no group
  {
    id: 'maia',
    label: 'MAIA',
    icon: Flame,
    route: '/maia',
    classification: 'world',
    tooltip: 'Return to center field',
  },

  // ── MY LIFE — dimensions of the Personal Field (becoming) ──
  {
    id: 'living-field',
    label: 'Living Field',
    icon: Sprout,
    route: '/maia/living-field',
    classification: 'world',
    // Label names the PLACE, not the person, and describes the ACTIVITY, not an
    // outcome. Per Invariant 16 / Direction of Authority the system must not assert
    // who the member is becoming, nor promise coherence/integration the member (not
    // the place) authors. Prior copy: "Who you are becoming" (asserted the person),
    // then "…becomes coherent" (agentless outcome-claim). This names the work only.
    tooltip: 'A place to gather and reflect on lived experience',
    group: 'life',
  },
  // Encounters (Footprints → /sessions) and Relationships (Heart → /relationships)
  // removed from the rail 2026-07-05: both surfaced only a contextual panel with no
  // process behind it. Restore here once each is attached to an actual process.
  {
    id: 'journal',
    label: 'Journal',
    icon: BookOpen,
    route: '/labtools/journal',
    classification: 'world',
    tooltip: 'Expressive writing — one practice surface',
    group: 'life',
  },
  {
    id: 'anchor',
    label: 'Anchor',
    icon: Compass,
    route: '/maia/anchor',
    classification: 'world',
    tooltip: 'A quiet place to return',
    group: 'life',
  },

  // ── MY WORK — dimensions of the Contribution Field (offering) ──
  {
    id: 'ideas',
    label: 'Ideas',
    icon: Lightbulb,
    route: '/maia/ideas',
    classification: 'world',
    tooltip: 'Emerging thoughts and creative impulses',
    group: 'work',
  },
  {
    id: 'wisdom',
    label: 'Wisdom',
    icon: Library,
    route: '/wisdom-keepers/wisdom',
    classification: 'world',
    tooltip: 'Sacred texts, learning, and collected knowledge',
    group: 'work',
  },
];

// --- Left Rail: Boundary Transition ---

export const STUDIO_RAIL_ITEM: MaiaRailItem = {
  id: 'studio',
  label: 'Pro Studio',
  icon: Briefcase,
  route: '/studio',
  classification: 'studio',
  tooltip: 'Practitioner workspace',
  isBoundaryTransition: true,
  audience: 'founder',
};

export const BOOK_STUDIO_RAIL_ITEM: MaiaRailItem = {
  id: 'book-studio',
  label: 'Book Studio',
  icon: NotebookPen,
  route: '/book-studio',
  classification: 'studio',
  tooltip: 'Editorial workspace for Soullab Press',
  isBoundaryTransition: true,
  audience: 'founder',
};

export const CIRCLES_RAIL_ITEM: MaiaRailItem = {
  id: 'circles',
  label: 'Circles',
  icon: Users,
  route: '/commons/circles',
  classification: 'studio',
  tooltip: 'Enter shared field',
  isBoundaryTransition: true,
  audience: 'founder',
};

export const ASTROLOGY_RAIL_ITEM: MaiaRailItem = {
  id: 'astrology',
  label: 'Astrology',
  icon: Orbit,
  route: '/astrology',
  classification: 'studio',
  tooltip: 'Your cosmic spiral',
  isBoundaryTransition: true,
};

export const LABTOOLS_RAIL_ITEM: MaiaRailItem = {
  id: 'labtools',
  label: 'Lab Tools',
  icon: FlaskConical,
  route: '/labtools',
  classification: 'studio',
  tooltip: 'Consciousness tools & experiments',
  isBoundaryTransition: true,
  audience: 'founder',
};

export const COMMUNITY_LIBRARY_RAIL_ITEM: MaiaRailItem = {
  id: 'community-library',
  label: 'Community Library',
  icon: BookCopy,
  route: '/maia/community/library',
  classification: 'studio',
  tooltip: 'Shared knowledge & collective resources',
  isBoundaryTransition: true,
};

// NOTE: un-gated for beta 2026-07. Consent threshold shipped (per-thread shareWithPractitioner,
// default private). Included in MAIA_BOUNDARIES below; audience: 'founder' scopes it to
// founder/practitioner members only. Routes /api/maia/vision-studio/{interview,field-note}
// are functional. Re-gate by removing VISION_STUDIO_RAIL_ITEM from MAIA_BOUNDARIES.
export const VISION_STUDIO_RAIL_ITEM: MaiaRailItem = {
  id: 'vision-studio',
  label: 'Vision Studio',
  icon: Compass,
  route: '/maia/vision-studio',
  classification: 'studio',
  tooltip: 'Vision Studio — developmental field',
  isBoundaryTransition: true,
  audience: 'founder',
};

// --- Utility Items (top bar + bottom of rail) ---

export const MAIA_UTILITIES: MaiaUtilityItem[] = [
  {
    id: 'account',
    label: 'Account',
    icon: User,
    action: 'open-account',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    route: '/account/settings',
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    action: 'open-help',
  },
  {
    id: 'voice',
    label: 'Voice',
    icon: Mic,
    action: 'toggle-voice',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageCircle,
    action: 'open-feedback',
  },
];

// --- Contextual Panels (right side) ---

export const MAIA_CONTEXTUAL_PANELS: MaiaContextualPanel[] = [
  { id: 'session-tools', world: null, label: 'Session Tools' },
  { id: 'journal-capture', world: 'journal', label: 'Journal' },
  { id: 'ideas-view', world: 'ideas', label: 'Ideas' },
  { id: 'relationships-view', world: 'relationships', label: 'Relationships' },
  { id: 'wisdom-view', world: 'wisdom', label: 'Wisdom' },
];

// --- Boundary items array (config-driven) ---

export const MAIA_BOUNDARIES: MaiaRailItem[] = [
  STUDIO_RAIL_ITEM,
  BOOK_STUDIO_RAIL_ITEM,
  CIRCLES_RAIL_ITEM,
  ASTROLOGY_RAIL_ITEM,
  LABTOOLS_RAIL_ITEM,
  COMMUNITY_LIBRARY_RAIL_ITEM,
  // Un-gated 2026-07 (beta): consent threshold shipped; audience: 'founder' scopes to founder members.
  VISION_STUDIO_RAIL_ITEM,
];

// --- The House: primary places ---

/**
 * The four places the House offers first.
 *
 * The House greets in verbs — what the member came to do — not in product
 * names. Everything else lives behind "More places". This is the whole of the
 * member's visible navigation: one doorway, four primary places, one drawer.
 *
 * Each primary entry points at an existing world rather than inventing a route,
 * so there is still exactly one source of truth for where a place lives. Change
 * a mapping here and the House changes; no component hardcodes a destination.
 *
 * All four resolve to un-gated worlds, so an ordinary (non-founder) member can
 * actually reach every primary place.
 */
export interface HousePrimaryPlace {
  id: 'continue' | 'reflect' | 'create' | 'belong';
  /** The verb the member sees. */
  label: string;
  /** The world this verb opens. */
  worldId: MaiaWorldId;
  /** What this place is for, in the member's terms. */
  blurb: string;
}

export const HOUSE_PRIMARY: HousePrimaryPlace[] = [
  { id: 'continue', label: 'Continue', worldId: 'maia',         blurb: 'Pick up where you left off' },
  { id: 'reflect',  label: 'Reflect',  worldId: 'journal',      blurb: 'Sit with something in writing' },
  { id: 'create',   label: 'Create',   worldId: 'ideas',        blurb: 'Follow a thought that is starting' },
  { id: 'belong',   label: 'Belong',   worldId: 'living-field', blurb: 'Gather with lived experience' },
];

/** World IDs claimed by the primary four — everything else falls to "More places". */
export const HOUSE_PRIMARY_WORLD_IDS: MaiaWorldId[] = HOUSE_PRIMARY.map((p) => p.worldId);

/** Left rail width in pixels — used for content padding in boundary layouts */
export const RAIL_WIDTH_PX = 56; // w-14 = 3.5rem = 56px at 16px base

// --- Helpers ---

/** Derive boundary ID from a pathname, or null if not in a boundary */
export function getBoundaryFromPathname(pathname: string): BoundaryId | null {
  for (const b of MAIA_BOUNDARIES) {
    if (pathname === b.route || pathname.startsWith(b.route + '/')) {
      return b.id as BoundaryId;
    }
  }
  return null;
}

/**
 * Filter MAIA_BOUNDARIES by member visibility audience.
 * Founder-only items are hidden from non-founders.
 *
 * Note: this controls rail icon visibility only. Server-side route auth
 * is enforced separately via requireFounder() in each gated layout.
 */
export function getVisibleBoundaries(isFounder: boolean): MaiaRailItem[] {
  return MAIA_BOUNDARIES.filter((b) => b.audience !== 'founder' || isFounder);
}

/** Get a world config by ID */
export function getWorld(id: MaiaWorldId): MaiaRailItem | undefined {
  return MAIA_WORLDS.find(w => w.id === id);
}

/** Get the contextual panel for a given world */
export function getPanelForWorld(world: MaiaWorldId | null): MaiaContextualPanel | undefined {
  return MAIA_CONTEXTUAL_PANELS.find(p => p.world === world);
}

/** All rail items in display order (worlds + pro studio + book studio) */
export function getRailItems(): MaiaRailItem[] {
  return [...MAIA_WORLDS, STUDIO_RAIL_ITEM, BOOK_STUDIO_RAIL_ITEM];
}
