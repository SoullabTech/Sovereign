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
    tooltip: 'Who you are becoming',
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
