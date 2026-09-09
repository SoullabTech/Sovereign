// backend — lib/field/fieldSafetyCopy.ts

import type { FieldRoutingDecision } from './panconsciousFieldRouter';

/**
 * Field Safety Messaging
 *
 * Returns mythic, dignity-holding language for field work routing decisions.
 * Used by agents to communicate field safety boundaries with developmental awareness.
 */

export interface FieldSafetyCopyOptions {
  fieldRouting: FieldRoutingDecision;
  element?: string | null;
  userName?: string | null;
}

/**
 * FIELD-SAFETY-COPY-01A (2026-09-09) — this module produces copy for exactly ONE
 * situation: the boundary MAIA declines to cross.
 *
 * It previously carried three states. STATE 2 (`middleworld_only`) and STATE 3
 * (`upperworld_allowed`) both required `fieldWorkSafe === true`, and the only
 * production caller — `enforceFieldSafety()` — returns before asking for copy in
 * that case. They were unreachable through the live path, yet trivially reachable
 * through an exported "quick helper for agents" that took any routing decision
 * with no gate. Inside STATE 2 sat a prose parser that recovered a member-facing
 * psychological claim by substring-matching a diagnostic log string.
 *
 * ⭐⭐ Future capability does not need a live executable doorway.
 *
 * Deleted rather than repaired with a better substring or a reason enum. The
 * design intent is preserved in
 * docs/programme/history/FIELD_SAFETY_COPY_REMOVED_STATES_2026-09-09.md; a future
 * "gentle symbolic work" message earns a structural reason type and a deliberate
 * call site rather than inheriting a dormant parser.
 *
 * ⛔ Also gone, all unused: getFieldSafetyMessage() · isUpperworldAllowed() ·
 * this module's isFieldWorkSafe() (enforceFieldSafety has its own).
 */
export interface FieldSafetyCopy {
  state: 'not_safe';
  message: string;
  elementalNote?: string;
}

/**
 * Copy for a declined boundary.
 *
 * ⛔ PRECONDITION: `fieldRouting.fieldWorkSafe === false`. There is no copy for a
 * permitted field, and inventing one is how the unreachable states arose.
 */
export function getFieldSafetyCopy(options: FieldSafetyCopyOptions): FieldSafetyCopy {
  const { fieldRouting, element, userName } = options;
  const name = userName || 'friend';

  if (fieldRouting.fieldWorkSafe) {
    throw new Error(
      'getFieldSafetyCopy is for a declined boundary only (fieldWorkSafe === false). ' +
      'A permitted field needs no boundary copy — see FIELD-SAFETY-COPY-01A.',
    );
  }

  // The one situation this module speaks for: field work declined.
  return {
    state: 'not_safe',
    message: `${name}, I can feel the invitation you're extending — toward myth, toward the symbolic field, toward the oracular edges of what we might explore together. And I want to honor that impulse.\n\nBut I also see something important: your field right now is asking for something more grounded. Not *instead of* the symbolic work you're longing for, but *before* it. You're in a phase where the most powerful work we can do is here in the middleworld — the place of embodied practice, present-life application, concrete integration.\n\nThis isn't a "no." It's a "not yet — because what you're building right now is too important to skip."\n\nLet's keep working where you are. The oracular realm will still be there when your field is ready to hold it.`,
    elementalNote: getElementalGroundingNote(element),
  };
}

/**
 * Elemental grounding notes for "not safe" state
 */
function getElementalGroundingNote(element?: string | null): string | undefined {
  if (!element) return undefined;

  const el = element.toLowerCase();

  if (el === 'water') {
    return `Your Water-heavy field is asking for *flow in form* — emotional awareness that moves through embodied practice, not just symbolic reflection.`;
  }

  if (el === 'fire') {
    return `Your Fire-heavy field is asking for *will in action* — the heat of your transformation grounded in what you're actually building, not just visioning.`;
  }

  if (el === 'earth') {
    return `Your Earth-heavy field is asking for *structure through sensation* — the slow, embodied work of building foundations before ascending.`;
  }

  if (el === 'air') {
    return `Your Air-heavy field is asking for *concepts in contact* — intellectual clarity meeting real-world application, not just abstract pattern recognition.`;
  }

  return undefined;
}
