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
 *
 * ── FIELD-SAFETY-COPY-01B — INTERFACE HUMILITY ─────────────────────────────
 *
 * ⭐⭐ The gate can say "I won't go there yet." It should not say "you are not
 *    ready." The system may be certain about its own boundary without claiming
 *    certainty about the person who triggered it.
 *
 * The copy MAY answer:   what will MAIA do · why the conservative path ·
 *                        what remains available
 * ⛔ The copy MAY NOT answer, without separate evidence:
 *                        what kind of person am I · what phase am I in ·
 *                        what is my psyche asking for · what can I hold
 *
 * Removed for asserting a developmental condition more specific than the
 * evidence behind the routing decision:
 *   "your field right now is asking for something more grounded"
 *   "You're in a phase where the most powerful work we can do is…"
 *   "what you're building right now is too important to skip"
 *   "when your field is ready to hold it"
 *
 * ⭐ Nothing in the replacement frames symbolic or soulful work as escapist,
 * dangerous or lesser — see docs/canon/THE_SACRED_IS_NOT_A_SYMPTOM.md.
 *
 * ⛔ `elementalNote` is REMOVED, not left unfilled. After the Aether finding
 * (that canon's Instance 2), a bare `element` string may not become member-about
 * prose until its provenance and referent are adjudicated. Elemental nuance can
 * return when it is earned; it does not wait in a vacant socket.
 */
export interface FieldSafetyCopy {
  state: 'not_safe';
  message: string;
}

/**
 * Copy for a declined boundary.
 *
 * ⛔ PRECONDITION: `fieldRouting.fieldWorkSafe === false`. There is no copy for a
 * permitted field, and inventing one is how the unreachable states arose.
 */
export function getFieldSafetyCopy(options: FieldSafetyCopyOptions): FieldSafetyCopy {
  const { fieldRouting, userName } = options;
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
    message: `${name}, I'm going to keep this grounded for now rather than move into deeper symbolic or oracular work.\n\nThe signals available to me don't give me enough confidence to justify taking us further in that direction yet. We can stay with what's concrete, embodied, and present, and return to the symbolic layer when there's a clearer basis for it.`,
  };
}

