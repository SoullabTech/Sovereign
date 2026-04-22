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
  Heart,
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
  {
    id: 'maia',
    label: 'MAIA',
    icon: Flame,
    route: '/maia',
    classification: 'world',
    tooltip: 'Return to center field',
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: BookOpen,
    route: '/labtools/journal',
    classification: 'world',
    tooltip: 'Expressive writing & captures',
  },
  {
    id: 'ideas',
    label: 'Ideas',
    icon: Lightbulb,
    route: '/maia/ideas',
    classification: 'world',
    tooltip: 'Generative emergence',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    icon: Heart,
    route: '/relationships',
    classification: 'world',
    tooltip: 'Relational awareness',
  },
  {
    id: 'wisdom',
    label: 'Wisdom',
    icon: Library,
    route: '/wisdom-keepers/wisdom',
    classification: 'world',
    tooltip: 'Sacred texts & learning',
  },
];

// --- Left Rail: Boundary Transition ---

export const STUDIO_RAIL_ITEM: MaiaRailItem = {
  id: 'studio',
  label: 'Studio',
  icon: Briefcase,
  route: '/studio',
  classification: 'studio',
  tooltip: 'Enter Studio workspace',
  isBoundaryTransition: true,
};

export const CIRCLES_RAIL_ITEM: MaiaRailItem = {
  id: 'circles',
  label: 'Circles',
  icon: Users,
  route: '/commons/circles',
  classification: 'studio',
  tooltip: 'Enter shared field',
  isBoundaryTransition: true,
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
  CIRCLES_RAIL_ITEM,
  ASTROLOGY_RAIL_ITEM,
  LABTOOLS_RAIL_ITEM,
  COMMUNITY_LIBRARY_RAIL_ITEM,
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

/** Get a world config by ID */
export function getWorld(id: MaiaWorldId): MaiaRailItem | undefined {
  return MAIA_WORLDS.find(w => w.id === id);
}

/** Get the contextual panel for a given world */
export function getPanelForWorld(world: MaiaWorldId | null): MaiaContextualPanel | undefined {
  return MAIA_CONTEXTUAL_PANELS.find(p => p.world === world);
}

/** All rail items in display order (worlds + studio) */
export function getRailItems(): MaiaRailItem[] {
  return [...MAIA_WORLDS, STUDIO_RAIL_ITEM];
}
