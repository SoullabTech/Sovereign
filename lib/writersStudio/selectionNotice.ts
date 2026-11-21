/**
 * What the writer is told when highlighted words cannot become a held passage.
 *
 * Beta 2026-11-17: a writer highlighted sentences and "could not see what to click". Two seams
 * dropped the selection without a word: (1) on the page, words that do not match the section's
 * text exactly once; (2) inside the passage desk, where the page's selection door is off on
 * purpose (the desk already holds a passage). These lines only say what happened and what the
 * writer can do. They hold nothing and change nothing.
 */
import { occurrences } from '@/lib/manuscript/exactText';

/** The desk keeps its one held passage; the writer can still name particular words to MAIA. */
export const DESK_SELECTION_NOTICE =
  'This desk works with the whole passage. To ask about particular words, quote them in your message to MAIA.';

/** Why highlighted words on the page could not be held, given the section's current text. */
export function unheldSelectionNotice(sectionBody: string, selected: string): string {
  if (selected && occurrences(sectionBody, selected) > 1) {
    return 'These words appear more than once here. Select a little more so it’s clear which ones you mean.';
  }
  // Line breaks are already matched (presentation locator); what remains is usually italic or other formatting marks.
  return 'These exact words couldn’t be held, often because of italics or other formatting. Try selecting a little less.';
}
