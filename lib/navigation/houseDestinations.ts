/**
 * House Destinations — the single authoritative definition of every place the
 * House can open, and how.
 *
 * WHY THIS EXISTS (the shared-failure fix): the House previously rendered from
 * one list (maiaNav), the native WebView allowlisted from a second
 * (lib/mobile/mobileAllowlist.ts), and the iOS bundle was stripped by a third
 * (scripts/capacitor-patch-routes.sh). The three drifted independently, so a
 * tap could be advertised, allowed in-app, and yet absent from the bundle — a
 * silent white screen. This file is the one authoritative navigation POLICY —
 * the House renders from it — with test-enforced AGREEMENT against the existing
 * runtime allowlist and Capacitor build config (see __tests__/houseNavDrift.test.ts).
 *
 * Not yet fully unified: the native bundle config still lives in
 * scripts/capacitor-patch-routes.sh. The drift guard makes that duplication
 * safe (it fails on drift); it does not eliminate it. PR 2 may decide whether
 * the Capacitor config should be GENERATED from this model rather than merely
 * checked against it.
 *
 * SCOPE (PR 1 — navigation contract): this defines the model + dispatch and
 * classifies every destination. It does NOT change the native bundle. Rooms
 * marked { nativePolicy: 'native', nativeReady: false } are the PR 2
 * deliverable (Ideas / Living Field / Keeps / Anchor): until they are actually
 * reconciled into the allowlist + keep-list, they render on web and stay
 * hidden on native rather than showing a broken button.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Flame,
  Sprout,
  BookOpen,
  Compass,
  Lightbulb,
  Library,
  Bookmark,
  Briefcase,
  Orbit,
  BookCopy,
  Users,
  Wind,
  Settings as SettingsIcon,
} from 'lucide-react';

/** How the House acts on a destination. */
export type HouseActionKind = 'route' | 'sheet' | 'external';

/** For 'route' destinations: how they behave on the native iOS build. */
export type NativePolicy = 'native' | 'web';

/** Existing member sheets the House can open (no new surfaces). */
export type HouseSheetId = 'changes';

export type HouseAudience = 'all' | 'founder';

export type HouseGroup = 'center' | 'life' | 'work' | 'rooms' | 'utility';

export type ReturnBehavior = 'back-to-maia' | 'sheet-close' | 'web-bridge';

export interface HouseDestination {
  id: string;
  label: string;
  icon: LucideIcon;
  tooltip?: string;
  kind: HouseActionKind;
  /** For 'route' / 'external'. */
  route?: string;
  /** For 'sheet'. */
  sheet?: HouseSheetId;
  audience: HouseAudience;
  /** For 'route': open in-app on native ('native') or via the web bridge ('web'). */
  nativePolicy?: NativePolicy;
  /**
   * Only meaningful when nativePolicy === 'native'. TRUE when the route is
   * actually reconciled into the native bundle (present in BOTH the runtime
   * allowlist and the Capacitor keep-list — enforced by the drift guard). When
   * FALSE, the destination is web-only-visible and HIDDEN on native until the
   * reconciliation lands (PR 2). Never render a native-not-ready room on native.
   */
  nativeReady?: boolean;
  /** Visibility governed by a live rule rather than audience class (Co-lab). */
  conditional?: 'colab';
  /** Interim placement — surfaced in UI and the PR record, never silently ratified. */
  interim?: boolean;
  returnBehavior: ReturnBehavior;
  group: HouseGroup;
}

/**
 * THE LIST. Order within a group is display order.
 *
 * Policy (founder ruling 2026-07-27):
 *  - Native in-app rooms: Ideas, Living Field, Settings, Journal, Keeps, Anchor.
 *    Journal + Settings already work (nativeReady) and are the reference impls;
 *    the other four are nativeReady:false pending PR 2.
 *  - Sheets (existing member surfaces, no new routes): Changes.
 *  - Web environments (honest bridge, first pass): Wisdom, Astrology,
 *    Community Library, Co-lab, Circles, Vision Studio.
 *  - Studio: interim → /press/manuscript (the live author-writing surface),
 *    explicitly interim, NOT a ratification of final Studio placement, and NOT
 *    /studio (which is the practitioner Pro Studio).
 */
export const HOUSE_DESTINATIONS: HouseDestination[] = [
  // ── Center ────────────────────────────────────────────────────────────
  {
    id: 'maia',
    label: 'MAIA',
    icon: Flame,
    tooltip: 'Return to center field',
    kind: 'route',
    route: '/maia',
    audience: 'all',
    nativePolicy: 'native',
    nativeReady: true,
    returnBehavior: 'back-to-maia',
    group: 'center',
  },

  // ── My Life ───────────────────────────────────────────────────────────
  {
    id: 'living-field',
    label: 'Living Field',
    icon: Sprout,
    tooltip: 'A place to gather and reflect on lived experience',
    kind: 'route',
    route: '/maia/living-field',
    audience: 'all',
    nativePolicy: 'native',
    nativeReady: false, // PR 2
    returnBehavior: 'back-to-maia',
    group: 'life',
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: BookOpen,
    tooltip: 'Expressive writing — one practice surface',
    kind: 'route',
    route: '/journal', // corrected: the native-bundled journal (was /labtools/journal — founder-gated + stripped)
    audience: 'all',
    nativePolicy: 'native',
    nativeReady: true, // reference implementation
    returnBehavior: 'back-to-maia',
    group: 'life',
  },
  {
    id: 'anchor',
    label: 'Anchor',
    icon: Compass,
    tooltip: 'A quiet place to return',
    kind: 'route',
    route: '/maia/anchor',
    audience: 'all',
    nativePolicy: 'native',
    nativeReady: false, // PR 2
    returnBehavior: 'back-to-maia',
    group: 'life',
  },

  // ── My Work ───────────────────────────────────────────────────────────
  {
    id: 'ideas',
    label: 'Ideas',
    icon: Lightbulb,
    tooltip: 'Emerging thoughts and creative impulses',
    kind: 'route',
    route: '/maia/ideas',
    audience: 'all',
    nativePolicy: 'native',
    nativeReady: false, // PR 2
    returnBehavior: 'back-to-maia',
    group: 'work',
  },
  {
    id: 'keeps',
    label: 'Keeps',
    icon: Bookmark,
    tooltip: 'Moments you have held onto',
    kind: 'route',
    route: '/maia/keep-capture',
    audience: 'all',
    nativePolicy: 'native',
    nativeReady: false, // PR 2
    returnBehavior: 'back-to-maia',
    group: 'work',
  },
  // Existing member sheets — opened in place on /maia, never a new route/page.
  //
  // Changes is member-owned (/api/changes is member-scoped) → audience 'all'.
  //
  // Decisions is deliberately ABSENT. The 2026-07-27 audit gated it to
  // 'founder' so only practitioners saw it here; the 2026-07-28 ruling
  // supersedes that: Decisions is a practitioner capability and is not part of
  // the member House grammar AT ALL — including for a practitioner who is
  // using the member House. The distinction is drawn by surface, not identity.
  // A 401 is not a substitute for coherent navigation, and neither is a
  // conditional render. The practitioner surface (/studio/decisions,
  // /api/studio/decisions) is unchanged. Ruling recorded in PR #785 (Supersession section); no repo canon doc records it yet — do not cite one.
  {
    id: 'changes',
    label: 'Changes',
    icon: Wind,
    tooltip: 'Name and walk a change',
    kind: 'sheet',
    sheet: 'changes',
    audience: 'all', // member-owned — mirrors member-scoped /api/changes
    returnBehavior: 'sheet-close',
    group: 'work',
  },

  // ── Rooms ─────────────────────────────────────────────────────────────
  {
    id: 'studio',
    label: 'Studio',
    icon: Briefcase,
    tooltip: 'Your writing surface (interim)',
    kind: 'route',
    route: '/press/manuscript', // INTERIM — the live author-writing surface. NOT /studio (Pro Studio),
    // and NOT a ratification of final Studio placement. See PR record.
    audience: 'all',
    nativePolicy: 'web', // /press/manuscript is not in the native bundle; bridge on native for now
    interim: true,
    returnBehavior: 'web-bridge',
    group: 'rooms',
  },
  {
    id: 'astrology',
    label: 'Astrology',
    icon: Orbit,
    tooltip: 'Your cosmic spiral',
    kind: 'route',
    route: '/astrology',
    audience: 'all',
    nativePolicy: 'web', // first pass: honest web bridge
    returnBehavior: 'web-bridge',
    group: 'rooms',
  },
  {
    id: 'community-library',
    label: 'Community Library',
    icon: BookCopy,
    tooltip: 'Shared knowledge & collective resources',
    kind: 'route',
    route: '/maia/community/library',
    audience: 'all',
    nativePolicy: 'web',
    returnBehavior: 'web-bridge',
    group: 'rooms',
  },
  {
    id: 'wisdom',
    label: 'Wisdom',
    icon: Library,
    tooltip: 'Sacred texts, learning, and collected knowledge',
    kind: 'route',
    route: '/wisdom-keepers/wisdom',
    audience: 'all',
    nativePolicy: 'web',
    returnBehavior: 'web-bridge',
    group: 'rooms',
  },
  {
    id: 'colab',
    label: 'Co-lab',
    icon: Users,
    tooltip: 'Shared work and conversation',
    kind: 'route',
    route: '/team/for-you',
    audience: 'all',
    nativePolicy: 'web',
    conditional: 'colab', // visibility governed by isColabVisible (preserved in the House)
    returnBehavior: 'web-bridge',
    group: 'rooms',
  },
  {
    id: 'circles',
    label: 'Circles',
    icon: Users,
    tooltip: 'Enter shared field',
    kind: 'route',
    route: '/commons/circles',
    audience: 'founder',
    nativePolicy: 'web',
    returnBehavior: 'web-bridge',
    group: 'rooms',
  },
  {
    id: 'vision-studio',
    label: 'Vision Studio',
    icon: Compass,
    tooltip: 'Vision Studio — developmental field',
    kind: 'route',
    route: '/maia/vision-studio',
    audience: 'founder',
    nativePolicy: 'web',
    returnBehavior: 'web-bridge',
    group: 'rooms',
  },

  // ── Utility (below the divider) ───────────────────────────────────────
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    kind: 'route',
    route: '/account/settings',
    audience: 'all',
    nativePolicy: 'native',
    nativeReady: true, // reference implementation
    returnBehavior: 'back-to-maia',
    group: 'utility',
  },
];

// --- Selection & classification helpers ---------------------------------

/** Audience filter. Founder-only destinations are hidden from non-founders. */
export function getHouseDestinations(isFounder: boolean): HouseDestination[] {
  return HOUSE_DESTINATIONS.filter((d) => d.audience !== 'founder' || isFounder);
}

/**
 * How a destination should render/behave on the current platform.
 *  - 'sheet'  → open an existing member sheet in place
 *  - 'native' → open in-app (router.push)
 *  - 'web'    → open via the honest web bridge (native) or router.push (web)
 *  - 'hidden' → a native-only room not yet reconciled into the bundle; shown on
 *               web, withheld on native so no broken button appears
 */
export type Reachability = 'sheet' | 'native' | 'web' | 'hidden';

export function classifyReachability(d: HouseDestination, isNative: boolean): Reachability {
  if (d.kind === 'sheet') return 'sheet';
  if (d.kind === 'external' || d.nativePolicy === 'web') return 'web';
  // nativePolicy === 'native'
  if (!isNative) return 'native'; // on web, native routes just push
  return d.nativeReady ? 'native' : 'hidden';
}

/** Destinations to actually render, in a group, for a platform. */
export function visibleInGroup(
  destinations: HouseDestination[],
  group: HouseGroup,
  isNative: boolean,
): HouseDestination[] {
  return destinations.filter(
    (d) => d.group === group && classifyReachability(d, isNative) !== 'hidden',
  );
}

// --- Dispatch (pure; the UI injects router + sheet openers) --------------

export interface HouseDispatchContext {
  isNative: boolean;
  push: (path: string) => void;
  openSheet: (sheet: HouseSheetId) => void;
  /** Called before navigating/opening, to close the House. */
  onClose?: () => void;
}

/**
 * The native web bridge: an allowlisted, bundled page (`/open-web`) that opens a
 * route on the web instead of in-app, forwarding the destination as `?to=`.
 *
 * WEB_BRIDGE_ROUTE MUST be in the runtime mobile allowlist — otherwise
 * MobileRouteGuard shadows it with its own generic web-only screen and the
 * `?to=` target is lost, so the destination is never reached. The drift guard
 * (see __tests__/houseNavDrift.test.ts) enforces that reachability so the two
 * cannot drift apart.
 */
export const WEB_BRIDGE_ROUTE = '/open-web';

export function webBridgePath(route: string): string {
  return `${WEB_BRIDGE_ROUTE}?to=${encodeURIComponent(route)}`;
}

/**
 * Perform the House action for a destination. The single dispatch point that
 * replaces the old uniform `onClose(); router.push(route)`.
 */
export function dispatchHouseDestination(d: HouseDestination, ctx: HouseDispatchContext): void {
  ctx.onClose?.();
  if (d.kind === 'sheet' && d.sheet) {
    ctx.openSheet(d.sheet);
    return;
  }
  const route = d.route;
  if (!route) return;
  const reach = classifyReachability(d, ctx.isNative);
  if (reach === 'web') {
    ctx.push(ctx.isNative ? webBridgePath(route) : route);
    return;
  }
  // 'native' (or web platform): direct push
  ctx.push(route);
}
