/**
 * SEMANTIC-FIELD-01 · Design 1A — MAIA knows the Studio's own tools.
 *
 * Founder ruling 2026-11-02 (WRITERS-STUDIO-SEMANTIC-FIELD-01_FOUNDER_DESIGN_RULINGS_2026-11-02.md):
 * the witness found that no Studio control name reached MAIA, so "how do I…"
 * questions got workarounds ("paste the sections to me"). This guide is given
 * to her in every Studio conversation so she can point to the real control.
 *
 * ⛔ Every `label` here must be text the Studio actually shows. The guard test
 * (`studioGuide.test.ts`) fails if a label is absent from the UI source, so
 * MAIA is never told about a control that does not exist.
 * ⛔ She describes and points; she cannot press anything (Design 1B adds
 * controls the writer clicks, under its own ruling).
 */

export type StudioControl = {
  /** Exactly as shown on screen. */
  readonly label: string;
  readonly where: string;
  readonly does: string;
};

export const STUDIO_CONTROLS: readonly StudioControl[] = [
  { label: 'Prose', where: 'top right of the manuscript in Write', does: 'shows the manuscript as reading text' },
  { label: 'Edit', where: 'beside Prose, top right of the manuscript in Write', does: 'makes the text editable; selecting words here brings up Work with passage' },
  { label: 'Work with passage', where: 'appears beside words the writer selects in Edit', does: 'opens the passage menu: Focus, Craftsman\'s Table, Discuss, Teach me about this, More ways to work' },
  { label: 'Craftsman\'s Table', where: 'in the Work with passage menu', does: 'works on the selected words with visible changes and MAIA beside the writing' },
  { label: 'Teach me about this', where: 'in the Work with passage menu', does: 'MAIA teaches one craft idea already at work in the selected words, then lets the writer steer' },
  { label: 'More ways to work', where: 'in the Work with passage menu', does: 'revision and deeper editorial reasoning for the selected words' },
  { label: 'Show edit options', where: 'a card in Passage Focus', does: 'MAIA offers a revision of the passage for the writer to judge; nothing changes until the writer applies it' },
  { label: 'Discuss what’s happening', where: 'a card in Passage Focus', does: 'talk about the passage before changing anything' },
  { label: 'Show me examples', where: 'a card in Passage Focus', does: 'illustrative examples of a craft move, as examples rather than recommendations' },
  { label: 'Teach me about the writing', where: 'a card in Passage Focus', does: 'one craft idea at a time, in the writer\'s own words' },
  { label: 'Go deeper', where: 'a card in Passage Focus, and in the row after a reply', does: 'fuller craft and editorial vocabulary, tied to the words on the page' },
  { label: 'Ask MAIA', where: 'the box at the bottom of Passage Focus', does: 'ask MAIA anything about the passage in the writer\'s own words' },
  { label: 'Speak', where: 'below the Ask MAIA box in Passage Focus', does: 'say the question aloud; the transcript stays until the writer chooses what to do with it' },
  { label: 'Show revision options', where: 'in the row that follows MAIA\'s reply in Passage Focus', does: 'asks MAIA for possible revisions of the passage' },
  { label: 'Teach me more', where: 'in the row that follows MAIA\'s reply in Passage Focus', does: 'continues the teaching from where the conversation is' },
  { label: 'Save my version', where: 'in Passage Focus and Craftsman\'s Table, once the writer has worked on the wording', does: 'saves the writer\'s own working version without changing the manuscript' },
  { label: 'Apply my version', where: 'beside Save my version', does: 'puts the writer\'s version into the manuscript; only the writer can do this' },
  { label: 'Undo', where: 'after a version has been applied', does: 'restores the passage as it was before applying' },
  { label: 'Start a new conversation', where: 'in the Passage Focus header, while a conversation is open', does: 'sets the earlier conversation aside (it stays saved) so the next question starts fresh' },
  { label: 'Return to manuscript', where: 'in the Passage Focus header', does: 'closes Passage Focus and goes back to the manuscript' },
  { label: 'Revision latitude', where: 'Preferences in the Passage Focus header', does: 'how far any revision MAIA proposes may go, from Light upward' },
  { label: 'Why this?', where: 'on a revision mark in the manuscript', does: 'MAIA explains why she suggested that change' },
  { label: 'Change it', where: 'on a revision mark in the manuscript', does: 'the writer reworks the suggested change themselves' },
  { label: 'Talk about this place', where: 'the MAIA panel on the right in Write, after clicking a section in the manuscript list', does: 'opens the Work conversation about that section' },
  { label: 'Begin relationship with MAIA', where: 'the MAIA panel, the first time on a Work', does: 'starts the MAIA relationship for this Work, which Studio conversations need' },
  { label: 'Read this chapter', where: 'Develop, on the Overview tab', does: 'MAIA reads the whole chapter herself and says what it is doing, what works, and where she would focus; nothing changes' },
  { label: 'More ways to explore', where: 'Develop, below Read this chapter', does: 'more ways to look at the Work, including Edit with MAIA' },
  { label: 'Start an editorial pass', where: 'Develop → More ways to explore → Edit with MAIA', does: 'MAIA reads the whole current manuscript and brings the places where an edit may help, in order; nothing is applied' },
  { label: 'Ordinary', where: 'asked before the first exchange of a session', does: 'this session\'s exchanges are held normally' },
  { label: 'Sanctuary', where: 'beside Ordinary', does: 'this session is not remembered' },
];

/** What MAIA is told about the Studio she is speaking in. */
export function studioGuideInstruction(): string {
  const lines = STUDIO_CONTROLS.map((c) => `- "${c.label}" (${c.where}): ${c.does}.`);
  return [
    'THE STUDIO YOU ARE IN',
    'The writer is working in the Writer\'s Studio. Its rooms are Home, Write, Develop, Review, Publish and Listen. When the writer asks how to do something here, or when a Studio tool would serve them better than a workaround, name the real control and say where it is, using the list below. In particular, when reading more of the manuscript would help, point them to "Read this chapter" or "Start an editorial pass" rather than asking them to paste text that is already in the Studio.',
    'Only name controls from this list. If what they want is not here, say plainly that you do not know of a control for it; do not invent one or guess at a location. You cannot press any control for them; they choose and do it themselves.',
    ...lines,
  ].join('\n');
}
