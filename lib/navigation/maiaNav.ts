/**
 * MAIA Navigation Config — Canonical world and utility definitions
 *
 * This is the single source of truth for MAIA spatial navigation.
 * Do not hardcode nav items in components — import from here.
 */

import {
  Flame,
  Sparkles,
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
} from 'lucide-react';

import type {
  MaiaRailItem,
  MaiaUtilityItem,
  MaiaContextualPanel,
  MaiaWorldId,
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
    id: 'patterns',
    label: 'Patterns',
    icon: Sparkles,
    route: '/maia/patterns',
    classification: 'world',
    tooltip: 'Constellation & pattern field',
  },
  {
    id: 'depth',
    label: 'Depth',
    icon: Layers,
    route: '/maia/depth',
    classification: 'world',
    tooltip: 'Meaning well & symbolic layer',
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: BookOpen,
    route: '/maia/journal',
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
    route: '/maia/relationships',
    classification: 'world',
    tooltip: 'Relational awareness',
  },
  {
    id: 'wisdom',
    label: 'Wisdom',
    icon: Library,
    route: '/maia/wisdom',
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
  { id: 'patterns-view', world: 'patterns', label: 'Patterns' },
  { id: 'depth-tools', world: 'depth', label: 'Depth' },
  { id: 'journal-capture', world: 'journal', label: 'Journal' },
  { id: 'ideas-view', world: 'ideas', label: 'Ideas' },
  { id: 'relationships-view', world: 'relationships', label: 'Relationships' },
  { id: 'wisdom-view', world: 'wisdom', label: 'Wisdom' },
];

// --- Helpers ---

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
