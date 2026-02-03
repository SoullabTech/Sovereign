/**
 * Conversation Mode Utilities
 *
 * Type-safe handling of conversation modes (Talk/Care/Note).
 * Central source of truth for mode normalization and predicates.
 *
 * Client modes: normal, patient, session
 * Internal modes: dialogue, counsel, scribe
 *
 * @module lib/api/conversationMode
 */

/**
 * Internal conversation modes (mapped from client mode names).
 * - dialogue: Talk mode (quick conversational)
 * - counsel: Care mode (deep therapeutic) — expects relationship context
 * - scribe: Note mode (witnessing, documentation)
 */
export const CONVERSATION_MODES = ['dialogue', 'counsel', 'scribe'] as const;
export type ConversationMode = (typeof CONVERSATION_MODES)[number];

/**
 * Normalize client mode names to internal ConversationMode.
 * Maps: normal→dialogue, patient→counsel, session→scribe
 * Defaults to 'dialogue' if undefined, null, or unrecognized.
 *
 * Input is `string | null | undefined` (not the strict union) to harden
 * against upstream schema drift — request bodies are inherently loose.
 *
 * @returns ConversationMode (typed, never undefined)
 */
export function normalizeConversationMode(rawMode: string | null | undefined): ConversationMode {
  switch (rawMode) {
    // Client legacy names
    case 'normal':  return 'dialogue';
    case 'patient': return 'counsel';
    case 'session': return 'scribe';
    // Already normalized
    case 'dialogue':
    case 'counsel':
    case 'scribe':
      return rawMode;
    // Null, undefined, or unrecognized → default
    default:
      return 'dialogue';
  }
}

/**
 * Exhaustive check: does this conversation mode expect relationship context?
 * - Compile-time: TS forces handling new modes if ConversationMode evolves
 * - Runtime: default case catches `as any` escapes
 *
 * @returns true for 'counsel' (Care mode), false for others
 */
export function isRelationshipMode(mode: ConversationMode): boolean {
  switch (mode) {
    case 'counsel': // Care mode — deep therapeutic, expects relationship context
      return true;
    case 'dialogue': // Talk mode — quick conversational
    case 'scribe':   // Note mode — witnessing, documentation
      return false;
    default:
      return assertNeverConversationMode(mode);
  }
}

/**
 * Exhaustive switch tripwire: catches unhandled ConversationMode values.
 * - Compile-time: TS shows error if new modes aren't handled
 * - Runtime: throws with greppable error code
 */
export function assertNeverConversationMode(x: never): never {
  throw new Error(`[E_INVARIANT_CONVERSATION_MODE] Unexpected conversation mode: ${JSON.stringify(x)}`);
}
