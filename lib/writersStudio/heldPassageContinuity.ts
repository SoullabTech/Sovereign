/**
 * When the writer's selection re-holds a passage, does the open conversation go?
 *
 * A conversation belongs to its own passage (#2041): holding a different passage, or
 * a different section, must not show that conversation's replies. But applying an
 * option rewrites the passage, and a still-active selection then re-holds the NEW
 * words. Found in the step 3 production witness (2026-11-03): "Use this" applied, the
 * re-hold no longer matched the old passage text, and the conversation — with its
 * Undo — was cleared. The same passage, changed by the writer's own apply, is still
 * the same place.
 */

export type ReholdInput = {
  /** The re-held passage is in the section the conversation belongs to. */
  sameSection: boolean;
  /** A conversation is open. */
  hasThread: boolean;
  /** Where the conversation's passage is in the live text, if it can be found. */
  binding: { start: number; end: number } | null;
  /** The re-held range. */
  start: number;
  end: number;
  /** A save or apply for this conversation is still in flight. */
  actInFlight: boolean;
  /** The wording of the version just applied in this conversation, if any. */
  appliedWording: string | null;
  /** The re-held words. */
  heldText: string;
};

export function reholdClearsConversation(input: ReholdInput): boolean {
  if (!input.sameSection) return true;
  if (!input.hasThread) return false;
  if (input.binding && input.binding.start === input.start && input.binding.end === input.end) return false;
  // The writer's own act is rewriting this passage: the re-hold follows the change.
  if (input.actInFlight) return false;
  if (input.appliedWording !== null && input.heldText === input.appliedWording) return false;
  return true;
}

/**
 * What Focus's "Your passage" panel shows. After the writer's own apply rewrites the
 * passage, the held text is the old wording while the manuscript holds the new; the
 * conversation's live application (located uniquely in the section) names the words as
 * they stand. Otherwise the held text is shown, as before.
 */
export function focusPassageShown(input: {
  /** The held passage, or the section body when nothing is held here. */
  currentText: string;
  /** The held text is still in the manuscript at its held range. */
  heldStillLive: boolean;
  /** The conversation's return binding in the live section, if any. */
  binding: { source: 'original_locus' | 'active_application'; text: string } | null;
}): string {
  if (input.heldStillLive) return input.currentText;
  return input.binding?.source === 'active_application' ? input.binding.text : input.currentText;
}
