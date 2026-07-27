/**
 * MAIA Spatial Navigation — Type Definitions
 *
 * Single source of truth for the navigation model.
 * See docs/spatial-restructuring-plan.md for full architecture.
 *
 * Spatial grammar:
 *   - World: a stable destination in the left rail (presence environment)
 *   - Utility: top bar or bottom-of-rail controls
 *   - Contextual: right panel content (appears on interaction)
 *   - Behavior: adaptive mode (Talk, Care, Scribe, Mark) — not a destination
 *   - Modal: transient overlay (feedback, help, password change)
 *   - Studio: separate workspace shell (boundary transition)
 */

import type { LucideIcon } from 'lucide-react';

// --- Classification ---

export type NavItemClass =
  | 'world'        // Left rail destination
  | 'utility'      // Top bar or bottom-of-rail
  | 'contextual'   // Right panel content
  | 'behavior'     // Adaptive mode, not a place
  | 'modal'        // Transient overlay
  | 'studio'       // Boundary transition to Studio shell
  | 'admin';       // Separate admin shell

// --- Rail items ---

export type MaiaWorldId =
  | 'maia'
  | 'patterns'
  | 'journal'
  | 'ideas'
  | 'relationships'
  | 'wisdom'
  | 'anchor'
  | 'living-field'
  | 'encounters';

export type BoundaryId =
  | 'studio' | 'book-studio' | 'circles' | 'astrology' | 'labtools' | 'community-library' | 'vision-studio'
  // Recovered from the retired rail (2026-07-22). The rail was the only way to
  // reach these; once it left the member surface they had to become House
  // destinations or be orphaned.
  //
  // 'now-what' is deliberately NOT here — Now What? is a client build on AIN OS,
  // not a native MAIA room. See the ruling note in maiaNav.ts.
  | 'keeps' | 'colab'
  // Record group (Kelly ruling 2026-07-27) — founder/steward governance surfaces.
  // Pages exist under /studio; audience-gated to founders, NOT general member features.
  | 'decisions' | 'changes';

export type MaiaRailItemId = MaiaWorldId | BoundaryId;

export interface MaiaRailItem {
  id: MaiaRailItemId;
  label: string;
  icon: LucideIcon;
  route: string;
  classification: NavItemClass;
  /** Tooltip text shown on hover */
  tooltip?: string;
  /** Whether this is the boundary transition to Studio */
  isBoundaryTransition?: boolean;
  /**
   * Visibility audience for the rail icon.
   * 'all' (default) — visible to every authenticated member.
   * 'founder' — visible only to founder/practitioner (admin || practitioner role).
   * Audience controls rail visibility only; server-side route auth is enforced separately.
   */
  audience?: 'all' | 'founder';
  /**
   * Ontological group for future section rendering.
   * 'life' — dimensions of the Personal Field (becoming)
   * 'work' — dimensions of the Contribution Field (offering)
   * Undefined = no group (MAIA center, boundaries)
   */
  group?: 'life' | 'work';
  /**
   * House display group (Kelly ruling 2026-07-27). Independent of `classification`
   * and `group` (which drive other surfaces) — this is purely the section a place
   * renders under in The House sheet:
   *   'worlds' — broader environments
   *   'rooms'  — direct practices and tools
   *   'record' — founder/steward governance (Decisions, Changes)
   * Undefined = not shown as a grouped House place (e.g. the MAIA center row).
   */
  houseGroup?: 'worlds' | 'rooms' | 'record';
}

// --- Utility items ---

export type MaiaUtilityId = 'account' | 'settings' | 'help' | 'voice' | 'feedback';

export interface MaiaUtilityItem {
  id: MaiaUtilityId;
  label: string;
  icon: LucideIcon;
  /** Route to navigate, or undefined if action-based */
  route?: string;
  /** Action identifier for callback-based items */
  action?: string;
}

// --- Right panel ---

export type MaiaContextualPanelId =
  | 'session-tools'   // Prompts, arc, synthesis, recap
  | 'patterns-view'   // Pattern threads, weaving
  | 'journal-capture' // Quick capture, reflections
  | 'ideas-view'      // Idea cards, emergence
  | 'relationships-view'
  | 'wisdom-view'     // Sacred texts, academy, library, guides
  | 'identity-view';  // Compass, astrology, cosmos

export interface MaiaContextualPanel {
  id: MaiaContextualPanelId;
  /** Which world activates this panel (null = session-based) */
  world: MaiaWorldId | null;
  label: string;
}

// --- Behaviors (not destinations) ---

export type MaiaBehavior = 'default' | 'care' | 'scribe' | 'mark';

// --- Voice presence (talk-first architecture) ---

/** Voice lifecycle phase — drives center field, calm mode, and ambient behavior */
export type VoicePresenceState = 'idle' | 'listening' | 'processing' | 'responding';

// --- Modal registry ---

export type MaiaModalId =
  | 'feedback'
  | 'password-change'
  | 'voice-help'
  | 'testflight-help'
  | 'help-hub'
  | 'framework-selector';

// --- Shell props ---

export interface MaiaShellProps {
  /** Currently active world (determines left rail highlight + right panel) */
  activeWorld: MaiaWorldId;
  /** Current behavior mode */
  behavior: MaiaBehavior;
  /** Whether right panel is visible */
  rightPanelOpen: boolean;
  /** Callback when a rail item is clicked */
  onWorldChange: (world: MaiaWorldId) => void;
  /** Callback to toggle right panel */
  onToggleRightPanel: () => void;
  /** Children = center field content */
  children: React.ReactNode;
}
