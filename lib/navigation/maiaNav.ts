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
  Bookmark,
  Gavel,
  History,
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
    houseGroup: 'worlds',
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
    houseGroup: 'rooms',
  },
  {
    id: 'anchor',
    label: 'Anchor',
    icon: Compass,
    route: '/maia/anchor',
    classification: 'world',
    tooltip: 'A quiet place to return',
    group: 'life',
    houseGroup: 'rooms',
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
    houseGroup: 'rooms',
  },
  {
    id: 'wisdom',
    label: 'Wisdom',
    icon: Library,
    route: '/wisdom-keepers/wisdom',
    classification: 'world',
    tooltip: 'Sacred texts, learning, and collected knowledge',
    group: 'work',
    houseGroup: 'worlds',
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
  houseGroup: 'worlds',
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
  houseGroup: 'worlds',
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
  houseGroup: 'worlds',
};

export const ASTROLOGY_RAIL_ITEM: MaiaRailItem = {
  id: 'astrology',
  label: 'Astrology',
  icon: Orbit,
  route: '/astrology',
  classification: 'studio',
  tooltip: 'Your cosmic spiral',
  isBoundaryTransition: true,
  houseGroup: 'worlds',
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
  houseGroup: 'worlds',
};

export const COMMUNITY_LIBRARY_RAIL_ITEM: MaiaRailItem = {
  id: 'community-library',
  label: 'Community Library',
  icon: BookCopy,
  route: '/maia/community/library',
  classification: 'studio',
  tooltip: 'Shared knowledge & collective resources',
  isBoundaryTransition: true,
  houseGroup: 'worlds',
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
  houseGroup: 'worlds',
};

// --- Destinations recovered from the retired rail (2026-07-22) ---
//
// These were only ever reachable through MaiaLeftRail, hardcoded as router.push
// targets and never registered here. When the rail left the member surface they
// were orphaned — reachable by URL and by nothing else. Removing the rail was
// easy; this is the part that wasn't.
//
// A registry-to-registry orphan check cannot catch this class of loss: it
// compares the House against this file and is structurally blind to routes that
// were never in it. Enumerate the retired surface's actual navigation calls.
//
// Member language is the product's own name for each, not an interpretation.

// NOT HERE: Now What? (/now-what).
//
// RULING (Kelly, 2026-07-22): Now What? is a CLIENT BUILD on AIN OS, not a
// native room of MAIA. It belongs with Larry's implementation and future client
// platforms — separate sovereign experiences that happen to share a substrate:
//
//   AIN OS
//   ├── MAIA
//   ├── Now What?
//   ├── future client platforms
//   └── Soullab experiences
//
// Placing it in the House as a World, a Room, or a utility would blur MAIA (the
// host) with an application running beside it. It read as "odd beside Account
// and Settings" precisely because it was crossing a platform boundary, not
// because it sat in the wrong group. Its participants reach it inside that
// platform, not through this House.
//
// Its absence is a CORRECTNESS CONDITION, not a missing feature. It is asserted
// negatively in the House verification harness rather than encoded here as an
// exclusion object — the registry models what exists, not what is withheld.

export const KEEPS_RAIL_ITEM: MaiaRailItem = {
  id: 'keeps',
  label: 'Keeps',
  icon: Bookmark,
  route: '/maia/keep-capture',
  classification: 'studio',
  tooltip: 'Moments you have held onto',
  isBoundaryTransition: true,
  houseGroup: 'rooms',
};

export const COLAB_RAIL_ITEM: MaiaRailItem = {
  id: 'colab',
  label: 'Co-lab',
  icon: Users,
  route: '/team/for-you',
  classification: 'studio',
  tooltip: 'Shared work and conversation',
  isBoundaryTransition: true,
  houseGroup: 'worlds',
};

// --- Record: founder/steward governance (Kelly ruling 2026-07-27) ---
//
// Decisions and Changes exist as pages under /studio; this registers them as
// House places in a distinct 'Record' group. Founder/steward ONLY — their
// meaning and audience are not ratified as general member features, so exposing
// them to all members would quietly turn internal governance surfaces into
// product promises. Kept OUT of MAIA_BOUNDARIES so boundary detection
// (getBoundaryFromPathname) is unchanged; the House reads MAIA_RECORD directly.

export const DECISIONS_RAIL_ITEM: MaiaRailItem = {
  id: 'decisions',
  label: 'Decisions',
  icon: Gavel,
  route: '/studio/decisions',
  classification: 'studio',
  tooltip: 'What was decided',
  isBoundaryTransition: true,
  audience: 'founder',
  houseGroup: 'record',
};

export const CHANGES_RAIL_ITEM: MaiaRailItem = {
  id: 'changes',
  label: 'Changes',
  icon: History,
  route: '/studio/changes',
  classification: 'studio',
  tooltip: 'What changed',
  isBoundaryTransition: true,
  audience: 'founder',
  houseGroup: 'record',
};

export const MAIA_RECORD: MaiaRailItem[] = [
  DECISIONS_RAIL_ITEM,
  CHANGES_RAIL_ITEM,
];

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
  // Recovered from the retired rail. Keeps is open to every member; Co-lab is
  // ungated here because its visibility is CONDITIONAL rather than audience-
  // based (founder/practitioner OR a pending count) — see isColabVisible in
  // lib/navigation/colabBadge. Audience gating alone cannot express that rule.
  KEEPS_RAIL_ITEM,
  COLAB_RAIL_ITEM,
];

// --- No activity taxonomy here, deliberately ---
//
// RULING (Kelly, 2026-07-22): the House grammar is Your Center · Worlds · Rooms.
// Continue / Reflect / Create / Belong were drafted and REJECTED as the
// organizing grammar.
//
// Not because the words are bad — they are good words — but because they answer
// the wrong question. Opening the House asks "where am I?", not "what kind of
// activity is this?" Structure answers where; language answers what you can do.
// Reflect/Create/Belong classify activities: that is a taxonomy, however
// friendly. The rail did not fail because it was a rail; it failed because it
// was a taxonomy. Replacing one taxonomy with another would not have solved
// anything.
//
// Those verbs remain welcome as orientation COPY inside a section. They must
// not become the hierarchy. Do not reintroduce a HOUSE_PRIMARY-style mapping.

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

/**
 * Founder/steward Record places (Decisions, Changes), audience-filtered.
 * Empty for non-founders — the Record group then does not render at all.
 */
export function getVisibleRecord(isFounder: boolean): MaiaRailItem[] {
  return MAIA_RECORD.filter((r) => r.audience !== 'founder' || isFounder);
}

/**
 * Every House place across Worlds + Rooms + Record, for houseGroup-driven
 * rendering in MaiaHouseSheet. The MAIA center row is excluded (it renders as
 * "Your Center", not a grouped place).
 */
const HOUSE_PLACES: MaiaRailItem[] = [
  ...MAIA_WORLDS.filter((w) => w.id !== 'maia'),
  ...MAIA_BOUNDARIES,
  ...MAIA_RECORD,
];

/**
 * House places for one display group, audience-filtered. Co-lab's conditional
 * (non-audience) visibility is applied by the caller — see isColabVisible.
 */
export function getHousePlaces(
  group: 'worlds' | 'rooms' | 'record',
  isFounder: boolean,
): MaiaRailItem[] {
  return HOUSE_PLACES.filter(
    (i) => i.houseGroup === group && (i.audience !== 'founder' || isFounder),
  );
}

/**
 * Native bundle classification — mirrors scripts/capacitor-patch-routes.sh.
 * Returns true when `route` survives the iOS static-export allowlist (reachable
 * in-app); false means the native House must open it via the /open-web bridge
 * rather than router.push, so a tap never dead-ends in a stripped route.
 *
 * ⚠️ KEEP IN SYNC with capacitor-patch-routes.sh. PR 2 will add the personal
 * rooms (anchor, ideas, keep-capture, living-field) to MOBILE_MAIA_KEEP — when
 * it does, add those segments to NATIVE_MAIA_KEEP below in the SAME change, or
 * the House will keep bridging them to Safari after they are actually bundled.
 */
const NATIVE_TOP_LEVEL = new Set([
  'enter', 'open-web', 'signin', 'begin', 'test-elemental', 'faq', 'onboarding',
  'intro', 'welcome-back', 'capture', 'journal', 'field', 'settings',
  'oauth-success', 'magic-link-success', 'reset-password', 'soul-gateway',
  'maia', 'labtools', 'account', 'styles',
]);
const NATIVE_MAIA_KEEP = new Set<string>();                 // MOBILE_MAIA_KEEP=() — no /maia/* sub-dirs bundled (PR 1)
const NATIVE_LABTOOLS_KEEP = new Set(['journal', 'settings', 'reflections']);
const NATIVE_ACCOUNT_KEEP = new Set(['settings']);
const NATIVE_EXCLUDED_ROOTS = new Set(['labtools']);        // top-level allowed but its own root page is web-only

export function isNativeBundled(route: string): boolean {
  const path = route.split('?')[0].split('#')[0];
  const segs = path.split('/').filter(Boolean);
  if (segs.length === 0) return true;                       // '/' root
  const [seg0, seg1] = segs;
  if (!NATIVE_TOP_LEVEL.has(seg0)) return false;
  if (segs.length === 1) return !NATIVE_EXCLUDED_ROOTS.has(seg0);
  if (seg0 === 'maia') return NATIVE_MAIA_KEEP.has(seg1);
  if (seg0 === 'labtools') return NATIVE_LABTOOLS_KEEP.has(seg1);
  if (seg0 === 'account') return NATIVE_ACCOUNT_KEEP.has(seg1);
  return true;                                              // other allowed top-levels keep their subtree
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
