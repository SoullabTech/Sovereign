/**
 * Field Intelligence — Shared Types
 *
 * Types for the field-first /maia experience.
 * These translate internal signals into human-readable field language.
 */

import type { Element } from '@/lib/types/voiceIntent';
import type { ParticipatoryTheme } from '@/lib/consciousness/participatoryReality';

// ═══════════════════════════════════════════════════════════════
// Field State (human-readable resonance)
// ═══════════════════════════════════════════════════════════════

/** How coherent the member's field currently is — never shown as a number. */
export type FieldState = 'flicker' | 'forming' | 'stable' | 'converging';

/** Movement direction of a recurring theme. */
export type ThemeMovement = 'strengthening' | 'returning' | 'softening' | 'unresolved';

// ═══════════════════════════════════════════════════════════════
// Field Summary (API response shape)
// ═══════════════════════════════════════════════════════════════

export interface FieldTheme {
  themeKey: ParticipatoryTheme;
  label: string;
  movement: ThemeMovement;
  element?: Element;
}

export interface FieldThread {
  id: string;
  statement: string;
  source: 'maia' | 'practitioner';
  firstSeen?: string;
  whyNow?: string;
}

export interface MaiaFieldSummary {
  currentState: {
    fieldState: FieldState;
    activeElement: Element | null;
    motion: string | null;
    orientingLine: string;
  };
  emergingThemes: FieldTheme[];
  openThreads: FieldThread[];
}
