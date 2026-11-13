/**
 * SEMANTIC-FIELD-01 · Design 1A — MAIA knows the Studio's own tools.
 *
 * Founder ruling 2026-11-02 (WRITERS-STUDIO-SEMANTIC-FIELD-01_FOUNDER_DESIGN_RULINGS_2026-11-02.md):
 * the witness found that no Studio control name reached MAIA, so "how do I…"
 * questions got workarounds ("paste the sections to me"). This guide is given
 * to her in every Studio conversation so she can point to the real control.
 *
 * ⭐ 2026-11-11 (WS-STUDIO-GUIDE-WHOLE-01): extended from Write/Passage Focus to the WHOLE Studio — every room, the top bar, the
 * Develop stage and its conversation — so writers, trainers and groups can ask MAIA "how do I… / where is… / what does … do".
 * The census behind it: docs/programme/WRITERS_STUDIO_GUIDE_CENSUS_2026-11-11.md.
 *
 * Generated wherever a registry exists, so it cannot drift:
 *   - the rooms come from the top bar's own `PRIMARY_MODES`;
 *   - "not in the Studio yet" comes from `STUDIO_MAP` destinations marked `later` (never described as available);
 *   - every Develop capability in `DEVELOP_CAPABILITIES` must be covered by an entry here (the guard test fails otherwise).
 * Hand-written text is only "where it is / what it does".
 *
 * ⛔ Every `label` here must be text the Studio actually shows. The guard test
 * (`studioGuide.test.ts`) fails if a label is absent from the live UI source, so
 * MAIA is never told about a control that does not exist.
 * ⛔ She describes and points; she cannot press anything (Design 1B adds
 * controls the writer clicks, under its own ruling).
 * ⛔ Sanctuary: tools that read, keep or plan from the writer's work are marked `inSanctuary: false` and are left out of the
 * Sanctuary guide altogether (walk 2026-11-09, defect 5: she suggested granting reading permission inside Sanctuary).
 */
import { PRIMARY_MODES } from '@/app/writers-studio/full-redesign/types';
import { STUDIO_MAP } from '@/app/writers-studio/studioMap';
import { writerExportCertified } from '@/lib/writersStudio/releaseAuthority';

/**
 * WHAT IS SWITCHED ON in the Studio this server is running (2026-11-11). Source is not runtime: a control merged behind a
 * switch is not one a writer sees. Each value is read the same way the Studio itself reads it, so the guide describes the
 * Studio the writer is actually in:
 *   developStage — `process.env.NEXT_PUBLIC_WS_DEVELOP_STAGE === '1'` (P4R1DevelopView; inlined at build, like the client)
 *   autoRead     — `process.env.NEXT_PUBLIC_WS_AUTO_READ === '1'` (P4R1DevelopView / EditorialLetterPanel)
 *   proGate      — `WS_PRO_GATE_ENABLED === 'true'` (proGateEnabled in lib/auth/wholeWorkEntitlement; repeated here because that
 *                  module opens the database; the guard test pins the two to the same rule)
 *   exports      — `writerExportCertified('pdf') && writerExportCertified('epub')` (the Publish room's own condition)
 */
export type StudioRuntime = {
  readonly developStage: boolean;
  readonly autoRead: boolean;
  readonly proGate: boolean;
  readonly exportsCertified: boolean;
};
export function studioRuntime(): StudioRuntime {
  return {
    developStage: process.env.NEXT_PUBLIC_WS_DEVELOP_STAGE === '1',
    autoRead: process.env.NEXT_PUBLIC_WS_AUTO_READ === '1',
    proGate: process.env.WS_PRO_GATE_ENABLED === 'true',
    exportsCertified: writerExportCertified('pdf') && writerExportCertified('epub'),
  };
}

export type StudioRoom = 'everywhere' | 'home' | 'write' | 'develop' | 'review' | 'publish' | 'listen';

export type StudioControl = {
  /** Exactly as shown on screen. */
  readonly label: string;
  readonly room: StudioRoom;
  readonly where: string;
  readonly does: string;
  /** Keys of `DEVELOP_CAPABILITIES` this entry explains (the guard test requires every capability to be covered). */
  readonly develop?: readonly string[];
  /** false = not offered in a Sanctuary session; left out of the Sanctuary guide. */
  readonly inSanctuary?: false;
  /** Shown only when the Develop stage is switched on (`NEXT_PUBLIC_WS_DEVELOP_STAGE`). */
  readonly stageOnly?: true;
};

/** The Develop stage's view names, as on screen (pinned to `STUDIO_DEPTH_LABEL` by the guard test). */
export const VIEW_LABELS = ['Quiet', 'Balanced', 'All tools'] as const;
/** The Develop ways row, as on screen (pinned to `NAV_LABEL` in P4R1DevelopView by the guard test). */
export const LENS_LABELS = ['Development', 'Structure', 'Arc', 'Themes', 'Voice', 'Coherence', 'Continuity', 'Reader'] as const;

/** Exact consent copy shown wherever the Studio asks how a session is held. Pinned to the UI by the guard test. */
export const POSTURE_COPY = 'Ordinary can be remembered; Sanctuary is never saved.';

export const STUDIO_CONTROLS: readonly StudioControl[] = [
  /* ── Everywhere: the top bar and the floating buttons ───────────────────────────────── */
  { room: 'everywhere', label: 'Preferences', where: 'the top bar, in every room', does: 'opens "How would you like to work?": the writer can describe in their own words how they want the Studio to look, or fine-tune it directly' },
  { room: 'everywhere', label: 'Tell the Studio in your own words', where: 'inside Preferences', does: 'the writer writes a display wish (for example "MAIA, show me fewer choices"), presses Review, and then Apply to my Studio or Not now; nothing changes until they apply it' },
  { room: 'everywhere', label: 'Fine-tune directly', where: 'inside Preferences', does: 'direct settings: How much to show (Quiet, Balanced, All tools), Working pace (Intimate, Guided, Mapped), Explanation (Plain, Guided, Craft, Deep: how much MAIA explains) and Reading size (Large, Larger, Largest)' },
  { room: 'everywhere', label: 'About Studio access', where: 'at the bottom of Preferences', does: 'a short note that Free and Pro belong to the same Studio. The link under it, "See the planned Free and Pro experience", does not open a page yet, so do not send the writer there. There is no plan switch anywhere on screen' },
  { room: 'everywhere', label: 'Layout', where: 'the top bar, just right of Preferences (it used to be called View)', does: 'text size and which panels show: the Studio theme (colours only), Aa reading size, hide or show the Manuscript panel on the left and the MAIA panel on the right, and Reset widths' },
  { room: 'everywhere', label: 'Studio theme', where: 'inside Layout, under Theme', does: 'changes the Studio\'s colours only (Day, Evening, Atelier, Night Study, Forest, Cloud, Midnight)' },
  { room: 'everywhere', label: 'Reset widths', where: 'inside Layout, when both side panels are showing', does: 'puts both side panels back to their original widths; the dividers between panels can also be dragged, and double-clicked to reset' },
  { room: 'everywhere', label: 'Choose another Work', where: 'the Work\'s title with a small arrow, at the right end of the top bar', does: 'goes to Studio Home to pick another Work' },
  { room: 'everywhere', label: 'Report a bug', where: 'the floating button at the bottom right of every page', does: 'sends a bug report to the Soullab team' },
  { room: 'everywhere', label: 'Beta journey', where: 'the floating button at the bottom left, for writers in the beta only', does: 'the Soullab team\'s questions for beta writers; answers can be withdrawn, or shared to the Beta Co-Lab' },
  { room: 'everywhere', label: 'Keep beta note', where: 'from the Beta note button at the bottom left, for beta writers only', does: 'records a short note about "What happened?" in this moment for the Soullab team' },
  { room: 'everywhere', label: 'Ordinary', where: `asked in place before the first exchange when the Studio does not yet know how the session is held ("${POSTURE_COPY}"): in Passage Focus, in the Craftsman's Table, and in Develop's More panel`, does: 'this session\'s exchanges are held normally and can be remembered' },
  { room: 'everywhere', label: 'Sanctuary', where: 'beside Ordinary', does: 'this session is never saved: MAIA does not read the writer\'s saved work, cannot make a plan, and nothing is kept' },

  /* ── Home ───────────────────────────────────────────────────────────────────────────── */
  { room: 'home', label: 'Return to this work', where: 'Home, on the current Work\'s card', does: 'opens the manuscript where the writer left off' },
  { room: 'home', label: 'Choose a manuscript to continue', where: 'Home, on the current Work\'s card, when the Work has more than one manuscript', does: 'pick which manuscript to open' },
  { room: 'home', label: 'What feeds this Work', where: 'Home, under the current Work\'s card', does: 'shows the materials the writer has said feed this Work' },
  { room: 'home', label: 'New Work', where: 'Home, under "Start or bring a Work"', does: 'creates a Work (a name can be given now or later)' },
  { room: 'home', label: 'Import writing', where: 'Home, under "Start or bring a Work"', does: 'brings an existing manuscript file into the Studio' },
  { room: 'home', label: 'Notes & sources', where: 'Home, under "Start or bring a Work"', does: 'opens the place for notes and source material' },
  { room: 'home', label: 'See all history', where: 'Home, in History', does: 'the full history of the writer\'s writings' },
  { room: 'home', label: 'Make this a Work', where: 'Home, on a writing that is not yet in a Work (beside Add to a Work)', does: 'turns that writing into a Work of its own, or Add to a Work puts it into an existing one' },

  /* ── Write ──────────────────────────────────────────────────────────────────────────── */
  { room: 'write', label: 'Prose', where: 'top right of the manuscript in Write', does: 'shows the manuscript as reading text' },
  { room: 'write', label: 'Edit', where: 'beside Prose, top right of the manuscript in Write', does: 'makes the text editable; selecting words here brings up Talk with MAIA' },
  { room: 'write', label: 'Edit this section', where: 'under each section while reading in Prose', does: 'switches just that section to Edit' },
  { room: 'write', label: 'Full Canvas', where: 'top right of the page in Write', does: 'the same page with more room: the top bar and panels step back; Return brings them back' },
  { room: 'write', label: 'Talk with MAIA', where: 'floating beside words the writer has selected in Edit', does: 'opens the passage door for those words' },
  { room: 'write', label: 'Tell MAIA what you want', where: 'the box that opens from Talk with MAIA, beside words the writer selects in Edit', does: 'the writer says in their own words what they want for the selected passage; it opens the conversation about it' },
  { room: 'write', label: 'What’s happening here?', where: 'under the box that opens from Talk with MAIA', does: 'MAIA talks about the selected passage before changing anything' },
  { room: 'write', label: 'Teach me the craft', where: 'under the box that opens from Talk with MAIA', does: 'MAIA teaches one craft idea already at work in the selected words, then lets the writer steer' },
  { room: 'write', label: 'Show me an edit', where: 'under "or let MAIA offer" in the box that opens from Talk with MAIA', does: 'MAIA offers a revision of the selected words for the writer to judge; nothing changes until they apply it' },
  { room: 'write', label: 'Craftsman\'s Table', where: 'reached through MAIA: Change it on her option, or by asking her', does: 'works on the selected words change by change, with MAIA beside the writing' },
  { room: 'write', label: 'We’ve talked about this passage before.', where: 'at the top of Passage Focus when the passage has earlier conversations', does: 'the writer can open Our latest, an Earlier one, or Start a new one' },
  { room: 'write', label: 'Shorter, please', where: 'under MAIA\'s latest reply in Passage Focus', does: 'asks MAIA to say it more briefly and keeps her replies short from then on' },
  { room: 'write', label: 'Say more', where: 'under MAIA\'s latest reply in Passage Focus', does: 'asks MAIA for a fuller answer and keeps her replies fuller from then on' },
  { room: 'write', label: 'Use this', where: 'on MAIA\'s option card in Passage Focus', does: 'applies that option in one press (it becomes the writer\'s own version); Undo is right there' },
  { room: 'write', label: 'Adjust', where: 'on MAIA\'s option card in Passage Focus', does: 'works through the option change by change: use, keep the writer\'s own, or write each one, and ask why or for another way about a single change' },
  { room: 'write', label: 'Next passage', where: 'under More ⋯ at the top of Passage Focus', does: 'moves to the next paragraph, or asks MAIA where to work next; nothing is saved or applied by moving' },
  { room: 'write', label: 'Pause MAIA’s revisions', where: 'More ⋯ → Preferences, at the top of Passage Focus', does: 'for this passage, MAIA keeps talking but offers no new wording until the writer resumes' },
  { room: 'write', label: 'Show edit options', where: 'a card in Passage Focus', does: 'MAIA offers a revision of the passage for the writer to judge; nothing changes until the writer applies it' },
  { room: 'write', label: 'Discuss what’s happening', where: 'a card in Passage Focus', does: 'talk about the passage before changing anything' },
  { room: 'write', label: 'Teach me about the writing', where: 'a card in Passage Focus', does: 'one craft idea at a time, in the writer\'s own words' },
  { room: 'write', label: 'Go deeper', where: 'in Passage Focus, by asking for it in the box', does: 'fuller craft and editorial vocabulary, tied to the words on the page' },
  { room: 'write', label: 'Ask MAIA', where: 'the box at the bottom of Passage Focus, and the message box of the Work conversation in Develop', does: 'ask MAIA anything in the writer\'s own words' },
  { room: 'write', label: 'Speak', where: 'below the Ask MAIA box in Passage Focus', does: 'say the question aloud; the transcript stays until the writer chooses what to do with it' },
  { room: 'write', label: 'Show revision options', where: 'in the row that follows MAIA\'s reply in Passage Focus', does: 'asks MAIA for possible revisions of the passage' },
  { room: 'write', label: 'Teach me more', where: 'in the row that follows MAIA\'s reply in Passage Focus', does: 'continues the teaching from where the conversation is' },
  { room: 'write', label: 'Save my version', where: 'in Passage Focus (under More, or after Adjust) and Craftsman\'s Table, once the writer has worked on the wording', does: 'saves the writer\'s own working version without changing the manuscript' },
  { room: 'write', label: 'Apply my version', where: 'beside Save my version', does: 'puts the writer\'s version into the manuscript; only the writer can do this' },
  { room: 'write', label: 'Undo', where: 'after a version has been applied', does: 'restores the passage as it was before applying' },
  { room: 'write', label: 'Start a new conversation', where: 'under More ⋯ at the top of Passage Focus, and in the Work conversation in Develop (under More)', does: 'sets the earlier conversation aside (it stays saved) so the next question starts fresh', develop: ['new-conversation'] },
  { room: 'write', label: 'Back to the page', where: 'at the top of Passage Focus, and above the passage it pins', does: 'closes Passage Focus and goes back to the manuscript' },
  { room: 'write', label: 'Revision latitude', where: 'More ⋯ → Preferences, at the top of Passage Focus', does: 'how far any revision MAIA proposes may go, from the lightest touch to an open rewrite' },
  { room: 'write', label: 'Why this?', where: 'on a revision mark in the manuscript', does: 'MAIA explains why she suggested that change' },
  { room: 'write', label: 'Change it', where: 'on a revision mark in the manuscript', does: 'the writer reworks the suggested change themselves' },
  { room: 'write', label: 'Talk about this place', where: 'the MAIA panel on the right in Write, after clicking a section in the manuscript list', does: 'opens the Work conversation about that section; beside it, Develop this place and Review this place jump to those rooms' },
  { room: 'write', label: 'Talk about the whole book', where: 'the MAIA panel on the right in Write, when no section is picked', does: 'opens the Work conversation about the whole book' },
  { room: 'write', label: 'Begin relationship with MAIA', where: 'the MAIA panel, the first time on a Work', does: 'starts the MAIA relationship for this Work, which Studio conversations need' },
  { room: 'write', label: 'Leave relationship', where: 'the MAIA panel in Write, under Relationship with MAIA', does: 'ends the MAIA relationship for this Work; nothing is deleted' },

  /* ── Develop (the stage, its More panel, and the Work conversation beside it) ────────────── */
  { room: 'develop', label: 'Chapter', stageOnly: true, where: 'the dropdown beside the Work\'s title at the start of the Develop header line', develop: ['change-chapter'], does: 'moves Develop to another chapter; MAIA can also offer "Go to" a chapter she was given, which the writer clicks' },
  { room: 'develop', label: 'View', stageOnly: true, where: 'the right side of the Develop header line, above the chapter', develop: ['view', 'presentation'],
    does: `chooses ${VIEW_LABELS.join(', ')}. On the Develop stage today Quiet and Balanced look the same (they differ only on the older Develop map, where Balanced adds "Other ways to explore, if useful"); All tools opens More beside the chapter and hides the More button. The writer can also just ask MAIA in words ("show me fewer choices", "show me all the tools") and she offers the change` },
  { room: 'develop', label: 'Read this chapter with MAIA', stageOnly: true, where: 'the Develop header line, above the chapter', develop: ['read-chapter', 'reading-choices'], inSanctuary: false,
    does: 'MAIA reads the open chapter herself; while she reads, the line under the ways row says so, and her reading then appears beside the conversation with Go through what she noticed, Talk about one passage, Work toward a revision and Leave it for now. Nothing in the writing changes' },
  { room: 'develop', label: 'Edit in Write', stageOnly: true, where: 'the Develop header line, above the chapter', develop: ['open-in-write'], does: 'goes to Write to work on the text' },
  { room: 'develop', label: 'Ways to explore your Work', stageOnly: true, where: `the row of ways above the chapter: ${LENS_LABELS.join(', ')}`, develop: ['lenses'],
    does: 'opens that way of looking (a lens) beside the chapter, with ← Back to the reading to return; Themes opens its own room. MAIA cannot open a lens for the writer; they choose it from this row' },
  { room: 'develop', label: 'Whole book · editorial pass', stageOnly: true, where: 'at the end of the ways row in Develop (it reads "… ready" once finished)', develop: ['editorial-pass'], inSanctuary: false,
    does: 'MAIA reads the whole manuscript and brings the places where an edit may help, in order; nothing is applied' },
  { room: 'develop', label: 'More', stageOnly: true, where: 'the Develop header line (and More / Fewer options at the foot of the conversation)', develop: ['more'],
    does: 'opens the More panel in place of the chapter (Back to the chapter returns): planning, what she read for her last answer, starter questions, Your book, what she may read, and settled decisions. In the conversation, More shows Where are we?, Start a new conversation, Focus, kept passages and Open in MAIA' },
  { room: 'develop', label: 'Make a plan with MAIA', stageOnly: true, where: 'Develop → More', develop: ['make-plan', 'edit-plan', 'work-on-step', 'delete-plan'], inSanctuary: false,
    does: 'the writer says in their own words what they want a plan for and presses Make a plan; MAIA drafts steps. Each step can be marked To do, Working on it, Resolved or Set aside, removed, or opened with Go to the passage / Work on this passage; the whole plan can be deleted. A plan never changes the text' },
  { room: 'develop', label: 'What she read for that answer', stageOnly: true, where: 'Develop → More, after MAIA answers', develop: ['what-she-read'], does: 'the chapters MAIA read for her last answer, with Go there and Read it here' },
  { room: 'develop', label: 'More ways to explore', stageOnly: true, where: 'Develop → More, under the starter questions', develop: ['ways-in'],
    does: 'leaves the stage for the older, fuller Develop map. The starter questions above it fill the message box without sending' },
  { room: 'develop', label: 'Your book', stageOnly: true, where: 'Develop → More', develop: ['book-kind'], does: 'the writer says what kind of book this is: Fiction, Nonfiction or A helper’s book (Change to alter it). MAIA never guesses this' },
  { room: 'develop', label: 'What MAIA can read', stageOnly: true, where: 'Develop → More', develop: ['grant-reading', 'revoke-reading'], inSanctuary: false,
    does: 'shows and sets what MAIA may read: Only the passage I am in, or Let MAIA read my saved work; once granted, Stop takes it back at any time' },
  { room: 'develop', label: 'Let MAIA read my saved work', stageOnly: true, where: 'in Develop, behind More, under "What MAIA can read"', inSanctuary: false,
    does: 'lets MAIA read the saved text of the writer\'s chapters while they talk; the writer can press Stop at any time' },
  { room: 'develop', label: 'Stop', stageOnly: true, where: 'Develop → More → What MAIA can read, once reading is granted', inSanctuary: false, does: 'stops MAIA reading the writer\'s saved work; she goes back to only the passage they are in' },
  { room: 'develop', label: 'What you have settled', stageOnly: true, where: 'Develop → More', develop: ['note-settled', 'withdraw-settled'], inSanctuary: false,
    does: 'decisions the writer has settled, which MAIA will not reopen. Note something you have settled → Keep this records one in the writer\'s own words; Withdraw takes one back' },
  { room: 'develop', label: 'Ask MAIA about this', stageOnly: true, where: 'the strip under the chapter in Develop, after selecting words in the chapter', develop: ['ask-about-selection'], does: 'puts the selected words into the message box, unsent' },
  { room: 'develop', label: 'Which ones?', where: 'the coverage line at the top of the MAIA panel in Develop', does: 'lists which sections MAIA has read (Hide closes it)' },
  { room: 'develop', label: 'Where are we?', where: 'the Work conversation in Develop, under More', develop: ['reorient'], does: 'MAIA says where the conversation stands' },
  { room: 'develop', label: 'conversations about this Work', where: 'at the top of the Work conversation in Develop when there is more than one ("You have N conversations about this Work."), one button per earlier conversation showing its date and "n turns"', develop: ['resume-conversation'],
    does: 'this is where the writer\'s earlier conversations are: pressing one reopens it, or they can start a new one. "Turns" counts every message in that conversation, the writer\'s and MAIA\'s' },
  { room: 'develop', label: 'Correct MAIA', where: 'under MAIA\'s replies in the Work conversation', develop: ['correct-maia'], does: 'the writer corrects MAIA\'s understanding; Keep correction holds it' },
  { room: 'develop', label: 'where I am', where: 'the "About:" choice above the message box in the Work conversation (where I am / the whole book), and "Ask about the whole book?" when a question sounds like it', develop: ['whole-book-scope', 'send'],
    does: 'chooses whether the question is about where the writer is or about the whole book; every question stays about the whole book until they choose "where I am"' },
  { room: 'develop', label: 'Keeps', where: 'the Work conversation in Develop, under More', develop: ['keeps'], inSanctuary: false, does: 'puts a passage the writer kept into the message box' },
  { room: 'develop', label: 'Open in MAIA', where: 'the Work conversation in Develop, under More', develop: ['open-in-maia'], does: 'continues this conversation in MAIA outside the Studio' },
  { room: 'develop', label: 'Focus', where: 'the Work conversation in Develop, under More', develop: ['focus', 'close-conversation'], does: 'gives the conversation the room; Close focus and ✕ close it again' },
  { room: 'develop', label: 'Read this chapter', where: 'the older Develop map (Overview tab), reached through More ways to explore or All tools', inSanctuary: false,
    does: 'the same reading as Read this chapter with MAIA, from the older map' },
  { room: 'develop', label: 'Start an editorial pass', where: 'the older Develop map: More ways to explore → Edit with MAIA', inSanctuary: false,
    does: 'MAIA reads the whole manuscript and brings the places where an edit may help, in order; nothing is applied (the same pass the Develop stage offers)' },

  /* ── Review ─────────────────────────────────────────────────────────────────────────── */
  { room: 'review', label: 'Quick reread', where: 'Review, under After revision', inSanctuary: false, does: 'MAIA lightly rereads one chapter after the writer has revised it (Save current draft & quick reread saves first)' },
  { room: 'review', label: 'Run deep Review', where: 'Review, under Deep Review', inSanctuary: false, does: 'a full review of the Work through several lenses' },
  { room: 'review', label: 'Discuss with MAIA', where: 'on a finding in a Review', inSanctuary: false, does: 'talks about that one observation as MAIA originally read it; the conversation does not change the reading or the Work' },
  { room: 'review', label: 'Saved Reviews', where: 'Review', does: 'reopens reviews made earlier' },
  { room: 'review', label: 'Proof', where: 'the tab beside Review in the Review room', does: 'shows the writing as pages' },
  { room: 'review', label: 'Talk about the larger Work', where: 'Review, the MAIA panel on the right', does: 'a conversation about the Work as a whole from Review' },

  /* ── Publish ────────────────────────────────────────────────────────────────────────── */
  { room: 'publish', label: 'Beta preview', where: 'the heading of the Publish room', does: 'Publish prepares an edition: see the writing on a page (Interior), compose a cover direction, and read the preparation steps for Amazon KDP, Kindle, EPUB, print-ready PDF or Soullab Press' },

  /* ── Listen ─────────────────────────────────────────────────────────────────────────── */
  { room: 'listen', label: 'Private recording pilot', where: 'the Listen room (Author Voice Studio)', does: 'the writer can read a passage aloud and Record my voice, then Download WAV or Discard. Recordings stay in this browser session only' },
];

/** Things the Studio map marks as not built yet, generated from `STUDIO_MAP`, so MAIA says so instead of inventing them. */
const LIVE_UNDER_ANOTHER_NAME: Readonly<Record<string, string>> = {
  materials: 'What feeds this Work on Home',
  structure: 'the Structure way in Develop',
  notes: 'Notes & sources on Home',
  conversations: 'the earlier conversations list in Develop',
};
export function notYetInStudio(): string[] {
  return STUDIO_MAP.flatMap((g) => g.destinations)
    .filter((d) => d.availability === 'later' && !(d.id in LIVE_UNDER_ANOTHER_NAME))
    .map((d) => d.label);
}
export const liveUnderAnotherName = (): Readonly<Record<string, string>> => LIVE_UNDER_ANOTHER_NAME;

/**
 * Whole workflows, not just buttons. Every quoted name in `steps` must be a control label above (the guard test checks), so a
 * workflow can never send a writer to a control the guide does not have. `needs` leaves a workflow out where it does not apply.
 */
export type StudioWorkflow = {
  readonly name: string;
  readonly steps: string;
  readonly inSanctuary?: false;
  readonly stageOnly?: true;
};
export const STUDIO_WORKFLOWS: readonly StudioWorkflow[] = [
  { name: 'Begin with a manuscript', steps: 'On Home, "New Work" (name it now or later) or "Import writing" to bring an existing file; then "Return to this work" opens it in Write. A writer who already has Works picks one under Your Works, or with "Choose another Work" from the top bar.' },
  { name: 'Come back to where you were', steps: '"Return to this work" on Home opens the manuscript where the writer left off; in Develop, the list of "conversations about this Work" reopens an earlier conversation.' },
  { name: 'Work on a passage in Write', steps: 'In Write, press "Edit", select the words, then "Talk with MAIA". Say what you want in "Tell MAIA what you want", or choose "What’s happening here?" or "Teach me the craft". If MAIA offers wording, "Use this" or "Adjust" works through it; "Save my version" keeps the writer\'s own; "Apply my version" puts it in the manuscript, and "Undo" takes it back. Only the writer applies anything.' },
  { name: 'Develop a chapter', stageOnly: true, inSanctuary: false, steps: 'In Develop, pick the chapter from "Chapter", then "Read this chapter with MAIA". Her reading appears beside the conversation; go through what she noticed, talk about one passage, or work toward a revision. "Ways to explore your Work" opens a lens (Arc, Structure, Voice …) beside the chapter. "Edit in Write" takes the writer to the text.' },
  { name: 'An editorial pass over the whole book', stageOnly: true, inSanctuary: false, steps: '"Whole book · editorial pass" at the end of the ways row in Develop: MAIA reads the whole manuscript and brings the places where an edit may help, in order. Nothing is applied; the writer works each place in Write. Before starting one, it is worth asking what the writer wants from the book now: a pass is most useful once a full draft exists.' },
  { name: 'Plan a revision', stageOnly: true, inSanctuary: false, steps: 'Develop → "More" → "Make a plan with MAIA": the writer says what the plan is for; MAIA drafts steps the writer can mark, set aside or remove. A plan never changes the text.' },
  { name: 'Keep decisions', stageOnly: true, inSanctuary: false, steps: 'Develop → "More" → "What you have settled": the writer notes, in their own words, what is decided, so MAIA does not reopen it; it can be withdrawn later.' },
  { name: 'Know what MAIA has read', stageOnly: true, inSanctuary: false, steps: '"Which ones?" on the coverage line shows the sections she has read; "What she read for that answer" shows what lay behind her last answer; "What MAIA can read" shows and changes her permission, and "Stop" takes it back.' },
  { name: 'Review and discuss', inSanctuary: false, steps: 'In Review, "Quick reread" after revising a chapter, or "Run deep Review" for the whole Work; reopen earlier ones from "Saved Reviews"; "Discuss with MAIA" on a finding talks about that one observation; "Talk about the larger Work" opens a wider conversation.' },
  { name: 'Prepare to publish', steps: 'Publish ("Beta preview"): see the writing laid out on a page, compose a cover direction, and follow the preparation steps for the chosen path. "Proof" in Review also shows the writing as pages.' },
  { name: 'Choose privacy', inSanctuary: false, stageOnly: true, steps: 'When the Studio asks, "Ordinary" holds the session normally and "Sanctuary" means it is never saved. Outside Sanctuary, "What MAIA can read" in Develop\'s More panel is where the writer lets MAIA read saved work or stops her.' },
];

const ROOM_TITLE: Record<StudioRoom, string> = {
  everywhere: 'EVERYWHERE (top bar and floating buttons)', home: 'HOME', write: 'WRITE (and Passage Focus)',
  develop: 'DEVELOP (the stage, its More panel, and the Work conversation)', review: 'REVIEW', publish: 'PUBLISH', listen: 'LISTEN',
};

/** How MAIA guides: inside the work, in conversation, with the writer in charge — and in front of a group. */
export const GUIDE_STANCE = [
  'HOW YOU GUIDE',
  '- Answer the question asked, in a sentence or two, naming the control and where it is; offer the next step only if it helps. You are a guide inside their work, not a manual.',
  '- Keep the thread: a follow-up ("what will it do to my book?", "do I need one?") is about the thing you were just discussing. When they are deciding whether to use a tool, ask what they want from the book now, say plainly what it does and does not do, and leave the choice with them.',
  '- Explaining a tool is never using it. Do not start a reading, a pass, a plan or a change because someone asked how it works. They press the control themselves.',
  '- When showing the Studio to a person or a group (a training, a review, a demonstration), walk one workflow at a time, pausing for questions. Use a made-up example passage, never anyone\'s manuscript, unless the writer in this conversation brings their own words. Do not assume you can see anyone else\'s work, and do not describe one writer\'s work to another.',
  '- Some controls appear only under a condition given beside them (for example beta writers only). If a writer cannot see a control you named, say what the condition is rather than insisting it is there. Administrative pages are not part of the Studio.',
].join('\n');

function runtimeSays(rt: StudioRuntime, sanctuary: boolean): string[] {
  return [
    'WHAT IS SWITCHED ON IN THIS STUDIO (read from the running Studio; describe only this)',
    rt.developStage
      ? '- The Develop stage is on: Develop opens on the chapter with the header line, the ways row and More.'
      : `- The Develop stage is NOT on here: Develop shows its older map${sanctuary ? '' : ' (tabs, "Read this chapter", and Edit with MAIA → "Start an editorial pass")'}. Develop-stage controls are left out of this list; if asked about one, say it is not switched on in this Studio.`,
    rt.autoRead
      ? '- Automatic reading is on: where the writer has let MAIA read their saved work (and not in Sanctuary), she may read a chapter they open by herself.'
      : '- Automatic reading is off: MAIA reads a chapter only when the writer asks for a reading.',
    rt.proGate
      ? '- The Free / Pro separation is on: for a writer without Pro, the whole-book editorial pass is held, and the Studio says so ("part of Writer’s Studio Pro"); nothing in the manuscript changes. There is still no plan switch on screen.'
      : '- The Free / Pro separation is off: nothing in the Studio is held for Pro, and there is no plan switch on screen.',
    rt.exportsCertified
      ? '- Publish exports are certified: the writer can download the prepared files.'
      : '- Publish is a preview: file downloads are awaiting final verification, so do not promise a finished file.',
  ];
}

/** What MAIA is told about the Studio she is speaking in. In Sanctuary, every tool that reads, keeps or plans is left out. */
export function studioGuideInstruction(opts: { sanctuary?: boolean; runtime?: StudioRuntime } = {}): string {
  const sanctuary = opts.sanctuary === true;
  const rt = opts.runtime ?? studioRuntime();
  const keep = (x: { inSanctuary?: false; stageOnly?: true }) => (!sanctuary || x.inSanctuary !== false) && (rt.developStage || !x.stageOnly);
  const controls = STUDIO_CONTROLS.filter(keep);
  const workflows = STUDIO_WORKFLOWS.filter(keep);
  const rooms = PRIMARY_MODES.map((m) => m.label).join(', ');
  const sections = (Object.keys(ROOM_TITLE) as StudioRoom[]).flatMap((room) => {
    const inRoom = controls.filter((c) => c.room === room);
    return inRoom.length === 0 ? [] : [ROOM_TITLE[room], ...inRoom.map((c) => `- "${c.label}" (${c.where}): ${c.does}.`)];
  });
  const pointToReading = !sanctuary && rt.developStage
    ? ' In particular, when reading more of the manuscript would help, point them to "Read this chapter with MAIA" or "Whole book · editorial pass" rather than asking them to paste text that is already in the Studio. But never send them to read a chapter you already have a reading of: say what that reading found, and if the text itself would help, point them to "Let MAIA read my saved work".'
    : !sanctuary ? ' In particular, when reading more of the manuscript would help, point them to the Studio\'s own reading rather than asking them to paste text that is already in the Studio.' : '';
  return [
    'THE STUDIO YOU ARE IN',
    `The writer is working in the Writer's Studio. Its rooms are ${rooms}, switched from the tabs in the top bar. When the writer asks how to do something here, where something is, or what a control does, or when a Studio tool would serve them better than a workaround, name the real control and say where it is, using the list below.${pointToReading}`,
    'Only name controls from this list. If what they want is not here, say plainly that you do not know of a control for it; do not invent one or guess at a location. You cannot press any control for them; they choose and do it themselves.',
    `Not in the Studio yet (say so plainly if asked; never describe these as available): ${notYetInStudio().join(', ')}.`,
    ...(sanctuary ? ['This is a Sanctuary session: nothing is kept. Tools that read, keep or plan from the writer\'s work are left out of this list on purpose. If the writer asks about one, say it is not offered in a Sanctuary session; do not explain how to use it here.'] : []),
    '',
    GUIDE_STANCE,
    '',
    ...runtimeSays(rt, sanctuary),
    '',
    'WORKFLOWS',
    ...workflows.map((w) => `- ${w.name}: ${w.steps}`),
    '',
    'CONTROLS, BY ROOM',
    ...sections,
  ].join('\n');
}
