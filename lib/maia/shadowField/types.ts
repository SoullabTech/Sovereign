/**
 * Shadow Field — types (MAIA-SHADOW-FIELD-01 · PROTOTYPE v1, Dedicated room only).
 *
 * Governed by the Shadow Field Constitution v0.2 (RATIFIED 2026-09-06):
 * docs/programme/MAIA-SHADOW-FIELD-01_CONSTITUTION_v0.2_2026-09-06.md
 *
 * Invariants carried here, load-bearing — do not soften:
 *   L1  Entry is an act, not a match. No reading of member content activates the Field.
 *   L8  A frame must be encounterable. No system-authored psychological representation
 *       of the member outlives the turn that produced it.
 * There is deliberately NO type in this module for a stored reading, a score, a
 * dominant element, a member profile, or any cross-turn psychological state. The
 * absence is the enforcement.
 */

/** The six Field registers. Surface forms of the canonical epistemic registers. */
export type ShadowRegister =
  | 'observed'
  | 'felt'
  | 'member_interpretation'
  | 'maia_possibility'
  | 'archetypal'
  | 'unknown';

/**
 * Register ceiling (constitution §1, F4): system-authored content may render ONLY
 * in these registers. A system utterance rendered as OBSERVED, FELT or
 * MEMBER INTERPRETATION is register collapse.
 */
export const SYSTEM_AUTHORED_REGISTER_CEILING: readonly ShadowRegister[] = [
  'maia_possibility',
  'archetypal',
  'unknown',
] as const;

/** The arc. The member moves freely; the system may not skip encounter before differentiate. */
export type ShadowMovement =
  | 'encounter'
  | 'stay'
  | 'differentiate'
  | 'reclaim'
  | 'choose'
  | 'return';

export const MOVEMENT_ORDER: readonly ShadowMovement[] = [
  'encounter', 'stay', 'differentiate', 'reclaim', 'choose', 'return',
] as const;

/** Entry doors. Lived situations in the member's likely words — never categories about the member. */
export type ShadowDoor =
  | 'projection' | 'trigger' | 'envy' | 'recurring_pattern'
  | 'dream_image' | 'disowned_gift' | 'relationship_rupture' | 'own_words';

/**
 * The activation act (L1, F2). Modality-independent, member-authored.
 * The route REQUIRES this and never derives it from message content.
 */
export interface ShadowActivation {
  readonly act: 'member_entered_shadow_field';
  /** How the member performed the act. Recorded for the walk; never inspected to activate. */
  readonly modality: 'button' | 'typed' | 'spoken';
  readonly at: string;
  /** CMT-01 participation axes. Fixed: entry is always member-placed. */
  readonly authoredBy: 'member';
  readonly participationClass: 'placed';
  readonly authority: 'situate';
}

export interface ShadowTurnInput {
  readonly activation: ShadowActivation;
  readonly movement: ShadowMovement;
  readonly door?: ShadowDoor;
  readonly message: string;
  /** Prior turns, member-visible transcript only. Carries no system-authored state (L8/C2). */
  readonly transcript: readonly { role: 'member' | 'maia'; text: string }[];
  readonly sanctuary: boolean;
}

export interface ShadowTurnResponse {
  readonly text: string;
  readonly movement: ShadowMovement;
  readonly sanctuary: boolean;
  /** True only while an activation act is in force. Exit sets this false. */
  readonly fieldActive: true;
}

export interface ShadowRefusal {
  readonly refused: true;
  readonly reason: 'no_activation' | 'unsafe' | 'invalid_input';
  readonly text: string;
}
